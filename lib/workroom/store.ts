import "server-only";

/**
 * Workroom storage: the leads queue and the site's editable facts.
 *
 * Ported from devine's `lib/workroom/store.ts` (itself from pjs). The
 * two-backend shape, the jsonb-blob decision, the self-creating tables and the
 * do-not-cache-a-failed-init rule are all inherited.
 *
 * IT USED TO CARRY A GENERIC COLLECTION as well, one jsonb row per record with
 * equality lookups, for the book's customers, policies and payments. That went
 * with the payment service on 17 September 2026 (README, "Payments,
 * archived"). Restoring it is a cherry-pick from the archive branch, not a
 * rewrite, which is why the shape is described here rather than guessed at
 * later.
 *
 *   postgres   when a database URL is set. One click in Vercel: project >
 *              Storage > Create Database > Neon, free tier, part of the
 *              hosting the client already has, so it does not break the
 *              "nothing rented" rule in glaze.md. Tables create themselves on
 *              first use.
 *
 *   memory     fallback so local dev and the build need nothing. On deployed
 *              serverless this only holds within one warm lambda, so the
 *              queue can MISS leads that landed on another instance. Every
 *              workroom screen shows a plain warning when it is on memory,
 *              because a queue that half-works silently is worse than one
 *              that says what is wrong. THE QUOTE HANDLER STILL LOGS THE FULL
 *              PAYLOAD EITHER WAY, so a lead is never lost to a missing
 *              database, only harder to find.
 *
 * WHAT IS STORED, named because /privacy has to keep agreeing with this file:
 * quote requests (name, phone, email, ZIP, maybe an address and current
 * carrier), and the facts the agency edits about itself. Nothing else. No
 * card numbers, no policy numbers, no customer list, no dates of birth, no
 * licence numbers, no policy documents. If a row type is ever added here,
 * /privacy changes in the same commit.
 */

import type { Lead, LeadStatus } from "./leads";

export type { Lead, LeadStatus };

export type Store = {
  backend: "postgres" | "memory";
  createLead(lead: Lead): Promise<void>;
  listLeads(limit?: number): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | null>;
  updateLead(id: string, patch: { status?: LeadStatus; workNotes?: string }): Promise<Lead | null>;
  /** One named jsonb value. Null when nothing has been saved under the key. */
  getValue<T>(key: string): Promise<T | null>;
  setValue(key: string, value: unknown): Promise<void>;
};

export function newId(prefix: string): string {
  // Time-ordered prefix so ids sort roughly by age even before a query does.
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/* ------------------------------ memory ------------------------------ */

type Bag = { leads: Map<string, Lead>; content: Map<string, unknown> };

function bag(): Bag {
  const g = globalThis as typeof globalThis & { __anchorWorkroomBag?: Bag };
  if (!g.__anchorWorkroomBag) g.__anchorWorkroomBag = { leads: new Map(), content: new Map() };
  // The bag predates the content map; a warm instance from before still gets
  // one rather than a TypeError on the first save.
  if (!g.__anchorWorkroomBag.content) g.__anchorWorkroomBag.content = new Map();
  return g.__anchorWorkroomBag;
}

const memoryStore: Store = {
  backend: "memory",
  async createLead(lead) {
    bag().leads.set(lead.id, lead);
  },
  async listLeads(limit = 500) {
    return [...bag().leads.values()].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
  },
  async getLead(id) {
    return bag().leads.get(id) ?? null;
  },
  async updateLead(id, patch) {
    const existing = bag().leads.get(id);
    if (!existing) return null;
    const next: Lead = { ...existing, ...patch, updatedAt: Date.now() };
    bag().leads.set(id, next);
    return next;
  },
  async getValue(key) {
    return (bag().content.get(key) as never) ?? null;
  },
  async setValue(key, value) {
    bag().content.set(key, value);
  },
};

/* ----------------------------- postgres ----------------------------- */

/**
 * The env var actually holding the database URL, by name. Scooplist's
 * connectionVar, through kidniche: the Vercel/Neon integration injects
 * PREFIXED names in real situations (observed: DATABASE_CASCARELLIS_DATABASE_URL,
 * with no dashboard path to rename it), and asking an operator to hand-copy a
 * secret between rows of the env screen cost a full evening. The exact-suffix
 * match keeps the sibling variants out (..._URL_UNPOOLED, ..._PRISMA_URL,
 * ..._URL_NO_SSL all end differently); keys are sorted so two candidates
 * resolve the same way on every boot.
 */
export function connectionVar(): string | null {
  const env = process.env;
  if (env.DATABASE_URL) return "DATABASE_URL";
  if (env.POSTGRES_URL) return "POSTGRES_URL";
  const keys = Object.keys(env).sort();
  return (
    keys.find((k) => k.endsWith("_DATABASE_URL") && env[k]) ??
    keys.find((k) => k.endsWith("_POSTGRES_URL") && env[k]) ??
    null
  );
}

function connectionString(): string | undefined {
  const name = connectionVar();
  return name ? process.env[name] : undefined;
}

type PgPool = {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;
};

/** Every jsonb table the store owns. Adding one here is the whole migration. */
// agreement_acceptances existed here for eight days (2026-09-02 to 09-10) while
// the agreement lived in this repo; it moved to glazedweb.com/agreement/anchor
// with the other custom orders. The empty table in Neon is harmless.
const JSON_TABLES = ["workroom_content"] as const;

async function pgPool(): Promise<PgPool> {
  const g = globalThis as typeof globalThis & {
    __anchorPgPool?: PgPool;
    __anchorPgReady?: Promise<unknown>;
  };
  if (!g.__anchorPgPool) {
    // Dynamic import so the dependency never loads unless a database is
    // actually configured (pjs pattern, unchanged through devine).
    const { Pool } = await import("pg");
    const cs = connectionString();
    const local = /localhost|127\.0\.0\.1|\[::1\]/.test(cs ?? "") || cs?.includes("sslmode=disable");
    g.__anchorPgPool = new Pool({
      connectionString: cs,
      // Neon and friends require TLS; local postgres usually has none.
      ssl: local ? undefined : { rejectUnauthorized: false },
      max: 3,
    }) as unknown as PgPool;
    /*
      THE INIT TAKES A LOCK, because the customer pages read the facts at
      BUILD time and Next prerenders with several workers at once. The first
      deploy of the facts editor failed exactly here: two workers ran CREATE
      TABLE IF NOT EXISTS in the same instant on a database that had no
      tables yet, and Postgres's IF NOT EXISTS is not atomic against a
      concurrent creator, so the loser died on the pg_type unique index (code
      23505, "workroom_leads already exists") and took the build with it. A
      multi-statement simple query runs in one implicit transaction, so the
      advisory lock below is held until the CREATEs commit and every other
      worker or lambda waits its turn. The catch keeps the belt with the
      braces: a duplicate-object error from a racer that slipped past the
      lock still means "the table is there", which is the outcome we wanted.

      A FAILED SCHEMA INIT MUST NOT BE CACHED (devine's header records the
      cost: one unlucky cold start left a warm instance permanently broken).
      On any other failure the pool and the promise are dropped so the next
      request retries.
    */
    const creates = JSON_TABLES.map((t) => `CREATE TABLE IF NOT EXISTS ${t} (key text PRIMARY KEY, data jsonb NOT NULL);`).join("\n");
    g.__anchorPgReady = g.__anchorPgPool
      .query(
        `SELECT pg_advisory_xact_lock(4213701);
         CREATE TABLE IF NOT EXISTS workroom_leads (
           id text PRIMARY KEY,
           status text NOT NULL,
           created_at bigint NOT NULL,
           data jsonb NOT NULL
         );
         ${creates}`
      )
      .catch((err: unknown) => {
        const code = (err as { code?: string } | null)?.code;
        // 23505 unique_violation on pg_type, 42P07 duplicate_table: both
        // mean another creator won, and the tables exist.
        if (code === "23505" || code === "42P07") return;
        g.__anchorPgPool = undefined;
        g.__anchorPgReady = undefined;
        throw err;
      });
  }
  await g.__anchorPgReady;
  return g.__anchorPgPool!;
}

const postgresStore: Store = {
  backend: "postgres",
  async createLead(lead) {
    const pool = await pgPool();
    await pool.query(
      `INSERT INTO workroom_leads (id, status, created_at, data) VALUES ($1, $2, $3, $4)`,
      [lead.id, lead.status, lead.createdAt, JSON.stringify(lead)]
    );
  },
  async listLeads(limit = 500) {
    const pool = await pgPool();
    const { rows } = await pool.query(
      `SELECT data FROM workroom_leads ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    return rows.map((r) => r.data as Lead);
  },
  async getLead(id) {
    const pool = await pgPool();
    const { rows } = await pool.query(`SELECT data FROM workroom_leads WHERE id = $1`, [id]);
    return rows.length ? (rows[0].data as Lead) : null;
  },
  async updateLead(id, patch) {
    const pool = await pgPool();
    const { rows } = await pool.query(`SELECT data FROM workroom_leads WHERE id = $1`, [id]);
    if (!rows.length) return null;
    const next: Lead = { ...(rows[0].data as Lead), ...patch, updatedAt: Date.now() };
    await pool.query(`UPDATE workroom_leads SET status = $2, data = $3 WHERE id = $1`, [
      id,
      next.status,
      JSON.stringify(next),
    ]);
    return next;
  },
  async getValue(key) {
    const pool = await pgPool();
    const { rows } = await pool.query(`SELECT data FROM workroom_content WHERE key = $1`, [key]);
    return rows.length ? (rows[0].data as never) : null;
  },
  async setValue(key, value) {
    const pool = await pgPool();
    await pool.query(
      `INSERT INTO workroom_content (key, data) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET data = $2`,
      [key, JSON.stringify(value)]
    );
  },
};

export function getStore(): Store {
  return connectionString() ? postgresStore : memoryStore;
}

import "server-only";

/**
 * Workroom storage: leads, and the site's editable facts.
 *
 * Ported from devine's `lib/workroom/store.ts` (itself from pjs). The
 * two-backend shape, the jsonb-blob decision, the self-creating tables and the
 * do-not-cache-a-failed-init rule are all inherited; the domain is different
 * and much smaller, because this workroom keeps TWO kinds of row: a lead, and
 * one key -> jsonb value for content the workroom edits (today, the facts).
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
 * THIS IS THE FIRST STORED DATA IN THIS REPO, and it is worth naming what it
 * is: quote requests, which carry a name, phone, email, ZIP and possibly an
 * address and current carrier. Not policy data, not card data, not a date of
 * birth or a licence number, because the quote form deliberately does not ask
 * for those (see /privacy, which says so and has to keep agreeing with this
 * file). One jsonb column keyed by id; nothing queries inside the blob.
 *
 * The content table holds only what the site already publishes (her phone,
 * her hours), keyed by name, whitelisted in lib/workroom/facts-def.ts.
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
  // The bag predates the content map; a warm instance from before it still
  // gets one rather than a TypeError on the first save.
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
      A FAILED SCHEMA INIT MUST NOT BE CACHED. Devine's header records the
      cost: storing this promise and never clearing it meant one unlucky cold
      start (Neon still waking, a blip) left that warm instance permanently
      broken, awaiting the same rejected promise long after the database
      recovered. On failure the pool and the promise are dropped so the next
      request retries.
    */
    g.__anchorPgReady = g.__anchorPgPool
      .query(
        `CREATE TABLE IF NOT EXISTS workroom_leads (
           id text PRIMARY KEY,
           status text NOT NULL,
           created_at bigint NOT NULL,
           data jsonb NOT NULL
         );
         CREATE TABLE IF NOT EXISTS workroom_content (
           key text PRIMARY KEY,
           data jsonb NOT NULL
         );`
      )
      .catch((err: unknown) => {
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

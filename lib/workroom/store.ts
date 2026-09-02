import "server-only";

/**
 * Workroom storage: leads, the book (customers, policies, payments), and the
 * site's editable facts.
 *
 * Ported from devine's `lib/workroom/store.ts` (itself from pjs). The
 * two-backend shape, the jsonb-blob decision, the self-creating tables and the
 * do-not-cache-a-failed-init rule are all inherited. What grew here is a
 * GENERIC COLLECTION: one jsonb row per record, keyed by id, with equality
 * lookups on top-level string fields. The book needed three of them and
 * writing three copies of get/put/list was the wrong kind of tidy.
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
 * carrier); the book (customer name, phone, email, ZIP; policy carrier,
 * number, installment amount and due date; a record of each payment made
 * through the site, by Stripe's id and amount). NO card numbers, ever: the
 * card is typed on Stripe's page and never reaches this server. No dates of
 * birth, no licence numbers, no policy documents.
 */

import type { Lead, LeadStatus } from "./leads";
import type { Customer, Policy, Payment } from "./book";

export type { Lead, LeadStatus };

type Row = { id: string; createdAt: number };

export type Collection<T extends Row> = {
  get(id: string): Promise<T | null>;
  /** Insert or replace. */
  put(row: T): Promise<void>;
  remove(id: string): Promise<void>;
  /** Newest first. `where` is equality on top-level string fields. */
  list(where?: Partial<Record<keyof T & string, string>>, limit?: number): Promise<T[]>;
};

export type Store = {
  backend: "postgres" | "memory";
  createLead(lead: Lead): Promise<void>;
  listLeads(limit?: number): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | null>;
  updateLead(id: string, patch: { status?: LeadStatus; workNotes?: string }): Promise<Lead | null>;
  customers: Collection<Customer>;
  policies: Collection<Policy>;
  payments: Collection<Payment>;
  /** One named jsonb value. Null when nothing has been saved under the key. */
  getValue<T>(key: string): Promise<T | null>;
  setValue(key: string, value: unknown): Promise<void>;
};

export function newId(prefix: string): string {
  // Time-ordered prefix so ids sort roughly by age even before a query does.
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/* ------------------------------ memory ------------------------------ */

type Bag = {
  leads: Map<string, Lead>;
  content: Map<string, unknown>;
  tables: Map<string, Map<string, Row>>;
};

function bag(): Bag {
  const g = globalThis as typeof globalThis & { __anchorWorkroomBag?: Bag };
  if (!g.__anchorWorkroomBag) g.__anchorWorkroomBag = { leads: new Map(), content: new Map(), tables: new Map() };
  // The bag predates the later maps; a warm instance from before still gets
  // them rather than a TypeError on the first save.
  if (!g.__anchorWorkroomBag.content) g.__anchorWorkroomBag.content = new Map();
  if (!g.__anchorWorkroomBag.tables) g.__anchorWorkroomBag.tables = new Map();
  return g.__anchorWorkroomBag;
}

function memoryCollection<T extends Row>(table: string): Collection<T> {
  const rows = () => {
    const t = bag().tables;
    if (!t.has(table)) t.set(table, new Map());
    return t.get(table)! as Map<string, T>;
  };
  return {
    async get(id) {
      return rows().get(id) ?? null;
    },
    async put(row) {
      rows().set(row.id, row);
    },
    async remove(id) {
      rows().delete(id);
    },
    async list(where, limit = 1000) {
      return [...rows().values()]
        .filter((r) => !where || Object.entries(where).every(([k, v]) => (r as Record<string, unknown>)[k] === v))
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
    },
  };
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
  customers: memoryCollection<Customer>("workroom_customers"),
  policies: memoryCollection<Policy>("workroom_policies"),
  payments: memoryCollection<Payment>("workroom_payments"),
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
const JSON_TABLES = ["workroom_content", "workroom_customers", "workroom_policies", "workroom_payments"] as const;

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

function pgCollection<T extends Row>(table: (typeof JSON_TABLES)[number]): Collection<T> {
  return {
    async get(id) {
      const pool = await pgPool();
      const { rows } = await pool.query(`SELECT data FROM ${table} WHERE key = $1`, [id]);
      return rows.length ? (rows[0].data as T) : null;
    },
    async put(row) {
      const pool = await pgPool();
      await pool.query(
        `INSERT INTO ${table} (key, data) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET data = $2`,
        [row.id, JSON.stringify(row)]
      );
    },
    async remove(id) {
      const pool = await pgPool();
      await pool.query(`DELETE FROM ${table} WHERE key = $1`, [id]);
    },
    async list(where, limit = 1000) {
      const pool = await pgPool();
      const params: unknown[] = [];
      const clauses: string[] = [];
      for (const [k, v] of Object.entries(where ?? {})) {
        // Field names come from code, never from a request; values are bound.
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k)) throw new Error(`bad field ${k}`);
        params.push(v);
        clauses.push(`data->>'${k}' = $${params.length}`);
      }
      params.push(limit);
      const { rows } = await pool.query(
        `SELECT data FROM ${table}${clauses.length ? " WHERE " + clauses.join(" AND ") : ""}
         ORDER BY (data->>'createdAt')::bigint DESC NULLS LAST LIMIT $${params.length}`,
        params
      );
      return rows.map((r) => r.data as T);
    },
  };
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
  customers: pgCollection<Customer>("workroom_customers"),
  policies: pgCollection<Policy>("workroom_policies"),
  payments: pgCollection<Payment>("workroom_payments"),
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

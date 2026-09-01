import "server-only";

/**
 * Workroom storage: leads.
 *
 * Ported from devine's `lib/workroom/store.ts` (itself from pjs). The
 * two-backend shape, the jsonb-blob decision, the self-creating tables and the
 * do-not-cache-a-failed-init rule are all inherited; the domain is different
 * and much smaller, because this workroom keeps ONE kind of row.
 *
 *   postgres   when DATABASE_URL (or POSTGRES_URL) is set. One click in
 *              Vercel: project > Storage > Create Database > Neon, free tier,
 *              part of the hosting the client already has, so it does not
 *              break the "nothing rented" rule in glaze.md. Tables create
 *              themselves on first use.
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
 */

import type { Lead, LeadStatus } from "./leads";

export type { Lead, LeadStatus };

export type Store = {
  backend: "postgres" | "memory";
  createLead(lead: Lead): Promise<void>;
  listLeads(limit?: number): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | null>;
  updateLead(id: string, patch: { status?: LeadStatus; workNotes?: string }): Promise<Lead | null>;
};

export function newId(prefix: string): string {
  // Time-ordered prefix so ids sort roughly by age even before a query does.
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/* ------------------------------ memory ------------------------------ */

type Bag = { leads: Map<string, Lead> };

function bag(): Bag {
  const g = globalThis as typeof globalThis & { __anchorWorkroomBag?: Bag };
  if (!g.__anchorWorkroomBag) g.__anchorWorkroomBag = { leads: new Map() };
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
};

/* ----------------------------- postgres ----------------------------- */

function connectionString(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL;
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
    g.__anchorPgPool = new Pool({
      connectionString: cs,
      // Neon and friends require TLS; local postgres usually has none.
      ssl: cs?.includes("localhost") ? undefined : { rejectUnauthorized: false },
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
};

export function getStore(): Store {
  return connectionString() ? postgresStore : memoryStore;
}

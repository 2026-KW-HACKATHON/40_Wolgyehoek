import "server-only";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";
import { DDL } from "./ddl";
import { seed } from "./seed";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

const g = globalThis as unknown as { __dnDb?: Promise<Db> };

async function create(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  let db: Db;
  if (url) {
    const { default: postgres } = await import("postgres");
    db = drizzlePg(postgres(url, { prepare: false, max: 5 }), { schema }) as unknown as Db;
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const dir = process.env.PGLITE_DIR ?? "./.data/pglite";
    db = drizzlePglite(new PGlite(dir), { schema }) as unknown as Db;
  }
  for (const stmt of DDL.split(";").map((s) => s.trim()).filter(Boolean)) {
    await db.execute(sql.raw(stmt));
  }
  await seed(db);
  return db;
}

export function getDb(): Promise<Db> {
  if (!g.__dnDb) {
    g.__dnDb = create().catch((e) => {
      g.__dnDb = undefined;
      throw e;
    });
  }
  return g.__dnDb;
}

export { schema };

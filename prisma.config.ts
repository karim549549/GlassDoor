import { config } from "dotenv";
config();

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/schema/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations need a direct (non-pooled) connection - PgBouncer's
    // transaction-mode pooling (DATABASE_URL, used by the running app) can't
    // hold the advisory locks Prisma's migration engine needs. This only
    // affects the Prisma CLI (migrate/db push/studio); the app itself
    // connects independently via lib/server/prisma.ts using DATABASE_URL.
    url: (() => {
      if (!process.env.DIRECT_URL) {
        throw new Error("DIRECT_URL is not set. Configure it in your environment before running Prisma commands.");
      }
      return process.env.DIRECT_URL;
    })(),
  },
});

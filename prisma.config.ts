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
    url: (() => {
      if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not set. Configure it in your environment before running Prisma commands.");
      }
      return process.env.DATABASE_URL;
    })(),
  },
});

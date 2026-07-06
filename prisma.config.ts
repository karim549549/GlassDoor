import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/schema/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:placeholder@localhost:5432/postgres",
  },
});

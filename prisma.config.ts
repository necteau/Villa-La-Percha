import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:
      process.env.DIRECT_DATABASE_URL ||
      process.env.DATABASE_URL ||
      "postgresql://USER:PASSWORD@HOST:5432/directstay?schema=public",
  },
});

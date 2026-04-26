let prismaSingleton: unknown;
let poolSingleton: unknown;

export async function getPrismaClient() {
  if (prismaSingleton) return prismaSingleton as import("@prisma/client").PrismaClient;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("USER:PASSWORD@HOST")) {
    throw new Error("DATABASE_URL is not configured for Prisma");
  }

  const [{ PrismaClient }, { Pool }, { PrismaPg }] = await Promise.all([
    import("@prisma/client"),
    import("pg"),
    import("@prisma/adapter-pg"),
  ]);

  const pool = (poolSingleton ||= new Pool({ connectionString }));
  const adapter = new PrismaPg(pool as InstanceType<typeof Pool>);
  prismaSingleton = new PrismaClient({ adapter });
  return prismaSingleton as import("@prisma/client").PrismaClient;
}

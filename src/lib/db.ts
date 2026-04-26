let prismaSingleton: unknown;

export async function getPrismaClient() {
  if (prismaSingleton) return prismaSingleton as import("@prisma/client").PrismaClient;

  const { PrismaClient } = await import("@prisma/client");
  prismaSingleton = new PrismaClient();
  return prismaSingleton as import("@prisma/client").PrismaClient;
}

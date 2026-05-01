import { redirect } from "next/navigation";
import { getPrismaClient } from "@/lib/db";
import { getOwnerSessionUser } from "@/lib/ownerAuth";

export type AdminSession = {
  id: string;
  email: string;
  fullName: string | null;
  role: "ADMIN";
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const sessionUser = await getOwnerSessionUser();
  const email = sessionUser?.email?.trim().toLowerCase();
  if (!email) return null;

  const prisma = await getPrismaClient();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, fullName: true, role: true },
  });

  if (user?.role !== "ADMIN") return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: "ADMIN",
  };
}

export async function requireAdminSession(): Promise<AdminSession> {
  const admin = await getAdminSession();
  if (!admin) redirect("/owner-portal/login?next=/admin");
  return admin;
}

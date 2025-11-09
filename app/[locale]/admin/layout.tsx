import { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

interface AdminLayoutProps {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { locale } = await params;

  // Check if user is admin
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect(`/${locale}`);
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}

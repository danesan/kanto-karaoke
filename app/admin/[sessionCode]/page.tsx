import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

type Props = { params: Promise<{ sessionCode: string }> };

export default async function AdminPage({ params }: Props) {
  const { sessionCode } = await params;
  const code = sessionCode.toUpperCase();

  if (!(await isAdminAuthenticated(code))) {
    redirect(`/admin/${code}/login`);
  }

  return <AdminDashboard sessionCode={code} />;
}

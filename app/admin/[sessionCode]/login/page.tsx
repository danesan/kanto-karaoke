import { AdminLoginForm } from "@/components/admin/admin-login-form";

type Props = { params: Promise<{ sessionCode: string }> };

export default async function AdminLoginPage({ params }: Props) {
  const { sessionCode } = await params;
  return <AdminLoginForm sessionCode={sessionCode.toUpperCase()} />;
}

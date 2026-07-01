import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { CacheManager } from "@/components/admin/cache-manager";

type Props = { params: Promise<{ sessionCode: string }> };

export default async function AdminCachePage({ params }: Props) {
  const { sessionCode } = await params;
  const code = sessionCode.toUpperCase();

  if (!(await isAdminAuthenticated(code))) {
    redirect(`/admin/${code}/login`);
  }

  return <CacheManager sessionCode={code} />;
}

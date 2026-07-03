import { redirect } from "next/navigation";
import { PlaylistManager } from "@/components/admin/playlist-manager";
import { isAdminAuthenticated } from "@/lib/admin-auth";

type Props = { params: Promise<{ sessionCode: string }> };

export default async function AdminPlaylistsPage({ params }: Props) {
  const { sessionCode } = await params;
  const code = sessionCode.toUpperCase();

  if (!(await isAdminAuthenticated(code))) {
    redirect(`/admin/${code}/login`);
  }

  return <PlaylistManager sessionCode={code} />;
}

import { GuestScreen } from "@/components/guest/guest-screen";

type PageProps = {
  params: Promise<{
    sessionCode: string;
  }>;
};

export default async function GuestPage({ params }: PageProps) {
  const { sessionCode } = await params;
  return <GuestScreen sessionCode={sessionCode.toUpperCase()} />;
}
import { JoinSessionForm } from "@/components/guest/join-session-form";

type PageProps = {
  params: Promise<{
    sessionCode: string;
  }>;
};

export default async function JoinPage({ params }: PageProps) {
  const { sessionCode } = await params;
  return <JoinSessionForm sessionCode={sessionCode.toUpperCase()} />;
}
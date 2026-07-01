import { ControlScreen } from "@/components/queue/control-screen";

type PageProps = {
  params: Promise<{
    sessionId: string;
  }>;
};

export default async function ControlPage({ params }: PageProps) {
  const { sessionId } = await params;
  return <ControlScreen sessionId={sessionId} />;
}
import { PlayerScreen } from "@/components/player/player-screen";

type PageProps = {
  params: Promise<{
    sessionId: string;
  }>;
};

export default async function PlayerPage({ params }: PageProps) {
  const { sessionId } = await params;
  return <PlayerScreen sessionId={sessionId} />;
}
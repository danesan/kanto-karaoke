import { CodePlayerScreen } from "@/components/player/code-player-screen";

type PageProps = {
  params: Promise<{
    sessionCode: string;
  }>;
};

export default async function PublicPlayerPage({ params }: PageProps) {
  const { sessionCode } = await params;
  return <CodePlayerScreen sessionCode={sessionCode.toUpperCase()} />;
}
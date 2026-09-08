import { OpenSessionDetailsPage } from '@/features/open-sessions';
export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) { const { sessionId } = await params; return <OpenSessionDetailsPage id={sessionId} />; }

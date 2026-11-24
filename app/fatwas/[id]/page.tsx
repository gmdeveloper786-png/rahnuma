import KnowledgeDetailView from '@/components/KnowledgeDetailView';
import { SEED_STORE } from '@/lib/seed-data';

export function generateStaticParams() {
  return SEED_STORE.fatwas.map((fatwa) => ({ id: fatwa.id }));
}

export default async function FatwaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <KnowledgeDetailView mode="fatwa" itemKey={id} />;
}

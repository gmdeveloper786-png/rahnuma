import KnowledgeDetailView from '@/components/KnowledgeDetailView';
import { SEED_STORE } from '@/lib/seed-data';

export function generateStaticParams() {
  return SEED_STORE.articles.map((article) => ({ slug: article.slug }));
}

export default async function KnowledgeArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <KnowledgeDetailView mode="article" itemKey={slug} />;
}

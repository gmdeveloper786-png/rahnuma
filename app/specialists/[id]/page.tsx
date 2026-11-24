import SpecialistsView from '@/components/SpecialistsView';
import { SEED_STORE } from '@/lib/seed-data';

export function generateStaticParams() {
  return SEED_STORE.specialists.map((spec) => ({ id: spec.id }));
}

export default function SpecialistDetailPage() {
  return <SpecialistsView />;
}

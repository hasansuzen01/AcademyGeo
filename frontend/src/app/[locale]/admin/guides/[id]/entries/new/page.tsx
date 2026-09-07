import { GuideEntryEditor } from '@/components/admin/guide-entry-editor';

export default async function NewGuideEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <GuideEntryEditor topicId={id} />;
}

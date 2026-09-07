import { GuideEntryEditor } from '@/components/admin/guide-entry-editor';

export default async function EditGuideEntryPage({
  params,
}: {
  params: Promise<{ id: string; entryId: string }>;
}) {
  const { id, entryId } = await params;

  return <GuideEntryEditor topicId={id} entryId={entryId} />;
}

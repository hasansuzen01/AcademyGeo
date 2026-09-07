import { GuideTopicEditor } from '@/components/admin/guide-topic-editor';

export default async function EditGuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <GuideTopicEditor topicId={id} />;
}

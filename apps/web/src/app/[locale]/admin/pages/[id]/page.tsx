import { PageEditor } from '@/components/admin/page-editor';

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <PageEditor pageId={id} />;
}

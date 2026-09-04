import { MetaEditor } from '@/components/admin/meta-editor';

export default async function EditMetaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <MetaEditor metaId={id} />;
}

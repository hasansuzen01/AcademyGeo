import { DeckEditor } from '@/components/admin/deck-editor';

export default async function EditDeckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <DeckEditor deckId={id} />;
}

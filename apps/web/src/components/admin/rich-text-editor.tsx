'use client';

import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type ReactNode, useRef, useState } from 'react';

import { uploadImage } from '@/lib/admin-api';
import { cn } from '@/lib/cn';

interface RichTextEditorProps {
  value: string;
  storageReady: boolean;
  onChange: (html: string) => void;
}

/**
 * The post body.
 *
 * Produces plain HTML rather than a private format, so what is stored is what
 * a reader's browser renders. The API cleans it on the way in; nothing here is
 * relied on for safety, because a browser tool cannot be.
 */
export function RichTextEditor({ value, storageReady, onChange }: RichTextEditorProps) {
  const t = useTranslations('admin.editor');
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    // The server renders this too, and tiptap warns unless told not to.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer' },
      }),
      Image.configure({ inline: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: t('placeholder') }),
    ],
    content: value,
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
    editorProps: {
      attributes: { class: 'prose-card min-h-80 px-5 py-5 focus:outline-none' },
    },
  });

  if (!editor) return <div className="card-raised h-96 animate-pulse" />;

  async function insertPicture(file: File | undefined) {
    if (!file || !editor) return;

    setUploading(true);
    try {
      const uploaded = await uploadImage(file, 'metas');
      editor.chain().focus().setImage({ src: uploaded.url }).run();
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  function setLink() {
    if (!editor) return;

    const current = editor.getAttributes('link').href as string | undefined;
    const href = window.prompt(t('linkPrompt'), current ?? 'https://');
    if (href === null) return;

    if (href === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  }

  return (
    <div className="overflow-hidden rounded-card border-2 border-line bg-paper">
      <div className="flex flex-wrap items-center gap-1 border-b-2 border-line bg-canvas px-3 py-2">
        <Tool
          label={t('bold')}
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </Tool>
        <Tool
          label={t('italic')}
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </Tool>
        <Tool
          label={t('underline')}
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-4" />
        </Tool>
        <Tool
          label={t('strike')}
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-4" />
        </Tool>

        <Divider />

        <Tool
          label={t('heading2')}
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="size-4" />
        </Tool>
        <Tool
          label={t('heading3')}
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="size-4" />
        </Tool>
        <Tool
          label={t('bulletList')}
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </Tool>
        <Tool
          label={t('orderedList')}
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </Tool>
        <Tool
          label={t('quote')}
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-4" />
        </Tool>
        <Tool
          label={t('code')}
          active={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code className="size-4" />
        </Tool>
        <Tool label={t('rule')} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="size-4" />
        </Tool>

        <Divider />

        <Tool
          label={t('alignLeft')}
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeft className="size-4" />
        </Tool>
        <Tool
          label={t('alignCenter')}
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenter className="size-4" />
        </Tool>
        <Tool
          label={t('alignRight')}
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <AlignRight className="size-4" />
        </Tool>

        <Divider />

        <Tool label={t('link')} active={editor.isActive('link')} onClick={setLink}>
          <Link2 className="size-4" />
        </Tool>
        <Tool
          label={storageReady ? t('picture') : t('pictureUnavailable')}
          disabled={!storageReady || uploading}
          onClick={() => fileInput.current?.click()}
        >
          <ImagePlus className="size-4" />
        </Tool>

        <Divider />

        <Tool
          label={t('undo')}
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="size-4" />
        </Tool>
        <Tool
          label={t('redo')}
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="size-4" />
        </Tool>

        <input
          ref={fileInput}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          className="hidden"
          onChange={(event) => void insertPicture(event.target.files?.[0])}
        />
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

function Tool({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex size-8 items-center justify-center rounded-lg transition-colors',
        active ? 'bg-ink text-paper' : 'text-muted hover:bg-edge hover:text-ink',
        disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-muted',
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-edge" aria-hidden />;
}

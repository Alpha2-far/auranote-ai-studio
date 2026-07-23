import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Markdown } from 'tiptap-markdown';
import { useEffect } from 'react';
import { cx } from '../lib/config';
import {
  IconHeading1,
  IconHeading2,
  IconBold,
  IconItalic,
  IconList,
  IconListChecks,
  IconQuote,
  IconCode,
} from './icons';

interface EditorProps {
  content: string;
  onChange: (markdown: string) => void;
}

const btn = (active: boolean) =>
  cx(
    'rounded px-2 py-1 text-sm transition',
    active ? 'bg-brand-500/20 text-brand-700 dark:text-brand-300' : 'hover:bg-black/5 dark:hover:bg-white/5',
  );

export function Editor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown.configure({ html: false, transformPastedText: true }),
      Placeholder.configure({ placeholder: 'Écris, ou colle une réponse d’IA…' }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const md = editor.storage.markdown.getMarkdown() as string;
      onChange(md);
    },
  });

  // Recharge le contenu si la note change (navigation entre notes)
  useEffect(() => {
    if (editor && content !== (editor.storage.markdown.getMarkdown() as string)) {
      editor.commands.setContent(content, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div>
      <div className="sticky top-0 z-10 mb-2 flex flex-wrap gap-0.5 border-b border-[var(--border)] bg-[var(--surface)] pb-2">
        <button title="Titre 1" className={btn(editor.isActive('heading', { level: 1 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><IconHeading1 size={18} /></button>
        <button title="Titre 2" className={btn(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><IconHeading2 size={18} /></button>
        <button title="Gras" className={btn(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()}><IconBold size={16} /></button>
        <button title="Italique" className={btn(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()}><IconItalic size={16} /></button>
        <button title="Liste à puces" className={btn(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()}><IconList size={18} /></button>
        <button title="Liste de tâches" className={btn(editor.isActive('taskList'))} onClick={() => editor.chain().focus().toggleTaskList().run()}><IconListChecks size={18} /></button>
        <button title="Citation" className={btn(editor.isActive('blockquote'))} onClick={() => editor.chain().focus().toggleBlockquote().run()}><IconQuote size={18} /></button>
        <button title="Bloc de code" className={btn(editor.isActive('codeBlock'))} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><IconCode size={18} /></button>
      </div>
      <EditorContent editor={editor} className="prose-editor" />
    </div>
  );
}

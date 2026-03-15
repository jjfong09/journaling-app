"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

const editorWrapperStyles: React.CSSProperties = {
  border: "1.5px solid #e6e4dc",
  borderRadius: 12,
  padding: "16px 18px",
  background: "#fff",
};

const documentWrapperStyles: React.CSSProperties = {
  background: "transparent",
  border: "none",
  padding: 0,
  borderRadius: 0,
};

function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const setBold = () => editor.chain().focus().toggleBold().run();
  const setItalic = () => editor.chain().focus().toggleItalic().run();
  const setBulletList = () => editor.chain().focus().toggleBulletList().run();
  const setOrderedList = () => editor.chain().focus().toggleOrderedList().run();

  const btn = (onClick: () => void, label: string, active?: boolean) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 10px",
        marginRight: 2,
        borderRadius: 6,
        border: "none",
        background: active ? "#e6e4dc" : "transparent",
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        cursor: "pointer",
        color: "#3d3d3a",
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        marginBottom: 12,
        paddingBottom: 10,
        borderBottom: "1px solid #e6e4dc",
      }}
    >
      {btn(setBold, "Bold", editor.isActive("bold"))}
      {btn(setItalic, "Italic", editor.isActive("italic"))}
      {btn(setBulletList, "• List", editor.isActive("bulletList"))}
      {btn(setOrderedList, "1. List", editor.isActive("orderedList"))}
    </div>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your entry…",
  variant = "default",
  contentRef,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  variant?: "default" | "document";
  /** Optional ref updated on every change so parent can read latest HTML at save time */
  contentRef?: React.MutableRefObject<string | null>;
}) {
  const wrapperStyle = variant === "document" ? documentWrapperStyles : editorWrapperStyles;
  const editor = useEditor(
    {
      extensions: [StarterKit],
      content: value,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          "data-placeholder": placeholder,
          class: "rich-text-editor",
        },
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        onChange(html);
        if (contentRef) contentRef.current = html;
      },
    },
    []
  );

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <div style={wrapperStyle} className="rich-text-editor-wrap">
      {variant === "default" && <MenuBar editor={editor} />}
      {editor ? <EditorContent editor={editor} /> : <div style={{ minHeight: 200 }} />}
    </div>
  );
}

export function getDefaultEditorContent(): string {
  return "<p></p>";
}

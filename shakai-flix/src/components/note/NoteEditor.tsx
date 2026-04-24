"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { useEffect, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Clock, Bold, Italic, List, ListOrdered, Download } from "lucide-react";
import { useNote } from "@/hooks/useNote";
import type { VideoMeta } from "@/lib/types";
import { formatDuration } from "@/lib/utils";

interface NoteEditorProps {
  video: VideoMeta;
  currentPositionSec: number;
}

function editorToMarkdown(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/p>/gi, "\n")
    .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<b>(.*?)<\/b>/gi, "**$1**")
    .replace(/<em>(.*?)<\/em>/gi, "*$1*")
    .replace(/<i>(.*?)<\/i>/gi, "*$1*")
    .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
    .replace(/<\/?(ul|ol)[^>]*>/gi, "")
    .replace(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function NoteEditor({ video, currentPositionSec }: NoteEditorProps) {
  const { note, save } = useNote(video.id);
  const positionRef = useRef(currentPositionSec);
  useEffect(() => {
    positionRef.current = currentPositionSec;
  }, [currentPositionSec]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder:
          "気づいたこと、用語の意味、疑問などをメモ…（Ctrl+K で現在のタイムスタンプを挿入）",
      }),
      Link.configure({ openOnClick: true, autolink: true }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none prose-p:my-2 prose-headings:text-[color:var(--foreground)] focus:outline-none min-h-[12rem]",
      },
    },
  });

  useEffect(() => {
    if (!editor || note === undefined) return;
    const current = editor.getHTML();
    const loaded = note?.content ?? "";
    if (current === "<p></p>" && loaded) {
      editor.commands.setContent(loaded, { emitUpdate: false });
    } else if (!current && loaded) {
      editor.commands.setContent(loaded, { emitUpdate: false });
    }
  }, [editor, note]);

  const persist = useDebouncedCallback((html: string) => {
    save({ content: html, contentMarkdown: editorToMarkdown(html) });
  }, 800);

  useEffect(() => {
    if (!editor) return;
    const handler = () => persist(editor.getHTML());
    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
    };
  }, [editor, persist]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!editor) return;
      const isMod = e.ctrlKey || e.metaKey;
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const ts = `[${formatDuration(positionRef.current)}]`;
        editor.chain().focus().insertContent(`${ts} `).run();
      }
      if (isMod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        persist(editor.getHTML());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editor, persist]);

  const insertTimestamp = () => {
    if (!editor) return;
    const ts = `[${formatDuration(currentPositionSec)}]`;
    editor.chain().focus().insertContent(`${ts} `).run();
  };

  const downloadMarkdown = () => {
    if (!editor) return;
    const md = editorToMarkdown(editor.getHTML());
    const title = video.title.replace(/[\\/:"*?<>|]/g, "_");
    const blob = new Blob([`# ${video.title}\n\n${md}\n`], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!editor) return null;

  return (
    <div className="flex h-full flex-col bg-[color:var(--surface)]/50">
      <div className="flex items-center gap-1 border-b border-[color:var(--border)] bg-[color:var(--surface)] px-2 py-1.5">
        <ToolButton
          onClick={insertTimestamp}
          label={`タイムスタンプ挿入（${formatDuration(currentPositionSec)}）`}
        >
          <Clock size={14} />
        </ToolButton>
        <div className="mx-1 h-4 w-px bg-[color:var(--border)]" />
        <ToolButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          label="太字"
        >
          <Bold size={14} />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          label="斜体"
        >
          <Italic size={14} />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          label="箇条書き"
        >
          <List size={14} />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          label="番号付きリスト"
        >
          <ListOrdered size={14} />
        </ToolButton>
        <div className="flex-1" />
        <ToolButton onClick={downloadMarkdown} label="Markdown で保存">
          <Download size={14} />
        </ToolButton>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <EditorContent editor={editor} />
      </div>
      <div className="flex justify-between border-t border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1.5 text-[10px] text-[color:var(--muted)]">
        <span>
          自動保存 ·{" "}
          {note
            ? new Date(note.updatedAt).toLocaleString("ja-JP")
            : "まだ保存されていません"}
        </span>
        <span>Ctrl+S 保存 · Ctrl+K タイムスタンプ</span>
      </div>
    </div>
  );
}

function ToolButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded p-1.5 transition ${
        active
          ? "bg-[color:var(--accent)] text-white"
          : "text-[color:var(--muted)] hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--foreground)]"
      }`}
    >
      {children}
    </button>
  );
}

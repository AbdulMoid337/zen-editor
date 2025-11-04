import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import Highlight from "@tiptap/extension-highlight";
import { Placeholder } from '@tiptap/extensions';
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Code from "@tiptap/extension-code";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { SlashCommandExtension } from "../slashcommands/slash-command-extension";
import { useEffect } from "react";

interface Props {
  initialContent: string;
  onContentChange?: (html: string) => void;
  onReady?: () => void;
  slashCommandOptions?: {
    onSlashCommand: (position: { top: number; left: number }) => void;
    onCloseSlashCommand: () => void;
  };
} 

const lowlight = createLowlight(common);

export const useEditorConfig = ({
  initialContent,
  onContentChange,
  onReady,
  slashCommandOptions,
}: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false, code: false }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "javascript",
        exitOnTripleEnter: false,
      }),
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: "Write, press '/' for commands...",
        showOnlyWhenEditable: true,
      }),
      Underline,
      Code,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      SlashCommandExtension.configure(
        slashCommandOptions || {
          onSlashCommand: () => {},
          onCloseSlashCommand: () => {},
        }
      ),
    ],
    content: "",
    autofocus: true,
    editorProps: {
      attributes: {
        class:
          "outline-none prose prose-lg max-w-none min-h-[400px] text-lg leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      onContentChange?.(editor.getHTML());
    },
    onCreate: () => {
      onReady?.();
    },
  });

  useEffect(() => {
    if (!editor) return;

    const current = editor.getHTML().trim();
    const incoming = initialContent.trim();

    if (current !== incoming) {
      editor.commands.setContent(initialContent, false);
    }
  }, [initialContent, editor]);

  return editor;
};

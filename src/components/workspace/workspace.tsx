import { useCallback } from "react";
import { EditorContent } from "@tiptap/react";
import { useEditorConfig } from "./tip-top/config";
import Title from "./title";
import Toolbar from "./tip-top/toolbar";
import type { ToolbarAction } from "./tip-top/toolbar_actions";
import { useDataStore, type Note } from "@/stores/data.store";
import { ScrollArea } from "@/components/ui/scroll-area";

const Workspace = ({ note }: { note: Note }) => {
  const { updateNote } = useDataStore();

  const editor = useEditorConfig({
    initialContent: note.content,
    onContentChange: (content: string) => {
      updateNote(note.id, { content: content });
    },
    onReady: () => console.log("Ready"),
  });

  const toggle = useCallback(
    (action: ToolbarAction) => {
      if (!editor) return;

      const chain = editor.chain().focus();

      switch (action) {
        case "bold":
          chain.toggleBold().run();
          break;
        case "italic":
          chain.toggleItalic().run();
          break;
        case "highlight":
          chain.toggleHighlight().run();
          break;
        case "blockquote":
          chain.toggleBlockquote().run();
          break;
        case "underline":
          chain.toggleUnderline().run();
          break;
        case "bulletList":
          chain.toggleBulletList().run();
          break;
        case "code":
          chain.toggleCode().run();
          break;
        case "codeBlock":
          chain.toggleCodeBlock().run();
          break;
        case "orderedList":
          chain.toggleOrderedList().run();
          break;
        case "alignLeft":
          chain.setTextAlign("left").run();
          break;
        case "alignCenter":
          chain.setTextAlign("center").run();
          break;
        case "alignRight":
          chain.setTextAlign("right").run();
          break;
        case "alignJustify":
          chain.setTextAlign("justify").run();
          break;
      }
    },
    [editor]
  );

  if (!editor) return null;

  return (
    <ScrollArea className="max-w-6xl h-[95vh] mx-auto md:p-6">
      <Title
        title={note.title}
        setTitle={(e) => updateNote(note.id, { title: e })}
      />

      <Toolbar editor={editor} onToggle={toggle} />
      <EditorContent className="prose prose-lg max-w-full w-full break-word overflow-x-auto" editor={editor} />
    </ScrollArea>
  );
};

export default Workspace;

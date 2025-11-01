import { useCallback, useState, useEffect } from "react";
import { EditorContent } from "@tiptap/react";
import { useEditorConfig } from "./tip-top/config";
import Title from "./title";
import Toolbar from "./tip-top/toolbar";
import SlashCommandDropdown from "./slashcommands/slash-command-dropdown";
import type { ToolbarAction } from "./tip-top/toolbar_actions";
import { useDataStore, type Note } from "@/stores/data.store";
import { ScrollArea } from "@/components/ui/scroll-area";

const Workspace = ({ note }: { note: Note }) => {
  const { updateNote } = useDataStore();
  const [slashCommandOpen, setSlashCommandOpen] = useState(false);
  const [slashCommandPosition, setSlashCommandPosition] = useState({ 
    top: 0, 
    left: 0 
  });

  const editor = useEditorConfig({
    initialContent: note.content,
    onContentChange: (content: string) => {
      updateNote(note.id, { content: content });
    },
    onReady: () => console.log("Ready"),
    slashCommandOptions: {
      onSlashCommand: (position: { top: number; left: number }) => {
        setSlashCommandPosition(position);
        setSlashCommandOpen(true);
      },
      onCloseSlashCommand: () => {
        setSlashCommandOpen(false);
      },
    },
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
        case "paragraph":
          chain.setParagraph().run();
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
        case "heading1":
          chain.toggleHeading({ level: 1 }).run();
          break;
        case "heading2":
          chain.toggleHeading({ level: 2 }).run();
          break;
        case "heading3":
          chain.toggleHeading({ level: 3 }).run();
          break;
        case "heading4":
          chain.toggleHeading({ level: 4 }).run();
          break;
        case "heading5":
          chain.toggleHeading({ level: 5 }).run();
          break;
        case "heading6":
          chain.toggleHeading({ level: 6 }).run();
          break;
        default:
          break;
      }
    },
    [editor]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editor?.view.dom && !editor.view.dom.contains(event.target as Node)) {
        setSlashCommandOpen(false);
      }
    };

    if (slashCommandOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [slashCommandOpen, editor]);

  if (!editor) return null;

  return (
    <ScrollArea className="flex-1">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Title
          title={note.title}
          setTitle={(newTitle: string) => updateNote(note.id, { title: newTitle })}
        />
        
        <div className="relative">
          <Toolbar 
            editor={editor} 
            onToggle={toggle} 
          />
          
          <div className="relative">
            <EditorContent 
              editor={editor} 
              className="prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-4 rounded-lg border border-slate-200 dark:border-slate-700"
            />
            
            <SlashCommandDropdown
              editor={editor}
              isOpen={slashCommandOpen}
              onClose={() => setSlashCommandOpen(false)}
              position={slashCommandPosition}
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default Workspace;

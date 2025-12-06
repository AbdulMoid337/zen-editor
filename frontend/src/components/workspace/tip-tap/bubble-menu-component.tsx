import { BubbleMenu, Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, Code, Link, Highlighter } from "lucide-react";
import { cn } from "@/lib/utils";

interface BubbleMenuComponentProps {
  editor: Editor;
}

export const BubbleMenuComponent = ({ editor }: BubbleMenuComponentProps) => {
  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: "top",
      }}
      className="flex items-center gap-1 rounded-lg border border-border bg-background p-1 shadow-lg"
    >
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn("h-8 w-8 p-0", editor.isActive("bold") && "bg-accent")}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn("h-8 w-8 p-0", editor.isActive("italic") && "bg-accent")}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("underline") && "bg-accent",
        )}
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={cn("h-8 w-8 p-0", editor.isActive("code") && "bg-accent")}
        title="Code"
      >
        <Code className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("highlight") && "bg-accent",
        )}
        title="Highlight"
      >
        <Highlighter className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={setLink}
        className={cn("h-8 w-8 p-0", editor.isActive("link") && "bg-accent")}
        title="Link"
      >
        <Link className="h-4 w-4" />
      </Button>
    </BubbleMenu>
  );
};

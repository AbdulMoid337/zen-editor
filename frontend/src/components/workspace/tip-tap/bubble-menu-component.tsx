import { useCallback, useState } from "react";
import { BubbleMenu, Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bold,
  Italic,
  Underline,
  Code,
  Link,
  Highlighter,
  Palette,
  Quote,
  List,
  ListOrdered,
  Sparkles,
  Type,
  Link2Off,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { aiService } from "@/components/services/ai-service.ts";

interface BubbleMenuComponentProps {
  editor: Editor;
}

const HIGHLIGHT_COLORS = [
  { name: "Yellow", color: "#ffeb3b" },
  { name: "Green", color: "#8ce99a" },
  { name: "Blue", color: "#74c0fc" },
  { name: "Red", color: "#ffa8a8" },
  { name: "Purple", color: "#b197fc" },
  { name: "Orange", color: "#ffc078" },
];

const TEXT_COLORS = [
  { name: "Black", color: "#111827" },
  { name: "Gray", color: "#6b7280" },
  { name: "Red", color: "#ef4444" },
  { name: "Orange", color: "#f59e0b" },
  { name: "Yellow", color: "#eab308" },
  { name: "Green", color: "#10b981" },
  { name: "Blue", color: "#3b82f6" },
  { name: "Purple", color: "#8b5cf6" },
  { name: "Pink", color: "#ec4899" },
];

export const BubbleMenuComponent = ({ editor }: BubbleMenuComponentProps) => {
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const removeLink = useCallback(() => {
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  const handleHighlightColor = (color: string) => {
    editor.chain().focus().toggleHighlight({ color }).run();
  };

  const handleTextColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  const handleUnsetColor = () => {
    editor.chain().focus().unsetColor().run();
  };

  const getSelectedText = () => {
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to, "\n");
  };

  const replaceSelectedText = (text: string) => {
    const { from, to } = editor.state.selection;
    editor.chain().focus().deleteRange({ from, to }).insertContent(text).run();
  };

  const handleAICommand = async (
    command: "summarize" | "expand" | "improve",
  ) => {
    if (!editor) return;

    const text = getSelectedText();
    if (!text.trim()) {
      alert("Please select some text to use AI commands");
      return;
    }

    setIsProcessingAI(true);
    try {
      const result = await aiService[command](text);
      if (result?.success && result.data) {
        replaceSelectedText(result.data);
      } else {
        throw new Error(result.error || "AI request failed");
      }
    } catch (err) {
      console.error("AI command error:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(`AI command failed: ${message}`);
    } finally {
      setIsProcessingAI(false);
    }
  };

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 150,
        placement: "top",
        animation: "shift-toward-subtle",
        maxWidth: "none",
        zIndex: 100,
      }}
      shouldShow={({ editor, state }) => {
        const { from, to } = state.selection;
        const hasSelection = from !== to;
        return hasSelection && !editor.isActive("codeBlock");
      }}
      className="flex items-center gap-1 rounded-xl border border-border/50 bg-background/95 backdrop-blur-md p-1.5 shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
    >
      {/* Text Formatting */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          "h-8 w-8 p-0 hover:bg-accent transition-all duration-150",
          editor.isActive("bold") && "bg-accent text-accent-foreground",
        )}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          "h-8 w-8 p-0 hover:bg-accent transition-all duration-150",
          editor.isActive("italic") && "bg-accent text-accent-foreground",
        )}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(
          "h-8 w-8 p-0 hover:bg-accent transition-all duration-150",
          editor.isActive("underline") && "bg-accent text-accent-foreground",
        )}
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={cn(
          "h-8 w-8 p-0 hover:bg-accent transition-all duration-150",
          editor.isActive("code") && "bg-accent text-accent-foreground",
        )}
        title="Inline Code"
      >
        <Code className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Heading Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "h-8 px-2 hover:bg-accent transition-all duration-150 gap-1",
              (editor.isActive("heading") || editor.isActive("paragraph")) &&
                "bg-accent text-accent-foreground",
            )}
            title="Text Style"
          >
            <Type className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-44 bg-background/95 backdrop-blur-md"
        >
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={cn(
              "cursor-pointer",
              editor.isActive("paragraph") && "bg-accent",
            )}
          >
            <Type className="h-4 w-4 mr-2" />
            <span>Paragraph</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={cn(
              "cursor-pointer text-xl font-bold",
              editor.isActive("heading", { level: 1 }) && "bg-accent",
            )}
          >
            Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={cn(
              "cursor-pointer text-lg font-bold",
              editor.isActive("heading", { level: 2 }) && "bg-accent",
            )}
          >
            Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={cn(
              "cursor-pointer text-base font-bold",
              editor.isActive("heading", { level: 3 }) && "bg-accent",
            )}
          >
            Heading 3
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Highlight Color Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "h-8 w-8 p-0 hover:bg-accent transition-all duration-150",
              editor.isActive("highlight") &&
                "bg-accent text-accent-foreground",
            )}
            title="Highlight"
          >
            <Highlighter className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-3 bg-background/95 backdrop-blur-md"
          align="start"
        >
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Highlight Color
            </p>
            <div className="grid grid-cols-3 gap-2">
              {HIGHLIGHT_COLORS.map((item) => (
                <button
                  key={item.color}
                  onClick={() => handleHighlightColor(item.color)}
                  className={cn(
                    "w-8 h-8 rounded-md border-2 transition-all duration-150 hover:scale-110",
                    editor.isActive("highlight", { color: item.color })
                      ? "border-foreground ring-2 ring-ring"
                      : "border-border",
                  )}
                  style={{ backgroundColor: item.color }}
                  title={item.name}
                />
              ))}
            </div>
            {editor.isActive("highlight") && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => editor.chain().focus().unsetHighlight().run()}
                className="w-full mt-2 text-xs"
              >
                Remove Highlight
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "h-8 w-8 p-0 hover:bg-accent transition-all duration-150",
              editor.getAttributes("textStyle")?.color &&
                "bg-accent text-accent-foreground",
            )}
            title="Text Color"
          >
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-3 bg-background/95 backdrop-blur-md"
          align="start"
        >
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Text Color
            </p>
            <div className="grid grid-cols-5 gap-2">
              {TEXT_COLORS.map((item) => (
                <button
                  key={item.color}
                  onClick={() => handleTextColor(item.color)}
                  className={cn(
                    "w-8 h-8 rounded-md border-2 transition-all duration-150 hover:scale-110",
                    editor.getAttributes("textStyle")?.color === item.color
                      ? "border-foreground ring-2 ring-ring"
                      : "border-border",
                  )}
                  style={{ backgroundColor: item.color }}
                  title={item.name}
                />
              ))}
            </div>
            {editor.getAttributes("textStyle")?.color && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleUnsetColor}
                className="w-full mt-2 text-xs"
              >
                Reset Color
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Block Formatting */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(
          "h-8 w-8 p-0 hover:bg-accent transition-all duration-150",
          editor.isActive("blockquote") && "bg-accent text-accent-foreground",
        )}
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          "h-8 w-8 p-0 hover:bg-accent transition-all duration-150",
          editor.isActive("bulletList") && "bg-accent text-accent-foreground",
        )}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          "h-8 w-8 p-0 hover:bg-accent transition-all duration-150",
          editor.isActive("orderedList") && "bg-accent text-accent-foreground",
        )}
        title="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Link */}
      {!editor.isActive("link") ? (
        <Button
          size="sm"
          variant="ghost"
          onClick={setLink}
          className="h-8 w-8 p-0 hover:bg-accent transition-all duration-150"
          title="Add Link"
        >
          <Link className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          onClick={removeLink}
          className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground transition-all duration-150 bg-accent text-accent-foreground"
          title="Remove Link"
        >
          <Link2Off className="h-4 w-4" />
        </Button>
      )}

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* AI Commands Dropdown - FIXED */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            disabled={isProcessingAI}
            className={cn(
              "h-8 px-2 hover:bg-accent transition-all duration-150 gap-1",
              isProcessingAI && "opacity-50 cursor-not-allowed",
            )}
            title="AI Tools"
          >
            {isProcessingAI ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-44 bg-background/95 backdrop-blur-md"
          sideOffset={8}
        >
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              handleAICommand("improve");
            }}
            disabled={isProcessingAI}
            className="cursor-pointer focus:bg-accent"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            <span>Improve Writing</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              handleAICommand("summarize");
            }}
            disabled={isProcessingAI}
            className="cursor-pointer focus:bg-accent"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            <span>Summarize</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              handleAICommand("expand");
            }}
            disabled={isProcessingAI}
            className="cursor-pointer focus:bg-accent"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            <span>Expand Text</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </BubbleMenu>
  );
};

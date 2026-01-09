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
  Code2,
  Italic,
  Link,
  Palette,
  Sparkles,
  Underline,
  ChevronDown,
  Type,
  List,
  Link2Off,
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
        duration: 200,
        placement: "top",
        animation: "shift-away",
        maxWidth: "none",
        zIndex: 50,
      }}
      shouldShow={({ editor, state }) => {
        const { from, to } = state.selection;
        const hasSelection = from !== to;
        return hasSelection && !editor.isActive("codeBlock");
      }}
      className="flex items-center gap-0.5 rounded-full border border-border/40 bg-background/80 backdrop-blur-xl p-1 shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
    >
      {/* Text Formatting */}
      <Button
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          "h-8 w-8 rounded-full hover:bg-accent hover:text-accent-foreground transition-all duration-200",
          editor.isActive("bold") && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm",
        )}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          "h-8 w-8 rounded-full hover:bg-accent hover:text-accent-foreground transition-all duration-200",
          editor.isActive("italic") && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm",
        )}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(
          "h-8 w-8 rounded-full hover:bg-accent hover:text-accent-foreground transition-all duration-200",
          editor.isActive("underline") && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm",
        )}
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={cn(
          "h-8 w-8 rounded-full hover:bg-accent hover:text-accent-foreground transition-all duration-200",
          editor.isActive("code") && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm",
        )}
        title="Inline Code"
      >
        <Code2 className="h-4 w-4" />
      </Button>

      <div className="h-4 w-[1px] bg-border/60 mx-1" />

      {/* Heading Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "h-8 px-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-all duration-200 gap-1 font-medium text-xs",
              (editor.isActive("heading") || editor.isActive("paragraph")) &&
              "text-foreground",
            )}
            title="Text Style"
          >
            <span className="opacity-70">
              {editor.isActive("heading", { level: 1 }) ? "H1" :
                editor.isActive("heading", { level: 2 }) ? "H2" :
                  editor.isActive("heading", { level: 3 }) ? "H3" : "P"}
            </span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className="w-40 p-1 rounded-xl bg-background/95 backdrop-blur-xl border border-border/50 shadow-xl"
        >
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={cn(
              "rounded-lg cursor-pointer",
              editor.isActive("paragraph") && "bg-accent/50",
            )}
          >
            <Type className="h-4 w-4 mr-2 opacity-70" />
            <span>Paragraph</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={cn(
              "rounded-lg cursor-pointer",
              editor.isActive("heading", { level: 1 }) && "bg-accent/50",
            )}
          >
            <div className="flex items-center">
              <span className="font-bold text-lg mr-2">H1</span>
              <span>Heading 1</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={cn(
              "rounded-lg cursor-pointer",
              editor.isActive("heading", { level: 2 }) && "bg-accent/50",
            )}
          >
            <div className="flex items-center">
              <span className="font-bold text-base mr-2">H2</span>
              <span>Heading 2</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={cn(
              "rounded-lg cursor-pointer",
              editor.isActive("heading", { level: 3 }) && "bg-accent/50",
            )}
          >
            <div className="flex items-center">
              <span className="font-bold text-sm mr-2">H3</span>
              <span>Heading 3</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="h-4 w-[1px] bg-border/60 mx-1" />

      {/* Highlight Color Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-8 w-8 rounded-full hover:bg-accent hover:text-accent-foreground transition-all duration-200",
              editor.isActive("highlight") && "bg-primary/20 text-primary-foreground",
            )}
            title="Highlight"
          >
            <div
              className="h-4 w-4 rounded-full border-2 border-current"
              style={{
                backgroundColor: editor.getAttributes("highlight").color || 'transparent',
                borderColor: editor.isActive('highlight') ? 'transparent' : 'currentColor'
              }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-2 bg-background/95 backdrop-blur-xl border-border/50 rounded-xl shadow-xl"
          align="start"
          sideOffset={8}
        >
          <div className="space-y-2">
            <div className="grid grid-cols-6 gap-1">
              {HIGHLIGHT_COLORS.map((item) => (
                <button
                  key={item.color}
                  onClick={() => handleHighlightColor(item.color)}
                  className={cn(
                    "w-6 h-6 rounded-full border transition-all duration-150 hover:scale-110",
                    editor.isActive("highlight", { color: item.color })
                      ? "border-primary ring-1 ring-ring"
                      : "border-transparent",
                  )}
                  style={{ backgroundColor: item.color }}
                  title={item.name}
                />
              ))}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => editor.chain().focus().unsetHighlight().run()}
              className="w-full text-xs h-7 rounded-lg text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-8 w-8 rounded-full hover:bg-accent hover:text-accent-foreground transition-all duration-200",
              editor.getAttributes("textStyle")?.color && "bg-accent/50",
            )}
            title="Text Color"
          >
            <Palette className="h-4 w-4" style={{ color: editor.getAttributes("textStyle")?.color }} />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-2 bg-background/95 backdrop-blur-xl border-border/50 rounded-xl shadow-xl"
          align="start"
          sideOffset={8}
        >
          <div className="space-y-2">
            <div className="grid grid-cols-5 gap-1">
              {TEXT_COLORS.map((item) => (
                <button
                  key={item.color}
                  onClick={() => handleTextColor(item.color)}
                  className={cn(
                    "w-6 h-6 rounded-full border transition-all duration-150 hover:scale-110",
                    editor.getAttributes("textStyle")?.color === item.color
                      ? "border-primary ring-1 ring-ring"
                      : "border-transparent",
                  )}
                  style={{ backgroundColor: item.color }}
                  title={item.name}
                />
              ))}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleUnsetColor}
              className="w-full text-xs h-7 rounded-lg text-muted-foreground hover:text-foreground"
            >
              Default
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <div className="h-4 w-[1px] bg-border/60 mx-1" />

      {/* Basic Blocks */}
      <Button
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          "h-8 w-8 rounded-full hover:bg-accent hover:text-accent-foreground transition-all duration-200",
          editor.isActive("bulletList") && "bg-primary text-primary-foreground hover:bg-primary/90",
        )}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>

      <div className="h-4 w-[1px] bg-border/60 mx-1" />

      {/* Link */}
      <Button
        size="icon"
        variant="ghost"
        onClick={editor.isActive("link") ? removeLink : setLink}
        className={cn(
          "h-8 w-8 rounded-full hover:bg-accent hover:text-accent-foreground transition-all duration-200",
          editor.isActive("link") && "bg-primary text-primary-foreground hover:bg-primary/90",
        )}
        title={editor.isActive("link") ? "Remove Link" : "Add Link"}
      >
        {editor.isActive("link") ? <Link2Off className="h-4 w-4" /> : <Link className="h-4 w-4" />}
      </Button>

      <div className="h-4 w-[1px] bg-border/60 mx-1" />

      {/* AI */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            disabled={isProcessingAI}
            className={cn(
              "h-8 px-2 rounded-full transition-all duration-200 gap-1 text-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900/40",
              isProcessingAI && "opacity-50 cursor-not-allowed",
            )}
            title="AI Tools"
          >
            {isProcessingAI ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span className="text-xs font-semibold">AI</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-xl p-1"
          sideOffset={8}
        >
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              handleAICommand("improve");
            }}
            disabled={isProcessingAI}
            className="rounded-lg cursor-pointer focus:bg-purple-100 dark:focus:bg-purple-900/30"
          >
            <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
            <span>Improve Writing</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              handleAICommand("summarize");
            }}
            disabled={isProcessingAI}
            className="rounded-lg cursor-pointer focus:bg-purple-100 dark:focus:bg-purple-900/30"
          >
            <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
            <span>Summarize</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              handleAICommand("expand");
            }}
            disabled={isProcessingAI}
            className="rounded-lg cursor-pointer focus:bg-purple-100 dark:focus:bg-purple-900/30"
          >
            <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
            <span>Expand Text</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </BubbleMenu>
  );
};

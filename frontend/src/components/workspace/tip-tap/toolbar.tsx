import { useCallback, useState } from "react";
import { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { aiService } from "@/components/services/ai-service.ts";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Highlighter,
  Sparkles,
  Loader2,
  Palette,
  Link,
  ChevronDown,
} from "lucide-react";
import {
  getPlatform,
  TOOLBAR_ACTIONS,
  type ToolbarAction,
} from "./toolbar_actions";

const HIGHLIGHT_COLORS = [
  { name: "Default", color: "#ffeb3b" },
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
  { name: "Indigo", color: "#6366f1" },
  { name: "Purple", color: "#8b5cf6" },
  { name: "Pink", color: "#ec4899" },
];

interface ToolbarProps {
  editor: Editor | null;
  onToggle: (action: ToolbarAction) => void;
}

const Toolbar = ({ editor, onToggle }: ToolbarProps) => {
  const platform = getPlatform();
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  const alignActions = TOOLBAR_ACTIONS.filter((a) =>
    ["alignLeft", "alignCenter", "alignRight", "alignJustify"].includes(a.key),
  );

  const headingActions = TOOLBAR_ACTIONS.filter((a) =>
    [
      "heading1",
      "heading2",
      "heading3",
      "heading4",
      "heading5",
      "heading6",
    ].includes(a.key),
  );

  const baseActions = TOOLBAR_ACTIONS.filter(
    (a) =>
      ![...alignActions, ...headingActions].some((x) => x.key === a.key) &&
      a.key !== "highlight",
  );

  const highlightAction = TOOLBAR_ACTIONS.find((a) => a.key === "highlight");

  const getSelectedText = () => {
    if (!editor) return "";
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to, "\n");
  };

  const replaceSelectedText = (text: string) => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    editor.chain().focus().deleteRange({ from, to }).insertContent(text).run();
  };

  const handleHighlightColor = (color: string) => {
    editor?.chain().focus().toggleHighlight({ color }).run();
  };

  const handleTextColor = (color: string) => {
    editor?.chain().focus().setColor(color).run();
  };

  const handleUnsetColor = () => {
    editor?.chain().focus().unsetColor().run();
  };
  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    try {
      editor
        ?.chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    } catch (e: any) {
      alert(e.message);
    }
  }, [editor]);

  const handleAICommand = async (
    command: "summarize" | "expand" | "improve" | "autocomplete",
  ) => {
    if (!editor) return;

    let text: string;
    if (command === "autocomplete") {
      const { from } = editor.state.selection;
      const startPos = Math.max(0, from - 500);
      text = editor.state.doc.textBetween(startPos, from, "\n");
      if (!text.trim()) {
        return alert("Please type some text to use autocomplete");
      }
    } else {
      text = getSelectedText();
      if (!text.trim()) {
        return alert("Please select some text to use AI commands");
      }
    }

    setIsProcessingAI(true);

    try {
      const result = await aiService[command](text);

      if (result?.success && result.data) {
        if (command === "autocomplete") {
          const { from } = editor.state.selection;
          (editor.commands as any).clearGhostText();
          (editor.commands as any).setGhostText(result.data, from);
        } else {
          replaceSelectedText(result.data);
        }
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
    <div className="flex sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border pb-2 mb-6 flex-wrap gap-1 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            disabled={isProcessingAI}
            className={cn(
              "h-8 px-3 rounded-lg flex items-center gap-2 font-medium cursor-pointer transition-all",
              "text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/40"
            )}
          >
            {isProcessingAI ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <Sparkles
                size={14}
              />
            )}
            <span className="text-sm">
              {isProcessingAI ? "Thinking..." : "Ask AI"}
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={6}
          className="w-44 p-1"
        >
          {["summarize", "expand", "improve", "autocomplete"].map((cmd) => (
            <DropdownMenuItem
              key={cmd}
              disabled={isProcessingAI}
              onClick={() => handleAICommand(cmd as any)}
              className="cursor-pointer"
            >
              <Sparkles
                size={14}
                className="mr-2 text-purple-500"
              />
              <span className="capitalize">{cmd}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-[1px] h-6 bg-border mx-1" />

      {baseActions.map(
        ({ key, label, icon: Icon, shortcut, activeClass }) => {
          const isActive = editor?.isActive(key);
          const hotkey = shortcut[platform];
          return (
            <Button
              key={key}
              onClick={() => onToggle(key)}
              variant="ghost"
              size="sm"
              title={`${label} (${hotkey})`}
              className={cn(
                "h-8 w-8 p-0 cursor-pointer",
                isActive && "bg-muted text-foreground"
              )}
            >
              <Icon size={16} />
            </Button>
          );
        },
      )}

      <div className="w-[1px] h-6 bg-border mx-1" />

      {highlightAction && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              title={`${highlightAction.label} (${highlightAction.shortcut[platform]})`}
              className={cn(
                "h-8 w-8 p-0 cursor-pointer",
                editor?.isActive("highlight") && "bg-muted text-foreground"
              )}
            >
              <Highlighter size={16} />
            </Button>
          </PopoverTrigger>

          <PopoverContent align="start" className="w-auto p-3">
            <div className="text-xs mb-2 font-medium text-muted-foreground">
              Highlight Colors
            </div>
            <div className="grid grid-cols-3 gap-1">
              {HIGHLIGHT_COLORS.map(({ name, color }) => (
                <Button
                  key={name}
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "w-6 h-6 p-0 rounded-full border transition-all cursor-pointer hover:scale-110",
                    editor?.isActive("highlight", { color })
                      ? "border-primary shadow-sm"
                      : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handleHighlightColor(color)}
                  title={name}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 cursor-pointer",
              editor?.getAttributes("textStyle")?.color && "bg-muted text-foreground"
            )}
            title="Text color"
          >
            <Palette size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-3">
          <div className="text-xs mb-2 font-medium text-muted-foreground">
            Text Colors
          </div>
          <div className="grid grid-cols-5 gap-1 mb-2">
            {TEXT_COLORS.map(({ name, color }) => (
              <Button
                key={name}
                size="sm"
                variant="ghost"
                className={cn(
                  "w-6 h-6 p-0 rounded-full border transition-all cursor-pointer hover:scale-110",
                  editor?.isActive("textStyle", { color })
                    ? "border-primary shadow-sm"
                    : "border-transparent"
                )}
                style={{ backgroundColor: color }}
                onClick={() => handleTextColor(color)}
                title={name}
              />
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-center text-xs h-7 cursor-pointer"
            onClick={handleUnsetColor}
          >
            Reset
          </Button>
        </PopoverContent>
      </Popover>

      <div className="w-[1px] h-6 bg-border mx-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 px-2 cursor-pointer font-normal"
          >
            <Heading size={16} />
            <ChevronDown size={12} className="opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {headingActions.map(({ key, label }) => {
            const Icon =
              key === "heading1"
                ? Heading1
                : key === "heading2"
                  ? Heading2
                  : key === "heading3"
                    ? Heading3
                    : key === "heading4"
                      ? Heading4
                      : key === "heading5"
                        ? Heading5
                        : Heading6;
            return (
              <DropdownMenuItem
                key={key}
                onClick={() => onToggle(key as ToolbarAction)}
                className="cursor-pointer"
              >
                <Icon size={16} className="mr-2 opacity-70" />
                {label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 px-2 cursor-pointer font-normal"
          >
            <AlignLeft size={16} />
            <ChevronDown size={12} className="opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {alignActions.map(({ key, label }) => {
            const Icon =
              key === "alignLeft"
                ? AlignLeft
                : key === "alignCenter"
                  ? AlignCenter
                  : key === "alignRight"
                    ? AlignRight
                    : AlignJustify;
            return (
              <DropdownMenuItem
                key={key}
                onClick={() => onToggle(key as ToolbarAction)}
                className="cursor-pointer"
              >
                <Icon size={16} className="mr-2 opacity-70" />
                {label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 px-2 cursor-pointer font-normal"
          >
            <Link size={16} />
            <ChevronDown size={12} className="opacity-50" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={setLink} className="cursor-pointer">
            Set Link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor?.chain().focus().unsetLink().run()} className="cursor-pointer">
            Unset Link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Toolbar;

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
    <div className="flex sticky top-0 z-50 bg-background flex-wrap gap-2 border-b pb-4 mb-6 border-black dark:border-amber-900">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            disabled={isProcessingAI}
            className={cn(
              "relative h-9 px-4 rounded-xl flex items-center gap-2 font-medium",
              "bg-linear-to-r from-purple-200 to-purple-500 dark:from-purple-900 dark:to-purple-700",
              "text-slate-900 dark:text-slate-100 hover:from-purple-200 hover:to-purple-300 dark:hover:from-purple-800 dark:hover:to-purple-600",
              "transition-all duration-300 ease-out shadow-sm hover:shadow-md cursor-pointer",
            )}
          >
            {isProcessingAI ? (
              <Loader2
                size={16}
                className="animate-spin text-purple-700 dark:text-purple-300"
              />
            ) : (
              <Sparkles
                size={16}
                className="text-purple-700 dark:text-purple-300"
              />
            )}
            <span className="tracking-wide">
              {isProcessingAI ? "Thinking..." : "Ask AI"}
            </span>
            <div className="absolute inset-0 rounded-xl ring-1 ring-purple-300/30 dark:ring-purple-500/20" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={6}
          className={cn(
            "w-44 p-2 rounded-xl shadow-xl border border-purple-200/40 dark:border-purple-800/50",
            "bg-white/80 dark:bg-slate-900/90 backdrop-blur-lg",
            "animate-in fade-in-0 zoom-in-95 duration-200",
          )}
        >
          {["summarize", "expand", "improve", "autocomplete"].map((cmd) => (
            <DropdownMenuItem
              key={cmd}
              disabled={isProcessingAI}
              onClick={() => handleAICommand(cmd as any)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium",
                "text-slate-700 dark:text-slate-200 hover:bg-purple-100/60 dark:hover:bg-purple-800/40",
                "transition-all duration-200 cursor-pointer",
              )}
            >
              <Sparkles
                size={16}
                className="text-purple-600 dark:text-purple-400"
              />
              <span>{cmd.charAt(0).toUpperCase() + cmd.slice(1)}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {baseActions.map(
        ({ key, label, icon: Icon, shortcut, activeClass, inactiveClass }) => {
          const isActive = editor?.isActive(key);
          const hotkey = shortcut[platform];
          return (
            <Button
              key={key}
              onClick={() => onToggle(key)}
              variant="ghost"
              title={`${label} (${hotkey})`}
              className={cn(
                isActive ? activeClass : inactiveClass,
                "flex items-center justify-center cursor-pointer rounded-md h-9 px-4 text-sm font-medium",
              )}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          );
        },
      )}

      {highlightAction && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              title={`${highlightAction.label} (${highlightAction.shortcut[platform]})`}
              className={cn(
                editor?.isActive("highlight")
                  ? highlightAction.activeClass
                  : highlightAction.inactiveClass,
                "flex items-center justify-center rounded-md h-9 cursor-pointer px-4 text-sm font-medium",
              )}
            >
              <Highlighter size={16} />
              <span className="hidden sm:inline">{highlightAction.label}</span>
            </Button>
          </PopoverTrigger>

          <PopoverContent align="start" className="w-auto p-2">
            <div className="text-xs mb-2 font-medium text-slate-600 dark:text-slate-400">
              Highlight Colors
            </div>
            <div className="grid grid-cols-3 gap-2">
              {HIGHLIGHT_COLORS.map(({ name, color }) => (
                <Button
                  key={name}
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "w-8 h-8 p-0 rounded-md border-2 transition-all cursor-pointer hover:scale-110",
                    editor?.isActive("highlight", { color })
                      ? "border-slate-900 dark:border-slate-100 shadow-md"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handleHighlightColor(color)}
                  title={`${name} highlight`}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              editor?.getAttributes("textStyle")?.color
                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                : "text-slate-700 dark:text-slate-200",
              "flex items-center justify-center rounded-md h-9 cursor-pointer px-4 text-sm font-medium",
            )}
            title="Text color"
          >
            <Palette size={16} />
            <span className="hidden sm:inline">Color</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-2">
          <div className="text-xs mb-2 font-medium text-slate-600 dark:text-slate-400">
            Text Colors
          </div>
          <div className="grid grid-cols-5 gap-2 mb-2">
            {TEXT_COLORS.map(({ name, color }) => (
              <Button
                key={name}
                size="sm"
                variant="ghost"
                className={cn(
                  "w-8 h-8 p-0 rounded-md border-2 transition-all cursor-pointer hover:scale-110",
                  editor?.isActive("textStyle", { color })
                    ? "border-slate-900 dark:border-slate-100 shadow-md"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
                )}
                style={{ backgroundColor: color }}
                onClick={() => handleTextColor(color)}
                title={`${name} text`}
              />
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-center text-xs"
            onClick={handleUnsetColor}
          >
            Clear color
          </Button>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 h-9 px-4 cursor-pointer"
          >
            <AlignCenter size={16} />{" "}
            <span className="hidden sm:inline">Align</span>
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
              >
                <span className="flex items-center gap-2">
                  <Icon size={16} /> {label}
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 h-9 px-4 cursor-pointer"
          >
            <Heading size={16} />{" "}
            <span className="hidden sm:inline">Headings</span>
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
              >
                <span className="flex items-center gap-2">
                  <Icon size={16} /> {label}
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* link */}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 h-9 px-4 cursor-pointer"
          >
            <Link size={16} /> <span className="hidden sm:inline">Link</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          <DropdownMenuItem asChild>
            <button
              onClick={setLink}
              className="cursor-pointer w-full text-left"
            >
              Set Link
            </button>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <button
              onClick={() => editor?.chain().focus().unsetLink().run()}
              className="cursor-pointer w-full text-left"
            >
              Unset Link
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Toolbar;

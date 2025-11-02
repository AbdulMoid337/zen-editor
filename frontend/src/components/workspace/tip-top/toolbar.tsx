import { useState } from "react";
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
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Heading, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
  Highlighter, Sparkles, Loader2,
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

interface ToolbarProps {
  editor: Editor | null;
  onToggle: (action: ToolbarAction) => void;
}

const Toolbar = ({ editor, onToggle }: ToolbarProps) => {
  const platform = getPlatform();
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  const alignActions = TOOLBAR_ACTIONS.filter(a =>
    ["alignLeft", "alignCenter", "alignRight", "alignJustify"].includes(a.key)
  );

  const headingActions = TOOLBAR_ACTIONS.filter(a =>
    ["heading1", "heading2", "heading3", "heading4", "heading5", "heading6"].includes(a.key)
  );

  const baseActions = TOOLBAR_ACTIONS.filter(
    a => ![...alignActions, ...headingActions].some(x => x.key === a.key) && a.key !== "highlight"
  );

  const highlightAction = TOOLBAR_ACTIONS.find(a => a.key === "highlight");

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

  const handleAICommand = async (command: "summarize" | "expand" | "improve") => {
    const text = getSelectedText();
    if (!text.trim()) return alert("Please select some text to use AI commands");

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
    <div className="flex sticky top-0 z-50 bg-background flex-wrap gap-2 border-b pb-4 mb-6 border-slate-200 dark:border-slate-700">
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 h-9 px-4 bg-purple-100 dark:bg-purple-300 text-black hover:bg-purple-200"
            disabled={isProcessingAI}
          >
            {isProcessingAI ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            <span>{isProcessingAI ? "Processing..." : "AI"}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          {["summarize", "expand", "improve"].map(cmd => (
            <DropdownMenuItem key={cmd} disabled={isProcessingAI} onClick={() => handleAICommand(cmd as any)}>
              <span className="flex items-center gap-2">
                <Sparkles size={16} /> {cmd.charAt(0).toUpperCase() + cmd.slice(1)}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {baseActions.map(({ key, label, icon: Icon, shortcut, activeClass, inactiveClass }) => {
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
              "flex items-center justify-center rounded-md h-9 px-4 text-sm font-medium"
            )}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
          </Button>
        );
      })}

      {highlightAction && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              title={`${highlightAction.label} (${highlightAction.shortcut[platform]})`}
              className={cn(
                editor?.isActive("highlight") ? highlightAction.activeClass : highlightAction.inactiveClass,
                "flex items-center justify-center rounded-md h-9 px-4 text-sm font-medium"
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
                    "w-8 h-8 p-0 rounded-md border-2 transition-all hover:scale-110",
                    editor?.isActive("highlight", { color })
                      ? "border-slate-900 dark:border-slate-100 shadow-md"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 h-9 px-4">
            <AlignCenter size={16} /> <span className="hidden sm:inline">Align</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {alignActions.map(({ key, label }) => {
            const Icon =
              key === "alignLeft" ? AlignLeft :
              key === "alignCenter" ? AlignCenter :
              key === "alignRight" ? AlignRight : AlignJustify;
            return (
              <DropdownMenuItem key={key} onClick={() => onToggle(key as ToolbarAction)}>
                <span className="flex items-center gap-2"><Icon size={16} /> {label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 h-9 px-4">
            <Heading size={16} /> <span className="hidden sm:inline">Headings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {headingActions.map(({ key, label }) => {
            const Icon =
              key === "heading1" ? Heading1 :
              key === "heading2" ? Heading2 :
              key === "heading3" ? Heading3 :
              key === "heading4" ? Heading4 :
              key === "heading5" ? Heading5 : Heading6;
            return (
              <DropdownMenuItem key={key} onClick={() => onToggle(key as ToolbarAction)}>
                <span className="flex items-center gap-2"><Icon size={16} /> {label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Toolbar;

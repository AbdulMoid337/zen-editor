import {
  getPlatform,
  TOOLBAR_ACTIONS,
  type ToolbarAction,
} from "./toolbar_actions";
import { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
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
  Heading, 
  Heading1, 
  Heading6, 
  Heading4, 
  Heading3, 
  Heading2, 
  Heading5, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Highlighter,
} from "lucide-react";

// Define highlight colors
const HIGHLIGHT_COLORS = [
  {
    name: "Default",
    color: "#ffeb3b",
    bgColor: "bg-yellow-300",
  },
  {
    name: "Green",
    color: "#8ce99a",
    bgColor: "bg-green-300",
  },
  {
    name: "Blue",
    color: "#74c0fc",
    bgColor: "bg-blue-300",
  },
  {
    name: "Red",
    color: "#ffa8a8",
    bgColor: "bg-red-300",
  },
  {
    name: "Purple",
    color: "#b197fc",
    bgColor: "bg-purple-300",
  },
  {
    name: "Orange",
    color: "#ffc078",
    bgColor: "bg-orange-300",
  },
];

interface ToolbarProps {
  editor: Editor | null;
  onToggle: (action: ToolbarAction) => void;
}

const Toolbar = ({ editor, onToggle }: ToolbarProps) => {
  const platform = getPlatform();
  
  const alignActions = TOOLBAR_ACTIONS.filter((a) =>
    ["alignLeft", "alignCenter", "alignRight", "alignJustify"].includes(a.key)
  );
  
  const headingActions = TOOLBAR_ACTIONS.filter((a) =>
    [
      "heading1",
      "heading2", 
      "heading3",
      "heading4",
      "heading5",
      "heading6",
    ].includes(a.key)
  );
  
  // Filter out highlight from base actions since we'll handle it separately
  const baseActions = TOOLBAR_ACTIONS.filter(
    (a) =>
      !alignActions.some((x) => x.key === a.key) &&
      !headingActions.some((x) => x.key === a.key) &&
      a.key !== "highlight"
  );

  // Get the highlight action separately
  const highlightAction = TOOLBAR_ACTIONS.find((a) => a.key === "highlight");

  const handleHighlightColor = (color: string) => {
    if (!editor) return;
    editor.chain().focus().toggleHighlight({ color }).run();
  };

  return (
    <div className="flex sticky top-0 z-50 bg-background flex-wrap gap-2 border-b dark:border-slate-700 border-slate-200 pb-4 mb-6">
      {baseActions.map(
        ({ key, label, icon: Icon, shortcut, activeClass, inactiveClass }) => {
          const isActive = editor?.isActive(key) ?? false;
          const hotKey = shortcut[platform];

          return (
            <Button
              key={key}
              onClick={() => onToggle(key)}
              variant="ghost"
              className={cn(
                isActive ? activeClass : inactiveClass,
                `flex rounded-md justify-center shadow-xs items-center whitespace-nowrap text-sm font-medium h-9 px-4 py-2 has-[>svg]:px-3`
              )}
              title={`${label} (${hotKey})`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          );
        }
      )}

      {/* Highlight Color Picker */}
      {highlightAction && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                editor?.isActive("highlight") 
                  ? highlightAction.activeClass 
                  : highlightAction.inactiveClass,
                `flex rounded-md justify-center shadow-xs items-center whitespace-nowrap text-sm font-medium h-9 px-4 py-2 has-[>svg]:px-3`
              )}
              title={`${highlightAction.label} (${highlightAction.shortcut[platform]})`}
            >
              <Highlighter size={16} />
              <span className="hidden sm:inline">{highlightAction.label}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="flex flex-col gap-1">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                Highlight Colors
              </div>
              <div className="grid grid-cols-3 gap-1">
                {HIGHLIGHT_COLORS.map((colorOption) => (
                  <Button
                    key={colorOption.name}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-8 h-8 p-0 rounded-md border-2 transition-all hover:scale-110",
                      editor?.isActive("highlight", { color: colorOption.color })
                        ? "border-slate-900 dark:border-slate-100 shadow-md"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    )}
                    style={{ backgroundColor: colorOption.color }}
                    onClick={() => handleHighlightColor(colorOption.color)}
                    title={`${colorOption.name} highlight`}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Align Actions Dropdown */}
      {alignActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex rounded-md justify-center shadow-xs items-center whitespace-nowrap text-sm font-medium h-9 px-4 py-2"
            >
              <AlignCenter size={16} />
              <span className="hidden sm:inline">Align</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {alignActions.map(({ key, label }) => (
              <DropdownMenuItem key={key} onClick={() => onToggle(key as ToolbarAction)}>
                <span className="flex items-center gap-2">
                  {key === "alignLeft" && <AlignLeft size={16} />}
                  {key === "alignCenter" && <AlignCenter size={16} />}
                  {key === "alignRight" && <AlignRight size={16} />}
                  {key === "alignJustify" && <AlignJustify size={16} />}
                  <span>{label}</span>
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Headings Dropdown */}
      {headingActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex rounded-md justify-center shadow-xs items-center whitespace-nowrap text-sm font-medium h-9 px-4 py-2"
            >
              <Heading size={16} />
              <span className="hidden sm:inline">Headings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {headingActions.map(({ key, label }) => (
              <DropdownMenuItem key={key} onClick={() => onToggle(key as ToolbarAction)}>
                <span className="flex items-center gap-2">
                  {key === "heading1" && <Heading1 size={16} />}
                  {key === "heading2" && <Heading2 size={16} />}
                  {key === "heading3" && <Heading3 size={16} />}
                  {key === "heading4" && <Heading4 size={16} />}
                  {key === "heading5" && <Heading5 size={16} />}
                  {key === "heading6" && <Heading6 size={16} />}
                  <span>{label}</span>
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default Toolbar;

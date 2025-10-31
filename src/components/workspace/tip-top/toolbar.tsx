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
import { AlignLeft, Heading, Heading1, Heading6, Heading4, Heading3, Heading2, Heading5, AlignCenter, AlignRight, AlignJustify } from "lucide-react";

const Toolbar = ({
  editor,
  onToggle,
}: {
  editor: Editor | null;
  onToggle: (action: ToolbarAction) => void;
}) => {
  const platform = getPlatform();
  const alignActions = TOOLBAR_ACTIONS.filter((a) =>
    ["alignLeft", "alignCenter", "alignRight", "alignJustify"].includes(
      a.key
    )
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
  const baseActions = TOOLBAR_ACTIONS.filter(
    (a) =>
      !alignActions.some((x) => x.key === a.key) &&
      !headingActions.some((x) => x.key === a.key)
  );

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

      {alignActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              
              className="flex rounded-md justify-center shadow-xs items-center whitespace-nowrap text-sm font-medium h-9 px-4 py-2"
            >
              <AlignCenter size={16} />
              <span className="hidden sm:inline">Align</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {alignActions.map(({ key, label }) => (
              <DropdownMenuItem key={key} onClick={() => onToggle(key as ToolbarAction)}>
                <span className="flex items-center gap-1">
                  {key === "alignLeft" && <AlignLeft size={16} />}
                  {key === "alignCenter" && <AlignCenter size={16} />}
                  {key === "alignRight" && <AlignRight size={16} />}
                  {key === "alignJustify" && <AlignJustify size={16} />}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {headingActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="destructive"
              className="flex rounded-md justify-center shadow-xs items-center whitespace-nowrap text-sm font-medium h-9 px-4 py-2"
            >
              <Heading size={16} />
              <span className="hidden sm:inline">Headings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {headingActions.map(({ key, label }) => (
              
              <DropdownMenuItem key={key} onClick={() => onToggle(key as ToolbarAction)}>
                <span className="flex items-center gap-1">
                  {key === "heading1" && <Heading1 size={16} />}
                  {key === "heading2" && <Heading2 size={16} />}
                  {key === "heading3" && <Heading3 size={16} />}
                  {key === "heading4" && <Heading4 size={16} />}
                  {key === "heading5" && <Heading5 size={16} />}
                  {key === "heading6" && <Heading6 size={16} />}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default Toolbar;
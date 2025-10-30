import {
  getPlatform,
  TOOLBAR_ACTIONS,
  type ToolbarAction,
} from "./toolbar_actions";
import { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";

const Toolbar = ({
  editor,
  onToggle,
}: {
  editor: Editor | null;
  onToggle: (action: ToolbarAction) => void;
}) => {
  const platform = getPlatform();

  return (
    <div className="flex sticky top-0 z-50 bg-background flex-wrap gap-2 border-b dark:border-slate-700 border-slate-200 pb-4 mb-6">
      {TOOLBAR_ACTIONS.map(
        ({ key, label, icon: Icon, shortcut, activeClass, inactiveClass }) => {
          const isActive = editor?.isActive(key) ?? false;
          const hotKey = shortcut[platform];

          return (
            <button
              key={key}
              onClick={() => onToggle(key)}
              className={cn(
                isActive ? activeClass : inactiveClass,
                `flex rounded-md justify-center shadow-xs items-center whitespace-nowrap text-sm font-medium h-9 px-4 py-2 has-[>svg]:px-3`
              )}
              title={`${label} (${hotKey})`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        }
      )}
    </div>
  );
};

export default Toolbar;

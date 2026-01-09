import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Editor } from "@tiptap/react";
import { SLASH_COMMANDS, type SlashCommand } from "./slash-commands";
import { cn } from "@/lib/utils";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Text,
  CheckSquare,
  Quote,
  Minus,
  Search,
  Code2,
} from "lucide-react";

type Position = { top: number; left: number };

interface SlashCommandDropdownProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
  position: Position;
}

const PANEL_WIDTH = 360;
const PANEL_MAX_HEIGHT = 320;
const EDGE_PADDING = 10;

export default function SlashCommandDropdown({
  editor,
  isOpen,
  onClose,
  position,
}: SlashCommandDropdownProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [adjustedPosition, setAdjustedPosition] = useState<Position>(position);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const filteredCommands = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return SLASH_COMMANDS;
    return SLASH_COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.key.toLowerCase().includes(query),
    );
  }, [searchValue]);

  const calculatePosition = useCallback((): Position => {
    const dropdown = dropdownRef.current;
    if (!dropdown || !editor) return position;

    const editorEl = editor.view.dom.parentElement;
    if (!editorEl) return position;

    const editorRect = editorEl.getBoundingClientRect();
    const panelWidth = PANEL_WIDTH;
    const panelHeight = Math.min(PANEL_MAX_HEIGHT, 400);

    let left = position.left;
    let top = position.top;

    if (left + panelWidth > editorRect.width - EDGE_PADDING) {
      left = Math.max(
        EDGE_PADDING,
        editorRect.width - panelWidth - EDGE_PADDING,
      );
    } else {
      left = Math.max(EDGE_PADDING, left);
    }

    const spaceBelow = editorRect.height - position.top;
    const needsFlip =
      position.top + panelHeight > editorRect.height - 50 && spaceBelow < 240;

    if (needsFlip) {
      top = Math.max(EDGE_PADDING, position.top - panelHeight - 24);
    }

    return { top, left };
  }, [editor, position]);

  const executeCommand = useCallback(
    (cmd: SlashCommand) => {
      if (!editor) return;

      const chain = editor.chain().focus();
      const { state } = editor;
      const { selection } = state;

      let slashPos = -1;
      for (
        let i = selection.from - 1;
        i >= Math.max(0, selection.from - 30);
        i--
      ) {
        const char = state.doc.textBetween(i, i + 1);
        if (char === "/") {
          slashPos = i;
          break;
        }
        if (char === " " || char === "\n") break;
      }

      if (slashPos !== -1)
        chain.deleteRange({ from: slashPos, to: selection.from });

      switch (cmd.command) {
        case "paragraph":
          chain.setParagraph().run();
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
        case "blockquote":
          chain.toggleBlockquote().run();
          break;
        case "bulletList":
          chain.toggleBulletList().run();
          break;
        case "orderedList":
          chain.toggleOrderedList().run();
          break;
        case "taskList":
          chain.toggleTaskList().run();
          break;
        case "codeBlock":
          chain.toggleCodeBlock().run();
          break;
        default:
          break;
      }

      onClose();
    },
    [editor, onClose],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;
      const { key } = event;

      if (
        [
          "ArrowDown",
          "ArrowUp",
          "Enter",
          "Escape",
          "Tab",
          "Backspace",
        ].includes(key)
      ) {
        event.preventDefault();
      }

      if (key === "ArrowDown") {
        setSelectedIndex((i) => (i < filteredCommands.length - 1 ? i + 1 : 0));
      } else if (key === "ArrowUp") {
        setSelectedIndex((i) => (i > 0 ? i - 1 : filteredCommands.length - 1));
      } else if (key === "Enter") {
        const current = filteredCommands[selectedIndex];
        if (current) executeCommand(current);
      } else if (key === "Escape") {
        onClose();
      } else if (key === "Backspace" && searchValue === "") {
        onClose();
      }
    },
    [
      isOpen,
      filteredCommands,
      selectedIndex,
      executeCommand,
      onClose,
      searchValue,
    ],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onKeyDown, onClose]);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      setSearchValue("");
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setAdjustedPosition(calculatePosition());
  }, [isOpen, position, calculatePosition]);

  useEffect(() => {
    if (!isOpen || !dropdownRef.current) return;
    const el = dropdownRef.current.querySelector<HTMLElement>(
      `[data-index="${selectedIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedIndex, isOpen]);

  // const clearSearch = useCallback(() => {
  //   setSearchValue("");
  //   setSelectedIndex(0);
  //   searchInputRef.current?.focus();
  // }, []);

  const getIcon = (key: string) => {
    switch (key) {
      case "paragraph": return <Text size={18} />;
      case "heading1": return <Heading1 size={18} />;
      case "heading2": return <Heading2 size={18} />;
      case "heading3": return <Heading3 size={18} />;
      case "bulletList": return <List size={18} />;
      case "orderedList": return <ListOrdered size={18} />;
      case "taskList": return <CheckSquare size={18} />;
      case "blockquote": return <Quote size={18} />;
      case "codeBlock": return <Code2 size={18} />;
      case "horizontalRule": return <Minus size={18} />;
      default: return <Text size={18} />;
    }
  };

  if (!isOpen) return null;

  const activeId =
    filteredCommands[selectedIndex] && `slash-option-${selectedIndex}`;

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: adjustedPosition.top,
        left: adjustedPosition.left,
        width: 320,
      }}
      className={cn(
        "z-50 overflow-hidden rounded-2xl border border-border/40 bg-background/90 shadow-2xl backdrop-blur-xl",
        "ring-1 ring-black/5 dark:ring-white/10",
        "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200 ease-out",
      )}
      role="dialog"
      aria-label="Slash commands"
    >
      <div className="flex items-center gap-2 p-3 pb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
          <input
            ref={searchInputRef}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder='Type to search...'
            className={cn(
              "w-full rounded-xl border border-border/50 bg-muted/40 pl-9 pr-8 py-2.5 text-sm outline-none transition-all",
              "placeholder:text-muted-foreground/60 focus:bg-background focus:ring-2 focus:ring-primary/20",
            )}
            aria-autocomplete="list"
            aria-controls="slash-listbox"
            aria-activedescendant={activeId ?? undefined}
          />
        </div>
      </div>

      <div className="h-[1px] bg-border/40 mx-3 mb-1" />

      <div
        id="slash-listbox"
        role="listbox"
        className="max-h-[320px] overflow-y-auto p-2 scrollbar-thin scrollbar-track-transparent hover:scrollbar-thumb-muted"
      >
        {filteredCommands.length > 0 ? (
          <ul className="space-y-1">
            {filteredCommands.map((cmd, idx) => {
              const isActive = idx === selectedIndex;
              return (
                <li key={cmd.key} role="none">
                  <button
                    role="option"
                    id={`slash-option-${idx}`}
                    data-index={idx}
                    aria-selected={isActive}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onMouseDown={(e: ReactMouseEvent) => {
                      e.preventDefault();
                      executeCommand(cmd);
                    }}
                    className={cn(
                      "group w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left cursor-pointer transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.01]"
                        : "hover:bg-muted/60 hover:text-foreground text-muted-foreground",
                    )}
                  >
                    <div className={cn(
                      "grid place-items-center h-8 w-8 rounded-lg shrink-0 transition-colors",
                      isActive ? "bg-white/20 text-white" : "bg-muted text-foreground group-hover:bg-background group-hover:shadow-sm"
                    )}>
                      {getIcon(cmd.key)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className={cn("font-semibold text-sm", isActive ? "text-white" : "text-foreground")}>
                        {cmd.label}
                      </div>
                      <p className={cn("text-xs truncate", isActive ? "text-white/80" : "text-muted-foreground")}>
                        {cmd.description}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <p>No matching commands</p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              Try searching for "heading", "list", etc.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

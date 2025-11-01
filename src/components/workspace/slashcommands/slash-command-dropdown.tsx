import React, { useState, useEffect, useRef, useCallback } from "react";
import { Editor } from "@tiptap/react";
import { SLASH_COMMANDS, type SlashCommand } from "./slash-commands";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

interface SlashCommandDropdownProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
}

const SlashCommandDropdown: React.FC<SlashCommandDropdownProps> = ({
  editor,
  isOpen,
  onClose,
  position,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState(SLASH_COMMANDS);
  const [searchValue, setSearchValue] = useState("");
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const calculatePosition = useCallback(() => {
    if (!dropdownRef.current || !editor) return position;

    const dropdown = dropdownRef.current;
    const editorElement = editor.view.dom.parentElement;
    
    if (!editorElement) return position;

    const editorRect = editorElement.getBoundingClientRect();
    const dropdownRect = dropdown.getBoundingClientRect();
    
    let newTop = position.top;
    let newLeft = position.left;

    if (position.left + dropdownRect.width > editorRect.width) {
      newLeft = editorRect.width - dropdownRect.width - 10;
    }

    if (newLeft < 10) {
      newLeft = 10;
    }

    if (position.top + dropdownRect.height > editorRect.height - 50) {
      newTop = position.top - dropdownRect.height - 30;
    }

    if (newTop < 10) {
      newTop = 10;
    }

    return { top: newTop, left: newLeft };
  }, [position, editor]);

  const executeCommand = useCallback(
    (command: SlashCommand) => {
      const chain = editor.chain().focus();
      
      const { state } = editor;
      const { selection } = state;
      
      let slashPos = -1;
      for (let i = selection.from - 1; i >= Math.max(0, selection.from - 20); i--) {
        const char = state.doc.textBetween(i, i + 1);
        if (char === "/") {
          slashPos = i;
          break;
        } else if (char === " " || char === "\n") {
          break;
        }
      }

      if (slashPos !== -1) {
        chain.deleteRange({
          from: slashPos,
          to: selection.from,
        });
      }

      switch (command.command) {
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
        // case "link":
        //   chain.focus().extendMarkRange('link').setLink
        //   break;
        default:
          break;
      }
      
      onClose();
    },
    [editor, onClose]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case "Enter":
          event.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;
        case "Escape":
          event.preventDefault();
          onClose();
          break;
        case "Backspace":
          if (searchValue === "") {
            event.preventDefault();
            onClose();
          }
          break;
        default:
          break;
      }
    },
    [isOpen, selectedIndex, filteredCommands, executeCommand, onClose, searchValue]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    
    if (value.trim() === "") {
      setFilteredCommands(SLASH_COMMANDS);
    } else {
      const filtered = SLASH_COMMANDS.filter(
        (command) =>
          command.label.toLowerCase().includes(value.toLowerCase()) ||
          command.description.toLowerCase().includes(value.toLowerCase()) ||
          command.key.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCommands(filtered);
    }
    setSelectedIndex(0);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchValue("");
    setFilteredCommands(SLASH_COMMANDS);
    setSelectedIndex(0);
    searchInputRef.current?.focus();
  }, []);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, handleKeyDown, handleClickOutside]);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      setFilteredCommands(SLASH_COMMANDS);
      setSearchValue("");
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const newPosition = calculatePosition();
      setAdjustedPosition(newPosition);
    }
  }, [isOpen, position, calculatePosition]);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const selectedElement = dropdownRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      ) as HTMLElement;
      
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex, isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      <div
        ref={dropdownRef}
        className="absolute z-50 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm"
        style={{
          top: adjustedPosition.top,
          left: adjustedPosition.left,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div className="p-2">
          <div className="relative mb-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search blocks..."
              value={searchValue}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100"
            />
            {searchValue && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
            {filteredCommands.length > 0 ? (
              <div className="space-y-1">
                {filteredCommands.map((command, index) => {
                  return (
                    <button
                      key={command.key}
                      data-index={index}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 text-left text-sm rounded-lg transition-all duration-150",
                        selectedIndex === index
                          ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 shadow-sm"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent"
                      )}
                      onClick={() => executeCommand(command)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "font-medium truncate",
                          selectedIndex === index
                            ? "text-slate-900 dark:text-slate-100"
                            : "text-slate-700 dark:text-slate-200"
                        )}>
                          {command.label}
                        </div>
                        <div className={cn(
                          "text-xs truncate mt-0.5",
                          selectedIndex === index
                            ? "text-slate-600 dark:text-slate-400"
                            : "text-slate-500 dark:text-slate-500"
                        )}>
                          {command.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="text-slate-400 dark:text-slate-500 text-sm">
                  No blocks found
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-600 mt-1">
                  Try searching for "heading", "list", or "code"
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SlashCommandDropdown;

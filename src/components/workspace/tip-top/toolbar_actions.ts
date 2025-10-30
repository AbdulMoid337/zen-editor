import {
  Bold,
  Highlighter,
  Italic,
  Quote,
  Underline,
  List,
  ListOrdered,
  Code2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";

export const TOOLBAR_ACTIONS = [
  {
    key: "bold",
    label: "Bold",
    icon: Bold,
    shortcut: {
      mac: "Cmd+B",
      win: "Ctrl+B",
      linux: "Ctrl+B",
    },
    activeClass: "bg-slate-900 text-white",
    inactiveClass:
      "bg-slate-100 dark:bg-slate-300 text-black hover:bg-slate-200",
  },
  {
    key: "italic",
    label: "Italic",
    icon: Italic,
    shortcut: {
      mac: "Cmd+I",
      win: "Ctrl+I",
      linux: "Ctrl+I",
    },
    activeClass: "bg-slate-900 text-white",
    inactiveClass:
      "bg-slate-100 dark:bg-slate-300 text-black hover:bg-slate-200",
  },
  {
    key: "underline",
    label: "Underline",
    icon: Underline,
    shortcut: {
      mac: "Cmd+U",
      win: "Ctrl+U",
      linux: "Ctrl+U",
    },
    activeClass: "bg-slate-900 text-white",
    inactiveClass:
      "bg-slate-100 dark:bg-slate-300 text-black hover:bg-slate-200",
  },
  {
    key: "highlight",
    label: "Highlight",
    icon: Highlighter,
    shortcut: {
      mac: "Cmd+Shift+H",
      win: "Ctrl+Shift+H",
      linux: "Ctrl+Shift+H",
    },
    activeClass: "bg-yellow-400 dark:text-black text-white",
    inactiveClass:
      "bg-yellow-100 dark:bg-yellow-300 text-black hover:bg-yellow-200",
  },
  {
    key: "blockquote",
    label: "Quote",
    icon: Quote,
    shortcut: {
      mac: "Cmd+Shift+B",
      win: "Ctrl+Shift+B",
      linux: "Ctrl+Shift+B",
    },
    activeClass: "bg-indigo-900 text-white",
    inactiveClass:
      "bg-indigo-100 dark:bg-indigo-300 text-black hover:bg-indigo-200",
  },
  {
    key: "code",
    label: "Code",
    icon: Code2,
    shortcut: {
      mac: "Cmd+E",
      win: "Ctrl+E",
      linux: "Ctrl+E",
    },
    activeClass: "bg-purple-900 text-white",
    inactiveClass:
      "bg-purple-100 dark:bg-purple-300 text-black hover:bg-purple-200",
  },
  {
    key: "codeBlock",
    label: "Code Block",
    icon: Code2,
    shortcut: {
      mac: "Cmd+Shift+C",
      win: "Ctrl+Shift+C",
      linux: "Ctrl+Shift+C",
    },
    activeClass: "bg-purple-900 text-white",
    inactiveClass:
      "bg-purple-100 dark:bg-purple-300 text-black hover:bg-purple-200",
  },

  {
    key: "bulletList",
    label: "Bullet List",
    icon: List,
    shortcut: {
      mac: "Cmd+Shift+8",
      win: "Ctrl+Shift+8",
      linux: "Ctrl+Shift+8",
    },
    activeClass: "bg-slate-900 text-white",
    inactiveClass:
      "bg-slate-100 dark:bg-slate-300 text-black hover:bg-slate-200",
  },
  {
    key: "orderedList",
    label: "Ordered List",
    icon: ListOrdered,
    shortcut: {
      mac: "Cmd+Shift+7",
      win: "Ctrl+Shift+7",
      linux: "Ctrl+Shift+7",
    },
    activeClass: "bg-slate-900 text-white",
    inactiveClass:
      "bg-slate-100 dark:bg-slate-300 text-black hover:bg-slate-200",
  },
  {
    key: "alignLeft",
    label: "Align Left",
    icon: AlignLeft,
    shortcut: {
      mac: "Cmd+Shift+L",
      win: "Ctrl+Shift+L",
      linux: "Ctrl+Shift+L",
    },
    activeClass: "bg-slate-900 text-white",
    inactiveClass:
      "bg-slate-100 dark:bg-slate-300 text-black hover:bg-slate-200",
  },
  {
    key: "alignCenter",
    label: "Align Center",
    icon: AlignCenter,
    shortcut: {
      mac: "Cmd+Shift+E",
      win: "Ctrl+Shift+E",
      linux: "Ctrl+Shift+E",
    },
    activeClass: "bg-slate-900 text-white",
    inactiveClass:
      "bg-slate-100 dark:bg-slate-300 text-black hover:bg-slate-200",
  },
  {
    key: "alignRight",
    label: "Align Right",
    icon: AlignRight,
    shortcut: {
      mac: "Cmd+Shift+R",
      win: "Ctrl+Shift+R",
      linux: "Ctrl+Shift+R",
    },
    activeClass: "bg-slate-900 text-white",
    inactiveClass:
      "bg-slate-100 dark:bg-slate-300 text-black hover:bg-slate-200",
  },
  {
    key: "alignJustify",
    label: "Justify",
    icon: AlignJustify,
    shortcut: {
      mac: "Cmd+Shift+J",
      win: "Ctrl+Shift+J",
      linux: "Ctrl+Shift+J",
    },
    activeClass: "bg-slate-900 text-white",
    inactiveClass:
      "bg-slate-100 dark:bg-slate-300 text-black hover:bg-slate-200",
  },
];

export type ToolbarAction = (typeof TOOLBAR_ACTIONS)[number]["key"];

export function getPlatform(): "mac" | "win" | "linux" {
  const platform = navigator.platform.toLowerCase();
  if (platform.includes("mac")) return "mac";
  if (platform.includes("linux")) return "linux";
  return "win";
}

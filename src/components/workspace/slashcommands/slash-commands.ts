
  export interface SlashCommand {
    key: string;
    label: string;
    description: string;
    command: string;
    category: "basic" | "heading" | "list" | "other";
  }
  
  export const SLASH_COMMANDS: SlashCommand[] = [
    {
      key: "text",
      label: "Text",
      description: "Start writing with plain text",
      command: "paragraph",
      category: "basic",
    },
    {
      key: "heading1",
      label: "Heading 1",
      description: "Big section heading",
      command: "heading1",
      category: "heading",
    },
    {
      key: "heading2",
      label: "Heading 2",
      description: "Medium section heading",
      command: "heading2",
      category: "heading",
    },
    {
      key: "heading3",
      label: "Heading 3",
      description: "Small section heading",
      command: "heading3",
      category: "heading",
    },
    {
      key: "heading4",
      label: "Heading 4",
      description: "Smaller section heading",
      command: "heading4",
      category: "heading",
    },
    {
      key: "heading5",
      label: "Heading 5",
      description: "Tiny section heading",
      command: "heading5",
      category: "heading",
    },
    {
      key: "heading6",
      label: "Heading 6",
      description: "Smallest section heading",
      command: "heading6",
      category: "heading",
    },
    {
      key: "quote",
      label: "Quote",
      description: "Capture a quote",
      command: "blockquote",
      category: "basic",
    },
    {
      key: "bulletList",
      label: "Bullet List",
      description: "Create a simple bullet list",
      command: "bulletList",
      category: "list",
    },
    {
      key: "orderedList",
      label: "Numbered List",
      description: "Create a list with numbering",
      command: "orderedList",
      category: "list",
    },
    {
      key: "todo",
      label: "To-do List",
      description: "Track tasks with a to-do list",
      command: "taskList",
      category: "list",
    },
    {
      key: "code",
      label: "Code",
      description: "Capture a code snippet",
      command: "codeBlock",
      category: "other",
    },
    {
      key: "link",
      label: "Link",
      description: "Add a link",
      command: "link",
      category: "other",
    }
  ];
  
  export type SlashCommandKey = typeof SLASH_COMMANDS[number]["key"];
  
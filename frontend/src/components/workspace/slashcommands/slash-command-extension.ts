import { Extension } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { Plugin } from "@tiptap/pm/state";

export interface SlashCommandOptions {
  onSlashCommand: (position: { top: number; left: number }) => void;
  onCloseSlashCommand: () => void;
}

export const SlashCommandExtension = Extension.create<SlashCommandOptions>({
  name: "slashCommand",

  addOptions() {
    return {
      onSlashCommand: () => {},
      onCloseSlashCommand: () => {},
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("slash-command"),
        props: {
          handleKeyDown: (view, event) => {
            const { state } = view;
            const { selection } = state;

            if (event.key === "/") {
              const textBefore = state.doc.textBetween(
                Math.max(0, selection.from - 20),
                selection.from
              );
              
              const isAtStartOrAfterSpace = 
                selection.from === 1 || 
                textBefore.endsWith(" ") || 
                textBefore.endsWith("\n");

              if (isAtStartOrAfterSpace) {
                setTimeout(() => {
                  const coords = view.coordsAtPos(selection.from);
                  const editorRect = view.dom.getBoundingClientRect();
                  
                  this.options.onSlashCommand({
                    top: coords.top - editorRect.top + 25,
                    left: coords.left - editorRect.left,
                  });
                }, 0);
              }
            }

            if (event.key === "Escape" || event.key === "Backspace") {
              this.options.onCloseSlashCommand();
            }

            return false;
          },

          handleTextInput: (view, from, _to, text) => {
            if (text !== "/" && text.toString().length > 0) {
              const { state } = view;
              const textBefore = state.doc.textBetween(from - 1, from);
              
              if (textBefore !== "/") {
                this.options.onCloseSlashCommand();
              }
            }
            return false;
          },

          handleDOMEvents: {
            keyup: (view, event) => {
              const { state } = view;
              const { selection } = state;
              
              if (event.key === "Backspace" || event.key === "Delete") {
                const textBefore = state.doc.textBetween(
                  Math.max(0, selection.from - 1),
                  selection.from
                );
                
                if (!textBefore.includes("/")) {
                  this.options.onCloseSlashCommand();
                }
              }
              
              return false;
            },
          },
        },
      }),
    ];
  },
});

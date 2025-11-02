import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export interface SlashCommandOptions {
  onSlashCommand: (pos: { top: number; left: number }) => void;
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
                Math.max(0, selection.from - 50),
                selection.from
              );

              const valid =
                selection.from <= 1 ||
                textBefore.endsWith(" ") ||
                textBefore.endsWith("\n") ||
                textBefore.match(/[\n]\s*$/) ||
                textBefore.match(/[.!?]\s*$/) ||
                textBefore.length === 0;

              if (valid) {
                setTimeout(() => {
                  try {
                    const coords = view.coordsAtPos(selection.from + 1);
                    const rect = view.dom.getBoundingClientRect();
                    this.options.onSlashCommand({
                      top: coords.top - rect.top + 25,
                      left: coords.left - rect.left,
                    });
                  } catch {
                    const coords = view.coordsAtPos(selection.from);
                    const rect = view.dom.getBoundingClientRect();
                    this.options.onSlashCommand({
                      top: coords.top - rect.top + 25,
                      left: coords.left - rect.left,
                    });
                  }
                }, 0);
              }
            }

            if (event.key === "Escape") {
              this.options.onCloseSlashCommand();
            }

            return false;
          },

          handleTextInput: (view, from, _to, text) => {
            if (text !== "/" && text.length > 0) {
              const textBefore = view.state.doc.textBetween(
                Math.max(0, from - 10),
                from
              );
              if (!textBefore.includes("/") || text.match(/[a-zA-Z0-9]/)) {
                const lastSlash = textBefore.lastIndexOf("/");
                if (lastSlash === -1 || from - lastSlash > 20) {
                  this.options.onCloseSlashCommand();
                }
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
                  Math.max(0, selection.from - 20),
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

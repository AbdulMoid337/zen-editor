import { Extension } from "@tiptap/core";
import { Plugin, PluginKey, Transaction, EditorState } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export interface GhostTextOptions {
  onSetGhostText?: (text: string) => void;
  onClearGhostText?: () => void;
}

export const GhostTextExtension = Extension.create<GhostTextOptions>({
  name: "ghostText",

  addOptions() {
    return {
      onSetGhostText: () => {},
      onClearGhostText: () => {},
    };
  },

  addStorage() {
    return {
      ghostText: null as string | null,
      ghostTextPosition: null as number | null,
    };
  },

  addCommands() {
    return {
      setGhostText:
        (text: string, position: number) =>
        ({ dispatch }: { dispatch?: (tr: Transaction) => void }) => {
          if (dispatch) {
            this.storage.ghostText = text;
            this.storage.ghostTextPosition = position;
            this.options.onSetGhostText?.(text);
            return true;
          }
          return false;
        },
      clearGhostText:
        () =>
        ({ dispatch }: { dispatch?: (tr: Transaction) => void }) => {
          if (dispatch) {
            this.storage.ghostText = null;
            this.storage.ghostTextPosition = null;
            this.options.onClearGhostText?.();
            return true;
          }
          return false;
        },
      acceptGhostText:
        () =>
        ({
          tr,
          dispatch,
          state,
        }: {
          tr: Transaction;
          dispatch?: (tr: Transaction) => void;
          state: EditorState;
        }) => {
          const { ghostText, ghostTextPosition } = this.storage;
          if (!ghostText || ghostTextPosition === null) {
            return false;
          }

          const { selection } = state;
          const currentPos = selection.from;

          // Only accept if cursor is at the ghost text position
          if (currentPos !== ghostTextPosition) {
            return false;
          }

          if (dispatch) {
            // Insert the ghost text at the current position
            tr.insertText(ghostText, currentPos);
            // Clear ghost text
            this.storage.ghostText = null;
            this.storage.ghostTextPosition = null;
            this.options.onClearGhostText?.();
            return true;
          }
          return false;
        },
    } as any;
  },

  addProseMirrorPlugins() {
    const extension = this;
    return [
      new Plugin({
        key: new PluginKey("ghost-text"),
        state: {
          init: () => DecorationSet.empty,
          apply: (tr, _set, _oldState, newState) => {
            const { ghostText, ghostTextPosition } = extension.storage;

            // Clear decorations if ghost text is cleared
            if (!ghostText || ghostTextPosition === null) {
              return DecorationSet.empty;
            }

            const { selection } = newState;
            const currentPos = selection.from;

            // Check if the transaction changed the document (user typed something)
            if (tr.docChanged) {
              // Check if text was inserted at or after the ghost text position
              const textAfterPosition = newState.doc.textBetween(
                ghostTextPosition,
                currentPos
              );

              // If there's text after the ghost text position, user is typing - clear ghost text
              if (textAfterPosition.length > 0) {
                extension.storage.ghostText = null;
                extension.storage.ghostTextPosition = null;
                extension.options.onClearGhostText?.();
                return DecorationSet.empty;
              }
            }

            // Only show ghost text if cursor is at the ghost text position
            if (currentPos !== ghostTextPosition) {
              return DecorationSet.empty;
            }

            // Create a widget decoration that shows the ghost text after the cursor
            const widgetDecoration = Decoration.widget(
              currentPos,
              () => {
                const span = document.createElement("span");
                span.className = "ghost-text";
                span.textContent = ghostText;
                span.style.pointerEvents = "none";
                span.style.userSelect = "none";
                return span;
              },
              {
                side: 1,
              }
            );

            return DecorationSet.create(newState.doc, [widgetDecoration]);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
          handleKeyDown: (view, event) => {
            const { ghostText, ghostTextPosition } = extension.storage;

            if (!ghostText || ghostTextPosition === null) {
              return false;
            }

            const { selection } = view.state;
            const currentPos = selection.from;

            // Only handle if cursor is at ghost text position
            if (currentPos !== ghostTextPosition) {
              return false;
            }

            // Handle Tab to accept ghost text
            if (event.key === "Tab") {
              event.preventDefault();
              const { state, dispatch } = view;

              // Insert ghost text
              const tr = state.tr.insertText(ghostText, currentPos);
              dispatch(tr);

              // Clear ghost text
              extension.storage.ghostText = null;
              extension.storage.ghostTextPosition = null;
              extension.options.onClearGhostText?.();

              return true;
            }

            // Handle Escape to dismiss ghost text
            if (event.key === "Escape") {
              event.preventDefault();
              extension.storage.ghostText = null;
              extension.storage.ghostTextPosition = null;
              extension.options.onClearGhostText?.();
              view.dispatch(view.state.tr);
              return true;
            }

            // For typing, let it proceed normally (decoration logic will clear ghost text)
            return false;
          },
          handleTextInput: (_view, from, _to, _text) => {
            const { ghostText, ghostTextPosition } = extension.storage;

            // If user types and there's ghost text, clear it
            if (ghostText && ghostTextPosition !== null && from === ghostTextPosition) {
              extension.storage.ghostText = null;
              extension.storage.ghostTextPosition = null;
              extension.options.onClearGhostText?.();
            }

            return false;
          },
        },
      }),
    ];
  },
});


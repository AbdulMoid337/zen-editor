import { Copy, EllipsisVertical, Pin, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useDataStore } from "@/stores/data.store";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ModeToggle } from "../theme.toggle";

const LeftSidebar = () => {
  const { notes, activeId, setActiveNote, deleteNote, createNote, togglePin } =
    useDataStore();

  const [search, setSearch] = useState("");

  const filtered = notes.filter((note) =>
    note.title && note.content.toLowerCase().includes(search.toLowerCase())
  );

  const pinnedNotes = filtered.filter((n) => n.pinned);
  const otherNotes = filtered.filter((n) => !n.pinned);

  function handleDuplicate(id: string) {
    const o = notes.find((n) => n.id == id);

    if (!o) return;

    const nId = uuidv4();
    const newNote = {
      ...o,
      id: nId,
      title: o.title + " (Copy)",
    };

    useDataStore.setState((state) => ({
      notes: [newNote, ...state.notes],
    }));
  }

  return (
    <div>
      <div className="flex items-center gap-x-2">
        <ModeToggle />
        <Input
          placeholder="Search notes ..."
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={createNote}>
          <Plus />
        </Button>
      </div>

      <div className="h-screen mt-4 w-full overflow-y-auto">
        <div className="flex flex-col pr-3 gap-y-2.5">
          {pinnedNotes.length > 0 && (
            <>
              <div className=" px-2">
                <div className=" flex ">
                  <Pin size={20} />
                  <span className="text-xs font-bold pl-1.5">Pinne</span>
                </div>
              </div>
              {pinnedNotes.map((note) => (
                <Card
                  key={note.id}
                  className={cn(
                    "shadow-xs relative w- gap-2 hover:border-black dark:hover:border-amber-800 h-[140px]",
                    {
                      "border-black dark:border-amber-900 bg-primary-foreground dark:bg-background":
                        activeId == note.id,
                    }
                  )}
                  onClick={() => setActiveNote(note.id)}
                >
                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {note.title || "Untitled"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="line-clamp-3 text-sm w-auto overflow-hidden text-muted-foreground pr-6"
                      dangerouslySetInnerHTML={{ __html: note.content }}
                    ></div>

                    <div className="absolute bottom-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="cursor-pointer" asChild>
                          <Button
                            size={`icon`}
                            variant={"outline"}
                            className="rounded-full"
                          >
                            <EllipsisVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(note.id)}
                          >
                            <Copy /> Duplicate
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => togglePin(note.id)}>
                            <Pin /> Unpin
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-destructive hover:!text-destructive/70"
                            onClick={() => deleteNote(note.id)}
                          >
                            <Trash2 className="hover:!text-destructive" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <hr className="border-t border-e-amber-100  my-2" />
            </>
          )}

          {otherNotes.map((note) => (
            <Card
              key={note.id}
              className={cn(
                "shadow-xs relative w- gap-2 hover:border-black dark:hover:border-amber-800 h-[140px]",
                {
                  "border-black dark:border-amber-900 bg-primary-foreground dark:bg-background":
                    activeId == note.id,
                }
              )}
              onClick={() => setActiveNote(note.id)}
            >
              <CardHeader>
                <CardTitle className="line-clamp-1">
                  {note.title || "Untitled"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="line-clamp-3 text-sm w-auto overflow-hidden text-muted-foreground pr-6"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                ></div>

                <div className="absolute bottom-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="cursor-pointer" asChild>
                      <Button
                        size={`icon`}
                        variant={"outline"}
                        className="rounded-full"
                      >
                        <EllipsisVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleDuplicate(note.id)}
                      >
                        <Copy /> Duplicate
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => togglePin(note.id)}>
                        <Pin /> Pin
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-destructive hover:!text-destructive/70"
                        onClick={() => deleteNote(note.id)}
                      >
                        <Trash2 className="hover:!text-destructive" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;

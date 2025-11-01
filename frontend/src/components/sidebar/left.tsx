import { Copy, EllipsisVertical, Plus, Trash2 } from "lucide-react";
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
  const { notes, activeId, setActiveNote, deleteNote, createNote } =
    useDataStore();

  const [search, setSearch] = useState("");

  const filteredData = notes.filter((note) =>
    note.title.toLowerCase().includes(search.toLowerCase())
  );

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

      <div className="h-[90vh] mt-4 w-full overflow-y-auto">
        <div className="flex flex-col pr-3 gap-y-3">
          {filteredData.map((note) => (
            <Card
              className={cn(
                "shadow-xs relative w- gap-2 hover:border-primary/40 h-[140px]",
                {
                  "border-primary/40 bg-primary-foreground dark:bg-background":
                    activeId == note.id,
                }
              )}
              key={note.id}
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

import {
  ChevronsLeft,
  ChevronsRight,
  Copy,
  EllipsisVertical,
  Pin,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useDataStore } from "@/stores/data.store";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { ModeToggle } from "../theme.toggle";

interface LeftSidebarProps {
  isMobile?: boolean;
}

const LeftSidebar = ({ isMobile = false }: LeftSidebarProps) => {
  const { notes, activeId, setActiveNote, deleteNote, createNote, togglePin } =
    useDataStore();

  const [search, setSearch] = useState("");
  const [width, setWidth] = useState(280);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const filtered = notes.filter((note) => {
    const s = search.toLowerCase();
    const titleMatch = (note.title || "").toLowerCase().includes(s);
    const contentMatch = (note.content || "").toLowerCase().includes(s);
    return titleMatch || contentMatch;
  });

  const pinnedNotes = filtered.filter((n) => n.pinned);
  const otherNotes = filtered.filter((n) => !n.pinned);

  function handleDuplicate(id: string) {
    const o = notes.find((n) => n.id === id);

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

  // Resizing Logic
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      let newWidth = e.clientX;
      if (newWidth < 240) newWidth = 240; // Min width
      if (newWidth > 600) newWidth = 600; // Max width
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (isCollapsed) {
      // Reset to default width when expanding if it was super small
      if (width < 240) setWidth(280);
    }
  };

  if (isCollapsed && !isMobile) {
    return (
      <div className="h-full border-r border-sidebar-border bg-sidebar/50 backdrop-blur w-[60px] flex flex-col items-center py-4 gap-4 transition-all duration-300">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className="h-8 w-8 cursor-pointer hover:bg-sidebar-accent"
        >
          <ChevronsRight className="h-5 w-5 text-muted-foreground" />
        </Button>
        <div className="flex flex-col gap-2 mt-2">
          <Button
            onClick={createNote}
            size="icon"
            variant="ghost"
            className="h-9 w-9 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-xl"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={sidebarRef}
      style={{ width: isMobile ? "100%" : isCollapsed ? 60 : width }}
      className={cn(
        "group/sidebar flex flex-col h-full max-h-screen bg-sidebar border-r border-sidebar-border transition-[width] duration-300 relative",
        isMobile && "w-full border-none",
        !isMobile && "shadow-xl"
      )}
    >
      {/* Resize Handle - Desktop Only */}
      {!isMobile && (
        <div
          className={cn(
            "absolute right-[-4px] top-0 h-full w-[8px] cursor-col-resize z-50 hover:bg-primary/20 transition-colors opacity-0 group-hover/sidebar:opacity-100",
            isResizing && "bg-primary/20 opacity-100"
          )}
          onMouseDown={startResizing}
        />
      )}

      {/* Header Section */}
      <div className="flex flex-col gap-4 p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight text-sidebar-foreground">
              Notes
            </span>
            <span className="bg-muted text-muted-foreground text-[10px] px-2 py-0.5 rounded-full font-medium">
              {notes.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCollapse}
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <ChevronsLeft className="h-5 w-5" />
              </Button>
            )}
            <ModeToggle />
            <Button
              onClick={createNote}
              size="icon"
              variant="ghost"
              className="h-8 w-8 cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-transform hover:scale-105 active:scale-95"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="relative group/search">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
          <Input
            placeholder="Search notes..."
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-muted/50 border-transparent focus:bg-background focus:border-input focus-visible:ring-1 transition-all"
          />
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex flex-col gap-1">
          {pinnedNotes.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 px-3 py-2 text-muted-foreground/90">
                <Pin className="h-3 w-3" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Pinned
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    activeId={activeId}
                    setActiveNote={setActiveNote}
                    handleDuplicate={handleDuplicate}
                    togglePin={togglePin}
                    deleteNote={deleteNote}
                  />
                ))}
              </div>
            </div>
          )}

          {pinnedNotes.length > 0 && otherNotes.length > 0 && (
            <div className="px-3 py-2 text-muted-foreground/90 text-xs font-bold uppercase tracking-wider">
              All Notes
            </div>
          )}

          <div className="flex flex-col gap-2">
            {otherNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                activeId={activeId}
                setActiveNote={setActiveNote}
                handleDuplicate={handleDuplicate}
                togglePin={togglePin}
                deleteNote={deleteNote}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const NoteCard = ({
  note,
  activeId,
  setActiveNote,
  handleDuplicate,
  togglePin,
  deleteNote,
}: {
  note: any;
  activeId: string | null;
  setActiveNote: (id: string) => void;
  handleDuplicate: (id: string) => void;
  togglePin: (id: string) => void;
  deleteNote: (id: string) => void;
}) => {
  const isActive = activeId === note.id;

  return (
    <div
      onClick={() => setActiveNote(note.id)}
      className={cn(
        "group relative flex flex-col gap-1 p-3 rounded-xl cursor-pointer border transition-all duration-200 ease-in-out",
        isActive
          ? "bg-sidebar-accent border-sidebar-border shadow-sm ring-1 ring-sidebar-border"
          : "bg-transparent border-transparent hover:bg-sidebar-accent/50 hover:border-sidebar-border/50"
      )}
    >
      <div className="flex justify-between items-start gap-2">
        <h3
          className={cn(
            "font-semibold text-sm line-clamp-1 transition-colors",
            isActive ? "text-sidebar-foreground" : "text-sidebar-foreground/80 group-hover:text-sidebar-foreground"
          )}
        >
          {note.title || "Untitled Note"}
        </h3>
      </div>

      <div
        className={cn(
          "text-xs line-clamp-2 h-8 leading-relaxed w-full pr-6 transition-colors",
          isActive ? "text-muted-foreground" : "text-muted-foreground/90 group-hover:text-muted-foreground"
        )}
        dangerouslySetInnerHTML={{ __html: note.content || "<p>No content</p>" }}
      />

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-lg hover:bg-background/80 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => handleDuplicate(note.id)} className="cursor-pointer">
              <Copy className="mr-2 h-4 w-4" />
              <span>Duplicate</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => togglePin(note.id)} className="cursor-pointer">
              <Pin className="mr-2 h-4 w-4" />
              <span>{note.pinned ? "Unpin" : "Pin"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => deleteNote(note.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default LeftSidebar;

import { Menu } from "lucide-react";
import LeftSidebar from "./components/sidebar/left";
import { Button } from "./components/ui/button";
import Workspace from "./components/workspace/workspace";
import { useDataStore } from "./stores/data.store";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Layout = () => {
  const { activeId, createNote, notes } = useDataStore();

  const note = notes.find((m) => m.id == activeId);

  return (
    <div className="flex flex-col min-h-screen md:flex-row bg-background">
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button
            className="fixed top-2 left-2 z-50"
            size={"icon"}
            variant={"secondary"}
          >
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Navigation Menu
            </SheetDescription>
          </SheetHeader>
          <LeftSidebar isMobile={true} />
        </SheetContent>
      </Sheet>

      <div className="hidden md:block sticky top-0 h-screen shrink-0 z-40 self-start bg-sidebar/50 backdrop-blur-xl">
        <LeftSidebar />
      </div>
      <div className="flex-1 min-w-0 md:border-r border-sidebar-border p-6">
        {note ? (
          <Workspace note={note} />
        ) : (
          <div className="flex h-[80vh] w-full justify-center items-center">
            <Button onClick={createNote}>Create new note</Button>
          </div>
        )}
      </div>
      <div className="hidden w-[20%] shrink-0 border-l border-sidebar-border md:block sticky top-0 h-screen bg-background/50 backdrop-blur-xl"></div>
    </div>
  );
};

export default Layout;

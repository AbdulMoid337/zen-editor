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
    <div className="md:grid h-screen md:grid-cols-5 flex flex-col">
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button className="fixed top-2 left-2 z-50" size={"icon"} variant={"secondary"}>
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>
              <LeftSidebar/>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <div className="border-r p-4 md:block hidden">
        <LeftSidebar />
      </div>
      <div className="col-span-3 p-6">
        {note ? (
          <Workspace note={note} />
        ) : (
          <div className="flex h-full w-full justify-center items-center">
            <Button onClick={createNote}>Create new note</Button>
          </div>
        )}
      </div>
      <div className="border-l md:block hidden"></div>
    </div>
  );
};

export default Layout;

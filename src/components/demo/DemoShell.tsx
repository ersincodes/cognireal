"use client";

import { Loader2 } from "lucide-react";
import { DemoProvider, useDemoContext } from "./DemoProvider";
import ChatSidebar from "./ChatSidebar";
import ChatPanel from "./ChatPanel";
import BookACallModal from "./BookACallModal";

const DemoShellInner = () => {
  const { isHydrated } = useDemoContext();

  if (!isHydrated) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-[#f7f8fc]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <>
      <div className="flex h-[100dvh] w-full overflow-hidden bg-white">
        <ChatSidebar />
        <ChatPanel />
      </div>
      <BookACallModal />
    </>
  );
};

const DemoShell = () => {
  return (
    <DemoProvider>
      <DemoShellInner />
    </DemoProvider>
  );
};

export default DemoShell;

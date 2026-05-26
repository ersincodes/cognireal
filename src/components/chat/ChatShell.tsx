"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ChatProvider } from "./ChatProvider";

const ChatWidget = dynamic(() => import("./ChatWidget"), {
  ssr: false,
  loading: () => null,
});

interface ChatShellProps {
  children: React.ReactNode;
}

const ChatShell = ({ children }: ChatShellProps) => {
  const pathname = usePathname();
  const isDemoPage = pathname?.startsWith("/demo");

  return (
    <ChatProvider>
      {children}
      {!isDemoPage && <ChatWidget />}
    </ChatProvider>
  );
};

export default ChatShell;

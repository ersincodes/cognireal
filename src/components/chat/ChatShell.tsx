"use client";

import dynamic from "next/dynamic";
import { ChatProvider } from "./ChatProvider";

const ChatWidget = dynamic(() => import("./ChatWidget"), {
  ssr: false,
  loading: () => null,
});

interface ChatShellProps {
  children: React.ReactNode;
}

const ChatShell = ({ children }: ChatShellProps) => {
  return (
    <ChatProvider>
      {children}
      <ChatWidget />
    </ChatProvider>
  );
};

export default ChatShell;

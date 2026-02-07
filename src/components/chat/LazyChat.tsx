"use client";

import dynamic from "next/dynamic";
import { ChatProvider } from "./ChatProvider";

// Lazy load the ChatWidget to avoid impacting initial bundle size
const ChatWidget = dynamic(() => import("./ChatWidget"), {
  ssr: false,
  loading: () => null,
});

const LazyChat = () => {
  return (
    <ChatProvider>
      <ChatWidget />
    </ChatProvider>
  );
};

export default LazyChat;

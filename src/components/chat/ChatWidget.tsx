"use client";

import { useChatContext } from "./ChatProvider";
import ChatWindow from "./ChatWindow";

const ChatWidget = () => {
  const {
    messages,
    isOpen,
    isLoading,
    error,
    documentAttachment,
    isParsingDocument,
    closeChat,
    sendMessage,
    clearChat,
    setFeedback,
    attachDocument,
    clearDocument,
  } = useChatContext();

  return (
    <ChatWindow
      isOpen={isOpen}
      messages={messages}
      isLoading={isLoading}
      error={error}
      documentAttachment={documentAttachment}
      isParsingDocument={isParsingDocument}
      onClose={closeChat}
      onSendMessage={sendMessage}
      onClearChat={clearChat}
      onFeedback={setFeedback}
      onAttachDocument={attachDocument}
      onClearDocument={clearDocument}
    />
  );
};

export default ChatWidget;

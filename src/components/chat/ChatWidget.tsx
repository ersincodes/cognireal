"use client";

import { useChatContext } from "./ChatProvider";
import ChatButton from "./ChatButton";
import ChatWindow from "./ChatWindow";

const ChatWidget = () => {
  const {
    messages,
    isOpen,
    isLoading,
    error,
    toggleChat,
    closeChat,
    sendMessage,
    clearChat,
    setFeedback,
  } = useChatContext();

  return (
    <>
      <ChatWindow
        isOpen={isOpen}
        messages={messages}
        isLoading={isLoading}
        error={error}
        onClose={closeChat}
        onSendMessage={sendMessage}
        onClearChat={clearChat}
        onFeedback={setFeedback}
      />
      <ChatButton isOpen={isOpen} onClick={toggleChat} />
    </>
  );
};

export default ChatWidget;

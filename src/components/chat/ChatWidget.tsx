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
    wizardState,
    toggleChat,
    closeChat,
    sendMessage,
    clearChat,
    setFeedback,
    answerWizardQuestion,
    resetWizard,
  } = useChatContext();

  return (
    <>
      <ChatWindow
        isOpen={isOpen}
        messages={messages}
        isLoading={isLoading}
        error={error}
        wizardState={wizardState}
        onClose={closeChat}
        onSendMessage={sendMessage}
        onClearChat={clearChat}
        onFeedback={setFeedback}
        onAnswerWizard={answerWizardQuestion}
        onResetWizard={resetWizard}
      />
      <ChatButton isOpen={isOpen} onClick={toggleChat} />
    </>
  );
};

export default ChatWidget;

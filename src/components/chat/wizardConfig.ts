/**
 * Re-exports wizard configuration from the shared lib.
 * This file maintains backward compatibility with existing component imports.
 */
export {
  WIZARD_QUESTIONS,
  WIZARD_INTRO_MESSAGE,
  getAnswerLabel,
  generateSystemPrompt,
  generateCompletionMessage,
} from "@/lib/wizard";

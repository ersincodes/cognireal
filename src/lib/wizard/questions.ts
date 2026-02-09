import type { WizardQuestion } from "@/types/wizard";

/**
 * Wizard questions for the onboarding flow.
 * These questions gather context about the user's business to personalize the AI assistant.
 */
export const WIZARD_QUESTIONS: WizardQuestion[] = [
  {
    id: "industry",
    question: "What industry does your business operate in?",
    options: [
      { id: "manufacturing", label: "Manufacturing" },
      { id: "healthcare", label: "Healthcare" },
      { id: "retail", label: "Retail / E-commerce" },
      { id: "finance", label: "Finance / Banking" },
      { id: "technology", label: "Technology / SaaS" },
      { id: "logistics", label: "Logistics / Supply Chain" },
      { id: "other", label: "Other", allowCustom: true },
    ],
  },
  {
    id: "companySize",
    question: "What is the size of your organization?",
    options: [
      { id: "startup", label: "Startup (1-10 employees)" },
      { id: "small", label: "Small (11-50 employees)" },
      { id: "medium", label: "Medium (51-200 employees)" },
      { id: "large", label: "Large (201-1000 employees)" },
      { id: "enterprise", label: "Enterprise (1000+ employees)" },
    ],
  },
  {
    id: "challenge",
    question: "What is your main business challenge?",
    options: [
      { id: "efficiency", label: "Operational Efficiency" },
      { id: "digital", label: "Digital Transformation" },
      { id: "cost", label: "Cost Reduction" },
      { id: "quality", label: "Quality Improvement" },
      { id: "customer", label: "Customer Experience" },
      { id: "analytics", label: "Data & Analytics" },
      { id: "automation", label: "Process Automation" },
    ],
  },
  {
    id: "systems",
    question: "What systems do you currently use?",
    options: [
      { id: "erp", label: "ERP (SAP, Oracle, etc.)" },
      { id: "crm", label: "CRM (Salesforce, HubSpot)" },
      { id: "custom", label: "Custom Software" },
      { id: "spreadsheets", label: "Spreadsheets / Manual" },
      { id: "legacy", label: "Multiple Legacy Systems" },
      { id: "none", label: "None / Starting Fresh" },
    ],
  },
  {
    id: "goal",
    question: "What outcome are you hoping to achieve?",
    options: [
      { id: "revenue", label: "Increase Revenue" },
      { id: "costs", label: "Reduce Costs" },
      { id: "efficiency", label: "Improve Efficiency" },
      { id: "decisions", label: "Better Decision Making" },
      { id: "competitive", label: "Competitive Advantage" },
      { id: "compliance", label: "Compliance / Risk Management" },
    ],
  },
];

/**
 * Intro message shown at the start of the wizard flow.
 */
export const WIZARD_INTRO_MESSAGE = `Welcome! I'm your Business Analyst Assistant from Cognireal.

To provide you with the most relevant guidance, I'd like to learn a bit about your business. Let's start with a few quick questions.`;

/**
 * Get the label for a wizard answer.
 * Returns custom value if provided, otherwise looks up the label from questions.
 */
export const getAnswerLabel = (
  questionId: string,
  answerId: string,
  customValue?: string
): string => {
  if (customValue) return customValue;

  const question = WIZARD_QUESTIONS.find((q) => q.id === questionId);
  const option = question?.options.find((o) => o.id === answerId);
  return option?.label || answerId;
};

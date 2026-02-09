// Wizard types for the 5-question onboarding flow

export interface WizardOption {
  id: string;
  label: string;
  allowCustom?: boolean;
}

export interface WizardQuestion {
  id: string;
  question: string;
  options: WizardOption[];
}

export interface WizardAnswer {
  questionId: string;
  answerId: string;
  customValue?: string;
}

export interface WizardState {
  isComplete: boolean;
  currentStep: number;
  answers: WizardAnswer[];
}

// Question IDs as const for type safety
export type WizardQuestionId =
  | "industry"
  | "companySize"
  | "challenge"
  | "systems"
  | "goal";

// Industry IDs
export type IndustryId =
  | "manufacturing"
  | "healthcare"
  | "retail"
  | "finance"
  | "technology"
  | "logistics"
  | "other";

// Company size IDs
export type CompanySizeId =
  | "startup"
  | "small"
  | "medium"
  | "large"
  | "enterprise";

// Challenge IDs
export type ChallengeId =
  | "efficiency"
  | "digital"
  | "cost"
  | "quality"
  | "customer"
  | "analytics"
  | "automation";

// Systems IDs
export type SystemsId =
  | "erp"
  | "crm"
  | "custom"
  | "spreadsheets"
  | "legacy"
  | "none";

// Goal IDs
export type GoalId =
  | "revenue"
  | "costs"
  | "efficiency"
  | "decisions"
  | "competitive"
  | "compliance";

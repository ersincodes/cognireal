import type { IndustryId, ChallengeId, GoalId } from "@/types/wizard";

/**
 * Industry-specific expertise content for the system prompt.
 * Each industry has tailored bullet points highlighting relevant domain knowledge.
 */
const INDUSTRY_EXPERTISE: Record<IndustryId, string> = {
  manufacturing: `- Production optimization and OEE (Overall Equipment Effectiveness)
- Quality control and defect reduction
- Supply chain and inventory management
- Lean manufacturing and Six Sigma methodologies
- MES (Manufacturing Execution Systems) and ERP integration
- Predictive maintenance and IoT applications`,

  healthcare: `- Clinical workflow optimization
- Patient experience and care coordination
- Healthcare compliance (HIPAA, regulatory requirements)
- Electronic Health Records (EHR) systems
- Telehealth and digital health solutions
- Healthcare analytics and population health management`,

  retail: `- Omnichannel retail strategy
- Inventory and supply chain optimization
- Customer experience and personalization
- E-commerce platform optimization
- Point of Sale (POS) and retail technology
- Demand forecasting and merchandising`,

  finance: `- Financial process automation
- Risk management and compliance
- Customer onboarding and KYC processes
- Core banking and payment systems
- Fraud detection and prevention
- Regulatory reporting and audit trails`,

  technology: `- Product development lifecycle
- SaaS metrics and growth optimization
- DevOps and engineering efficiency
- Customer success and retention
- Technical architecture and scalability
- Data platform and analytics infrastructure`,

  logistics: `- Transportation and route optimization
- Warehouse management and fulfillment
- Last-mile delivery optimization
- Fleet management and tracking
- Supply chain visibility and analytics
- Carrier management and freight optimization`,

  other: `- Industry-specific operational optimization
- Digital transformation strategies
- Process improvement and automation
- Technology selection and implementation
- Data analytics and business intelligence
- Change management and organizational efficiency`,
};

/**
 * Challenge context descriptions for the system prompt.
 * Maps challenge IDs to natural language descriptions.
 */
const CHALLENGE_CONTEXTS: Record<ChallengeId, string> = {
  efficiency: "operational efficiency improvements and process optimization",
  digital: "digital transformation initiatives and technology modernization",
  cost: "cost reduction strategies and resource optimization",
  quality: "quality improvement programs and defect reduction",
  customer: "customer experience enhancement and satisfaction improvement",
  analytics: "data analytics capabilities and business intelligence",
  automation: "process automation and workflow optimization",
};

/**
 * Goal context descriptions for the system prompt.
 * Maps goal IDs to natural language descriptions.
 */
const GOAL_CONTEXTS: Record<GoalId, string> = {
  revenue: "revenue growth and market expansion",
  costs: "cost optimization and operational savings",
  efficiency: "operational efficiency and productivity gains",
  decisions: "data-driven decision making and insights",
  competitive: "competitive differentiation and market positioning",
  compliance: "compliance adherence and risk mitigation",
};

/**
 * Get industry expertise content for the system prompt.
 * Returns custom industry content if a custom value is provided.
 */
export const getIndustryExpertise = (
  industryId: string,
  customValue?: string
): string => {
  if (customValue) {
    return INDUSTRY_EXPERTISE.other;
  }
  return (
    INDUSTRY_EXPERTISE[industryId as IndustryId] || INDUSTRY_EXPERTISE.other
  );
};

/**
 * Get challenge context description for the system prompt.
 */
export const getChallengeContext = (challengeId: string): string => {
  return (
    CHALLENGE_CONTEXTS[challengeId as ChallengeId] || "business optimization"
  );
};

/**
 * Get goal context description for the system prompt.
 */
export const getGoalContext = (goalId: string): string => {
  return GOAL_CONTEXTS[goalId as GoalId] || "business improvement";
};

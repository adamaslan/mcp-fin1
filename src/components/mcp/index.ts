/**
 * MCP Shared Components
 *
 * Centralized components for consistent UI across all 9 MCP tool pages.
 * These components eliminate code duplication and ensure a unified experience.
 */

// Loading states
export { MCPLoadingState, MCPInlineLoader } from "./MCPLoadingState";
export type { MCPToolName } from "./MCPLoadingState";

// Error states
export { MCPErrorState, MCPInlineError } from "./MCPErrorState";

// Empty states
export { MCPEmptyState, MCPCompactEmpty } from "./MCPEmptyState";

// AI Insights
export {
  AIInsightsPanel,
  AIMarketBias,
  AIKeyDrivers,
  AIActionItems,
  AIRiskFactors,
  AIConfidenceScore,
} from "./AIInsightsPanel";

import { Page } from '@playwright/test';
import { TIER_LIMITS, TierLimits, UserTier } from '../constants/tier-limits';
import { SELECTORS } from '../constants/selectors';

/**
 * Helper class for tier-related testing
 * Provides methods to check current tier and verify tier-specific features
 */
export class TierHelper {
  constructor(private page: Page) {}

  /**
   * Get current user tier from sidebar badge
   * Reads the tier from the "Tier: FREE|PRO|MAX" badge
   */
  async getCurrentTier(): Promise<UserTier> {
    try {
      const tierText = await this.page.locator(SELECTORS.SIDEBAR.TIER_BADGE).textContent();

      if (!tierText) {
        throw new Error('Tier badge not found');
      }

      const match = tierText.match(/Tier: (\w+)/i);
      const tier = (match ? match[1].toLowerCase() : 'free') as UserTier;

      // Validate it's a known tier
      if (!['free', 'pro', 'max'].includes(tier)) {
        throw new Error(`Unknown tier: ${tier}`);
      }

      return tier;
    } catch (error) {
      throw new Error(`Failed to get current tier: ${error}`);
    }
  }

  /**
   * Get tier limits for the current user's tier
   */
  async getTierLimits(): Promise<TierLimits> {
    const tier = await this.getCurrentTier();
    return TIER_LIMITS[tier];
  }

  /**
   * Verify feature is locked for current tier
   * Checks if navigation link has opacity-50 class (disabled appearance)
   */
  async isFeatureLocked(featureName: string): Promise<boolean> {
    const link = this.page.locator(`a:has-text("${featureName}")`);

    try {
      const classes = await link.getAttribute('class');
      return classes?.includes('opacity-50') || false;
    } catch {
      return false;
    }
  }

  /**
   * Verify tier gate is displayed (upgrade prompt)
   * Checks if upgrade prompt text is visible
   */
  async hasTierGate(): Promise<boolean> {
    try {
      return await this.page.locator(SELECTORS.TIER_GATE.UPGRADE_PROMPT).isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if a specific universe is locked for current tier
   * Useful for scanner tests
   */
  async isUniverseLocked(universe: string): Promise<boolean> {
    try {
      // Try to find the universe option
      const option = this.page.locator(`[value="${universe}"]`);
      const disabled = await option.getAttribute('disabled');

      return disabled !== null;
    } catch {
      return true; // If option doesn't exist, it's "locked"
    }
  }

  /**
   * Check if a specific timeframe is available
   * Useful for analyze tests
   */
  async isTimeframeAvailable(timeframe: string): Promise<boolean> {
    try {
      const button = this.page.locator(`button:has-text("${timeframe}")`);
      const disabled = await button.getAttribute('disabled');

      return disabled === null; // If not disabled, it's available
    } catch {
      return false;
    }
  }

  /**
   * Get all available timeframes for current tier
   */
  async getAvailableTimeframes(): Promise<string[]> {
    const limits = await this.getTierLimits();
    return limits.timeframes;
  }

  /**
   * Get all available universes for current tier
   */
  async getAvailableUniverses(): Promise<string[]> {
    const limits = await this.getTierLimits();
    return limits.universes;
  }

  /**
   * Verify all expected timeframes are available
   */
  async verifyTimeframesAvailable(expectedTimeframes: string[]): Promise<boolean> {
    const available = await this.getAvailableTimeframes();

    return expectedTimeframes.every((tf) => available.includes(tf));
  }

  /**
   * Verify all expected universes are available
   */
  async verifyUniversesAvailable(expectedUniverses: string[]): Promise<boolean> {
    const available = await this.getAvailableUniverses();

    return expectedUniverses.every((u) => available.includes(u));
  }
}

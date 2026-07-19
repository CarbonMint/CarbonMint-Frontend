/**
 * Runtime configuration sourced from Vite environment variables, with safe
 * fallbacks so the demo works without a .env file.
 */
const env = import.meta.env || {};

export const CONFIG = {
  network: env.VITE_STELLAR_NETWORK || 'TESTNET',
  sorobanRpcUrl:
    env.VITE_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',
  carbonContractId: env.VITE_CARBON_CONTRACT_ID || '',
  settlementAsset: env.VITE_SETTLEMENT_ASSET || 'USDC',
};

/**
 * Language / locale configuration for i18n readiness.
 *
 * `DEFAULT_LANG` is the BCP 47 language tag that matches the `lang` attribute
 * on the root `<html>` element in index.html. All human-readable text in the
 * application is currently in English.
 *
 * When a locale-switching feature is added, update `DEFAULT_LANG` (or derive
 * it from an env variable / user preference) and propagate the value via the
 * `useLang` utility so every component picks up the new locale automatically
 * without requiring individual edits.
 *
 * BCP 47 reference: https://www.ietf.org/rfc/bcp/bcp47.txt
 */
export const LANG_CONFIG = {
  /** Primary language tag used throughout the application. */
  DEFAULT_LANG: env.VITE_LANG || 'en',

  /**
   * Language tag used for inline technical content (hashes, serial numbers,
   * contract IDs, wallet addresses) whose character sequence is
   * locale-independent. Setting this to `'zxx'` (no linguistic content) is
   * semantically precise, but `'en'` is used here for maximum screen-reader
   * compatibility — assistive technologies vary in their handling of `zxx`.
   */
  TECHNICAL_LANG: 'en',
};

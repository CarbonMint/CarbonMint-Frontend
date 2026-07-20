/**
 * lang.js — utilities for i18n-ready `lang` attribute management.
 *
 * Usage
 * -----
 * Import `getLang` wherever a `lang` attribute is needed on an inline element
 * (e.g. a `<span>` containing a wallet address or a certificate serial number).
 * This keeps every lang reference pointing back to `LANG_CONFIG.DEFAULT_LANG`
 * so a future locale switch only needs to change one constant.
 *
 *   import { getLang, getTechnicalLang } from '../utils/lang.js';
 *
 *   // Human-readable content:
 *   <p lang={getLang()}>Hello, world</p>
 *
 *   // Technical / locale-independent content (hashes, IDs, addresses):
 *   <span lang={getTechnicalLang()} className="mono">{txHash}</span>
 *
 * Future locale switching
 * -----------------------
 * When the app gains runtime locale support, replace the body of `getLang`
 * with a lookup from user preferences or an i18n context provider, keeping
 * the public API stable:
 *
 *   export function getLang() {
 *     return userLocale || LANG_CONFIG.DEFAULT_LANG;
 *   }
 */

import { LANG_CONFIG } from '../constants/config.js';

/**
 * Returns the current application language tag (BCP 47).
 * Defaults to `LANG_CONFIG.DEFAULT_LANG` ('en').
 *
 * @returns {string} BCP 47 language tag
 */
export function getLang() {
  return LANG_CONFIG.DEFAULT_LANG;
}

/**
 * Returns the language tag to use for technical inline content such as
 * transaction hashes, serial numbers, contract IDs and wallet addresses.
 * These strings are locale-independent; the tag keeps assistive technologies
 * from switching pronunciation models unexpectedly.
 *
 * @returns {string} BCP 47 language tag
 */
export function getTechnicalLang() {
  return LANG_CONFIG.TECHNICAL_LANG;
}

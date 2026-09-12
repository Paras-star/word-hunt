// Web-safe / default no-op ads implementation.
// Metro resolves `ads.native.ts` on iOS/Android; this file is used on web and
// anywhere the native AdMob module is unavailable. Keeping it as the base file
// also means TypeScript type-checks against this contract.

export async function initAds(): Promise<void> {
  // No ads on web.
}

/**
 * Registers an eligible interstitial trigger. Applies the "every 2nd trigger,
 * min 60s" rule internally. No-op on web.
 */
export function maybeShowInterstitial(): void {
  // No-op on web.
}

/** Shows a rewarded ad; resolves true if the reward was earned. */
export async function showRewardedAd(): Promise<boolean> {
  return false;
}

/** Whether rewarded ads are available on this platform. */
export function adsSupported(): boolean {
  return false;
}

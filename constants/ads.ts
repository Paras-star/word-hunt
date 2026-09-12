// AdMob configuration. Real IDs supplied by the product owner (spec v2.0).

export const AdMobConfig = {
  APP_ID: 'ca-app-pub-9827389269181842~4120089237',
  INTERSTITIAL_AD_ID: 'ca-app-pub-9827389269181842/1693753369',
  REWARDED_AD_ID: 'ca-app-pub-9827389269181842/4711116175',
  BANNER_AD_ID: 'ca-app-pub-9827389269181842/1228070692',
} as const;

// Interstitial frequency: show on every 2nd eligible trigger, and never more
// often than once per 60 seconds.
export const InterstitialRules = {
  everyNthTrigger: 2,
  minIntervalMs: 60_000,
} as const;

import { View } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
} from 'react-native-google-mobile-ads';

import { AdMobConfig } from '@/constants/ads';

/**
 * Persistent bottom banner shown on eligible gameplay/navigation screens.
 * The banner is intentionally omitted during the full-screen unboxing sequence
 * (that screen simply does not render it).
 */
export function BannerSlot() {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <BannerAd
        unitId={AdMobConfig.BANNER_AD_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

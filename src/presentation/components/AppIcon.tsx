import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

export type AppIconName =
  | 'home'
  | 'search'
  | 'watchlist'
  | 'favorite'
  | 'settings'
  | 'movie'
  | 'streaming'
  | 'history'
  | 'theme'
  | 'database'
  | 'privacy'
  | 'info'
  | 'arrow-right'
  | 'empty'
  | 'error';

const ICONS: Record<AppIconName, SymbolViewProps['name']> = {
  home: { ios: 'house.fill', android: 'home', web: 'home' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  watchlist: { ios: 'bookmark.fill', android: 'bookmark', web: 'bookmark' },
  favorite: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  settings: { ios: 'gearshape.fill', android: 'settings', web: 'settings' },
  movie: { ios: 'film.fill', android: 'movie', web: 'movie' },
  streaming: { ios: 'play.tv.fill', android: 'live_tv', web: 'live_tv' },
  history: { ios: 'clock.arrow.circlepath', android: 'history', web: 'history' },
  theme: { ios: 'circle.lefthalf.filled', android: 'contrast', web: 'contrast' },
  database: { ios: 'internaldrive.fill', android: 'database', web: 'database' },
  privacy: { ios: 'hand.raised.fill', android: 'privacy_tip', web: 'privacy_tip' },
  info: { ios: 'info.circle.fill', android: 'info', web: 'info' },
  'arrow-right': {
    ios: 'chevron.right',
    android: 'chevron_right',
    web: 'chevron_right',
  },
  empty: { ios: 'tray.fill', android: 'inbox', web: 'inbox' },
  error: {
    ios: 'exclamationmark.triangle.fill',
    android: 'error',
    web: 'error',
  },
};

type AppIconProps = {
  name: AppIconName;
  color: ColorValue;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function AppIcon({ name, color, size = 24, style }: AppIconProps) {
  return (
    <SymbolView
      name={ICONS[name]}
      size={size}
      style={style}
      tintColor={color}
    />
  );
}

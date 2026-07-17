import { PropsWithChildren } from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';

import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

type AppTextProps = PropsWithChildren<{
  style?: StyleProp<TextStyle>;
  secondary?: boolean;
  numberOfLines?: number;
}>;

export function AppText({
  children,
  style,
  secondary = false,
  numberOfLines,
}: AppTextProps) {
  const { colors } = useAppTheme();

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        {
          color: secondary ? colors.textSecondary : colors.text,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

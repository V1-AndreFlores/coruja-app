import { Pressable, StyleSheet } from 'react-native';

import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

import { AppIcon, type AppIconName } from './AppIcon';
import { AppText } from './AppText';

type TitleActionButtonProps = {
  icon: AppIconName;
  label: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
};

export function TitleActionButton({
  icon,
  label,
  onPress,
  selected = false,
  disabled = false,
}: TitleActionButtonProps) {
  const { colors } = useAppTheme();
  const backgroundColor = selected ? colors.primary : colors.surface;
  const foregroundColor = selected ? '#FFFFFF' : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor,
          borderColor: selected ? colors.primary : colors.border,
          opacity: disabled ? 0.55 : pressed ? 0.75 : 1,
        },
      ]}
    >
      <AppIcon color={foregroundColor} name={selected ? 'check' : icon} size={21} />
      <AppText style={[styles.label, { color: foregroundColor }]}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 112,
    minHeight: 48,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
  },
});

import { StyleSheet, TextInput, View } from 'react-native';

import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

import { AppIcon } from './AppIcon';

type AppSearchInputProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function AppSearchInput({ value, onChangeText }: AppSearchInputProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <AppIcon color={colors.textSecondary} name="search" size={22} />
      <TextInput
        accessibilityLabel="Termo de busca"
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onChangeText}
        placeholder="Filme, série, ator ou atriz"
        placeholderTextColor={colors.textSecondary}
        returnKeyType="search"
        style={[styles.input, { color: colors.text }]}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    minHeight: 50,
    fontSize: 16,
  },
});

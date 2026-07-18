import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import type {
  SearchFilters,
  SearchGenreKey,
  SearchMediaType,
  WatchProviderOption,
} from '@/domain/models/SearchFilters';
import {
  SEARCH_AVAILABILITY_OPTIONS,
  SEARCH_GENRE_OPTIONS,
  SEARCH_MEDIA_TYPE_OPTIONS,
  SEARCH_RATING_OPTIONS,
} from '@/shared/constants/searchFilters';
import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

import { AppText } from './AppText';

type ProviderStatus = 'idle' | 'loading' | 'success' | 'error';

type SearchFiltersModalProps = {
  visible: boolean;
  value: SearchFilters;
  providers: WatchProviderOption[];
  providersStatus: ProviderStatus;
  platformDisabled: boolean;
  onApply: (filters: SearchFilters) => void;
  onClose: () => void;
};

type ChoiceChipProps<T extends string | number | undefined> = {
  label: string;
  value: T;
  selectedValue: T;
  disabled?: boolean;
  onSelect: (value: T) => void;
};

function ChoiceChip<T extends string | number | undefined>({
  label,
  value,
  selectedValue,
  disabled = false,
  onSelect,
}: ChoiceChipProps<T>) {
  const { colors } = useAppTheme();
  const selected = value === selectedValue;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={() => onSelect(value)}
      style={({ pressed }) => [
        styles.choiceChip,
        {
          backgroundColor: selected ? colors.primary : colors.card,
          borderColor: selected ? colors.primary : colors.border,
          opacity: disabled ? 0.42 : pressed ? 0.72 : 1,
        },
      ]}
    >
      <AppText style={[styles.choiceLabel, selected && styles.selectedLabel]}>
        {label}
      </AppText>
    </Pressable>
  );
}

function parseYear(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}

function isGenreAvailable(
  genre: SearchGenreKey,
  mediaType: SearchMediaType,
): boolean {
  const option = SEARCH_GENRE_OPTIONS.find((item) => item.key === genre);

  if (!option || mediaType === 'all') {
    return true;
  }

  return mediaType === 'movie'
    ? option.movieGenreIds.length > 0
    : option.tvGenreIds.length > 0;
}

export function SearchFiltersModal({
  visible,
  value,
  providers,
  providersStatus,
  platformDisabled,
  onApply,
  onClose,
}: SearchFiltersModalProps) {
  const { colors } = useAppTheme();
  const [draft, setDraft] = useState<SearchFilters>(value);
  const [yearFrom, setYearFrom] = useState(
    value.yearFrom ? String(value.yearFrom) : '',
  );
  const [yearTo, setYearTo] = useState(
    value.yearTo ? String(value.yearTo) : '',
  );
  const [validationMessage, setValidationMessage] = useState<string>();

  useEffect(() => {
    if (!visible) {
      return;
    }

    const normalizedValue = platformDisabled
      ? { ...value, providerKey: undefined, availability: 'any' as const }
      : value;

    setDraft(normalizedValue);
    setYearFrom(normalizedValue.yearFrom ? String(normalizedValue.yearFrom) : '');
    setYearTo(normalizedValue.yearTo ? String(normalizedValue.yearTo) : '');
    setValidationMessage(undefined);
  }, [platformDisabled, value, visible]);

  const selectedProvider = useMemo(
    () => providers.find((provider) => provider.key === draft.providerKey),
    [draft.providerKey, providers],
  );

  const selectMediaType = (mediaType: SearchMediaType) => {
    setDraft((current) => ({
      ...current,
      mediaType,
      genre:
        current.genre && isGenreAvailable(current.genre, mediaType)
          ? current.genre
          : undefined,
    }));
  };

  const clearFilters = () => {
    setDraft({ mediaType: 'all', availability: 'any' });
    setYearFrom('');
    setYearTo('');
    setValidationMessage(undefined);
  };

  const applyFilters = () => {
    const currentYear = new Date().getFullYear();
    const minimumYear = 1888;
    const maximumYear = currentYear + 5;
    const parsedYearFrom = parseYear(yearFrom);
    const parsedYearTo = parseYear(yearTo);

    if (
      (yearFrom && !parsedYearFrom) ||
      (yearTo && !parsedYearTo) ||
      (parsedYearFrom &&
        (parsedYearFrom < minimumYear || parsedYearFrom > maximumYear)) ||
      (parsedYearTo &&
        (parsedYearTo < minimumYear || parsedYearTo > maximumYear))
    ) {
      setValidationMessage(
        `Informe anos entre ${minimumYear} e ${maximumYear}.`,
      );
      return;
    }

    if (parsedYearFrom && parsedYearTo && parsedYearFrom > parsedYearTo) {
      setValidationMessage('O ano inicial não pode ser maior que o ano final.');
      return;
    }

    onApply({
      ...draft,
      yearFrom: parsedYearFrom,
      yearTo: parsedYearTo,
      providerKey: platformDisabled ? undefined : draft.providerKey,
      availability:
        platformDisabled || !draft.providerKey ? 'any' : draft.availability,
    });
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <Pressable
          accessibilityLabel="Fechar filtros"
          accessibilityRole="button"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerText}>
              <AppText style={styles.title}>Filtros</AppText>
              <AppText secondary style={styles.subtitle}>
                Refine os resultados sem alterar o termo pesquisado.
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <AppText style={styles.closeLabel}>Fechar</AppText>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            style={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>Tipo</AppText>
              <View style={styles.choices}>
                {SEARCH_MEDIA_TYPE_OPTIONS.map((option) => (
                  <ChoiceChip
                    key={option.value}
                    label={option.label}
                    onSelect={selectMediaType}
                    selectedValue={draft.mediaType}
                    value={option.value}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>Gênero</AppText>
              <AppText secondary style={styles.helperText}>
                Selecione apenas um gênero para manter a busca objetiva.
              </AppText>
              <View style={styles.choices}>
                <ChoiceChip
                  label="Todos"
                  onSelect={() =>
                    setDraft((current) => ({ ...current, genre: undefined }))
                  }
                  selectedValue={draft.genre}
                  value={undefined}
                />
                {SEARCH_GENRE_OPTIONS.map((option) => (
                  <ChoiceChip
                    disabled={!isGenreAvailable(option.key, draft.mediaType)}
                    key={option.key}
                    label={option.label}
                    onSelect={(genre) =>
                      setDraft((current) => ({ ...current, genre }))
                    }
                    selectedValue={draft.genre}
                    value={option.key}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>Período de lançamento</AppText>
              <View style={styles.yearFields}>
                <View style={styles.yearField}>
                  <AppText secondary style={styles.fieldLabel}>
                    De
                  </AppText>
                  <TextInput
                    accessibilityLabel="Ano inicial"
                    keyboardType="number-pad"
                    maxLength={4}
                    onChangeText={(text) => {
                      setYearFrom(text.replace(/\D/g, ''));
                      setValidationMessage(undefined);
                    }}
                    placeholder="Ex.: 2010"
                    placeholderTextColor={colors.textSecondary}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={yearFrom}
                  />
                </View>
                <View style={styles.yearField}>
                  <AppText secondary style={styles.fieldLabel}>
                    Até
                  </AppText>
                  <TextInput
                    accessibilityLabel="Ano final"
                    keyboardType="number-pad"
                    maxLength={4}
                    onChangeText={(text) => {
                      setYearTo(text.replace(/\D/g, ''));
                      setValidationMessage(undefined);
                    }}
                    placeholder="Ex.: 2025"
                    placeholderTextColor={colors.textSecondary}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={yearTo}
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>Avaliação mínima</AppText>
              <View style={styles.choices}>
                {SEARCH_RATING_OPTIONS.map((option) => (
                  <ChoiceChip
                    key={option.label}
                    label={option.label}
                    onSelect={(minimumRating) =>
                      setDraft((current) => ({
                        ...current,
                        minimumRating,
                      }))
                    }
                    selectedValue={draft.minimumRating}
                    value={option.value}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>Onde assistir</AppText>
              {platformDisabled ? (
                <AppText secondary style={styles.noticeText}>
                  Este filtro não é aplicado quando a busca foi identificada
                  como nome de um profissional.
                </AppText>
              ) : providersStatus === 'loading' || providersStatus === 'idle' ? (
                <View style={styles.providerLoading}>
                  <ActivityIndicator color={colors.primary} size="small" />
                  <AppText secondary style={styles.helperText}>
                    Carregando plataformas disponíveis no Brasil...
                  </AppText>
                </View>
              ) : providersStatus === 'error' || providers.length === 0 ? (
                <AppText secondary style={styles.noticeText}>
                  As plataformas não puderam ser carregadas agora. Os demais
                  filtros continuam disponíveis.
                </AppText>
              ) : (
                <>
                  <AppText secondary style={styles.helperText}>
                    A verificação pode levar alguns segundos, pois considera a
                    disponibilidade de cada resultado no Brasil.
                  </AppText>
                  <View style={styles.choices}>
                    <ChoiceChip
                      label="Todas"
                      onSelect={() =>
                        setDraft((current) => ({
                          ...current,
                          providerKey: undefined,
                          availability: 'any',
                        }))
                      }
                      selectedValue={draft.providerKey}
                      value={undefined}
                    />
                    {providers.map((provider) => (
                      <ChoiceChip
                        key={provider.key}
                        label={provider.name}
                        onSelect={(providerKey) =>
                          setDraft((current) => ({
                            ...current,
                            providerKey,
                          }))
                        }
                        selectedValue={draft.providerKey}
                        value={provider.key}
                      />
                    ))}
                  </View>
                </>
              )}
            </View>

            {!platformDisabled && selectedProvider ? (
              <View style={styles.section}>
                <AppText style={styles.sectionTitle}>Disponibilidade</AppText>
                <View style={styles.choices}>
                  {SEARCH_AVAILABILITY_OPTIONS.map((option) => (
                    <ChoiceChip
                      key={option.value}
                      label={option.label}
                      onSelect={(availability) =>
                        setDraft((current) => ({ ...current, availability }))
                      }
                      selectedValue={draft.availability}
                      value={option.value}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {validationMessage ? (
              <AppText style={[styles.validation, { color: colors.primary }]}>
                {validationMessage}
              </AppText>
            ) : null}
          </ScrollView>

          <View style={[styles.actions, { borderColor: colors.border }]}>
            <Pressable
              accessibilityRole="button"
              onPress={clearFilters}
              style={({ pressed }) => [
                styles.actionButton,
                styles.clearButton,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <AppText style={styles.clearLabel}>Limpar</AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={applyFilters}
              style={({ pressed }) => [
                styles.actionButton,
                styles.applyButton,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.78 : 1,
                },
              ]}
            >
              <AppText style={styles.applyLabel}>Aplicar filtros</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    maxWidth: 680,
    maxHeight: '92%',
    alignSelf: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  closeButton: {
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  closeLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  scroll: {
    flexShrink: 1,
  },
  content: {
    gap: 24,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  helperText: {
    fontSize: 12,
    lineHeight: 18,
  },
  providerLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 19,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceChip: {
    minHeight: 38,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 19,
    paddingHorizontal: 14,
  },
  choiceLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  selectedLabel: {
    color: '#FFFFFF',
  },
  yearFields: {
    flexDirection: 'row',
    gap: 12,
  },
  yearField: {
    flex: 1,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  validation: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 22,
  },
  actionButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    paddingHorizontal: 16,
  },
  clearButton: {
    minWidth: 104,
    borderWidth: 1,
  },
  applyButton: {
    flex: 1,
  },
  clearLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  applyLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});

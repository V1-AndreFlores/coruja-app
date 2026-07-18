import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { WatchProviderOption } from '@/domain/models/SearchFilters';
import { AppHeader } from '@/presentation/components/AppHeader';
import { AppIcon } from '@/presentation/components/AppIcon';
import { AppPageTitle } from '@/presentation/components/AppPageTitle';
import { AppScreen } from '@/presentation/components/AppScreen';
import { AppStateView } from '@/presentation/components/AppStateView';
import { AppText } from '@/presentation/components/AppText';
import { useWatchProviderOptions } from '@/presentation/hooks/useWatchProviderOptions';
import { useStreamingPreferences } from '@/presentation/preferences/StreamingPreferencesProvider';
import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

function ProviderChip({
  provider,
  selected,
  onPress,
}: {
  provider: WatchProviderOption;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.providerChip,
        {
          backgroundColor: selected ? colors.primary : colors.card,
          borderColor: selected ? colors.primary : colors.border,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <AppText style={[styles.providerLabel, selected && styles.selectedLabel]}>
        {selected ? '✓ ' : ''}
        {provider.name}
      </AppText>
    </Pressable>
  );
}

export function StreamingServicesScreen() {
  const { colors } = useAppTheme();
  const {
    providerKeys,
    isHydrated,
    setProviderKeys,
  } = useStreamingPreferences();
  const { options: providers, status } = useWatchProviderOptions(true);
  const [draftKeys, setDraftKeys] = useState<string[]>(providerKeys);
  const [showAll, setShowAll] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string>();

  useEffect(() => {
    if (isHydrated) {
      setDraftKeys(providerKeys);
    }
  }, [isHydrated, providerKeys]);

  const visibleProviders = useMemo(() => {
    if (showAll) {
      return providers;
    }

    const selectedSet = new Set(draftKeys);
    const highlighted = providers.filter((provider) =>
      selectedSet.has(provider.key),
    );
    const result = [...highlighted];

    providers.slice(0, 12).forEach((provider) => {
      if (!result.some((item) => item.key === provider.key)) {
        result.push(provider);
      }
    });

    return result;
  }, [draftKeys, providers, showAll]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/ajustes');
  };

  const toggleProvider = (providerKey: string) => {
    setFeedback(undefined);
    setDraftKeys((current) =>
      current.includes(providerKey)
        ? current.filter((key) => key !== providerKey)
        : [...current, providerKey],
    );
  };

  const save = async () => {
    setIsSaving(true);
    setFeedback(undefined);

    try {
      await setProviderKeys(draftKeys);
      setFeedback('Seus streamings foram salvos neste aparelho.');
    } catch {
      setFeedback('Não foi possível salvar seus streamings agora.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppScreen bottomSpacing={48} contentStyle={styles.screen} scroll>
      <View style={styles.topBar}>
        <Pressable
          accessibilityLabel="Voltar para Ajustes"
          accessibilityRole="button"
          onPress={goBack}
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pressed ? 0.68 : 1,
            },
          ]}
        >
          <AppIcon color={colors.text} name="back" size={22} />
        </Pressable>
        <AppHeader compact />
      </View>

      <AppPageTitle
        description="Selecione os serviços de assinatura que você possui. Eles poderão ser usados juntos nos filtros da busca."
        title="Meus streamings"
      />

      {status === 'loading' || status === 'idle' || !isHydrated ? (
        <AppStateView
          description="Carregando as plataformas disponíveis no Brasil."
          title="Carregando streamings"
          variant="loading"
        />
      ) : null}

      {status === 'error' ? (
        <AppStateView
          description="Não foi possível carregar as plataformas do TMDB. Verifique a conexão e abra esta tela novamente."
          title="Streamings indisponíveis"
          variant="error"
        />
      ) : null}

      {status === 'success' ? (
        <View style={styles.content}>
          <View
            style={[
              styles.summary,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <AppIcon color={colors.primary} name="streaming" size={24} />
            <View style={styles.summaryText}>
              <AppText style={styles.summaryTitle}>
                {draftKeys.length}{' '}
                {draftKeys.length === 1
                  ? 'streaming selecionado'
                  : 'streamings selecionados'}
              </AppText>
              <AppText secondary style={styles.summaryDescription}>
                A busca considera títulos disponíveis em qualquer um dos
                serviços marcados.
              </AppText>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppText style={styles.sectionTitle}>Serviços disponíveis</AppText>
              {draftKeys.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setDraftKeys([])}
                >
                  <AppText style={[styles.textAction, { color: colors.primary }]}> 
                    Limpar seleção
                  </AppText>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.providerGrid}>
              {visibleProviders.map((provider) => (
                <ProviderChip
                  key={provider.key}
                  onPress={() => toggleProvider(provider.key)}
                  provider={provider}
                  selected={draftKeys.includes(provider.key)}
                />
              ))}
            </View>

            {providers.length > visibleProviders.length || showAll ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowAll((current) => !current)}
                style={({ pressed }) => [
                  styles.showMoreButton,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <AppText style={styles.showMoreLabel}>
                  {showAll ? 'Mostrar principais' : 'Mostrar todos os serviços'}
                </AppText>
              </Pressable>
            ) : null}
          </View>

          {feedback ? (
            <AppText
              style={[
                styles.feedback,
                { color: feedback.startsWith('Não') ? colors.primary : colors.textSecondary },
              ]}
            >
              {feedback}
            </AppText>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={isSaving}
            onPress={() => void save()}
            style={({ pressed }) => [
              styles.saveButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed || isSaving ? 0.7 : 1,
              },
            ]}
          >
            <AppText style={styles.saveLabel}>
              {isSaving ? 'Salvando...' : 'Salvar meus streamings'}
            </AppText>
          </Pressable>
        </View>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 23,
  },
  content: {
    gap: 20,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  summaryText: {
    flex: 1,
    gap: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  summaryDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  section: {
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  textAction: {
    fontSize: 12,
    fontWeight: '800',
  },
  providerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  providerChip: {
    minHeight: 42,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 21,
    paddingHorizontal: 14,
  },
  providerLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  selectedLabel: {
    color: '#FFFFFF',
  },
  showMoreButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  showMoreLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  feedback: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  saveButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingHorizontal: 18,
  },
  saveLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});

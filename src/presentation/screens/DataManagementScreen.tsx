import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppConfirmDialog } from '@/presentation/components/AppConfirmDialog';
import { AppHeader } from '@/presentation/components/AppHeader';
import { AppIcon } from '@/presentation/components/AppIcon';
import { AppPageTitle } from '@/presentation/components/AppPageTitle';
import { AppScreen } from '@/presentation/components/AppScreen';
import { AppStateView } from '@/presentation/components/AppStateView';
import { AppText } from '@/presentation/components/AppText';
import { SettingsCard } from '@/presentation/components/SettingsCard';
import { SettingsLinkRow } from '@/presentation/components/SettingsLinkRow';
import {
  type LocalDataKind,
  useLocalDataManagement,
} from '@/presentation/hooks/useLocalDataManagement';
import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

type ConfirmationContent = {
  title: string;
  description: string;
  confirmLabel: string;
};

const CONFIRMATION_CONTENT: Record<LocalDataKind, ConfirmationContent> = {
  favorites: {
    title: 'Limpar Favoritos?',
    description:
      'Todos os títulos salvos em Favoritos serão removidos deste aparelho. A lista Quero assistir e o histórico não serão alterados.',
    confirmLabel: 'Limpar favoritos',
  },
  watchlist: {
    title: 'Limpar Quero assistir?',
    description:
      'Todos os títulos da lista Quero assistir serão removidos deste aparelho. Favoritos e histórico não serão alterados.',
    confirmLabel: 'Limpar lista',
  },
  history: {
    title: 'Limpar Histórico?',
    description:
      'Todos os títulos visualizados serão removidos deste aparelho. Favoritos e Quero assistir não serão alterados.',
    confirmLabel: 'Limpar histórico',
  },
  all: {
    title: 'Limpar todos os dados locais?',
    description:
      'Favoritos, Quero assistir e histórico serão removidos definitivamente deste aparelho. O tema selecionado será mantido.',
    confirmLabel: 'Limpar tudo',
  },
};

function countDescription(count: number, singular: string, plural: string) {
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
}

export function DataManagementScreen() {
  const { colors } = useAppTheme();
  const {
    counts,
    status,
    operation,
    isProcessing,
    errorMessage,
    successMessage,
    retry,
    clearData,
  } = useLocalDataManagement();
  const [confirmationKind, setConfirmationKind] = useState<LocalDataKind>();

  const confirmationContent = useMemo(
    () => (confirmationKind ? CONFIRMATION_CONTENT[confirmationKind] : undefined),
    [confirmationKind],
  );

  const totalItems = counts.favorites + counts.watchlist + counts.history;

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/ajustes');
  };

  const confirmClear = async () => {
    if (!confirmationKind) {
      return;
    }

    const cleared = await clearData(confirmationKind);

    if (cleared) {
      setConfirmationKind(undefined);
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
        description="Consulte e remova informações mantidas somente neste aparelho."
        title="Dados locais"
      />

      {status === 'loading' ? (
        <AppStateView
          description="Consultando Favoritos, Quero assistir e histórico."
          title="Carregando dados locais"
          variant="loading"
        />
      ) : null}

      {status === 'error' ? (
        <AppStateView
          actionLabel="Tentar novamente"
          description={
            errorMessage ??
            'Não foi possível consultar os dados armazenados neste aparelho.'
          }
          onActionPress={retry}
          title="Dados indisponíveis"
          variant="error"
        />
      ) : null}

      {status === 'success' ? (
        <>
          <SettingsCard
            description="O Coruja não exige login. Essas informações não são sincronizadas nem enviadas para um servidor."
            title="Resumo do armazenamento"
          >
            <SettingsLinkRow
              description={countDescription(
                counts.favorites,
                'título salvo',
                'títulos salvos',
              )}
              icon="favorite"
              title="Favoritos"
            />
            <SettingsLinkRow
              description={countDescription(
                counts.watchlist,
                'título salvo',
                'títulos salvos',
              )}
              icon="watchlist"
              title="Quero assistir"
            />
            <SettingsLinkRow
              description={countDescription(
                counts.history,
                'título visualizado',
                'títulos visualizados',
              )}
              icon="history"
              title="Histórico"
            />
          </SettingsCard>

          <SettingsCard
            description="Cada opção remove apenas os dados indicados. As ações não podem ser desfeitas."
            title="Limpeza seletiva"
          >
            <SettingsLinkRow
              description="Remove somente os títulos marcados como favoritos."
              disabled={counts.favorites === 0 || isProcessing}
              icon="remove"
              onPress={() => setConfirmationKind('favorites')}
              title="Limpar Favoritos"
              tone="danger"
            />
            <SettingsLinkRow
              description="Remove somente os títulos da lista Quero assistir."
              disabled={counts.watchlist === 0 || isProcessing}
              icon="remove"
              onPress={() => setConfirmationKind('watchlist')}
              title="Limpar Quero assistir"
              tone="danger"
            />
            <SettingsLinkRow
              description="Remove somente o histórico de visualizações."
              disabled={counts.history === 0 || isProcessing}
              icon="remove"
              onPress={() => setConfirmationKind('history')}
              title="Limpar Histórico"
              tone="danger"
            />
          </SettingsCard>

          <SettingsCard
            description="Remove Favoritos, Quero assistir e histórico em uma única operação. A preferência de tema será mantida."
            title="Limpeza completa"
          >
            <SettingsLinkRow
              description={
                totalItems === 0
                  ? 'Não há dados de biblioteca ou histórico para remover.'
                  : `${totalItems} registros locais serão removidos.`
              }
              disabled={totalItems === 0 || isProcessing}
              icon="remove"
              onPress={() => setConfirmationKind('all')}
              title="Limpar todos os dados locais"
              tone="danger"
            />
          </SettingsCard>

          {successMessage ? (
            <View
              accessibilityLiveRegion="polite"
              style={[
                styles.feedback,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <AppIcon color={colors.secondary} name="check" size={20} />
              <AppText secondary style={styles.feedbackText}>
                {successMessage}
              </AppText>
            </View>
          ) : null}

          {errorMessage ? (
            <View
              accessibilityLiveRegion="assertive"
              style={[
                styles.feedback,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <AppIcon color={colors.primary} name="error" size={20} />
              <AppText style={[styles.feedbackText, { color: colors.primary }]}>
                {errorMessage}
              </AppText>
            </View>
          ) : null}
        </>
      ) : null}

      <AppConfirmDialog
        confirmLabel={confirmationContent?.confirmLabel ?? 'Confirmar'}
        description={confirmationContent?.description ?? 'Confirme a operação.'}
        isProcessing={Boolean(operation)}
        onCancel={() => setConfirmationKind(undefined)}
        onConfirm={() => void confirmClear()}
        processingLabel="Limpando..."
        title={confirmationContent?.title ?? 'Confirmar limpeza'}
        visible={Boolean(confirmationKind)}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 20,
  },
  topBar: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 14,
  },
  feedback: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  feedbackText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});

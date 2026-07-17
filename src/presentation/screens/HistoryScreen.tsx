import { router } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import type { HistoryEntry } from '@/domain/models/CatalogItemSummary';
import { AppConfirmDialog } from '@/presentation/components/AppConfirmDialog';
import { AppHeader } from '@/presentation/components/AppHeader';
import { AppIcon } from '@/presentation/components/AppIcon';
import { AppPageTitle } from '@/presentation/components/AppPageTitle';
import { AppScreen } from '@/presentation/components/AppScreen';
import { AppStateView } from '@/presentation/components/AppStateView';
import { AppText } from '@/presentation/components/AppText';
import { HistoryListItem } from '@/presentation/components/HistoryListItem';
import { useHistory } from '@/presentation/hooks/useHistory';
import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

function itemKey(item: HistoryEntry): string {
  return `${item.mediaType}:${item.id}`;
}

export function HistoryScreen() {
  const { colors } = useAppTheme();
  const {
    items,
    status,
    errorMessage,
    operationError,
    removingKey,
    isClearing,
    retry,
    removeItem,
    clearHistory,
  } = useHistory();
  const [itemToRemove, setItemToRemove] = useState<HistoryEntry>();
  const [isClearConfirmationVisible, setIsClearConfirmationVisible] =
    useState(false);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/ajustes');
  };

  const confirmRemoval = async () => {
    if (!itemToRemove) {
      return;
    }

    const removed = await removeItem(itemToRemove);

    if (removed) {
      setItemToRemove(undefined);
    }
  };

  const confirmClearHistory = async () => {
    const cleared = await clearHistory();

    if (cleared) {
      setIsClearConfirmationVisible(false);
    }
  };

  const renderItem = ({ item }: ListRenderItemInfo<HistoryEntry>) => (
    <HistoryListItem
      isRemoving={isClearing || Boolean(removingKey)}
      item={item}
      onRemovePress={setItemToRemove}
    />
  );

  return (
    <AppScreen contentStyle={styles.screen}>
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
        description="Títulos abertos recentemente neste aparelho, do mais recente para o mais antigo."
        title="Histórico"
      />

      {status === 'loading' ? (
        <AppStateView
          description="Carregando os títulos visualizados neste aparelho."
          title="Carregando histórico"
          variant="loading"
        />
      ) : null}

      {status === 'error' ? (
        <AppStateView
          actionLabel="Tentar novamente"
          description={
            errorMessage ??
            'Não foi possível carregar o histórico armazenado neste aparelho.'
          }
          onActionPress={retry}
          title="Histórico indisponível"
          variant="error"
        />
      ) : null}

      {status === 'success' && items.length === 0 ? (
        <AppStateView
          actionLabel="Explorar títulos"
          description="Os filmes e séries abertos na tela de detalhes aparecerão aqui."
          onActionPress={() => router.replace('/(tabs)/buscar')}
          title="Nenhum título visualizado"
          variant="empty"
        />
      ) : null}

      {status === 'success' && items.length > 0 ? (
        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <View style={styles.listHeaderText}>
              <AppText secondary style={styles.count}>
                {items.length}{' '}
                {items.length === 1
                  ? 'título no histórico'
                  : 'títulos no histórico'}
              </AppText>
              <AppText secondary style={styles.limitText}>
                O Coruja mantém os 100 registros mais recentes.
              </AppText>
            </View>
            <Pressable
              accessibilityLabel="Limpar todo o histórico"
              accessibilityRole="button"
              disabled={isClearing || Boolean(removingKey)}
              onPress={() => setIsClearConfirmationVisible(true)}
              style={({ pressed }) => [
                styles.clearButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity:
                    pressed || isClearing || Boolean(removingKey) ? 0.62 : 1,
                },
              ]}
            >
              <AppIcon color={colors.primary} name="remove" size={18} />
              <AppText style={[styles.clearButtonText, { color: colors.primary }]}>
                Limpar histórico
              </AppText>
            </Pressable>
          </View>

          {operationError ? (
            <AppText style={[styles.operationError, { color: colors.primary }]}>
              {operationError}
            </AppText>
          ) : null}

          <FlatList
            contentContainerStyle={styles.listContent}
            data={items}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            keyExtractor={itemKey}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : null}

      <AppConfirmDialog
        confirmLabel="Remover"
        description={
          itemToRemove
            ? `Remover “${itemToRemove.title}” do histórico? Esta ação não altera Favoritos nem Quero assistir.`
            : 'Confirme a remoção do título.'
        }
        isProcessing={Boolean(removingKey)}
        onCancel={() => setItemToRemove(undefined)}
        onConfirm={() => void confirmRemoval()}
        title="Remover do histórico"
        visible={Boolean(itemToRemove)}
      />

      <AppConfirmDialog
        confirmLabel="Limpar tudo"
        description="Todos os títulos visualizados serão removidos deste aparelho. Favoritos e Quero assistir não serão alterados."
        isProcessing={isClearing}
        onCancel={() => setIsClearConfirmationVisible(false)}
        onConfirm={() => void confirmClearHistory()}
        processingLabel="Limpando..."
        title="Limpar todo o histórico?"
        visible={isClearConfirmationVisible}
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
  listContainer: {
    flex: 1,
    gap: 10,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  listHeaderText: {
    flex: 1,
    gap: 3,
  },
  count: {
    fontSize: 13,
    fontWeight: '700',
  },
  limitText: {
    fontSize: 11,
    lineHeight: 15,
  },
  clearButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 13,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '800',
  },
  operationError: {
    fontSize: 13,
    lineHeight: 18,
  },
  listContent: {
    paddingBottom: 32,
  },
  separator: {
    height: 12,
  },
});

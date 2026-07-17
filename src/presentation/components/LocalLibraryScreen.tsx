import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import type { CatalogItemSummary } from '@/domain/models/CatalogItemSummary';
import { useLocalLibraryList, type LocalLibraryKind } from '@/presentation/hooks/useLocalLibraryList';
import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

import { AppConfirmDialog } from './AppConfirmDialog';
import { AppHeader } from './AppHeader';
import { AppPageTitle } from './AppPageTitle';
import { AppScreen } from './AppScreen';
import { AppStateView } from './AppStateView';
import { AppText } from './AppText';
import { LibraryPosterCard } from './LibraryPosterCard';

const GRID_GAP = 14;
const MIN_CARD_WIDTH = 140;
const MAX_CARD_WIDTH = 180;
const MAX_COLUMNS = 8;
const SCREEN_HORIZONTAL_PADDING = 40;

type LocalLibraryScreenProps = {
  kind: LocalLibraryKind;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyActionLabel: string;
  confirmationTitle: string;
  confirmationDescription: (item: CatalogItemSummary) => string;
};

function itemKey(item: CatalogItemSummary): string {
  return `${item.mediaType}:${item.id}`;
}

export function LocalLibraryScreen({
  kind,
  title,
  description,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  confirmationTitle,
  confirmationDescription,
}: LocalLibraryScreenProps) {
  const { width: windowWidth } = useWindowDimensions();
  const { colors } = useAppTheme();
  const {
    items,
    status,
    errorMessage,
    operationError,
    removingKey,
    retry,
    removeItem,
  } = useLocalLibraryList(kind);
  const [itemToRemove, setItemToRemove] = useState<CatalogItemSummary>();

  const grid = useMemo(() => {
    const availableWidth = Math.max(0, windowWidth - SCREEN_HORIZONTAL_PADDING);
    const columns = Math.max(
      2,
      Math.min(
        MAX_COLUMNS,
        Math.floor((availableWidth + GRID_GAP) / (MIN_CARD_WIDTH + GRID_GAP)),
      ),
    );
    const calculatedWidth =
      (availableWidth - GRID_GAP * (columns - 1)) / columns;

    return {
      columns,
      cardWidth: Math.min(MAX_CARD_WIDTH, calculatedWidth),
    };
  }, [windowWidth]);

  const confirmRemoval = async () => {
    if (!itemToRemove) {
      return;
    }

    const removed = await removeItem(itemToRemove);

    if (removed) {
      setItemToRemove(undefined);
    }
  };

  const renderItem = ({ item }: ListRenderItemInfo<CatalogItemSummary>) => (
    <LibraryPosterCard
      isRemoving={removingKey === itemKey(item)}
      item={item}
      onRemovePress={setItemToRemove}
      width={grid.cardWidth}
    />
  );

  return (
    <AppScreen contentStyle={styles.screen}>
      <AppHeader compact />
      <AppPageTitle description={description} title={title} />

      {status === 'loading' ? (
        <AppStateView
          description="Carregando os títulos armazenados neste aparelho."
          title="Carregando sua lista"
          variant="loading"
        />
      ) : null}

      {status === 'error' ? (
        <AppStateView
          actionLabel="Tentar novamente"
          description={
            errorMessage ??
            'Não foi possível carregar os títulos armazenados neste aparelho.'
          }
          onActionPress={retry}
          title="Não foi possível abrir a lista"
          variant="error"
        />
      ) : null}

      {status === 'success' && items.length === 0 ? (
        <AppStateView
          actionLabel={emptyActionLabel}
          description={emptyDescription}
          onActionPress={() => router.push('/(tabs)/buscar')}
          title={emptyTitle}
          variant="empty"
        />
      ) : null}

      {status === 'success' && items.length > 0 ? (
        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <AppText secondary style={styles.count}>
              {items.length} {items.length === 1 ? 'título salvo' : 'títulos salvos'}
            </AppText>
            {operationError ? (
              <AppText style={[styles.operationError, { color: colors.primary }]}>
                {operationError}
              </AppText>
            ) : null}
          </View>
          <FlatList
            key={`library-grid-${grid.columns}`}
            columnWrapperStyle={
              grid.columns > 1 ? { gap: GRID_GAP } : undefined
            }
            contentContainerStyle={styles.listContent}
            data={items}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            keyExtractor={itemKey}
            numColumns={grid.columns}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : null}

      <AppConfirmDialog
        confirmLabel="Remover"
        description={
          itemToRemove
            ? confirmationDescription(itemToRemove)
            : 'Confirme a remoção do título.'
        }
        isProcessing={Boolean(removingKey)}
        onCancel={() => setItemToRemove(undefined)}
        onConfirm={() => void confirmRemoval()}
        title={confirmationTitle}
        visible={Boolean(itemToRemove)}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 20,
  },
  listContainer: {
    flex: 1,
    gap: 10,
  },
  listHeader: {
    gap: 6,
  },
  count: {
    fontSize: 13,
    fontWeight: '700',
  },
  operationError: {
    fontSize: 13,
    lineHeight: 18,
  },
  listContent: {
    paddingBottom: 28,
  },
  separator: {
    height: 18,
  },
});

import { router } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppHeader } from '@/presentation/components/AppHeader';
import { AppIcon } from '@/presentation/components/AppIcon';
import { AppPageTitle } from '@/presentation/components/AppPageTitle';
import { AppScreen } from '@/presentation/components/AppScreen';
import { AppSectionHeader } from '@/presentation/components/AppSectionHeader';
import { AppStateView } from '@/presentation/components/AppStateView';
import { AppText } from '@/presentation/components/AppText';
import { CatalogHorizontalList } from '@/presentation/components/CatalogHorizontalList';
import { CatalogSkeletonRow } from '@/presentation/components/CatalogSkeletonRow';
import { useHomeCatalog } from '@/presentation/hooks/useHomeCatalog';
import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

export function HomeScreen() {
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const isCompactLayout = width < 720;

  const {
    trending,
    popularMovies,
    popularTv,
    isLoading,
    errorMessage,
    retry,
  } = useHomeCatalog();

  const renderCatalog = () => {
    if (isLoading) {
      return (
        <>
          <View style={styles.section}>
            <AppSectionHeader title="Em alta" />
            <CatalogSkeletonRow />
          </View>
          <View style={styles.section}>
            <AppSectionHeader title="Filmes populares" />
            <CatalogSkeletonRow />
          </View>
          <View style={styles.section}>
            <AppSectionHeader title="Séries populares" />
            <CatalogSkeletonRow />
          </View>
        </>
      );
    }

    if (errorMessage) {
      return (
        <AppStateView
          actionLabel="Tentar novamente"
          description={errorMessage}
          onActionPress={retry}
          title="Catálogo indisponível"
          variant="error"
        />
      );
    }

    return (
      <>
        <View style={styles.section}>
          <AppSectionHeader title="Em alta hoje" />
          <CatalogHorizontalList items={trending} />
        </View>
        <View style={styles.section}>
          <AppSectionHeader
            actionLabel="Buscar"
            onActionPress={() => router.push('/(tabs)/buscar')}
            title="Filmes populares"
          />
          <CatalogHorizontalList items={popularMovies} />
        </View>
        <View style={styles.section}>
          <AppSectionHeader title="Séries populares" />
          <CatalogHorizontalList items={popularTv} />
        </View>
      </>
    );
  };

  return (
    <AppScreen bottomSpacing={96} contentStyle={styles.container} scroll>
      <AppHeader />
      <AppPageTitle
        description="Encontre informações completas e descubra onde assistir no Brasil."
        title="Sua próxima história começa aqui"
      />

      <View
        style={[
          styles.informationSection,
          {
            borderColor: colors.border,
          },
        ]}
      >
        <AppText style={styles.informationTitle}>
          Tudo para escolher o que assistir
        </AppText>

        <View
          style={[
            styles.informationGrid,
            isCompactLayout && styles.informationGridCompact,
          ]}
        >
          <View style={styles.informationItem}>
            <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
              <AppIcon color={colors.primary} name="movie" size={22} />
            </View>
            <View style={styles.informationContent}>
              <AppText style={styles.itemTitle}>Catálogo completo</AppText>
              <AppText secondary style={styles.itemDescription}>
                Informações de filmes e séries, incluindo elenco, gêneros,
                duração e trailers.
              </AppText>
            </View>
          </View>

          <View
            style={[
              isCompactLayout ? styles.horizontalDivider : styles.verticalDivider,
              { backgroundColor: colors.border },
            ]}
          />

          <View style={styles.informationItem}>
            <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
              <AppIcon color={colors.primary} name="streaming" size={22} />
            </View>
            <View style={styles.informationContent}>
              <AppText style={styles.itemTitle}>Onde assistir no Brasil</AppText>
              <AppText secondary style={styles.itemDescription}>
                Disponibilidade para assinatura, aluguel e compra nas principais
                plataformas.
              </AppText>
            </View>
          </View>
        </View>
      </View>

      {renderCatalog()}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 22,
  },
  informationSection: {
    gap: 18,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 20,
  },
  informationTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  informationGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 22,
  },
  informationGridCompact: {
    flexDirection: 'column',
    gap: 16,
  },
  informationItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
  },
  iconContainer: {
    width: 42,
    height: 42,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  informationContent: {
    flex: 1,
    gap: 5,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  itemDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  verticalDivider: {
    width: 1,
  },
  horizontalDivider: {
    height: 1,
  },
  section: {
    gap: 12,
  },
});

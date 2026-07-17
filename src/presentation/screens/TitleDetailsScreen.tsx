import { router } from 'expo-router';
import {
  Alert,
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import type { MediaType } from '@/domain/models/CatalogItemSummary';
import type { TitleDetails } from '@/domain/models/TitleDetails';
import { AppIcon } from '@/presentation/components/AppIcon';
import { AppScreen } from '@/presentation/components/AppScreen';
import { AppSectionHeader } from '@/presentation/components/AppSectionHeader';
import { AppStateView } from '@/presentation/components/AppStateView';
import { AppText } from '@/presentation/components/AppText';
import { CatalogPoster } from '@/presentation/components/CatalogPoster';
import { PersonCard } from '@/presentation/components/PersonCard';
import { SeasonCard } from '@/presentation/components/SeasonCard';
import { TitleActionButton } from '@/presentation/components/TitleActionButton';
import { TitleDetailsSkeleton } from '@/presentation/components/TitleDetailsSkeleton';
import { WatchProviderGroup } from '@/presentation/components/WatchProviderGroup';
import { useTitleDetails } from '@/presentation/hooks/useTitleDetails';
import { useAppTheme } from '@/presentation/theme/AppThemeProvider';
import { TMDB } from '@/shared/constants/tmdb';

type TitleDetailsScreenProps = {
  mediaType: MediaType;
  id: number;
};

function formatRuntime(minutes?: number | null): string | null {
  if (!minutes || minutes <= 0) {
    return null;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours === 0) {
    return `${remainder} min`;
  }

  return remainder > 0 ? `${hours}h ${remainder}min` : `${hours}h`;
}

function buildMetadata(details: TitleDetails): string[] {
  const runtime = formatRuntime(
    details.mediaType === 'movie'
      ? details.runtimeMinutes
      : details.episodeRuntimeMinutes,
  );

  return [
    details.mediaType === 'movie' ? 'Filme' : 'Série',
    details.releaseYear ? String(details.releaseYear) : null,
    runtime
      ? details.mediaType === 'tv'
        ? `${runtime} por episódio`
        : runtime
      : null,
    details.certification
      ? `Classificação ${details.certification}`
      : null,
  ].filter((value): value is string => Boolean(value));
}

export function TitleDetailsScreen({
  mediaType,
  id,
}: TitleDetailsScreenProps) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const {
    details,
    status,
    errorMessage,
    retry,
    isFavorite,
    isInWatchlist,
    isUpdatingLibrary,
    libraryError,
    toggleFavorite,
    toggleWatchlist,
  } = useTitleDetails(mediaType, id);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/inicio');
  };

  const openExternalUrl = async (url: string, errorText: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Não foi possível abrir', errorText);
    }
  };

  const shareTitle = async () => {
    if (!details) {
      return;
    }

    try {
      await Share.share({
        title: details.title,
        message: `Confira “${details.title}” no Coruja — Sobre filmes e séries.`,
      });
    } catch {
      Alert.alert('Compartilhamento indisponível', 'Não foi possível compartilhar este título.');
    }
  };

  if (status === 'loading') {
    return (
      <AppScreen contentStyle={styles.noPadding} scroll>
        <TitleDetailsSkeleton />
      </AppScreen>
    );
  }

  if (status === 'error' || !details) {
    return (
      <AppScreen contentStyle={styles.errorContainer}>
        <Pressable
          accessibilityLabel="Voltar"
          accessibilityRole="button"
          onPress={goBack}
          style={[styles.standaloneBack, { backgroundColor: colors.surface }]}
        >
          <AppIcon color={colors.text} name="back" size={24} />
        </Pressable>
        <AppStateView
          actionLabel="Tentar novamente"
          description={errorMessage ?? 'Não foi possível carregar este título.'}
          onActionPress={retry}
          title="Detalhes indisponíveis"
          variant="error"
        />
      </AppScreen>
    );
  }

  const metadata = buildMetadata(details);
  const providers = details.watchProviders;
  const hasProviders =
    providers.subscription.length > 0 ||
    providers.rent.length > 0 ||
    providers.buy.length > 0;
  const originalTitleIsDifferent =
    details.originalTitle &&
    details.originalTitle.toLocaleLowerCase() !==
      details.title.toLocaleLowerCase();
  const heroPosterWidth = isWide ? 170 : 116;
  const heroPosterHeight = isWide ? 255 : 174;

  return (
    <AppScreen contentStyle={styles.noPadding} scroll>
      <ImageBackground
        resizeMode="cover"
        source={
          details.backdropPath
            ? {
                uri: `${TMDB.imageBaseUrl}/${TMDB.backdropSize}${details.backdropPath}`,
              }
            : undefined
        }
        style={styles.hero}
      >
        <View style={[styles.heroOverlay, { backgroundColor: colors.overlay }]} />
        <Pressable
          accessibilityLabel="Voltar"
          accessibilityRole="button"
          onPress={goBack}
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: 'rgba(11, 15, 20, 0.78)', opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <AppIcon color="#FFFFFF" name="back" size={25} />
        </Pressable>

        <View style={[styles.heroContent, isWide && styles.heroContentWide]}>
          <View
            style={[
              styles.heroPoster,
              { borderColor: 'rgba(255, 255, 255, 0.22)' },
            ]}
          >
            <CatalogPoster
              height={heroPosterHeight}
              posterPath={details.posterPath}
              width={heroPosterWidth}
            />
          </View>
          <View style={styles.heroText}>
            <AppText style={styles.heroTitle}>{details.title}</AppText>
            {originalTitleIsDifferent ? (
              <AppText numberOfLines={2} style={styles.originalTitle}>
                Título original: {details.originalTitle}
              </AppText>
            ) : null}
            {details.tagline ? (
              <AppText numberOfLines={2} style={styles.tagline}>
                {details.tagline}
              </AppText>
            ) : null}
            <View style={styles.heroMetadata}>
              {metadata.map((value) => (
                <View
                  key={value}
                  style={styles.heroMetadataItem}
                >
                  <AppText style={styles.heroMetadataText}>{value}</AppText>
                </View>
              ))}
              {typeof details.voteAverage === 'number' &&
              details.voteAverage > 0 ? (
                <View style={styles.heroMetadataItem}>
                  <AppIcon color="#FFD166" name="star" size={14} />
                  <AppText style={styles.heroMetadataText}>
                    {details.voteAverage.toFixed(1)}
                  </AppText>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.mainContent}>
        <View style={styles.actions}>
          <TitleActionButton
            disabled={isUpdatingLibrary}
            icon="favorite"
            label="Favorito"
            onPress={() => void toggleFavorite()}
            selected={isFavorite}
          />
          <TitleActionButton
            disabled={isUpdatingLibrary}
            icon="watchlist"
            label="Quero assistir"
            onPress={() => void toggleWatchlist()}
            selected={isInWatchlist}
          />
          <TitleActionButton
            icon="share"
            label="Compartilhar"
            onPress={() => void shareTitle()}
          />
        </View>

        {libraryError ? (
          <AppText style={[styles.libraryError, { color: colors.primary }]}>
            {libraryError}
          </AppText>
        ) : null}

        {details.genres.length > 0 ? (
          <View style={styles.genreList}>
            {details.genres.map((genre) => (
              <View
                key={genre.id}
                style={[
                  styles.genreChip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <AppText secondary style={styles.genreText}>
                  {genre.name}
                </AppText>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <AppSectionHeader title="Sinopse" />
          <AppText secondary style={styles.overview}>
            {details.overview || 'Sinopse ainda não disponível em português.'}
          </AppText>
        </View>

        {details.keyPeople.length > 0 ? (
          <View style={styles.section}>
            <AppSectionHeader
              title={details.mediaType === 'movie' ? 'Direção e roteiro' : 'Criação e equipe principal'}
            />
            <ScrollView
              contentContainerStyle={styles.horizontalContent}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {details.keyPeople.map((person) => (
                <PersonCard
                  key={`${person.id}:${person.role}`}
                  name={person.name}
                  profilePath={person.profilePath}
                  subtitle={person.role}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {details.cast.length > 0 ? (
          <View style={styles.section}>
            <AppSectionHeader title="Elenco principal" />
            <ScrollView
              contentContainerStyle={styles.horizontalContent}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {details.cast.map((person) => (
                <PersonCard
                  key={person.id}
                  name={person.name}
                  profilePath={person.profilePath}
                  subtitle={person.character}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.section}>
          <AppSectionHeader title="Trailer" />
          {details.trailer ? (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                void openExternalUrl(
                  `https://www.youtube.com/watch?v=${details.trailer?.key}`,
                  'O trailer não pôde ser aberto no YouTube.',
                )
              }
              style={({ pressed }) => [
                styles.primaryCardAction,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.72 : 1,
                },
              ]}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primary }]}>
                <AppIcon color="#FFFFFF" name="play" size={26} />
              </View>
              <View style={styles.cardActionText}>
                <AppText style={styles.cardActionTitle}>Assistir ao trailer</AppText>
                <AppText numberOfLines={2} secondary style={styles.cardActionDescription}>
                  {details.trailer.name}
                </AppText>
              </View>
              <AppIcon color={colors.textSecondary} name="external" size={21} />
            </Pressable>
          ) : (
            <AppText secondary style={styles.emptyText}>
              Nenhum trailer oficial foi encontrado para este título.
            </AppText>
          )}
        </View>

        <View style={styles.section}>
          <AppSectionHeader title="Onde assistir no Brasil" />
          {hasProviders ? (
            <View
              style={[
                styles.providerCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <WatchProviderGroup
                providers={providers.subscription}
                title="Assinatura"
              />
              <WatchProviderGroup providers={providers.rent} title="Aluguel" />
              <WatchProviderGroup providers={providers.buy} title="Compra" />
              {providers.link ? (
                <Pressable
                  accessibilityRole="link"
                  onPress={() =>
                    void openExternalUrl(
                      providers.link!,
                      'As opções de onde assistir não puderam ser abertas.',
                    )
                  }
                  style={({ pressed }) => [
                    styles.providerLink,
                    { borderTopColor: colors.border, opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <AppText style={[styles.providerLinkText, { color: colors.secondary }]}>
                    Ver opções e links disponíveis
                  </AppText>
                  <AppIcon color={colors.secondary} name="external" size={19} />
                </Pressable>
              ) : null}
              <AppText secondary style={styles.attribution}>
                Disponibilidade fornecida pela JustWatch por meio do TMDB. Os catálogos podem mudar sem aviso.
              </AppText>
            </View>
          ) : (
            <View
              style={[
                styles.emptyProviderCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <AppIcon color={colors.textSecondary} name="streaming" size={30} />
              <AppText secondary style={styles.emptyText}>
                Nenhuma opção de assinatura, aluguel ou compra foi localizada no Brasil.
              </AppText>
            </View>
          )}
        </View>

        {details.mediaType === 'tv' && details.seasons.length > 0 ? (
          <View style={styles.section}>
            <AppSectionHeader title="Temporadas" />
            <AppText secondary style={styles.seasonSummary}>
              {details.numberOfSeasons ?? details.seasons.length} temporadas
              {details.numberOfEpisodes
                ? ` · ${details.numberOfEpisodes} episódios`
                : ''}
            </AppText>
            <ScrollView
              contentContainerStyle={styles.horizontalContent}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {details.seasons.map((season) => (
                <SeasonCard key={season.id} season={season} />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <AppText secondary style={styles.tmdbAttribution}>
          Informações de filmes e séries fornecidas pelo TMDB.
        </AppText>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  noPadding: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  errorContainer: {
    gap: 18,
  },
  standaloneBack: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  hero: {
    minHeight: 330,
    justifyContent: 'flex-end',
    backgroundColor: '#161D26',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 18,
    zIndex: 2,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  heroContent: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 92,
    paddingBottom: 22,
  },
  heroContentWide: {
    gap: 28,
    paddingHorizontal: 32,
    paddingBottom: 30,
  },
  heroPoster: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 16,
  },
  heroText: {
    flex: 1,
    gap: 8,
    paddingBottom: 2,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  originalTitle: {
    color: '#D9E1E8',
    fontSize: 12,
    lineHeight: 17,
  },
  tagline: {
    color: '#F2F4F7',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  heroMetadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 2,
  },
  heroMetadataItem: {
    minHeight: 27,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 14,
    paddingHorizontal: 9,
    backgroundColor: 'rgba(11, 15, 20, 0.74)',
  },
  heroMetadataText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  mainContent: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    gap: 26,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 40,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  libraryError: {
    marginTop: -18,
    fontSize: 12,
    fontWeight: '700',
  },
  genreList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: -8,
  },
  genreChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  genreText: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    gap: 12,
  },
  overview: {
    fontSize: 15,
    lineHeight: 24,
  },
  horizontalContent: {
    gap: 12,
    paddingRight: 20,
  },
  primaryCardAction: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  actionIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  cardActionText: {
    flex: 1,
    gap: 4,
  },
  cardActionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  cardActionDescription: {
    fontSize: 12,
    lineHeight: 17,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 20,
  },
  providerCard: {
    gap: 18,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  providerLink: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderTopWidth: 1,
    paddingTop: 14,
  },
  providerLinkText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
  },
  attribution: {
    fontSize: 10,
    lineHeight: 15,
  },
  emptyProviderCard: {
    minHeight: 112,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
  },
  seasonSummary: {
    marginTop: -8,
    fontSize: 12,
  },
  tmdbAttribution: {
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
  },
});

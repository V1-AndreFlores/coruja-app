import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/presentation/components/AppHeader';
import { AppIcon } from '@/presentation/components/AppIcon';
import { AppPageTitle } from '@/presentation/components/AppPageTitle';
import { AppScreen } from '@/presentation/components/AppScreen';
import { AppText } from '@/presentation/components/AppText';
import { SettingsCard } from '@/presentation/components/SettingsCard';
import { SettingsLinkRow } from '@/presentation/components/SettingsLinkRow';
import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

const PRIVACY_POLICY_URL =
  'https://v1-andreflores.github.io/politica-de-privacidade/coruja/';
const DEVELOPER_SITE_URL = 'https://v1-andreflores.github.io/';
const DEVELOPER_EMAIL = 'dr.andre.flores@gmail.com';
const TMDB_URL = 'https://www.themoviedb.org/';
const JUSTWATCH_URL = 'https://www.justwatch.com/br';

export function AboutScreen() {
  const { colors } = useAppTheme();
  const [linkError, setLinkError] = useState<string>();
  const appVersion = Constants.expoConfig?.version ?? '2.0.0';
  const versionCode = Constants.expoConfig?.android?.versionCode;

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/ajustes');
  };

  const openExternalUrl = useCallback(async (url: string) => {
    setLinkError(undefined);

    try {
      await Linking.openURL(url);
    } catch {
      setLinkError('Não foi possível abrir o link solicitado neste dispositivo.');
    }
  }, []);

  const contactDeveloper = () => {
    const subject = encodeURIComponent('Contato sobre o aplicativo Coruja');
    void openExternalUrl(`mailto:${DEVELOPER_EMAIL}?subject=${subject}`);
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
        description="Informações do aplicativo, fontes de dados, créditos e privacidade."
        title="Sobre o Coruja"
      />

      <SettingsCard
        description="Aplicativo gratuito para pesquisar filmes e séries, consultar informações detalhadas e descobrir onde assistir no Brasil."
        title="Coruja — Sobre filmes e séries"
      >
        <SettingsLinkRow
          description={`Versão ${appVersion}${versionCode ? ` · Código ${versionCode}` : ''}`}
          icon="info"
          title="Versão instalada"
        />
        <SettingsLinkRow
          description="Sem anúncios, sem login obrigatório e com dados pessoais de biblioteca armazenados somente no aparelho."
          icon="privacy"
          title="Uso gratuito e local"
        />
      </SettingsCard>

      <SettingsCard title="Desenvolvimento">
        <SettingsLinkRow
          description="Desenvolvedor responsável pelo aplicativo."
          icon="person"
          title="André Flores"
        />
        <SettingsLinkRow
          description={DEVELOPER_EMAIL}
          icon="external"
          onPress={contactDeveloper}
          title="Entrar em contato"
        />
        <SettingsLinkRow
          description="Conheça outros projetos e informações profissionais."
          icon="external"
          onPress={() => void openExternalUrl(DEVELOPER_SITE_URL)}
          title="Site do desenvolvedor"
        />
      </SettingsCard>

      <SettingsCard
        description="O catálogo, as imagens e parte das informações exibidas pelo Coruja são obtidos por integrações externas."
        title="Fontes de dados e créditos"
      >
        <SettingsLinkRow
          description="This product uses the TMDB API but is not endorsed or certified by TMDB."
          icon="movie"
          title="The Movie Database (TMDB)"
        />
        <SettingsLinkRow
          description="Abrir o site oficial do TMDB."
          icon="external"
          onPress={() => void openExternalUrl(TMDB_URL)}
          title="Conhecer o TMDB"
        />
        <SettingsLinkRow
          description="Os dados de disponibilidade para assinatura, aluguel e compra são fornecidos pelo TMDB em parceria com a JustWatch."
          icon="streaming"
          title="Disponibilidade de streaming"
        />
        <SettingsLinkRow
          description="Abrir a plataforma JustWatch para o Brasil."
          icon="external"
          onPress={() => void openExternalUrl(JUSTWATCH_URL)}
          title="Conhecer a JustWatch"
        />
      </SettingsCard>

      <SettingsCard
        description="O Coruja não exige cadastro. Favoritos, Quero assistir, histórico e preferência de tema permanecem no aparelho."
        title="Privacidade"
      >
        <SettingsLinkRow
          description="Consulte os detalhes sobre dados locais, integrações e contato."
          icon="privacy"
          onPress={() => void openExternalUrl(PRIVACY_POLICY_URL)}
          title="Política de privacidade"
        />
        <SettingsLinkRow
          description="Revise ou apague Favoritos, Quero assistir e histórico."
          icon="database"
          onPress={() => router.push('/data-management')}
          title="Gerenciar dados locais"
        />
      </SettingsCard>

      {linkError ? (
        <View
          accessibilityLiveRegion="assertive"
          style={[
            styles.feedback,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <AppIcon color={colors.primary} name="error" size={20} />
          <AppText style={[styles.feedbackText, { color: colors.primary }]}>
            {linkError}
          </AppText>
        </View>
      ) : null}

      <View style={styles.footer}>
        <AppText secondary style={styles.footerText}>
          Desenvolvido no Brasil · Conteúdo disponível conforme os dados das fontes externas
        </AppText>
      </View>
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
  footer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerText: {
    maxWidth: 620,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});

import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/presentation/components/AppHeader';
import { AppPageTitle } from '@/presentation/components/AppPageTitle';
import { AppScreen } from '@/presentation/components/AppScreen';
import { AppText } from '@/presentation/components/AppText';
import { SettingsCard } from '@/presentation/components/SettingsCard';
import { SettingsLinkRow } from '@/presentation/components/SettingsLinkRow';
import { ThemeSelector } from '@/presentation/components/ThemeSelector';

const PRIVACY_POLICY_URL =
  'https://v1-andreflores.github.io/politica-de-privacidade/coruja/';

export function SettingsScreen() {
  return (
    <AppScreen bottomSpacing={96} contentStyle={styles.container} scroll>
      <AppHeader compact />
      <AppPageTitle
        description="Preferências, dados locais e informações do aplicativo."
        title="Ajustes"
      />

      <SettingsCard
        description="O tema escuro é o padrão inicial. Sua escolha fica salva no aparelho."
        title="Aparência"
      >
        <ThemeSelector />
      </SettingsCard>

      <SettingsCard title="Dados locais">
        <SettingsLinkRow
          description="Favoritos, Quero assistir e histórico ficam somente neste aparelho."
          icon="database"
          title="Armazenamento no aparelho"
        />
        <SettingsLinkRow
          description="Consulte ou remova os últimos 100 títulos visualizados."
          icon="history"
          onPress={() => router.push('/history')}
          title="Histórico de visualizações"
        />
        <SettingsLinkRow
          description="Consulte quantidades e limpe Favoritos, Quero assistir ou histórico."
          icon="database"
          onPress={() => router.push('/data-management')}
          title="Gerenciar dados locais"
        />
      </SettingsCard>

      <SettingsCard title="Sobre e privacidade">
        <SettingsLinkRow
          description="Versão, desenvolvimento, fontes de dados, TMDB e JustWatch."
          icon="info"
          onPress={() => router.push('/about')}
          title="Sobre o Coruja e créditos"
        />
        <SettingsLinkRow
          description="Consulte como o Coruja trata dados locais e integrações."
          icon="privacy"
          onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}
          title="Política de privacidade"
        />
      </SettingsCard>

      <View style={styles.footer}>
        <AppText secondary style={styles.footerText}>
          Gratuito · Sem anúncios · Sem login obrigatório
        </AppText>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

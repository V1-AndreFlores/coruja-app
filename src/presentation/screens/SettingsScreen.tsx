import Constants from 'expo-constants';
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
  const appVersion = Constants.expoConfig?.version ?? '2.0.0';

  return (
    <AppScreen contentStyle={styles.container} scroll>
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
          description="Favoritos, lista Quero assistir e histórico preparados para persistência local."
          icon="database"
          title="Armazenamento no aparelho"
        />
        <SettingsLinkRow
          description="O histórico poderá ser limpo quando a funcionalidade estiver disponível."
          icon="history"
          title="Histórico de visualizações"
        />
      </SettingsCard>

      <SettingsCard title="Privacidade e aplicativo">
        <SettingsLinkRow
          description="Consulte como o Coruja tratará dados e integrações."
          icon="privacy"
          onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}
          title="Política de privacidade"
        />
        <SettingsLinkRow
          description={`Versão ${appVersion}`}
          icon="info"
          title="Coruja — Sobre filmes e séries"
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

import { LocalLibraryScreen } from '@/presentation/components/LocalLibraryScreen';

export function WatchlistScreen() {
  return (
    <LocalLibraryScreen
      confirmationDescription={(item) =>
        `“${item.title}” será removido somente da lista Quero assistir. Seus Favoritos não serão alterados.`
      }
      confirmationTitle="Remover de Quero assistir?"
      description="Guarde títulos para decidir o que assistir depois."
      emptyActionLabel="Explorar catálogo"
      emptyDescription="Os títulos adicionados à sua lista ficarão armazenados neste aparelho."
      emptyTitle="Sua lista está vazia"
      kind="watchlist"
      title="Quero assistir"
    />
  );
}

import { LocalLibraryScreen } from '@/presentation/components/LocalLibraryScreen';

export function FavoritesScreen() {
  return (
    <LocalLibraryScreen
      confirmationDescription={(item) =>
        `“${item.title}” será removido somente dos Favoritos. A lista Quero assistir não será alterada.`
      }
      confirmationTitle="Remover dos Favoritos?"
      description="Seus filmes e séries preferidos, disponíveis mesmo sem login."
      emptyActionLabel="Encontrar títulos"
      emptyDescription="Marque filmes e séries como favoritos para encontrá-los rapidamente."
      emptyTitle="Nenhum favorito ainda"
      kind="favorites"
      title="Favoritos"
    />
  );
}

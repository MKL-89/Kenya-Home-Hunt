import { MainLayout } from "@/components/layout/MainLayout";
import { useListFavorites, getListFavoritesQueryKey } from "@workspace/api-client-react";
import { HouseCard } from "@/components/HouseCard";
import { HeartCrack, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function Favorites() {
  const { data: favorites, isLoading } = useListFavorites({
    query: { queryKey: getListFavoritesQueryKey() }
  });

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Saved Properties</h1>
        <p className="text-muted-foreground mb-8">Properties you have saved for later.</p>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : favorites && favorites.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map(house => (
              <HouseCard key={house.id} house={house} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 max-w-md mx-auto">
            <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartCrack className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-8">
              Keep track of properties you're interested in by saving them to your favorites.
            </p>
            <Button asChild size="lg">
              <Link href="/map">Explore Map</Link>
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

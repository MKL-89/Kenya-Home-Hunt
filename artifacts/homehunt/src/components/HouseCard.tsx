import { Link } from "wouter";
import { formatCurrency } from "@/lib/format";
import { MapPin, Bed, Bath, Heart } from "lucide-react";
import { House, useAddFavorite, useRemoveFavorite } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getListHousesQueryKey, getListFavoritesQueryKey, getGetHouseQueryKey } from "@workspace/api-client-react";

export function HouseCard({ house }: { house: House }) {
  const queryClient = useQueryClient();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (house.isFavorited) {
        await removeFavorite.mutateAsync({ houseId: house.id });
        toast.success("Removed from favorites");
      } else {
        await addFavorite.mutateAsync({ houseId: house.id });
        toast.success("Added to favorites");
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: getListHousesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetHouseQueryKey(house.id) });
    } catch (error) {
      toast.error("Failed to update favorite");
    }
  };

  return (
    <Link href={`/house/${house.id}`}>
      <div className="group rounded-xl border bg-card text-card-foreground overflow-hidden hover-elevate transition-all cursor-pointer h-full flex flex-col">
        <div className="aspect-[4/3] relative bg-muted">
          {house.images && house.images.length > 0 ? (
            <img 
              src={house.images[0]} 
              alt={house.title} 
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
              No image
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant={house.status === "vacant" ? "default" : "secondary"} className="shadow-sm font-medium">
              {house.status === "vacant" ? "Vacant" : "Occupied"}
            </Badge>
          </div>
          <Button 
            size="icon" 
            variant="secondary" 
            className="absolute top-3 right-3 rounded-full h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={handleFavoriteToggle}
          >
            <Heart className={`h-4 w-4 ${house.isFavorited ? "fill-destructive text-destructive" : ""}`} />
          </Button>
        </div>
        
        <div className="p-4 flex-1 flex flex-col">
          <div className="text-xl font-bold text-primary mb-1">
            {formatCurrency(house.rentPrice)}
            <span className="text-sm font-normal text-muted-foreground"> /month</span>
          </div>
          <h3 className="font-semibold line-clamp-1 mb-2">{house.title}</h3>
          
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <MapPin className="h-3.5 w-3.5 mr-1 shrink-0" />
            <span className="line-clamp-1">{house.address}, {house.city}</span>
          </div>
          
          <div className="mt-auto flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
            {house.bedrooms !== undefined && house.bedrooms > 0 && (
              <div className="flex items-center gap-1.5">
                <Bed className="h-4 w-4" />
                <span>{house.bedrooms} Beds</span>
              </div>
            )}
            {house.bathrooms !== undefined && house.bathrooms > 0 && (
              <div className="flex items-center gap-1.5">
                <Bath className="h-4 w-4" />
                <span>{house.bathrooms} Baths</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

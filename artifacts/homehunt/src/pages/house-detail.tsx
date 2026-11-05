import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  useGetHouse, getGetHouseQueryKey,
  useAddFavorite, useRemoveFavorite,
  getListFavoritesQueryKey, getListHousesQueryKey,
  useSendInquiry, useGetMe, getGetMeQueryKey,
} from "@workspace/api-client-react";
import { useUser } from "@clerk/react";
import { useParams, Link, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Bed, Bath, ArrowLeft, Heart, Phone, User, CheckCircle2, Send, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { PropertyMap } from "@/components/Map";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function HouseDetail() {
  const { id } = useParams<{ id: string }>();
  const houseId = parseInt(id || "0");
  const { isSignedIn } = useUser();
  const [, setLocation] = useLocation();
  const { data: me } = useGetMe({
    query: { enabled: !!isSignedIn, retry: false, queryKey: getGetMeQueryKey() },
  });
  
  const queryClient = useQueryClient();
  const { data: house, isLoading } = useGetHouse(houseId, {
    query: { enabled: !!houseId, queryKey: getGetHouseQueryKey(houseId) }
  });

  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const sendInquiry = useSendInquiry();

  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquirySent, setInquirySent] = useState(false);

  const handleSendInquiry = async () => {
    if (!inquiryMessage.trim() || inquiryMessage.length < 10) {
      toast.error("Message must be at least 10 characters");
      return;
    }
    try {
      await sendInquiry.mutateAsync({
        data: { houseId, message: inquiryMessage, tenantPhone: inquiryPhone || undefined },
      });
      setInquirySent(true);
      toast.success("Message sent to landlord!");
    } catch (err: unknown) {
      const apiMessage = (err as { data?: { error?: string } })?.data?.error;
      toast.error(apiMessage || "Failed to send message");
    }
  };

  const handleFavoriteToggle = async () => {
    if (!house) return;
    if (!isSignedIn) {
      setLocation("/sign-in");
      return;
    }
    try {
      if (house.isFavorited) {
        await removeFavorite.mutateAsync({ houseId: house.id });
        toast.success("Removed from favorites");
      } else {
        await addFavorite.mutateAsync({ houseId: house.id });
        toast.success("Added to favorites");
      }
      queryClient.invalidateQueries({ queryKey: getGetHouseQueryKey(house.id) });
      queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListHousesQueryKey() });
    } catch (error) {
      toast.error("Failed to update favorite");
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8 max-w-5xl space-y-8">
          <Skeleton className="h-8 w-24 mb-4" />
          <Skeleton className="h-[400px] w-full rounded-2xl" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div>
              <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!house) {
    return (
      <MainLayout>
        <div className="container py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">Property not found</h1>
          <Button asChild><Link href="/map">Back to Map</Link></Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8 max-w-6xl">
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-3 text-muted-foreground hover:text-foreground">
          <Link href="/map"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
        </Button>

        {house.images && house.images.length > 0 ? (
          <div className="mb-10 w-full overflow-hidden rounded-2xl border bg-muted/20">
            <Carousel className="w-full">
              <CarouselContent>
                {house.images.map((img, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-[21/9] w-full relative">
                      <img src={img} alt={`${house.title} - Image ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {house.images.length > 1 && (
                <>
                  <CarouselPrevious className="left-4 bg-background/50 hover:bg-background backdrop-blur" />
                  <CarouselNext className="right-4 bg-background/50 hover:bg-background backdrop-blur" />
                </>
              )}
            </Carousel>
          </div>
        ) : (
          <div className="mb-10 aspect-[21/9] w-full rounded-2xl border bg-muted flex items-center justify-center text-muted-foreground">
            No images available
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-8">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Badge variant={house.status === "vacant" ? "default" : "secondary"} className="text-sm px-3 py-1">
                  {house.status === "vacant" ? "Vacant" : "Occupied"}
                </Badge>
                <div className="flex items-center text-muted-foreground text-sm">
                  <MapPin className="mr-1 h-4 w-4" />
                  {[house.address, house.estate, house.town, house.county || house.city].filter(Boolean).join(", ")}
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-4">{house.title}</h1>
              <div className="flex flex-wrap gap-6 text-muted-foreground border-y py-4 my-6">
                {house.propertyType && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm font-medium">{house.propertyType}</Badge>
                  </div>
                )}
                {house.bedrooms !== undefined && house.bedrooms > 0 && (
                  <div className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">{house.bedrooms}</span> Bedrooms
                  </div>
                )}
                {house.bathrooms !== undefined && house.bathrooms > 0 && (
                  <div className="flex items-center gap-2">
                    <Bath className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">{house.bathrooms}</span> Bathrooms
                  </div>
                )}
              </div>
            </div>

            {house.description && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <div className="prose dark:prose-invert max-w-none text-muted-foreground whitespace-pre-line">
                  {house.description}
                </div>
              </div>
            )}

            {house.amenities && house.amenities.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4">
                  {house.amenities.map(amenity => (
                    <div key={amenity} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Location</h2>
              <div className="h-[300px] rounded-xl overflow-hidden border z-0 relative">
                <PropertyMap 
                  houses={[house]} 
                  center={[house.latitude, house.longitude]} 
                  zoom={14} 
                  interactive={false} 
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm sticky top-24">
              <div className="text-3xl font-bold text-primary mb-1">
                {formatCurrency(house.rentPrice)}
              </div>
              <div className="text-muted-foreground text-sm mb-6">per month</div>

              <div className="space-y-4">
                <Button 
                  className="w-full py-6 text-lg" 
                  size="lg"
                  variant={house.isFavorited ? "secondary" : "default"}
                  onClick={handleFavoriteToggle}
                >
                  <Heart className={`mr-2 h-5 w-5 ${house.isFavorited ? "fill-current text-destructive" : ""}`} />
                  {house.isFavorited ? "Saved to Favorites" : "Save to Favorites"}
                </Button>
                
                <div className="pt-6 mt-6 border-t">
                  <h3 className="font-semibold mb-4">Contact Landlord</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">{house.landlordName || "Landlord"}</div>
                      {(house.contactPhone || house.landlordPhone) && (
                        <a
                          href={`tel:${house.contactPhone || house.landlordPhone}`}
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" />{house.contactPhone || house.landlordPhone}
                        </a>
                      )}
                    </div>
                  </div>

                  {me && house.landlordId === me.id ? (
                    <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
                      This is your listing.{" "}
                      <Link href={`/edit-house/${house.id}`} className="text-primary hover:underline">Edit it</Link>
                    </div>
                  ) : !isSignedIn ? (
                    <Link href="/sign-in">
                      <Button variant="outline" className="w-full">
                        Sign in to send a message
                      </Button>
                    </Link>
                  ) : inquirySent ? (
                    <div className="rounded-lg bg-primary/10 p-4 text-center">
                      <CheckCircle2 className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium text-primary">Message sent!</p>
                      <p className="text-xs text-muted-foreground mt-1">The landlord will be in touch.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Your phone (optional)</Label>
                        <Input
                          placeholder="+254 712 345 678"
                          value={inquiryPhone}
                          onChange={(e) => setInquiryPhone(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Message</Label>
                        <Textarea
                          placeholder="Hi, I'm interested in this property. Is it still available?"
                          value={inquiryMessage}
                          onChange={(e) => setInquiryMessage(e.target.value)}
                          className="min-h-[100px] resize-none"
                        />
                      </div>
                      <Button
                        className="w-full"
                        onClick={handleSendInquiry}
                        disabled={sendInquiry.isPending || inquiryMessage.length < 10}
                      >
                        {sendInquiry.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="mr-2 h-4 w-4" />
                        )}
                        Send Message
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

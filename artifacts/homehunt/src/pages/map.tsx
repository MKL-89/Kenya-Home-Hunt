import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PropertyMap } from "@/components/Map";
import { useListHouses, getListHousesQueryKey } from "@workspace/api-client-react";
import { HouseCard } from "@/components/HouseCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Search, SlidersHorizontal, MapPin } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";

export function MapPage() {
  const [city, setCity] = useState<string>("all");
  const [minRent, setMinRent] = useState<string>("");
  const [maxRent, setMaxRent] = useState<string>("");
  const [bedrooms, setBedrooms] = useState<string>("all");

  const queryParams = {
    status: "vacant" as const,
    ...(city !== "all" && { city }),
    ...(minRent && { minRent: parseInt(minRent) }),
    ...(maxRent && { maxRent: parseInt(maxRent) }),
    ...(bedrooms !== "all" && { bedrooms: parseInt(bedrooms) }),
  };

  const { data: houses, isLoading } = useListHouses(queryParams, {
    query: { queryKey: getListHousesQueryKey(queryParams) }
  });

  const cities = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"];

  const FilterContent = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">City</label>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger>
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Min Rent</label>
          <Input 
            type="number" 
            placeholder="Min" 
            value={minRent} 
            onChange={(e) => setMinRent(e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Max Rent</label>
          <Input 
            type="number" 
            placeholder="Max" 
            value={maxRent} 
            onChange={(e) => setMaxRent(e.target.value)} 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Bedrooms</label>
        <Select value={bedrooms} onValueChange={setBedrooms}>
          <SelectTrigger>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="1">1+</SelectItem>
            <SelectItem value="2">2+</SelectItem>
            <SelectItem value="3">3+</SelectItem>
            <SelectItem value="4">4+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        variant="outline" 
        className="w-full mt-2"
        onClick={() => {
          setCity("all");
          setMinRent("");
          setMaxRent("");
          setBedrooms("all");
        }}
      >
        Clear Filters
      </Button>
    </div>
  );

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-64px)] w-full relative overflow-hidden">
        {/* Sidebar for Desktop */}
        <div className="hidden md:flex w-[400px] flex-col border-r bg-background shrink-0 z-10">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold mb-4">Discover Homes</h2>
            <FilterContent />
          </div>
          
          <div className="p-4 border-b bg-muted/30">
            <div className="text-sm text-muted-foreground font-medium flex items-center">
              {isLoading ? (
                <span className="flex items-center"><Loader2 className="h-3 w-3 mr-2 animate-spin"/> Finding homes...</span>
              ) : (
                <span>{houses?.length || 0} vacant homes found</span>
              )}
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
                ))
              ) : houses && houses.length > 0 ? (
                houses.map(house => (
                  <div key={house.id} className="h-[340px]">
                    <HouseCard house={house} />
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No homes found matching your filters.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Mobile Filters */}
        <div className="md:hidden absolute top-4 left-4 z-[400]">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="default" className="shadow-lg">
                <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters & List
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
              <SheetHeader className="p-4 border-b text-left">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="p-4 border-b">
                <FilterContent />
              </div>
              <div className="p-4 bg-muted/30 border-b">
                 <span className="text-sm font-medium">{houses?.length || 0} homes found</span>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {houses?.map(house => (
                    <div key={house.id} className="h-[320px]">
                      <HouseCard house={house} />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>

        {/* Map */}
        <div className="flex-1 h-full w-full relative">
          <PropertyMap houses={houses || []} />
        </div>
      </div>
    </MainLayout>
  );
}

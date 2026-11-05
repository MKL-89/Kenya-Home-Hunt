import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PropertyMap } from "@/components/Map";
import { useListHouses, getListHousesQueryKey } from "@workspace/api-client-react";
import { HouseCard } from "@/components/HouseCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Search, SlidersHorizontal, MapPin, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { getCountyNames, getTownsForCounty, getEstatesForTown } from "@/lib/kenya-locations";

export function MapPage() {
  const [county, setCounty] = useState<string>("all");
  const [town, setTown] = useState<string>("all");
  const [estate, setEstate] = useState<string>("all");
  const [minRent, setMinRent] = useState<string>("");
  const [maxRent, setMaxRent] = useState<string>("");
  const [bedrooms, setBedrooms] = useState<string>("all");
  const [status, setStatus] = useState<"vacant" | "occupied" | "all">("vacant");

  const queryParams = {
    ...(status !== "all" && { status }),
    ...(county !== "all" && { county }),
    ...(town !== "all" && { town }),
    ...(estate !== "all" && { estate }),
    ...(minRent && { minRent: parseInt(minRent) }),
    ...(maxRent && { maxRent: parseInt(maxRent) }),
    ...(bedrooms !== "all" && { bedrooms: parseInt(bedrooms) }),
  };

  const { data: houses, isLoading } = useListHouses(queryParams, {
    query: { queryKey: getListHousesQueryKey(queryParams) }
  });

  const countyNames = getCountyNames();
  const towns = county !== "all" ? getTownsForCounty(county) : [];
  const estates = county !== "all" && town !== "all" ? getEstatesForTown(county, town) : [];

  const hasFilters = county !== "all" || town !== "all" || estate !== "all" || minRent || maxRent || bedrooms !== "all" || status !== "vacant";
  const statusLabel = status === "all" ? "" : `${status} `;

  const clearFilters = () => {
    setCounty("all");
    setTown("all");
    setEstate("all");
    setMinRent("");
    setMaxRent("");
    setBedrooms("all");
    setStatus("vacant");
  };

  const FilterContent = () => (
    <div className="space-y-4">
      {/* County */}
      <div className="space-y-2">
        <label className="text-sm font-medium">County</label>
        <Select value={county} onValueChange={(v) => { setCounty(v); setTown("all"); setEstate("all"); }}>
          <SelectTrigger>
            <SelectValue placeholder="All Counties" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="all">All Counties</SelectItem>
            {countyNames.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Town */}
      {county !== "all" && towns.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Town</label>
          <Select value={town} onValueChange={(v) => { setTown(v); setEstate("all"); }}>
            <SelectTrigger>
              <SelectValue placeholder="All Towns" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">All Towns in {county}</SelectItem>
              {towns.map(t => (
                <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Estate */}
      {town !== "all" && estates.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Estate / Area</label>
          <Select value={estate} onValueChange={setEstate}>
            <SelectTrigger>
              <SelectValue placeholder="All Estates" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">All Areas in {town}</SelectItem>
              {estates.map(e => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Rent range */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Min Rent (KES)</label>
          <Input
            type="number"
            placeholder="Min"
            value={minRent}
            onChange={(e) => setMinRent(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Max Rent (KES)</label>
          <Input
            type="number"
            placeholder="Max"
            value={maxRent}
            onChange={(e) => setMaxRent(e.target.value)}
          />
        </div>
      </div>

      {/* Bedrooms */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Bedrooms</label>
        <Select value={bedrooms} onValueChange={setBedrooms}>
          <SelectTrigger>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="1">1 bedroom</SelectItem>
            <SelectItem value="2">2 bedrooms</SelectItem>
            <SelectItem value="3">3 bedrooms</SelectItem>
            <SelectItem value="4">4+ bedrooms</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Status</label>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger>
            <SelectValue placeholder="Vacant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vacant">Vacant only</SelectItem>
            <SelectItem value="occupied">Occupied only</SelectItem>
            <SelectItem value="all">All properties</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button variant="outline" className="w-full mt-2 gap-2" onClick={clearFilters}>
          <X className="h-4 w-4" /> Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-64px)] w-full relative overflow-hidden">
        {/* Sidebar for Desktop */}
        <div className="hidden md:flex w-[380px] flex-col border-r bg-background shrink-0 z-10">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold mb-1">Discover Homes</h2>
            <p className="text-xs text-muted-foreground mb-4">Across all 47 Kenyan counties</p>
            <FilterContent />
          </div>

          <div className="px-4 py-3 border-b bg-muted/30">
            <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              {isLoading ? (
                <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Finding homes...</span>
              ) : (
                <span>
                  <span className="font-bold text-foreground">{houses?.length || 0}</span> {statusLabel}home{houses?.length !== 1 ? "s" : ""} found
                  {county !== "all" && <span className="ml-1">in {town !== "all" ? town : county}</span>}
                </span>
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
                  <p className="text-muted-foreground text-sm">No homes found matching your filters.</p>
                  {hasFilters && (
                    <Button variant="ghost" size="sm" className="mt-2" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Mobile Filters */}
        <div className="md:hidden absolute top-4 left-4 z-[400]">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="default" className="shadow-lg gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters & List
                {hasFilters && (
                  <span className="bg-primary-foreground text-primary text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    •
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] p-0 flex flex-col">
              <SheetHeader className="p-4 border-b text-left">
                <SheetTitle>Filter Homes</SheetTitle>
              </SheetHeader>
              <div className="p-4 border-b overflow-y-auto">
                <FilterContent />
              </div>
              <div className="px-4 py-3 bg-muted/30 border-b shrink-0">
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

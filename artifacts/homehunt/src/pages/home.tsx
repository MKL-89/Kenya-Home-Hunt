import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MainLayout } from "@/components/layout/MainLayout";
import { Footer } from "@/components/layout/Footer";
import { HouseCard } from "@/components/HouseCard";
import { CountyGrid } from "@/components/CountyGrid";
import { useGetCityBreakdown, useListHouses, getListHousesQueryKey } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import type { PlaceMatch } from "@/lib/kenya-locations";
import { PlaceSearch } from "@/components/PlaceSearch";
import { PROPERTY_TYPES, BUDGETS } from "@/lib/property-types";
import {
  Search, MapPin, Bed, Bath, Heart, MessageSquare, Map as MapIcon, Home as HomeIcon,
  ShieldCheck, Smartphone, BadgeCheck, Building2, ArrowRight, Upload, ToggleRight,
} from "lucide-react";

const photo = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

const HERO_IMAGE = photo("1512917774080-9991f1c4c750", 2000);

/**
 * Shown only while there are fewer than 3 real vacant listings, and always
 * labelled "Sample" so nobody mistakes them for real homes.
 */
const SAMPLE_HOMES = [
  { title: "Single Room near Moi University", type: "Single Room", place: "Kesses, Uasin Gishu", rent: 4500, beds: 1, baths: 1, image: photo("1502672260266-1c1ef2d93688") },
  { title: "Spacious Bedsitter off Thika Road", type: "Bedsitter", place: "Roysambu, Nairobi", rent: 12000, beds: 1, baths: 1, image: photo("1522708323590-d24dbb6b0267") },
  { title: "1 Bedroom Apartment, Water & Security", type: "Apartment", place: "Milimani, Nakuru", rent: 18000, beds: 1, baths: 1, image: photo("1545324418-cc1a3fa10c00") },
  { title: "2 Bedroom Apartment with Parking", type: "Apartment", place: "Elgon View, Eldoret", rent: 28000, beds: 2, baths: 2, image: photo("1560448204-e02f11c3d0e2") },
  { title: "3 Bedroom Maisonette", type: "Maisonette", place: "Kitengela, Kajiado", rent: 45000, beds: 3, baths: 2, image: photo("1583608205776-bfd35f0d9f83") },
  { title: "Furnished Apartment near the Beach", type: "Furnished / Short Stay", place: "Nyali, Mombasa", rent: 60000, beds: 2, baths: 2, image: photo("1564013799919-ab600027ffc6") },
];



const TENANT_STEPS = [
  { icon: Search, title: "Search the map", text: "Filter by county, town, estate, budget and bedrooms. Every pin is a vacant home." },
  { icon: Heart, title: "Save favourites", text: "Shortlist the places you like and compare them from your dashboard." },
  { icon: MessageSquare, title: "Contact the landlord", text: "Call or message the landlord directly — no agents in between." },
];

const LANDLORD_STEPS = [
  { icon: Upload, title: "List for free", text: "Add photos, rent, amenities and drop a pin on the map in a few minutes." },
  { icon: MessageSquare, title: "Get enquiries", text: "Tenants message you through HomeHunt. Unread messages show on your dashboard." },
  { icon: ToggleRight, title: "Mark it occupied", text: "Once let, switch the listing to occupied in one click so you stop getting calls." },
];

const FEATURES = [
  { icon: MapIcon, title: "Map-first search", text: "See exactly where each home is before you visit." },
  { icon: Building2, title: "All 47 counties", text: "From Nairobi apartments to bedsitters in Kisii." },
  { icon: Smartphone, title: "Talk directly", text: "Landlord phone numbers and messages, no middlemen." },
  { icon: ShieldCheck, title: "Free to use", text: "No fees for tenants or landlords to list and search." },
];

function SampleHomeCard({ home }: { home: (typeof SAMPLE_HOMES)[number] }) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground overflow-hidden h-full flex flex-col">
      <div className="aspect-[4/3] relative bg-muted">
        <img src={home.image} alt={home.title} loading="lazy" className="absolute inset-0 object-cover w-full h-full" />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className="shadow-sm bg-background/90 text-foreground">Sample</Badge>
          <Badge className="shadow-sm">{home.type}</Badge>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="text-xl font-bold text-primary mb-1">
          {formatCurrency(home.rent)}
          <span className="text-sm font-normal text-muted-foreground"> /month</span>
        </div>
        <h3 className="font-semibold line-clamp-1 mb-2">{home.title}</h3>
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <MapPin className="h-3.5 w-3.5 mr-1 shrink-0" />
          <span className="line-clamp-1">{home.place}</span>
        </div>
        <div className="mt-auto flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
          <span className="flex items-center gap-1.5"><Bed className="h-4 w-4" />{home.beds} Beds</span>
          <span className="flex items-center gap-1.5"><Bath className="h-4 w-4" />{home.baths} Baths</span>
        </div>
      </div>
    </div>
  );
}

export function Home() {
  const [, setLocation] = useLocation();
  const [place, setPlace] = useState<PlaceMatch | null>(null);
  const [propertyType, setPropertyType] = useState("all");
  const [maxRent, setMaxRent] = useState("all");
  const [audience, setAudience] = useState<"tenant" | "landlord">("tenant");

  const { data: cityStats } = useGetCityBreakdown();
  const { data: vacantHouses } = useListHouses(
    { status: "vacant" },
    { query: { queryKey: getListHousesQueryKey({ status: "vacant" }) } },
  );

  const realHomes = (vacantHouses ?? []).slice(0, 6);
  const showSamples = realHomes.length < 3;
  const totalVacant = cityStats?.reduce((sum, c) => sum + c.vacant, 0) ?? 0;
  const vacantIn = (name: string) =>
    cityStats?.find((c) => c.city.toLowerCase() === name.toLowerCase())?.vacant ?? 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (place) {
      params.set("county", place.county);
      if (place.town) params.set("town", place.town);
    }
    if (propertyType !== "all") params.set("type", propertyType);
    if (maxRent !== "all") params.set("maxRent", maxRent);
    const qs = params.toString();
    setLocation(qs ? `/map?${qs}` : "/map");
  };

  const steps = audience === "tenant" ? TENANT_STEPS : LANDLORD_STEPS;

  return (
    <MainLayout>
      {/* Hero with search */}
      <section className="relative isolate overflow-hidden">
        <img src={HERO_IMAGE} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        <div className="container py-20 sm:py-28 lg:py-32">
          <div className="max-w-3xl">
            <Badge className="mb-5 bg-accent text-accent-foreground hover:bg-accent">Rentals across all 47 counties</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-5">
              Find a house in any town in Kenya.
            </h1>
            <p className="text-lg text-white/85 mb-10 max-w-2xl">
              Moving for work, school or attachment? From single rooms and bedsitters to family homes — see what's vacant, the rent, and call the landlord directly. No need to know anyone there.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="bg-background rounded-2xl shadow-2xl p-3 sm:p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto] max-w-5xl"
          >
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground px-1">Where are you moving to?</label>
              <PlaceSearch value={place} onChange={setPlace} placeholder="e.g. Eldoret, Juja, Kitengela" inputClassName="h-12" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground px-1">Type of house</label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Any type" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="all">Any type</SelectItem>
                  {PROPERTY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground px-1">Max rent</label>
              <Select value={maxRent} onValueChange={setMaxRent}>
                <SelectTrigger className="h-12"><SelectValue placeholder="No limit" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">No limit</SelectItem>
                  {BUDGETS.map((b) => <SelectItem key={b} value={String(b)}>Up to {formatCurrency(b)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" size="lg" className="h-12 self-end sm:col-span-2 lg:col-span-1 px-8 gap-2">
              <Search className="h-4 w-4" /> Search
            </Button>
          </form>

          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-white/85 text-sm">
            {totalVacant > 0 && (
              <span><strong className="text-white text-lg">{totalVacant}</strong> vacant home{totalVacant === 1 ? "" : "s"} listed</span>
            )}
            <span><strong className="text-white text-lg">47</strong> counties covered</span>
            <span><strong className="text-white text-lg">Free</strong> for tenants and landlords</span>
          </div>
        </div>
      </section>

      {/* Featured homes */}
      <section className="py-16 sm:py-20">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{showSamples ? "Homes you'll find on HomeHunt" : "Latest vacant homes"}</h2>
              <p className="text-muted-foreground mt-2">
                {showSamples
                  ? "Examples of the kind of listings landlords post. Real listings appear here as soon as they're added."
                  : "Freshly listed and ready to move in."}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/map" className="gap-2">View all on the map <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {showSamples
              ? SAMPLE_HOMES.map((h) => <SampleHomeCard key={h.title} home={h} />)
              : realHomes.map((h) => <HouseCard key={h.id} house={h} />)}
          </div>
        </div>
      </section>

      {/* Browse by county */}
      <section className="py-16 sm:py-20 bg-muted/40">
        <div className="container">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Homes in all 47 counties</h2>
            <p className="text-muted-foreground mt-2">Every county and its smaller towns — pick one to see what's vacant there.</p>
          </div>
          <CountyGrid vacantIn={vacantIn} />
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-bold tracking-tight">How HomeHunt works</h2>
            <div className="inline-flex mt-6 rounded-full border p-1 bg-muted/40">
              {(["tenant", "landlord"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAudience(a)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${audience === a ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {a === "tenant" ? "I'm looking for a home" : "I'm a landlord"}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="rounded-2xl border bg-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">Step {i + 1}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button size="lg" asChild>
              <Link href={audience === "tenant" ? "/map" : "/sign-up"}>
                {audience === "tenant" ? "Start searching" : "List your property"}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why HomeHunt */}
      <section className="py-16 bg-muted/40">
        <div className="container grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex gap-4">
              <div className="h-11 w-11 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Landlord call to action */}
      <section className="py-16 sm:py-20">
        <div className="container">
          <div className="relative isolate overflow-hidden rounded-3xl bg-sidebar text-sidebar-foreground grid lg:grid-cols-2">
            <div className="p-8 sm:p-12 space-y-5">
              <BadgeCheck className="h-10 w-10 text-accent" />
              <h2 className="text-3xl font-bold tracking-tight">Have a vacant house? List it for free.</h2>
              <p className="text-sidebar-foreground/80">
                Reach tenants searching in your county today. Add photos, set the rent, and manage enquiries from one dashboard.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="/sign-up" className="gap-2"><HomeIcon className="h-4 w-4" /> List your property</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="bg-transparent text-sidebar-foreground border-sidebar-foreground/30 hover:bg-sidebar-accent hover:text-sidebar-foreground">
                  <Link href="/sign-in">I already have an account</Link>
                </Button>
              </div>
            </div>
            <img src={photo("1600596542815-ffad4c1539a9", 1200)} alt="" loading="lazy" className="hidden lg:block h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <Footer />
    </MainLayout>
  );
}

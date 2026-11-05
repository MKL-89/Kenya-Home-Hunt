import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { KENYA_COUNTIES } from "@/lib/kenya-locations";
import { COUNTY_PHOTOS } from "@/lib/county-photos";
import { ChevronDown, ChevronUp } from "lucide-react";

// Shown first; the rest follow alphabetically
const POPULAR = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu", "Kiambu", "Machakos", "Kajiado"];

const ordered = [
  ...POPULAR.map((n) => KENYA_COUNTIES.find((c) => c.name === n)!).filter(Boolean),
  ...KENYA_COUNTIES.filter((c) => !POPULAR.includes(c.name)).sort((a, b) => a.name.localeCompare(b.name)),
];

export function CountyGrid({ vacantIn }: { vacantIn: (county: string) => number }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? ordered : ordered.slice(0, 8);

  return (
    <>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {visible.map((county) => {
          const photo = COUNTY_PHOTOS[county.name];
          const vacant = vacantIn(county.name);
          return (
            <div key={county.name} className="group relative isolate overflow-hidden rounded-2xl aspect-[4/3] bg-sidebar">
              {photo && (
                <img
                  src={photo.url}
                  alt={`${county.name} County`}
                  loading="lazy"
                  className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <Link
                href={`/map?county=${encodeURIComponent(county.name)}`}
                className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4 text-white"
              >
                <h3 className="text-lg sm:text-xl font-bold leading-tight">{county.name}</h3>
                <p className="text-xs sm:text-sm text-white/80">
                  {county.towns.length} towns
                  {vacant > 0 && <span className="font-semibold text-white"> · {vacant} vacant</span>}
                </p>
              </Link>
              {photo && (
                <a
                  href={photo.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Photo: ${photo.credit} (${photo.license}), via Wikimedia Commons`}
                  className="absolute top-1.5 right-1.5 max-w-[85%] truncate rounded bg-black/40 px-1.5 py-0.5 text-[9px] sm:text-[10px] text-white/75 hover:text-white"
                >
                  © {photo.credit} · {photo.license}
                </a>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6 text-center">
        <Button variant="outline" size="lg" onClick={() => setShowAll((s) => !s)} className="gap-2">
          {showAll ? <>Show fewer <ChevronUp className="h-4 w-4" /></> : <>Show all 47 counties <ChevronDown className="h-4 w-4" /></>}
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          County photos from Wikimedia Commons. Click a credit to see the original photo and its licence.
        </p>
      </div>
    </>
  );
}

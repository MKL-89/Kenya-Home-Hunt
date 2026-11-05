import { Link } from "wouter";

const POPULAR_COUNTIES = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Uasin Gishu"];

export function Footer() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="container py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2">
            <img src={`${basePath}/logo.svg`} alt="" className="h-8 w-8" />
            <span className="font-bold text-xl">HomeHunt</span>
          </Link>
          <p className="text-sm text-sidebar-foreground/70 leading-relaxed">
            Rental homes across all 47 counties of Kenya. Tenants find vacant houses on a map and talk to landlords directly.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">For tenants</h3>
          <ul className="space-y-2 text-sm text-sidebar-foreground/70">
            <li><Link href="/map" className="hover:text-sidebar-foreground">Browse homes</Link></li>
            <li><Link href="/sign-up" className="hover:text-sidebar-foreground">Create an account</Link></li>
            <li><Link href="/sign-in" className="hover:text-sidebar-foreground">Sign in</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">For landlords</h3>
          <ul className="space-y-2 text-sm text-sidebar-foreground/70">
            <li><Link href="/sign-up" className="hover:text-sidebar-foreground">List a property for free</Link></li>
            <li><Link href="/sign-in" className="hover:text-sidebar-foreground">Manage your listings</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Popular counties</h3>
          <ul className="grid grid-cols-2 gap-2 text-sm text-sidebar-foreground/70">
            {POPULAR_COUNTIES.map((c) => (
              <li key={c}>
                <Link href={`/map?county=${encodeURIComponent(c)}`} className="hover:text-sidebar-foreground">{c}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-sidebar-border">
        <div className="container py-5 text-xs text-sidebar-foreground/60 flex flex-col sm:flex-row gap-2 justify-between">
          <span>© {year} HomeHunt Kenya</span>
          <span>
            Prices in KES per month · Town data ©{" "}
            <a href="https://www.geonames.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-sidebar-foreground">GeoNames</a>{" "}
            (CC BY 4.0) · Maps © OpenStreetMap
          </span>
        </div>
      </div>
    </footer>
  );
}

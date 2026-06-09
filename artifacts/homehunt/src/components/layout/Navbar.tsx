import { Link } from "wouter";
import { Show, useClerk, useUser } from "@clerk/react";
import { useGetMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Map, LayoutDashboard, Heart, Plus, Building, LogOut, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();
  const { data: dbUser } = useGetMe({ query: { enabled: !!clerkUser?.id } });
  
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <img src={`${basePath}/logo.svg`} alt="HomeHunt" className="h-8 w-8" />
            <span className="font-bold text-xl hidden sm:inline-block text-primary">HomeHunt</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Show when="signed-in">
              {dbUser?.role === "tenant" && (
                <>
                  <Link href="/map" className="hover:text-primary transition-colors flex items-center gap-2">
                    <Map className="h-4 w-4" /> Map
                  </Link>
                  <Link href="/favorites" className="hover:text-primary transition-colors flex items-center gap-2">
                    <Heart className="h-4 w-4" /> Favorites
                  </Link>
                  <Link href="/tenant-dashboard" className="hover:text-primary transition-colors flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                </>
              )}
              {dbUser?.role === "landlord" && (
                <>
                  <Link href="/landlord-dashboard" className="hover:text-primary transition-colors flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <Link href="/add-house" className="hover:text-primary transition-colors flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add Listing
                  </Link>
                </>
              )}
            </Show>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Show when="signed-out">
            <Link href="/sign-in" className="text-sm font-medium hover:text-primary transition-colors">
              Sign In
            </Link>
            <Button asChild>
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </Show>
          <Show when="signed-in">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium hidden sm:inline-block">
                {dbUser?.name || clerkUser?.primaryEmailAddress?.emailAddress}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {dbUser?.role === "tenant" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/map" className="w-full flex items-center"><Map className="mr-2 h-4 w-4" /> Map</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/favorites" className="w-full flex items-center"><Heart className="mr-2 h-4 w-4" /> Favorites</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/tenant-dashboard" className="w-full flex items-center"><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {dbUser?.role === "landlord" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/landlord-dashboard" className="w-full flex items-center"><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/add-house" className="w-full flex items-center"><Plus className="mr-2 h-4 w-4" /> Add Listing</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={() => signOut({ redirectUrl: basePath || "/" })}>
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2" onClick={() => signOut({ redirectUrl: basePath || "/" })}>
                <LogOut className="h-4 w-4" /> <span className="hidden sm:inline-block">Log out</span>
              </Button>
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
}

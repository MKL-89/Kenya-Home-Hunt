import { Link } from "wouter";
import { Show, useClerk, useUser } from "@clerk/react";
import { useGetMe, getGetMeQueryKey, useGetUnreadInquiriesCount, getGetUnreadInquiriesCountQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Map, LayoutDashboard, Heart, Plus, LogOut, Menu, MessageSquare, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();
  const { data: dbUser } = useGetMe({ query: { enabled: !!clerkUser?.id, queryKey: getGetMeQueryKey() } });
  const { data: unreadData } = useGetUnreadInquiriesCount({
    query: {
      enabled: dbUser?.role === "landlord",
      queryKey: getGetUnreadInquiriesCountQueryKey(),
      refetchInterval: 30_000,
    },
  });

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const unreadCount = unreadData?.count ?? 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <img src={`${basePath}/logo.svg`} alt="HomeHunt" className="h-8 w-8" />
            <span className="font-bold text-xl hidden sm:inline-block text-primary">HomeHunt</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Show when="signed-out">
              <Link href="/map" className="hover:text-primary transition-colors flex items-center gap-2">
                <Map className="h-4 w-4" /> Browse Homes
              </Link>
            </Show>
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
                  <Link href="/inquiries" className="hover:text-primary transition-colors flex items-center gap-2 relative">
                    <MessageSquare className="h-4 w-4" /> Inquiries
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-3 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center leading-none">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
            </Show>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Show when="signed-out">
            <Link href="/map" className="md:hidden text-sm font-medium hover:text-primary transition-colors">
              Browse
            </Link>
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
                  <Button variant="ghost" size="icon" className="md:hidden relative">
                    <Menu className="h-5 w-5" />
                    {unreadCount > 0 && dbUser?.role === "landlord" && (
                      <span className="absolute top-0.5 right-0.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center leading-none">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
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
                      <DropdownMenuItem asChild>
                        <Link href="/inquiries" className="w-full flex items-center justify-between">
                          <span className="flex items-center"><MessageSquare className="mr-2 h-4 w-4" /> Inquiries</span>
                          {unreadCount > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
                              {unreadCount}
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full flex items-center"><User className="mr-2 h-4 w-4" /> Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut({ redirectUrl: basePath || "/" })}>
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/profile">
                    <User className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => signOut({ redirectUrl: basePath || "/" })}>
                  <LogOut className="h-4 w-4" /> <span className="hidden sm:inline-block">Log out</span>
                </Button>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
}

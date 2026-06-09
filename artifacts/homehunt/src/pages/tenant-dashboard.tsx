import { MainLayout } from "@/components/layout/MainLayout";
import { useGetTenantStats, useListHouses, useGetCityBreakdown, getGetTenantStatsQueryKey, getListHousesQueryKey, getGetCityBreakdownQueryKey } from "@workspace/api-client-react";
import { HouseCard } from "@/components/HouseCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Heart, PlusCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";

export function TenantDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetTenantStats({
    query: { queryKey: getGetTenantStatsQueryKey() }
  });
  
  const { data: recentHouses, isLoading: housesLoading } = useListHouses(
    { status: "vacant" },
    { query: { queryKey: getListHousesQueryKey({ status: "vacant" }) } }
  );

  const { data: cityStats, isLoading: citiesLoading } = useGetCityBreakdown({
    query: { queryKey: getGetCityBreakdownQueryKey() }
  });

  return (
    <MainLayout>
      <div className="container py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">Here's your property discovery overview.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover-elevate transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Saved Favorites</CardTitle>
              <Heart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold text-foreground">{stats?.favoritesCount || 0}</div>
              )}
            </CardContent>
          </Card>
          <Card className="hover-elevate transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Vacant Homes</CardTitle>
              <Building className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold text-foreground">{stats?.totalVacantHouses || 0}</div>
              )}
            </CardContent>
          </Card>
          <Card className="hover-elevate transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recently Added</CardTitle>
              <PlusCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold text-foreground">{stats?.recentlyAdded || 0}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Recent Vacant Listings</h2>
              <Button variant="ghost" asChild className="text-primary hover:text-primary/90">
                <Link href="/map" className="flex items-center">
                  View on Map <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            {housesLoading ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : recentHouses && recentHouses.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {recentHouses.slice(0, 4).map(house => (
                  <HouseCard key={house.id} house={house} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-xl bg-card">
                <p className="text-muted-foreground">No recent listings available.</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold tracking-tight">City Breakdown</h2>
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="divide-y">
                {citiesLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="p-4 flex justify-between items-center">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))
                ) : cityStats?.map(stat => (
                  <div key={stat.city} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div>
                      <div className="font-medium text-foreground">{stat.city}</div>
                      <div className="text-xs text-muted-foreground">{formatCurrency(stat.avgRent)} avg. rent</div>
                    </div>
                    <div className="text-sm font-semibold text-primary">
                      {stat.vacant} vacant
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

import { MainLayout } from "@/components/layout/MainLayout";
import {
  useGetTenantStats, useListHouses, useGetCityBreakdown,
  useListSentInquiries,
  getGetTenantStatsQueryKey, getListHousesQueryKey, getGetCityBreakdownQueryKey, getListSentInquiriesQueryKey,
} from "@workspace/api-client-react";
import { HouseCard } from "@/components/HouseCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Heart, PlusCircle, ArrowRight, MessageSquare, Home } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { formatDistanceToNow } from "date-fns";

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

  const { data: sentInquiries, isLoading: inquiriesLoading } = useListSentInquiries({
    query: { queryKey: getListSentInquiriesQueryKey() }
  });

  return (
    <MainLayout>
      <div className="container py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">Here's your property discovery overview.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
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
          <Card className="hover-elevate transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">My Inquiries</CardTitle>
              <MessageSquare className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {inquiriesLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold text-foreground">{sentInquiries?.length || 0}</div>
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
            <h2 className="text-xl font-semibold tracking-tight">My Inquiries</h2>
            <div className="rounded-xl border bg-card overflow-hidden">
              {inquiriesLoading ? (
                <div className="divide-y">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 flex gap-3">
                      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !sentInquiries || sentInquiries.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No inquiries sent yet.
                </div>
              ) : (
                <div className="divide-y">
                  {sentInquiries.slice(0, 5).map(inq => (
                    <Link key={inq.id} href={`/house/${inq.houseId}`}>
                      <div className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Home className="h-3.5 w-3.5 text-muted-foreground" />
                            {inq.houseTitle || `House #${inq.houseId}`}
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatDistanceToNow(new Date(inq.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{inq.message}</p>
                        <Badge
                          variant={inq.status === "unread" ? "default" : "secondary"}
                          className="mt-1.5 text-xs"
                        >
                          {inq.status === "unread" ? "Pending" : "Seen"}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

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

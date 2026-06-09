import { MainLayout } from "@/components/layout/MainLayout";
import { useGetLandlordStats, useListMyHouses, useUpdateHouseStatus, getGetLandlordStatsQueryKey, getListMyHousesQueryKey, House } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, DollarSign, Home, PlusCircle, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function LandlordDashboard() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useGetLandlordStats({
    query: { queryKey: getGetLandlordStatsQueryKey() }
  });
  
  const { data: myHouses, isLoading: housesLoading } = useListMyHouses({
    query: { queryKey: getListMyHousesQueryKey() }
  });

  const updateStatus = useUpdateHouseStatus();

  const handleToggleStatus = async (house: House) => {
    const newStatus = house.status === "vacant" ? "occupied" : "vacant";
    try {
      await updateStatus.mutateAsync({
        id: house.id,
        data: { status: newStatus }
      });
      toast.success(`Marked as ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: getListMyHousesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetLandlordStatsQueryKey() });
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <MainLayout>
      <div className="container py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Landlord Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your properties and track performance.</p>
          </div>
          <Button asChild>
            <Link href="/add-house">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Listing
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover-elevate transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Listings</CardTitle>
              <Building className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold text-foreground">{stats?.totalListings || 0}</div>}
            </CardContent>
          </Card>
          <Card className="hover-elevate transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Vacant / Occupied</CardTitle>
              <Home className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-24" /> : <div className="text-3xl font-bold text-foreground">{stats?.vacantCount || 0} / {stats?.occupiedCount || 0}</div>}
            </CardContent>
          </Card>
          <Card className="hover-elevate transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Rent</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold text-foreground">{formatCurrency(stats?.avgRent || 0)}</div>}
            </CardContent>
          </Card>
          <Card className="hover-elevate transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Est. Monthly Rev</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-32" /> : <div className="text-2xl font-bold text-foreground text-primary">{formatCurrency(stats?.totalMonthlyRevenue || 0)}</div>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold tracking-tight">Your Properties</h2>
          
          <div className="rounded-xl border bg-card overflow-hidden">
            {housesLoading ? (
              <div className="p-8 flex justify-center"><Skeleton className="h-8 w-8 rounded-full" /></div>
            ) : myHouses && myHouses.length > 0 ? (
              <div className="divide-y">
                {myHouses.map(house => (
                  <div key={house.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex gap-4 items-center">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-md bg-muted overflow-hidden shrink-0">
                        {house.images && house.images.length > 0 ? (
                          <img src={house.images[0]} alt={house.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
                        )}
                      </div>
                      <div>
                        <Link href={`/house/${house.id}`} className="font-semibold text-lg hover:underline hover:text-primary transition-colors line-clamp-1">
                          {house.title}
                        </Link>
                        <div className="text-sm text-muted-foreground mb-1">{house.address}, {house.city}</div>
                        <div className="font-medium text-foreground">{formatCurrency(house.rentPrice)}/mo</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0">
                      <Badge variant={house.status === "vacant" ? "default" : "secondary"} className="w-20 justify-center">
                        {house.status === "vacant" ? "Vacant" : "Occupied"}
                      </Badge>
                      
                      <div className="flex items-center gap-2 ml-auto">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleToggleStatus(house)}
                          disabled={updateStatus.isPending}
                        >
                          {house.status === "vacant" ? <ToggleRight className="mr-2 h-4 w-4" /> : <ToggleLeft className="mr-2 h-4 w-4" />}
                          Toggle
                        </Button>
                        <Button variant="secondary" size="icon" asChild>
                          <Link href={`/edit-house/${house.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold">No listings yet</h3>
                <p className="text-muted-foreground mb-4">Add your first property to start managing it here.</p>
                <Button asChild>
                  <Link href="/add-house">Add Listing</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

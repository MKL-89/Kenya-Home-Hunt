import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  useGetLandlordStats,
  useListMyHouses,
  useUpdateHouseStatus,
  useDeleteHouse,
  getGetLandlordStatsQueryKey,
  getListMyHousesQueryKey,
  type House,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, DollarSign, Home, PlusCircle, Pencil, ToggleLeft, ToggleRight, Trash2, MessageSquare, MapPin } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function LandlordDashboard() {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<House | null>(null);

  const { data: stats, isLoading: statsLoading } = useGetLandlordStats({
    query: { queryKey: getGetLandlordStatsQueryKey() },
  });

  const { data: myHouses, isLoading: housesLoading } = useListMyHouses({
    query: { queryKey: getListMyHousesQueryKey() },
  });

  const updateStatus = useUpdateHouseStatus();
  const deleteHouse = useDeleteHouse();

  const handleToggleStatus = async (house: House) => {
    const newStatus = house.status === "vacant" ? "occupied" : "vacant";
    try {
      await updateStatus.mutateAsync({ id: house.id, data: { status: newStatus } });
      toast.success(`Marked as ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: getListMyHousesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetLandlordStatsQueryKey() });
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteHouse.mutateAsync({ id: deleteTarget.id });
      toast.success("Listing deleted");
      queryClient.invalidateQueries({ queryKey: getListMyHousesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetLandlordStatsQueryKey() });
    } catch {
      toast.error("Failed to delete listing");
    } finally {
      setDeleteTarget(null);
    }
  };

  const locationLabel = (house: House) => {
    const parts = [house.estate, house.town, house.county || house.city].filter(Boolean);
    return parts.join(", ") || house.address;
  };

  return (
    <MainLayout>
      <div className="container py-8 space-y-8">
        {/* Header */}
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

        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover-elevate transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Listings</CardTitle>
              <Building className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold">{stats?.totalListings || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Vacant / Occupied</CardTitle>
              <Home className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-3xl font-bold">
                  <span className="text-green-600">{stats?.vacantCount || 0}</span>
                  <span className="text-muted-foreground mx-1">/</span>
                  <span className="text-orange-500">{stats?.occupiedCount || 0}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Rent</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{formatCurrency(stats?.avgRent || 0)}</div>
              )}
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Est. Monthly Rev</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-2xl font-bold text-primary">{formatCurrency(stats?.totalMonthlyRevenue || 0)}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Unread inquiries alert */}
        {!statsLoading && (stats?.unreadInquiries ?? 0) > 0 && (
          <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <MessageSquare className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm font-medium">
              You have <span className="text-primary font-bold">{stats!.unreadInquiries}</span> unread {stats!.unreadInquiries === 1 ? "inquiry" : "inquiries"} from tenants.
            </p>
            <Button variant="outline" size="sm" asChild className="ml-auto shrink-0">
              <Link href="/inquiries">View Messages</Link>
            </Button>
          </div>
        )}

        {/* Property list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Your Properties</h2>
            {myHouses && myHouses.length > 0 && (
              <span className="text-sm text-muted-foreground">{myHouses.length} listing{myHouses.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          <div className="rounded-xl border bg-card overflow-hidden">
            {housesLoading ? (
              <div className="divide-y">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="p-6 flex gap-4">
                    <Skeleton className="h-20 w-20 rounded-md shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : myHouses && myHouses.length > 0 ? (
              <div className="divide-y">
                {myHouses.map((house) => (
                  <div
                    key={house.id}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-muted/30 transition-colors group"
                  >
                    {/* Thumbnail + info */}
                    <div className="flex gap-4 items-center min-w-0">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-md bg-muted overflow-hidden shrink-0">
                        {house.images && house.images.length > 0 ? (
                          <img src={house.images[0]} alt={house.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building className="h-6 w-6 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/house/${house.id}`}
                          className="font-semibold text-base sm:text-lg hover:underline hover:text-primary transition-colors line-clamp-1"
                        >
                          {house.title}
                        </Link>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="line-clamp-1">{locationLabel(house)}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="font-semibold text-foreground">{formatCurrency(house.rentPrice)}/mo</span>
                          <span className="text-xs text-muted-foreground">
                            {house.bedrooms}bd · {house.bathrooms}ba
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0">
                      <Badge
                        variant={house.status === "vacant" ? "default" : "secondary"}
                        className="shrink-0"
                      >
                        {house.status === "vacant" ? "Vacant" : "Occupied"}
                      </Badge>

                      <div className="flex items-center gap-2 ml-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(house)}
                          disabled={updateStatus.isPending}
                          title={house.status === "vacant" ? "Mark as occupied" : "Mark as vacant"}
                        >
                          {house.status === "vacant" ? (
                            <ToggleRight className="mr-1.5 h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="mr-1.5 h-4 w-4" />
                          )}
                          {house.status === "vacant" ? "Mark Occupied" : "Mark Vacant"}
                        </Button>

                        <Button variant="ghost" size="icon" asChild title="Edit listing">
                          <Link href={`/edit-house/${house.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(house)}
                          title="Delete listing"
                        >
                          <Trash2 className="h-4 w-4" />
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
                <p className="text-muted-foreground mb-6 max-w-xs mx-auto text-sm">
                  Add your first property to start managing it here.
                </p>
                <Button asChild>
                  <Link href="/add-house">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Listing
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.title}</strong> will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}

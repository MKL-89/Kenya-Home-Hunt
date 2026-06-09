import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useUser } from "@clerk/react";
import { useGetMe, useUpsertUser, getGetMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Phone, Mail, Save } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function Profile() {
  const { user: clerkUser } = useUser();
  const queryClient = useQueryClient();
  const { data: dbUser, isLoading } = useGetMe({
    query: { queryKey: getGetMeQueryKey() },
  });

  const upsertUser = useUpsertUser();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [initialized, setInitialized] = useState(false);

  if (dbUser && !initialized) {
    setName(dbUser.name || "");
    setPhone(dbUser.phone || "");
    setInitialized(true);
  }

  const handleSave = async () => {
    if (!dbUser) return;
    try {
      await upsertUser.mutateAsync({
        data: {
          email: dbUser.email,
          name,
          phone,
          role: dbUser.role as "tenant" | "landlord",
        },
      });
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-10 max-w-lg">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account details.</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <div>{clerkUser?.fullName || name || "Your Name"}</div>
                  <Badge variant="outline" className="mt-1 text-xs capitalize font-normal">
                    {dbUser?.role || "tenant"}
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription>
                Your account info is shown on property listings and inquiries.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" /> Email
                </Label>
                <Input id="email" value={dbUser?.email || ""} disabled className="bg-muted/40" />
                <p className="text-xs text-muted-foreground">Email is managed by your sign-in provider.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" /> Display Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Kamau"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" /> Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +254 712 345 678"
                />
                <p className="text-xs text-muted-foreground">
                  {dbUser?.role === "landlord"
                    ? "Shown to tenants on your property listings."
                    : "Shared with landlords when you send an inquiry."}
                </p>
              </div>

              <Button
                onClick={handleSave}
                disabled={upsertUser.isPending}
                className="w-full"
              >
                {upsertUser.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

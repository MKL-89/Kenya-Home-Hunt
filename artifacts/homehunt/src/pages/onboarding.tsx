import { useLocation, Redirect } from "wouter";
import { useUser } from "@clerk/react";
import { useUpsertUser, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { User, Home } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function Onboarding() {
  const [, setLocation] = useLocation();
  const { user: clerkUser } = useUser();
  const queryClient = useQueryClient();
  const upsertUser = useUpsertUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: existingUser } = useGetMe({
    query: { enabled: !!clerkUser?.id, retry: false, queryKey: getGetMeQueryKey() },
  });

  const handleRoleSelection = async (role: "tenant" | "landlord") => {
    if (!clerkUser?.primaryEmailAddress?.emailAddress) {
      toast.error("User email not found");
      return;
    }

    setIsSubmitting(true);
    try {
      await upsertUser.mutateAsync({
        data: {
          email: clerkUser.primaryEmailAddress.emailAddress,
          name: clerkUser.fullName || undefined,
          role,
        },
      });
      // Invalidate the /users/me cache so Navbar immediately gets the new role
      await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      setLocation(role === "tenant" ? "/tenant-dashboard" : "/landlord-dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save role. Please try again.";
      toast.error(message);
      setIsSubmitting(false);
    }
  };

  if (existingUser && !isSubmitting) {
    return <Redirect to={existingUser.role === "landlord" ? "/landlord-dashboard" : "/tenant-dashboard"} />;
  }

  return (
    <MainLayout>
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center py-12 px-4 bg-muted/30">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Welcome to HomeHunt</h1>
            <p className="text-muted-foreground">Are you looking for a home or listing one?</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => handleRoleSelection("tenant")}
              disabled={isSubmitting}
              className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 border-border bg-card text-card-foreground hover:border-primary hover:bg-primary/5 transition-all text-left group disabled:opacity-50"
            >
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <User className="h-8 w-8" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Tenant</h3>
                <p className="text-sm text-muted-foreground">
                  I want to discover vacant homes and find my next rental property.
                </p>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelection("landlord")}
              disabled={isSubmitting}
              className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 border-border bg-card text-card-foreground hover:border-primary hover:bg-primary/5 transition-all text-left group disabled:opacity-50"
            >
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Home className="h-8 w-8" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Landlord</h3>
                <p className="text-sm text-muted-foreground">
                  I want to list my vacant properties and manage them efficiently.
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

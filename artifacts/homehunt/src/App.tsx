import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useUser, useAuth } from '@clerk/react';
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from 'wouter';
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Home } from "@/pages/home";
import { SignInPage, SignUpPage } from "@/pages/auth";
import { Onboarding } from "@/pages/onboarding";
import { TenantDashboard } from "@/pages/tenant-dashboard";
import { LandlordDashboard } from "@/pages/landlord-dashboard";
import { MapPage } from "@/pages/map";
import { HouseDetail } from "@/pages/house-detail";
import { Favorites } from "@/pages/favorites";
import { HouseForm } from "@/pages/house-form";
import { Profile } from "@/pages/profile";
import { InquiriesPage } from "@/pages/inquiries";
import NotFound from "@/pages/not-found";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(170, 60%, 25%)",
    colorForeground: "hsl(180, 20%, 10%)",
    colorMutedForeground: "hsl(180, 10%, 40%)",
    colorDanger: "hsl(0, 70%, 50%)",
    colorBackground: "hsl(0, 0%, 100%)",
    colorInput: "hsl(180, 15%, 85%)",
    colorInputForeground: "hsl(180, 20%, 10%)",
    colorNeutral: "hsl(180, 15%, 85%)",
    fontFamily: "var(--font-sans)",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-background rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl border border-border",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-foreground font-bold",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButtonText: "text-foreground font-medium",
    formFieldLabel: "text-foreground font-medium",
    footerActionLink: "text-primary hover:text-primary/90 font-medium",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground",
    identityPreviewEditButton: "text-primary",
    formFieldSuccessText: "text-primary",
    alertText: "text-destructive",
    logoBox: "",
    logoImage: "",
    socialButtonsBlockButton: "border border-input hover:bg-muted/50 transition-colors",
    formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
    formFieldInput: "border-input focus:ring-ring bg-background text-foreground",
    footerAction: "",
    dividerLine: "bg-border",
    alert: "border-destructive text-destructive",
    otpCodeFieldInput: "border-input",
    formFieldRow: "",
    main: "",
  },
};

/**
 * Registers Clerk's getToken() as the API client's auth token getter.
 * This ensures every fetch to /api/* includes `Authorization: Bearer <token>`.
 * Required because Clerk session cookies are scoped to the frontend and do
 * not automatically travel to the Express server in Replit's multi-port setup.
 */
function ClerkAuthTokenBridge() {
  const { getToken } = useAuth();
  useEffect(() => {
    setAuthTokenGetter(() => getToken());
    return () => setAuthTokenGetter(null);
  }, [getToken]);
  return null;
}

// Clears React Query cache whenever the Clerk userId changes (sign-in / sign-out)
function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

// Spinner shown while the app determines where to send the user
function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

/**
 * Route shown at "/" — decides whether to show the landing page,
 * the onboarding flow, or redirect to the right dashboard.
 */
function HomeRedirect() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { data: dbUser, isLoading: dbLoading, isError } = useGetMe({
    query: {
      enabled: clerkLoaded && !!clerkUser?.id,
      // Don't permanently cache errors — retry once on mount so stale 401s
      // from a previous session don't block the signed-in user.
      retry: 1,
      retryDelay: 0,
      staleTime: 0,
      queryKey: getGetMeQueryKey(),
    },
  });

  // Clerk is still initialising
  if (!clerkLoaded) return <FullPageSpinner />;

  // Not signed in → show landing page
  if (!clerkUser) return <Home />;

  // Signed in, waiting for the DB user lookup
  if (dbLoading) return <FullPageSpinner />;

  // Signed in but no DB user (or error) → onboarding
  if (!dbUser || isError) return <Redirect to="/onboarding" />;

  // Signed in + DB user → send to the right dashboard
  return <Redirect to={dbUser.role === "tenant" ? "/tenant-dashboard" : "/landlord-dashboard"} />;
}

/**
 * Wraps any route that requires the user to be signed in and
 * to have completed onboarding.
 *
 * - Not signed in  → /sign-in
 * - Signed in, no DB profile → /onboarding
 * - Signed in + profile → renders children
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { data: dbUser, isLoading: dbLoading } = useGetMe({
    query: {
      enabled: clerkLoaded && !!clerkUser?.id,
      retry: 1,
      retryDelay: 0,
      staleTime: 0,
      queryKey: getGetMeQueryKey(),
    },
  });

  if (!clerkLoaded) return <FullPageSpinner />;
  if (!clerkUser) return <Redirect to="/sign-in" />;
  if (dbLoading) return <FullPageSpinner />;
  if (!dbUser) return <Redirect to="/onboarding" />;

  return <>{children}</>;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      afterSignOutUrl={`${basePath}/`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkAuthTokenBridge />
        <ClerkQueryClientCacheInvalidator />
        <Switch>
          {/* Public routes */}
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route path="/map" component={MapPage} />
          <Route path="/house/:id" component={HouseDetail} />

          {/* Onboarding — accessible when signed in but not yet in DB */}
          <Route path="/onboarding" component={Onboarding} />

          {/* Protected routes — require sign-in + completed onboarding */}
          <Route path="/tenant-dashboard">
            <ProtectedRoute><TenantDashboard /></ProtectedRoute>
          </Route>
          <Route path="/landlord-dashboard">
            <ProtectedRoute><LandlordDashboard /></ProtectedRoute>
          </Route>
          <Route path="/favorites">
            <ProtectedRoute><Favorites /></ProtectedRoute>
          </Route>
          <Route path="/add-house">
            <ProtectedRoute><HouseForm /></ProtectedRoute>
          </Route>
          <Route path="/edit-house/:id">
            <ProtectedRoute><HouseForm /></ProtectedRoute>
          </Route>
          <Route path="/profile">
            <ProtectedRoute><Profile /></ProtectedRoute>
          </Route>
          <Route path="/inquiries">
            <ProtectedRoute><InquiriesPage /></ProtectedRoute>
          </Route>

          <Route component={NotFound} />
        </Switch>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default function App() {
  return (
    <WouterRouter base={basePath}>
      <TooltipProvider>
        <ClerkProviderWithRoutes />
        <Toaster />
      </TooltipProvider>
    </WouterRouter>
  );
}

import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useUser } from '@clerk/react';
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
import NotFound from "@/pages/not-found";
import { useGetMe } from "@workspace/api-client-react";
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

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function HomeRedirect() {
  const { user: clerkUser } = useUser();
  const { data: dbUser, isLoading } = useGetMe({ 
    query: { enabled: !!clerkUser?.id, retry: false } 
  });

  return (
    <>
      <Show when="signed-in">
        {isLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !dbUser ? (
          <Redirect to="/onboarding" />
        ) : dbUser.role === "tenant" ? (
          <Redirect to="/tenant-dashboard" />
        ) : (
          <Redirect to="/landlord-dashboard" />
        )}
      </Show>
      <Show when="signed-out">
        <Home />
      </Show>
    </>
  );
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
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to access your account",
          },
        },
        signUp: {
          start: {
            title: "Create your account",
            subtitle: "Get started today",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/tenant-dashboard" component={TenantDashboard} />
          <Route path="/landlord-dashboard" component={LandlordDashboard} />
          <Route path="/map" component={MapPage} />
          <Route path="/house/:id" component={HouseDetail} />
          <Route path="/favorites" component={Favorites} />
          <Route path="/add-house" component={HouseForm} />
          <Route path="/edit-house/:id" component={HouseForm} />
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

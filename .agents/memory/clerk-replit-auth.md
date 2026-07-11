---
name: Clerk auth in Replit multi-port setup
description: Why Clerk session cookies don't reach Express and how to fix it with ClerkAuthTokenBridge + setAuthTokenGetter.
---

## The rule
Always wire up `ClerkAuthTokenBridge` + `setAuthTokenGetter` in web apps that have a separate Express API server. Never rely on Clerk session cookies traveling from the Vite frontend to Express.

**Why:** In Replit's multi-port setup, the Vite frontend (port 25773) and Express API (port 8080) are different processes. Even though both are served via the shared proxy on the same origin, the Clerk `__session` cookie is set by the Clerk JS SDK on the frontend and does NOT automatically travel to Express. `@clerk/express` `getAuth(req).userId` returns null → every authenticated route returns 401.

**How to apply:**
1. Add `ClerkAuthTokenBridge` component inside `ClerkProvider` + `QueryClientProvider` in `App.tsx`:
```tsx
function ClerkAuthTokenBridge() {
  const { getToken } = useAuth();
  useEffect(() => {
    setAuthTokenGetter(() => getToken());
    return () => setAuthTokenGetter(null);
  }, [getToken]);
  return null;
}
```
2. `setAuthTokenGetter` is exported from `@workspace/api-client-react` (re-exported from `lib/api-client-react/src/custom-fetch.ts`).
3. `custom-fetch.ts` then attaches `Authorization: Bearer <token>` to every fetch — `@clerk/express` verifies this against `CLERK_SECRET_KEY`.

## clerkMiddleware config
Use static env vars, NOT the `publishableKeyFromHost` dynamic callback:
```ts
// WRONG — publishableKeyFromHost can return undefined in dev
app.use(clerkMiddleware((req) => ({
  publishableKey: publishableKeyFromHost(getClerkProxyHost(req) ?? "", process.env.CLERK_PUBLISHABLE_KEY),
})));

// CORRECT
app.use(clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}));
```

## Env vars available in this project
- `CLERK_PUBLISHABLE_KEY` — pk_test_... (set by Replit Clerk integration)
- `CLERK_SECRET_KEY` — sk_test_... (set by Replit Clerk integration)
- `VITE_CLERK_PUBLISHABLE_KEY` — same value, exposed to Vite frontend

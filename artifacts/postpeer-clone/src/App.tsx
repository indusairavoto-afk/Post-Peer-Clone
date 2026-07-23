import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from 'wouter';
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/Home";
import Pricing from "@/pages/Pricing";
import DashboardPage from "@/pages/Dashboard";
import ComposePage from "@/pages/Compose";
import PostsPage from "@/pages/Posts";
import PlatformsPage from "@/pages/Platforms";
import ApiKeysPage from "@/pages/ApiKeys";
import SettingsPage from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import PublicPage from "@/pages/PublicPage";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DashboardLayout from "@/components/layout/DashboardLayout";

const queryClient = new QueryClient();

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
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY');
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
    colorPrimary: "#ffffff",
    colorForeground: "#ffffff",
    colorMutedForeground: "#888888",
    colorDanger: "#ff0000",
    colorBackground: "#0a0a0a",
    colorInput: "#1a1a1a",
    colorInputForeground: "#ffffff",
    colorNeutral: "#333333",
    fontFamily: "'Space Mono', monospace",
    borderRadius: "6px",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#111111] rounded-md w-[440px] max-w-full overflow-hidden border border-[#333333]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-white",
    headerSubtitle: "text-[#888888]",
    socialButtonsBlockButtonText: "text-white",
    formFieldLabel: "text-white",
    footerActionLink: "text-white hover:text-[#cccccc]",
    footerActionText: "text-[#888888]",
    dividerText: "text-[#888888]",
    identityPreviewEditButton: "text-[#888888]",
    formFieldSuccessText: "text-green-500",
    alertText: "text-white",
    logoBox: "invert",
    logoImage: "",
    socialButtonsBlockButton: "border border-[#333333] hover:bg-[#1a1a1a]",
    formButtonPrimary: "bg-white text-black hover:bg-[#cccccc]",
    formFieldInput: "bg-[#1a1a1a] border-[#333333] text-white",
    footerAction: "",
    dividerLine: "bg-[#333333]",
    alert: "bg-[#1a1a1a] border border-[#333333]",
    otpCodeFieldInput: "bg-[#1a1a1a] border-[#333333] text-white",
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

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0a0a0a] px-4 font-mono">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0a0a0a] px-4 font-mono">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <div className="min-h-screen bg-[#0a0a0a] text-white font-mono selection:bg-white selection:text-black flex flex-col relative">
          <div className="fixed inset-0 pointer-events-none bg-grid z-50 opacity-20"></div>
          <Navbar />
          <main className="flex-grow">
            <Home />
          </main>
          <Footer />
        </div>
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <DashboardLayout>
          <Component />
        </DashboardLayout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
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
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/pricing">
              <div className="min-h-screen bg-[#0a0a0a] text-white font-mono selection:bg-white selection:text-black flex flex-col relative">
                <div className="fixed inset-0 pointer-events-none bg-grid z-50 opacity-20"></div>
                <Navbar />
                <main className="flex-grow">
                  <Pricing />
                </main>
                <Footer />
              </div>
            </Route>
            <Route path="/apis"><PublicPage page="apis" /></Route>
            <Route path="/docs"><PublicPage page="docs" /></Route>
            <Route path="/blog"><PublicPage page="blog" /></Route>
            <Route path="/changelog"><PublicPage page="changelog" /></Route>
            <Route path="/about"><PublicPage page="about" /></Route>
            <Route path="/terms"><PublicPage page="terms" /></Route>
            <Route path="/privacy"><PublicPage page="privacy" /></Route>
            <Route path="/demo"><PublicPage page="demo" /></Route>
            <Route path="/register"><Redirect to="/sign-up" /></Route>
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/dashboard"><ProtectedRoute component={DashboardPage} /></Route>
            <Route path="/compose"><ProtectedRoute component={ComposePage} /></Route>
            <Route path="/posts"><ProtectedRoute component={PostsPage} /></Route>
            <Route path="/platforms"><ProtectedRoute component={PlatformsPage} /></Route>
            <Route path="/api-keys"><ProtectedRoute component={ApiKeysPage} /></Route>
            <Route path="/settings"><ProtectedRoute component={SettingsPage} /></Route>
            <Route component={NotFound} />
          </Switch>
        </TooltipProvider>
        <Toaster />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
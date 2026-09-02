import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import { ModeProvider } from "@/hooks/useMode";
import RequireAdmin from "@/components/RequireAdmin";
import { getAdminRoute } from "@/lib/adminPath";
import Index from "./pages/Index";
import Popular from "./pages/Popular";
import Favorites from "./pages/Favorites";
import Section from "./pages/Section";
import About from "./pages/About";
import Article from "./pages/Article";
import NewsDetail from "./pages/NewsDetail";
import PaletteDetail from "./pages/PaletteDetail";
import ResourceDetail from "./pages/ResourceDetail";
import ComponentDetail from "./pages/ComponentDetail";
import DictionaryDetail from "./pages/DictionaryDetail";
import DesignDetail from "./pages/DesignDetail";
import ResearchDetail from "./pages/ResearchDetail";
import ToolsPage from "./pages/ToolsPage";
import CodeEditorPage from "./pages/CodeEditorPage";
import EditorPage from "./pages/EditorPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ResetRequest from "./pages/ResetRequest";
import UpdatePassword from "./pages/UpdatePassword";
import NotFound from "./pages/NotFound";
import SecretGate from "./pages/SecretGate";

// Admin code is split into separate chunks and only downloaded once
// RequireAdmin has confirmed an authenticated user with the admin role.
const Admin = lazy(() => import("./pages/Admin"));
const Auth = lazy(() => import("./pages/Auth"));
const ArticleEditor = lazy(() => import("./pages/ArticleEditor"));
const ModeEntryEditor = lazy(() => import("./pages/ModeEntryEditor"));
const DictionaryEditor = lazy(() => import("./pages/DictionaryEditor"));

const AdminFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
  </div>
);

const AdminGate = () => {
  const { user, isAdmin, loading, roleLoading } = useAuth();

  if (loading || (user && roleLoading)) {
    return <AdminFallback />;
  }

  if (user && isAdmin) {
    return (
      <Suspense fallback={<AdminFallback />}>
        <Admin />
      </Suspense>
    );
  }

  if (user && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Suspense fallback={<AdminFallback />}>
      <Auth />
    </Suspense>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LanguageProvider>
          <ModeProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/popular" element={<Popular />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/section/:categoryId" element={<Section />} />
                <Route path="/about" element={<About />} />
                <Route path="/news/:id" element={<NewsDetail />} />
                <Route path="/palette/:id" element={<PaletteDetail />} />
                <Route path="/palettes/:id" element={<PaletteDetail />} />
                <Route path="/resource/:id" element={<ResourceDetail />} />
                <Route path="/component/:id" element={<ComponentDetail />} />
                <Route path="/library/:id" element={<ComponentDetail />} />
                <Route path="/template/:id" element={<ComponentDetail />} />
                <Route path="/dictionary/:id" element={<DictionaryDetail />} />
                <Route path="/design/:id" element={<DesignDetail />} />
                <Route path="/research" element={<Index />} />
                <Route path="/research/:id" element={<ResearchDetail />} />
                <Route path="/tools" element={<ToolsPage />} />
                <Route path="/tools/code-editor" element={<CodeEditorPage />} />
                <Route path="/editor" element={<EditorPage />} />
                <Route path="/auth" element={<NotFound />} />
                <Route path="/reset-request/:token" element={<ResetRequest />} />
                <Route path="/reset-password" element={<UpdatePassword />} />
                <Route
                  path={getAdminRoute()}
                  element={<AdminGate />}
                />
                <Route
                  path={getAdminRoute('/editor')}
                  element={
                    <RequireAdmin>
                      <Suspense fallback={<AdminFallback />}>
                        <ArticleEditor />
                      </Suspense>
                    </RequireAdmin>
                  }
                />
                <Route
                  path={getAdminRoute('/editor/:id')}
                  element={
                    <RequireAdmin>
                      <Suspense fallback={<AdminFallback />}>
                        <ArticleEditor />
                      </Suspense>
                    </RequireAdmin>
                  }
                />
                <Route
                  path={getAdminRoute('/entry/:type')}
                  element={
                    <RequireAdmin>
                      <Suspense fallback={<AdminFallback />}>
                        <ModeEntryEditor />
                      </Suspense>
                    </RequireAdmin>
                  }
                />
                <Route
                  path={getAdminRoute('/entry/:type/:id')}
                  element={
                    <RequireAdmin>
                      <Suspense fallback={<AdminFallback />}>
                        <ModeEntryEditor />
                      </Suspense>
                    </RequireAdmin>
                  }
                />
                <Route
                  path={getAdminRoute('/dictionary')}
                  element={
                    <RequireAdmin>
                      <Suspense fallback={<AdminFallback />}>
                        <DictionaryEditor />
                      </Suspense>
                    </RequireAdmin>
                  }
                />
                <Route
                  path={getAdminRoute('/dictionary/:id')}
                  element={
                    <RequireAdmin>
                      <Suspense fallback={<AdminFallback />}>
                        <DictionaryEditor />
                      </Suspense>
                    </RequireAdmin>
                  }
                />
                <Route path="/article/:id" element={<Article />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                {/* Wildcard: the backend decides whether this unmatched path is the secret admin login path */}
                <Route path="*" element={<SecretGate />} />
              </Routes>
            </BrowserRouter>
          </ModeProvider>
        </LanguageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

// Triggering GitHub sync for Vercel

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import Index from "./pages/Index";
import Popular from "./pages/Popular";
import Favorites from "./pages/Favorites";
import Sections from "./pages/Sections";
import Section from "./pages/Section";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import ArticleEditor from "./pages/ArticleEditor";
import Article from "./pages/Article";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LanguageProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/popular" element={<Popular />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/sections" element={<Sections />} />
              <Route path="/section/:categoryId" element={<Section />} />
              <Route path="/about" element={<About />} />
              <Route path="/oRXbyat6a9YPTWyyeR5zp5CUAi68Hwvs" element={<Auth />} />
              <Route path="/auth" element={<NotFound />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/editor" element={<ArticleEditor />} />
              <Route path="/admin/editor/:id" element={<ArticleEditor />} />
              <Route path="/article/:id" element={<Article />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

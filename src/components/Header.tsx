import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.jpg";
import { LogOut, Settings, Globe } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { path: "/", label: t('nav.home') },
    { path: "/popular", label: t('nav.popular') },
    { path: "/favorites", label: t('nav.favorites') },
    { path: "/sections", label: t('nav.sections') },
    { path: "/about", label: t('nav.about') },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'uk' ? 'en' : 'uk');
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={logo} 
               alt="Magnifique numérique" 
               className="w-10 h-10 rounded-lg object-cover"
            />
            <span className="text-xl font-bold text-foreground">Magnifique numérique</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link pb-1 ${
                  location.pathname === item.path 
                    ? "text-primary" 
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={`nav-link pb-1 flex items-center gap-1 ${
                  location.pathname.startsWith('/admin') 
                    ? "text-primary" 
                    : "text-muted-foreground"
                }`}
              >
                <Settings className="w-4 h-4" />
                {t('nav.admin')}
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              <Globe className="w-4 h-4" />
              {language === 'uk' ? 'EN' : 'UA'}
            </Button>
            {user && (
              <Button variant="ghost" size="sm" onClick={signOut} aria-label={t('nav.logout')}>
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </nav>

          <nav className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="gap-1 text-muted-foreground"
            >
              <Globe className="w-4 h-4" />
              {language === 'uk' ? 'EN' : 'UA'}
            </Button>
            <details className="relative">
              <summary
                className="list-none cursor-pointer p-2 hover:text-primary transition-colors"
                aria-label="Toggle menu"
                role="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="4" x2="20" y1="12" y2="12"/>
                  <line x1="4" x2="20" y1="6" y2="6"/>
                  <line x1="4" x2="20" y1="18" y2="18"/>
                </svg>
              </summary>
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block px-4 py-2 hover:bg-primary/10 transition-colors ${
                      location.pathname === item.path 
                        ? "text-primary" 
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`block px-4 py-2 hover:bg-primary/10 transition-colors ${
                      location.pathname.startsWith('/admin')
                        ? "text-primary" 
                        : "text-muted-foreground"
                    }`}
                  >
                    {t('nav.admin')}
                  </Link>
                )}
                {user && (
                  <button
                    onClick={signOut}
                    className="block w-full text-left px-4 py-2 hover:bg-primary/10 text-muted-foreground transition-colors"
                  >
                    {t('nav.logout')}
                  </button>
                )}
              </div>
            </details>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-border bg-card/30 mt-16">
      <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Magnifique numérique</p>
        <nav>
          <Link to="/privacy-policy" className="hover:text-primary transition-colors">
            {t("nav.privacy")}
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;

import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import { useLanguage } from "@/hooks/useLanguage";
import { Info } from "lucide-react";
import { useSocialLinks } from "@/hooks/useSocialLinks";
import { getSocialIcon, isMailto } from "@/lib/socialIcon";

const About = () => {
  const { t } = useLanguage();
  const { data: links = [] } = useSocialLinks();

  const emailLink = links.find((l) => isMailto(l.url));
  const socialLinks = links.filter((l) => !isMailto(l.url));

  return (
    <PageLayout>
      <SEO
        title="Про платформу — Magnifique numérique"
        description="Про Magnifique numérique — освітню платформу зі статтями про Python та IT українською мовою. Контакти й соцмережі."
        path="/about"
      />
      <div className="max-w-3xl mx-auto">
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Info className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">{t('about.title')}</h1>
          </div>
        </section>

        <div className="bg-card rounded-xl p-8 border border-border animate-fade-in">
          <p
            className="text-lg leading-relaxed text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: t('about.description') }}
          />

          {emailLink && (
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {t('about.contact')}{' '}
              <a
                href={emailLink.url}
                className="text-primary hover:underline font-medium"
              >
                {emailLink.url.replace(/^mailto:/i, '')}
              </a>
            </p>
          )}

          {socialLinks.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {t('about.title') === 'Про платформу' ? 'Соціальні мережі' : 'Social Media'}
              </h2>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((link) => {
                  const Icon = getSocialIcon(link.platform);
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-primary/20 hover:text-primary transition-colors text-sm font-medium"
                    >
                      <Icon className="w-4 h-4" />
                      {link.platform}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default About;

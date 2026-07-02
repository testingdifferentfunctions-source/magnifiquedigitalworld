import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import ArticleCard from "@/components/ArticleCard";
import { useTopArticlesByReads, Article } from "@/hooks/useArticles";
import { useLanguage } from "@/hooks/useLanguage";
import { useArticlesTranslations } from "@/hooks/useArticleTranslation";
import { TrendingUp } from "lucide-react";
import { useMemo } from "react";

const Popular = () => {
  const { data: articles = [], isLoading } = useTopArticlesByReads(10);
  const { t, language } = useLanguage();
  const articleIds = useMemo(() => articles.map(a => a.id), [articles]);
  const { data: translationsMap = {} } = useArticlesTranslations(articleIds);

  return (
    <PageLayout>
      <SEO
        title="Найпопулярніші статті про Python — Magnifique numérique"
        description="Топ-10 найпопулярніших статей про Python за кількістю переглядів на Magnifique numérique."
        path="/popular"
      />
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">{t('popular.title')}</h1>
        </div>
        <p className="text-muted-foreground">
          {t('popular.subtitle')}
        </p>
      </section>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <p className="text-muted-foreground">{t('index.loading')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article: Article, index: number) => {
            const tr = translationsMap[article.id];
            return (
              <ArticleCard 
                key={article.id} 
                article={{
                  id: article.id,
                  title: (language === 'en' && tr?.title) ? tr.title : article.title,
                  description: (language === 'en' && tr?.description) ? tr.description : article.description,
                  image: article.image_url,
                  likes: article.likes,
                  reads: article.reads,
                  category: article.category_id || ''
                }} 
                index={index} 
              />
            );
          })}
        </div>
      )}
    </PageLayout>
  );
};

export default Popular;

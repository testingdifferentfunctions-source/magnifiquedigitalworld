import { useMemo } from "react";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import CategoryCard from "@/components/CategoryCard";
import { useCategories, Category } from "@/hooks/useCategories";
import { useLanguage } from "@/hooks/useLanguage";
import { useCategoriesTranslations } from "@/hooks/useCategoryTranslation";
import { Layers } from "lucide-react";

const Sections = () => {
  const { data: categories = [], isLoading } = useCategories();
  const { t, language } = useLanguage();
  const categoryIds = useMemo(() => categories.map(c => c.id), [categories]);
  const { data: categoryTranslations = {} } = useCategoriesTranslations(categoryIds);

  return (
    <PageLayout>
      <SEO
        title="Розділи — Magnifique numérique"
        description="Оберіть тему програмування Python: основи, ООП, бібліотеки, веброзробка та інші розділи."
        path="/sections"
      />
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <Layers className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">{t('sections.title')}</h1>
        </div>
        <p className="text-muted-foreground">
          {t('sections.subtitle')}
        </p>
      </section>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <p className="text-muted-foreground">{t('index.loading')}</p>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {categories.map((category: Category, index: number) => (
            <CategoryCard 
              key={category.id} 
              category={{
                id: category.id,
                name: (language === 'en' && categoryTranslations[category.id]) 
                  ? categoryTranslations[category.id] 
                  : category.name,
                image: category.image_url
              }} 
              index={index} 
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default Sections;

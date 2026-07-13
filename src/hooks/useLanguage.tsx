import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'uk' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  uk: {
    // Navigation
    'nav.home': 'Головна',
    'nav.popular': 'Найпопулярніші',
    'nav.favorites': 'Найулюбленіші',
    'nav.sections': 'Розділи',
    'nav.about': 'Про платформу',
    'nav.admin': 'Адмін',
    'nav.logout': 'Вийти',
    'nav.privacy': 'Політика конфіденційності',

    // Index page
    'index.title': 'Останні статті',
    'index.subtitle': 'Вивчайте програмування разом з нами',
    'index.loading': 'Завантаження...',
    'index.no_results': 'Статей не знайдено',
    'index.no_articles': 'Немає статей',

    // Search
    'search.placeholder': 'Пошук статей...',

    // Filters
    'filters.sort': 'Сортування',
    'filters.newest': 'Спочатку нові',
    'filters.oldest': 'Спочатку старі',
    'filters.all_sections': 'Всі розділи',

    // Popular page
    'popular.title': 'Найпопулярніші',
    'popular.subtitle': 'Топ-10 статей за кількістю прочитань',

    // Favorites page
    'favorites.title': 'Найулюбленіші',
    'favorites.subtitle': 'Топ-10 статей за кількістю вподобань',

    // Sections page
    'sections.title': 'Розділи',
    'sections.subtitle': 'Оберіть тему, яка вас цікавить',

    // About page
    'about.title': 'Про платформу',
    'about.description': '<span class="text-primary font-semibold">Magnifique numérique</span> — прекрасний цифровий світ технологій й програмування.',

    // Article page
    'article.back': 'Назад',
    'article.not_found': 'Статтю не знайдено',
    'article.not_found_desc': 'На жаль, ця стаття не існує або була видалена.',
    'article.go_home': 'Повернутись на головну',
    'article.share': 'Поділитися',
    'article.translating': 'Перекладається...',
    'article.translate_error': 'Помилка перекладу',

    // Like button
    'like.login_required': 'Увійдіть, щоб вподобати статтю',
    'like.error': 'Помилка при оновленні вподобання',

    // 404
    'notfound.title': '404',
    'notfound.message': 'Сторінку не знайдено',
    'notfound.link': 'Повернутись на головну',

    // Auth
    'auth.title': 'Вхід',
    'auth.subtitle': 'Увійдіть до адмін-панелі Magnifique numérique',
    'auth.email': 'Email',
    'auth.password': 'Пароль',
    'auth.submit': 'Увійти',
    'auth.loading': 'Зачекайте...',
    'auth.invalid_credentials': 'Невірний email або пароль',
    'auth.error': 'Помилка входу',
    'auth.success': 'Успішний вхід!',
    'auth.general_error': 'Сталася помилка. Спробуйте пізніше.',
    'auth.enter_password': 'Введіть пароль',
    'auth.too_many_attempts': 'Забагато невдалих спроб входу. Спробуйте знову через 24 години.',
    'auth.attempts_left': 'Залишилось спроб: {n}',
    'about.contact': 'Будь-які запитання? Пишіть на',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.popular': 'Most Popular',
    'nav.favorites': 'Most Liked',
    'nav.sections': 'Sections',
    'nav.about': 'About',
    'nav.admin': 'Admin',
    'nav.logout': 'Logout',
    'nav.privacy': 'Privacy Policy',

    // Index page
    'index.title': 'Latest Articles',
    'index.subtitle': 'Learn programming with us',
    'index.loading': 'Loading...',
    'index.no_results': 'No articles found',
    'index.no_articles': 'No articles yet',

    // Search
    'search.placeholder': 'Search articles...',

    // Filters
    'filters.sort': 'Sort',
    'filters.newest': 'Newest first',
    'filters.oldest': 'Oldest first',
    'filters.all_sections': 'All sections',

    // Popular page
    'popular.title': 'Most Popular',
    'popular.subtitle': 'Top 10 articles by number of views',

    // Favorites page
    'favorites.title': 'Most Liked',
    'favorites.subtitle': 'Top 10 articles by number of likes',

    // Sections page
    'sections.title': 'Programming Sections',
    'sections.subtitle': 'Choose a topic that interests you',

    // About page
    'about.title': 'About the Platform',
    'about.description': '<span class="text-primary font-semibold">Magnifique numérique</span> — a beautiful digital world of technology and programming.',

    // Article page
    'article.back': 'Back',
    'article.not_found': 'Article not found',
    'article.not_found_desc': 'Sorry, this article does not exist or has been deleted.',
    'article.go_home': 'Go to homepage',
    'article.share': 'Share',
    'article.translating': 'Translating...',
    'article.translate_error': 'Translation error',

    // Like button
    'like.login_required': 'Log in to like the article',
    'like.error': 'Error updating like',

    // 404
    'notfound.title': '404',
    'notfound.message': 'Page not found',
    'notfound.link': 'Return to Home',

    // Auth
    'auth.title': 'Sign In',
    'auth.subtitle': 'Sign in to Magnifique numérique admin panel',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.submit': 'Sign In',
    'auth.loading': 'Please wait...',
    'auth.invalid_credentials': 'Invalid email or password',
    'auth.error': 'Sign in error',
    'auth.success': 'Signed in successfully!',
    'auth.general_error': 'An error occurred. Please try again later.',
    'auth.enter_password': 'Enter password',
    'auth.too_many_attempts': 'Too many failed login attempts. Try again in 24 hours.',
    'auth.attempts_left': 'Attempts left: {n}',
    'about.contact': 'Any questions? Email us at',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('app-language');
    return (stored === 'en' ? 'en' : 'uk') as Language;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};


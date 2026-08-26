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

    // Modes
    'modes.news': 'Новини',
    'modes.articles': 'Статті',
    'modes.resources': 'Ресурси',
    'modes.components': 'Компоненти',
    'modes.templates': 'Сніпети',
    'modes.palettes': 'Палітри',
    'modes.dictionary': 'Словник',
    'modes.editor': 'Редактор',
    'modes.design': 'Дизайн',

    // Editor Mode
    'editor.title': 'Онлайн-Редактор Коду',
    'editor.subtitle': 'Пишіть та виконуйте код Python безпосередньо у браузері через WebAssembly (Pyodide) без серверного навантаження.',
    'editor.run': 'Запустити код',
    'editor.running': 'Виконується...',
    'editor.stop': 'Зупинити',
    'editor.reset': 'Скинути код',
    'editor.clear_console': 'Очистити консоль',
    'editor.copy': 'Скопіювати код',
    'editor.copied': 'Скопійовано!',
    'editor.presets': 'Шаблони коду',
    'editor.terminal_title': 'Термінал / Консоль',
    'editor.status_ready': 'Готовий',
    'editor.status_running': 'Виконується',
    'editor.status_success': 'Успішно завершено',
    'editor.status_error': 'Помилка виконання',
    'editor.status_timeout': 'Перевищено ліміт часу (10с)',
    'editor.welcome': 'Готово до виконання. Натисніть "Запустити код" для тестування скрипту.',
    'editor.loading_engine': 'Ініціалізація рушія WebAssembly Pyodide...',
    'editor.exec_time': 'Час виконання',

    // Search
    'search.placeholder': 'Пошук статей...',
    'search.semantic_default': 'Семантичний пошук...',
    'pills.all': 'Всі',

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
    'auth.google': 'Увійти через Google',
    'auth.or': 'або',
    'auth.forgot': 'Забули пароль?',
    'auth.back_to_login': 'Повернутися до входу',

    // Reset password
    'reset.title': 'Відновлення паролю',
    'reset.subtitle': 'Введіть email, і ми надішлемо посилання для скидання паролю',
    'reset.submit': 'Надіслати посилання',
    'reset.sent': 'Посилання надіслано! Перевірте свою пошту.',
    'reset.error': 'Не вдалося надіслати посилання. Спробуйте пізніше.',

    // Update password
    'update.title': 'Новий пароль',
    'update.subtitle': 'Введіть новий пароль для свого акаунта',
    'update.new_password': 'Новий пароль',
    'update.confirm_password': 'Підтвердіть пароль',
    'update.mismatch': 'Паролі не співпадають',
    'update.submit': 'Зберегти пароль',
    'update.success': 'Пароль успішно змінено!',
    'update.error': 'Не вдалося змінити пароль',
    'update.invalid_link': 'Посилання недійсне або застаріле. Запросіть новий лист.',

    // Footer
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

    // Modes
    'modes.news': 'News',
    'modes.articles': 'Articles',
    'modes.resources': 'Resources',
    'modes.components': 'Components',
    'modes.templates': 'Snippets',
    'modes.palettes': 'Palettes',
    'modes.dictionary': 'Dictionary',
    'modes.editor': 'Editor',
    'modes.design': 'Design',

    // Editor Mode
    'editor.title': 'Online Code Editor',
    'editor.subtitle': 'Write and execute Python code directly in your browser via WebAssembly (Pyodide) with zero server latency.',
    'editor.run': 'Run Code',
    'editor.running': 'Running...',
    'editor.stop': 'Stop',
    'editor.reset': 'Reset Code',
    'editor.clear_console': 'Clear Console',
    'editor.copy': 'Copy Code',
    'editor.copied': 'Copied!',
    'editor.presets': 'Code Templates',
    'editor.terminal_title': 'Terminal / Console',
    'editor.status_ready': 'Ready',
    'editor.status_running': 'Running',
    'editor.status_success': 'Completed Successfully',
    'editor.status_error': 'Execution Error',
    'editor.status_timeout': 'Timed Out (10s limit)',
    'editor.welcome': 'Ready for execution. Click "Run Code" to test the script.',
    'editor.loading_engine': 'Initializing Pyodide WebAssembly engine...',
    'editor.exec_time': 'Execution time',

    // Search
    'search.placeholder': 'Search articles...',
    'search.semantic_default': 'Semantic search...',
    'pills.all': 'All',

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
    'sections.title': 'Sections',
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
    'auth.google': 'Sign in with Google',
    'auth.or': 'or',
    'auth.forgot': 'Forgot password?',
    'auth.back_to_login': 'Back to sign in',

    // Reset password
    'reset.title': 'Password recovery',
    'reset.subtitle': 'Enter your email and we will send you a reset link',
    'reset.submit': 'Send reset link',
    'reset.sent': 'Link sent! Check your inbox.',
    'reset.error': 'Could not send the link. Please try again later.',

    // Update password
    'update.title': 'New password',
    'update.subtitle': 'Enter a new password for your account',
    'update.new_password': 'New password',
    'update.confirm_password': 'Confirm password',
    'update.mismatch': 'Passwords do not match',
    'update.submit': 'Save password',
    'update.success': 'Password updated successfully!',
    'update.error': 'Could not update password',
    'update.invalid_link': 'This link is invalid or expired. Request a new email.',

    // Footer
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

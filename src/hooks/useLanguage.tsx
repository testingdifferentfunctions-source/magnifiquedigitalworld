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
    'modes.research': 'Дослідження',
    'modes.palettes': 'Палітри',
    'modes.dictionary': 'Словник',
    'modes.tools': 'Інструменти',
    'modes.editor': 'Редактор',
    'modes.design': 'Дизайн',

    // Tools Mode & Hub
    'tools.title': 'Інструменти',
    'tools.subtitle': 'Набір інтерактивних онлайн-інструментів, пісочниць та утиліт для веброзробників.',
    'tools.open': 'Відкрити',
    'tools.back_to_hub': 'Всі інструменти',
    'tools.code_editor.title': 'Редактор коду',
    'tools.code_editor.description': 'Повноцінний редактор коду з підтримкою виконання скриптів',
    'tools.code_editor.badge': 'Python • WebAssembly',

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
    'auth.mfa_title': 'Двофакторна автентифікація',
    'auth.mfa_subtitle': 'Введіть 6-значний код із застосунку Google Authenticator для підтвердження входу',
    'auth.mfa_code_label': '6-значний код Google Authenticator',
    'auth.mfa_verify': 'Підтвердити та увійти',
    'auth.mfa_verifying': 'Перевірка коду...',
    'auth.mfa_invalid': 'Невірний код автентифікації. Спробуйте ще раз.',
    'auth.mfa_back': 'Назад до введення пароля',

    // 2FA Admin Settings
    'mfa.title': 'Двофакторна автентифікація (2FA)',
    'mfa.subtitle': 'Захист облікового запису адміністратора одноразовими паролями TOTP (Google Authenticator)',
    'mfa.status_enabled': 'Захист 2FA увімкнено',
    'mfa.status_disabled': '2FA не налаштовано',
    'mfa.status_enabled_desc': 'Ваш акаунт надійно захищений. При кожному вході вимагається 6-значний код із Google Authenticator.',
    'mfa.status_disabled_desc': 'Рекомендується увімкнути 2FA для максимального захисту панелі адміністратора.',
    'mfa.setup_btn': 'Налаштувати Google Authenticator',
    'mfa.disable_btn': 'Вимкнути 2FA',
    'mfa.disabling': 'Вимкнення...',
    'mfa.step1_title': '1. Відскануйте QR-код',
    'mfa.step1_desc': 'Відкрийте застосунок Google Authenticator на смартфоні та відскануйте цей QR-код:',
    'mfa.manual_key': 'Або введіть секретний ключ вручну:',
    'mfa.copy_key': 'Скопіювати',
    'mfa.copied': 'Скопійовано!',
    'mfa.step2_title': '2. Введіть 6-значний код',
    'mfa.step2_desc': 'Введіть 6 цифр, які зараз відображаються у застосунку, щоб завершити налаштування:',
    'mfa.activate_btn': 'Активувати 2FA',
    'mfa.activating': 'Активація...',
    'mfa.cancel_btn': 'Скасувати',
    'mfa.success_enabled': 'Двофакторну автентифікацію успішно активовано!',
    'mfa.success_disabled': 'Двофакторну автентифікацію вимкнено',
    'mfa.error_enabling': 'Не вдалося перевірити код. Переконайтеся, що час на пристрої синхронізовано.',
    'mfa.error_disabling': 'Не вдалося вимкнути 2FA',
    'mfa.confirm_disable_title': 'Вимкнути двофакторну автентифікацію?',
    'mfa.confirm_disable_desc': 'Вхід до адмін-панелі здійснюватиметься лише за паролем. Ви впевнені?',

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

    // Buttons & Card Actions
    'card.read': 'Прочитати',
    'card.colors': 'Кольори',
    'card.view': 'Переглянути',
    'card.back': 'Назад',
    'card.sources': 'Використані джерела',
    'card.like': 'Вподобати',
    'card.share': 'Поділитися',
    'card.details': 'Деталі',
    'card.try': 'Спробувати',
    'card.test': 'Тестувати',
    'card.copy': 'Скопіювати',
    'card.copied': 'Скопійовано!',
    'card.preview': "Прев'ю",
    'card.site_preview': "Прев'ю сайту",

    // Detailed Pages Actions & Labels
    'detail.back': 'Назад',
    'detail.back_to_research': 'До списку досліджень',
    'detail.sources': 'Використані джерела',
    'detail.sources_desc': 'Першоджерела та матеріали',
    'detail.read': 'Прочитати',
    'detail.colors': 'Кольори',
    'detail.view': 'Переглянути',
    'detail.view_site': 'Переглянути сайт',
    'detail.official_site': 'Офіційний сайт / документація',
    'detail.source': 'Джерело',
    'detail.image_source': 'Джерело зображення',
    'detail.screenshot_source': 'Джерело знімку сайту',
    'detail.like': 'Вподобати',
    'detail.share': 'Поділитися',
    'detail.copy_code': 'Копіювати код',
    'detail.copy_prompt': 'Копіювати промпт',
    'detail.try': 'Спробувати',
    'detail.try_code': 'Спробувати код',
    'detail.test': 'Тестувати',
    'detail.toc': 'Зміст',
    'detail.toc_article': 'Зміст статті',
    'detail.code_integration': 'Інтеграція в код',
    'detail.color_palette': 'Палітра кольорів (Color Palette)',
    'detail.color_palette_desc': 'Детальні характеристики кожного кольору з конвертацією значень та готовими фрагментами коду для розробки.',
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
    'modes.research': 'Research',
    'modes.palettes': 'Palettes',
    'modes.dictionary': 'Dictionary',
    'modes.tools': 'Tools',
    'modes.editor': 'Editor',
    'modes.design': 'Design',

    // Tools Mode & Hub
    'tools.title': 'Tools',
    'tools.subtitle': 'A suite of interactive online developer tools, playgrounds, and utilities.',
    'tools.open': 'Open',
    'tools.back_to_hub': 'All Tools',
    'tools.code_editor.title': 'Code Editor',
    'tools.code_editor.description': 'Full-featured online code editor with real-time script execution',
    'tools.code_editor.badge': 'Python • WebAssembly',

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
    'auth.mfa_title': 'Two-Factor Authentication',
    'auth.mfa_subtitle': 'Enter the 6-digit code from your Google Authenticator app to complete sign in',
    'auth.mfa_code_label': '6-digit Google Authenticator Code',
    'auth.mfa_verify': 'Verify & Sign In',
    'auth.mfa_verifying': 'Verifying code...',
    'auth.mfa_invalid': 'Invalid authentication code. Please try again.',
    'auth.mfa_back': 'Back to password login',

    // 2FA Admin Settings
    'mfa.title': 'Two-Factor Authentication (2FA)',
    'mfa.subtitle': 'Protect your admin account with TOTP one-time passwords (Google Authenticator)',
    'mfa.status_enabled': '2FA Protection Enabled',
    'mfa.status_disabled': '2FA Not Configured',
    'mfa.status_enabled_desc': 'Your account is securely protected. A 6-digit code from Google Authenticator is required on every login.',
    'mfa.status_disabled_desc': 'We strongly recommend enabling 2FA for maximum administrative security.',
    'mfa.setup_btn': 'Set Up Google Authenticator',
    'mfa.disable_btn': 'Disable 2FA',
    'mfa.disabling': 'Disabling...',
    'mfa.step1_title': '1. Scan QR Code',
    'mfa.step1_desc': 'Open Google Authenticator on your phone and scan this QR code:',
    'mfa.manual_key': 'Or enter the secret key manually:',
    'mfa.copy_key': 'Copy',
    'mfa.copied': 'Copied!',
    'mfa.step2_title': '2. Enter 6-digit code',
    'mfa.step2_desc': 'Enter the 6-digit code currently shown in your authenticator app to complete setup:',
    'mfa.activate_btn': 'Activate 2FA',
    'mfa.activating': 'Activating...',
    'mfa.cancel_btn': 'Cancel',
    'mfa.success_enabled': 'Two-Factor Authentication successfully activated!',
    'mfa.success_disabled': 'Two-Factor Authentication disabled',
    'mfa.error_enabling': 'Could not verify code. Please ensure your device clock is synchronized.',
    'mfa.error_disabling': 'Could not disable 2FA',
    'mfa.confirm_disable_title': 'Disable Two-Factor Authentication?',
    'mfa.confirm_disable_desc': 'Admin login will only require your password. Are you sure?',

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

    // Buttons & Card Actions
    'card.read': 'Read',
    'card.colors': 'Colors',
    'card.view': 'View',
    'card.back': 'Back',
    'card.sources': 'Used Sources',
    'card.like': 'Like',
    'card.share': 'Share',
    'card.details': 'Details',
    'card.try': 'Try',
    'card.test': 'Test',
    'card.copy': 'Copy',
    'card.copied': 'Copied!',
    'card.preview': 'Preview',
    'card.site_preview': 'Site Preview',

    // Detailed Pages Actions & Labels
    'detail.back': 'Back',
    'detail.back_to_research': 'Back to research',
    'detail.sources': 'Used Sources',
    'detail.sources_desc': 'References & Materials',
    'detail.read': 'Read',
    'detail.colors': 'Colors',
    'detail.view': 'View',
    'detail.view_site': 'View website',
    'detail.official_site': 'Official website / documentation',
    'detail.source': 'Source',
    'detail.image_source': 'Image source',
    'detail.screenshot_source': 'Site screenshot source',
    'detail.like': 'Like',
    'detail.share': 'Share',
    'detail.copy_code': 'Copy code',
    'detail.copy_prompt': 'Copy prompt',
    'detail.try': 'Try',
    'detail.try_code': 'Try Code',
    'detail.test': 'Test',
    'detail.toc': 'Table of Contents',
    'detail.toc_article': 'Table of Contents',
    'detail.code_integration': 'Code Integration',
    'detail.color_palette': 'Color Palette',
    'detail.color_palette_desc': 'Detailed characteristics of each color with converted values and ready-to-use snippets for development.',
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

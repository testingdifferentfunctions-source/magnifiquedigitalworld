import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CategoryMode =
  | "articles"
  | "news"
  | "resources"
  | "components"
  | "templates"
  | "research"
  | "palettes"
  | "dictionary"
  | "design"
  | "editor";

export interface Subcategory {
  id: string;
  category_id: string;
  mode: CategoryMode;
  name: string; // Ukrainian (base)
  title?: string;
  name_en?: string | null;
  title_en?: string | null;
  slug?: string | null;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  mode: CategoryMode;
  name: string; // Ukrainian (base)
  name_en?: string | null;
  slug?: string | null;
  image_url?: string | null;
  sort_order?: number;
  sub_topics?: string[]; // Legacy / backup
  subcategories?: Subcategory[];
  created_at?: string;
  updated_at?: string;
}

export const SEED_SUBCATEGORY_TRANSLATIONS: Record<string, string> = {
  // Articles
  "Синтаксис": "Syntax",
  "Змінні": "Variables",
  "Типи даних": "Data Types",
  "Умови": "Conditions",
  "Цикли": "Loops",
  "Функції": "Functions",
  "Списки": "Lists",
  "Класи": "Classes",
  "Наслідування": "Inheritance",
  "Поліморфізм": "Polymorphism",
  "Інкапсуляція": "Encapsulation",
  "Магічні методи": "Magic Methods",
  "Датакласи": "Dataclasses",
  "Асинхронність": "Asynchrony",
  "Міграції": "Migrations",
  "Бази даних та ORM": "Databases & ORM",
  // News
  "ШІ-агенти": "AI Agents",
  "Безпека": "Security",
  "Нові версії": "New Releases",
  "Патчі": "Patches",
  "Анонси": "Announcements",
  "Депрекації": "Deprecations",
  // Resources
  "Шрифти": "Fonts",
  "Іконки": "Icons",
  "3D Асети": "3D Assets",
  "Ілюстрації": "Illustrations",
  "Кольори": "Colors",
  "VS Code розширення": "VS Code Extensions",
  "Термінал & CLI": "Terminal & CLI",
  "Тестування API": "API Testing",
  "BaaS сервіси": "BaaS Services",
  "Redis кеш": "Redis Cache",
  "Auth провайдери": "Auth Providers",
  "Prompt генератори": "Prompt Generators",
  "Генерація зображень": "Image Generation",
  // Components
  "Кнопки & Бейджі": "Buttons & Badges",
  "Модальні вікна": "Modals",
  "Картки": "Cards",
  "Dropdown меню": "Dropdown Menus",
  "Hero секції": "Hero Sections",
  "Лінійні графіки": "Line Charts",
  "3D Візуалізація": "3D Visualization",
  "Input поля": "Input Fields",
  "Zod схеми": "Zod Schemas",
  "Hover ефекти": "Hover Effects",
  "Скрол-анімації": "Scroll Animations",
  "Glow ефекти": "Glow Effects",
  // Templates
  "Парсери": "Parsers",
  "Автоматизація": "Automation",
  "Скрипти": "Scripts",
  // Research
  "Бенчмарки точності": "Accuracy Benchmarks",
  "Швидкість інференсу": "Inference Speed",
  "Контекстні вікна": "Context Windows",
  "Мультимодальність": "Multimodality",
  "RAG Системи": "RAG Systems",
  "Бази даних Latency": "Database Latency",
  "Wasm Швидкодія": "Wasm Performance",
  "Мікросервіси vs Моноліт": "Microservices vs Monolith",
  "Розподілений кеш": "Distributed Cache",
  "Тренди мов програмування": "Language Trends",
  "Аналітика ринку праці": "Job Market Analytics",
  "Стек 2026": "Stack 2026",
  "Open Source активність": "Open Source Activity",
  // Palettes
  "Світлі теми (Light)": "Light Themes",
  "Темні теми (Dark)": "Dark Themes",
  // Dictionary
  "Архітектура & Патерни": "Architecture & Patterns",
  "Алгоритми": "Algorithms",
  "Структури даних": "Data Structures",
  "Складність O(n)": "Complexity O(n)",
  "Конкурентність": "Concurrency",
  "Мемоізація": "Memoization",
  "Веб & Мережі": "Web & Networking",
  "Бази даних & Storage": "Databases & Storage",
  "Індексація": "Indexing",
  "CAP теорема": "CAP Theorem",
  // Editor
  "Основи & Синтаксис": "Basics & Syntax",
  "Змінні & Типи": "Variables & Types",
  "Списки & Словники": "Lists & Dictionaries",
  "OOP Класи": "OOP Classes",
  "Фібоначчі": "Fibonacci",
  "Швидке сортування": "Quicksort",
  "Бінарний пошук": "Binary Search",
  "Динамічне програмування": "Dynamic Programming",
  "Графи BFS/DFS": "Graphs BFS/DFS",
  "Математика & Data": "Math & Data",
  "Генератор чисел": "Number Generator",
  "Статистика": "Statistics",
  "Матриці": "Matrices",
  "JSON Парсер": "JSON Parser",
  "Регулярні вирази": "Regular Expressions",
  "ASCII Арт": "ASCII Art",
  "Таймер & Бенчмарк": "Timer & Benchmark",
  "Шифрування": "Encryption",
  "Обробка тексту": "Text Processing",
  // Design
  "Glow кнопки": "Glow Buttons",
  "Карточки": "Cards",
  "Анімації": "Animations",
  "3D Сфери": "3D Spheres",
  "SaaS Дашборди": "SaaS Dashboards",
  "Навігаційні бари": "Navigation Bars",
  "Footer блоки": "Footer Blocks",
};

export const getSubcategoryTranslation = (name: string, fallbackEn?: string | null): string => {
  if (fallbackEn && fallbackEn.trim()) return fallbackEn.trim();
  return SEED_SUBCATEGORY_TRANSLATIONS[name] || name;
};

// Normalizer helper so "resource" and "resources" or "template" and "templates" work symmetrically
export const normalizeCategoryMode = (mode?: string): CategoryMode => {
  if (!mode) return "articles";
  const m = mode.toLowerCase().trim();
  if (m === "news") return "news";
  if (m === "resource" || m === "resources") return "resources";
  if (m === "component" || m === "components") return "components";
  if (m === "template" || m === "templates" || m === "snippets") return "templates";
  if (m === "research" || m === "researches" || m === "studies") return "research";
  if (m === "palette" || m === "palettes") return "palettes";
  if (m === "dictionary" || m === "terms" || m === "vocab") return "dictionary";
  if (m === "design" || m === "designs") return "design";
  if (m === "editor" || m === "code" || m === "playground") return "editor";
  return "articles";
};

// Rich default seed data used when DB is unpopulated or for graceful fallback
export const DEFAULT_SEED_CATEGORIES: Record<
  CategoryMode,
  {
    id: string;
    name: string;
    name_en?: string;
    slug: string;
    image_url?: string;
    subcategories: string[];
  }[]
> = {
  articles: [
    {
      id: "art-python-basics",
      name: "Основи Python",
      name_en: "Python Basics",
      slug: "basics",
      image_url: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&fit=crop",
      subcategories: ["Синтаксис", "Змінні", "Типи даних", "Умови", "Цикли", "Функції", "Списки"],
    },
    {
      id: "art-python-oop",
      name: "Об'єктно-орієнтоване програмування",
      name_en: "OOP in Python",
      slug: "oop",
      image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&fit=crop",
      subcategories: ["Класи", "Наслідування", "Поліморфізм", "Інкапсуляція", "Магічні методи", "Датакласи"],
    },
    {
      id: "art-web-dev",
      name: "Веб-розробка та API",
      name_en: "Web Dev & API",
      slug: "web",
      image_url: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&fit=crop",
      subcategories: ["FastAPI", "Django", "Flask", "REST API", "Асинхронність", "WebSocket"],
    },
    {
      id: "art-libraries",
      name: "Бібліотеки та Пакети",
      name_en: "Libraries & Packages",
      slug: "libraries",
      image_url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&fit=crop",
      subcategories: ["NumPy", "Pandas", "Requests", "Pytest", "Pydantic", "BeautifulSoup"],
    },
    {
      id: "art-databases",
      name: "Бази даних та ORM",
      name_en: "Databases & ORM",
      slug: "databases",
      image_url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&fit=crop",
      subcategories: ["PostgreSQL", "SQLite", "SQLAlchemy", "Redis", "Міграції", "Alembic"],
    },
  ],
  news: [
    {
      id: "news-languages",
      name: "Мови програмування",
      name_en: "Programming Languages",
      slug: "languages",
      image_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&fit=crop",
      subcategories: ["Python", "Rust", "Go", "TypeScript", "JavaScript", "C++", "JIT-компілятори"],
    },
    {
      id: "news-web",
      name: "Веб & Фронтенд",
      name_en: "Web & Frontend",
      slug: "web",
      image_url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&fit=crop",
      subcategories: ["React", "Next.js", "Vue", "Tailwind CSS", "Vite", "WebAssembly", "Node.js"],
    },
    {
      id: "news-ai",
      name: "Штучний інтелект (AI)",
      name_en: "Artificial Intelligence",
      slug: "ai",
      image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&fit=crop",
      subcategories: ["LLM", "GPT", "Gemini", "Claude", "ШІ-агенти", "Machine Learning", "Vision"],
    },
    {
      id: "news-devops",
      name: "DevOps & Хмара",
      name_en: "DevOps & Cloud",
      slug: "devops",
      image_url: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=400&fit=crop",
      subcategories: ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux", "Serverless", "Безпека"],
    },
    {
      id: "news-releases",
      name: "Релізи та Оновлення",
      name_en: "Releases & Updates",
      slug: "releases",
      image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&fit=crop",
      subcategories: ["Нові версії", "Патчі", "Анонси", "Roadmap", "Депрекації"],
    },
  ],
  resources: [
    {
      id: "res-design",
      name: "Дизайн & UI",
      name_en: "Design & UI",
      slug: "design",
      image_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&fit=crop",
      subcategories: ["Figma UI Kits", "Шрифти", "Іконки", "3D Асети", "Ілюстрації", "Кольори"],
    },
    {
      id: "res-devtools",
      name: "Інструменти розробника",
      name_en: "Developer Tools",
      slug: "devtools",
      image_url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&fit=crop",
      subcategories: ["VS Code розширення", "Термінал & CLI", "Git GUI", "Тестування API", "Linters"],
    },
    {
      id: "res-backend",
      name: "Бекенд & Бази даних",
      name_en: "Backend & Databases",
      slug: "backend",
      image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&fit=crop",
      subcategories: ["Database GUI", "BaaS сервіси", "Redis кеш", "Auth провайдери", "Mock API"],
    },
    {
      id: "res-cloud",
      name: "Хостинг & Хмара",
      name_en: "Hosting & Cloud",
      slug: "cloud",
      image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&fit=crop",
      subcategories: ["Vercel", "Railway", "Supabase", "Cloudflare", "Docker Hub", "AWS Free"],
    },
    {
      id: "res-ai",
      name: "ШІ-інструменти",
      name_en: "AI Tools",
      slug: "ai",
      image_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&fit=crop",
      subcategories: ["Prompt генератори", "AI Code Assistants", "Генерація зображень", "Voice AI"],
    },
  ],
  components: [
    {
      id: "comp-ui",
      name: "UI компоненти",
      name_en: "UI Components",
      slug: "ui",
      image_url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&fit=crop",
      subcategories: ["Кнопки & Бейджі", "Модальні вікна", "Картки", "Dropdown меню", "Hero секції", "Sidebar"],
    },
    {
      id: "comp-charts",
      name: "Графіки & Charts",
      name_en: "Charts & Visualization",
      slug: "charts",
      image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&fit=crop",
      subcategories: ["Лінійні графіки", "Bar Charts", "Pie Charts", "Sparklines", "Recharts", "3D Візуалізація"],
    },
    {
      id: "comp-forms",
      name: "Форми & Валідація",
      name_en: "Forms & Validation",
      slug: "forms",
      image_url: "https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=400&fit=crop",
      subcategories: ["Input поля", "Form Multi-step", "Zod схеми", "DatePicker", "File Upload", "Switch"],
    },
    {
      id: "comp-animation",
      name: "Анімації",
      name_en: "Animations",
      slug: "animation",
      image_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&fit=crop",
      subcategories: ["Framer Motion", "Hover ефекти", "Скрол-анімації", "Transitions", "Glow ефекти"],
    },
  ],
  templates: [
    {
      id: "temp-python",
      name: "Python & CLI",
      name_en: "Python & CLI",
      slug: "python",
      image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&fit=crop",
      subcategories: ["Argparse CLI", "AsyncIO Loops", "Парсери", "Автоматизація", "Скрипти"],
    },
    {
      id: "temp-react",
      name: "React & Hooks",
      name_en: "React & Hooks",
      slug: "react",
      image_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&fit=crop",
      subcategories: ["useDebounce", "useLocalStorage", "useIntersection", "Context Provider", "Custom Hooks"],
    },
    {
      id: "temp-js",
      name: "JavaScript & TS",
      name_en: "JavaScript & TS",
      slug: "js",
      image_url: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&fit=crop",
      subcategories: ["Array Helpers", "Date Utilities", "Type Guards", "Async Helpers", "String Formatters"],
    },
    {
      id: "temp-backend",
      name: "Бекенд & API",
      name_en: "Backend & API",
      slug: "backend",
      image_url: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&fit=crop",
      subcategories: ["FastAPI Endpoints", "JWT Auth Flow", "Rate Limiter", "Webhook Handlers", "Middleware"],
    },
    {
      id: "temp-data",
      name: "Утиліти & Дані",
      name_en: "Data & Utilities",
      slug: "data",
      image_url: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&fit=crop",
      subcategories: ["CSV/JSON Export", "Regex Patterns", "Hash Utilities", "Cache Wrapper", "File Processors"],
    },
  ],
  research: [
    {
      id: "res-ai-llm",
      name: "ШІ & LLM Моделі",
      name_en: "AI & LLM Models",
      slug: "ai-llm",
      image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&fit=crop",
      subcategories: ["Бенчмарки точності", "Швидкість інференсу", "Контекстні вікна", "Мультимодальність", "RAG Системи", "Quantization"],
    },
    {
      id: "res-benchmarks",
      name: "Продуктивність & Бенчмарки",
      name_en: "Performance & Benchmarks",
      slug: "benchmarks",
      image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&fit=crop",
      subcategories: ["Web Frameworks RPS", "Бази даних Latency", "Node vs Bun vs Deno", "V8 Engine JIT", "Wasm Швидкодія"],
    },
    {
      id: "res-architecture",
      name: "Архітектура & Масштабування",
      name_en: "Architecture & Scale",
      slug: "architecture",
      image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&fit=crop",
      subcategories: ["Мікросервіси vs Моноліт", "Event-driven", "Розподілений кеш", "Edge Computing", "High Load"],
    },
    {
      id: "res-analytics",
      name: "Індустрія & Зарплати",
      name_en: "Industry & Tech Salaries",
      slug: "analytics",
      image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&fit=crop",
      subcategories: ["Тренди мов програмування", "Аналітика ринку праці", "Стек 2026", "Open Source активність"],
    },
  ],
  palettes: [
    {
      id: "pal-dark",
      name: "Темні теми (Dark)",
      name_en: "Dark Themes",
      slug: "dark",
      image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&fit=crop",
      subcategories: ["OLED Black", "Midnight Blue", "Cyberpunk Neon", "Emerald Dark", "Slate Grey"],
    },
    {
      id: "pal-light",
      name: "Світлі теми (Light)",
      name_en: "Light Themes",
      slug: "light",
      image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&fit=crop",
      subcategories: ["Clean White", "Warm Cream", "Pastel Soft", "Nordic Crisp", "Minimalist"],
    },
    {
      id: "pal-saas",
      name: "SaaS & Продукти",
      name_en: "SaaS & Products",
      slug: "saas",
      image_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&fit=crop",
      subcategories: ["Modern Dashboard", "Enterprise", "B2B Soft", "Gradient UI", "High Contrast"],
    },
    {
      id: "pal-devtools",
      name: "DevTools & Термінал",
      name_en: "DevTools & Terminal",
      slug: "devtools",
      image_url: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400&fit=crop",
      subcategories: ["Matrix Green", "Monokai Pro", "Gruvbox", "Catppuccin", "Dracula"],
    },
    {
      id: "pal-fintech",
      name: "Fintech & Градієнти",
      name_en: "Fintech & Gradients",
      slug: "fintech",
      image_url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&fit=crop",
      subcategories: ["Crypto Indigo", "Banking Emerald", "Purple Glow", "Sunset Gold", "Royal Navy"],
    },
  ],
  dictionary: [
    {
      id: "dict-arch",
      name: "Архітектура & Патерни",
      name_en: "Architecture & Patterns",
      slug: "architecture",
      image_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&fit=crop",
      subcategories: ["Microservices", "CQRS", "Event Sourcing", "SOLID", "Clean Architecture", "Dependency Injection"],
    },
    {
      id: "dict-cs",
      name: "Computer Science",
      name_en: "Computer Science",
      slug: "cs",
      image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&fit=crop",
      subcategories: ["Алгоритми", "Структури даних", "Складність O(n)", "Конкурентність", "Мемоізація"],
    },
    {
      id: "dict-web",
      name: "Веб & Мережі",
      name_en: "Web & Networking",
      slug: "networking",
      image_url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&fit=crop",
      subcategories: ["HTTP/3", "WebSocket", "GraphQL", "REST", "CORS", "OAuth2", "gRPC"],
    },
    {
      id: "dict-db",
      name: "Бази даних & Storage",
      name_en: "Databases & Storage",
      slug: "databases",
      image_url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&fit=crop",
      subcategories: ["ACID", "Індексація", "Sharding", "CAP теорема", "Vector Search", "Redis"],
    },
  ],
  editor: [
    {
      id: "ed-basics",
      name: "Основи & Синтаксис",
      name_en: "Basics & Syntax",
      slug: "basics",
      image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&fit=crop",
      subcategories: ["Hello World", "Змінні & Типи", "Списки & Словники", "Функції", "OOP Класи"],
    },
    {
      id: "ed-algo",
      name: "Алгоритми & CS",
      name_en: "Algorithms & CS",
      slug: "algorithms",
      image_url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&fit=crop",
      subcategories: ["Фібоначчі", "Швидке сортування", "Бінарний пошук", "Динамічне програмування", "Графи BFS/DFS"],
    },
    {
      id: "ed-math",
      name: "Математика & Data",
      name_en: "Math & Data",
      slug: "math-data",
      image_url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&fit=crop",
      subcategories: ["Генератор чисел", "Статистика", "Матриці", "JSON Парсер", "Регулярні вирази"],
    },
    {
      id: "ed-wasm",
      name: "WebAssembly & Скрипти",
      name_en: "WebAssembly & Scripts",
      slug: "wasm-scripts",
      image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&fit=crop",
      subcategories: ["ASCII Арт", "Таймер & Бенчмарк", "Шифрування", "Обробка тексту"],
    },
  ],
  design: [
    {
      id: "des-ui-kits",
      name: "UI Компоненти & Елементи",
      name_en: "UI Components & Elements",
      slug: "ui-elements",
      image_url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&fit=crop",
      subcategories: ["Glow кнопки", "Карточки", "Segmented Controls", "Glassmorphism", "Bento Grid", "Анімації"],
    },
    {
      id: "des-visual-effects",
      name: "Візуальні ефекти & Градієнти",
      name_en: "Visual Effects & Gradients",
      slug: "visual-effects",
      image_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&fit=crop",
      subcategories: ["Aurora Mesh", "Neon Glow", "Cyberpunk", "3D Сфери", "Dark Mode UI"],
    },
    {
      id: "des-layouts",
      name: "Макети та Dashboards",
      name_en: "Layouts & Dashboards",
      slug: "layouts",
      image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&fit=crop",
      subcategories: ["SaaS Дашборди", "Hero секції", "Навігаційні бари", "Footer блоки"],
    },
  ],
};

const getFallbackCategoriesForMode = (mode: CategoryMode): Category[] => {
  const seeds = DEFAULT_SEED_CATEGORIES[mode] || [];
  return seeds.map((s, idx) => ({
    id: s.id,
    mode,
    name: s.name,
    name_en: s.name_en || null,
    slug: s.slug,
    image_url: s.image_url || null,
    sort_order: idx,
    sub_topics: s.subcategories,
    subcategories: s.subcategories.map((subName, subIdx) => {
      const transEn = getSubcategoryTranslation(subName);
      return {
        id: `${s.id}-sub-${subIdx}`,
        category_id: s.id,
        mode,
        name: subName,
        title: subName,
        title_en: transEn,
        name_en: transEn,
        sort_order: subIdx,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
};

/**
 * Universal hook to fetch categories (and their subcategories) by mode.
 * If mode is omitted, fetches all categories across all modes.
 */
export const useCategories = (rawMode?: string) => {
  const normalizedMode = rawMode ? normalizeCategoryMode(rawMode) : undefined;

  return useQuery({
    queryKey: ["categories", normalizedMode ?? "all"],
    queryFn: async () => {
      try {
        // 1. Fetch categories
        let catQuery = supabase.from("categories").select("*");
        if (normalizedMode) {
          catQuery = catQuery.eq("mode", normalizedMode);
        }
        const { data: catData, error: catError } = await catQuery
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true });

        // If table doesn't have mode or column error, retry without mode filter
        let finalCatData = catData;
        if (catError) {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("categories")
            .select("*")
            .order("name");
          if (!fallbackError && fallbackData) {
            finalCatData = normalizedMode
              ? fallbackData.filter(
                  (c: any) => !c.mode || normalizeCategoryMode(c.mode) === normalizedMode
                )
              : fallbackData;
          } else {
            throw catError;
          }
        }

        // 2. Fetch subcategories from `subcategories` table if available
        let subcatsData: Subcategory[] = [];
        try {
          let subQuery = supabase.from("subcategories").select("*");
          if (normalizedMode) {
            subQuery = subQuery.eq("mode", normalizedMode);
          }
          const { data: subData, error: subError } = await subQuery
            .order("sort_order", { ascending: true })
            .order("name", { ascending: true });

          if (!subError && subData) {
            subcatsData = subData as any[];
          }
        } catch {
          // Subcategories table might not be created yet; we gracefully fall back to sub_topics array
        }

        // Map subcategories under their parent categories
        if (finalCatData && finalCatData.length > 0) {
          return finalCatData.map((c: any) => {
            const linkedSubcategories = subcatsData.filter((sc) => sc.category_id === c.id);
            const legacySubTopics: string[] = Array.isArray(c.sub_topics) ? c.sub_topics : [];

            // If subcategories table has records for this category, use them
            // Otherwise generate subcategory objects from legacy sub_topics array
            const resolvedSubcategories: Subcategory[] =
              linkedSubcategories.length > 0
                ? linkedSubcategories.map((sc: any) => {
                    const rawName = sc.name || sc.title || "";
                    const rawEn = sc.title_en || sc.name_en || getSubcategoryTranslation(rawName);
                    return {
                      id: sc.id,
                      category_id: sc.category_id,
                      mode: normalizeCategoryMode(sc.mode || c.mode || normalizedMode || "articles"),
                      name: rawName,
                      title: rawName,
                      title_en: rawEn,
                      name_en: rawEn,
                      slug: sc.slug || null,
                      sort_order: sc.sort_order ?? 0,
                      created_at: sc.created_at,
                      updated_at: sc.updated_at,
                    };
                  })
                : legacySubTopics.map((st, idx) => {
                    const transEn = getSubcategoryTranslation(st);
                    return {
                      id: `${c.id}-sub-${idx}`,
                      category_id: c.id,
                      mode: normalizeCategoryMode(c.mode || normalizedMode || "articles"),
                      name: st,
                      title: st,
                      title_en: transEn,
                      name_en: transEn,
                      sort_order: idx,
                    };
                  });

            const resolvedSubTopics =
              resolvedSubcategories.length > 0
                ? resolvedSubcategories.map((sc) => sc.name)
                : legacySubTopics;

            return {
              ...c,
              mode: normalizeCategoryMode(c.mode || normalizedMode || "articles"),
              sub_topics: resolvedSubTopics,
              subcategories: resolvedSubcategories,
            } as Category;
          });
        }
      } catch (err) {
        console.warn("Failed to fetch categories from Supabase, using fallback:", err);
      }

      // Return default seed categories for this mode
      if (normalizedMode) {
        return getFallbackCategoriesForMode(normalizedMode);
      }

      // Return all seeds combined
      return [
        ...getFallbackCategoriesForMode("articles"),
        ...getFallbackCategoriesForMode("news"),
        ...getFallbackCategoriesForMode("resources"),
        ...getFallbackCategoriesForMode("components"),
        ...getFallbackCategoriesForMode("templates"),
        ...getFallbackCategoriesForMode("palettes"),
      ];
    },
  });
};

/**
 * Mutation: Create Main Category
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: {
      name: string;
      name_en?: string | null;
      mode?: string;
      slug?: string | null;
      image_url?: string | null;
      sub_topics?: string[];
      sort_order?: number;
    }) => {
      const payload: any = {
        name: category.name.trim(),
        name_en: category.name_en?.trim() || null,
        mode: normalizeCategoryMode(category.mode),
        slug: category.slug?.trim() || null,
        image_url: category.image_url || null,
        sub_topics: category.sub_topics || [],
        sort_order: category.sort_order ?? 0,
      };

      const { data, error } = await supabase
        .from("categories")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

/**
 * Mutation: Update Main Category
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...category
    }: Partial<Category> & { id: string }) => {
      const payload: any = { ...category };
      if (payload.mode) {
        payload.mode = normalizeCategoryMode(payload.mode);
      }
      delete payload.subcategories; // Don't send joined field

      const { data, error } = await supabase
        .from("categories")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

/**
 * Mutation: Delete Main Category (and linked subcategories)
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First delete subcategories if table exists
      try {
        await supabase.from("subcategories").delete().eq("category_id", id);
      } catch {
        /* ignore if table not present */
      }

      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

/**
 * Mutation: Create Subcategory
 */
export const useCreateSubcategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sub: {
      category_id: string;
      name?: string;
      title?: string;
      name_en?: string | null;
      title_en?: string | null;
      mode?: string;
      slug?: string | null;
      sort_order?: number;
    }) => {
      const subName = (sub.name || sub.title || "").trim();
      const subEn = (sub.title_en || sub.name_en || "").trim() || null;

      const payload: any = {
        category_id: sub.category_id,
        name: subName,
        title: subName,
        name_en: subEn,
        title_en: subEn,
        mode: normalizeCategoryMode(sub.mode),
        slug: sub.slug?.trim() || null,
        sort_order: sub.sort_order ?? 0,
      };

      // 1. Try to insert into subcategories table
      let insertedRow: any = null;
      try {
        const { data, error } = await supabase
          .from("subcategories")
          .insert(payload)
          .select()
          .single();

        if (!error && data) {
          insertedRow = data;
        }
      } catch {
        /* ignore */
      }

      // 2. Also append to parent category's `sub_topics` array for legacy/instant sync
      try {
        const { data: cat } = await supabase
          .from("categories")
          .select("sub_topics")
          .eq("id", sub.category_id)
          .maybeSingle();

        const currentList = Array.isArray(cat?.sub_topics) ? cat.sub_topics : [];
        if (!currentList.includes(subName)) {
          await supabase
            .from("categories")
            .update({ sub_topics: [...currentList, subName] } as any)
            .eq("id", sub.category_id);
        }
      } catch (err) {
        console.warn("Could not sync sub_topics to category:", err);
      }

      return insertedRow || { id: crypto.randomUUID(), ...payload };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

/**
 * Mutation: Update Subcategory
 */
export const useUpdateSubcategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      previousName,
      ...sub
    }: {
      id: string;
      category_id: string;
      name?: string;
      title?: string;
      previousName?: string;
      name_en?: string | null;
      title_en?: string | null;
      slug?: string | null;
      sort_order?: number;
    }) => {
      const subName = (sub.name || sub.title || "").trim();
      const subEn = (sub.title_en || sub.name_en || "").trim() || null;

      // 1. Update in subcategories table
      try {
        await supabase
          .from("subcategories")
          .update({
            name: subName,
            title: subName,
            name_en: subEn,
            title_en: subEn,
            slug: sub.slug?.trim() || null,
            sort_order: sub.sort_order ?? 0,
          } as any)
          .eq("id", id);
      } catch {
        /* ignore */
      }

      // 2. Sync in parent category `sub_topics`
      if (sub.category_id && previousName) {
        try {
          const { data: cat } = await supabase
            .from("categories")
            .select("sub_topics")
            .eq("id", sub.category_id)
            .maybeSingle();

          const currentList = Array.isArray(cat?.sub_topics) ? cat.sub_topics : [];
          const updatedList = currentList.map((item) =>
            item === previousName ? subName : item
          );
          await supabase
            .from("categories")
            .update({ sub_topics: updatedList } as any)
            .eq("id", sub.category_id);
        } catch {
          /* ignore */
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

/**
 * Mutation: Delete Subcategory
 */
export const useDeleteSubcategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      category_id,
      name,
    }: {
      id: string;
      category_id: string;
      name?: string;
    }) => {
      // 1. Delete from subcategories table
      try {
        await supabase.from("subcategories").delete().eq("id", id);
      } catch {
        /* ignore */
      }

      // 2. Remove from parent category's `sub_topics`
      if (category_id && name) {
        try {
          const { data: cat } = await supabase
            .from("categories")
            .select("sub_topics")
            .eq("id", category_id)
            .maybeSingle();

          const currentList = Array.isArray(cat?.sub_topics) ? cat.sub_topics : [];
          const updatedList = currentList.filter((item) => item !== name);
          await supabase
            .from("categories")
            .update({ sub_topics: updatedList } as any)
            .eq("id", category_id);
        } catch {
          /* ignore */
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

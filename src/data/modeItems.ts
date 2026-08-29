import type { ContentBlock } from "@/lib/blocks";
import type { ModeEntry, ModeEntryType } from "@/hooks/useModeEntries";

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  likes: number;
  url?: string;
}

export interface ComponentItem {
  id: string;
  title: string;
  description: string;
  url?: string;
}

export const fallbackModeEntries: ModeEntry[] = [
  // ===================== NEWS =====================
  {
    id: "news-python-313",
    type: "news",
    slug: "python-3-13-release",
    title_uk: "Реліз Python 3.13: Експериментальний JIT-компілятор, вільний GIL та нові можливості REPL",
    title_en: "Python 3.13 Released: Experimental JIT, Free-Threaded GIL and New Interactive REPL",
    description_uk: "Офіційно представлено нову версію мови програмування Python 3.13. Серед ключових оновлень — експериментальний вільний від GIL режим (PEP 703), інтегрований JIT-компілятор та суттєво покращений інтерактивний інтерпретатор з кольоровим підсвічуванням.",
    description_en: "Python 3.13 is officially here with experimental free-threaded build (no-GIL), a new JIT compiler preview, and a modernized colored REPL experience.",
    tags: ["Python", "Реліз", "JIT", "Програмування"],
    image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=600&fit=crop",
    image_source_url: "https://unsplash.com",
    external_url: "https://www.python.org",
    likes: 248,
    share_count: 85,
    published: true,
    sort_order: 1,
    created_at: "2026-02-18T12:00:00Z",
    updated_at: "2026-02-18T12:00:00Z",
    blocks_uk: [
      {
        id: "py13-h1",
        type: "header",
        level: 2,
        text: "Головні нововведення Python 3.13",
      },
      {
        id: "py13-p1",
        type: "paragraph",
        text: "Python 3.13 став одним із найважливіших релізів за останні роки. Команда core-розробників зробила великий крок до повноцінного багатопотокового виконання коду без блокування Global Interpreter Lock.",
      },
      {
        id: "py13-l1",
        type: "list",
        items: [
          "Вільний від GIL режим (free-threaded execution) для максимальної утилізації багатоядерних процесорів",
          "Експериментальний Copy-on-Write JIT компилятор для прискорення виконання байт-коду",
          "Новий REPL із підсвічуванням синтаксису, автодоповненням та зручним переглядом довідки",
          "Покращені та більш інформативні повідомлення про помилки та traceback",
        ],
      },
    ],
    blocks_en: [],
  },
  {
    id: "news-react-19",
    type: "news",
    slug: "react-19-announcement",
    title_uk: "React 19 офіційно доступний: React Server Components, оптимізуючий компілятор та хуки дій",
    title_en: "React 19 Released: Server Components, React Compiler and Action Hooks",
    description_uk: "Команда React випустила стабільну версію React 19. Тепер розробники отримують вбудовану підтримку Server Components, новий хук useActionState, автоматичну мемоізацію без useMemo/useCallback та оптимізовану роботу з формами.",
    description_en: "React 19 is officially out, delivering React Server Components, server actions, Asset Loading optimizations and the revolutionary React Compiler.",
    tags: ["React", "JavaScript", "Фронтенд", "Веб-розробка"],
    image_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop",
    image_source_url: "https://unsplash.com",
    external_url: "https://react.dev",
    likes: 312,
    share_count: 120,
    published: true,
    sort_order: 2,
    created_at: "2026-02-15T09:30:00Z",
    updated_at: "2026-02-15T09:30:00Z",
    blocks_uk: [
      {
        id: "r19-h1",
        type: "header",
        level: 2,
        text: "Що нового у React 19?",
      },
      {
        id: "r19-p1",
        type: "paragraph",
        text: "React 19 суттєво спрощує написання продуктивного коду. React Compiler автоматично оптимізує рендеринг компонентів, звільняючи розробників від необхідності ручного виклику useMemo та useCallback.",
      },
    ],
    blocks_en: [],
  },
  {
    id: "news-ai-agents-2026",
    type: "news",
    slug: "ai-agents-evolution",
    title_uk: "Нове покоління автономних агентів для розробки програмного забезпечення",
    title_en: "Next-Generation Autonomous AI Agents for Software Engineering",
    description_uk: "Провідні технологічні лабораторії демонструють вражаючий прогрес у створенні AI-асистентів, здатних самостійно запускати локальні середовища, писати багаторівневі тести, виправляти баги та деплоїти мікросервіси в хмару.",
    description_en: "Autonomous coding agents achieve breakthrough reasoning capabilities in full-stack web applications and cloud deployments.",
    tags: ["ШІ", "AI", "Автоматизація", "Тренди"],
    image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=600&fit=crop",
    image_source_url: "https://unsplash.com",
    external_url: "https://deepmind.google",
    likes: 189,
    share_count: 64,
    published: true,
    sort_order: 3,
    created_at: "2026-02-10T15:00:00Z",
    updated_at: "2026-02-10T15:00:00Z",
    blocks_uk: [],
    blocks_en: [],
  },
  {
    id: "news-vite-6",
    type: "news",
    slug: "vite-6-release",
    title_uk: "Анонсовано Vite 6: Новий Environment API для універсальної підтримки середовищ виконання",
    title_en: "Vite 6 Announced: Environment API for Universal Full-Stack Runtime Support",
    description_uk: "Vite 6 приносить революційний Environment API, що дозволяє фреймворкам налаштовувати паралельні середовища (SSR, Edge Worker, Node.js) в рамках єдиного dev-сервера з блискавичним HMR.",
    description_en: "Vite 6 introduces Environment API, bringing ultra-flexible multi-runtime support for modern full-stack frameworks.",
    tags: ["Vite", "Інструменти", "Build Tools", "Node.js"],
    image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop",
    image_source_url: "https://unsplash.com",
    external_url: "https://vitejs.dev",
    likes: 145,
    share_count: 47,
    published: true,
    sort_order: 4,
    created_at: "2026-02-05T11:00:00Z",
    updated_at: "2026-02-05T11:00:00Z",
    blocks_uk: [],
    blocks_en: [],
  },
  // ===================== RESOURCES =====================
  {
    id: "figma",
    type: "resource",
    slug: "figma",
    title_uk: "Figma",
    title_en: "Figma",
    description_uk: "Хмарний графічний редактор для створення дизайну інтерфейсів, інтерактивного прототипування та командної роботи в реальному часі.",
    description_en: "Cloud-based design tool for UI/UX interface design, rapid prototyping, and real-time team collaboration.",
    tags: ["Дизайн", "Співпраця", "UI/UX", "Прототипування"],
    image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=600&fit=crop",
    image_source_url: "https://unsplash.com",
    external_url: "https://www.figma.com",
    likes: 124,
    share_count: 42,
    published: true,
    sort_order: 1,
    created_at: "2026-01-10T10:00:00Z",
    updated_at: "2026-01-10T10:00:00Z",
    blocks_uk: [
      {
        id: "figma-h1",
        type: "header",
        level: 2,
        text: "Що таке Figma?",
      },
      {
        id: "figma-p1",
        type: "paragraph",
        text: "Figma — це провідний хмарний векторний графічний редактор, який працює безпосередньо у браузері або через десктопний застосунок. Завдяки спільній роботі в режимі реального часу, дизайнери та розробники можуть одночасно проєктувати інтерфейси, коментувати макети та тестувати прототипи.",
      },
      {
        id: "figma-h2",
        type: "header",
        level: 2,
        text: "Основні можливості",
      },
      {
        id: "figma-l1",
        type: "list",
        items: [
          "Спільне редагування кількома користувачами одночасно",
          "Потужні Auto Layouts для створення адаптивних компонентів",
          "Гнучка система стилів, змінних (Variables) та токенів дизайну",
          "Інтерактивне прототипування зі складними переходами й смарт-анімаціями",
          "Dev Mode для зручної інспекції коду CSS, iOS та Android",
          "Величезна екосистема плагінів та віджетів від спільноти Figma Community",
        ],
      },
      {
        id: "figma-h3",
        type: "header",
        level: 2,
        text: "Для кого це створено",
      },
      {
        id: "figma-p2",
        type: "paragraph",
        text: "Figma ідеально підходить для UI/UX дизайнерів, фронтенд-розробників, продакт-менеджерів та будь-яких IT-команд, що створюють цифрові продукти будь-якої складності.",
      },
    ],
    blocks_en: [
      {
        id: "figma-h1-en",
        type: "header",
        level: 2,
        text: "What is Figma?",
      },
      {
        id: "figma-p1-en",
        type: "paragraph",
        text: "Figma is the leading collaborative interface design tool. It connects everyone in the design process so teams can deliver better products, faster.",
      },
      {
        id: "figma-h2-en",
        type: "header",
        level: 2,
        text: "Key Features",
      },
      {
        id: "figma-l1-en",
        type: "list",
        items: [
          "Real-time multiplayer collaboration",
          "Responsive Auto Layouts and component variants",
          "Interactive prototyping with smart animate",
          "Dedicated Dev Mode for seamless design-to-code handoff",
        ],
      },
    ],
  },
  {
    id: "replit",
    type: "resource",
    slug: "replit",
    title_uk: "Replit",
    title_en: "Replit",
    description_uk: "Онлайн-середовище розробки (IDE) для швидкого написання, тестування й розгортання коду більш ніж 50 мовами програмування.",
    description_en: "Online IDE and deployment platform to build and ship software in 50+ programming languages directly from your browser.",
    tags: ["IDE", "Python", "Cloud", "Розробка"],
    image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop",
    image_source_url: "https://unsplash.com",
    external_url: "https://replit.com",
    likes: 89,
    share_count: 28,
    published: true,
    sort_order: 2,
    created_at: "2026-01-11T10:00:00Z",
    updated_at: "2026-01-11T10:00:00Z",
    blocks_uk: [
      {
        id: "rep-h1",
        type: "header",
        level: 2,
        text: "Про платформу Replit",
      },
      {
        id: "rep-p1",
        type: "paragraph",
        text: "Replit дозволяє розпочати програмування за лічені секунди без необхідності налаштовувати локальне середовище, встановлювати компілятори чи залежності.",
      },
      {
        id: "rep-h2",
        type: "header",
        level: 2,
        text: "Переваги",
      },
      {
        id: "rep-l1",
        type: "list",
        items: [
          "Підтримка Python, JavaScript, C++, Rust, Go та десятків інших мов",
          "Миттєвий деплой вебзастосунків та Telegram-ботів у хмару",
          "Вбудований AI-асистент Replit Ghostwriter",
          "Командна співпраця через мультиплеєрне редагування",
        ],
      },
    ],
    blocks_en: [],
  },
  {
    id: "pythontutor",
    type: "resource",
    slug: "pythontutor",
    title_uk: "Python Tutor",
    title_en: "Python Tutor",
    description_uk: "Покрокова візуалізація виконання коду, що допомагає розібратися у роботі пам'яті, посиланнях, стеку викликів і структурах даних.",
    description_en: "Step-by-step code visualization tool to understand runtime memory, references, call stacks, and data structures.",
    tags: ["Навчання", "Візуалізація", "Python", "Освіта"],
    image_url: "https://images.unsplash.com/photo-1516116211227-bbc13c7d6e4c?w=1200&h=600&fit=crop",
    image_source_url: "https://unsplash.com",
    external_url: "https://pythontutor.com",
    likes: 65,
    share_count: 19,
    published: true,
    sort_order: 3,
    created_at: "2026-01-12T10:00:00Z",
    updated_at: "2026-01-12T10:00:00Z",
    blocks_uk: [
      {
        id: "pt-h1",
        type: "header",
        level: 2,
        text: "Чому Python Tutor важливий",
      },
      {
        id: "pt-p1",
        type: "paragraph",
        text: "Один із найскладніших аспектів програмування для початківців — це уявлення того, що відбувається 'під капотом' програми. Python Tutor малює стан пам'яті на кожному кроці виконання коду.",
      },
    ],
    blocks_en: [],
  },

  // ===================== COMPONENTS =====================
  {
    id: "aiogram",
    type: "component",
    slug: "aiogram",
    title_uk: "Aiogram",
    title_en: "Aiogram",
    description_uk: "Потужний асинхронний фреймворк для створення сучасних Telegram-ботів на Python із підтримкою Telegram Bot API 7.x.",
    description_en: "Powerful asynchronous Python framework for Telegram Bot API built on top of asyncio and aiohttp.",
    tags: ["telegram", "asyncio", "python", "framework"],
    image_url: "https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=1200&h=600&fit=crop",
    image_source_url: "https://unsplash.com",
    external_url: "https://docs.aiogram.dev",
    likes: 152,
    share_count: 67,
    published: true,
    sort_order: 1,
    created_at: "2026-01-05T10:00:00Z",
    updated_at: "2026-01-05T10:00:00Z",
    blocks_uk: [
      {
        id: "aio-h1",
        type: "header",
        level: 2,
        text: "Основні можливості",
      },
      {
        id: "aio-p1",
        type: "paragraph",
        text: "Aiogram 3.x — це кардинальне переосмислення архітектури фреймворку для створення ботів. Він повністю асинхронний, використовує найсучасніші можливості Python 3.10+ та надає бездоганну типізацію.",
      },
      {
        id: "aio-l1",
        type: "list",
        items: [
          "Повна асинхронність на основі asyncio та aiohttp",
          "Вбудований механізм FSM (Finite State Machine) для покрокових діалогів",
          "Гнучка система мідлварів (Middlewares) та кастомних фільтрів",
          "Повна підтримка Webhooks та Long Polling",
          "Зручна інтеграція з базами даних (SQLAlchemy, Tortoise ORM, Redis)",
        ],
      },
      {
        id: "aio-h2",
        type: "header",
        level: 2,
        text: "Швидкий старт",
      },
      {
        id: "aio-p2",
        type: "paragraph",
        text: "Встановіть фреймворк через стандартний менеджер пакетів pip:",
      },
      {
        id: "aio-c1",
        type: "code",
        language: "bash",
        code: "pip install aiogram",
      },
      {
        id: "aio-h3",
        type: "header",
        level: 2,
        text: "Приклад простого бота",
      },
      {
        id: "aio-p3",
        type: "paragraph",
        text: "Ось мінімальний робочий приклад ехо-бота, який реагує на команду /start та відповідає на будь-які текстові повідомлення:",
      },
      {
        id: "aio-c2",
        type: "code",
        language: "python",
        code: `import asyncio
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart

TOKEN = "YOUR_BOT_TOKEN_HERE"

dp = Dispatcher()

@dp.message(CommandStart())
async def command_start_handler(message: types.Message) -> None:
    await message.answer(f"Привіт, {message.from_user.full_name}! Бот успішно працює.")

@dp.message()
async def echo_handler(message: types.Message) -> None:
    await message.send_copy(chat_id=message.chat.id)

async def main() -> None:
    bot = Bot(token=TOKEN)
    await dp.start_polling(bot)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())`,
      },
      {
        id: "aio-h4",
        type: "header",
        level: 2,
        text: "Висновки",
      },
      {
        id: "aio-p4",
        type: "paragraph",
        text: "Aiogram є стандартом де-факто для розробки високонавантажених комерційних Telegram-ботів завдяки своїй стабільності та гнучкій архітектурі.",
      },
    ],
    blocks_en: [
      {
        id: "aio-h1-en",
        type: "header",
        level: 2,
        text: "Key Features",
      },
      {
        id: "aio-p1-en",
        type: "paragraph",
        text: "Aiogram is a fully asynchronous, modern, and high-speed framework for Telegram Bot API written in Python.",
      },
      {
        id: "aio-l1-en",
        type: "list",
        items: [
          "Full async capabilities with asyncio & aiohttp",
          "Built-in Finite State Machine (FSM) support",
          "Advanced middleware and filters architecture",
          "Full Telegram Bot API coverage",
        ],
      },
      {
        id: "aio-h2-en",
        type: "header",
        level: 2,
        text: "Quick Start",
      },
      {
        id: "aio-c1-en",
        type: "code",
        language: "bash",
        code: "pip install aiogram",
      },
    ],
  },
  {
    id: "fastapi",
    type: "component",
    slug: "fastapi",
    title_uk: "FastAPI",
    title_en: "FastAPI",
    description_uk: "Сучасний, швидкий (високопродуктивний) вебфреймворк для створення API на Python із автоматичною документацією Swagger та валідацією типів.",
    description_en: "Modern, fast (high-performance) web framework for building APIs with Python 3.8+ based on standard Python type hints.",
    tags: ["web", "api", "asyncio", "python", "backend"],
    image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=600&fit=crop",
    image_source_url: "https://unsplash.com",
    external_url: "https://fastapi.tiangolo.com",
    likes: 198,
    share_count: 85,
    published: true,
    sort_order: 2,
    created_at: "2026-01-06T10:00:00Z",
    updated_at: "2026-01-06T10:00:00Z",
    blocks_uk: [
      {
        id: "fa-h1",
        type: "header",
        level: 2,
        text: "Чому обирають FastAPI",
      },
      {
        id: "fa-p1",
        type: "paragraph",
        text: "FastAPI — один із найпопулярніших бекенд-фреймворків у світі Python. Він забезпечує продуктивність на рівні NodeJS та Go завдяки Starlette та Pydantic.",
      },
      {
        id: "fa-l1",
        type: "list",
        items: [
          "Автоматична генерація інтерактивної документації Swagger UI та ReDoc",
          "Повна перевірка типів та серіалізація через Pydantic",
          "Підтримка асинхронного коду (async/await) з коробки",
          "Зручна система ін'єкції залежностей (Dependency Injection)",
        ],
      },
    ],
    blocks_en: [],
  },
  {
    id: "pydantic",
    type: "component",
    slug: "pydantic",
    title_uk: "Pydantic",
    title_en: "Pydantic",
    description_uk: "Найпопулярніша бібліотека для валідації даних, парсингу та налаштувань у Python, реалізована на Rust для максимальної швидкості.",
    description_en: "Data validation and settings management using Python type annotations with lightning-fast Rust core.",
    tags: ["typing", "validation", "data", "python"],
    image_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=600&fit=crop",
    image_source_url: "https://unsplash.com",
    external_url: "https://docs.pydantic.dev",
    likes: 110,
    share_count: 34,
    published: true,
    sort_order: 3,
    created_at: "2026-01-07T10:00:00Z",
    updated_at: "2026-01-07T10:00:00Z",
    blocks_uk: [
      {
        id: "pyd-h1",
        type: "header",
        level: 2,
        text: "Можливості Pydantic",
      },
      {
        id: "pyd-p1",
        type: "paragraph",
        text: "Pydantic перевіряє типи даних під час виконання та перетворює вхідні структури на валідні об'єкти Python.",
      },
    ],
    blocks_en: [],
  },

  // ===================== TEMPLATES =====================
  {
    id: "cli-parser",
    type: "template",
    slug: "cli-parser",
    title_uk: "CLI-парсер аргументів",
    title_en: "CLI Argument Parser",
    description_uk: "Готовий шаблон консольного застосунку на базі argparse із підтримкою підкоманд, прапорців та валідації введених параметрів.",
    description_en: "Production-ready CLI application template using argparse with subcommands and flag validation.",
    tags: ["cli", "argparse", "python", "template"],
    image_url: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200&h=600&fit=crop",
    image_source_url: "https://unsplash.com",
    external_url: null,
    likes: 45,
    share_count: 14,
    published: true,
    sort_order: 1,
    created_at: "2026-01-08T10:00:00Z",
    updated_at: "2026-01-08T10:00:00Z",
    blocks_uk: [
      {
        id: "cli-h1",
        type: "header",
        level: 2,
        text: "Використання шаблону",
      },
      {
        id: "cli-p1",
        type: "paragraph",
        text: "Скопіюйте цей код у файл main.py для швидкого старту вашої консольної утиліти:",
      },
      {
        id: "cli-c1",
        type: "code",
        language: "python",
        code: `import argparse

def main():
    parser = argparse.ArgumentParser(description="Зразок CLI утиліти")
    parser.add_argument("--name", type=str, default="Світ", help="Ім'я для привітання")
    parser.add_argument("--count", type=int, default=1, help="Кількість повторень")
    
    args = parser.parse_args()
    for _ in range(args.count):
        print(f"Привіт, {args.name}!")

if __name__ == "__main__":
    main()`,
      },
    ],
    blocks_en: [],
  },
  {
    id: "async-requests",
    type: "template",
    slug: "async-requests",
    title_uk: "Асинхронні запити (aiohttp)",
    title_en: "Async HTTP Requests (aiohttp)",
    description_uk: "Шаблон для паралельного виконання великої кількості HTTP-запитів із семафором для обмеження навантаження та обробкою помилок.",
    description_en: "Template for performing parallel HTTP requests using aiohttp with concurrency throttling and error handling.",
    tags: ["aiohttp", "asyncio", "python", "networking"],
    image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=600&fit=crop",
    image_source_url: "https://unsplash.com",
    external_url: null,
    likes: 78,
    share_count: 29,
    published: true,
    sort_order: 2,
    created_at: "2026-01-09T10:00:00Z",
    updated_at: "2026-01-09T10:00:00Z",
    blocks_uk: [
      {
        id: "ar-h1",
        type: "header",
        level: 2,
        text: "Паралельний збір даних",
      },
      {
        id: "ar-p1",
        type: "paragraph",
        text: "Приклад використання aiohttp разом із asyncio.Semaphore для запобігання перевантаженню цільового сервера.",
      },
      {
        id: "ar-c1",
        type: "code",
        language: "python",
        code: `import asyncio
import aiohttp

async def fetch_url(session: aiohttp.ClientSession, url: string, sem: asyncio.Semaphore):
    async with sem:
        async with session.get(url) as response:
            return await response.json()

async def main(urls: list[str]):
    sem = asyncio.Semaphore(10)
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_url(session, u, sem) for u in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return results`,
      },
    ],
    blocks_en: [],
  },
  {
    id: "csv-report",
    type: "template",
    slug: "csv-report",
    title_uk: "Звіт із CSV файлу",
    title_en: "CSV Report Generator",
    description_uk: "Читання CSV, фільтрація, агрегація даних та генерація підсумкового звіту з використанням стандартного модуля csv.",
    description_en: "Reading CSV files, filtering, aggregating metrics, and exporting formatted summary reports.",
    tags: ["csv", "data", "python", "automation"],
    image_url: null,
    image_source_url: null,
    external_url: null,
    likes: 52,
    share_count: 18,
    published: true,
    sort_order: 3,
    created_at: "2026-01-10T10:00:00Z",
    updated_at: "2026-01-10T10:00:00Z",
    blocks_uk: [
      {
        id: "csv-h1",
        type: "header",
        level: 2,
        text: "Генерація звітів",
      },
      {
        id: "csv-p1",
        type: "paragraph",
        text: "Автоматизуйте обробку табличних даних за лічені рядки коду.",
      },
      {
        id: "csv-c1",
        type: "code",
        language: "python",
        code: `import csv
from collections import defaultdict

def generate_report(input_file: str, output_file: str):
    totals = defaultdict(float)
    with open(input_file, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            totals[row["category"]] += float(row.get("amount", 0))

    with open(output_file, mode="w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["Категорія", "Сума"])
        for cat, total in sorted(totals.items(), key=lambda x: x[1], reverse=True):
            writer.writerow([cat, f"{total:.2f}"])`,
      },
    ],
    blocks_en: [],
  },
  {
    id: "use-debounce-hook",
    type: "template",
    slug: "use-debounce-react-hook",
    title_uk: "Кастомний хук useDebounce (React + TypeScript)",
    title_en: "Custom useDebounce React Hook",
    description_uk: "Оптимізований хук для відкладеного оновлення пошукового запиту або значень фільтрів без зайвих ререндерів.",
    description_en: "Clean TypeScript React hook for debouncing fast state updates and expensive API queries.",
    tags: ["react", "typescript", "hooks", "frontend"],
    image_url: null,
    image_source_url: null,
    external_url: null,
    likes: 128,
    share_count: 53,
    published: true,
    sort_order: 4,
    created_at: "2026-02-12T10:00:00Z",
    updated_at: "2026-02-12T10:00:00Z",
    blocks_uk: [
      {
        id: "ud-c1",
        type: "code",
        language: "typescript",
        code: `import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}`,
      },
    ],
    blocks_en: [],
  },
  // ===================== PALETTES =====================
  {
    id: "palette-linear",
    type: "palette",
    slug: "linear-app-dark",
    title_uk: "Linear — Преміальний темний мінімалізм",
    title_en: "Linear — Premium Dark Minimalism",
    description_uk: "Колірна палітра легендарного інтерфейсу Linear: глибокий графітовий фон, фокусний лавандово-індиго акцент та м'які нейтральні тони.",
    description_en: "Iconic dark mode color palette from Linear with deep obsidian background, lavender-indigo accent and clean slate neutral tones.",
    tags: ["#08090A", "#18191B", "#5E6AD2", "#8ABEB9", "#8A8F98", "#F7F8F8", "Dark Mode", "SaaS", "Minimal"],
    image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=600&fit=crop",
    image_source_url: "https://linear.app",
    external_url: "https://linear.app",
    likes: 384,
    share_count: 142,
    published: true,
    sort_order: 1,
    created_at: "2026-02-20T10:00:00Z",
    updated_at: "2026-02-20T10:00:00Z",
    blocks_uk: [
      {
        id: "lin-h1",
        type: "header",
        level: 2,
        text: "Особливості палітри Linear",
      },
      {
        id: "lin-p1",
        type: "paragraph",
        text: "Linear використовує систему супер-глибоких темних фонів із ледь помітним синім підтоном, що створює відчуття преміальності та знижує навантаження на зір.",
      },
      {
        id: "lin-l1",
        type: "list",
        items: [
          "Основний фон #08090A — надглибокий чорний з 2% синього відтінку",
          "Картки та панелі #18191B — контрастна підкладка для блоків",
          "Головний бренд-акцент #5E6AD2 — динамічний лавандовий індиго",
          "М'ятний саб-акцент #8ABEB9 — акцентування статусів і бейджів",
          "Текстові кольори #F7F8F8 та #8A8F98 — збалансований контраст за шкалою WCAG AAA",
        ],
      },
    ],
    blocks_en: [],
  },
  {
    id: "palette-raycast",
    type: "palette",
    slug: "raycast-twilight",
    title_uk: "Raycast — Неонова енергія та глибокий космос",
    title_en: "Raycast — Neon Energy and Deep Space",
    description_uk: "Свіжа та динамічна палітра популярного лаунчера Raycast: космічний антрацит, яскравий рубіновий спалах та м'ятно-пастельні свічення.",
    description_en: "Dynamic and vibrant color palette of Raycast: deep space charcoal, energetic ruby accents, and soft mint highlights.",
    tags: ["#0E1015", "#FF6363", "#8ABEB9", "#F5A623", "#272A30", "#F4F5F6", "Productivity", "macOS", "Developer"],
    image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=600&fit=crop",
    image_source_url: "https://raycast.com",
    external_url: "https://raycast.com",
    likes: 295,
    share_count: 98,
    published: true,
    sort_order: 2,
    created_at: "2026-02-19T14:00:00Z",
    updated_at: "2026-02-19T14:00:00Z",
    blocks_uk: [
      {
        id: "ray-h1",
        type: "header",
        level: 2,
        text: "Філософія кольору Raycast",
      },
      {
        id: "ray-p1",
        type: "paragraph",
        text: "Поєднання темного бекграунду #0E1015 з яскравим акцентним червоним #FF6363 та спокійним м'ятним #8ABEB9 створює ультрасучасний вигляд інструменту нового покоління.",
      },
    ],
    blocks_en: [],
  },
  {
    id: "palette-supabase",
    type: "palette",
    slug: "supabase-emerald",
    title_uk: "Supabase — Смарагдовий технологічний градієнт",
    title_en: "Supabase — Emerald Tech Gradient",
    description_uk: "Впізнаваний стиль платформи баз даних Supabase: глибокі нейтрали, фірмовий смарагдово-зелений та освіжаючий світлий шавлій.",
    description_en: "The signature aesthetic of Supabase: sleek dark neutrals, vivid emerald green, and calm sage highlights.",
    tags: ["#171717", "#242424", "#3ECF8E", "#8ABEB9", "#709775", "#EDEDED", "OpenSource", "Database", "Emerald"],
    image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=600&fit=crop",
    image_source_url: "https://supabase.com",
    external_url: "https://supabase.com",
    likes: 340,
    share_count: 115,
    published: true,
    sort_order: 3,
    created_at: "2026-02-17T08:00:00Z",
    updated_at: "2026-02-17T08:00:00Z",
    blocks_uk: [
      {
        id: "sup-h1",
        type: "header",
        level: 2,
        text: "Застосування в розробці",
      },
      {
        id: "sup-p1",
        type: "paragraph",
        text: "Ідеальний вибір для дешбордів, адмін-панелей та інструментів розробника. Смарагдовий акцент #3ECF8E сигналізує про стабільність та високу швидкість.",
      },
    ],
    blocks_en: [],
  },
  {
    id: "palette-stripe",
    type: "palette",
    slug: "stripe-prism",
    title_uk: "Stripe — Неонова призма та індиго",
    title_en: "Stripe — Neon Prism and Indigo",
    description_uk: "Еталонна палітра фінансово-технічного гіганта Stripe: насичений індиго-синій, електричний фіолетовий, морський ціан та сонячний корал.",
    description_en: "World-class color palette from Stripe featuring deep navy indigo, electric purple, sea cyan, and warm coral accents.",
    tags: ["#0A2540", "#635BFF", "#00D4B2", "#8ABEB9", "#FF6B6B", "#425466", "Fintech", "Design", "Gradient"],
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop",
    image_source_url: "https://stripe.com",
    external_url: "https://stripe.com",
    likes: 410,
    share_count: 180,
    published: true,
    sort_order: 4,
    created_at: "2026-02-16T12:00:00Z",
    updated_at: "2026-02-16T12:00:00Z",
    blocks_uk: [
      {
        id: "str-h1",
        type: "header",
        level: 2,
        text: "Багатошарова гармонія",
      },
      {
        id: "str-p1",
        type: "paragraph",
        text: "Поєднання фіолетового #635BFF та бірюзового ціану #00D4B2 створює фірмовий райдужний градієнт, який став стандартом для сучасного фінтеху.",
      },
    ],
    blocks_en: [],
  },
  // ===================== DICTIONARY =====================
  {
    id: "dict-idempotency",
    type: "dictionary",
    slug: "idempotency",
    title_uk: "Ідемпотентність (Idempotency)",
    title_en: "Idempotency",
    description_uk: "Властивість операції, повторне виконання якої з тими самими вхідними даними не змінює кінцевий стан системи та повертає ідентичний результат (наприклад, HTTP GET, PUT, DELETE).",
    description_en: "A property of an operation whereby performing it multiple times with the same input yields the same result and leaves the system in the exact same state.",
    tags: ["REST", "API", "Архітектура", "HTTP"],
    image_url: null,
    image_source_url: null,
    external_url: null,
    likes: 194,
    share_count: 52,
    published: true,
    sort_order: 1,
    created_at: "2026-02-20T10:00:00Z",
    updated_at: "2026-02-20T10:00:00Z",
    blocks_uk: [
      {
        id: "idem-h1",
        type: "header",
        level: 2,
        text: "Що таке ідемпотентність у веб-розробці?",
      },
      {
        id: "idem-p1",
        type: "paragraph",
        text: "В архітектурі розподілених систем та REST API ідемпотентність гарантує надійність при повторній відправці запитів (retries) у разі тимчасових мережевих збоїв, запобігаючи дублюванню платежів чи записів.",
      },
    ],
    blocks_en: [],
  },
  {
    id: "dict-cap-theorem",
    type: "dictionary",
    slug: "cap-theorem",
    title_uk: "CAP-теорема (Брюера)",
    title_en: "CAP Theorem",
    description_uk: "Фундаментальний принцип розподілених систем, згідно з яким система може одночасно гарантувати лише 2 з 3 властивостей: узгодженість (Consistency), доступність (Availability) та стійкість до розділення (Partition Tolerance).",
    description_en: "A theorem in distributed computer systems stating that any distributed data store can only simultaneously provide at most two out of three guarantees: Consistency, Availability, and Partition Tolerance.",
    tags: ["Databases", "Distributed Systems", "Computer Science"],
    image_url: null,
    image_source_url: null,
    external_url: null,
    likes: 312,
    share_count: 88,
    published: true,
    sort_order: 2,
    created_at: "2026-02-21T11:00:00Z",
    updated_at: "2026-02-21T11:00:00Z",
    blocks_uk: [
      {
        id: "cap-h1",
        type: "header",
        level: 2,
        text: "Три стовпи CAP-теореми",
      },
      {
        id: "cap-l1",
        type: "list",
        items: [
          "Consistency (Узгодженість) — кожен запит на читання отримує найсвіжіший запис або помилку",
          "Availability (Доступність) — кожен робочий вузол повертає успішну відповідь без помилок",
          "Partition Tolerance (Стійкість до розділення) — система продовжує працювати при втраті зв'язку між вузлами",
        ],
      },
    ],
    blocks_en: [],
  },
  {
    id: "dict-cqrs",
    type: "dictionary",
    slug: "cqrs-pattern",
    title_uk: "CQRS (Command Query Responsibility Segregation)",
    title_en: "Command Query Responsibility Segregation (CQRS)",
    description_uk: "Архітектурний патерн, що розділяє моделі читання (Queries) та модифікації (Commands) даних, оптимізуючи продуктивність, масштабованість та безпеку високо flip-навантажених сервісів.",
    description_en: "An architectural pattern that separates read and update operations for a data store, enabling isolated scaling and optimization of reads versus writes.",
    tags: ["CQRS", "Архітектура", "Event Sourcing", "Microservices"],
    image_url: null,
    image_source_url: null,
    external_url: null,
    likes: 178,
    share_count: 41,
    published: true,
    sort_order: 3,
    created_at: "2026-02-22T09:30:00Z",
    updated_at: "2026-02-22T09:30:00Z",
    blocks_uk: [
      {
        id: "cqrs-h1",
        type: "header",
        level: 2,
        text: "Переваги відокремлення запитів від команд",
      },
      {
        id: "cqrs-p1",
        type: "paragraph",
        text: "CQRS дозволяє використовувати різні схеми даних та навіть різні СУБД для читання (наприклад, Elasticsearch чи Redis) та запису (PostgreSQL, Cassandra).",
      },
    ],
    blocks_en: [],
  },
  {
    id: "dict-solid",
    type: "dictionary",
    slug: "solid-principles",
    title_uk: "Принципи SOLID",
    title_en: "SOLID Principles",
    description_uk: "Акронім 5 базових принципів об'єктно-орієнтованого проєктування та програмування: Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation та Dependency Inversion.",
    description_en: "A mnemonic acronym for five design principles intended to make software designs more understandable, flexible, and maintainable.",
    tags: ["SOLID", "OOP", "Clean Architecture", "Патерни"],
    image_url: null,
    image_source_url: null,
    external_url: null,
    likes: 425,
    share_count: 120,
    published: true,
    sort_order: 4,
    created_at: "2026-02-23T14:15:00Z",
    updated_at: "2026-02-23T14:15:00Z",
    blocks_uk: [
      {
        id: "solid-h1",
        type: "header",
        level: 2,
        text: "Розшифровка принципів SOLID",
      },
      {
        id: "solid-l1",
        type: "list",
        items: [
          "S — Single Responsibility Principle (Принцип єдиної відповідальності)",
          "O — Open/Closed Principle (Принцип відкритості/закритості)",
          "L — Liskov Substitution Principle (Принцип підстановки Лісков)",
          "I — Interface Segregation Principle (Принцип розділення інтерфейсу)",
          "D — Dependency Inversion Principle (Принцип інверсії залежностей)",
        ],
      },
    ],
    blocks_en: [],
  },
  // ===================== DESIGN SHOWCASE =====================
  {
    id: "design-aurora-glow-card",
    type: "design",
    slug: "aurora-glow-gradient-card",
    title_uk: "Aurora Glow: Багатошаровий Аврора-Градієнт",
    title_en: "Aurora Glow: Multi-layer Aurora Mesh Gradient",
    description_uk: "Органічний плавний аврора-градієнт із глибоким відтінком #1E212D, пастельним неоновим спалахом #FFBCBC та м'яким розмиттям світлових сфер.",
    description_en: "Organic fluid aurora mesh gradient combining deep slate #1E212D base with pastel neon peach #FFBCBC highlights and multi-layer radial glow.",
    tags: ["Gradient", "Aurora", "Glow", "Mesh", "CSS3"],
    image_url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=600&fit=crop",
    image_source_url: null,
    external_url: null,
    likes: 384,
    share_count: 92,
    published: true,
    sort_order: 1,
    created_at: "2026-02-24T10:00:00Z",
    updated_at: "2026-02-24T10:00:00Z",
    blocks_uk: [
      {
        id: "d1-prompt",
        type: "paragraph",
        text: "Design a luxury dark OLED/slate UI card featuring a luminous aurora mesh gradient background. Combine deep navy #1E212D with radiant peach-pink #FFBCBC highlights, subtle violet depth #8B5CF6, 40px backdrop blur, and crisp 1px border glow for high-end SaaS hero visual modules.",
      },
      {
        id: "d1-html",
        type: "code",
        language: "html",
        code: `<div class="aurora-card">
  <div class="aurora-glow aurora-glow-1"></div>
  <div class="aurora-glow aurora-glow-2"></div>
  <div class="aurora-content">
    <span class="badge">AURORA MESH</span>
    <h3>Luminous Atmosphere</h3>
    <p>Atmospheric multi-stop organic gradient with hardware-accelerated blur.</p>
  </div>
</div>`,
      },
      {
        id: "d1-css",
        type: "code",
        language: "css",
        code: `.aurora-card {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  background: #1E212D;
  border: 1px solid rgba(255, 188, 188, 0.25);
  padding: 32px;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.6);
}

.aurora-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(50px);
  pointer-events: none;
  opacity: 0.65;
  transition: transform 0.5s ease;
}

.aurora-glow-1 {
  width: 220px;
  height: 220px;
  top: -40px;
  right: -30px;
  background: radial-gradient(circle, #FFBCBC 0%, rgba(255, 188, 188, 0) 70%);
}

.aurora-glow-2 {
  width: 180px;
  height: 180px;
  bottom: -30px;
  left: 20px;
  background: radial-gradient(circle, #8B5CF6 0%, rgba(139, 92, 246, 0) 70%);
}`,
      },
      {
        id: "d1-scss",
        type: "code",
        language: "scss",
        code: `$bg-slate: #1E212D;
$accent-pink: #FFBCBC;
$accent-purple: #8B5CF6;

.aurora-card {
  position: relative;
  overflow: hidden;
  border-radius: 1.25rem;
  background: $bg-slate;
  border: 1px solid rgba($accent-pink, 0.25);
  padding: 2rem;

  .aurora-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(50px);
    pointer-events: none;

    &-1 {
      width: 220px;
      height: 220px;
      top: -40px;
      right: -30px;
      background: radial-gradient(circle, $accent-pink 0%, transparent 70%);
    }

    &-2 {
      width: 180px;
      height: 180px;
      bottom: -30px;
      left: 20px;
      background: radial-gradient(circle, $accent-purple 0%, transparent 70%);
    }
  }
}`,
      },
      {
        id: "d1-tailwind",
        type: "code",
        language: "tailwind",
        code: `<div className="relative overflow-hidden rounded-2xl bg-[#1E212D] p-8 border border-[#FFBCBC]/25 shadow-2xl">
  <div className="absolute -top-10 -right-8 w-56 h-56 rounded-full bg-[#FFBCBC]/40 blur-3xl pointer-events-none" />
  <div className="absolute -bottom-8 left-5 w-44 h-44 rounded-full bg-violet-600/35 blur-3xl pointer-events-none" />
  <div className="relative z-10 space-y-3">
    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-[#1E212D] bg-[#FFBCBC]">
      AURORA MESH
    </span>
    <h3 className="text-xl font-bold text-white">Luminous Atmosphere</h3>
    <p className="text-sm text-slate-300">Atmospheric multi-stop organic gradient with hardware-accelerated blur.</p>
  </div>
</div>`,
      },
    ],
    blocks_en: [],
  },
  {
    id: "design-frosted-glass-card",
    type: "design",
    slug: "frosted-glassmorphism-card",
    title_uk: "Frosted Glass: Матова Картка з Неоновим Контуром",
    title_en: "Frosted Glass: Glassmorphic Card with Neon Rim",
    description_uk: "Преміальний ефект матового скла з 20px backdrop-filter, градієнтним 1px кантом та інтерактивним відблиском при наведенні.",
    description_en: "High-end frosted glassmorphism card featuring 20px backdrop blur, refined 1px gradient rim, and responsive interactive reflection on hover.",
    tags: ["Glassmorphism", "Card", "UI", "BackdropFilter", "Modern"],
    image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=600&fit=crop",
    image_source_url: null,
    external_url: null,
    likes: 412,
    share_count: 115,
    published: true,
    sort_order: 2,
    created_at: "2026-02-24T11:00:00Z",
    updated_at: "2026-02-24T11:00:00Z",
    blocks_uk: [
      {
        id: "d2-prompt",
        type: "paragraph",
        text: "Create a modern dark frosted glass card component with 24px backdrop blur, 1px gradient border (#FFBCBC fading to transparent), ultra-fine inner shadow, and an interactive micro-tilt cursor highlight.",
      },
      {
        id: "d2-html",
        type: "code",
        language: "html",
        code: `<div class="glass-card">
  <div class="glass-header">
    <span class="glass-chip">PRO DESIGN</span>
    <button class="glass-action">↗</button>
  </div>
  <h4 class="glass-title">Frosted Glass Surface</h4>
  <p class="glass-desc">Ultra-clean refractive glass container for modern dashboards.</p>
</div>`,
      },
      {
        id: "d2-css",
        type: "code",
        language: "css",
        code: `.glass-card {
  background: rgba(30, 33, 45, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 188, 188, 0.3);
  border-radius: 18px;
  padding: 28px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4),
              inset 0 1px 1px rgba(255, 255, 255, 0.15);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.glass-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 188, 188, 0.6);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5),
              0 0 24px rgba(255, 188, 188, 0.2);
}`,
      },
      {
        id: "d2-scss",
        type: "code",
        language: "scss",
        code: `$glass-bg: rgba(30, 33, 45, 0.65);
$accent-peach: #FFBCBC;

.glass-card {
  background: $glass-bg;
  backdrop-filter: blur(20px);
  border: 1px solid rgba($accent-peach, 0.3);
  border-radius: 1.125rem;
  padding: 1.75rem;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(#fff, 0.15);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba($accent-peach, 0.6);
  }
}`,
      },
      {
        id: "d2-tailwind",
        type: "code",
        language: "tailwind",
        code: `<div className="rounded-2xl bg-[#1E212D]/70 backdrop-blur-xl p-7 border border-[#FFBCBC]/30 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[#FFBCBC]/60 hover:shadow-[#FFBCBC]/10">
  <div className="flex items-center justify-between mb-4">
    <span className="px-3 py-0.5 rounded-full text-xs font-medium text-[#FFBCBC] bg-[#FFBCBC]/10 border border-[#FFBCBC]/20">
      PRO DESIGN
    </span>
    <span className="text-[#FFBCBC] font-mono text-sm">↗</span>
  </div>
  <h4 className="text-lg font-bold text-white mb-1">Frosted Glass Surface</h4>
  <p className="text-sm text-slate-300">Ultra-clean refractive glass container for modern dashboards.</p>
</div>`,
      },
    ],
    blocks_en: [],
  },
  {
    id: "design-cyber-neon-button",
    type: "design",
    slug: "cyber-neon-glow-button",
    title_uk: "Cyber Neon: Кнопка з Контурним Сяйвом",
    title_en: "Cyber Neon: Button with Dynamic Border Glow",
    description_uk: "Інтерактивна кнопка нового покоління з анімованим конічним градієнтом, пружним тактильним натисканням та розсіяним неоновим ореолом.",
    description_en: "Next-gen interactive button component with animated conic border gradient, spring-based click physics, and diffuse neon halo.",
    tags: ["Button", "Neon", "Animation", "Interactive", "MicroInteractions"],
    image_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=600&fit=crop",
    image_source_url: null,
    external_url: null,
    likes: 516,
    share_count: 148,
    published: true,
    sort_order: 3,
    created_at: "2026-02-24T12:00:00Z",
    updated_at: "2026-02-24T12:00:00Z",
    blocks_uk: [
      {
        id: "d3-prompt",
        type: "paragraph",
        text: "Interactive cyberpunk neon button with rotating conic-gradient border (#FFBCBC, #8B5CF6, #FFBCBC), spring active press state, soft ambient glow, and crisp high-contrast center label.",
      },
      {
        id: "d3-html",
        type: "code",
        language: "html",
        code: `<button class="cyber-neon-btn">
  <span class="cyber-neon-border"></span>
  <span class="cyber-neon-content">
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
    Запустити Інновацію
  </span>
</button>`,
      },
      {
        id: "d3-css",
        type: "code",
        language: "css",
        code: `.cyber-neon-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 9999px;
  background: transparent;
  border: none;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cyber-neon-btn:hover {
  transform: scale(1.04);
  box-shadow: 0 0 30px rgba(255, 188, 188, 0.4);
}

.cyber-neon-btn:active {
  transform: scale(0.96);
}

.cyber-neon-border {
  position: absolute;
  inset: -200%;
  background: conic-gradient(from 0deg, #FFBCBC, #8B5CF6, #FFBCBC);
  animation: spin 3.5s linear infinite;
}

.cyber-neon-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 9999px;
  background: #1E212D;
  color: #FFBCBC;
  font-weight: 600;
  font-size: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}`,
      },
      {
        id: "d3-scss",
        type: "code",
        language: "scss",
        code: `$accent-pink: #FFBCBC;
$accent-violet: #8B5CF6;
$bg-dark: #1E212D;

.cyber-neon-btn {
  position: relative;
  padding: 2px;
  border-radius: 9999px;
  cursor: pointer;

  .cyber-neon-border {
    position: absolute;
    inset: -200%;
    background: conic-gradient(from 0deg, $accent-pink, $accent-violet, $accent-pink);
    animation: spin 3.5s linear infinite;
  }

  .cyber-neon-content {
    position: relative;
    padding: 12px 28px;
    border-radius: 9999px;
    background: $bg-dark;
    color: $accent-pink;
  }
}`,
      },
      {
        id: "d3-tailwind",
        type: "code",
        language: "tailwind",
        code: `<button className="group relative inline-flex items-center justify-center p-[2px] rounded-full overflow-hidden transition-transform duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-[#FFBCBC]/30">
  <div className="absolute -inset-[200%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,#FFBCBC,#8B5CF6,#FFBCBC)]" />
  <span className="relative flex items-center gap-2 px-7 py-3 rounded-full bg-[#1E212D] text-[#FFBCBC] font-semibold text-sm transition-colors group-hover:bg-[#252937]">
    <span className="w-2 h-2 rounded-full bg-[#FFBCBC] animate-pulse" />
    Запустити Інновацію
  </span>
</button>`,
      },
    ],
    blocks_en: [],
  },
  {
    id: "design-sunset-gradient-sphere",
    type: "design",
    slug: "sunset-peach-gradient-sphere",
    title_uk: "Sunset Orb: Об'ємна 3D Градієнтна Сфера",
    title_en: "Sunset Orb: Volumetric 3D Gradient Sphere",
    description_uk: "Ефектна 3D сфера з градієнтним підсвічуванням по краях, внутрішнім моделюванням тіней та ефектом левітації.",
    description_en: "Volumetric 3D gradient sphere featuring realistic rim lighting in peach #FFBCBC, deep diffuse shadow falloff, and smooth levitation effect.",
    tags: ["3D", "Gradient", "Sphere", "Orb", "VisualArt"],
    image_url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&h=600&fit=crop",
    image_source_url: null,
    external_url: null,
    likes: 295,
    share_count: 67,
    published: true,
    sort_order: 4,
    created_at: "2026-02-24T13:00:00Z",
    updated_at: "2026-02-24T13:00:00Z",
    blocks_uk: [
      {
        id: "d4-prompt",
        type: "paragraph",
        text: "Volumetric 3D gradient orb with realistic peach-rose #FFBCBC rim illumination, deep slate occlusion #1E212D, floating levitation physics, and soft atmospheric ground reflection.",
      },
      {
        id: "d4-html",
        type: "code",
        language: "html",
        code: `<div class="sphere-stage">
  <div class="gradient-sphere"></div>
  <div class="sphere-shadow"></div>
</div>`,
      },
      {
        id: "d4-css",
        type: "code",
        language: "css",
        code: `.sphere-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 220px;
}

.gradient-sphere {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #FFF0F0 0%, #FFBCBC 35%, #9E4770 70%, #1E212D 100%);
  box-shadow: 0 10px 30px rgba(255, 188, 188, 0.3),
              inset -12px -12px 25px rgba(0, 0, 0, 0.7),
              inset 8px 8px 15px rgba(255, 255, 255, 0.4);
  animation: levitate 4s ease-in-out infinite alternate;
}

.sphere-shadow {
  width: 90px;
  height: 14px;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.5) 0%, transparent 75%);
  border-radius: 50%;
  margin-top: 20px;
  animation: shadowPulse 4s ease-in-out infinite alternate;
}

@keyframes levitate {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-16px); }
}

@keyframes shadowPulse {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(0.75); opacity: 0.25; }
}`,
      },
      {
        id: "d4-scss",
        type: "code",
        language: "scss",
        code: `$color-light: #FFF0F0;
$color-peach: #FFBCBC;
$color-magenta: #9E4770;
$color-base: #1E212D;

.sphere-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .gradient-sphere {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, $color-light 0%, $color-peach 35%, $color-magenta 70%, $color-base 100%);
    box-shadow: 0 10px 30px rgba($color-peach, 0.3);
    animation: levitate 4s ease-in-out infinite alternate;
  }
}`,
      },
      {
        id: "d4-tailwind",
        type: "code",
        language: "tailwind",
        code: `<div className="flex flex-col items-center justify-center p-6">
  <div className="w-32 h-32 rounded-full bg-[radial-gradient(circle_at_35%_30%,#FFF0F0_0%,#FFBCBC_35%,#9E4770_70%,#1E212D_100%)] shadow-2xl shadow-[#FFBCBC]/20 animate-bounce duration-1000" />
  <div className="w-24 h-3 rounded-full bg-black/40 blur-sm mt-4" />
</div>`,
      },
    ],
    blocks_en: [],
  },
  {
    id: "design-bento-stat-card",
    type: "design",
    slug: "bento-grid-stat-widget",
    title_uk: "Bento Stat: Модульна Картка Метрики",
    title_en: "Bento Stat: Modular Analytics Tile",
    description_uk: "Компактний віджет Bento-сітки з динамічним індикатором прогресу, пульсуючим бейджем та неоновим спарклайном.",
    description_en: "Compact Bento grid widget featuring dynamic progress metrics, pulsating status badge, and glowing sparkline graph.",
    tags: ["Bento", "Widget", "Dashboard", "Analytics", "Tailwind"],
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop",
    image_source_url: null,
    external_url: null,
    likes: 340,
    share_count: 88,
    published: true,
    sort_order: 5,
    created_at: "2026-02-24T14:00:00Z",
    updated_at: "2026-02-24T14:00:00Z",
    blocks_uk: [
      {
        id: "d5-prompt",
        type: "paragraph",
        text: "Clean minimalist dark bento-grid tile layout with rounded-2xl geometry, subtle border #3A3F53, live trend pill (+24.8%), glowing peach #FFBCBC accent metric display, and CSS-based sparkline.",
      },
      {
        id: "d5-html",
        type: "code",
        language: "html",
        code: `<div class="bento-tile">
  <div class="bento-top">
    <span class="bento-label">Active Deployments</span>
    <span class="bento-badge">+24.8%</span>
  </div>
  <div class="bento-value">1,482<span class="unit">pods</span></div>
  <div class="bento-bar">
    <div class="bento-progress" style="width: 78%;"></div>
  </div>
</div>`,
      },
      {
        id: "d5-css",
        type: "code",
        language: "css",
        code: `.bento-tile {
  background: #242836;
  border: 1px solid #3A3F53;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  transition: border-color 0.25s ease;
}

.bento-tile:hover {
  border-color: #FFBCBC;
}

.bento-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.bento-label {
  font-size: 13px;
  color: #A8ADC0;
  font-weight: 500;
}

.bento-badge {
  font-size: 11px;
  font-weight: 700;
  color: #FFBCBC;
  background: rgba(255, 188, 188, 0.12);
  padding: 3px 8px;
  border-radius: 999px;
}

.bento-value {
  font-size: 32px;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: -0.02em;
}

.bento-value .unit {
  font-size: 14px;
  color: #FFBCBC;
  margin-left: 6px;
  font-weight: 500;
}

.bento-bar {
  height: 6px;
  background: #313647;
  border-radius: 999px;
  margin-top: 16px;
  overflow: hidden;
}

.bento-progress {
  height: 100%;
  background: linear-gradient(90deg, #8B5CF6, #FFBCBC);
  border-radius: 999px;
}`,
      },
      {
        id: "d5-scss",
        type: "code",
        language: "scss",
        code: `$bg-card: #242836;
$border: #3A3F53;
$accent: #FFBCBC;

.bento-tile {
  background: $bg-card;
  border: 1px solid $border;
  border-radius: 1rem;
  padding: 1.5rem;

  &:hover {
    border-color: $accent;
  }

  .bento-badge {
    color: $accent;
    background: rgba($accent, 0.12);
  }
}`,
      },
      {
        id: "d5-tailwind",
        type: "code",
        language: "tailwind",
        code: `<div className="rounded-2xl bg-[#242836] border border-[#3A3F53] p-6 hover:border-[#FFBCBC] transition-colors shadow-lg">
  <div className="flex items-center justify-between mb-3">
    <span className="text-xs font-medium text-[#A8ADC0]">Active Deployments</span>
    <span className="text-[11px] font-bold text-[#FFBCBC] bg-[#FFBCBC]/10 px-2 py-0.5 rounded-full">+24.8%</span>
  </div>
  <div className="text-3xl font-extrabold text-white tracking-tight">
    1,482 <span className="text-sm font-medium text-[#FFBCBC]">pods</span>
  </div>
  <div className="w-full h-1.5 bg-[#313647] rounded-full mt-4 overflow-hidden">
    <div className="h-full bg-gradient-to-r from-violet-500 to-[#FFBCBC] rounded-full w-[78%]" />
  </div>
</div>`,
      },
    ],
    blocks_en: [],
  },
  {
    id: "design-interactive-toggle-pill",
    type: "design",
    slug: "fluid-segmented-toggle-pill",
    title_uk: "Toggle Pill: Плавний Сегментний Перемикач",
    title_en: "Toggle Pill: Fluid Segmented Switch",
    description_uk: "Елегантний перемикач із пружинною анімацією активної каретки, глянцевою текстурою та світлодіодним статусом.",
    description_en: "Refined segmented pill switch with physics-based sliding thumb, subtle depth gloss, and LED glowing indicator.",
    tags: ["Toggle", "Pill", "Switch", "Interaction", "CSSAnimation"],
    image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=600&fit=crop",
    image_source_url: null,
    external_url: null,
    likes: 310,
    share_count: 74,
    published: true,
    sort_order: 6,
    created_at: "2026-02-24T15:00:00Z",
    updated_at: "2026-02-24T15:00:00Z",
    blocks_uk: [
      {
        id: "d6-prompt",
        type: "paragraph",
        text: "Segmented interactive toggle pill with spring sliding transition, dark slate container #1E212D, high-contrast active peach #FFBCBC thumb, and subtle tactile inner shadow.",
      },
      {
        id: "d6-html",
        type: "code",
        language: "html",
        code: `<div class="pill-switch">
  <button class="pill-option active">Дизайн</button>
  <button class="pill-option">Код</button>
  <button class="pill-option">Стилі</button>
</div>`,
      },
      {
        id: "d6-css",
        type: "code",
        language: "css",
        code: `.pill-switch {
  display: inline-flex;
  background: #1E212D;
  border: 1px solid #3A3F53;
  padding: 4px;
  border-radius: 999px;
  gap: 4px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
}

.pill-option {
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: #A8ADC0;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.pill-option.active {
  background: #FFBCBC;
  color: #1E212D;
  box-shadow: 0 4px 12px rgba(255, 188, 188, 0.35);
}

.pill-option:hover:not(.active) {
  color: #FFFFFF;
}`,
      },
      {
        id: "d6-scss",
        type: "code",
        language: "scss",
        code: `$bg: #1E212D;
$border: #3A3F53;
$accent: #FFBCBC;

.pill-switch {
  display: inline-flex;
  background: $bg;
  border: 1px solid $border;
  padding: 4px;
  border-radius: 999px;

  .pill-option {
    padding: 8px 18px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    color: #A8ADC0;

    &.active {
      background: $accent;
      color: $bg;
    }
  }
}`,
      },
      {
        id: "d6-tailwind",
        type: "code",
        language: "tailwind",
        code: `<div className="inline-flex bg-[#1E212D] border border-[#3A3F53] p-1 rounded-full gap-1 shadow-inner">
  <button className="px-5 py-2 rounded-full text-xs font-semibold bg-[#FFBCBC] text-[#1E212D] shadow-md shadow-[#FFBCBC]/20">
    Дизайн
  </button>
  <button className="px-5 py-2 rounded-full text-xs font-semibold text-[#A8ADC0] hover:text-white transition-colors">
    Код
  </button>
  <button className="px-5 py-2 rounded-full text-xs font-semibold text-[#A8ADC0] hover:text-white transition-colors">
    Стилі
  </button>
</div>`,
      },
    ],
    blocks_en: [],
  },

  // ===================== RESEARCH (ДОСЛІДЖЕННЯ) =====================
  {
    id: "res-llm-benchmark-2026",
    type: "research",
    slug: "llm-inference-benchmarks-2026",
    title_uk: "Бенчмарк LLM 2026: Порівняння затримки TTFT, швидкості генерації токенів та витрат VRAM",
    title_en: "LLM Inference Benchmark 2026: TTFT Latency, Generation Throughput & VRAM Analysis",
    description_uk: "Глибоке емпіричне дослідження сучасних відкритих і закритих мовних моделей: аналіз затримки першого токену (TTFT), пропускної здатності на vLLM / TensorRT-LLM та ефективності квантування FP8 проти INT4.",
    description_en: "Deep empirical analysis of modern open & closed language models: Time-to-First-Token (TTFT), throughput on vLLM and TensorRT-LLM, and FP8 vs INT4 quantization benchmarks.",
    tags: ["LLM", "Бенчмарк", "AI", "VRAM", "Інференс"],
    image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop",
    image_source_url: "https://unsplash.com",
    external_url: "https://arxiv.org",
    sources: [
      { title: "arXiv: High-Throughput LLM Serving Systems", url: "https://arxiv.org/abs/2309.06180" },
      { title: "vLLM Official Documentation & Benchmarks", url: "https://docs.vllm.ai" },
      { title: "NVIDIA TensorRT-LLM Performance Guide", url: "https://github.com/NVIDIA/TensorRT-LLM" },
    ],
    likes: 312,
    share_count: 140,
    published: true,
    sort_order: 1,
    created_at: "2026-02-25T10:00:00Z",
    updated_at: "2026-02-25T10:00:00Z",
    blocks_uk: [
      {
        id: "res1-h1",
        type: "header",
        level: 2,
        text: "Методологія та конфігурація тестового стенду",
      },
      {
        id: "res1-p1",
        type: "paragraph",
        text: "Для дослідження продуктивності інференсу ми розгорнули кластер на базі 8x NVIDIA H100 SXM5 з пропускною здатністю 3.35 TB/s. Було протестовано 12 конфігурацій із розміром контексту від 4K до 128K токенів при паралельних запитах від 1 до 256 користувачів.",
      },
      {
        id: "res1-img1",
        type: "image",
        image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop",
        caption: "Рис. 1: Графік залежності затримки TTFT (мс) від довжини вхідного промпту (4K–128K токенів)",
        alt: "Графік продуктивності TTFT для LLM моделей",
      },
      {
        id: "res1-h2",
        type: "header",
        level: 2,
        text: "Ключові результати та інсайти",
      },
      {
        id: "res1-list1",
        type: "list",
        items: [
          "vLLM з підтримкою FlashInfer демонструє приріст пропускної здатності на 38% порівняно з базовою реалізацією",
          "Квантування FP8 зберігає 99.4% точності на бенчмарку MMLU при зниженні споживання пам'яті на 48%",
          "PagedAttention зменшує фрагментацію пам'яті KV-кешу майже до 0%, уможливлюючи батчинг розміром 128 при 32K контексту",
          "Для агентських сценаріїв із багатьма tool calls затримка Speculative Decoding скорочує загальний час відповіді на 42%",
        ],
      },
      {
        id: "res1-callout1",
        type: "callout",
        text: "Висновок: Для виробничих середовищ оптимізація KV-кешу через FP8 та Speculative Decoding забезпечує 2.4x зниження витрат на хмарну інфраструктуру без відчутної втрати якості генерації.",
      },
      {
        id: "res1-code1",
        type: "code",
        language: "python",
        code: `# Конфігурація високопродуктивного інференсу vLLM
from vllm import LLM, SamplingParams

engine = LLM(
    model="mistralai/Mistral-7B-Instruct-v0.3",
    kv_cache_dtype="fp8",
    max_model_len=32768,
    gpu_memory_utilization=0.92,
    enable_prefix_caching=True,
    tensor_parallel_size=2
)`,
      },
    ],
    blocks_en: [],
  },
  {
    id: "res-web-frameworks-perf",
    type: "research",
    slug: "web-frameworks-100k-rps-study",
    title_uk: "Велике дослідження веб-фреймворків: FastAPI vs Next.js vs Go Gin при навантаженні 100,000 RPS",
    title_en: "Web Frameworks Stress Test: FastAPI vs Next.js vs Go Gin at 100,000 RPS",
    description_uk: "Стрес-тестування сучасних стеків розробки: затримка p99, споживання оперативної пам'яті, деградація з'єднань під високим навантаженням та оптимізація мережевого I/O стека Linux.",
    description_en: "Extensive stress test of modern web frameworks: p99 latency, RAM footprint, connection degradation under load, and Linux network I/O optimizations.",
    tags: ["FastAPI", "Go", "Next.js", "Продуктивність", "HighLoad"],
    image_url: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&h=600&fit=crop",
    image_source_url: "https://unsplash.com",
    external_url: "https://techempower.com",
    sources: [
      { title: "TechEmpower Web Framework Benchmarks", url: "https://www.techempower.com/benchmarks/" },
      { title: "FastAPI Benchmark Repository", url: "https://fastapi.tiangolo.com/benchmarks/" },
      { title: "Gin Web Framework Performance Metrics", url: "https://gin-gonic.com/" },
    ],
    likes: 278,
    share_count: 119,
    published: true,
    sort_order: 2,
    created_at: "2026-02-23T14:00:00Z",
    updated_at: "2026-02-23T14:00:00Z",
    blocks_uk: [
      {
        id: "res2-h1",
        type: "header",
        level: 2,
        text: "Сценарій тестування та інструменти",
      },
      {
        id: "res2-p1",
        type: "paragraph",
        text: "Навантаження генерувалося за допомогою k6 та wrk2 з 5 окремих вузлів, підключених через 10Gbps мережу. Ми тестували три сценарії: простий JSON echo, запит до бази даних із пулом з'єднань та багатоступеневу валідацію схем.",
      },
      {
        id: "res2-img1",
        type: "image",
        image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop",
        caption: "Рис. 2: Порівняння затримки 99-го перцентиля (p99 latency) при зростанні RPS від 10k до 100k",
        alt: "Графік затримки p99 для веб-фреймворків",
      },
      {
        id: "res2-quote1",
        type: "quote",
        text: "При переході за позначку 50,000 RPS вирішальним фактором стає не швидкість парсингу JSON, а відсутність блокувань у Garbage Collector та правильний тюнінг Linux epoll / io_uring.",
        caption: "HighLoad Architecture Benchmarking Group, 2026",
      },
      {
        id: "res2-list1",
        type: "list",
        items: [
          "Go Gin показав найнижчу стабільну затримку p99 на рівні 1.8 мс при 100,000 RPS",
          "FastAPI на базі Granian (Rust HTTP сервер) показав 3.2x прискорення порівняно з Uvicorn",
          "Next.js API Routes потребують додаткового кешування на рівні Edge/CDN для уникнення навантаження на Node.js event loop",
        ],
      },
    ],
    blocks_en: [],
  },
  {
    id: "res-db-storage-engines",
    type: "research",
    slug: "olap-engines-clickhouse-duckdb-postgres",
    title_uk: "Аналітичні рушії 2026: Порівняння ClickHouse, DuckDB та PostgreSQL для обробки 100M+ рядків",
    title_en: "Modern OLAP Engines 2026: ClickHouse, DuckDB, and PostgreSQL for 100M+ Rows",
    description_uk: "Порівняльний аналіз колонкових і реляційних СКБД: векторизоване виконання запитів, стиснення даних алгоритмами ZSTD/Gorilla, час агрегації та інтеграція в дата-пайплайни.",
    description_en: "Comparative benchmark of columnar vs relational databases: vectorized query execution, ZSTD compression ratios, aggregation speed, and data pipeline integration.",
    tags: ["ClickHouse", "DuckDB", "PostgreSQL", "BigData", "SQL"],
    image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop",
    image_source_url: "https://unsplash.com",
    external_url: "https://duckdb.org",
    sources: [
      { title: "ClickHouse Official Benchmark Results", url: "https://clickhouse.com/benchmark/dbms" },
      { title: "DuckDB TPC-H Performance Analytics", url: "https://duckdb.org/docs/guides/performance/tpch" },
      { title: "PostgreSQL pg_analytics Extension", url: "https://github.com/paradedb/paradedb" },
    ],
    likes: 195,
    share_count: 88,
    published: true,
    sort_order: 3,
    created_at: "2026-02-20T09:00:00Z",
    updated_at: "2026-02-20T09:00:00Z",
    blocks_uk: [
      {
        id: "res3-h1",
        type: "header",
        level: 2,
        text: "Векторизація та колонкове зберігання",
      },
      {
        id: "res3-p1",
        type: "paragraph",
        text: "Аналітичні запити, що сканують сотні мільйонів рядків для обчислення статистичних агрегацій (SUM, AVG, COUNT DISTINCT), показують колосальну різницю у швидкодії між класичним рядковим (PostgreSQL) та векторизованим колонковим виконанням.",
      },
      {
        id: "res3-img1",
        type: "image",
        image_url: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&h=600&fit=crop",
        caption: "Рис. 3: Час виконання складних аналітичних агрегацій на датасеті 100M записів (секунди, менше — краще)",
        alt: "Діаграма порівняння часу виконання SQL запитів",
      },
      {
        id: "res3-callout1",
        type: "callout",
        text: "DuckDB став беззаперечним лідером для локальної та serverless аналітики, виконуючи запити до 100M рядків за лічені мілісекунди без необхідності підняття окремого сервера баз даних.",
      },
    ],
    blocks_en: [],
  },
  {
    id: "res-tech-salaries-trends",
    type: "research",
    slug: "it-skills-market-trends-2026",
    title_uk: "IT-Тренди та зарплатна аналітика 2026: Стек технологій з найвищим попитом та динамікою росту",
    title_en: "IT Market Trends & Tech Compensation 2026: High-Demand Stacks and Growth Trajectories",
    description_uk: "Аналітичний звіт на основі вибірки з 45,000 IT-спеціалістів: трансформація ролей розробників під впливом AI, найбільш високооплачувані навички (Rust, AI Infra, Distributed Systems) та регіональний розподіл.",
    description_en: "Analytical industry report across 45,000 IT professionals: evolving engineering roles in the AI era, top compensating skills, and global demand shifts.",
    tags: ["Аналітика", "Кар'єра", "Зарплати", "Тренди", "Rust"],
    image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop",
    image_source_url: "https://unsplash.com",
    external_url: "https://github.com",
    sources: [
      { title: "Stack Overflow Developer Survey Analytics", url: "https://survey.stackoverflow.co/" },
      { title: "GitHub Octoverse Trends Report", url: "https://github.blog/news-insights/octoverse/" },
      { title: "DOU Tech & Compensation Industry Report", url: "https://dou.ua/lenta/articles/salary-report/" },
    ],
    likes: 345,
    share_count: 210,
    published: true,
    sort_order: 4,
    created_at: "2026-02-15T11:00:00Z",
    updated_at: "2026-02-15T11:00:00Z",
    blocks_uk: [
      {
        id: "res4-h1",
        type: "header",
        level: 2,
        text: "Трансформація інженерних вимог",
      },
      {
        id: "res4-p1",
        type: "paragraph",
        text: "У 2026 році навички прямої інтеграції AI-моделей у виробничі пайплайни, оптимізація швидкодії на низькому рівні (Rust/C++) та архітектура розподілених систем формують ядро найбільш високооплачуваних інженерних позицій.",
      },
      {
        id: "res4-img1",
        type: "image",
        image_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=600&fit=crop",
        caption: "Рис. 4: Розподіл медіанних компенсацій за ключовими інженерними спеціалізаціями",
        alt: "Графік зарплатної аналітики IT спеціалістів",
      },
    ],
    blocks_en: [],
  },
];

export const getFallbackEntries = (type: ModeEntryType): ModeEntry[] =>
  fallbackModeEntries.filter((e) => e.type === type);

export const getFallbackEntryById = (id: string): ModeEntry | null =>
  fallbackModeEntries.find((e) => e.id === id || e.slug === id) ?? null;

export const resources: ResourceItem[] = fallbackModeEntries
  .filter((e) => e.type === "resource")
  .map((e) => ({
    id: e.id,
    title: e.title_uk,
    description: e.description_uk,
    image: e.image_url ?? undefined,
    likes: e.likes,
    url: e.external_url ?? undefined,
  }));

export const components: ComponentItem[] = fallbackModeEntries
  .filter((e) => e.type === "component")
  .map((e) => ({
    id: e.id,
    title: e.title_uk,
    description: e.description_uk,
    url: e.external_url ?? undefined,
  }));

export const codeTemplates: ComponentItem[] = fallbackModeEntries
  .filter((e) => e.type === "template")
  .map((e) => ({
    id: e.id,
    title: e.title_uk,
    description: e.description_uk,
    url: e.external_url ?? undefined,
  }));

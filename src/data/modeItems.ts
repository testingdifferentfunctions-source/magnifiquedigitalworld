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

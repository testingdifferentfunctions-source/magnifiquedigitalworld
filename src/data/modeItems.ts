import type { ResourceItem } from "@/components/ResourceCard";
import type { ComponentItem } from "@/components/ComponentCard";

export const resources: ResourceItem[] = [
  {
    id: "figma",
    title: "Figma",
    description: "Інструмент для дизайну інтерфейсів і швидкого прототипування прямо в браузері.",
    likes: 12,
    url: "https://www.figma.com",
  },
  {
    id: "replit",
    title: "Replit",
    description: "Онлайн-середовище для написання й запуску Python-коду без встановлення програм.",
    likes: 34,
    url: "https://replit.com",
  },
  {
    id: "pythontutor",
    title: "Python Tutor",
    description: "Покрокова візуалізація виконання коду — ідеально для розуміння логіки програм.",
    likes: 21,
    url: "https://pythontutor.com",
  },
];

export const components: ComponentItem[] = [
  {
    id: "aiogram",
    title: "Aiogram",
    description: "Асинхронний фреймворк для створення Telegram-ботів на Python.",
    url: "https://docs.aiogram.dev",
  },
  {
    id: "fastapi",
    title: "FastAPI",
    description: "Швидкий вебфреймворк з автоматичною документацією та валідацією даних.",
    url: "https://fastapi.tiangolo.com",
  },
  {
    id: "pydantic",
    title: "Pydantic",
    description: "Валідація даних і налаштувань на основі типів Python.",
    url: "https://docs.pydantic.dev",
  },
];

export const codeTemplates: ComponentItem[] = [
  {
    id: "cli-parser",
    title: "CLI-парсер аргументів",
    description: "Готовий шаблон argparse зі підкомандами та валідацією вводу.",
  },
  {
    id: "async-requests",
    title: "Асинхронні запити",
    description: "Шаблон паралельних HTTP-запитів через aiohttp із обробкою помилок.",
  },
  {
    id: "csv-report",
    title: "Звіт із CSV",
    description: "Читання CSV, агрегація даних і збереження результату у новий файл.",
  },
];

export interface Article {
  id: string;
  title: string;
  description: string;
  image: string;
  likes: number;
  reads: number;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

export const articles: Article[] = [
  {
    id: "1",
    title: "Вступ до Python: Перші кроки",
    description: "Детальний посібник для початківців, які хочуть навчитися програмувати на Python з нуля.",
    image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600",
    likes: 342,
    reads: 1520,
    category: "basics"
  },
  {
    id: "2",
    title: "Робота зі списками в Python",
    description: "Дізнайтеся все про списки: створення, модифікація, методи та найкращі практики.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600",
    likes: 256,
    reads: 980,
    category: "basics"
  },
  {
    id: "3",
    title: "Django для початківців",
    description: "Створіть свій перший веб-додаток за допомогою популярного фреймворку Django.",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600",
    likes: 489,
    reads: 2100,
    category: "web"
  },
  {
    id: "4",
    title: "Асинхронне програмування з asyncio",
    description: "Опануйте асинхронне програмування для створення швидких та ефективних програм.",
    image: "https://images.unsplash.com/photo-1550439062-609e1531270e?w=600",
    likes: 178,
    reads: 750,
    category: "advanced"
  },
  {
    id: "5",
    title: "Pandas: Аналіз даних на Python",
    description: "Навчіться аналізувати великі набори даних за допомогою бібліотеки Pandas.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600",
    likes: 523,
    reads: 2340,
    category: "data-science"
  },
  {
    id: "6",
    title: "Машинне навчання з scikit-learn",
    description: "Вступ до машинного навчання та створення перших моделей на Python.",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600",
    likes: 412,
    reads: 1890,
    category: "ai"
  },
  {
    id: "7",
    title: "REST API з FastAPI",
    description: "Швидко створюйте сучасні API з автоматичною документацією та валідацією.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600",
    likes: 367,
    reads: 1560,
    category: "web"
  },
  {
    id: "8",
    title: "Тестування коду з pytest",
    description: "Навчіться писати надійні тести для вашого Python коду з pytest.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600",
    likes: 145,
    reads: 620,
    category: "advanced"
  },
  {
    id: "9",
    title: "Декоратори Python: Повний гайд",
    description: "Зрозумійте як працюють декоратори та як їх ефективно використовувати.",
    image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600",
    likes: 298,
    reads: 1120,
    category: "advanced"
  },
  {
    id: "10",
    title: "Візуалізація даних з Matplotlib",
    description: "Створюйте красиві графіки та діаграми для презентації ваших даних.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
    likes: 234,
    reads: 890,
    category: "data-science"
  },
  {
    id: "11",
    title: "Робота з файлами в Python",
    description: "Читання, запис та маніпуляція файлами різних форматів.",
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600",
    likes: 189,
    reads: 780,
    category: "basics"
  },
  {
    id: "12",
    title: "Нейронні мережі з TensorFlow",
    description: "Побудуйте свою першу нейронну мережу для розпізнавання зображень.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600",
    likes: 567,
    reads: 2560,
    category: "ai"
  }
];

export const categories: Category[] = [
  {
    id: "basics",
    name: "Основи Python",
    image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400"
  },
  {
    id: "web",
    name: "Веб-розробка",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400"
  },
  {
    id: "data-science",
    name: "Data Science",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400"
  },
  {
    id: "ai",
    name: "AI та ML",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400"
  },
  {
    id: "advanced",
    name: "Просунутий рівень",
    image: "https://images.unsplash.com/photo-1550439062-609e1531270e?w=400"
  }
];

export const getTopByReads = (count: number = 10): Article[] => {
  return [...articles].sort((a, b) => b.reads - a.reads).slice(0, count);
};

export const getTopByLikes = (count: number = 10): Article[] => {
  return [...articles].sort((a, b) => b.likes - a.likes).slice(0, count);
};

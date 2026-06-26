import type { LibraryItem } from "./api";

export const fallbackItems: LibraryItem[] = [
  {
    id: "local-v60",
    category: "coffee",
    subcategory: "black",
    title: "V60",
    subtitle: "Эфиопия · светлая обжарка",
    description: "Чистая чашка для ручного приготовления с ягодами, цитрусом и чайностью.",
    specs: [
      { label: "Кофе", value: "15 г" },
      { label: "Вода", value: "250 г" },
      { label: "Время", value: "2:30" },
      { label: "Выход", value: "225 г" }
    ],
    steps: ["Blooming 45 г / 35 сек", "Долить до 150 г", "Долить до 250 г и дождаться 2:30"],
    tags: ["черный кофе", "фильтр"],
    isFavorite: true
  },
  {
    id: "local-batch",
    category: "coffee",
    subcategory: "black",
    title: "Batch brew",
    subtitle: "Сезонный бленд · средняя обжарка",
    description: "Большой объем фильтра для утреннего пика.",
    specs: [
      { label: "Кофе", value: "60 г" },
      { label: "Вода", value: "1000 г" },
      { label: "Время", value: "12:00" },
      { label: "Выход", value: "900 г" }
    ],
    steps: ["Проверить термос", "Загрузить кофе", "Запустить программу batch"],
    tags: ["батч"]
  },
  {
    id: "local-espresso",
    category: "coffee",
    subcategory: "espresso",
    title: "Эспрессо",
    subtitle: "Бленд для эспрессо · темная обжарка",
    description: "Базовая настройка шота для молочных напитков.",
    specs: [
      { label: "Кофе", value: "18 г" },
      { label: "Выход", value: "36 г" },
      { label: "Время", value: "28 сек" },
      { label: "Темп.", value: "93 °C" }
    ],
    steps: ["Очистить группу", "Распределить помол", "Остановить на 36 г"],
    tags: ["эспрессо"]
  },
  {
    id: "local-cheesecake",
    category: "pastry",
    subcategory: "cake",
    title: "Чизкейк басский",
    subtitle: "Кремовый чизкейк с карамельной корочкой",
    description: "Плотная сливочная текстура, отлично продается к фильтру.",
    price: 340,
    imageUrl: "/brand/interior-1.jpg",
    specs: [],
    steps: [],
    tags: ["витрина"]
  }
];


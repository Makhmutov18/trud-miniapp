# План: Тотальный рефакторинг UI/UX «ТРУД» — Premium Apple Style

> **v2** — добавлены: сжатие фото через Canvas, обратный маппинг данных при редактировании, контекстная FAB

## Обзор

Полная пересборка фронтенда: чистка главного экрана, рефакторинг форм (динамические массивы полей, загрузка фото), новые разделы (Кондитерка, Чек-листы, Отчеты), премиальные анимации и оживление навигации.

**Затрагиваемые файлы:**
- `frontend/src/App.tsx` — основной файл (полная перезапись)
- `frontend/src/styles.css` — новые стили
- `frontend/src/api.ts` — новые типы и функции
- `frontend/src/api/client.ts` — возможно, новый метод upload

**Бэкенд:** изменений не требуется (Base64 кодируется на фронтенде, существующие API покрывают все нужды)

---

## Список задач

### ШАГ 1: ЧИСТКА ГЛАВНОГО ЭКРАНА

#### 1.1 Удалить статус-бар
- Удалить блок `<div className="max-w-lg mx-auto px-4 py-2 text-xs ...">` со строками "Синхронизировано" и "Бар · ТРУД"
- Удалить `status` state и `setStatus` вызовы

#### 1.2 Добавить поисковую строку
- Под хедером (после закрытия `</header>`) добавить `<div className="max-w-lg mx-auto px-4 pt-3">`
- Input с иконкой лупы (Lucide `Search`), плейсхолдер "Найти рецепт или ТТК..."
- `bg-white rounded-xl px-3 py-2.5 shadow-sm`
- Состояние `searchQuery: string`
- Фильтрация списков по `searchQuery` (по `lotName`, `drinkName`, `roaster`)

#### 1.3 Добавить категории (теги)
- Горизонтальный скролл `<div className="flex gap-2 overflow-x-auto hide-scrollbar px-4">`
- Теги: "Все", "V60", "Switch", "Orea", "Infuse Coffee", "Классика"
- Состояние `activeCategory: string`
- При клике — фильтрация рецептов на текущей вкладке
- Стиль: `px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all`
- Активный тег: `bg-coal text-white`, неактивный: `bg-white text-muted`

#### 1.4 Очистить табы от иконок
- Удалить `icon: typeof Coffee` из типа `tabs`
- Удалить импорты `Coffee`, `FlaskConical`, `CupSoda`
- Удалить `<Icon size={18} />` из рендера табов
- Добавить плавный индикатор (подсветка): `relative` контейнер, `absolute` полоска с `transition-all duration-300`

---

### ШАГ 2: РЕФАКТОРИНГ ФОРМ

#### 2.1 Загрузка фото (вместо URL) + сжатие через Canvas
- Заменить `<Field label="URL фото" ...>` на:
  ```tsx
  <input type="file" accept="image/*" className="hidden" id="photo-upload"
    onChange={handlePhotoUpload} />
  <label htmlFor="photo-upload" className="block ...">
    {preview ? <img src={preview} /> : <div>Нажмите, чтобы загрузить фото подачи</div>}
  </label>
  ```
- `handlePhotoUpload`:
  1. FileReader → читаем как `Image` (new Image())
  2. Рисуем на Canvas с ограничением max 1000px по ширине (пропорционально высота)
  3. `canvas.toDataURL("image/jpeg", 0.8)` → setState `photoBase64`
- Состояние `photoBase64: string` (отдельно от `imageUrl`)
- При сохранении: `imageUrl: photoBase64 || initial?.imageUrl || ""`
- Миниатюра: `w-full h-40 object-cover rounded-xl`
- **Зачем:** iPhone фото 12+ МП → 403/413 Payload Too Large. Canvas ресайз до 1000px ~200KB.

#### 2.2 Динамический ввод ингредиентов + обратный маппинг
- Заменить textarea `ingredientText` на массив `ingredients: { name: string; amount: string }[]`
- **Обратный маппинг при редактировании:** если `initial` передан, разложить `initial.ingredients`:
  ```ts
  const [ingredients, setIngredients] = useState<{name: string; amount: string}[]>(
    initial?.ingredients?.map((i: Ingredient) => ({ name: i.ingredientName, amount: i.exactAmount })) ?? []
  );
  ```
- Рендер: список карточек с двумя полями:
  ```tsx
  <div className="flex gap-2 items-center">
    <input placeholder="Название" value={ing.name} onChange={...} className="flex-1" />
    <input placeholder="г/мл" value={ing.amount} onChange={...} className="w-20 text-right" />
    <button onClick={() => removeIngredient(i)}><X size={16} /></button>
  </div>
  ```
- Кнопка "+ Добавить ингредиент" — `bg-linen rounded-xl py-2 text-sm font-semibold text-accent`
- При сохранении: маппинг в `{ ingredientName: name, exactAmount: amount }`

#### 2.3 Динамический ввод технологии (по пунктам) + обратный маппинг
- Заменить textarea `serviceStepText` на массив `serviceSteps: string[]`
- **Обратный маппинг при редактировании:**
  ```ts
  const [serviceSteps, setServiceSteps] = useState<string[]>(initial?.serviceSteps ?? []);
  ```
- Рендер: список нумерованных полей:
  ```tsx
  <div className="flex gap-2 items-center">
    <span className="font-bold text-accent w-6">{i + 1}.</span>
    <input value={step} onChange={...} className="flex-1" placeholder="Шаг технологии" />
    <button onClick={() => removeStep(i)}><X size={16} /></button>
  </div>
  ```
- Кнопка "+ Добавить шаг технологии"

#### 2.4 Исправление формы воронок (Steps)
- Каждый шаг — полноценная карточка `bg-linen rounded-xl p-3 space-y-2`
- Поля с четкими подписями-плейсхолдерами:
  - "Время" (placeholder "0:00")
  - "Название стадии" (placeholder "Bloom, Pour 1, Pour 2")
  - "Вода (мл)" (placeholder "мл")
  - "Общий вес (г)" (placeholder "г")
- Кнопка "+ Добавить шаг заваривания" — крупная, `w-full bg-white border-2 border-dashed border-line rounded-xl py-3 text-accent font-semibold`

#### 2.5 Оживление карточек на главной
- **SignatureTtkCard:** заменить `{ttk.ingredients.length} ингредиентов · {ttk.serviceSteps.length} шагов` на `{ttk.ingredients.length} ингредиентов · Посуда: {ttk.vessel}`
- Фото: `className="w-full h-40 object-cover rounded-t-2xl"` (уже есть, проверить)

#### 2.6 Кнопка удаления в формах
- В `RecipeFormModal` добавить красную кнопку "Удалить рецепт" (только в режиме редактирования)
- `onDelete` проп в `RecipeFormModal`
- Подтверждение через `confirm()` перед удалением

---

### ШАГ 3: НАВИГАЦИЯ, НОВЫЕ РАЗДЕЛЫ, АНИМАЦИИ

#### 3.1 Оживить Bottom Nav
- Добавить `activeNav: "home" | "pastry" | "checklist" | "reports"` state
- Активная вкладка: `text-green` (оливковый `#4A7C59`)
- Переключение `activeNav` меняет отображаемый контент
- Иконки: `Home`, `CupSoda` (для Кондитерки), `ClipboardCheck` (для Чек-листов), `BarChart3` (для Отчетов)

#### 3.2 Новые разделы
- **Кондитерка (pastry):** GET `/api/items?category=pastry`, карточки с фото, названием, ценой
- **Чек-листы (checklist):** GET `/api/items?category=checklist`, карточки с чек-листами
- **Отчеты (reports):** заглушка с сообщением "Раздел в разработке"
- Импортировать `fetchItems` из `api.ts` (или создать)

#### 3.3 FAB кнопка (+) — контекстная
- `fixed bottom-24 right-6 z-50 w-14 h-14 bg-accent text-white rounded-full shadow-lg`
- `flex items-center justify-center active:scale-90 transition-transform duration-200`
- **Логика открытия:**
  - `activeNav === "home" && activeTab === "brew_bar"` → открыть форму создания воронки
  - `activeNav === "home" && activeTab === "batch_brew"` → открыть форму создания батч-брю
  - `activeNav === "home" && activeTab === "signature_ttk"` → открыть форму создания ТТК
  - `activeNav === "pastry"` → открыть форму добавления выпечки (ItemFormModal)
  - `activeNav === "checklist"` → открыть форму создания чек-листа
  - `activeNav === "reports"` → скрыть FAB
- Показывать на всех экранах, кроме Reports

#### 3.4 Премиальные анимации
- Все кнопки: `transition-all duration-200 ease-out`
- Карточки: `active:scale-[0.98] transition-transform duration-200`
- Модалки: `backdrop-blur-md bg-white/80` (overlay), `sheet-animate` (уже есть)
- Табы: плавный индикатор `absolute bottom-0 h-0.5 bg-accent transition-all duration-300`
- Bottom Nav: `transition-colors duration-200`
- Категории-теги: `transition-all duration-200`

#### 3.5 TypeScript и сборка
- Обновить типы в `api.ts`: добавить `fetchItems(category)` функцию
- Убедиться, что `npx tsc --noEmit` проходит без ошибок
- `npm run build` — успешная сборка

---

## Архитектурная схема

```mermaid
flowchart TD
    App[App.tsx - главный компонент]
    
    subgraph Header
        Logo[Логотип ТРУД]
        Search[Поисковая строка]
        Categories[Горизонтальные теги-категории]
        TabRail[Табы: Воронки | Батч-брю | Авторские]
    end
    
    subgraph Content
        direction TB
        BrewBar[Список воронок]
        BatchBrew[Список батч-брю]
        SignatureTTK[Список авторских]
        Pastry[Кондитерка]
        Checklist[Чек-листы]
        Reports[Отчеты - заглушка]
    end
    
    subgraph Modals
        DetailModal[DetailModal - просмотр]
        RecipeFormModal[RecipeFormModal - создание/редактирование]
    end
    
    subgraph BottomNav
        HomeBtn[Главная]
        PastryBtn[Кондитерка]
        ChecklistBtn[Чек-листы]
        ReportsBtn[Отчеты]
    end
    
    App --> Header
    App --> Content
    App --> Modals
    App --> BottomNav
    App --> FAB[FAB кнопка +]
    
    activeNav{activeNav state} -->|home| BrewBar & BatchBrew & SignatureTTK
    activeNav -->|pastry| Pastry
    activeNav -->|checklist| Checklist
    activeNav -->|reports| Reports
    
    activeTab{activeTab state} -->|brew_bar| BrewBar
    activeTab -->|batch_brew| BatchBrew
    activeTab -->|signature_ttk| SignatureTTK
```

## Поток данных формы

```mermaid
flowchart LR
    Form[RecipeFormModal] -->|ingredients: array| Save[onSave handler]
    Form -->|serviceSteps: array| Save
    Form -->|photoBase64: string| Save
    Form -->|steps: BrewBarStep[]| Save
    
    Save -->|PUT/POST| API[Backend API]
    API -->|200 OK| loadAll[loadAll refresh]
    loadAll -->|setState| Cards[Card list update]
    
    Delete[Delete button] -->|confirm| API_DEL[DELETE endpoint]
    API_DEL --> loadAll
```

## Цветовая схема (Apple Style)

| Токен | Цвет | Использование |
|-------|------|---------------|
| `--color-linen` | `#FDFBF7` | Фон body |
| `--color-coal` | `#2C2520` | Основной текст |
| `--color-muted` | `#8B7E74` | Вторичный текст |
| `--color-accent` | `#C89B55` | Горчичный акцент (кнопки, активные табы) |
| `--color-green` | `#4A7C59` | Оливковый (активная bottom nav) |
| `--color-red` | `#C84B31` | Удаление, ошибки |
| `--color-line` | `#E8E0D6` | Разделители |
| `white` | `#FFFFFF` | Карточки, модалки, инпуты |

## Компонентная структура (новые/изменённые)

| Компонент | Изменение |
|-----------|-----------|
| `App` | Полная перезапись: новый activeNav, search, categories |
| `BrewBarCard` | Без изменений (кроме анимаций) |
| `BatchBrewCard` | Без изменений (кроме анимаций) |
| `SignatureTtkCard` | Изменить отображение: "N ингредиентов · Посуда: X" |
| `DetailModal` | Без изменений |
| `BrewBarDetail` | Без изменений |
| `BatchBrewDetail` | Без изменений |
| `SignatureTtkDetail` | Без изменений |
| `RecipeFormModal` | Полная перезапись: photo upload, dynamic ingredients, dynamic steps, delete button |
| `Field` | Без изменений |
| `Select` | Без изменений |
| `PastrySection` | **Новый** — список выпечки из `/api/items?category=pastry` |
| `ChecklistSection` | **Новый** — список чек-листов из `/api/items?category=checklist` |
| `ReportsSection` | **Новый** — заглушка "В разработке" |

## API изменения (frontend/src/api.ts)

Добавить:
```typescript
export async function fetchItems(category: string): Promise<ItemResponse[]> {
  const response = await fetch(`${API_BASE}/api/items?category=${category}`);
  if (!response.ok) throw new Error("Не удалось загрузить");
  return response.json();
}
```

Импортировать `ItemResponse` тип (или создать локальный интерфейс).

---

## Порядок выполнения

1. **Шаг 1.1** — удалить статус-бар и `status` state
2. **Шаг 1.4** — очистить табы от иконок, добавить плавный индикатор
3. **Шаг 1.2** — добавить поисковую строку
4. **Шаг 1.3** — добавить категории-теги
5. **Шаг 2.1** — загрузка фото (Base64)
6. **Шаг 2.2** — динамический ввод ингредиентов
7. **Шаг 2.3** — динамический ввод технологии
8. **Шаг 2.4** — редизайн шагов заваривания
9. **Шаг 2.5** — исправление карточек авторских напитков
10. **Шаг 2.6** — кнопка удаления в формах
11. **Шаг 3.1** — оживить Bottom Nav
12. **Шаг 3.2** — новые разделы (Кондитерка, Чек-листы, Отчеты)
13. **Шаг 3.3** — FAB кнопка
14. **Шаг 3.4** — анимации
15. **Шаг 3.5** — TypeScript проверка, сборка, коммит
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  CheckSquare,
  ChevronRight,
  ClipboardList,
  Coffee,
  Filter,
  ImagePlus,
  Menu,
  Plus,
  Search,
  Sparkles,
  Store,
  X
} from "lucide-react";
import { Category, LibraryItem, calculateExtraction, createItem, fetchItems } from "./api";
import { fallbackItems } from "./fallbackData";
import { TelegramUser, bootTelegram } from "./telegram";

type Tab = {
  id: Category;
  label: string;
  icon: typeof Coffee;
};

const tabs: Tab[] = [
  { id: "coffee", label: "Кофе", icon: Coffee },
  { id: "pastry", label: "Кондитерка", icon: Store },
  { id: "checklist", label: "Чек-листы", icon: ClipboardList }
];

const itemOrder = ["V60", "Batch brew", "Эспрессо", "Авторские", "Латте облепиха"];

const emptyForm: Omit<LibraryItem, "id"> = {
  category: "coffee",
  subcategory: "black",
  title: "",
  subtitle: "",
  description: "",
  price: null,
  imageUrl: "",
  specs: [],
  steps: [],
  tags: [],
  isFavorite: false
};

function App() {
  const [items, setItems] = useState<LibraryItem[]>(fallbackItems);
  const [activeTab, setActiveTab] = useState<Category>("coffee");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<LibraryItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [status, setStatus] = useState("Локальная база");
  const [user, setUser] = useState<TelegramUser | undefined>();

  useEffect(() => {
    setUser(bootTelegram());
    fetchItems()
      .then((data) => {
        setItems(data);
        setStatus("Синхронизировано");
      })
      .catch(() => setStatus("Демо-режим"));
  }, []);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim();
    return items
      .filter((item) => {
        const inTab = item.category === activeTab;
        const inSearch = !needle || [item.title, item.subtitle, item.description, ...item.tags].join(" ").toLowerCase().includes(needle);
        return inTab && inSearch;
      })
      .sort((a, b) => {
        const left = itemOrder.indexOf(a.title);
        const right = itemOrder.indexOf(b.title);
        if (left !== -1 || right !== -1) return (left === -1 ? 99 : left) - (right === -1 ? 99 : right);
        return a.title.localeCompare(b.title, "ru");
      });
  }, [items, activeTab, query]);

  const coffeeItems = items.filter((item) => item.category === "coffee");
  const pastryItems = items.filter((item) => item.category === "pastry");
  const checklistItems = items.filter((item) => item.category === "checklist");

  async function handleCreate(payload: Omit<LibraryItem, "id">) {
    const optimistic: LibraryItem = { ...payload, id: crypto.randomUUID() };
    setItems((current) => [optimistic, ...current]);
    setIsCreating(false);
    try {
      const created = await createItem(payload);
      setItems((current) => current.map((item) => (item.id === optimistic.id ? created : item)));
      setStatus("Карточка создана");
    } catch {
      setStatus("Сохранено только локально");
    }
  }

  return (
    <main className="app-shell">
      <section className="phone-frame">
        <div className="ambient ambient-left" />
        <div className="topbar">
          <BrandWordmark />
          <div className="topbar-actions">
            <button className="icon-button" aria-label="Поиск">
              <Search size={24} />
            </button>
            <button className="icon-button elevated" aria-label="Меню">
              <Menu size={24} />
            </button>
          </div>
        </div>

        <div className="status-row">
          <span>{status}</span>
          <span>{user?.first_name ? `${user.first_name}, смена открыта` : "Бар · ТРУД"}</span>
        </div>

        <nav className="tab-rail" aria-label="Разделы">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={activeTab === tab.id ? "tab active" : "tab"}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={19} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="search-row">
          <label className="search-field">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти рецепт или товар" />
          </label>
          <button className="filter-button" aria-label="Фильтры">
            <Filter size={19} />
          </button>
        </div>

        <section className="content-scroll">
          {activeTab === "coffee" && (
            <>
              <SectionHeader title="Рецепты кофе" action="Фильтры" />
              <QuickStats items={coffeeItems} />
              <div className="card-stack">
                {filtered.map((item, index) => (
                  <RecipeCard key={item.id} item={item} index={index} onSelect={setSelected} />
                ))}
              </div>
              <PastryPreview items={pastryItems.slice(0, 3)} onSelect={setSelected} onShowAll={() => setActiveTab("pastry")} />
            </>
          )}

          {activeTab === "pastry" && (
            <>
              <SectionHeader title="Кондитерская карта" action={`${pastryItems.length} позиций`} />
              <div className="pastry-grid">
                {filtered.map((item) => (
                  <PastryCard key={item.id} item={item} onSelect={setSelected} />
                ))}
              </div>
            </>
          )}

          {activeTab === "checklist" && (
            <>
              <SectionHeader title="Чек-листы" action={`${checklistItems.length} активных`} />
              <div className="checklist-panel">
                {filtered.map((item) => (
                  <ChecklistCard key={item.id} item={item} onSelect={setSelected} />
                ))}
              </div>
            </>
          )}
        </section>

        <button className="fab" data-testid="add-card" onClick={() => setIsCreating(true)} aria-label="Добавить карточку">
          <Plus size={32} />
          <span>Добавить</span>
        </button>

        <footer className="bottom-nav">
          <button className="bottom-item active">
            <Coffee size={22} />
            <span>Главная</span>
          </button>
          <button className="bottom-item">
            <Bookmark size={22} />
            <span>Избранное</span>
          </button>
          <button className="bottom-item">
            <Menu size={22} />
            <span>Профиль</span>
          </button>
        </footer>
      </section>

      {selected && <DetailSheet item={selected} onClose={() => setSelected(null)} />}
      {isCreating && <CreateSheet activeCategory={activeTab} onClose={() => setIsCreating(false)} onSubmit={handleCreate} />}
    </main>
  );
}

function SectionHeader({ title, action }: { title: string; action: string }) {
  return (
    <div className="section-header">
      <h1>{title}</h1>
      <button>{action}</button>
    </div>
  );
}

function BrandWordmark() {
  return (
    <div className="brand-wordmark" aria-label="ТРУД">
      <span>Т</span>
      <span>Р</span>
      <span>У</span>
      <span>Д</span>
    </div>
  );
}

function QuickStats({ items }: { items: LibraryItem[] }) {
  const espresso = items.filter((item) => item.subcategory === "espresso").length;
  const black = items.filter((item) => item.subcategory === "black").length;
  const signature = items.filter((item) => item.subcategory === "signature").length;
  return (
    <div className="quick-stats">
      <div>
        <span>{black}</span>
        <p>черный</p>
      </div>
      <div>
        <span>{espresso}</span>
        <p>эспрессо</p>
      </div>
      <div>
        <span>{signature}</span>
        <p>авторские</p>
      </div>
    </div>
  );
}

function RecipeCard({ item, index, onSelect }: { item: LibraryItem; index: number; onSelect: (item: LibraryItem) => void }) {
  return (
    <button className="recipe-card" data-testid={`recipe-card-${item.id}`} onClick={() => onSelect(item)}>
      <div className="recipe-index">{String(index + 1).padStart(2, "0")}</div>
      <div className="recipe-visual">
        <CoffeeSketch type={item.subcategory} />
      </div>
      <div className="recipe-body">
        <div className="recipe-title-row">
          <div>
            <h2>{item.title}</h2>
            <p>{item.subtitle}</p>
          </div>
          <Bookmark className={item.isFavorite ? "bookmarked" : ""} size={23} />
        </div>
        <div className="spec-row">
          {item.specs.slice(0, 4).map((spec) => (
            <span key={`${item.id}-${spec.label}`}>
              <b>{spec.label}</b>
              {spec.value}
            </span>
          ))}
        </div>
      </div>
      <ChevronRight className="card-chevron" size={24} />
    </button>
  );
}

function CoffeeSketch({ type }: { type: string }) {
  const label = type === "espresso" ? "ESP" : type === "signature" ? "MILK" : type === "black" ? "V60" : "BREW";
  return (
    <div className="sketch-mark">
      <Coffee size={34} />
      <span>{label}</span>
    </div>
  );
}

function PastryPreview({ items, onSelect, onShowAll }: { items: LibraryItem[]; onSelect: (item: LibraryItem) => void; onShowAll: () => void }) {
  if (!items.length) return null;
  return (
    <section className="pastry-preview">
      <div className="preview-header">
        <h2>Кондитерка</h2>
        <button onClick={onShowAll}>
          Смотреть все <ChevronRight size={18} />
        </button>
      </div>
      <div className="pastry-list">
        {items.map((item) => (
          <button key={item.id} className="pastry-row" onClick={() => onSelect(item)}>
            <img src={item.imageUrl || "/brand/interior-2.jpg"} alt="" />
            <span>
              <b>{item.title}</b>
              <small>{item.subtitle}</small>
            </span>
            <strong>{item.price ? `${item.price} ₽` : ""}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}

function PastryCard({ item, onSelect }: { item: LibraryItem; onSelect: (item: LibraryItem) => void }) {
  return (
    <button className="pastry-card" onClick={() => onSelect(item)}>
      <img src={item.imageUrl || "/brand/interior-2.jpg"} alt="" />
      <div>
        <h2>{item.title}</h2>
        <p>{item.subtitle}</p>
        <span>{item.price ? `${item.price} ₽` : "цена не указана"}</span>
      </div>
    </button>
  );
}

function ChecklistCard({ item, onSelect }: { item: LibraryItem; onSelect: (item: LibraryItem) => void }) {
  return (
    <button className="checklist-card" onClick={() => onSelect(item)}>
      <div className="check-icon">
        <CheckSquare size={24} />
      </div>
      <div>
        <h2>{item.title}</h2>
        <p>{item.description}</p>
        <span>{item.steps.length} пунктов</span>
      </div>
      <ChevronRight size={22} />
    </button>
  );
}

function DetailSheet({ item, onClose }: { item: LibraryItem; onClose: () => void }) {
  return (
    <div className="sheet-backdrop" role="dialog" aria-modal="true">
      <section className="sheet">
        <div className="sheet-handle" />
        <button className="close-button" onClick={onClose} aria-label="Закрыть">
          <X size={22} />
        </button>
        {item.category === "pastry" && <img className="detail-image" src={item.imageUrl || "/brand/interior-2.jpg"} alt="" />}
        <div className="detail-kicker">
          <Sparkles size={16} />
          <span>{item.category === "coffee" ? "технологическая карта" : item.category === "pastry" ? "карточка товара" : "сменный чек-лист"}</span>
        </div>
        <h2>{item.title}</h2>
        <p className="detail-subtitle">{item.subtitle}</p>
        <p className="detail-description">{item.description}</p>
        {!!item.specs.length && (
          <div className="detail-specs">
            {item.specs.map((spec) => (
              <div key={spec.label}>
                <span>{spec.label}</span>
                <strong>{spec.value}</strong>
              </div>
            ))}
          </div>
        )}
        {!!item.steps.length && (
          <ol className="steps-list">
            {item.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        )}
        {item.category === "coffee" && (
          <div className="tool-grid">
        <BrewTimer item={item} />
        <ExtractionTool item={item} />
          </div>
        )}
      </section>
    </div>
  );
}

function BrewTimer({ item }: { item: LibraryItem }) {
  const total = getBrewTime(item);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSeconds((current) => {
        if (current >= total) {
          window.clearInterval(timer);
          setRunning(false);
          return total;
        }
        return current + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, total]);

  const progress = total ? Math.min(100, Math.round((seconds / total) * 100)) : 0;

  return (
    <section className="coffee-tool">
      <div className="timer-ring" style={{ background: `conic-gradient(var(--green) ${progress}%, #eadfce ${progress}% 100%)` }}>
        <div>
          <strong>{formatTime(seconds)}</strong>
          <span>{formatTime(total)}</span>
        </div>
      </div>
      <div className="tool-actions">
        <button type="button" onClick={() => setRunning((value) => !value)}>
          {running ? "Пауза" : seconds > 0 ? "Продолжить" : "Старт"}
        </button>
        <button type="button" onClick={() => {
          setRunning(false);
          setSeconds(0);
        }}>
          Сброс
        </button>
      </div>
    </section>
  );
}

function ExtractionTool({ item }: { item: LibraryItem }) {
  const [dose, setDose] = useState(getSpecNumber(item, "Кофе") || 18);
  const [beverageWeight, setBeverageWeight] = useState(getSpecNumber(item, "Выход") || 36);
  const [tds, setTds] = useState(1.35);
  const [result, setResult] = useState<{ extraction: number; status: string } | null>(null);
  const [error, setError] = useState("");

  async function runCalculation() {
    setError("");
    try {
      const calculated = await calculateExtraction({ beverageWeight, tds, dose });
      setResult(calculated);
    } catch {
      const fallback = Math.round(((beverageWeight * tds) / dose) * 100) / 100;
      setResult({ extraction: fallback, status: fallback >= 18 && fallback <= 22 ? "within_spec" : "out_of_limits" });
      setError("Расчет выполнен локально");
    }
  }

  return (
    <section className="coffee-tool extraction-tool">
      <div className="tool-title">
        <b>Экстракция</b>
        <span>{result ? `${result.extraction}%` : "Golden Cup"}</span>
      </div>
      <div className="mini-inputs">
        <label>
          Доза
          <input type="number" value={dose} onChange={(event) => setDose(Number(event.target.value))} />
        </label>
        <label>
          Выход
          <input type="number" value={beverageWeight} onChange={(event) => setBeverageWeight(Number(event.target.value))} />
        </label>
        <label>
          TDS
          <input type="number" step="0.01" value={tds} onChange={(event) => setTds(Number(event.target.value))} />
        </label>
      </div>
      <button type="button" onClick={runCalculation}>Рассчитать</button>
      {result && <p className={result.status === "within_spec" ? "calc-ok" : "calc-warn"}>{result.status === "within_spec" ? "В целевом диапазоне" : "Нужно проверить рецепт"}</p>}
      {error && <small>{error}</small>}
    </section>
  );
}

function getSpecNumber(item: LibraryItem, label: string) {
  const spec = item.specs.find((candidate) => candidate.label.toLowerCase() === label.toLowerCase());
  if (!spec) return 0;
  const match = spec.value.replace(",", ".").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function getBrewTime(item: LibraryItem) {
  const raw = item.specs.find((spec) => spec.label.toLowerCase().includes("время"))?.value || "";
  const minuteMatch = raw.match(/(\d+):(\d+)/);
  if (minuteMatch) return Number(minuteMatch[1]) * 60 + Number(minuteMatch[2]);
  const secondMatch = raw.match(/\d+/);
  return secondMatch ? Number(secondMatch[0]) : 180;
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function CreateSheet({
  activeCategory,
  onClose,
  onSubmit
}: {
  activeCategory: Category;
  onClose: () => void;
  onSubmit: (payload: Omit<LibraryItem, "id">) => void;
}) {
  const [form, setForm] = useState<Omit<LibraryItem, "id">>({ ...emptyForm, category: activeCategory });
  const [specText, setSpecText] = useState("Кофе: 18 г\nВода: 250 г\nВремя: 2:30");
  const [stepText, setStepText] = useState("");

  function update<K extends keyof Omit<LibraryItem, "id">>(key: K, value: Omit<LibraryItem, "id">[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleImage(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("imageUrl", String(reader.result));
    reader.readAsDataURL(file);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const specs = specText
      .split("\n")
      .map((line) => line.split(":"))
      .filter(([label, value]) => label?.trim() && value?.trim())
      .map(([label, value]) => ({ label: label.trim(), value: value.trim() }));
    const steps = stepText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    onSubmit({ ...form, specs, steps, tags: form.tags.filter(Boolean) });
  }

  return (
    <div className="sheet-backdrop" role="dialog" aria-modal="true">
      <form className="sheet create-sheet" onSubmit={submit}>
        <div className="sheet-handle" />
        <button type="button" className="close-button" onClick={onClose} aria-label="Закрыть">
          <X size={22} />
        </button>
        <h2>Новая карточка</h2>
        <div className="form-grid">
          <label>
            Раздел
            <select value={form.category} onChange={(event) => update("category", event.target.value as Category)}>
              <option value="coffee">Кофе</option>
              <option value="pastry">Кондитерка</option>
              <option value="checklist">Чек-листы</option>
            </select>
          </label>
          <label>
            Тип
            <input value={form.subcategory} onChange={(event) => update("subcategory", event.target.value)} placeholder="black / espresso / cake" />
          </label>
          <label className="wide">
            Название
            <input value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Например, Фокачча" required />
          </label>
          <label className="wide">
            Короткое описание
            <input value={form.subtitle} onChange={(event) => update("subtitle", event.target.value)} placeholder="С чем продавать, вкус, роль" />
          </label>
          <label className="wide">
            Описание
            <textarea value={form.description} onChange={(event) => update("description", event.target.value)} rows={3} />
          </label>
          <label>
            Цена
            <input type="number" value={form.price ?? ""} onChange={(event) => update("price", event.target.value ? Number(event.target.value) : null)} />
          </label>
          <label>
            Фото
            <span className="file-input">
              <ImagePlus size={18} />
              Загрузить
              <input type="file" accept="image/*" onChange={(event) => handleImage(event.target.files?.[0])} />
            </span>
          </label>
          <label className="wide">
            Параметры
            <textarea value={specText} onChange={(event) => setSpecText(event.target.value)} rows={3} />
          </label>
          <label className="wide">
            Шаги
            <textarea value={stepText} onChange={(event) => setStepText(event.target.value)} rows={4} placeholder="Каждый пункт с новой строки" />
          </label>
        </div>
        <button className="submit-button" type="submit">
          Создать карточку
        </button>
      </form>
    </div>
  );
}

export default App;

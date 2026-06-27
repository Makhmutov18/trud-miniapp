import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Cropper, { type Area } from "react-easy-crop";
import {
  Home,
  Croissant,
  ClipboardCheck,
  BarChart3,
  CalendarDays,
  ShieldCheck,
  Plus,
  Pencil,
  X,
  Clock,
  Droplets,
  Weight,
  Folder,
  FolderOpen,
  ArrowLeft,
  Search,
} from "lucide-react";
import {
  BrewBarRecipe,
  BatchBrewRecipe,
  SignatureTtk,
  BrewBarStep,
  Ingredient,
  ItemResponse,
  RecipeFolder,
  TabId,
  fetchBrewBarRecipes,
  fetchBatchBrewRecipes,
  fetchSignatureTtks,
  createBrewBar,
  updateBrewBar,
  createBatchBrew,
  updateBatchBrew,
  createSignatureTtk,
  updateSignatureTtk,
  deleteBrewBar,
  deleteBatchBrew,
  deleteSignatureTtk,
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
} from "./api";
import { bootTelegram, hapticImpact, hapticSuccess } from "./telegram";

type NavId = "dashboard" | "recipes" | "pastry" | "checklist" | "reports";

type SearchResult =
  | { kind: "brew_bar"; title: string; subtitle: string; id: string; item: BrewBarRecipe }
  | { kind: "batch_brew"; title: string; subtitle: string; id: string; item: BatchBrewRecipe }
  | { kind: "signature_ttk"; title: string; subtitle: string; id: string; item: SignatureTtk }
  | { kind: "pastry"; title: string; subtitle: string; id: string; item: ItemResponse }
  | { kind: "checklist"; title: string; subtitle: string; id: string; item: ItemResponse };

const tabs: { id: TabId; label: string }[] = [
  { id: "brew_bar", label: "Воронки" },
  { id: "batch_brew", label: "Батч-брю" },
  { id: "signature_ttk", label: "Авторские" },
];

const navItems: { id: NavId; label: string; icon: typeof Home }[] = [
  { id: "dashboard", label: "Главная", icon: Home },
  { id: "recipes", label: "Рецепты", icon: Folder },
  { id: "pastry", label: "Булки", icon: Croissant },
  { id: "checklist", label: "Смена", icon: ClipboardCheck },
  { id: "reports", label: "Админ", icon: ShieldCheck },
];

const FOLDERS_KEY = "trud_folders";
const logoLetters = [
  { char: "Т", className: "text-slate", x: -18, y: 8, rotate: -16 },
  { char: "Р", className: "text-accent", x: -8, y: -16, rotate: 12 },
  { char: "У", className: "text-red", x: 12, y: 14, rotate: -10 },
  { char: "Д", className: "text-coal", x: 20, y: -8, rotate: 14 },
];

function loadFolders(): RecipeFolder[] {
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFolders(folders: RecipeFolder[]) {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

function normalizeFolderId<T extends { folderId?: string | null }>(item: T): T {
  return { ...item, folderId: item.folderId ?? null };
}

const PHOTO_CARD_ASPECT = 4 / 3;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    if (!source.startsWith("data:")) {
      image.crossOrigin = "anonymous";
    }
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

async function cropPhotoToCard(source: string, croppedAreaPixels: Area): Promise<string> {
  try {
    const image = await loadImage(source);
    const canvas = document.createElement("canvas");
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return source;
    ctx.drawImage(
      image,
      croppedAreaPixels.x, croppedAreaPixels.y,
      croppedAreaPixels.width, croppedAreaPixels.height,
      0, 0,
      croppedAreaPixels.width, croppedAreaPixels.height
    );
    return canvas.toDataURL("image/jpeg", 0.86);
  } catch {
    return source;
  }
}

function PhotoCropEditor({
  id,
  label,
  source,
  emptyText,
  onFileSelected,
  onCropComplete,
}: {
  id: string;
  label: string;
  source: string;
  emptyText: string;
  onFileSelected: (file: File) => void;
  onCropComplete: (croppedAreaPixels: Area) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  return (
    <div>
      <span className="text-xs font-bold text-muted uppercase block mb-1">{label}</span>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id={id}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFileSelected(file);
        }}
      />
      <label htmlFor={id} className="block cursor-pointer">
        {source ? (
          <div className="photo-frame aspect-[4/3] relative">
            <Cropper
              image={source}
              crop={crop}
              zoom={zoom}
              aspect={PHOTO_CARD_ASPECT}
              cropShape="rect"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: { borderRadius: "1rem" },
                cropAreaStyle: {
                  border: "1px solid rgba(255,255,255,0.72)",
                  borderRadius: "0.75rem",
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                },
              }}
            />
            <span className="absolute left-3 bottom-3 z-10 rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-coal shadow-sm backdrop-blur">
              Так будет в карточке
            </span>
          </div>
        ) : (
          <div className="w-full aspect-[4/3] photo-dropzone rounded-2xl flex items-center justify-center text-sm text-muted font-semibold hover:border-accent">
            {emptyText}
          </div>
        )}
      </label>

      {source && (
        <div className="mt-3 rounded-2xl bg-linen/70 p-3 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-muted uppercase">
            <span>Кадрирование</span>
            <label htmlFor={id} className="cursor-pointer text-accent normal-case">Заменить фото</label>
          </div>
          <label className="grid grid-cols-[82px_1fr] items-center gap-3 text-xs font-semibold text-muted">
            <span>Масштаб</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="photo-crop-range"
            />
          </label>
        </div>
      )}
    </div>
  );
}

function TrudLogo() {
  const [isScattered, setIsScattered] = useState(false);

  function handleClick() {
    hapticImpact("light");
    setIsScattered(true);
    window.setTimeout(() => setIsScattered(false), 720);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-baseline gap-1.5 text-3xl font-black tracking-tight"
      aria-label="ТРУД"
    >
      {logoLetters.map((letter) => (
        <motion.span
          key={letter.char}
          className={letter.className}
          animate={
            isScattered
              ? {
                  x: [0, letter.x, 0],
                  y: [0, letter.y, 0],
                  rotate: [0, letter.rotate, 0],
                  scale: [1, 0.82, 1],
                  opacity: [1, 0.62, 1],
                }
              : { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
          }
          transition={{ duration: 0.68, ease: "easeInOut" }}
        >
          {letter.char}
        </motion.span>
      ))}
    </button>
  );
}

function App() {
  const [activeNav, setActiveNav] = useState<NavId>("dashboard");
  const [activeTab, setActiveTab] = useState<TabId>("brew_bar");
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<RecipeFolder[]>(loadFolders);

  const [brewBarRecipes, setBrewBarRecipes] = useState<BrewBarRecipe[]>([]);
  const [batchBrewRecipes, setBatchBrewRecipes] = useState<BatchBrewRecipe[]>([]);
  const [signatureTtks, setSignatureTtks] = useState<SignatureTtk[]>([]);
  const [pastryItems, setPastryItems] = useState<ItemResponse[]>([]);
  const [checklistItems, setChecklistItems] = useState<ItemResponse[]>([]);

  const [selectedRecipe, setSelectedRecipe] = useState<BrewBarRecipe | BatchBrewRecipe | SignatureTtk | null>(null);
  const [selectedItem, setSelectedItem] = useState<ItemResponse | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");
  const [activeChip, setActiveChip] = useState<string | null>(null);

  const chips = ["V60", "Батч", "Авторские", "Открытие", "Закрытие"];

  const searchResults = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResult[] = [
      ...brewBarRecipes.map((r) => ({
        kind: "brew_bar" as const,
        title: r.lotName || "Без названия",
        subtitle: `${r.roaster || "?"} · ${r.method || "?"}`,
        id: r.id,
        item: r,
      })),
      ...batchBrewRecipes.map((r) => ({
        kind: "batch_brew" as const,
        title: r.lotName || "Без названия",
        subtitle: `${r.roaster || "?"} · ${r.brewerProgram || "?"}`,
        id: r.id,
        item: r,
      })),
      ...signatureTtks.map((r) => ({
        kind: "signature_ttk" as const,
        title: r.drinkName || "Без названия",
        subtitle: r.category === "hot" ? "Горячий" : "Холодный",
        id: r.id,
        item: r,
      })),
      ...pastryItems.map((r) => ({
        kind: "pastry" as const,
        title: r.title || "Без названия",
        subtitle: r.subtitle || r.description || "",
        id: r.id,
        item: r,
      })),
      ...checklistItems.map((r) => ({
        kind: "checklist" as const,
        title: r.title || "Без названия",
        subtitle: r.subtitle || r.description || "",
        id: r.id,
        item: r,
      })),
    ];

    return results.filter((result) =>
      `${result.title} ${result.subtitle}`.toLowerCase().includes(q)
    );
  }, [globalQuery, brewBarRecipes, batchBrewRecipes, signatureTtks, pastryItems, checklistItems]);

  useEffect(() => {
    bootTelegram();
    loadAll();
  }, []);

  useEffect(() => {
    saveFolders(folders);
  }, [folders]);

  // Reset folder when switching tabs
  useEffect(() => {
    setActiveFolderId(null);
  }, [activeTab]);

  async function loadAll() {
    try {
      const [brewBar, batchBrew, signature, pastry, checklist] = await Promise.all([
        fetchBrewBarRecipes(),
        fetchBatchBrewRecipes(),
        fetchSignatureTtks(),
        fetchItems("pastry"),
        fetchItems("checklist"),
      ]);
      setBrewBarRecipes(brewBar.map(normalizeFolderId));
      setBatchBrewRecipes(batchBrew.map(normalizeFolderId));
      setSignatureTtks(signature.map(normalizeFolderId));
      setPastryItems(pastry);
      setChecklistItems(checklist);
    } catch {
      // silent fail
    }
  }

  function handleEdit(recipe: BrewBarRecipe | BatchBrewRecipe | SignatureTtk) {
    setSelectedRecipe(recipe);
    setIsEditing(true);
  }

  function handleEditItem(item: ItemResponse) {
    setSelectedItem(item);
    setIsEditingItem(true);
  }

  async function handleDelete(type: TabId, id: string) {
    if (!confirm("Удалить рецепт?")) return;
    try {
      if (type === "brew_bar") await deleteBrewBar(id);
      else if (type === "batch_brew") await deleteBatchBrew(id);
      else await deleteSignatureTtk(id);
      await loadAll();
      setSelectedRecipe(null);
    } catch {
      alert("Не удалось удалить");
    }
  }

  async function handleDeleteItem(id: string) {
    if (!confirm("Удалить?")) return;
    try {
      await deleteItem(id);
      await loadAll();
      setSelectedItem(null);
    } catch {
      alert("Не удалось удалить");
    }
  }

  function handleCreateFolder(name: string) {
    hapticImpact("light");
    const folder: RecipeFolder = {
      id: crypto.randomUUID(),
      name,
      tab: activeTab,
    };
    setFolders([...folders, folder]);
    setIsCreatingFolder(false);
  }

  function handleDeleteFolder(id: string) {
    if (!confirm("Удалить папку? Рецепты останутся в корне.")) return;
    setFolders(folders.filter((f) => f.id !== id));
    if (activeFolderId === id) setActiveFolderId(null);
  }

  // Folders for current tab
  const currentFolders = folders.filter((f) => f.tab === activeTab);

  const filteredBrewBar = brewBarRecipes.filter((r) => (r.folderId ?? null) === activeFolderId);
  const filteredBatchBrew = batchBrewRecipes.filter((r) => (r.folderId ?? null) === activeFolderId);
  const filteredSignature = signatureTtks.filter((r) => (r.folderId ?? null) === activeFolderId);
  const filteredPastry = pastryItems;
  const filteredChecklist = checklistItems;

  // FAB logic
  function handleFab() {
    hapticImpact("light");
    if (activeNav === "recipes") {
      setIsCreating(true);
    } else if (activeNav === "pastry") {
      setIsCreatingItem(true);
    } else if (activeNav === "checklist") {
      setIsCreatingItem(true);
    } else {
      alert("График смен добавим следующим этапом");
    }
  }

  // Current folder name
  const currentFolder = activeFolderId ? folders.find((f) => f.id === activeFolderId) : null;

  return (
    <div className="min-h-dvh bg-[#F0EDE4] text-coal">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#F0EDE4]/90 backdrop-blur-sm border-b border-white/50">
        <div className="max-w-lg mx-auto flex items-center justify-center h-16 px-4">
          <TrudLogo />
        </div>
      </header>

      {/* Dashboard — главная смены */}
      {activeNav === "dashboard" && (
        <div className="max-w-lg mx-auto px-4 pt-4 pb-2">
          {/* Hero + Search */}
          <h1 className="text-xl font-bold text-stone-900">Что завариваем сегодня?</h1>
          <p className="text-sm text-stone-500 mt-0.5 mb-3">Найти рецепт, ТТК, булку или чек-лист</p>
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              placeholder="Поиск..."
              value={globalQuery}
              onChange={(e) => setGlobalQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-white/70 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 border border-stone-200/60 shadow-sm transition-all duration-200 focus:bg-white focus:border-accent/40 focus:shadow-md outline-none"
            />
          </div>
          {!globalQuery && (
            <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar">
              {chips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    hapticImpact("light");
                    setActiveChip(activeChip === chip ? null : chip);
                  }}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    activeChip === chip
                      ? "bg-accent text-white shadow-sm"
                      : "bg-white/60 text-stone-600 border border-stone-200/50"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <main className="max-w-lg mx-auto pb-32 px-4 pt-4 space-y-3">
        {/* DASHBOARD */}
        {activeNav === "dashboard" && (
          <>
            {globalQuery.trim() ? (
              /* Search results */
              <div className="space-y-3">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Результаты поиска · {searchResults.length}
                </p>
                {searchResults.length === 0 && (
                  <p className="text-center text-stone-400 py-12 text-sm">Ничего не найдено</p>
                )}
                {searchResults.map((result) => {
                  const kindLabel: Record<string, string> = {
                    brew_bar: "Воронка",
                    batch_brew: "Батч-брю",
                    signature_ttk: "Авторский",
                    pastry: "Булка",
                    checklist: "Чек-лист",
                  };
                  return (
                    <button
                      key={`${result.kind}-${result.id}`}
                      onClick={() => {
                        hapticImpact("light");
                        if (result.kind === "pastry" || result.kind === "checklist") {
                          setSelectedItem(result.item as ItemResponse);
                          setActiveNav(result.kind === "pastry" ? "pastry" : "checklist");
                        } else {
                          setSelectedRecipe(result.item as any);
                        }
                      }}
                      className="w-full premium-card premium-card-interactive p-4 text-left flex items-center gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-coal">{result.title}</span>
                        <p className="text-xs text-muted mt-0.5">{result.subtitle}</p>
                      </div>
                      <span className="shrink-0 text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-1 rounded-full">
                        {kindLabel[result.kind]}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <>
                {/* Быстрый доступ */}
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Быстрый доступ</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setActiveNav("recipes")} className="premium-card premium-card-interactive p-4 text-left">
                      <Folder size={24} className="text-accent mb-1" />
                      <p className="font-bold text-coal text-sm">Рецепты</p>
                      <p className="text-[11px] text-muted mt-0.5">{brewBarRecipes.length + batchBrewRecipes.length + signatureTtks.length} шт.</p>
                    </button>
                    <button onClick={() => setActiveNav("checklist")} className="premium-card premium-card-interactive p-4 text-left">
                      <ClipboardCheck size={24} className="text-green mb-1" />
                      <p className="font-bold text-coal text-sm">Чек-листы</p>
                      <p className="text-[11px] text-muted mt-0.5">{checklistItems.length} шт.</p>
                    </button>
                    <button onClick={() => setActiveNav("pastry")} className="premium-card premium-card-interactive p-4 text-left">
                      <Croissant size={24} className="text-accent mb-1" />
                      <p className="font-bold text-coal text-sm">Булки</p>
                      <p className="text-[11px] text-muted mt-0.5">{pastryItems.length} шт.</p>
                    </button>
                    <button onClick={() => setActiveNav("reports")} className="premium-card premium-card-interactive p-4 text-left">
                      <BarChart3 size={24} className="text-slate mb-1" />
                      <p className="font-bold text-coal text-sm">Отчёты</p>
                      <p className="text-[11px] text-muted mt-0.5">Смены, списания</p>
                    </button>
                  </div>
                </div>

                {/* На смене */}
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">На смене</p>
                  <div className="space-y-2">
                    <button className="w-full premium-card premium-card-interactive p-4 text-left flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                        <Clock size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-coal text-sm">Открытие смены</p>
                        <p className="text-[11px] text-muted mt-0.5">Чек-лист открытия</p>
                      </div>
                    </button>
                    <button className="w-full premium-card premium-card-interactive p-4 text-left flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red/10 flex items-center justify-center text-red shrink-0">
                        <Clock size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-coal text-sm">Закрытие смены</p>
                        <p className="text-[11px] text-muted mt-0.5">Чек-лист закрытия</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Недавние рецепты */}
                {brewBarRecipes.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Последние рецепты</p>
                    <div className="space-y-2">
                      {brewBarRecipes.slice(0, 3).map((r) => (
                        <button
                          key={r.id}
                          onClick={() => { setSelectedRecipe(r); }}
                          className="w-full premium-card premium-card-interactive p-3 text-left flex items-center gap-3"
                        >
                          <Droplets size={18} className="text-accent shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-coal text-sm truncate">{r.lotName || "Без названия"}</p>
                            <p className="text-[11px] text-muted mt-0.5">{r.roaster} · {r.method}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* RECIPES — библиотека рецептов */}
        {activeNav === "recipes" && (
          <>
            {/* Tab rail */}
            <nav className="sticky top-16 z-30 -mx-4 px-4 pb-2">
              <div className="relative grid grid-cols-3 gap-1 rounded-2xl bg-[#556B2F]/10 p-1 border border-black/[0.03] backdrop-blur-md">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    hapticImpact("light");
                    setActiveTab(tab.id);
                  }}
                  className={`relative flex items-center justify-center h-10 rounded-xl text-sm font-bold transition-colors duration-200 ${
                    activeTab === tab.id ? "text-stone-900" : "text-stone-600/80"
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTopTabIndicator"
                      className="absolute inset-0 rounded-xl bg-white/60 backdrop-blur-sm shadow-sm border border-white/40"
                      transition={{ type: "spring", stiffness: 280, damping: 28 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
              </div>
            </nav>

            {/* Back button when inside a folder */}
            {activeFolderId && (
              <button
                onClick={() => setActiveFolderId(null)}
                className="flex items-center gap-2 text-sm font-semibold text-muted transition-colors duration-200 hover:text-coal"
              >
                <ArrowLeft size={18} />
                <span>Назад — все рецепты</span>
              </button>
            )}

            {/* Folder cards (only in root) */}
            {!activeFolderId && currentFolders.length > 0 && (
              <div className="space-y-2">
                {currentFolders.map((folder) => {
                  const count =
                    activeTab === "brew_bar"
                      ? brewBarRecipes.filter((r) => r.folderId === folder.id).length
                      : activeTab === "batch_brew"
                        ? batchBrewRecipes.filter((r) => r.folderId === folder.id).length
                        : signatureTtks.filter((r) => r.folderId === folder.id).length;
                  return (
                    <button
                      key={folder.id}
                      onClick={() => {
                        hapticImpact("light");
                        setActiveFolderId(folder.id);
                      }}
                      className="w-full premium-card premium-card-interactive p-4 text-left flex items-center gap-3"
                    >
                      <FolderOpen size={28} className="text-accent flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-coal">{folder.name}</span>
                        <p className="text-xs text-muted mt-0.5">{count} рецептов</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          hapticImpact("light");
                          handleDeleteFolder(folder.id);
                        }}
                        className="p-1 text-faint hover:text-red transition-colors duration-200"
                        aria-label="Удалить папку"
                      >
                        <X size={14} />
                      </button>
                    </button>
                  );
                })}
              </div>
            )}

            {/* "+ Папка" button (only in root) */}
            {!activeFolderId && (
              <button
                onClick={() => setIsCreatingFolder(true)}
                className="w-full bg-white border-2 border-dashed border-line rounded-2xl py-3 text-sm font-semibold text-muted flex items-center justify-center gap-2 transition-colors duration-200 hover:border-accent hover:text-accent"
              >
                <Folder size={18} />
                + Папка
              </button>
            )}

            {/* Recipes */}
            {activeTab === "brew_bar" && (
              <>
                {filteredBrewBar.length === 0 && !activeFolderId && currentFolders.length === 0 && (
                  <p className="text-center text-muted py-12 text-sm">Нет рецептов воронок</p>
                )}
                {filteredBrewBar.length === 0 && activeFolderId && (
                  <p className="text-center text-muted py-12 text-sm">В этой папке пока нет рецептов</p>
                )}
                {filteredBrewBar.map((recipe) => (
                  <BrewBarCard
                    key={recipe.id}
                    recipe={recipe}
                    onSelect={setSelectedRecipe}
                    onEdit={() => handleEdit(recipe)}
                  />
                ))}
              </>
            )}

            {activeTab === "batch_brew" && (
              <>
                {filteredBatchBrew.length === 0 && !activeFolderId && currentFolders.length === 0 && (
                  <p className="text-center text-muted py-12 text-sm">Нет рецептов батч-брю</p>
                )}
                {filteredBatchBrew.length === 0 && activeFolderId && (
                  <p className="text-center text-muted py-12 text-sm">В этой папке пока нет рецептов</p>
                )}
                {filteredBatchBrew.map((recipe) => (
                  <BatchBrewCard
                    key={recipe.id}
                    recipe={recipe}
                    onSelect={setSelectedRecipe}
                    onEdit={() => handleEdit(recipe)}
                  />
                ))}
              </>
            )}

            {activeTab === "signature_ttk" && (
              <>
                {filteredSignature.length === 0 && !activeFolderId && currentFolders.length === 0 && (
                  <p className="text-center text-muted py-12 text-sm">Нет авторских напитков</p>
                )}
                {filteredSignature.length === 0 && activeFolderId && (
                  <p className="text-center text-muted py-12 text-sm">В этой папке пока нет рецептов</p>
                )}
                {filteredSignature.map((ttk) => (
                  <SignatureTtkCard
                    key={ttk.id}
                    ttk={ttk}
                    onSelect={setSelectedRecipe}
                    onEdit={() => handleEdit(ttk)}
                  />
                ))}
              </>
            )}
          </>
        )}

        {activeNav === "pastry" && (
          <>
            {filteredPastry.length === 0 && (
              <p className="text-center text-muted py-12 text-sm">Нет булок</p>
            )}
            {filteredPastry.map((item) => (
              <PastryCard
                key={item.id}
                item={item}
                onSelect={setSelectedItem}
                onEdit={() => handleEditItem(item)}
              />
            ))}
          </>
        )}

        {activeNav === "checklist" && (
          <>
            {filteredChecklist.length === 0 && (
              <p className="text-center text-muted py-12 text-sm">Нет чек-листов</p>
            )}
            {filteredChecklist.map((item) => (
              <ChecklistCard
                key={item.id}
                item={item}
                onSelect={setSelectedItem}
                onEdit={() => handleEditItem(item)}
              />
            ))}
          </>
        )}

        {activeNav === "reports" && (
          <div className="space-y-3 pt-2">
            <AdminCard icon={CalendarDays} title="График смен" value="Смены и ответственные" />
            <AdminCard icon={ShieldCheck} title="Роли" value="Бариста, старшие, шефы, маркетинг" />
            <AdminCard icon={BarChart3} title="Журналы" value="Отчеты, списания, контроль" />
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bottom-nav-safe pointer-events-none">
        <div className="max-w-lg mx-auto px-3 pb-2">
          <div className="bottom-dock pointer-events-auto grid grid-cols-[1fr_1fr_88px_1fr_1fr] items-center gap-1">
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  hapticImpact("light");
                  setActiveNav(item.id);
                }}
                className={`relative flex flex-col items-center justify-center h-14 gap-0.5 rounded-2xl text-xs font-semibold transition-colors duration-200 ${
                  isActive ? "text-green" : "text-muted"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeBottomNavIndicator"
                    className="absolute inset-0 rounded-2xl bg-white/40 backdrop-blur-md border border-white/30 shadow-inner"
                    transition={{ type: "spring", stiffness: 280, damping: 28 }}
                  />
                )}
                <Icon size={22} className="relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={handleFab}
            className="bottom-action"
            aria-label="Добавить"
          >
            <span className="bottom-action-icon">
              <Plus size={20} />
            </span>
            <span className="bottom-action-label">
              {activeNav === "recipes" ? "Рецепт" : activeNav === "pastry" ? "Булка" : activeNav === "checklist" ? "Пункт" : "План"}
            </span>
          </button>
          {navItems.slice(2).map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  hapticImpact("light");
                  setActiveNav(item.id);
                }}
                className={`relative flex flex-col items-center justify-center h-14 gap-0.5 rounded-2xl text-xs font-semibold transition-colors duration-200 ${
                  isActive ? "text-green" : "text-muted"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeBottomNavIndicator"
                    className="absolute inset-0 rounded-2xl bg-white/40 backdrop-blur-md border border-white/30 shadow-inner"
                    transition={{ type: "spring", stiffness: 280, damping: 28 }}
                  />
                )}
                <Icon size={22} className="relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
          </div>
        </div>
      </nav>

      {/* Create Folder Modal */}
      {isCreatingFolder && (
        <CreateFolderModal
          onClose={() => setIsCreatingFolder(false)}
          onCreate={handleCreateFolder}
        />
      )}

      {/* Detail Modal */}
      {selectedRecipe && !isEditing && (
        <DetailModal
          recipe={selectedRecipe}
          type={activeTab}
          onClose={() => setSelectedRecipe(null)}
          onEdit={() => setIsEditing(true)}
          onDelete={() => handleDelete(activeTab, selectedRecipe.id)}
        />
      )}

      {/* Item Detail Modal */}
      {selectedItem && !isEditingItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onEdit={() => setIsEditingItem(true)}
          onDelete={() => handleDeleteItem(selectedItem.id)}
        />
      )}

      {/* Create/Edit Recipe Modal */}
      {(isCreating || isEditing) && (
        <RecipeFormModal
          type={activeTab}
          folders={currentFolders}
          initial={isEditing ? selectedRecipe : null}
          onDelete={
            isEditing && selectedRecipe
              ? async () => {
                  await handleDelete(activeTab, selectedRecipe.id);
                  setIsEditing(false);
                }
              : undefined
          }
          onClose={() => {
            setIsCreating(false);
            setIsEditing(false);
            setSelectedRecipe(null);
          }}
          onSave={async (data) => {
            try {
              if (isEditing && selectedRecipe) {
                if (activeTab === "brew_bar") await updateBrewBar(selectedRecipe.id, data as any);
                else if (activeTab === "batch_brew") await updateBatchBrew(selectedRecipe.id, data as any);
                else await updateSignatureTtk(selectedRecipe.id, data as any);
              } else {
                if (activeTab === "brew_bar") await createBrewBar(data as any);
                else if (activeTab === "batch_brew") await createBatchBrew(data as any);
                else await createSignatureTtk(data as any);
              }
              hapticSuccess();
              await loadAll();
              setIsCreating(false);
              setIsEditing(false);
              setSelectedRecipe(null);
            } catch {
              alert("Ошибка сохранения");
            }
          }}
        />
      )}

      {/* Create/Edit Item Modal */}
      {(isCreatingItem || isEditingItem) && (
        <ItemFormModal
          category={activeNav === "pastry" ? "pastry" : "checklist"}
          initial={isEditingItem ? selectedItem : null}
          onDelete={
            isEditingItem && selectedItem
              ? async () => {
                  await handleDeleteItem(selectedItem.id);
                  setIsEditingItem(false);
                }
              : undefined
          }
          onClose={() => {
            setIsCreatingItem(false);
            setIsEditingItem(false);
            setSelectedItem(null);
          }}
          onSave={async (data) => {
            try {
              if (isEditingItem && selectedItem) {
                await updateItem(selectedItem.id, data as any);
              } else {
                await createItem(data as any);
              }
              hapticSuccess();
              await loadAll();
              setIsCreatingItem(false);
              setIsEditingItem(false);
              setSelectedItem(null);
            } catch {
              alert("Ошибка сохранения");
            }
          }}
        />
      )}
    </div>
  );
}

// === Create Folder Modal ===
function CreateFolderModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-end justify-center" onClick={onClose}>
      <form
        className="bg-white rounded-t-2xl w-full max-w-lg sheet-animate"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-4 h-14 border-b border-line">
          <button type="button" onClick={onClose} className="p-2 text-muted transition-colors duration-200">
            <X size={22} />
          </button>
          <h2 className="font-bold text-lg">Новая папка</h2>
          <div className="w-10" />
        </div>
        <div className="p-4 space-y-4">
          <label className="block">
            <span className="text-xs font-bold text-muted uppercase block mb-1">Название папки</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Infuse, Пуровер"
              className="w-full px-3 py-2 bg-linen rounded-xl text-sm transition-all duration-200"
              autoFocus
            />
          </label>
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full h-12 bg-accent text-white rounded-xl font-bold text-base disabled:opacity-50 transition-all duration-200 active:scale-[0.98]"
          >
            Создать
          </button>
        </div>
      </form>
    </div>
  );
}

// === Brew Bar Card ===
function BrewBarCard({
  recipe,
  onSelect,
  onEdit,
}: {
  recipe: BrewBarRecipe;
  onSelect: (r: BrewBarRecipe) => void;
  onEdit: () => void;
}) {
  return (
    <button
      onClick={() => onSelect(recipe)}
      className="w-full premium-card premium-card-interactive p-4 text-left"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-lg text-coal truncate">{recipe.lotName}</h3>
          <p className="text-sm text-muted mt-0.5">
            {recipe.roaster}{recipe.origin ? ` · ${recipe.origin}` : ""} · {recipe.method.toUpperCase()}
          </p>
          <p className="text-xs text-muted mt-0.5">
            {recipe.grinder && `${recipe.grinder} · `}{recipe.grindClicks}{recipe.temperature ? ` · ${recipe.temperature}°C` : ""}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="ml-2 p-2 text-muted hover:text-accent flex-shrink-0 transition-colors duration-200"
          aria-label="Редактировать"
        >
          <Pencil size={16} />
        </button>
      </div>
      <div className="flex gap-4 mt-3 text-sm text-muted">
        <span className="flex items-center gap-1">
          <Weight size={14} /> {recipe.coffeeWeightG} г
        </span>
        <span className="flex items-center gap-1">
          <Droplets size={14} /> {recipe.waterVolumeMl} мл
        </span>
        <span className="flex items-center gap-1">
          <Clock size={14} /> {recipe.steps.length} шагов
        </span>
      </div>
    </button>
  );
}

// === Batch Brew Card ===
function BatchBrewCard({
  recipe,
  onSelect,
  onEdit,
}: {
  recipe: BatchBrewRecipe;
  onSelect: (r: BatchBrewRecipe) => void;
  onEdit: () => void;
}) {
  return (
    <button
      onClick={() => onSelect(recipe)}
      className="w-full premium-card premium-card-interactive p-4 text-left"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-lg text-coal truncate">{recipe.lotName}</h3>
          <p className="text-sm text-muted mt-0.5">{recipe.roaster}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="ml-2 p-2 text-muted hover:text-accent flex-shrink-0 transition-colors duration-200"
          aria-label="Редактировать"
        >
          <Pencil size={16} />
        </button>
      </div>
      <div className="flex gap-4 mt-3 text-sm text-muted flex-wrap">
        <span>{recipe.coffeeDoseG} г · {recipe.grindClicks}</span>
        <span className="text-coal font-semibold">{recipe.waterVolumeMl} мл</span>
        <span className="text-accent font-semibold">{recipe.brewerProgram}</span>
      </div>
    </button>
  );
}

// === Signature TTK Card ===
function SignatureTtkCard({
  ttk,
  onSelect,
  onEdit,
}: {
  ttk: SignatureTtk;
  onSelect: (r: SignatureTtk) => void;
  onEdit: () => void;
}) {
  return (
    <button
      onClick={() => onSelect(ttk)}
      className="w-full premium-card premium-card-interactive overflow-hidden text-left"
    >
      {ttk.imageUrl && (
        <img
          src={ttk.imageUrl}
          alt=""
          className="w-full aspect-[4/3] object-cover border-b border-black/[0.06]"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-lg text-coal">{ttk.drinkName}</h3>
            <p className="text-sm text-muted mt-0.5">
              {ttk.category === "hot" ? "Горячий" : "Холодный"} · {ttk.servingVolumeMl} мл · {ttk.vessel}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="ml-2 p-2 text-muted hover:text-accent flex-shrink-0 transition-colors duration-200"
            aria-label="Редактировать"
          >
            <Pencil size={16} />
          </button>
        </div>
        <div className="mt-3 text-sm text-muted">
          {ttk.ingredients.length} ингредиентов · Посуда: {ttk.vessel}
        </div>
      </div>
    </button>
  );
}

// === Pastry Card ===
function PastryCard({
  item,
  onSelect,
  onEdit,
}: {
  item: ItemResponse;
  onSelect: (r: ItemResponse) => void;
  onEdit: () => void;
}) {
  return (
    <button
      onClick={() => onSelect(item)}
      className="w-full premium-card premium-card-interactive overflow-hidden text-left"
    >
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt=""
          className="w-full aspect-[4/3] object-cover border-b border-black/[0.06]"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-lg text-coal">{item.title}</h3>
            {item.subtitle && <p className="text-sm text-muted mt-0.5">{item.subtitle}</p>}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="ml-2 p-2 text-muted hover:text-accent flex-shrink-0 transition-colors duration-200"
            aria-label="Редактировать"
          >
            <Pencil size={16} />
          </button>
        </div>
        {item.price != null && (
          <div className="mt-2">
            <span className="text-lg font-bold text-coal">{item.price} ₽</span>
          </div>
        )}
        {item.description && (
          <p className="mt-1 text-sm text-muted line-clamp-2">{item.description}</p>
        )}
        {(item.composition || item.shelfLife) && (
          <p className="mt-2 text-xs text-muted">
            {item.shelfLife ? `Витрина: ${item.shelfLife}` : "Состав указан в карточке"}
          </p>
        )}
      </div>
    </button>
  );
}

// === Checklist Card ===
function ChecklistCard({
  item,
  onSelect,
  onEdit,
}: {
  item: ItemResponse;
  onSelect: (r: ItemResponse) => void;
  onEdit: () => void;
}) {
  return (
    <button
      onClick={() => onSelect(item)}
      className="w-full premium-card premium-card-interactive p-4 text-left"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-lg text-coal">{item.title}</h3>
          {item.subtitle && <p className="text-sm text-muted mt-0.5">{item.subtitle}</p>}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="ml-2 p-2 text-muted hover:text-accent flex-shrink-0 transition-colors duration-200"
          aria-label="Редактировать"
        >
          <Pencil size={16} />
        </button>
      </div>
      {item.description && (
        <p className="mt-2 text-sm text-muted">{item.description}</p>
      )}
      {item.steps.length > 0 && (
        <p className="mt-2 text-xs text-muted">{item.steps.length} пунктов</p>
      )}
    </button>
  );
}

function AdminCard({
  icon: Icon,
  title,
  value,
}: {
  icon: typeof Home;
  title: string;
  value: string;
}) {
  return (
    <button
      type="button"
      className="w-full premium-card premium-card-interactive p-4 text-left flex items-center gap-3"
    >
      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-linen text-green">
        <Icon size={21} />
      </span>
      <span className="min-w-0">
        <span className="block font-bold text-coal">{title}</span>
        <span className="block text-sm text-muted mt-0.5">{value}</span>
      </span>
    </button>
  );
}

// === Detail Modal ===
function DetailModal({
  recipe,
  type,
  onClose,
  onEdit,
  onDelete,
}: {
  recipe: BrewBarRecipe | BatchBrewRecipe | SignatureTtk;
  type: TabId;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl w-full max-w-lg max-h-[85dvh] overflow-y-auto sheet-animate"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-4 h-14 border-b border-line">
          <button onClick={onClose} className="p-2 text-muted transition-colors duration-200" aria-label="Закрыть">
            <X size={22} />
          </button>
          <div className="flex gap-2">
            <button onClick={onEdit} className="p-2 text-accent transition-colors duration-200" aria-label="Редактировать">
              <Pencil size={20} />
            </button>
            <button onClick={onDelete} className="p-2 text-red transition-colors duration-200" aria-label="Удалить">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4">
          {type === "brew_bar" && <BrewBarDetail recipe={recipe as BrewBarRecipe} />}
          {type === "batch_brew" && <BatchBrewDetail recipe={recipe as BatchBrewRecipe} />}
          {type === "signature_ttk" && <SignatureTtkDetail ttk={recipe as SignatureTtk} />}
        </div>
      </div>
    </div>
  );
}

function BrewBarDetail({ recipe }: { recipe: BrewBarRecipe }) {
  return (
    <div>
      <h2 className="text-2xl font-black text-coal">{recipe.lotName}</h2>
      <p className="text-muted text-sm mt-1">
        {recipe.roaster}{recipe.origin ? ` · ${recipe.origin}` : ""}
      </p>
      {recipe.processing && (
        <p className="text-muted text-xs mt-0.5">{recipe.processing}</p>
      )}
      <div className="flex flex-wrap gap-2 mt-3 text-sm">
        <span className="bg-linen px-3 py-1 rounded-full font-semibold">{recipe.coffeeWeightG} г кофе</span>
        <span className="bg-linen px-3 py-1 rounded-full font-semibold">{recipe.waterVolumeMl} мл воды</span>
        {recipe.temperature && <span className="bg-linen px-3 py-1 rounded-full font-semibold">{recipe.temperature}°C</span>}
        {recipe.waterPpm && <span className="bg-linen px-3 py-1 rounded-full font-semibold">{recipe.waterPpm} ppm</span>}
      </div>
      <p className="text-xs text-muted mt-2">
        {recipe.method.toUpperCase()}{recipe.grinder ? ` · ${recipe.grinder}` : ""}{recipe.grindClicks ? ` · ${recipe.grindClicks}` : ""}
      </p>
      {recipe.cupDescription && (
        <div className="mt-4 p-3 bg-linen rounded-xl text-sm">
          <span className="font-bold text-xs text-muted uppercase">Описание чашки</span>
          <p className="mt-1">{recipe.cupDescription}</p>
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-bold text-sm text-muted uppercase tracking-wider mb-3">Схема проливов</h3>

        <div className="bg-linen rounded-xl p-3">
          <div className="step-row font-bold text-xs text-muted uppercase">
            <span>Время</span>
            <span>Стадия</span>
            <span className="text-right">Вода</span>
            <span className="text-right">Вес</span>
          </div>
          {recipe.steps.map((step, i) => (
            <div key={i}>
              <div className="step-row">
                <span className="text-muted font-mono">{step.startTime}</span>
                <span className="font-medium">{step.stageName}</span>
                <span className="text-right font-mono">{step.pourVolumeMl || "—"}</span>
                <span className="text-right font-mono">{step.targetWeightG || "—"}</span>
              </div>
              {step.comment && (
                <p className="text-xs text-muted italic pl-1 pb-1">{step.comment}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {recipe.notes && (
        <p className="mt-4 text-sm text-muted italic">{recipe.notes}</p>
      )}
    </div>
  );
}

function BatchBrewDetail({ recipe }: { recipe: BatchBrewRecipe }) {
  return (
    <div>
      <h2 className="text-2xl font-black text-coal">{recipe.lotName}</h2>
      <p className="text-muted text-sm mt-1">{recipe.roaster}</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-linen rounded-xl p-3">
          <span className="text-xs text-muted uppercase font-bold">Программа</span>
          <p className="text-lg font-bold mt-1">{recipe.brewerProgram}</p>
        </div>
        <div className="bg-linen rounded-xl p-3">
          <span className="text-xs text-muted uppercase font-bold">Закладка</span>
          <p className="text-lg font-bold mt-1">{recipe.coffeeDoseG} г</p>
        </div>
        <div className="bg-linen rounded-xl p-3">
          <span className="text-xs text-muted uppercase font-bold">Помол</span>
          <p className="text-lg font-bold mt-1">{recipe.grindClicks || "—"}</p>
        </div>
        <div className="bg-linen rounded-xl p-3">
          <span className="text-xs text-muted uppercase font-bold">Выход</span>
          <p className="text-lg font-bold mt-1">{recipe.waterVolumeMl} мл</p>
        </div>
      </div>

      {recipe.notes && (
        <div className="mt-4">
          <h3 className="font-bold text-sm text-muted uppercase tracking-wider mb-1">Описание вкуса</h3>
          <p className="text-sm text-muted italic">{recipe.notes}</p>
        </div>
      )}
    </div>
  );
}

function SignatureTtkDetail({ ttk }: { ttk: SignatureTtk }) {
  return (
    <div>
      {ttk.imageUrl && (
        <img
          src={ttk.imageUrl}
          alt=""
          className="w-full aspect-[4/3] object-cover photo-frame mb-4"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}

      <h2 className="text-2xl font-black text-coal">{ttk.drinkName}</h2>
      <p className="text-muted text-sm mt-1">
        {ttk.category === "hot" ? "Горячий" : "Холодный"} · {ttk.servingVolumeMl} мл · {ttk.vessel}
      </p>

      <div className="mt-6">
        <h3 className="font-bold text-sm text-muted uppercase tracking-wider mb-3">Ингредиенты</h3>
        <div className="bg-linen rounded-xl p-3">
          {ttk.ingredients.map((ing, i) => (
            <div key={i} className="ingredient-row">
              <span className="font-medium">{ing.ingredientName}</span>
              <span className="font-mono font-semibold text-right">{ing.exactAmount}</span>
            </div>
          ))}
        </div>
      </div>

      {ttk.serviceSteps.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold text-sm text-muted uppercase tracking-wider mb-3">Приготовление</h3>
          <ol className="space-y-2">
            {ttk.serviceSteps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="font-bold text-accent flex-shrink-0 w-5">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {ttk.allergensAndComposition && (
        <div className="mt-4 p-3 bg-linen rounded-xl text-sm">
          <span className="font-bold text-xs text-muted uppercase">Состав и аллергены</span>
          <p className="mt-1">{ttk.allergensAndComposition}</p>
        </div>
      )}

      {ttk.storageConditions && (
        <div className="mt-2 p-3 bg-linen rounded-xl text-sm">
          <span className="font-bold text-xs text-muted uppercase">Условия хранения</span>
          <p className="mt-1">{ttk.storageConditions}</p>
        </div>
      )}

      {ttk.notes && (
        <p className="mt-4 text-sm text-muted italic">{ttk.notes}</p>
      )}
    </div>
  );
}

// === Item Detail Modal ===
function ItemDetailModal({
  item,
  onClose,
  onEdit,
  onDelete,
}: {
  item: ItemResponse;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl w-full max-w-lg max-h-[85dvh] overflow-y-auto sheet-animate"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-4 h-14 border-b border-line">
          <button onClick={onClose} className="p-2 text-muted transition-colors duration-200" aria-label="Закрыть">
            <X size={22} />
          </button>
          <div className="flex gap-2">
            <button onClick={onEdit} className="p-2 text-accent transition-colors duration-200" aria-label="Редактировать">
              <Pencil size={20} />
            </button>
            <button onClick={onDelete} className="p-2 text-red transition-colors duration-200" aria-label="Удалить">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4">
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt=""
              className="w-full aspect-[4/3] object-cover photo-frame mb-4"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <h2 className="text-2xl font-black text-coal">{item.title}</h2>
          {item.subtitle && <p className="text-muted text-sm mt-1">{item.subtitle}</p>}
          {item.price != null && (
            <p className="text-lg font-bold text-coal mt-2">{item.price} ₽</p>
          )}
          {item.description && (
            <p className="mt-3 text-sm text-muted">{item.description}</p>
          )}
          {item.composition && (
            <div className="mt-4 p-3 bg-linen rounded-xl text-sm">
              <span className="font-bold text-xs text-muted uppercase">Состав</span>
              <p className="mt-1">{item.composition}</p>
            </div>
          )}
          {item.shelfLife && (
            <div className="mt-2 p-3 bg-linen rounded-xl text-sm">
              <span className="font-bold text-xs text-muted uppercase">Срок на витрине</span>
              <p className="mt-1">{item.shelfLife}</p>
            </div>
          )}

          {item.specs.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {item.specs.map((spec, i) => (
                <div key={i} className="bg-linen rounded-xl p-3">
                  <span className="text-xs text-muted uppercase font-bold">{spec.label}</span>
                  <p className="font-semibold mt-1">{spec.value}</p>
                </div>
              ))}
            </div>
          )}

          {item.steps.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold text-sm text-muted uppercase tracking-wider mb-2">Шаги</h3>
              <ol className="space-y-2">
                {item.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="font-bold text-accent flex-shrink-0 w-5">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// === Recipe Form Modal ===
function RecipeFormModal({
  type,
  folders,
  initial,
  onClose,
  onDelete,
  onSave,
}: {
  type: TabId;
  folders: RecipeFolder[];
  initial: any | null;
  onClose: () => void;
  onDelete?: () => Promise<void> | void;
  onSave: (data: any) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  // Folder selection
  const [folderId, setFolderId] = useState<string | null>(initial?.folderId ?? null);

  // Brew Bar form
  const [lotName, setLotName] = useState(initial?.lotName ?? "");
  const [roaster, setRoaster] = useState(initial?.roaster ?? "");
  const [origin, setOrigin] = useState(initial?.origin ?? "");
  const [processing, setProcessing] = useState(initial?.processing ?? "");
  const [method, setMethod] = useState(initial?.method ?? "v60");
  const [grinder, setGrinder] = useState(initial?.grinder ?? "");
  const [grindClicks, setGrindClicks] = useState(initial?.grindClicks ?? "");
  const [coffeeWeightG, setCoffeeWeightG] = useState(initial?.coffeeWeightG ?? 15);
  const [waterVolumeMl, setWaterVolumeMl] = useState(initial?.waterVolumeMl ?? 250);
  const [temperature, setTemperature] = useState(initial?.temperature ?? "");
  const [waterPpm, setWaterPpm] = useState(initial?.waterPpm ?? "");
  const [cupDescription, setCupDescription] = useState(initial?.cupDescription ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  // Batch Brew extra
  const [coffeeDoseG, setCoffeeDoseG] = useState(initial?.coffeeDoseG ?? 60);
  const [brewerProgram, setBrewerProgram] = useState(initial?.brewerProgram ?? "");

  // Signature TTK extra
  const [drinkName, setDrinkName] = useState(initial?.drinkName ?? "");
  const [category, setCategory] = useState(initial?.category ?? "hot");
  const [servingVolumeMl, setServingVolumeMl] = useState(initial?.servingVolumeMl ?? 240);
  const [vessel, setVessel] = useState(initial?.vessel ?? "");
  const [photoSource, setPhotoSource] = useState(initial?.imageUrl ?? "");
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Dynamic ingredients (reverse mapping from backend)
  const [ingredients, setIngredients] = useState<{ name: string; amount: string }[]>(
    initial?.ingredients?.map((i: Ingredient) => ({ name: i.ingredientName, amount: i.exactAmount })) ?? []
  );

  // Dynamic service steps (reverse mapping from backend)
  const [serviceSteps, setServiceSteps] = useState<string[]>(initial?.serviceSteps ?? []);

  const [allergens, setAllergens] = useState(initial?.allergensAndComposition ?? "");
  const [storage, setStorage] = useState(initial?.storageConditions ?? "");

  // Brew Bar steps
  const [steps, setSteps] = useState<BrewBarStep[]>(initial?.steps ?? []);

  async function handlePhotoUpload(file: File) {
    setPhotoSource(await readFileAsDataUrl(file));
    setCroppedAreaPixels(null);
  }

  function addIngredient() {
    setIngredients([...ingredients, { name: "", amount: "" }]);
  }

  function updateIngredient(i: number, field: "name" | "amount", value: string) {
    const updated = [...ingredients];
    updated[i][field] = value;
    setIngredients(updated);
  }

  function removeIngredient(i: number) {
    setIngredients(ingredients.filter((_, idx) => idx !== i));
  }

  function addServiceStep() {
    setServiceSteps([...serviceSteps, ""]);
  }

  function updateServiceStep(i: number, value: string) {
    const updated = [...serviceSteps];
    updated[i] = value;
    setServiceSteps(updated);
  }

  function removeServiceStep(i: number) {
    setServiceSteps(serviceSteps.filter((_, idx) => idx !== i));
  }

  function addStep() {
    setSteps([...steps, { startTime: "0:00", stageName: "", pourVolumeMl: 0, targetWeightG: 0, comment: "" }]);
  }

  function updateStep(i: number, field: keyof BrewBarStep, value: string | number) {
    const updated = [...steps];
    (updated[i] as any)[field] = value;
    setSteps(updated);
  }

  // Smart time input: auto-insert colon after minutes
  function handleTimeChange(i: number, raw: string) {
    // Remove all non-digit characters
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 0) {
      updateStep(i, "startTime", "");
      return;
    }
    // Format as M:SS or MM:SS
    let formatted: string;
    if (digits.length <= 1) {
      formatted = `0:0${digits}`;
    } else if (digits.length === 2) {
      formatted = `0:${digits}`;
    } else if (digits.length === 3) {
      formatted = `${digits[0]}:${digits.slice(1)}`;
    } else {
      formatted = `${digits.slice(0, -2)}:${digits.slice(-2)}`;
    }
    updateStep(i, "startTime", formatted);
  }

  function removeStep(i: number) {
    setSteps(steps.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (type === "brew_bar") {
        await onSave({
          folderId,
          lotName, roaster, origin, processing,
          method, grinder, grindClicks,
          coffeeWeightG, waterVolumeMl,
          temperature: temperature !== "" ? Number(temperature) : null,
          waterPpm: waterPpm !== "" ? Number(waterPpm) : null,
          steps, cupDescription, notes,
        });
      } else if (type === "batch_brew") {
        await onSave({
          folderId,
          lotName, roaster,
          brewerProgram, coffeeDoseG,
          grindClicks, waterVolumeMl,
          notes,
        });
      } else {
        const mappedIngredients = ingredients
          .filter((ing) => ing.name && ing.amount)
          .map((ing) => ({ ingredientName: ing.name, exactAmount: ing.amount }));
        const mappedSteps = serviceSteps.filter(Boolean);
        await onSave({
          folderId,
          drinkName, category, servingVolumeMl, vessel,
          imageUrl:
            photoSource && (photoSource !== initial?.imageUrl || croppedAreaPixels)
              ? await cropPhotoToCard(photoSource, croppedAreaPixels!)
              : initial?.imageUrl || "",
          ingredients: mappedIngredients,
          serviceSteps: mappedSteps,
          allergensAndComposition: allergens,
          storageConditions: storage,
          notes,
        });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-end justify-center" onClick={onClose}>
      <form
        className="bg-white rounded-t-2xl w-full max-w-lg max-h-[85dvh] overflow-y-auto sheet-animate"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-4 h-14 border-b border-line">
          <button type="button" onClick={onClose} className="p-2 text-muted transition-colors duration-200">
            <X size={22} />
          </button>
          <h2 className="font-bold text-lg">
            {initial ? "Редактировать" : "Новый рецепт"}
          </h2>
          <div className="w-10" />
        </div>

        <div className="p-4 space-y-4">
          {/* Folder selector */}
          {folders.length > 0 && (
            <Select
              label="Папка (категория)"
              value={folderId ?? ""}
              onChange={(v) => setFolderId(v || null)}
              options={[
                { value: "", label: "Без папки (в корень)" },
                ...folders.map((f) => ({ value: f.id, label: f.name })),
              ]}
            />
          )}

          {/* Common fields */}
          {type !== "signature_ttk" && (
            <>
              <Field label="Название лота" value={lotName} onChange={setLotName} required />
              <Field label="Обжарщик" value={roaster} onChange={setRoaster} />
            </>
          )}

          {type === "signature_ttk" && (
            <>
              <Field label="Название напитка" value={drinkName} onChange={setDrinkName} required />
              <Select
                label="Категория"
                value={category}
                onChange={setCategory}
                options={[
                  { value: "hot", label: "Горячий" },
                  { value: "cold", label: "Холодный" },
                ]}
              />
              <Field label="Объем подачи (мл)" type="number" value={servingVolumeMl} onChange={setServingVolumeMl} />
              <Field label="Посуда" value={vessel} onChange={setVessel} />

              {/* Dynamic ingredients */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted uppercase">Ингредиенты</span>
                </div>
                {ingredients.map((ing, i) => (
                  <div key={i} className="flex gap-2 items-center mb-2">
                    <input
                      className="flex-1 px-3 py-2 bg-linen rounded-xl text-sm"
                      placeholder="Название"
                      value={ing.name}
                      onChange={(e) => updateIngredient(i, "name", e.target.value)}
                    />
                    <input
                      className="w-24 px-3 py-2 bg-linen rounded-xl text-sm text-right"
                      placeholder="г/мл"
                      value={ing.amount}
                      onChange={(e) => updateIngredient(i, "amount", e.target.value)}
                    />
                    <button type="button" onClick={() => removeIngredient(i)} className="p-2 text-red flex-shrink-0">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addIngredient}
                  className="w-full bg-linen rounded-xl py-2 text-sm font-semibold text-accent transition-colors duration-200 hover:bg-line"
                >
                  + Добавить ингредиент
                </button>
              </div>

              {/* Dynamic service steps */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted uppercase">Технология</span>
                </div>
                {serviceSteps.map((step, i) => (
                  <div key={i} className="flex gap-2 items-center mb-2">
                    <span className="font-bold text-accent w-6 text-sm flex-shrink-0">{i + 1}.</span>
                    <input
                      className="flex-1 px-3 py-2 bg-linen rounded-xl text-sm"
                      placeholder="Шаг технологии"
                      value={step}
                      onChange={(e) => updateServiceStep(i, e.target.value)}
                    />
                    <button type="button" onClick={() => removeServiceStep(i)} className="p-2 text-red flex-shrink-0">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addServiceStep}
                  className="w-full bg-linen rounded-xl py-2 text-sm font-semibold text-accent transition-colors duration-200 hover:bg-line"
                >
                  + Добавить шаг технологии
                </button>
              </div>

              <PhotoCropEditor
                id="photo-upload"
                label="Фото подачи"
                source={photoSource}
                emptyText="Нажмите, чтобы загрузить фото подачи"
                onFileSelected={handlePhotoUpload}
                onCropComplete={setCroppedAreaPixels}
              />
            </>
          )}

          {type === "brew_bar" && (
            <>
              {/* Блок: Профиль зерна */}
              <div className="premium-card p-4 space-y-3">
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Профиль зерна</h3>
                <Field label="Название лота" value={lotName} onChange={setLotName} required />
                <Field label="Обжарщик" value={roaster} onChange={setRoaster} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Сорт / Регион" value={origin} onChange={setOrigin} />
                  <Field label="Обработка" value={processing} onChange={setProcessing} />
                </div>
              </div>

              {/* Блок: Параметры пуровера */}
              <div className="premium-card p-4 space-y-3">
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Параметры пуровера</h3>
                <Select
                  label="Тип воронки"
                  value={method}
                  onChange={setMethod}
                  options={[
                    { value: "v60", label: "V60" },
                    { value: "switch", label: "Switch" },
                    { value: "orea", label: "Orea" },
                  ]}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Кофемолка" value={grinder} onChange={setGrinder} />
                  <Field label="Помол" value={grindClicks} onChange={setGrindClicks} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Кофе (гр)" type="number" value={coffeeWeightG} onChange={setCoffeeWeightG} />
                  <Field label="Вода (мл)" type="number" value={waterVolumeMl} onChange={setWaterVolumeMl} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Температура (°C)" type="number" value={temperature} onChange={setTemperature} />
                  <Field label="Вода (ppm)" type="number" value={waterPpm} onChange={setWaterPpm} />
                </div>
                <Field label="Описание чашки" value={cupDescription} onChange={setCupDescription} placeholder="Например: жасмин, лайм, медовая сладость" />
              </div>

              {/* Блок: Схема проливов */}
              <div className="premium-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Схема проливов</h3>
                  <button
                    type="button"
                    onClick={addStep}
                    className="text-xs font-semibold text-accent transition-colors duration-200 hover:text-accent/80"
                  >
                    + Добавить шаг
                  </button>
                </div>
                {steps.map((step, i) => (
                  <div key={i} className="pb-2 border-b border-line last:border-b-0">
                    <div className="flex items-center gap-2">
                      <input
                        className="w-[60px] px-2 py-1.5 bg-linen rounded-lg text-sm font-mono text-center"
                        placeholder="0:00"
                        value={step.startTime}
                        onChange={(e) => handleTimeChange(i, e.target.value)}
                      />
                      <input
                        className="w-[60px] px-2 py-1.5 bg-linen rounded-lg text-sm font-mono text-center"
                        placeholder="мл"
                        type="number"
                        value={step.pourVolumeMl || ""}
                        onChange={(e) => updateStep(i, "pourVolumeMl", Number(e.target.value))}
                      />
                      <input
                        className="w-[60px] px-2 py-1.5 bg-linen rounded-lg text-sm font-mono text-center"
                        placeholder="вес"
                        type="number"
                        value={step.targetWeightG || ""}
                        onChange={(e) => updateStep(i, "targetWeightG", Number(e.target.value))}
                      />
                      <select
                        className="min-w-0 flex-1 px-2 py-1.5 bg-linen rounded-lg text-sm"
                        value={step.stageName}
                        onChange={(e) => updateStep(i, "stageName", e.target.value)}
                        title="Стадия"
                      >
                        <option value="">Стадия</option>
                        <option value="Блум">Блум</option>
                        <option value="Вливание">Вливание</option>
                      </select>
                      <button type="button" onClick={() => removeStep(i)} className="p-1.5 text-red flex-shrink-0" title="Удалить шаг">
                        <X size={16} />
                      </button>
                    </div>
                    <input
                      className="w-full mt-1 px-2 py-1 text-xs text-muted bg-transparent border-b border-line"
                      placeholder="Комментарий к шагу (необязательно)"
                      value={step.comment}
                      onChange={(e) => updateStep(i, "comment", e.target.value)}
                    />
                  </div>
                ))}
                {steps.length === 0 && (
                  <p className="text-xs text-muted text-center py-2">Нет шагов. Нажмите «+ Добавить шаг»</p>
                )}
              </div>
            </>
          )}

          {type === "batch_brew" && (
            <>
              <div className="premium-card p-4 space-y-3">
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Параметры батч-брю</h3>
                <Field label="Название лота" value={lotName} onChange={setLotName} required />
                <Field label="Обжарщик" value={roaster} onChange={setRoaster} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Программа автомата" value={brewerProgram} onChange={setBrewerProgram} />
                  <Field label="Закладка кофе (гр)" type="number" value={coffeeDoseG} onChange={setCoffeeDoseG} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Помол" value={grindClicks} onChange={setGrindClicks} />
                  <Field label="Выход (мл)" type="number" value={waterVolumeMl} onChange={setWaterVolumeMl} />
                </div>
                <Field label="Заметки / Описание вкуса" value={notes} onChange={setNotes} />
              </div>
            </>
          )}

          {type === "signature_ttk" && (
            <>
              <Field label="Состав и аллергены" value={allergens} onChange={setAllergens} />
              <Field label="Условия хранения" value={storage} onChange={setStorage} />
            </>
          )}

          {type !== "batch_brew" && <Field label="Заметки" value={notes} onChange={setNotes} />}

          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 bg-accent text-white rounded-xl font-bold text-base disabled:opacity-50 transition-all duration-200 active:scale-[0.98]"
          >
            {saving ? "Сохранение..." : initial ? "Сохранить изменения" : "Создать"}
          </button>

          {/* Delete button in edit mode */}
          {initial && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="w-full h-12 bg-red/10 text-red rounded-xl font-bold text-base transition-all duration-200 active:scale-[0.98]"
            >
              Удалить рецепт
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// === Item Form Modal ===
function ItemFormModal({
  category,
  initial,
  onClose,
  onDelete,
  onSave,
}: {
  category: string;
  initial: any | null;
  onClose: () => void;
  onDelete?: () => Promise<void> | void;
  onSave: (data: any) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [composition, setComposition] = useState(initial?.composition ?? "");
  const [shelfLife, setShelfLife] = useState(initial?.shelfLife ?? "");
  const [photoSource, setPhotoSource] = useState(initial?.imageUrl ?? "");
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  async function handlePhotoUpload(file: File) {
    setPhotoSource(await readFileAsDataUrl(file));
    setCroppedAreaPixels(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        category,
        title,
        subtitle: category === "pastry" ? "" : subtitle,
        description,
        composition: category === "pastry" ? composition : "",
        shelfLife: category === "pastry" ? shelfLife : "",
        price: null,
      };
      if (category === "pastry") {
        payload.imageUrl =
          photoSource && (photoSource !== initial?.imageUrl || croppedAreaPixels)
            ? await cropPhotoToCard(photoSource, croppedAreaPixels!)
            : initial?.imageUrl || "";
      }
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-end justify-center" onClick={onClose}>
      <form
        className="bg-white rounded-t-2xl w-full max-w-lg max-h-[85dvh] overflow-y-auto sheet-animate"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-4 h-14 border-b border-line">
          <button type="button" onClick={onClose} className="p-2 text-muted transition-colors duration-200">
            <X size={22} />
          </button>
          <h2 className="font-bold text-lg">
            {initial ? "Редактировать" : category === "pastry" ? "Новая булка" : "Новый чек-лист"}
          </h2>
          <div className="w-10" />
        </div>

        <div className="p-4 space-y-4">
          <Field label="Название" value={title} onChange={setTitle} required />
          {category !== "pastry" && <Field label="Подзаголовок" value={subtitle} onChange={setSubtitle} />}
          <Field label="Описание" value={description} onChange={setDescription} />
          {category === "pastry" && (
            <>
              <Field label="Состав" value={composition} onChange={setComposition} />
              <Field label="Срок на витрине" value={shelfLife} onChange={setShelfLife} placeholder="Например: 12 часов / до конца дня" />
            </>
          )}

          {/* Photo upload — только для булок */}
          {category === "pastry" && (
            <PhotoCropEditor
              id="item-photo-upload"
              label="Фото"
              source={photoSource}
              emptyText="Нажмите, чтобы загрузить фото"
              onFileSelected={handlePhotoUpload}
              onCropComplete={setCroppedAreaPixels}
            />
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 bg-accent text-white rounded-xl font-bold text-base disabled:opacity-50 transition-all duration-200 active:scale-[0.98]"
          >
            {saving ? "Сохранение..." : initial ? "Сохранить изменения" : "Создать"}
          </button>

          {initial && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="w-full h-12 bg-red/10 text-red rounded-xl font-bold text-base transition-all duration-200 active:scale-[0.98]"
            >
              Удалить
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// === Form helpers ===
function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (v: any) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-muted uppercase block mb-1">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-linen rounded-xl text-sm transition-all duration-200"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-muted uppercase block mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-linen rounded-xl text-sm appearance-none transition-all duration-200"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  );
}

export default App;

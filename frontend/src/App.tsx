import { useEffect, useState, useRef } from "react";
import {
  Search,
  Home,
  CupSoda,
  ClipboardCheck,
  BarChart3,
  Plus,
  Pencil,
  X,
  Clock,
  Droplets,
  Weight,
} from "lucide-react";
import {
  BrewBarRecipe,
  BatchBrewRecipe,
  SignatureTtk,
  BrewBarStep,
  Ingredient,
  ItemResponse,
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
import { bootTelegram } from "./telegram";

type TabId = "brew_bar" | "batch_brew" | "signature_ttk";
type NavId = "home" | "pastry" | "checklist" | "reports";

const tabs: { id: TabId; label: string }[] = [
  { id: "brew_bar", label: "Воронки" },
  { id: "batch_brew", label: "Батч-брю" },
  { id: "signature_ttk", label: "Авторские" },
];

const categories = ["Все", "V60", "Switch", "Orea", "Infuse Coffee", "Классика"];

function App() {
  const [activeNav, setActiveNav] = useState<NavId>("home");
  const [activeTab, setActiveTab] = useState<TabId>("brew_bar");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Все");

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

  useEffect(() => {
    bootTelegram();
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [brewBar, batchBrew, signature, pastry, checklist] = await Promise.all([
        fetchBrewBarRecipes(),
        fetchBatchBrewRecipes(),
        fetchSignatureTtks(),
        fetchItems("pastry"),
        fetchItems("checklist"),
      ]);
      setBrewBarRecipes(brewBar);
      setBatchBrewRecipes(batchBrew);
      setSignatureTtks(signature);
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

  // Filtering
  const filteredBrewBar = brewBarRecipes.filter((r) => {
    const q = searchQuery.toLowerCase();
    if (q && !r.lotName.toLowerCase().includes(q) && !r.roaster.toLowerCase().includes(q)) return false;
    if (activeCategory !== "Все" && r.method.toUpperCase() !== activeCategory.toUpperCase() && activeCategory !== "Infuse Coffee") return false;
    if (activeCategory === "Infuse Coffee" && r.method !== "switch") return false;
    return true;
  });

  const filteredBatchBrew = batchBrewRecipes.filter((r) => {
    const q = searchQuery.toLowerCase();
    if (q && !r.lotName.toLowerCase().includes(q) && !r.roaster.toLowerCase().includes(q)) return false;
    if (activeCategory !== "Все" && activeCategory !== "Infuse Coffee" && activeCategory !== "Классика") return false;
    return true;
  });

  const filteredSignature = signatureTtks.filter((r) => {
    const q = searchQuery.toLowerCase();
    if (q && !r.drinkName.toLowerCase().includes(q)) return false;
    if (activeCategory === "Infuse Coffee") return r.drinkName.toLowerCase().includes("infuse");
    if (activeCategory === "Классика") return r.category === "hot";
    return true;
  });

  const filteredPastry = pastryItems.filter((r) => {
    const q = searchQuery.toLowerCase();
    if (q && !r.title.toLowerCase().includes(q) && !r.subtitle.toLowerCase().includes(q)) return false;
    return true;
  });

  const filteredChecklist = checklistItems.filter((r) => {
    const q = searchQuery.toLowerCase();
    if (q && !r.title.toLowerCase().includes(q)) return false;
    return true;
  });

  // FAB logic
  function handleFab() {
    if (activeNav === "home") {
      setIsCreating(true);
    } else if (activeNav === "pastry") {
      setIsCreatingItem(true);
    } else if (activeNav === "checklist") {
      setIsCreatingItem(true);
    }
  }

  const showFab = activeNav !== "reports";

  return (
    <div className="min-h-dvh bg-linen text-coal">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-linen/90 backdrop-blur-sm border-b border-line">
        <div className="max-w-lg mx-auto flex items-center justify-center h-16 px-4">
          <div className="flex items-baseline gap-1.5 text-3xl font-black tracking-tight">
            <span className="text-slate">Т</span>
            <span className="text-accent">Р</span>
            <span className="text-red">У</span>
            <span className="text-coal">Д</span>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="max-w-lg mx-auto px-4 pt-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Найти рецепт или ТТК..."
            className="w-full bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm shadow-sm placeholder:text-faint transition-all duration-200"
          />
        </div>
      </div>

      {/* Categories */}
      {activeNav === "home" && (
        <div className="max-w-lg mx-auto px-4 pt-3 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-coal text-white"
                    : "bg-white text-muted hover:bg-line"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab rail */}
      {activeNav === "home" && (
        <nav className="max-w-lg mx-auto flex border-b border-line bg-linen sticky top-16 z-30 relative">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center h-12 text-sm font-bold transition-colors duration-200 ${
                activeTab === tab.id ? "text-coal" : "text-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
          {/* Smooth indicator */}
          <div
            className="absolute bottom-0 h-0.5 bg-accent transition-all duration-300 ease-out"
            style={{
              width: `${100 / tabs.length}%`,
              left: `${(tabs.findIndex((t) => t.id === activeTab) * 100) / tabs.length}%`,
            }}
          />
        </nav>
      )}

      {/* Content */}
      <main className="max-w-lg mx-auto pb-24 px-4 pt-4 space-y-3">
        {activeNav === "home" && activeTab === "brew_bar" && (
          <>
            {filteredBrewBar.length === 0 && (
              <p className="text-center text-muted py-12 text-sm">Нет рецептов воронок</p>
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

        {activeNav === "home" && activeTab === "batch_brew" && (
          <>
            {filteredBatchBrew.length === 0 && (
              <p className="text-center text-muted py-12 text-sm">Нет рецептов батч-брю</p>
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

        {activeNav === "home" && activeTab === "signature_ttk" && (
          <>
            {filteredSignature.length === 0 && (
              <p className="text-center text-muted py-12 text-sm">Нет авторских напитков</p>
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

        {activeNav === "pastry" && (
          <>
            {filteredPastry.length === 0 && (
              <p className="text-center text-muted py-12 text-sm">Нет выпечки</p>
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
          <div className="text-center py-20">
            <BarChart3 size={48} className="mx-auto text-faint mb-4" />
            <p className="text-muted font-semibold">Раздел в разработке</p>
            <p className="text-faint text-sm mt-1">Скоро здесь появятся отчёты</p>
          </div>
        )}
      </main>

      {/* FAB */}
      {showFab && (
        <button
          onClick={handleFab}
          className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-all duration-200"
          aria-label="Добавить"
        >
          <Plus size={28} />
        </button>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-[0_-2px_12px_rgba(0,0,0,0.06)] bottom-nav-safe">
        <div className="max-w-lg mx-auto flex">
          {[
            { id: "home" as NavId, label: "Главная", icon: Home },
            { id: "pastry" as NavId, label: "Кондитерка", icon: CupSoda },
            { id: "checklist" as NavId, label: "Чек-листы", icon: ClipboardCheck },
            { id: "reports" as NavId, label: "Отчеты", icon: BarChart3 },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`flex-1 flex flex-col items-center justify-center h-16 gap-0.5 text-xs font-semibold transition-colors duration-200 ${
                  isActive ? "text-green" : "text-muted"
                }`}
              >
                <Icon size={22} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

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
          initial={isEditing ? selectedRecipe : null}
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
      className="w-full bg-white rounded-2xl p-4 text-left shadow-sm active:scale-[0.98] transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-lg text-coal truncate">{recipe.lotName}</h3>
          <p className="text-sm text-muted mt-0.5">
            {recipe.roaster} · {recipe.method.toUpperCase()} · {recipe.grindClicks}
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
      className="w-full bg-white rounded-2xl p-4 text-left shadow-sm active:scale-[0.98] transition-all duration-200"
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
        <span>Термос {recipe.thermosVolumeMl} мл</span>
        <span>{recipe.coffeeDoseG} г · {recipe.ratio}</span>
        <span className="text-coal font-semibold">{recipe.brewerProgram}</span>
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
      className="w-full bg-white rounded-2xl overflow-hidden text-left shadow-sm active:scale-[0.98] transition-all duration-200"
    >
      {ttk.imageUrl && (
        <img
          src={ttk.imageUrl}
          alt=""
          className="w-full h-40 object-cover rounded-t-2xl"
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
      className="w-full bg-white rounded-2xl overflow-hidden text-left shadow-sm active:scale-[0.98] transition-all duration-200"
    >
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt=""
          className="w-full h-40 object-cover rounded-t-2xl"
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
      className="w-full bg-white rounded-2xl p-4 text-left shadow-sm active:scale-[0.98] transition-all duration-200"
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
      <p className="text-muted text-sm mt-1">{recipe.roaster} · {recipe.method.toUpperCase()} · {recipe.grindClicks}</p>
      <div className="flex gap-4 mt-3 text-sm">
        <span className="bg-linen px-3 py-1 rounded-full font-semibold">{recipe.coffeeWeightG} г кофе</span>
        <span className="bg-linen px-3 py-1 rounded-full font-semibold">{recipe.waterVolumeMl} мл воды</span>
      </div>

      <div className="mt-6">
        <h3 className="font-bold text-sm text-muted uppercase tracking-wider mb-3">Таймлайн</h3>
        <div className="flex items-center gap-2 mb-4">
          {recipe.steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="timeline-dot"
                style={{
                  backgroundColor:
                    step.stageName.toLowerCase().includes("bloom") ? "#8E96A7" :
                    step.stageName.toLowerCase().includes("yellow") ? "#C89B55" : "#C84B31",
                }}
              />
              {i < recipe.steps.length - 1 && <div className="w-6 h-0.5 bg-line" />}
            </div>
          ))}
        </div>

        <div className="bg-linen rounded-xl p-3">
          <div className="step-row font-bold text-xs text-muted uppercase">
            <span>Step</span>
            <span>Стадия</span>
            <span className="text-right">Вод.</span>
            <span className="text-right">Мес.</span>
          </div>
          {recipe.steps.map((step, i) => (
            <div key={i} className="step-row">
              <span className="text-muted font-mono">{step.startTime}</span>
              <span className="font-medium">{step.stageName}</span>
              <span className="text-right font-mono">{step.pourVolumeMl}</span>
              <span className="text-right font-mono">{step.targetWeightG}</span>
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
          <span className="text-xs text-muted uppercase font-bold">Термос</span>
          <p className="text-lg font-bold mt-1">{recipe.thermosVolumeMl} мл</p>
        </div>
        <div className="bg-linen rounded-xl p-3">
          <span className="text-xs text-muted uppercase font-bold">Закладка</span>
          <p className="text-lg font-bold mt-1">{recipe.coffeeDoseG} г</p>
        </div>
        <div className="bg-linen rounded-xl p-3">
          <span className="text-xs text-muted uppercase font-bold">Ratio</span>
          <p className="text-lg font-bold mt-1">{recipe.ratio}</p>
        </div>
        <div className="bg-linen rounded-xl p-3">
          <span className="text-xs text-muted uppercase font-bold">Вода</span>
          <p className="text-lg font-bold mt-1">{recipe.waterVolumeMl} мл</p>
        </div>
      </div>

      <div className="mt-4 bg-accent/10 rounded-xl p-3">
        <span className="text-xs text-muted uppercase font-bold">Программа</span>
        <p className="font-semibold mt-1">{recipe.brewerProgram}</p>
      </div>

      {recipe.notes && (
        <p className="mt-4 text-sm text-muted italic">{recipe.notes}</p>
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
          className="w-full h-48 object-cover rounded-xl mb-4"
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
              className="w-full h-48 object-cover rounded-xl mb-4"
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
  initial,
  onClose,
  onSave,
}: {
  type: TabId;
  initial: any | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  // Brew Bar form
  const [lotName, setLotName] = useState(initial?.lotName ?? "");
  const [roaster, setRoaster] = useState(initial?.roaster ?? "");
  const [method, setMethod] = useState(initial?.method ?? "v60");
  const [grindClicks, setGrindClicks] = useState(initial?.grindClicks ?? "");
  const [coffeeWeightG, setCoffeeWeightG] = useState(initial?.coffeeWeightG ?? 15);
  const [waterVolumeMl, setWaterVolumeMl] = useState(initial?.waterVolumeMl ?? 250);
  const [notes, setNotes] = useState(initial?.notes ?? "");

  // Batch Brew extra
  const [thermosVolumeMl, setThermosVolumeMl] = useState(initial?.thermosVolumeMl ?? 1000);
  const [coffeeDoseG, setCoffeeDoseG] = useState(initial?.coffeeDoseG ?? 60);
  const [ratio, setRatio] = useState(initial?.ratio ?? "60 g/l");
  const [brewerProgram, setBrewerProgram] = useState(initial?.brewerProgram ?? "");

  // Signature TTK extra
  const [drinkName, setDrinkName] = useState(initial?.drinkName ?? "");
  const [category, setCategory] = useState(initial?.category ?? "hot");
  const [servingVolumeMl, setServingVolumeMl] = useState(initial?.servingVolumeMl ?? 240);
  const [vessel, setVessel] = useState(initial?.vessel ?? "");
  const [photoBase64, setPhotoBase64] = useState("");
  const [photoPreview, setPhotoPreview] = useState(initial?.imageUrl ?? "");

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

  // Photo upload with Canvas compression
  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    await new Promise((resolve) => { img.onload = resolve; });

    const MAX_WIDTH = 1000;
    let { width, height } = img;
    if (width > MAX_WIDTH) {
      height = Math.round((height * MAX_WIDTH) / width);
      width = MAX_WIDTH;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

    setPhotoBase64(dataUrl);
    setPhotoPreview(dataUrl);
    URL.revokeObjectURL(url);
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
    setSteps([...steps, { startTime: "0:00", stageName: "", pourVolumeMl: 0, targetWeightG: 0 }]);
  }

  function updateStep(i: number, field: keyof BrewBarStep, value: string | number) {
    const updated = [...steps];
    (updated[i] as any)[field] = value;
    setSteps(updated);
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
          lotName, roaster, method, grindClicks,
          coffeeWeightG, waterVolumeMl, steps, notes,
        });
      } else if (type === "batch_brew") {
        await onSave({
          lotName, roaster, thermosVolumeMl, coffeeDoseG,
          ratio, waterVolumeMl, brewerProgram, notes,
        });
      } else {
        const mappedIngredients = ingredients
          .filter((ing) => ing.name && ing.amount)
          .map((ing) => ({ ingredientName: ing.name, exactAmount: ing.amount }));
        const mappedSteps = serviceSteps.filter(Boolean);
        await onSave({
          drinkName, category, servingVolumeMl, vessel,
          imageUrl: photoBase64 || initial?.imageUrl || "",
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

              {/* Photo upload */}
              <div>
                <span className="text-xs font-bold text-muted uppercase block mb-1">Фото подачи</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="photo-upload"
                  onChange={handlePhotoUpload}
                />
                <label
                  htmlFor="photo-upload"
                  className="block cursor-pointer"
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt=""
                      className="w-full h-40 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-32 bg-linen rounded-xl flex items-center justify-center text-sm text-muted font-semibold border-2 border-dashed border-line transition-colors duration-200 hover:border-accent">
                      Нажмите, чтобы загрузить фото подачи
                    </div>
                  )}
                </label>
              </div>

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
            </>
          )}

          {type === "brew_bar" && (
            <>
              <Select
                label="Метод"
                value={method}
                onChange={setMethod}
                options={[
                  { value: "v60", label: "V60" },
                  { value: "switch", label: "Switch" },
                  { value: "orea", label: "Orea" },
                ]}
              />
              <Field label="Помол (клики)" value={grindClicks} onChange={setGrindClicks} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Кофе (г)" type="number" value={coffeeWeightG} onChange={setCoffeeWeightG} />
                <Field label="Вода (мл)" type="number" value={waterVolumeMl} onChange={setWaterVolumeMl} />
              </div>

              {/* Steps editor — redesigned cards */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted uppercase">Шаги заваривания</span>
                </div>
                {steps.map((step, i) => (
                  <div key={i} className="bg-linen rounded-xl p-3 mb-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-muted block mb-0.5">Время</span>
                        <input
                          className="w-full px-2 py-1.5 bg-white rounded-lg text-sm font-mono"
                          placeholder="0:00"
                          value={step.startTime}
                          onChange={(e) => updateStep(i, "startTime", e.target.value)}
                        />
                      </div>
                      <div>
                        <span className="text-xs text-muted block mb-0.5">Название стадии</span>
                        <input
                          className="w-full px-2 py-1.5 bg-white rounded-lg text-sm"
                          placeholder="Bloom, Pour 1, Pour 2"
                          value={step.stageName}
                          onChange={(e) => updateStep(i, "stageName", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-muted block mb-0.5">Вода (мл)</span>
                        <input
                          className="w-full px-2 py-1.5 bg-white rounded-lg text-sm font-mono"
                          placeholder="мл"
                          type="number"
                          value={step.pourVolumeMl || ""}
                          onChange={(e) => updateStep(i, "pourVolumeMl", Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <span className="text-xs text-muted block mb-0.5">Общий вес (г)</span>
                        <input
                          className="w-full px-2 py-1.5 bg-white rounded-lg text-sm font-mono"
                          placeholder="г"
                          type="number"
                          value={step.targetWeightG || ""}
                          onChange={(e) => updateStep(i, "targetWeightG", Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <button type="button" onClick={() => removeStep(i)} className="text-xs text-red font-semibold">
                      Удалить шаг
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addStep}
                  className="w-full bg-white border-2 border-dashed border-line rounded-xl py-3 text-accent font-semibold text-sm transition-colors duration-200 hover:border-accent"
                >
                  + Добавить шаг заваривания
                </button>
              </div>
            </>
          )}

          {type === "batch_brew" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Термос (мл)" type="number" value={thermosVolumeMl} onChange={setThermosVolumeMl} />
                <Field label="Закладка (г)" type="number" value={coffeeDoseG} onChange={setCoffeeDoseG} />
              </div>
              <Field label="Ratio" value={ratio} onChange={setRatio} />
              <Field label="Вода (мл)" type="number" value={waterVolumeMl} onChange={setWaterVolumeMl} />
              <Field label="Программа" value={brewerProgram} onChange={setBrewerProgram} />
            </>
          )}

          {type === "signature_ttk" && (
            <>
              <Field label="Состав и аллергены" value={allergens} onChange={setAllergens} />
              <Field label="Условия хранения" value={storage} onChange={setStorage} />
            </>
          )}

          <Field label="Заметки" value={notes} onChange={setNotes} />

          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 bg-accent text-white rounded-xl font-bold text-base disabled:opacity-50 transition-all duration-200 active:scale-[0.98]"
          >
            {saving ? "Сохранение..." : initial ? "Сохранить изменения" : "Создать"}
          </button>

          {/* Delete button in edit mode */}
          {initial && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Удалить рецепт?")) {
                  onClose();
                  // Parent handles deletion via the modal's onDelete
                }
              }}
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
  onSave,
}: {
  category: string;
  initial: any | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState<number | null>(initial?.price ?? null);
  const [photoBase64, setPhotoBase64] = useState("");
  const [photoPreview, setPhotoPreview] = useState(initial?.imageUrl ?? "");

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    await new Promise((resolve) => { img.onload = resolve; });
    const MAX_WIDTH = 1000;
    let { width, height } = img;
    if (width > MAX_WIDTH) {
      height = Math.round((height * MAX_WIDTH) / width);
      width = MAX_WIDTH;
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setPhotoBase64(dataUrl);
    setPhotoPreview(dataUrl);
    URL.revokeObjectURL(url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        category,
        title,
        subtitle,
        description,
        price: category === "pastry" ? price : null,
        imageUrl: photoBase64 || initial?.imageUrl || "",
      });
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
            {initial ? "Редактировать" : category === "pastry" ? "Новая позиция" : "Новый чек-лист"}
          </h2>
          <div className="w-10" />
        </div>

        <div className="p-4 space-y-4">
          <Field label="Название" value={title} onChange={setTitle} required />
          <Field label="Подзаголовок" value={subtitle} onChange={setSubtitle} />
          <Field label="Описание" value={description} onChange={setDescription} />
          {category === "pastry" && (
            <Field label="Цена (₽)" type="number" value={price ?? ""} onChange={(v) => setPrice(v === "" ? null : Number(v))} />
          )}

          {/* Photo upload */}
          <div>
            <span className="text-xs font-bold text-muted uppercase block mb-1">Фото</span>
            <input type="file" accept="image/*" className="hidden" id="item-photo-upload" onChange={handlePhotoUpload} />
            <label htmlFor="item-photo-upload" className="block cursor-pointer">
              {photoPreview ? (
                <img src={photoPreview} alt="" className="w-full h-40 object-cover rounded-xl" />
              ) : (
                <div className="w-full h-32 bg-linen rounded-xl flex items-center justify-center text-sm text-muted font-semibold border-2 border-dashed border-line transition-colors duration-200 hover:border-accent">
                  Нажмите, чтобы загрузить фото
                </div>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 bg-accent text-white rounded-xl font-bold text-base disabled:opacity-50 transition-all duration-200 active:scale-[0.98]"
          >
            {saving ? "Сохранение..." : initial ? "Сохранить изменения" : "Создать"}
          </button>

          {initial && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Удалить?")) {
                  onClose();
                }
              }}
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
        onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
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

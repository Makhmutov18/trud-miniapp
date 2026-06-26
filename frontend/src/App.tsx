import { useEffect, useState } from "react";
import {
  Coffee,
  FlaskConical,
  CupSoda,
  Home,
  Bookmark,
  User,
  Plus,
  Pencil,
  X,
  ChevronRight,
  Clock,
  Droplets,
  Weight,
  ImagePlus,
} from "lucide-react";
import {
  BrewBarRecipe,
  BatchBrewRecipe,
  SignatureTtk,
  BrewBarStep,
  Ingredient,
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
} from "./api";
import { bootTelegram } from "./telegram";

type TabId = "brew_bar" | "batch_brew" | "signature_ttk";

const tabs: { id: TabId; label: string; icon: typeof Coffee }[] = [
  { id: "brew_bar", label: "Воронки", icon: Coffee },
  { id: "batch_brew", label: "Батч-брю", icon: FlaskConical },
  { id: "signature_ttk", label: "Авторские", icon: CupSoda },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("brew_bar");
  const [brewBarRecipes, setBrewBarRecipes] = useState<BrewBarRecipe[]>([]);
  const [batchBrewRecipes, setBatchBrewRecipes] = useState<BatchBrewRecipe[]>([]);
  const [signatureTtks, setSignatureTtks] = useState<SignatureTtk[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<BrewBarRecipe | BatchBrewRecipe | SignatureTtk | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState("Загрузка...");

  useEffect(() => {
    bootTelegram();
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [brewBar, batchBrew, signature] = await Promise.all([
        fetchBrewBarRecipes(),
        fetchBatchBrewRecipes(),
        fetchSignatureTtks(),
      ]);
      setBrewBarRecipes(brewBar);
      setBatchBrewRecipes(batchBrew);
      setSignatureTtks(signature);
      setStatus("Синхронизировано");
    } catch {
      setStatus("Офлайн");
    }
  }

  function handleEdit(recipe: BrewBarRecipe | BatchBrewRecipe | SignatureTtk) {
    setSelectedRecipe(recipe);
    setIsEditing(true);
  }

  async function handleDelete(type: TabId, id: string) {
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

      {/* Status bar */}
      <div className="max-w-lg mx-auto px-4 py-2 text-xs text-muted font-semibold uppercase tracking-wider flex justify-between">
        <span>{status}</span>
        <span>Бар · ТРУД</span>
      </div>

      {/* Tab rail */}
      <nav className="max-w-lg mx-auto flex border-b border-line bg-linen sticky top-16 z-30">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 h-12 text-sm font-bold transition-colors ${
                activeTab === tab.id
                  ? "text-coal border-b-2 border-accent"
                  : "text-muted"
              }`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Content */}
      <main className="max-w-lg mx-auto pb-24 px-4 pt-4 space-y-3">
        {activeTab === "brew_bar" && (
          <>
            {brewBarRecipes.length === 0 && (
              <p className="text-center text-muted py-12 text-sm">Нет рецептов воронок</p>
            )}
            {brewBarRecipes.map((recipe) => (
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
            {batchBrewRecipes.length === 0 && (
              <p className="text-center text-muted py-12 text-sm">Нет рецептов батч-брю</p>
            )}
            {batchBrewRecipes.map((recipe) => (
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
            {signatureTtks.length === 0 && (
              <p className="text-center text-muted py-12 text-sm">Нет авторских напитков</p>
            )}
            {signatureTtks.map((ttk) => (
              <SignatureTtkCard
                key={ttk.id}
                ttk={ttk}
                onSelect={setSelectedRecipe}
                onEdit={() => handleEdit(ttk)}
              />
            ))}
          </>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => setIsCreating(true)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Добавить"
      >
        <Plus size={28} />
      </button>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-[0_-2px_12px_rgba(0,0,0,0.06)] bottom-nav-safe">
        <div className="max-w-lg mx-auto flex">
          {[
            { id: "home", label: "Главная", icon: Home },
            { id: "favorites", label: "Избранное", icon: Bookmark },
            { id: "profile", label: "Профиль", icon: User },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className="flex-1 flex flex-col items-center justify-center h-16 gap-0.5 text-muted text-xs font-semibold"
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

      {/* Create/Edit Modal */}
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
      className="w-full bg-white rounded-2xl p-4 text-left shadow-sm active:scale-[0.98] transition-transform"
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
          className="ml-2 p-2 text-muted hover:text-accent flex-shrink-0"
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
      className="w-full bg-white rounded-2xl p-4 text-left shadow-sm active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-lg text-coal truncate">{recipe.lotName}</h3>
          <p className="text-sm text-muted mt-0.5">{recipe.roaster}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="ml-2 p-2 text-muted hover:text-accent flex-shrink-0"
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
      className="w-full bg-white rounded-2xl overflow-hidden text-left shadow-sm active:scale-[0.98] transition-transform"
    >
      {ttk.imageUrl && (
        <img
          src={ttk.imageUrl}
          alt=""
          className="w-full h-40 object-cover"
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
            className="ml-2 p-2 text-muted hover:text-accent flex-shrink-0"
            aria-label="Редактировать"
          >
            <Pencil size={16} />
          </button>
        </div>
        <div className="mt-3 text-sm text-muted">
          {ttk.ingredients.length} ингредиентов · {ttk.serviceSteps.length} шагов
        </div>
      </div>
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
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl w-full max-w-lg max-h-[85dvh] overflow-y-auto sheet-animate"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-4 h-14 border-b border-line">
          <button onClick={onClose} className="p-2 text-muted" aria-label="Закрыть">
            <X size={22} />
          </button>
          <div className="flex gap-2">
            <button onClick={onEdit} className="p-2 text-accent" aria-label="Редактировать">
              <Pencil size={20} />
            </button>
            <button onClick={onDelete} className="p-2 text-red" aria-label="Удалить">
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

      {/* Timeline */}
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

        {/* Steps table */}
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

      {/* Ingredients */}
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

      {/* Service steps */}
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
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [ingredientText, setIngredientText] = useState(
    initial?.ingredients?.map((i: Ingredient) => `${i.ingredientName}: ${i.exactAmount}`).join("\n") ?? ""
  );
  const [serviceStepText, setServiceStepText] = useState(
    initial?.serviceSteps?.join("\n") ?? ""
  );
  const [allergens, setAllergens] = useState(initial?.allergensAndComposition ?? "");
  const [storage, setStorage] = useState(initial?.storageConditions ?? "");

  // Brew Bar steps
  const [steps, setSteps] = useState<BrewBarStep[]>(initial?.steps ?? []);

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
        const ingredients = ingredientText
          .split("\n")
          .filter(Boolean)
          .map((line: string) => {
            const [name, amount] = line.split(":").map((s: string) => s.trim());
            return { ingredientName: name, exactAmount: amount };
          });
        const serviceSteps = serviceStepText.split("\n").filter(Boolean);
        await onSave({
          drinkName, category, servingVolumeMl, vessel, imageUrl,
          ingredients, serviceSteps,
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
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center" onClick={onClose}>
      <form
        className="bg-white rounded-t-2xl w-full max-w-lg max-h-[85dvh] overflow-y-auto sheet-animate"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-4 h-14 border-b border-line">
          <button type="button" onClick={onClose} className="p-2 text-muted">
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
              <Field label="URL фото" value={imageUrl} onChange={setImageUrl} placeholder="https://..." />
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

              {/* Steps editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted uppercase">Шаги заваривания</span>
                  <button type="button" onClick={addStep} className="text-xs text-accent font-bold">
                    + Добавить шаг
                  </button>
                </div>
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-2 items-center mb-2">
                    <input
                      className="w-16 px-2 py-1.5 bg-linen rounded-lg text-sm font-mono"
                      placeholder="0:00"
                      value={step.startTime}
                      onChange={(e) => updateStep(i, "startTime", e.target.value)}
                    />
                    <input
                      className="flex-1 px-2 py-1.5 bg-linen rounded-lg text-sm"
                      placeholder="Bloom"
                      value={step.stageName}
                      onChange={(e) => updateStep(i, "stageName", e.target.value)}
                    />
                    <input
                      className="w-16 px-2 py-1.5 bg-linen rounded-lg text-sm font-mono"
                      placeholder="мл"
                      type="number"
                      value={step.pourVolumeMl || ""}
                      onChange={(e) => updateStep(i, "pourVolumeMl", Number(e.target.value))}
                    />
                    <input
                      className="w-16 px-2 py-1.5 bg-linen rounded-lg text-sm font-mono"
                      placeholder="г"
                      type="number"
                      value={step.targetWeightG || ""}
                      onChange={(e) => updateStep(i, "targetWeightG", Number(e.target.value))}
                    />
                    <button type="button" onClick={() => removeStep(i)} className="p-1 text-red">
                      <X size={16} />
                    </button>
                  </div>
                ))}
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
              <div>
                <label className="text-xs font-bold text-muted uppercase block mb-1">Ингредиенты (название: граммовка)</label>
                <textarea
                  className="w-full px-3 py-2 bg-linen rounded-xl text-sm min-h-[80px] resize-none"
                  value={ingredientText}
                  onChange={(e) => setIngredientText(e.target.value)}
                  placeholder="Двойной эспрессо: 34 г&#10;Indian Tonic: 200 г"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted uppercase block mb-1">Технология (по пунктам)</label>
                <textarea
                  className="w-full px-3 py-2 bg-linen rounded-xl text-sm min-h-[80px] resize-none"
                  value={serviceStepText}
                  onChange={(e) => setServiceStepText(e.target.value)}
                  placeholder="1. Наполнить стакан льдом&#10;2. Влить тоник по стенке"
                />
              </div>
              <Field label="Состав и аллергены" value={allergens} onChange={setAllergens} />
              <Field label="Условия хранения" value={storage} onChange={setStorage} />
            </>
          )}

          <Field label="Заметки" value={notes} onChange={setNotes} />

          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 bg-accent text-white rounded-xl font-bold text-base disabled:opacity-50"
          >
            {saving ? "Сохранение..." : initial ? "Сохранить изменения" : "Создать"}
          </button>
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
        className="w-full px-3 py-2 bg-linen rounded-xl text-sm"
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
        className="w-full px-3 py-2 bg-linen rounded-xl text-sm appearance-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  );
}

export default App;

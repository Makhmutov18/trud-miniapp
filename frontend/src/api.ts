export type Category = "coffee" | "pastry" | "checklist";

export type Spec = {
  label: string;
  value: string;
};

export type LibraryItem = {
  id: string;
  category: Category;
  subcategory: string;
  title: string;
  subtitle: string;
  description: string;
  price?: number | null;
  imageUrl?: string;
  specs: Spec[];
  steps: string[];
  tags: string[];
  isFavorite?: boolean;
};

export type RecipeType = "brew_bar" | "batch_brew" | "signature_ttk";
export type BrewMethod = "v60" | "switch" | "orea";
export type SignatureDrinkCategory = "hot" | "cold";

export type BrewBarStep = {
  startTime: string;
  stageName: string;
  pourVolumeMl: number;
  targetWeightG: number;
};

export type BrewBarRecipe = {
  id: string;
  type: "brew_bar";
  lotName: string;
  roaster: string;
  method: BrewMethod;
  grindClicks: string;
  coffeeWeightG: number;
  waterVolumeMl: number;
  steps: BrewBarStep[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type BatchBrewRecipe = {
  id: string;
  type: "batch_brew";
  lotName: string;
  roaster: string;
  thermosVolumeMl: number;
  coffeeDoseG: number;
  ratio: string;
  waterVolumeMl: number;
  brewerProgram: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type SignatureIngredient = {
  name: string;
  amount: number;
  unit: string;
};

export type SignatureTtk = {
  id: string;
  type: "signature_ttk";
  drinkName: string;
  category: SignatureDrinkCategory;
  servingVolumeMl: number;
  vessel: string;
  ingredients: SignatureIngredient[];
  serviceSteps: string[];
  allergensAndComposition: string;
  storageConditions: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type RecipesByType = {
  brewBar: BrewBarRecipe[];
  batchBrew: BatchBrewRecipe[];
  signatureTtk: SignatureTtk[];
};

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export async function fetchItems(): Promise<LibraryItem[]> {
  const response = await fetch(`${API_BASE}/api/items`);
  if (!response.ok) throw new Error("Не удалось загрузить базу");
  return response.json();
}

export async function createItem(payload: Omit<LibraryItem, "id">): Promise<LibraryItem> {
  const response = await fetch(`${API_BASE}/api/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("Не удалось создать карточку");
  return response.json();
}

export async function fetchRecipes(): Promise<RecipesByType> {
  const response = await fetch(`${API_BASE}/api/recipes`);
  if (!response.ok) throw new Error("Не удалось загрузить рецепты");
  return response.json();
}

export async function fetchBrewBarRecipes(method?: BrewMethod): Promise<BrewBarRecipe[]> {
  const query = method ? `?method=${method}` : "";
  const response = await fetch(`${API_BASE}/api/recipes/brew-bar${query}`);
  if (!response.ok) throw new Error("Не удалось загрузить рецепты под воронку");
  return response.json();
}

export async function fetchBatchBrewRecipes(): Promise<BatchBrewRecipe[]> {
  const response = await fetch(`${API_BASE}/api/recipes/batch-brew`);
  if (!response.ok) throw new Error("Не удалось загрузить рецепты batch brew");
  return response.json();
}

export async function fetchSignatureTtks(category?: SignatureDrinkCategory): Promise<SignatureTtk[]> {
  const query = category ? `?category=${category}` : "";
  const response = await fetch(`${API_BASE}/api/recipes/signature-ttk${query}`);
  if (!response.ok) throw new Error("Не удалось загрузить ТТК авторских напитков");
  return response.json();
}

export async function calculateExtraction(payload: {
  beverageWeight: number;
  tds: number;
  dose: number;
}): Promise<{ extraction: number; status: "within_spec" | "out_of_limits"; formula: string }> {
  const response = await fetch(`${API_BASE}/api/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("Не удалось рассчитать экстракцию");
  return response.json();
}


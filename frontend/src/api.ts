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

export type Ingredient = {
  ingredientName: string;
  exactAmount: string;
};

export type SignatureTtk = {
  id: string;
  type: "signature_ttk";
  drinkName: string;
  category: SignatureDrinkCategory;
  servingVolumeMl: number;
  vessel: string;
  imageUrl: string;
  ingredients: Ingredient[];
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

// === Brew Bar ===

export async function fetchBrewBarRecipes(method?: BrewMethod): Promise<BrewBarRecipe[]> {
  const query = method ? `?method=${method}` : "";
  const response = await fetch(`${API_BASE}/api/recipes/brew-bar${query}`);
  if (!response.ok) throw new Error("Не удалось загрузить рецепты воронок");
  return response.json();
}

export async function createBrewBar(payload: Omit<BrewBarRecipe, "id" | "type" | "createdAt" | "updatedAt">): Promise<BrewBarRecipe> {
  const response = await fetch(`${API_BASE}/api/recipes/brew-bar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Не удалось создать рецепт");
  return response.json();
}

export async function updateBrewBar(recipeId: string, payload: Partial<BrewBarRecipe>): Promise<BrewBarRecipe> {
  const response = await fetch(`${API_BASE}/api/recipes/brew-bar/${recipeId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Не удалось обновить рецепт");
  return response.json();
}

export async function replaceBrewBar(recipeId: string, payload: Omit<BrewBarRecipe, "id" | "type" | "createdAt" | "updatedAt">): Promise<BrewBarRecipe> {
  const response = await fetch(`${API_BASE}/api/recipes/brew-bar/${recipeId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Не удалось заменить рецепт");
  return response.json();
}

export async function deleteBrewBar(recipeId: string): Promise<void> {
  await fetch(`${API_BASE}/api/recipes/brew-bar/${recipeId}`, { method: "DELETE" });
}

// === Batch Brew ===

export async function fetchBatchBrewRecipes(): Promise<BatchBrewRecipe[]> {
  const response = await fetch(`${API_BASE}/api/recipes/batch-brew`);
  if (!response.ok) throw new Error("Не удалось загрузить рецепты батч-брю");
  return response.json();
}

export async function createBatchBrew(payload: Omit<BatchBrewRecipe, "id" | "type" | "createdAt" | "updatedAt">): Promise<BatchBrewRecipe> {
  const response = await fetch(`${API_BASE}/api/recipes/batch-brew`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Не удалось создать рецепт");
  return response.json();
}

export async function updateBatchBrew(recipeId: string, payload: Partial<BatchBrewRecipe>): Promise<BatchBrewRecipe> {
  const response = await fetch(`${API_BASE}/api/recipes/batch-brew/${recipeId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Не удалось обновить рецепт");
  return response.json();
}

export async function replaceBatchBrew(recipeId: string, payload: Omit<BatchBrewRecipe, "id" | "type" | "createdAt" | "updatedAt">): Promise<BatchBrewRecipe> {
  const response = await fetch(`${API_BASE}/api/recipes/batch-brew/${recipeId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Не удалось заменить рецепт");
  return response.json();
}

export async function deleteBatchBrew(recipeId: string): Promise<void> {
  await fetch(`${API_BASE}/api/recipes/batch-brew/${recipeId}`, { method: "DELETE" });
}

// === Signature TTK ===

export async function fetchSignatureTtks(category?: SignatureDrinkCategory): Promise<SignatureTtk[]> {
  const query = category ? `?category=${category}` : "";
  const response = await fetch(`${API_BASE}/api/recipes/signature-ttk${query}`);
  if (!response.ok) throw new Error("Не удалось загрузить ТТК");
  return response.json();
}

export async function createSignatureTtk(payload: Omit<SignatureTtk, "id" | "type" | "createdAt" | "updatedAt">): Promise<SignatureTtk> {
  const response = await fetch(`${API_BASE}/api/recipes/signature-ttk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Не удалось создать ТТК");
  return response.json();
}

export async function updateSignatureTtk(ttkId: string, payload: Partial<SignatureTtk>): Promise<SignatureTtk> {
  const response = await fetch(`${API_BASE}/api/recipes/signature-ttk/${ttkId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Не удалось обновить ТТК");
  return response.json();
}

export async function replaceSignatureTtk(ttkId: string, payload: Omit<SignatureTtk, "id" | "type" | "createdAt" | "updatedAt">): Promise<SignatureTtk> {
  const response = await fetch(`${API_BASE}/api/recipes/signature-ttk/${ttkId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Не удалось заменить ТТК");
  return response.json();
}

export async function deleteSignatureTtk(ttkId: string): Promise<void> {
  await fetch(`${API_BASE}/api/recipes/signature-ttk/${ttkId}`, { method: "DELETE" });
}

// === All recipes ===

export async function fetchAllRecipes(): Promise<RecipesByType> {
  const response = await fetch(`${API_BASE}/api/recipes`);
  if (!response.ok) throw new Error("Не удалось загрузить рецепты");
  return response.json();
}

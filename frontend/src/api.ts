import { getTelegramApp } from "./telegram";

export type RecipeType = "brew_bar" | "batch_brew" | "signature_ttk";

export type RecipeFolder = {
  id: string;
  name: string;
  tab: TabId;
};

export type TabId = "brew_bar" | "batch_brew" | "signature_ttk";
export type BrewMethod = "v60" | "switch" | "orea";
export type SignatureDrinkCategory = "hot" | "cold";

export type BrewBarStep = {
  startTime: string;
  stageName: string;
  pourVolumeMl: number;
  targetWeightG: number;
  comment: string;
};

export type BrewBarRecipe = {
  id: string;
  type: "brew_bar";
  folderId: string | null;
  lotName: string;
  roaster: string;
  origin: string;
  processing: string;
  method: BrewMethod;
  grinder: string;
  grindClicks: string;
  coffeeWeightG: number;
  waterVolumeMl: number;
  temperature: number | null;
  waterPpm: number | null;
  steps: BrewBarStep[];
  cupDescription: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type BatchBrewRecipe = {
  id: string;
  type: "batch_brew";
  folderId: string | null;
  lotName: string;
  roaster: string;
  thermosVolumeMl?: number;
  ratio?: string;
  brewerProgram: string;
  coffeeDoseG: number;
  grindClicks: string;
  waterVolumeMl: number;
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
  folderId: string | null;
  drinkName: string;
  category: SignatureDrinkCategory;
  servingVolumeMl: number;
  vessel: string;
  imageUrl?: string | null;
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

// === Items (pastry, checklist) ===

export type ItemSpec = {
  label: string;
  value: string;
};

export type ItemResponse = {
  id: string;
  category: string;
  subcategory: string;
  title: string;
  subtitle: string;
  description: string;
  composition: string;
  shelfLife: string;
  price: number | null;
  imageUrl: string;
  specs: ItemSpec[];
  steps: string[];
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ItemCreatePayload = {
  category: string;
  subcategory?: string;
  title: string;
  subtitle?: string;
  description?: string;
  composition?: string;
  shelfLife?: string;
  price?: number | null;
  imageUrl?: string;
  specs?: ItemSpec[];
  steps?: string[];
  tags?: string[];
  isFavorite?: boolean;
};

// Helper: strip readonly response fields before sending form data back to the API.
function stripClientFields<T extends Record<string, any>>(data: T): Record<string, any> {
  const { id, type, createdAt, updatedAt, ...rest } = data;
  return rest;
}

function normalizeSignatureTtk(data: SignatureTtk): SignatureTtk {
  return {
    ...data,
    drinkName: data.drinkName ?? "",
    category: data.category ?? "cold",
    servingVolumeMl: data.servingVolumeMl ?? 0,
    vessel: data.vessel ?? "",
    imageUrl: typeof data.imageUrl === "string" ? data.imageUrl : "",
    ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
    serviceSteps: Array.isArray(data.serviceSteps) ? data.serviceSteps : [],
    allergensAndComposition: data.allergensAndComposition ?? "",
    storageConditions: data.storageConditions ?? "",
    notes: data.notes ?? "",
  };
}

const API_BASE = import.meta.env.VITE_API_URL ?? "";

function withTelegramInitData(headers?: HeadersInit, method?: string): Headers {
  const merged = new Headers(headers);
  const app = getTelegramApp();
  const initData = getTelegramApp()?.initData;
  const upperMethod = method?.toUpperCase();
  if (upperMethod && ["POST", "PATCH", "PUT", "DELETE"].includes(upperMethod)) {
    console.info(`Telegram WebApp detected: ${app ? "yes" : "no"}`);
    console.info(`Telegram initData present: ${initData ? "yes" : "no"}`);
  }
  if (initData) {
    merged.set("X-Telegram-Init-Data", initData);
  }
  return merged;
}

async function apiRequest<T>(url: string, init: RequestInit | undefined, fallbackMessage: string): Promise<T> {
  const method = init?.method?.toUpperCase();
  const response = await fetch(url, {
    ...init,
    headers: withTelegramInitData(init?.headers, method),
  });
  const contentType = response.headers.get("content-type") || "";
  const body = await response.text();

  if (!response.ok) {
    console.error("API request failed", {
      method: init?.method ?? "GET",
      url,
      status: response.status,
      contentType,
      body: body.slice(0, 500),
    });
    throw new Error(body ? `${fallbackMessage}: ${body}` : `${fallbackMessage}: ${response.status} ${response.statusText}`);
  }

  if (!body) return null as T;

  try {
    return JSON.parse(body) as T;
  } catch (error) {
    console.error("API JSON parse failed", {
      method: init?.method ?? "GET",
      url,
      status: response.status,
      contentType,
      body: body.slice(0, 500),
      error,
    });
    throw new Error(`Некорректный JSON от API ${url}: ${body.slice(0, 300)}`);
  }
}

// === Brew Bar ===

export async function fetchBrewBarRecipes(method?: BrewMethod): Promise<BrewBarRecipe[]> {
  const query = method ? `?method=${method}` : "";
  return apiRequest<BrewBarRecipe[]>(`${API_BASE}/api/recipes/brew-bar${query}`, undefined, "Не удалось загрузить рецепты воронок");
}

export async function createBrewBar(payload: Omit<BrewBarRecipe, "id" | "type" | "createdAt" | "updatedAt">): Promise<BrewBarRecipe> {
  return apiRequest<BrewBarRecipe>(`${API_BASE}/api/recipes/brew-bar`, {
    method: "POST",
    headers: withTelegramInitData({ "Content-Type": "application/json" }),
    body: JSON.stringify(stripClientFields(payload)),
  }, "Не удалось создать рецепт");
}

export async function updateBrewBar(recipeId: string, payload: Partial<BrewBarRecipe>): Promise<BrewBarRecipe> {
  return apiRequest<BrewBarRecipe>(`${API_BASE}/api/recipes/brew-bar/${recipeId}`, {
    method: "PATCH",
    headers: withTelegramInitData({ "Content-Type": "application/json" }),
    body: JSON.stringify(stripClientFields(payload)),
  }, "Не удалось обновить рецепт");
}

export async function replaceBrewBar(recipeId: string, payload: Omit<BrewBarRecipe, "id" | "type" | "createdAt" | "updatedAt">): Promise<BrewBarRecipe> {
  return apiRequest<BrewBarRecipe>(`${API_BASE}/api/recipes/brew-bar/${recipeId}`, {
    method: "PUT",
    headers: withTelegramInitData({ "Content-Type": "application/json" }),
    body: JSON.stringify(stripClientFields(payload)),
  }, "Не удалось заменить рецепт");
}

export async function deleteBrewBar(recipeId: string): Promise<void> {
  await apiRequest<null>(`${API_BASE}/api/recipes/brew-bar/${recipeId}`, { method: "DELETE" }, "Не удалось удалить рецепт");
}

// === Batch Brew ===

export async function fetchBatchBrewRecipes(): Promise<BatchBrewRecipe[]> {
  return apiRequest<BatchBrewRecipe[]>(`${API_BASE}/api/recipes/batch-brew`, undefined, "Не удалось загрузить рецепты батч-брю");
}

export async function createBatchBrew(payload: Omit<BatchBrewRecipe, "id" | "type" | "createdAt" | "updatedAt">): Promise<BatchBrewRecipe> {
  return apiRequest<BatchBrewRecipe>(`${API_BASE}/api/recipes/batch-brew`, {
    method: "POST",
    headers: withTelegramInitData({ "Content-Type": "application/json" }),
    body: JSON.stringify(stripClientFields(payload)),
  }, "Не удалось создать рецепт");
}

export async function updateBatchBrew(recipeId: string, payload: Partial<BatchBrewRecipe>): Promise<BatchBrewRecipe> {
  return apiRequest<BatchBrewRecipe>(`${API_BASE}/api/recipes/batch-brew/${recipeId}`, {
    method: "PATCH",
    headers: withTelegramInitData({ "Content-Type": "application/json" }),
    body: JSON.stringify(stripClientFields(payload)),
  }, "Не удалось обновить рецепт");
}

export async function replaceBatchBrew(recipeId: string, payload: Omit<BatchBrewRecipe, "id" | "type" | "createdAt" | "updatedAt">): Promise<BatchBrewRecipe> {
  return apiRequest<BatchBrewRecipe>(`${API_BASE}/api/recipes/batch-brew/${recipeId}`, {
    method: "PUT",
    headers: withTelegramInitData({ "Content-Type": "application/json" }),
    body: JSON.stringify(stripClientFields(payload)),
  }, "Не удалось заменить рецепт");
}

export async function deleteBatchBrew(recipeId: string): Promise<void> {
  await apiRequest<null>(`${API_BASE}/api/recipes/batch-brew/${recipeId}`, { method: "DELETE" }, "Не удалось удалить рецепт");
}

// === Signature TTK ===

export async function fetchSignatureTtks(category?: SignatureDrinkCategory): Promise<SignatureTtk[]> {
  const query = category ? `?category=${category}` : "";
  const data = await apiRequest<SignatureTtk[]>(`${API_BASE}/api/recipes/signature-ttk${query}`, undefined, "Не удалось загрузить ТТК");
  return data.map(normalizeSignatureTtk);
}

export async function createSignatureTtk(payload: Omit<SignatureTtk, "id" | "type" | "createdAt" | "updatedAt">): Promise<SignatureTtk> {
  const data = await apiRequest<SignatureTtk>(`${API_BASE}/api/recipes/signature-ttk`, {
    method: "POST",
    headers: withTelegramInitData({ "Content-Type": "application/json" }),
    body: JSON.stringify(stripClientFields(payload)),
  }, "Не удалось создать ТТК");
  return normalizeSignatureTtk(data);
}

export async function updateSignatureTtk(ttkId: string, payload: Partial<SignatureTtk>): Promise<SignatureTtk> {
  const data = await apiRequest<SignatureTtk>(`${API_BASE}/api/recipes/signature-ttk/${ttkId}`, {
    method: "PATCH",
    headers: withTelegramInitData({ "Content-Type": "application/json" }),
    body: JSON.stringify(stripClientFields(payload)),
  }, "Не удалось обновить ТТК");
  return normalizeSignatureTtk(data);
}

export async function replaceSignatureTtk(ttkId: string, payload: Omit<SignatureTtk, "id" | "type" | "createdAt" | "updatedAt">): Promise<SignatureTtk> {
  const data = await apiRequest<SignatureTtk>(`${API_BASE}/api/recipes/signature-ttk/${ttkId}`, {
    method: "PUT",
    headers: withTelegramInitData({ "Content-Type": "application/json" }),
    body: JSON.stringify(stripClientFields(payload)),
  }, "Не удалось заменить ТТК");
  return normalizeSignatureTtk(data);
}

export async function deleteSignatureTtk(ttkId: string): Promise<void> {
  await apiRequest<null>(`${API_BASE}/api/recipes/signature-ttk/${ttkId}`, { method: "DELETE" }, "Не удалось удалить ТТК");
}

// === All recipes ===

export async function fetchAllRecipes(): Promise<RecipesByType> {
  return apiRequest<RecipesByType>(`${API_BASE}/api/recipes`, undefined, "Не удалось загрузить рецепты");
}

// === Items (pastry, checklist) ===

export async function fetchItems(category: string): Promise<ItemResponse[]> {
  return apiRequest<ItemResponse[]>(`${API_BASE}/api/items?category=${category}`, undefined, "Не удалось загрузить");
}

export async function createItem(payload: ItemCreatePayload): Promise<ItemResponse> {
  return apiRequest<ItemResponse>(`${API_BASE}/api/items`, {
    method: "POST",
    headers: withTelegramInitData({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  }, "Не удалось создать");
}

export async function updateItem(itemId: string, payload: Partial<ItemCreatePayload>): Promise<ItemResponse> {
  return apiRequest<ItemResponse>(`${API_BASE}/api/items/${itemId}`, {
    method: "PATCH",
    headers: withTelegramInitData({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  }, "Не удалось обновить");
}

export async function deleteItem(itemId: string): Promise<void> {
  await apiRequest<null>(`${API_BASE}/api/items/${itemId}`, { method: "DELETE" }, "Не удалось удалить");
}

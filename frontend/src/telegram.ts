export type TelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};

type HapticFeedback = {
  impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
  notificationOccurred: (type: "error" | "success" | "warning") => void;
  selectionChanged: () => void;
};

type TelegramWebApp = {
  initData: string;
  initDataUnsafe?: { user?: TelegramUser };
  colorScheme?: "light" | "dark";
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  HapticFeedback?: HapticFeedback;
  MainButton?: {
    text: string;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
  };
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function getTelegramApp(): TelegramWebApp | undefined {
  return window.Telegram?.WebApp;
}

export function bootTelegram(): TelegramUser | undefined {
  const app = getTelegramApp();
  if (!app) return undefined;
  app.ready();
  app.expand();
  app.setHeaderColor?.("#f5efe4");
  app.setBackgroundColor?.("#f5efe4");
  return app.initDataUnsafe?.user;
}

/** Safe haptic feedback — works in Telegram, no-ops in browser */
export function hapticImpact(style: "light" | "medium" | "heavy" | "rigid" | "soft" = "light"): void {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
  } catch {
    // Silently ignore outside Telegram
  }
}

export function hapticSuccess(): void {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
  } catch {
    // Silently ignore outside Telegram
  }
}


export type TelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
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


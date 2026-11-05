import { registerSW } from "virtual:pwa-register";

export function registerPwa() {
  if (import.meta.env.DEV) return;

  const updateSW = registerSW({
    immediate: true,
    onOfflineReady() {
      console.info("[PWA] Conteúdo disponível offline.");
    },
    onNeedRefresh() {
      void updateSW(true);
    },
    onRegistered(registration) {
      if (registration) {
        void registration.update();
        window.setInterval(
          () => {
            void registration.update();
          },
          15 * 60 * 1000,
        );
      }
    },
  });
}

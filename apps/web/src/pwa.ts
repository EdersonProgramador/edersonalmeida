import { registerSW } from "virtual:pwa-register";

export function registerPwa() {
  if (import.meta.env.DEV) return;

  registerSW({
    immediate: true,
    onOfflineReady() {
      console.info("[PWA] Conteúdo disponível offline.");
    },
    onRegistered(registration) {
      if (registration) {
        window.setInterval(
          () => {
            void registration.update();
          },
          60 * 60 * 1000,
        );
      }
    },
  });
}

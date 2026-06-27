type ServiceWorkerWindow = Window &
  typeof globalThis & {
    __MUSHROOM_SW_UPDATE__?: ServiceWorkerRegistration;
  };

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  if (import.meta.env.DEV) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .then(() => caches.keys())
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .catch(() => {
          // Local development should keep running even when cache cleanup is unavailable.
        });
    });
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;

          if (!worker) {
            return;
          }

          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              (window as ServiceWorkerWindow).__MUSHROOM_SW_UPDATE__ = registration;
              window.dispatchEvent(new CustomEvent("mushroom:update-ready"));
            }
          });
        });
      })
      .catch(() => {
        // Registration failure should not block the app shell.
      });
  });
}

export function activatePendingUpdate() {
  const registration = (window as ServiceWorkerWindow).__MUSHROOM_SW_UPDATE__;
  registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
  window.location.reload();
}

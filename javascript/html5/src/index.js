import { getDefaultSettings } from "./config/configuration.js";
import { GameEngine } from "./core/game-engine.js";
import { PersistenceManager } from "./persistence/persistence-manager.js";
import { GameController } from "./ui/game-controller.js";
import { GameView } from "./ui/game-view.js";

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Offline support is best-effort and must not block gameplay.
    });
  }
}

const rootElement = document.getElementById("app");
const persistence = new PersistenceManager();
const settings = persistence.loadSettings() || getDefaultSettings();
const engine = new GameEngine(settings);
const view = new GameView(rootElement);
const controller = new GameController({ engine, view, persistence });

controller.init();
registerServiceWorker();

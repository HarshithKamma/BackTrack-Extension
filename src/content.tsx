import React from "react";
import { createRoot } from "react-dom/client";
import { ChatNavigator } from "./components/ChatNavigator";
import { EXTENSION_ROOT_ID, detectPlatform } from "./constants";

// Import CSS as inline string for Shadow DOM injection
import styles from "./style.css?inline";

/**
 * Initialize the BackTrack extension
 * Creates a Shadow DOM root to prevent style conflicts with host page
 */
function initBackTrack(): void {
  // Check if already initialized
  if (document.getElementById(EXTENSION_ROOT_ID)) {
    console.log("[BackTrack] Already initialized");
    return;
  }

  // Detect platform
  const platform = detectPlatform();
  if (platform === "unknown") {
    console.log("[BackTrack] Unknown platform, not initializing");
    return;
  }

  console.log(`[BackTrack] Initializing on ${platform}`);

  // Create the root container
  const rootContainer = document.createElement("div");
  rootContainer.id = EXTENSION_ROOT_ID;
  document.body.appendChild(rootContainer);

  // Create Shadow DOM
  const shadowRoot = rootContainer.attachShadow({ mode: "open" });

  // Inject Tailwind CSS into Shadow DOM
  const styleElement = document.createElement("style");
  styleElement.textContent = styles;
  shadowRoot.appendChild(styleElement);

  // Create React mount point inside Shadow DOM
  const reactRoot = document.createElement("div");
  reactRoot.id = "backtrack-react-root";
  shadowRoot.appendChild(reactRoot);

  // Mount React application
  const root = createRoot(reactRoot);
  root.render(
    <React.StrictMode>
      <ChatNavigator />
    </React.StrictMode>
  );

  console.log("[BackTrack] Successfully initialized");
}

/**
 * Wait for DOM to be ready before initializing
 */
function onReady(callback: () => void): void {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    // DOM is already ready
    callback();
  }
}

// Initialize when ready
onReady(() => {
  // Small delay to ensure the page has fully loaded
  setTimeout(initBackTrack, 500);
});

// Handle page navigation in SPAs
let lastUrl = location.href;
new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    console.log("[BackTrack] URL changed, checking initialization...");
    setTimeout(initBackTrack, 500);
  }
}).observe(document.body, { subtree: true, childList: true });

import type { Platform, PlatformConfig } from "./types";

/**
 * Platform-specific DOM selector configurations
 * Using Strategy Pattern for extensibility
 */
export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig | null> = {
  chatgpt: {
    name: "ChatGPT",
    hostname: "chatgpt.com",
    selectors: [
      '[data-message-author-role="user"]',
      '[data-testid="user-message"]',
    ],
    containerSelector: "main",
  },
  claude: {
    name: "Claude",
    hostname: "claude.ai",
    selectors: [
      '[data-testid="user-message"]',
      '[data-is-user-message="true"]',
      ".font-user-message",
      ".human-turn",
      '[class*="human"]',
      '[class*="user-message"]',
    ],
    containerSelector: "main",
  },
  gemini: {
    name: "Gemini",
    hostname: "gemini.google.com",
    selectors: [
      '[data-message-author-id="user"]',
      ".query-content",
      ".user-query",
      ".user-query-wrapper",
      '[data-test-id="user-query"]',
      '[class*="query-text"]',
      'message-content[data-is-user-turn="true"]',
    ],
    containerSelector: "main",
  },
  groq: {
    name: "Groq",
    hostname: "groq.com",
    selectors: [
      ".message-user",
      '[data-role="user"]',
      '[data-message-role="user"]',
    ],
    containerSelector: "main",
  },
  unknown: null,
};

/**
 * Detect the current platform based on hostname
 */
export function detectPlatform(): Platform {
  const hostname = window.location.hostname;

  if (hostname.includes("chatgpt.com")) return "chatgpt";
  if (hostname.includes("claude.ai")) return "claude";
  if (hostname.includes("gemini.google.com")) return "gemini";
  if (hostname.includes("groq.com")) return "groq";

  return "unknown";
}

/**
 * Get the configuration for a specific platform
 */
export function getPlatformConfig(platform: Platform): PlatformConfig | null {
  return PLATFORM_CONFIGS[platform];
}

/**
 * Default panel dimensions
 */
export const DEFAULT_PANEL_SIZE = {
  width: 320,
  height: 400,
};

/**
 * Minimum panel dimensions
 */
export const MIN_PANEL_SIZE = {
  width: 250,
  height: 200,
};

/**
 * Maximum text length before truncation
 */
export const MAX_PROMPT_TEXT_LENGTH = 80;

/**
 * Debounce delay for DOM scanning (ms)
 */
export const SCAN_DEBOUNCE_DELAY = 300;

/**
 * Extension root element ID
 */
export const EXTENSION_ROOT_ID = "ai-chat-navigator-root";

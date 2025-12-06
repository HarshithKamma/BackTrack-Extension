/**
 * Supported AI chat platforms
 */
export type Platform = "chatgpt" | "claude" | "gemini" | "groq" | "unknown";

/**
 * Configuration for each platform's DOM selectors
 */
export interface PlatformConfig {
  name: string;
  hostname: string;
  selectors: string[];
  containerSelector?: string;
}

/**
 * Represents a single user prompt/message found in the chat
 */
export interface ChatPrompt {
  id: string;
  index: number;
  text: string;
  element: Element;
  timestamp: number;
}

/**
 * Position state for the draggable panel
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Size state for the resizable panel
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * State returned by the useChatScanner hook
 */
export interface ChatScannerState {
  prompts: ChatPrompt[];
  platform: Platform;
  isScanning: boolean;
  rescan: () => void;
}

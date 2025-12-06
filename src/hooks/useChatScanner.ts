import { useState, useEffect, useCallback, useRef } from "react";
import type { ChatPrompt, ChatScannerState, Platform } from "../types";
import {
  detectPlatform,
  getPlatformConfig,
  SCAN_DEBOUNCE_DELAY,
  MAX_PROMPT_TEXT_LENGTH,
} from "../constants";

/**
 * Debounce utility function
 */
function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Extract clean text from an element, handling images
 */
function extractText(element: Element): string {
  let text = element.textContent?.trim() || "";
  
  // Check for images in the prompt
  const images = element.querySelectorAll("img");
  const hasImages = images.length > 0;
  
  // If there's no text but there are images, create a placeholder
  if (!text && hasImages) {
    const imageCount = images.length;
    text = imageCount === 1 ? "📷 [Image]" : `📷 [${imageCount} Images]`;
  } else if (text && hasImages) {
    // If there's both text and images, append image indicator
    text = `📷 ${text}`;
  }
  
  // Truncate if too long
  if (text.length > MAX_PROMPT_TEXT_LENGTH) {
    return text.substring(0, MAX_PROMPT_TEXT_LENGTH) + "...";
  }
  return text;
}

/**
 * Generate a unique ID for a prompt element
 */
function generatePromptId(element: Element, index: number): string {
  // Use a combination of index and element position for uniqueness
  const rect = element.getBoundingClientRect();
  return `prompt-${index}-${Math.round(rect.top)}-${Math.round(rect.left)}`;
}

/**
 * Custom hook that scans the DOM for user prompts using MutationObserver
 * Implements Strategy Pattern for platform-specific selectors
 */
export function useChatScanner(): ChatScannerState {
  const [prompts, setPrompts] = useState<ChatPrompt[]>([]);
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [isScanning, setIsScanning] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const scannedElementsRef = useRef<WeakSet<Element>>(new WeakSet());

  /**
   * Core scanning function - finds all user prompts in the DOM
   */
  const scanForPrompts = useCallback(() => {
    const currentPlatform = detectPlatform();
    setPlatform(currentPlatform);

    const config = getPlatformConfig(currentPlatform);
    if (!config) {
      console.log("[BackTrack] Unknown platform, skipping scan");
      return;
    }

    setIsScanning(true);

    try {
      const foundPrompts: ChatPrompt[] = [];
      let index = 0;

      // Try each selector for the platform
      for (const selector of config.selectors) {
        const elements = document.querySelectorAll(selector);

        elements.forEach((element) => {
          const text = extractText(element);

          // Skip empty prompts
          if (!text) return;

          foundPrompts.push({
            id: generatePromptId(element, index),
            index: index + 1, // 1-based indexing for display
            text,
            element,
            timestamp: Date.now(),
          });

          index++;
        });

        // If we found prompts with this selector, stop trying others
        if (foundPrompts.length > 0) break;
      }

      setPrompts(foundPrompts);
      console.log(
        `[BackTrack] Found ${foundPrompts.length} prompts on ${config.name}`
      );
    } catch (error) {
      console.error("[BackTrack] Error scanning for prompts:", error);
    } finally {
      setIsScanning(false);
    }
  }, []);

  /**
   * Debounced version of the scan function
   */
  const debouncedScan = useCallback(
    debounce(() => {
      scanForPrompts();
    }, SCAN_DEBOUNCE_DELAY),
    [scanForPrompts]
  );

  /**
   * Manual rescan trigger
   */
  const rescan = useCallback(() => {
    scannedElementsRef.current = new WeakSet();
    scanForPrompts();
  }, [scanForPrompts]);

  /**
   * Set up MutationObserver to watch for DOM changes
   */
  useEffect(() => {
    // Initial scan
    scanForPrompts();

    // Create mutation observer
    observerRef.current = new MutationObserver((mutations) => {
      // Check if any mutation added nodes that might be relevant
      const hasRelevantChanges = mutations.some((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          return true;
        }
        if (mutation.type === "characterData") {
          return true;
        }
        return false;
      });

      if (hasRelevantChanges) {
        debouncedScan();
      }
    });

    // Start observing the document body
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [scanForPrompts, debouncedScan]);

  /**
   * Re-scan when URL changes (for SPA navigation)
   */
  useEffect(() => {
    const handleUrlChange = () => {
      // Small delay to allow DOM to update after navigation
      setTimeout(() => {
        scannedElementsRef.current = new WeakSet();
        scanForPrompts();
      }, 500);
    };

    // Listen for popstate (browser back/forward)
    window.addEventListener("popstate", handleUrlChange);

    // Listen for pushState/replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleUrlChange();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      handleUrlChange();
    };

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [scanForPrompts]);

  return {
    prompts,
    platform,
    isScanning,
    rescan,
  };
}

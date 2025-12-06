import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  GripVertical,
  RefreshCw,
  Minimize2,
  List,
  MessageSquare,
} from "lucide-react";
import { useChatScanner } from "../hooks/useChatScanner";
import type { ChatPrompt, Position, Size } from "../types";
import {
  DEFAULT_PANEL_SIZE,
  MIN_PANEL_SIZE,
  PLATFORM_CONFIGS,
} from "../constants";

/**
 * Smooth scroll to a specific prompt element
 */
function scrollToPrompt(prompt: ChatPrompt): void {
  prompt.element.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  // Add a brief highlight effect
  const originalOutline = (prompt.element as HTMLElement).style.outline;
  const originalTransition = (prompt.element as HTMLElement).style.transition;

  (prompt.element as HTMLElement).style.transition = "outline 0.3s ease";
  (prompt.element as HTMLElement).style.outline = "2px solid #6366f1";

  setTimeout(() => {
    (prompt.element as HTMLElement).style.outline = originalOutline;
    setTimeout(() => {
      (prompt.element as HTMLElement).style.transition = originalTransition;
    }, 300);
  }, 1500);
}

/**
 * PromptItem - Individual prompt in the list
 */
interface PromptItemProps {
  prompt: ChatPrompt;
  onClick: () => void;
}

function PromptItem({ prompt, onClick }: PromptItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-lg transition-all duration-200
                 hover:bg-white/10 active:bg-white/15
                 border border-transparent hover:border-accent-500/30
                 group flex items-start gap-3"
    >
      {/* Number badge */}
      <span
        className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-600/30 
                      text-accent-300 text-xs font-semibold
                      flex items-center justify-center
                      group-hover:bg-accent-600/50 transition-colors"
      >
        {prompt.index}
      </span>

      {/* Prompt text */}
      <span className="text-sm text-gray-200 leading-relaxed group-hover:text-white transition-colors">
        {prompt.text}
      </span>
    </button>
  );
}

/**
 * ChatNavigator - Main floating panel component
 */
export function ChatNavigator() {
  // State
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 20, y: 100 });
  const [size, setSize] = useState<Size>(DEFAULT_PANEL_SIZE);

  // Refs for drag and resize
  const panelRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const dragStartRef = useRef<Position>({ x: 0, y: 0 });
  const resizeStartRef = useRef<Size>({ width: 0, height: 0 });

  // Get prompts from scanner
  const { prompts, platform, isScanning, rescan } = useChatScanner();
  const platformConfig = platform !== "unknown" ? PLATFORM_CONFIGS[platform] : null;

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    },
    [position]
  );

  /**
   * Handle resize start
   */
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isResizingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      resizeStartRef.current = { ...size };
    },
    [size]
  );

  /**
   * Handle mouse move (drag or resize)
   */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const newX = Math.max(
          0,
          Math.min(window.innerWidth - size.width, e.clientX - dragStartRef.current.x)
        );
        const newY = Math.max(
          0,
          Math.min(window.innerHeight - 50, e.clientY - dragStartRef.current.y)
        );
        setPosition({ x: newX, y: newY });
      }

      if (isResizingRef.current) {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;

        const newWidth = Math.max(
          MIN_PANEL_SIZE.width,
          resizeStartRef.current.width + deltaX
        );
        const newHeight = Math.max(
          MIN_PANEL_SIZE.height,
          resizeStartRef.current.height + deltaY
        );

        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      isResizingRef.current = false;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [size.width]);

  /**
   * Handle click on a prompt
   */
  const handlePromptClick = useCallback((prompt: ChatPrompt) => {
    scrollToPrompt(prompt);
  }, []);

  // Collapsed state - just show a small icon
  if (isCollapsed) {
    return (
      <div
        ref={panelRef}
        style={{
          position: "fixed",
          top: position.y,
          left: position.x,
          zIndex: 2147483647,
        }}
        className="animate-fade-in"
      >
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-12 h-12 rounded-xl
                     bg-gray-900/90 backdrop-blur-xl
                     border border-white/10
                     shadow-2xl shadow-black/50
                     flex items-center justify-center
                     hover:bg-gray-800/90 hover:border-accent-500/30
                     transition-all duration-200
                     group"
          title="Expand BackTrack"
        >
          <List className="w-5 h-5 text-accent-400 group-hover:text-accent-300" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        top: position.y,
        left: position.x,
        width: size.width,
        height: size.height,
        zIndex: 2147483647,
      }}
      className="flex flex-col rounded-2xl overflow-hidden
                 bg-gray-900/80 backdrop-blur-xl
                 border border-white/10
                 shadow-2xl shadow-black/50
                 animate-slide-in"
    >
      {/* Header - Draggable */}
      <div
        onMouseDown={handleDragStart}
        className="flex items-center justify-between px-4 py-3
                   bg-gradient-to-r from-gray-900/50 to-gray-800/50
                   border-b border-white/5
                   cursor-grab active:cursor-grabbing
                   select-none"
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-500" />
          <MessageSquare className="w-4 h-4 text-accent-400" />
          <span className="text-sm font-semibold text-white">BackTrack</span>
          {platformConfig && (
            <span className="text-xs text-gray-400 ml-1">
              • {platformConfig.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Refresh button */}
          <button
            onClick={rescan}
            disabled={isScanning}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            title="Rescan prompts"
          >
            <RefreshCw
              className={`w-4 h-4 text-gray-400 hover:text-white ${
                isScanning ? "animate-spin" : ""
              }`}
            />
          </button>

          {/* Collapse button */}
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Minimize"
          >
            <Minimize2 className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
        </div>
      </div>

      {/* Content - Scrollable prompt list */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {prompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <MessageSquare className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">No prompts found yet</p>
            <p className="text-xs text-gray-500 mt-1">
              Start a conversation to see your prompts here
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {prompts.map((prompt) => (
              <PromptItem
                key={prompt.id}
                prompt={prompt}
                onClick={() => handlePromptClick(prompt)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer with count */}
      <div
        className="px-4 py-2 border-t border-white/5
                      bg-gradient-to-r from-gray-900/50 to-gray-800/50
                      flex items-center justify-between"
      >
        <span className="text-xs text-gray-500">
          {prompts.length} prompt{prompts.length !== 1 ? "s" : ""}
        </span>

        {/* Resize handle */}
        <div
          onMouseDown={handleResizeStart}
          className="w-4 h-4 cursor-se-resize flex items-center justify-center
                     text-gray-600 hover:text-gray-400 transition-colors"
          title="Resize"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="currentColor"
          >
            <path d="M9 1v8H1" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 5v4H5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyFileSync, mkdirSync, existsSync, readdirSync } from "fs";

// Plugin to copy manifest and icons to dist
function copyExtensionFiles() {
  return {
    name: "copy-extension-files",
    closeBundle() {
      // Copy manifest.json
      copyFileSync(
        resolve(__dirname, "manifest.json"),
        resolve(__dirname, "dist/manifest.json")
      );

      // Copy icons if they exist
      const iconsDir = resolve(__dirname, "icons");
      const distIconsDir = resolve(__dirname, "dist/icons");

      if (existsSync(iconsDir)) {
        if (!existsSync(distIconsDir)) {
          mkdirSync(distIconsDir, { recursive: true });
        }

        const iconFiles = readdirSync(iconsDir);
        iconFiles.forEach((file) => {
          copyFileSync(
            resolve(iconsDir, file),
            resolve(distIconsDir, file)
          );
        });
      }

      console.log("✅ Extension files copied to dist/");
    },
  };
}

export default defineConfig({
  plugins: [react(), copyExtensionFiles()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    cssCodeSplit: false,
    minify: true,
    rollupOptions: {
      input: {
        content: resolve(__dirname, "src/content.tsx"),
      },
      output: {
        // IIFE format for Chrome Extension content scripts
        format: "iife",
        // Single output file for content script
        entryFileNames: "[name].js",
        // Inline all CSS into JS (we'll extract it for Shadow DOM)
        inlineDynamicImports: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});

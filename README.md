# BackTrack 🔙

A Chrome Extension that adds a floating, draggable table of contents to AI chat interfaces. Navigate your prompts with ease!

## Features

- 📋 **Prompt Navigator** - See all your prompts in a clean sidebar
- 🎯 **Quick Navigation** - Click any prompt to smooth-scroll to it
- 🎨 **Beautiful UI** - Dark mode with glassmorphism design
- 🖱️ **Draggable & Resizable** - Position it wherever you want
- 🔄 **Auto-Updates** - Automatically detects new prompts
- 🛡️ **Shadow DOM** - Styles don't interfere with host pages

## Supported Platforms

- ✅ ChatGPT (chatgpt.com)
- ✅ Claude (claude.ai)
- ✅ Gemini (gemini.google.com)
- ✅ Groq (groq.com)

## Tech Stack

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Installation

### Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/backtrack-extension.git
   cd backtrack-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create placeholder icons** (or use your own)
   ```bash
   # Create simple placeholder icons (16x16, 48x48, 128x128 PNG files)
   # Place them in the icons/ directory
   ```

4. **Build the extension**
   ```bash
   npm run build
   ```

5. **Load into Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `dist` folder

### Development Mode

For hot-reload during development:
```bash
npm run dev
```
Note: You'll need to reload the extension in Chrome after changes.

## Project Structure

```
backtrack-extension/
├── src/
│   ├── components/
│   │   └── ChatNavigator.tsx    # Main UI component
│   ├── hooks/
│   │   └── useChatScanner.ts    # DOM scanning logic
│   ├── content.tsx              # Entry point
│   ├── constants.ts             # Platform configs
│   ├── types.ts                 # TypeScript types
│   └── style.css                # Tailwind directives
├── icons/                       # Extension icons
├── manifest.json                # Chrome extension manifest
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind configuration
└── package.json
```

## How It Works

1. **Platform Detection** - Detects which AI chat platform you're on
2. **DOM Scanning** - Uses `MutationObserver` to find user prompts
3. **Shadow DOM** - Injects UI in an isolated shadow root
4. **Strategy Pattern** - Platform-specific selectors for each service

## Configuration

Platform selectors are defined in `src/constants.ts`. To add support for a new platform:

```typescript
export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig | null> = {
  // ... existing configs
  newPlatform: {
    name: "New Platform",
    hostname: "newplatform.com",
    selectors: [".user-message-selector"],
    containerSelector: "main",
  },
};
```

## License

MIT License - feel free to use and modify!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

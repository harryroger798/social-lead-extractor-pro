# ByteCare Desktop App

Electron-based desktop application for ByteCare Repair Shop Management System.

## Development

```bash
# Install dependencies
npm install

# Start in development mode (requires client running on localhost:5173)
npm start
```

## Building

```bash
# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac

# Build for Linux
npm run build:linux
```

## Building for Production

Before building the desktop app, you need to build the client and copy the files:

```bash
# From the root directory
cd ../client
npm run build

# Copy built files to desktop/renderer
cp -r dist/* ../desktop/renderer/
```

Then build the desktop app:

```bash
npm run build:win
```

The installer will be created in the `dist` folder.

## Features

- Native Windows/macOS/Linux application
- Auto-updates support
- Keyboard shortcuts for common actions
- Native file dialogs for exports
- Offline-first with local SQLite database

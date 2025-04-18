# Chesser Custom – Version 0.2.1-custom

This is a customized fork of the Chesser plugin for Obsidian, focused on multi-device usage, persistent vault storage, and mobile UX improvements.

---

## Functional Improvements

### Vault-Based State Storage
- Replaces `localStorage` with `.ChesserStorage/` in the vault
- Uses Obsidian's adapter API for read/write
- Fully synced across devices (e.g., via Git or Obsidian Sync)
- Mobile-compatible (no localStorage issues on mobile)

### PGN Initialization Support
- Define a `pgn:` block inside the code block
- Automatically parses and normalizes the PGN
- Initializes the board accordingly
- Fallback to `fen:` if PGN is not present

````
```chesser
pgn: 1. e4 e6 2. d4 d5 3. Nc3 Bb4
```
````

### "Init" Button
- Adds a button to reset the board to the starting position (PGN/FEN)

### Reset Button Icon
- Updated the reset icon to `"home"` for clarity

### "Copy PGN" Button
- Added `Copy PGN` button in the chessboard toolbar.
- Allows users to copy the current game in PGN format to the clipboard.
- Returns `'1...'` if no moves have been played.

### Hide Free Move Option
- The "Enable Free Move?" toggle is hidden via CSS
- The functionality is still available internally

---

## Mobile Enhancements

### Responsive Chessboard
- The board scales with screen size (no horizontal scrolling)
- Maintains square aspect ratio via `::before` CSS trick

### Adaptive Toolbar
- Toolbar appears above the menu on mobile
- Improved button spacing for touch interaction

---

## How to Build & Install Chesser Custom

This guide explains how to clone, build, and install the plugin manually in Obsidian.

---

### 1. Prerequisites

- Install [Node.js (LTS version)](https://nodejs.org/)
  - This also installs `npm` (Node Package Manager)
  - To verify installation:
    ```bash
    node -v
    npm -v
    ```

---

### 2️. Clone the Repository

Open a terminal or Git Bash and run:

```bash
git clone https://github.com/123vincent/Chesser.git
cd Chesser
```

---

### 3️. Install Dependencies

Inside the project folder:

```bash
npm install
```

This will install all required packages from `package.json`.

---

### 4️. Build the Plugin

```bash
npm run build
```

This will generate the compiled plugin files:
- `main.js`
- `manifest.json`
- `styles.css`

   You should now see these files in the project's `dist/` folder.

---

### 5️. Install the Plugin in Obsidian

1. Open your Obsidian vault folder
2. Go to: `.obsidian/plugins/`
3. Create a folder called `chesser-custom`
4. Copy these 3 files into that folder:
   - `main.js`
   - `manifest.json`
   - `styles.css`
5. In Obsidian:
   - Go to **Settings → Community Plugins**
   - Click **Reload plugins** (or restart Obsidian)
   - Enable **Chesser** (your custom version)

---

Your custom version of Chesser is now active — enjoy your synced, mobile-ready chess experience!

Built with ❤️ by [VincentB.](https://github.com/123vincent), based on the original plugin by [SilentVoid](https://github.com/SilentVoid13).

# Advanced Search Operators

> **v1.0.0** &middot; [MIT License](LICENSE) &middot; Chrome Extension (Manifest V3)

A comprehensive Chrome extension that puts every Google search operator at your fingertips. Build complex queries visually, validate them, save as templates, and search across 13 engines.

---

## Features

- **79 Search Operators** across 11 categories with descriptions, syntax, and examples
- **Visual Query Builder** &mdash; drag-and-drop blocks, reorder, duplicate, live preview
- **Autocomplete** &mdash; fuzzy operator suggestions as you type
- **Query Validator** &mdash; detects unknown operators, missing quotes, duplicates, deprecated operators, unclosed quotes, and missing values
- **Templates** &mdash; save, edit, delete, import/export query templates (built-in presets included)
- **Search History** &mdash; auto-saves searches, pin favorites, search statistics
- **Export** &mdash; export templates and history as JSON, TXT, Markdown, or CSV
- **Multi-Engine** &mdash; search on Google, Bing, DuckDuckGo, GitHub, GitLab, StackOverflow, Reddit, YouTube, Google Scholar, Arxiv, NPM, PyPI, and Docker Hub
- **Dark Mode** &mdash; automatic theme support
- **Keyboard Shortcuts** &mdash; Ctrl+Shift+S to open the side panel

---

## Installation

Since this extension is not yet published on the Chrome Web Store, install it in developer mode:

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the `extension` folder from this repository
6. The extension icon will appear in your toolbar

### Build from source

```bash
# Install dependencies
cd extension
npm install

# Build for production
npm run build

# Or run in development mode
npm run dev
```

---

## Usage

### Explorer
Browse all 79 operators by category. Search by name or operator. Click any operator to see its description, syntax, example, and compatibility.

### Builder
Add operators as blocks, fill in values, and arrange them via drag-and-drop. The live query preview updates in real time. Click the search button to open the query in your selected search engine.

### Validator
Paste any raw search query and get instant feedback: unknown operators, missing quotes, duplicate operators, and more.

### Templates
Save your current builder query as a reusable template. Built-in templates include OSINT Search, Research Papers, PDF Search, and Bug Hunting.

### History
Every search is automatically saved. Pin important searches, mark favorites, and review your search statistics.

### Export
Export your templates and history in JSON, Plain Text, Markdown, or CSV format. Share your current query as a URL or shareable text.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Core | TypeScript, React 18 |
| Build | Vite |
| Styling | TailwindCSS, shadcn/ui |
| State | Zustand, Chrome Storage API |
| Extension | Manifest V3 |
| Drag & Drop | @dnd-kit |
| Testing | Vitest, Playwright |
| Linting | ESLint, Prettier |

---

## Project Structure

```
extension/
├── public/
│   ├── background.js
│   └── icons/
├── src/
│   ├── components/
│   │   ├── builder/        # Visual query builder
│   │   ├── explorer/       # Operator explorer
│   │   ├── export/         # Export view
│   │   ├── history/        # Search history
│   │   ├── layout/         # Header, navigation, side panel
│   │   ├── settings/       # Settings page
│   │   ├── templates/      # Template management
│   │   ├── ui/             # Shared UI components (shadcn/ui)
│   │   └── validator/      # Query validator
│   ├── data/
│   │   ├── operators/      # Operator definitions by category
│   │   └── engines.ts      # Search engine definitions
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── search/             # Query validator engine
│   ├── services/           # Export service
│   ├── types/              # TypeScript type definitions
│   └── main.tsx            # Application entry point
├── tests/
├── manifest.json
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Roadmap

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Foundation & project setup | Done |
| 2 | Operator database (79 operators) | Done |
| 3 | Operator explorer & dark mode | Done |
| 4 | Visual search builder (drag-and-drop) | Done |
| 5 | Autocomplete suggestions | Done |
| 6 | Query validator (6 rule types) | Done |
| 7 | Templates (CRUD, import/export) | Done |
| 8 | Search history & statistics | Done |
| 9 | Export (JSON, TXT, MD, CSV) & share | Done |
| 10 | Multi-engine support (13 engines) | Done |

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for the process and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community guidelines.

---

## License

[MIT](LICENSE) &copy; 2026 Chanila Vidmal Wijayasundara

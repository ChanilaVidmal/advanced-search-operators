# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2026-07-30

### Added
- Natural language (NL) query parser for converting plain English to search operators
- Engine-specific operator support (operators now scoped to compatible search engines)
- Enhanced settings page with new configuration options
- Chrome Web Store assets (icons, screenshots, descriptions)
- Multi-engine search support across 13 search engines
- Export functionality (JSON, TXT, Markdown, CSV)
- Search history with auto-save, statistics, and load-to-builder
- Query validator with 6 rule types (unknown operators, missing quotes, duplicates, deprecated operators, unclosed quotes, missing values)
- Template management with CRUD operations, import/export, and built-in presets
- Visual query builder with drag-and-drop blocks, reorder, duplicate, and live preview
- Autocomplete suggestions for operators as you type
- Operator explorer with 79 operators across 11 categories
- Dark mode with automatic theme support
- Keyboard shortcuts (Ctrl+Shift+S to open side panel)
- Share query as URL or shareable text

### Fixed
- NL parser site extraction logic
- Operator data lookup accuracy
- Theme coordination between components
- Resolved 21 bugs across 7 files

### Changed
- Full Manifest V3 migration
- React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui stack
- Zustand + Chrome Storage API for state management
- @dnd-kit for drag-and-drop functionality

## [1.0.0] - 2026-01-01

### Added
- Initial release with core operator explorer and search builder
- Foundation project setup
- Operator database with 79 operators
- Basic visual search builder
- Autocomplete suggestions
- Dark mode support

[Unreleased]: https://github.com/chanilavidmal/advanced-search-operators/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/chanilavidmal/advanced-search-operators/releases/tag/v2.0.0
[1.0.0]: https://github.com/chanilavidmal/advanced-search-operators/releases/tag/v1.0.0

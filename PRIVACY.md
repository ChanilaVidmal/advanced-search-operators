# Privacy Policy

Last updated: 2026

## Overview

Advanced Search Operators is a Chrome extension that helps users build and manage search queries using advanced search operators. This privacy policy explains what data the extension collects and how it is used.

## Data Collection

The extension **does not collect, transmit, or share any personal data**. All data is stored locally on your device using Chrome's built-in `storage.sync` API and/or `localStorage`.

## What Data Is Stored Locally

The following data is stored **only on your device** and is never sent to any server:

- **Search history** — queries you have executed via the Builder
- **Saved templates** — query templates you create
- **Builder state** — current blocks in the visual builder
- **Settings** — theme preference, default search engine, export format
- **Recently viewed operators** — for the recently viewed feature

## Chrome Sync

If you are signed into Chrome with a Google account and have Chrome Sync enabled, some of the above data (stored via `storage.sync`) may be synchronized across your signed-in devices. This is handled entirely by Chrome's built-in sync infrastructure. The extension developers do not have access to this data.

## Third-Party Services

The extension does **not** use any third-party analytics, tracking, or advertising services. It makes no network requests except when you explicitly click the search button, which opens a new tab to your selected search engine with your query.

## Permissions

The extension requests the following permissions:

- `storage` — to save your templates, history, and settings locally
- `sidePanel` — to display the extension in Chrome's side panel
- `tabs` — to open search results in a new tab when you execute a query
- `commands` — to support keyboard shortcuts (Ctrl+Shift+S)

## Changes

This privacy policy may be updated occasionally. The "Last updated" date at the top will reflect the most recent revision.

## Contact

For questions about this privacy policy, please open an issue on the project's GitHub repository.

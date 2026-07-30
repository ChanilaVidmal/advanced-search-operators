# Contributing

Thank you for your interest in contributing to Advanced Search Operators!

## How to contribute

### Reporting bugs

- Open an issue describing the bug
- Include steps to reproduce, expected behavior, and actual behavior
- Mention your browser version and operating system

### Feature requests

- Open an issue with the label `enhancement`
- Describe the feature, why it's useful, and any implementation ideas

### Pull requests

1. Fork the repository
2. Create a feature branch from `develop`:
   ```bash
   git checkout develop
   git checkout -b feature/your-feature
   ```
3. Make your changes
4. Ensure the build passes:
   ```bash
   cd extension
   npm run build
   ```
5. Commit using conventional commit style:
   ```
   feat: add new feature
   fix: correct behavior of X
   docs: update README
   refactor: restructure Y
   test: add tests for Z
   ```
6. Push and open a pull request against `develop`

### Development setup

```bash
git clone <your-fork>
cd extension
npm install
npm run dev    # development server with hot reload
npm run build  # production build
npm test       # run tests
```

### Branch naming

- `feature/*` — new features
- `fix/*` — bug fixes
- `docs/*` — documentation changes
- `refactor/*` — code refactoring

### Code style

- TypeScript strict mode
- ESLint and Prettier configurations are provided
- Run `npm run lint` before committing

---

Thank you for contributing!

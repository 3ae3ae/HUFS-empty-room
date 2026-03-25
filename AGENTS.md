# Repository Guidelines

## Project Structure & Module Organization
This repository is a Vite + React + TypeScript app. Application code lives in `src/`. Route-level screens are in `src/pages/`, shared UI wrappers are in `src/components/`, and reusable helpers/data loaders are in `src/lib/`. Static schedule data currently lives in `src/data/subjects.json`. Entry points are `src/main.tsx` and `src/App.tsx`. Root config files include `vite.config.ts`, `tsconfig.json`, and `package.json`.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start the local Vite dev server on port `3000`.
- `npm run build`: create a production build in `dist/`.
- `npm run preview`: serve the built app locally for a production-like check.
- `npm run lint`: run TypeScript type-checking with `tsc --noEmit`.
- `npm run clean`: remove the `dist/` directory.

## Coding Style & Naming Conventions
Use TypeScript with React function components. Follow the existing style in `src/`: semicolons, single quotes in most files, and spaced imports such as `import { useState } from 'react';`. Use `PascalCase` for components and page files (`Layout.tsx`, `ProfessorSearch.tsx`), and `camelCase` for utilities and local variables. Keep shared helpers in `src/lib/` and prefer small, focused modules over large mixed-purpose files.

## Testing Guidelines
There is no dedicated test framework configured yet. Until one is added, treat `npm run lint` and `npm run build` as required validation for every change. If you add tests, keep them next to the feature or under a future `src/__tests__/` directory, and name them `*.test.ts` or `*.test.tsx`.

## Commit & Pull Request Guidelines
The current history uses short, lowercase commit subjects (`initial commit`). Continue with concise, imperative summaries such as `add timetable filters` or `fix professor search state`. For pull requests, include:
- a brief description of the user-visible change,
- linked issue or task reference when available,
- screenshots or short recordings for UI changes,
- confirmation that `npm run lint` and `npm run build` passed.

## Security & Configuration Tips
Keep secrets out of source control. Local setup expects `GEMINI_API_KEY` in `.env.local`, which is exposed through `vite.config.ts` for client use. Do not hardcode API keys or commit environment-specific credentials.

# Repository Guidelines

## Project Structure & Module Organization
Super Components is a Next.js 15 App Router workspace. Core folders:
- `src/app` holds route segments, layouts, and global styles; `page.tsx` renders the landing experience.
- `src/components/ui` wraps Radix primitives in Tailwind-styled, data-slot-aware components for reuse.
- `src/hooks` groups shared React hooks such as `useIsMobile` for responsive behavior.
- `src/lib` stores utilities like `utils.ts` (`cn`) that standardize class merging.
- `public` contains static assets (SVG icons, favicons) served by Next.
Keep configuration files (`components.json`, `tsconfig.json`, `eslint.config.mjs`) aligned with component additions, and prefer the `@/` alias for intra-`src` imports.

## Build, Test, and Development Commands
- `bun install` (or `npm install`) restores dependencies; commit the resulting lockfile when versions change.
- `bun dev` / `npm run dev` starts the Turbopack-powered dev server at http://localhost:3000 with hot refresh.
- `npm run build` compiles the production bundle; resolve warnings before opening a PR.
- `npm run start` runs the built app locally for a smoke test.
- `npm run lint` applies the Next.js ESLint ruleset; treat warnings as blockers.

## Coding Style & Naming Conventions
- Use TypeScript throughout, leveraging strict mode and explicit prop typing for components.
- Follow the existing two-space indentation, double-quoted strings, and trailing commas only where required.
- Name components with PascalCase (`AccordionTrigger`), hooks with camelCase (`useIsMobile`), and co-locate variants in the same file.
- Style components with Tailwind utility classes; compose variations through `class-variance-authority` and helper `cn` to avoid inline conditionals.

## Testing Guidelines
Automated tests are not yet configured. When introducing them, place component specs alongside implementation as `*.test.tsx`, document any new tooling in `package.json`, and integrate the run command into CI. Until a harness exists, smoke-test changes via `npm run dev`, exercise relevant interactions, and capture regressions with concise reproduction notes in the PR.

## Commit & Pull Request Guidelines
Git history currently contains only the scaffold commit, so establish clarity by writing imperative, concise messages (for example, `feat: add date picker carousel`). Group unrelated changes into separate commits. PRs should include: a summary of the user-facing impact, references to issues or Linear tickets, before/after screenshots or recordings for UI shifts, and a checklist of validation steps (lint, build, manual testing). Request review once all checks pass and the branch is rebased on `main`.

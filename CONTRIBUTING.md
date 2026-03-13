# Contributing to Bazarmart

## Scope

This repository contains the Bazarmart full-stack e-commerce application.

## Development Setup

1. Install Node.js 18 or later.
2. Configure `backend/.env` using `backend/.env.example`.
3. Install backend dependencies: `cd backend && npm install`
4. Install frontend dependencies: `cd frontend && npm install`
5. Start backend: `npm run dev`
6. Start frontend: `npm run dev`

## Branch Naming

- `feature/<short-description>`
- `fix/<short-description>`
- `docs/<short-description>`
- `refactor/<short-description>`

## Pull Request Guidelines

- Keep changes focused and logically grouped.
- Avoid mixing refactors with feature work unless necessary.
- Include screenshots for UI changes.
- Mention test/build results in the PR description.
- Update documentation when behavior or setup changes.

## Commit Message Style

Use concise conventional-style messages where possible:

- `feat: add shoe color options`
- `fix: correct mobile nav cart row`
- `docs: improve repository setup guide`

## Code Quality Expectations

- Preserve the current project structure and coding style.
- Do not commit secrets, `.env` files, or generated local artifacts.
- Run `npm run build` in `frontend` before merging UI-heavy changes.

## Reporting Issues

Use the GitHub issue templates for bug reports and feature requests.
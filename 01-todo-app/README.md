# Todo App

A gamified todo list: check off tasks to earn XP, level up, grow a forest, and dress up your pet.

**Live app:** https://iamomtiwari.github.io/vibe-coding-lab/

No sign-up needed — just open the link. Your data is saved locally in your browser (`localStorage`), so it stays on the device/browser you use it on and isn't shared with anyone else.

## Features

- **Todos** — add, edit in place (double-click the text), complete, delete
- **Categories** — group todos under free-text categories
- **Recurring tasks** — mark a todo as daily/weekly; it auto-resets after its interval, with a "resets at HH:MM" hint once completed
- **Achievements** — earn XP for each completed task, level up, track total quests completed
- **Pet** — customize your pet's shape, color, and name; it reacts to you: eyes follow your cursor, click it for a heart animation, and it smiles when you complete a task
- **Accessories** — unlock a bow tie, hat, and glasses as you level up
- **Forest** — every todo plants a seed; completing it grows into a tree that stays grown, building up your own forest over time
- **Live clock** — current date and time, always visible

## Running it locally

Requires [Node.js](https://nodejs.org/) 20+.

```bash
git clone https://github.com/iamomtiwari/vibe-coding-lab.git
cd vibe-coding-lab/01-todo-app
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

## Other commands

```bash
npm test        # run the test suite (Vitest + React Testing Library)
npm run build   # production build, output in dist/
npm run lint    # lint the code
```

## Tech stack

React 19 + Vite, plain CSS, [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) for tests.

## Deployment

Pushing to `main` automatically builds and redeploys the live app via a [GitHub Actions workflow](../.github/workflows/deploy.yml) to GitHub Pages — no manual deploy step needed.

## Contributing

Changes go through a pull request into `main` (direct pushes are blocked). Branch names follow `type/short-description` (e.g. `feat/add-due-dates`), and commit messages follow the [Angular/Conventional Commits](https://github.com/semantic-release/semantic-release#commit-message-format) format: `type(scope): summary` — `feat` for a new feature, `fix` for a bug fix, `chore` for maintenance, `docs` for documentation, `test` for tests, `ci` for CI/CD changes.

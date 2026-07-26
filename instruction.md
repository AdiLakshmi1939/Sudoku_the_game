# Copilot Instructions for the Sudoku Flask Project

## Project overview
- This repository contains a Flask-based Sudoku web app with Python game logic, a browser UI, and pytest tests.
- Keep the app beginner-friendly, maintainable, and easy to extend.
- Preserve the current gameplay experience while improving structure, reliability, and polish.

## Language and style
- Use Python 3.10+ syntax and conventions.
- Follow PEP 8 style where practical.
- Prefer small, reusable functions and clear names.
- Handle errors gracefully and return helpful user-facing messages when appropriate.
- Keep logic readable and avoid unnecessary complexity.

## Architecture
- Keep Sudoku game logic separate from Flask routes.
- Preserve the existing separation between core logic modules such as sudoku_logic.py and game_service.py.
- Avoid putting business logic directly inside route handlers.
- Keep UI concerns in the frontend assets and keep the backend focused on serving data and game state.

## Sudoku rules and behavior
- Every generated puzzle must have exactly one unique solution.
- Difficulty should affect the number of prefilled cells, not the correctness of the puzzle rules.
- Prefilled cells must remain locked and should not be editable by the player.
- Preserve the core Sudoku rules and ensure generated puzzles remain valid.

## UI expectations
- Support responsive layouts for both desktop and mobile.
- Keep text readable and controls easy to use.
- Support both light and dark mode.
- Use alternating colors for the 3x3 Sudoku boxes to improve visual structure.
- Preserve accessibility by keeping focus states visible and labels descriptive.

## Leaderboard requirements
- The app should include a Top 10 leaderboard.
- Store entries in localStorage.
- Each leaderboard entry should include:
  - player name
  - completion time
  - difficulty
  - hints used
- Keep the leaderboard behavior consistent and reliable.

## Testing
- Use pytest for tests.
- Keep existing behavior working when refactoring or adding features.
- Add or update tests when changing core game logic or puzzle generation rules.
- Prefer focused tests for logic and rules rather than UI-only checks.

## Working style for Copilot
- Prefer small, targeted changes over large rewrites.
- When making changes, preserve current behavior unless the task explicitly asks for a new feature or bug fix.
- Keep solutions practical and aligned with the existing project structure.
- When editing the UI, maintain the current gameplay flow and improve polish without breaking core interactions.

# Sudoku Flask App

This project is a web-based Sudoku game built with Python and Flask. Players can choose a difficulty level, fill in the board, get hints, check their progress, and track their time. The app also includes a responsive interface, light and dark mode, and a Top 10 leaderboard that saves scores in the browser.

## What this app includes

- A playable Sudoku board with a unique-solution puzzle generator
- Difficulty selection for easy, medium, and hard games
- Hint and check buttons for support while playing
- Immediate feedback for invalid moves
- A timer and completion message when the puzzle is solved
- A Top 10 leaderboard stored in local storage
- A modern, responsive layout that works on desktop and mobile

## Prerequisites

Before you begin, make sure you have:

- Python 3.10 or newer
- A modern web browser such as Chrome, Edge, or Firefox
- A terminal or command prompt

## Running the app locally

1. Open a terminal and go to the project root.
2. Create and activate a virtual environment.

   On Windows PowerShell:
   ```bash
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

   On macOS or Linux:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install the required Python packages:

   ```bash
   pip install -r starter/requirements.txt
   ```

4. Start the Flask app:

   ```bash
   cd starter
   python app.py
   ```

5. Open your browser and visit:

   ```text
   http://127.0.0.1:5000
   ```

## Running the tests

Run the test suite from the project root with:

```bash
python -m pytest
```

If you want to run the tests using the virtual environment directly, use:

```bash
.venv\Scripts\python.exe -m pytest
```

## Notes

- If you are using Windows Command Prompt instead of PowerShell, the activation command is:

  ```bash
  .\.venv\Scripts\activate.bat
  ```

- The app is designed to be beginner-friendly, so you can explore and modify the code while keeping the game experience simple and polished.

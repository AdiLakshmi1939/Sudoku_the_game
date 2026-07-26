// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
let puzzle = [];
let solution = [];
let currentDifficulty = 'medium';
let gameCompleted = false;
let timerInterval = null;
let elapsedSeconds = 0;
const LEADERBOARD_KEY = 'sudoku-top10';
const THEME_KEY = 'sudoku-theme';

function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  const toggleButton = document.getElementById('theme-toggle');
  if (toggleButton) {
    toggleButton.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    toggleButton.setAttribute('aria-pressed', String(theme === 'dark'));
  }
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    // Ignore storage issues in restricted environments.
  }
}

function initializeTheme() {
  const savedTheme = window.localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);
}

function isValidPlacement(row, col, value) {
  if (!value) return true;
  const numericValue = Number(value);
  for (let index = 0; index < SIZE; index += 1) {
    if (index !== col && puzzle[row][index] === numericValue) return false;
    if (index !== row && puzzle[index][col] === numericValue) return false;
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r += 1) {
    for (let c = boxCol; c < boxCol + 3; c += 1) {
      if ((r !== row || c !== col) && puzzle[r][c] === numericValue) return false;
    }
  }
  return true;
}

function updateCellFeedback(input, row, col) {
  const value = input.value;
  input.classList.remove('invalid');
  if (!value) {
    input.classList.remove('invalid');
    return;
  }
  if (!isValidPlacement(row, col, Number(value))) {
    input.classList.add('invalid');
  }
}

function showMessage(text, color) {
  const msg = document.getElementById('message');
  msg.style.color = color;
  msg.innerText = text;
}

function getCellElement(row, col) {
  const boardDiv = document.getElementById('sudoku-board');
  return boardDiv.querySelector(`.sudoku-cell[data-row="${row}"][data-col="${col}"]`);
}

function updateCellAccessibility(input) {
  const row = Number(input.dataset.row);
  const col = Number(input.dataset.col);
  const value = input.value || 'empty';
  const status = input.disabled ? 'prefilled' : 'editable';
  input.setAttribute('aria-label', `Row ${row + 1}, column ${col + 1}, ${status}, value ${value}`);
}

function updateTimerDisplay() {
  const timer = document.getElementById('timer');
  const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const seconds = String(elapsedSeconds % 60).padStart(2, '0');
  timer.innerText = `Time: ${minutes}:${seconds}`;
}

function startTimer() {
  stopTimer();
  elapsedSeconds = 0;
  updateTimerDisplay();
  timerInterval = window.setInterval(() => {
    elapsedSeconds += 1;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    window.clearInterval(timerInterval);
    timerInterval = null;
  }
}

function getLeaderboardEntries() {
  const rawValue = window.localStorage.getItem(LEADERBOARD_KEY);
  if (!rawValue) return [];
  try {
    return JSON.parse(rawValue);
  } catch (error) {
    return [];
  }
}

function saveLeaderboardEntry(entry) {
  const entries = getLeaderboardEntries();
  const updatedEntries = [...entries, entry]
    .sort((a, b) => a.timeSeconds - b.timeSeconds)
    .slice(0, 10);
  window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updatedEntries));
  renderLeaderboard();
}

function renderLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  const entries = getLeaderboardEntries();
  list.innerHTML = '';
  if (!entries.length) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'No completed games yet.';
    list.appendChild(emptyItem);
    return;
  }
  entries.forEach((entry, index) => {
    const item = document.createElement('li');
    const minutes = String(Math.floor(entry.timeSeconds / 60)).padStart(2, '0');
    const seconds = String(entry.timeSeconds % 60).padStart(2, '0');
    item.innerHTML = `<strong>#${index + 1}</strong> ${entry.playerName} — ${minutes}:${seconds} — ${entry.difficulty}`;
    list.appendChild(item);
  });
}

function promptForNameAndSave() {
  const playerName = window.prompt('Enter your name for the leaderboard:', 'Player');
  if (!playerName) {
    return;
  }
  saveLeaderboardEntry({
    playerName: playerName.trim() || 'Player',
    timeSeconds: elapsedSeconds,
    difficulty: currentDifficulty
  });
}

function checkCompletion() {
  if (gameCompleted) return;
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  let hasEmptyCell = false;
  for (let idx = 0; idx < inputs.length; idx += 1) {
    const input = inputs[idx];
    if (input.disabled) continue;
    if (!input.value) {
      hasEmptyCell = true;
      break;
    }
  }
  if (hasEmptyCell) return;

  const board = [];
  for (let i = 0; i < SIZE; i += 1) {
    board[i] = [];
    for (let j = 0; j < SIZE; j += 1) {
      const idx = i * SIZE + j;
      const value = Number(inputs[idx].value);
      board[i][j] = value;
    }
  }

  const isSolved = board.every((row, rowIndex) => row.every((value, colIndex) => value === puzzle[rowIndex][colIndex] || isValidPlacement(rowIndex, colIndex, value)));
  if (!isSolved) return;

  gameCompleted = true;
  stopTimer();
  showMessage('🎉 Puzzle complete! Excellent work.', '#2e7d32');
  promptForNameAndSave();
  for (let idx = 0; idx < inputs.length; idx += 1) {
    const input = inputs[idx];
    if (!input.disabled) {
      input.classList.add('solved');
    }
  }
}

function createBoardElement() {
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    for (let j = 0; j < SIZE; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.dataset.row = i;
      input.dataset.col = j;
      input.dataset.box = String(Math.floor(i / 3) * 3 + Math.floor(j / 3));
      input.className = `sudoku-cell ${Number(input.dataset.box) % 2 === 1 ? 'box-alt' : 'box-normal'}`;
      updateCellAccessibility(input);
      input.addEventListener('keydown', (e) => {
        const row = Number(e.target.dataset.row);
        const col = Number(e.target.dataset.col);
        const keyMap = {
          ArrowUp: [-1, 0],
          ArrowDown: [1, 0],
          ArrowLeft: [0, -1],
          ArrowRight: [0, 1]
        };
        const delta = keyMap[e.key];
        if (delta) {
          e.preventDefault();
          const nextRow = row + delta[0];
          const nextCol = col + delta[1];
          if (nextRow >= 0 && nextRow < SIZE && nextCol >= 0 && nextCol < SIZE) {
            const nextCell = getCellElement(nextRow, nextCol);
            if (nextCell) {
              nextCell.focus();
            }
          }
        } else if ((e.key === 'Delete' || e.key === 'Backspace' || e.key === 'Escape') && !e.target.disabled) {
          e.preventDefault();
          e.target.value = '';
          puzzle[row][col] = 0;
          updateCellFeedback(e.target, row, col);
          updateCellAccessibility(e.target);
        }
      });
      input.addEventListener('input', (e) => {
        if (gameCompleted) {
          e.target.value = '';
          return;
        }
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;
        if (val) {
          const row = Number(e.target.dataset.row);
          const col = Number(e.target.dataset.col);
          const cellValue = Number(val);
          puzzle[row][col] = cellValue;
          updateCellFeedback(e.target, row, col);
          checkCompletion();
        } else {
          const row = Number(e.target.dataset.row);
          const col = Number(e.target.dataset.col);
          puzzle[row][col] = 0;
          updateCellFeedback(e.target, row, col);
        }
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function renderPuzzle(puz, solvedBoard = null) {
  puzzle = puz;
  solution = solvedBoard || [];
  gameCompleted = false;
  startTimer();
  createBoardElement();
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = puzzle[i][j];
      const inp = inputs[idx];
      const isBoxAlt = Number(inp.dataset.box) % 2 === 1;
      inp.className = `sudoku-cell ${isBoxAlt ? 'box-alt' : 'box-normal'}`;
      if (val !== 0) {
        inp.value = val;
        inp.disabled = true;
        inp.classList.add('prefilled');
      } else {
        inp.value = '';
        inp.disabled = false;
      }
      updateCellAccessibility(inp);
    }
  }
}

async function newGame() {
  stopTimer();
  currentDifficulty = document.getElementById('difficulty-select').value;
  const res = await fetch(`/new?difficulty=${encodeURIComponent(currentDifficulty)}`);
  const data = await res.json();
  renderPuzzle(data.puzzle, data.solution || []);
  showMessage('', 'var(--text-color)');
  document.getElementById('difficulty-select').value = data.difficulty || currentDifficulty;
  renderLeaderboard();
}

function applyHint() {
  if (gameCompleted) return;
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let idx = 0; idx < inputs.length; idx += 1) {
    const input = inputs[idx];
    if (input.disabled) continue;
    if (!input.value) {
      const row = Number(input.dataset.row);
      const col = Number(input.dataset.col);
      const value = solution[row][col];
      input.value = value;
      input.disabled = true;
      input.className = `sudoku-cell ${Number(input.dataset.box) % 2 === 1 ? 'box-alt' : 'box-normal'} prefilled hint-cell`;
      puzzle[row][col] = value;
      showMessage(`Hint used: revealed row ${row + 1}, column ${col + 1}.`, '#1565c0');
      checkCompletion();
      return;
    }
  }
  showMessage('No empty cells left to hint.', '#d32f2f');
}

async function checkSolution() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }

  const incorrect = [];
  for (let i = 0; i < SIZE; i += 1) {
    for (let j = 0; j < SIZE; j += 1) {
      const value = board[i][j];
      if (!value) continue;
      if (!isValidPlacement(i, j, value)) {
        incorrect.push(i * SIZE + j);
      }
    }
  }

  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) continue;
    inp.classList.remove('incorrect');
    if (incorrect.includes(idx)) {
      inp.classList.add('incorrect');
    }
  }

  const msg = document.getElementById('message');
  if (incorrect.length === 0) {
    msg.style.color = '#388e3c';
    msg.innerText = 'No issues found. Keep going!';
    return;
  }

  msg.style.color = '#d32f2f';
  msg.innerText = 'Some cells are incorrect. Review the highlighted ones.';
}

// Wire buttons
window.addEventListener('load', () => {
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('hint-button').addEventListener('click', applyHint);
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const nextTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });
  document.getElementById('difficulty-select').addEventListener('change', newGame);
  initializeTheme();
  renderLeaderboard();
  // initialize
  newGame();
});
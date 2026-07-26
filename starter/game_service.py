from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional

try:
    import starter.sudoku_logic as sudoku_logic
except ModuleNotFoundError:  # pragma: no cover - fallback for direct execution
    import sudoku_logic


@dataclass
class SudokuGameService:
    current_puzzle: Optional[List[List[int]]] = None
    current_solution: Optional[List[List[int]]] = None
    current_difficulty: str = "medium"
    _last_error: Optional[str] = None

    def __post_init__(self) -> None:
        self._clue_counts: Dict[str, int] = {
            "easy": 35,
            "medium": 28,
            "hard": 22,
        }

    def new_game(self, clues: Optional[int] = None, difficulty: Optional[str] = None) -> List[List[int]]:
        if difficulty is not None:
            self.current_difficulty = difficulty.lower()
        clues = clues or self._clue_counts.get(self.current_difficulty, 28)
        puzzle, solution = sudoku_logic.generate_puzzle(clues)
        self.current_puzzle = puzzle
        self.current_solution = solution
        self._last_error = None
        return puzzle

    def check_solution(self, board: List[List[int]]) -> List[List[int]]:
        if self.current_solution is None:
            self._last_error = "No game in progress"
            return []

        incorrect: List[List[int]] = []
        for row in range(sudoku_logic.SIZE):
            for col in range(sudoku_logic.SIZE):
                if board[row][col] != self.current_solution[row][col]:
                    incorrect.append([row, col])
        return incorrect

    def get_current_puzzle(self) -> Optional[List[List[int]]]:
        return self.current_puzzle

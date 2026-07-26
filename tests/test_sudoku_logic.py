import importlib.util
from pathlib import Path

import pytest

from starter.game_service import SudokuGameService

ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "starter" / "sudoku_logic.py"

spec = importlib.util.spec_from_file_location("sudoku_logic", MODULE_PATH)
sudoku_logic = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sudoku_logic)


def is_complete_and_valid(board):
    expected = set(range(1, sudoku_logic.SIZE + 1))

    for row in board:
        if set(row) != expected:
            return False

    for col in range(sudoku_logic.SIZE):
        values = [board[row][col] for row in range(sudoku_logic.SIZE)]
        if set(values) != expected:
            return False

    for box_row in range(0, sudoku_logic.SIZE, 3):
        for box_col in range(0, sudoku_logic.SIZE, 3):
            values = []
            for row in range(box_row, box_row + 3):
                for col in range(box_col, box_col + 3):
                    values.append(board[row][col])
            if set(values) != expected:
                return False

    return True


def test_create_empty_board_has_nine_rows_and_columns():
    board = sudoku_logic.create_empty_board()
    assert len(board) == sudoku_logic.SIZE
    assert all(len(row) == sudoku_logic.SIZE for row in board)


def test_is_safe_rejects_duplicate_in_row_column_and_box():
    board = sudoku_logic.create_empty_board()
    board[0][0] = 5
    assert sudoku_logic.is_safe(board, 0, 1, 5) is False
    assert sudoku_logic.is_safe(board, 1, 0, 5) is False
    assert sudoku_logic.is_safe(board, 1, 1, 5) is False
    assert sudoku_logic.is_safe(board, 0, 1, 4) is True


def test_is_safe_allows_valid_placement_in_an_empty_cell():
    board = [
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 7, 8, 9, 1, 2, 3],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [2, 3, 4, 5, 6, 7, 8, 9, 1],
        [5, 6, 7, 8, 9, 1, 2, 3, 4],
        [8, 9, 1, 2, 3, 4, 5, 6, 7],
        [3, 4, 5, 6, 7, 8, 9, 1, 2],
        [6, 7, 8, 9, 1, 2, 3, 4, 5],
        [9, 1, 2, 3, 4, 5, 6, 7, 8],
    ]
    board[0][0] = 0
    assert sudoku_logic.is_safe(board, 0, 0, 1) is True


def test_fill_board_solves_a_known_puzzle():
    board = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ]

    assert sudoku_logic.fill_board(board) is True
    assert is_complete_and_valid(board) is True


def test_generate_puzzle_returns_board_and_solution():
    puzzle, solution = sudoku_logic.generate_puzzle(clues=35)
    assert len(puzzle) == sudoku_logic.SIZE
    assert len(solution) == sudoku_logic.SIZE
    assert puzzle != solution


def test_game_service_returns_puzzle_and_reports_incorrect_cells():
    service = SudokuGameService()
    puzzle = service.new_game(clues=35)

    assert len(puzzle) == sudoku_logic.SIZE
    assert service.current_solution is not None

    incorrect = service.check_solution([[0] * sudoku_logic.SIZE for _ in range(sudoku_logic.SIZE)])
    assert incorrect


def test_game_service_uses_difficulty_to_select_clue_count():
    service = SudokuGameService()
    service.new_game(difficulty="easy")
    assert service.current_difficulty == "easy"

    service.new_game(difficulty="hard")
    assert service.current_difficulty == "hard"


def test_generate_puzzle_returns_a_uniquely_solved_puzzle():
    puzzle, solution = sudoku_logic.generate_puzzle(clues=28)

    assert puzzle != solution
    assert sudoku_logic.is_unique_solution(sudoku_logic.deep_copy(puzzle)) is True


def test_is_safe_rejects_conflicting_entry():
    board = sudoku_logic.create_empty_board()
    board[0][0] = 5
    assert sudoku_logic.is_safe(board, 0, 1, 5) is False

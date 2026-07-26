import copy
import random

SIZE = 9
EMPTY = 0


def deep_copy(board):
    return copy.deepcopy(board)


def create_empty_board():
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]


def is_safe(board, row, col, num):
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False

    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True


def fill_board(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                possible = list(range(1, SIZE + 1))
                random.shuffle(possible)
                for candidate in possible:
                    if is_safe(board, row, col, candidate):
                        board[row][col] = candidate
                        if fill_board(board):
                            return True
                        board[row][col] = EMPTY
                return False
    return True


def is_unique_solution(board):
    return count_solutions(board) == 1


def remove_cells(board, clues):
    positions = [(row, col) for row in range(SIZE) for col in range(SIZE)]
    random.shuffle(positions)
    target_empty = SIZE * SIZE - clues
    removed = 0

    for row, col in positions:
        if removed >= target_empty:
            break
        if board[row][col] == EMPTY:
            continue
        original = board[row][col]
        board[row][col] = EMPTY
        if not is_unique_solution(board):
            board[row][col] = original
            continue
        removed += 1


def count_solutions(board):
    board = deep_copy(board)
    solutions = 0

    def search(board_state):
        nonlocal solutions
        if solutions > 1:
            return

        next_empty = None
        best_candidates = None
        for row in range(SIZE):
            for col in range(SIZE):
                if board_state[row][col] != EMPTY:
                    continue
                candidates = [candidate for candidate in range(1, SIZE + 1) if is_safe(board_state, row, col, candidate)]
                if not candidates:
                    return
                if best_candidates is None or len(candidates) < len(best_candidates):
                    best_candidates = candidates
                    next_empty = (row, col)
                    if len(best_candidates) == 1:
                        break
            if best_candidates is not None and len(best_candidates) == 1:
                break

        if next_empty is None:
            solutions += 1
            return

        row, col = next_empty
        for candidate in best_candidates:
            board_state[row][col] = candidate
            search(board_state)
            board_state[row][col] = EMPTY

    search(board)
    return solutions


def generate_puzzle(clues=35):
    while True:
        board = create_empty_board()
        fill_board(board)
        solution = deep_copy(board)
        remove_cells(board, clues)
        puzzle = deep_copy(board)
        if count_solutions(puzzle) == 1:
            return puzzle, solution

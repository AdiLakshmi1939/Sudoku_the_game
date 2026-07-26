from flask import Flask, jsonify, render_template, request

try:
    from starter.game_service import SudokuGameService
except ModuleNotFoundError:  # pragma: no cover - fallback for direct execution
    from game_service import SudokuGameService

app = Flask(__name__, template_folder='.', static_folder='static')
service = SudokuGameService()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/new')
def new_game():
    difficulty = request.args.get('difficulty', service.current_difficulty)
    puzzle = service.new_game(difficulty=difficulty)
    return jsonify({'puzzle': puzzle, 'solution': service.current_solution, 'difficulty': service.current_difficulty})


@app.route('/check', methods=['POST'])
def check_solution():
    data = request.json or {}
    board = data.get('board')
    if board is None:
        return jsonify({'error': 'Board data is required'}), 400

    incorrect = service.check_solution(board)
    if service._last_error:
        return jsonify({'error': service._last_error}), 400

    return jsonify({'incorrect': incorrect})


if __name__ == '__main__':
    app.run(debug=True)
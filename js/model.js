function Model() {
    this.board = new Board();
    // turn: 0 or 1
    this.turn = null;
    // step in a turn: start, move, remove, end
    this.step = null;
    this.pieces = [];
    this.isGameOver = null; // ???
}

Model.prototype.newGame = function(rows, cols, firstTurn) {
    this.turn = firstTurn !== undefined ? firstTurn : 0;
    this.step = 'start';
    this.isGameOver = false;
    this.board.init(rows, cols);
};

Model.prototype.getBestChoice = function(choices, turn, degrade) {
    var max = [];
    _.each(choices, function(choice) {
        max.push(choice.score);
    });
    max = _.uniq(max).sort(function(a, b) { return a - b; });
    degrade = degrade || 0;

    var best = [];
    var maxPos = max.length - 1 - degrade;
    _.each(choices, function(choice) {
        if (choice.score === max[maxPos]) {
            best.push(choice);
        }
    });

    if (best.length) {
        var rnd = Math.floor(Math.random() * best.length);
        return _.clone(best[rnd]);
    }

    return null;
};

Model.prototype.getCell = function(x, y) {
    return this.board.getCell(x, y);
};

Model.prototype.getCellsScores = function(depth, turn, prevScores) {
    var nx, ny, scores = [];

    for (var y = 0; y < this.board.rows; y++) {
        scores[y] = [];
        for (var x = 0; x < this.board.cols; x++) {
            if (prevScores && prevScores[y][x]) {
                for (var i = -1; i <= 1; i++) {
                    nx = x + i;
                    for (var j = -1; j <= 1; j++) {
                        ny = y + j;
                        if (nx >= 0 && nx < this.board.cols && ny >= 0 && ny < this.board.rows) {
                            if (scores[y][x] === undefined) {
                                scores[y][x] = prevScores[ny][nx];
                            }
                            else {
                                scores[y][x] += prevScores[ny][nx];
                            }
                        }
                    }
                }
            }
            else {
                var piece = this.pieces[turn^1];
                if (piece.y === y && piece.x === x) {
                    scores[y][x] = 0;
                }
                else {
                    scores[y][x] = this.board.getCellScore(x, y, piece.x, piece.y);
                }
            }
        }
    }

    if (depth - 1) {
        //console.log('recursion', depth, scores);
        return this.getCellsScores(depth - 1, turn, scores);
    }

    //console.log(scores);
    return scores;
};

Model.prototype.getChoices = function(scores, turn) {
    var nx, ny, choices = [];
    var piece = this.pieces[turn];
    var opponentPiece = this.pieces[turn^1];

    for (var y = -1; y <= 1; y++) {
        ny = piece.y + y;
        for (var x = -1; x <= 1; x++) {
            nx = piece.x + x;
            if (piece.x === nx && piece.y === ny) {
                continue;
            }
            if (nx >= 0 && nx < this.board.cols && ny >= 0 && ny < this.board.rows) {
                if (scores[ny][nx] && (nx !== opponentPiece.x || ny !== opponentPiece.y)) {
                    choices.push({x: nx, y: ny, score: scores[ny][nx]});
                }
            }
        }
    }

    // sort
    choices.sort(function (a, b) {
        return a.score - b.score;
    });

    return choices;
};

Model.prototype.getPieceNbNeighbors = function(num) {
    piece = this.pieces[num];
    return this.board.getCellNbNeighbors(piece.x, piece.y);
};

Model.prototype.movePiece = function(x, y) {
    // move player piece to a neighboring cell (horizontally, vertically, or diagonally)
    // that contains a square
    if (this.board.getCell(x, y) !== SQUARE) {
        return false;
    }
    var piece = this.pieces[this.turn];
    if (Math.abs(piece.x - x) <= 1 && Math.abs(piece.y - y) <= 1) {
        this.board.movePiece(piece.x, piece.y, x, y);
        this.pieces[this.turn] = {x: x, y: y};
        this.step = 'remove';
        return true;
    }
    return false;
};

Model.prototype.placePiece = function(x, y) {
    if (this.board.getCell(x, y) !== SQUARE) {
        return false;
    }
    this.board.placePiece(x, y);
    this.pieces[this.turn] = {x: x, y: y};
    if (this.turn === 1) {
        this.step = 'move';
    }
    this.turn ^= 1;
    return true;
};

Model.prototype.removeSquare = function(x, y) {
    if (this.board.getCell(x, y) !== SQUARE) {
        return false;
    }
    this.board.removeSquare(x, y);
    this.turn ^= 1;
    this.step = 'move';
    return true;
};

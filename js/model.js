function Model() {
    this.board = new Board();
    // turn: 0 or 1
    this.turn = null;
    // step in a turn: start, move, remove, end
    this.step = null;
    this.pieces = [];
}

Model.prototype.newGame = function(rows, cols) {
    this.turn = 0;
    this.step = 'start';
    this.board.init(rows, cols);
};

Model.prototype.alphabeta = function(depth, alpha, beta, turn) {
    var best, x;
    var evaluation, opponentEvaluation, evaluationSign;
    var piece, spiece, opponentPiece;
    var scores, choicesM, choicesR;
    var doReturn;

    if (typeof turn === 'undefined') {
        turn = this.turn;
    }

    piece = this.pieces[this.turn];
    opponentPiece = this.pieces[this.turn^1];
    //evaluationSign = this.turn === turn ? 1 : -1;
    evaluationSign = depth % 2 === 0 ? 1 : -1;
    scores = this.getCellsScores(3, this.turn);

    if (depth === 0) {
        // return evaluation of piece
        evaluation = scores[piece.y][piece.x];
        if (evaluation === 0) {
            return [null, evaluationSign * -1000000];
        }
        opponentEvaluation = this.getCellsScores(3, this.turn^1)[opponentPiece.y][opponentPiece.x];
        if (opponentEvaluation === 0) {
            return [null, evaluationSign * 1000000];
        }
        return [null, evaluationSign * (evaluation - opponentEvaluation)];
    }

    // get possible choices (moves)
    choicesM = this.getScoredChoices(scores, this.turn);

    if (choicesM.length === 0) {
        // no more move: player looses
        if (this.getPieceNbNeighbors(this.turn^1) === 0) {
            //console.log('draw');
            return [null, 0];
        }
        else {
            //console.log('no more move', depth, this.turn);
            //return [null, evaluationSign * -100000];
            return [null, -100000];
        }
    }

    // sort move choices in reversed order by score
    _.sortBy(choicesM, function(c) {return c.score;});
    choicesM.reverse();

    doReturn = false;
    best = [null, -1000000];
    for (var i = 0; i < choicesM.length; i++) {
        // do move
        //console.log(depth, this.turn, 'i=' + i, 'TURN', this.turn === turn ? 'move player' : 'move opponent');
        spiece = {x: piece.x, y: piece.y};
        this.board.movePiece(piece.x, piece.y, choicesM[i].x, choicesM[i].y);
        this.pieces[this.turn] = {x: choicesM[i].x, y: choicesM[i].y};

        // get possible choices (removes)
        scores = this.getCellsScores(3, this.turn^1);
        choicesR = this.getScoredChoices(scores, this.turn^1);
        _.sortBy(choicesR, function(c) {return c.score;});
        choicesR.reverse();

        this.turn ^= 1;
        for (var j = 0; j < choicesR.length; j++) {
            // do remove
            //console.log(depth, this.turn^1, 'j=' + j, 'TURN', this.turn^1 === turn ? 'remove player' : 'remove opponent');
            this.board.removeSquare(choicesR[j].x, choicesR[j].y);

            x = this.alphabeta(depth - 1, -beta, -alpha, turn);
            //this.board.repr();

            // undo remove
            this.board.restoreSquare(choicesR[j].x, choicesR[j].y);

            if (-x[1] > best[1]) {
                alpha = -x[1];
                best = [choicesM[i], -x[1]];
            }

            if (alpha >= beta) {
                // alpha pruning cut-off
                doReturn = true;
                break;
            }
        }
        this.turn ^= 1;

        // undo move
        this.board.movePiece(choicesM[i].x, choicesM[i].y, spiece.x, spiece.y);
        this.pieces[this.turn] = {x: spiece.x, y: spiece.y};

        if (doReturn) {
            return best;
        }
    }

    return best;
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

Model.prototype.getChoices = function(turn) {
    var piece = this.pieces[turn];
    return this.board.getCellNeighbors(piece.x, piece.y);
};

Model.prototype.getScoredChoices = function(scores, turn) {
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

Model.prototype.getPieceNbNeighbors = function(turn) {
    var piece = this.pieces[turn];
    return this.board.getCellNeighbors(piece.x, piece.y).length;
};

Model.prototype.getRandomSquare = function (turn, excludePlayerNeighboringCells) {
    var excludes, choices = [];

    if (excludePlayerNeighboringCells) {
        excludes = this.getChoices(turn);
    }

    for (var y = 0; y < this.board.rows; y++) {
        for (var x = 0; x < this.board.cols; x++) {
            var notfound = true;
            if (excludes) {
                for (var i = 0; i < excludes.length; i++) {
                    if (excludes[i].x === x && excludes[i].y === y) {
                        notfound = false;
                        break;
                    }
                }
            }
            if (notfound) {
                choices.push({x: x, y: y});
            }
        }
    }

    if (choices.length) {
        var rnd = Math.floor(Math.random() * choices.length);
        return choices[rnd];
    }

    return null;
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

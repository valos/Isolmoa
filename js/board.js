var EMPTY = 0;
var SQUARE = 1;
var PIECE = 2;

Function.prototype.inheritsFrom = function(parentClass) {
    this.prototype = new parentClass();
    this.prototype.constructor = this;
    this.prototype.parent = parentClass.prototype;
    return this;
};

function Board() {
    this.rows = null;
    this.cols = null;
}

Board.inheritsFrom(Array);

Board.prototype.init = function(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    for (var y = 0; y < this.rows; y++) {
        this[y] = new Array(this.cols);
        for (var x = 0; x < this.cols; x++) {
            this.setCell(x, y, SQUARE);
        }
    }
};

Board.prototype.clone = function() {
    var c = new Board();
    c.rows = this.rows;
    c.cols = this.cols;
    for (var y = 0; y < this.rows; y++) {
        c[y] = new Array(this.cols);
        for (var x = 0; x < this.cols; x++) {
            c.setCell(x, y, this.getCell(x, y));
        }
    }
    return c;
};

Board.prototype.getCell = function(x, y) {
    return this[y][x];
};

Board.prototype.getCellNeighbors = function(x, y) {
    var nx, ny, neighbors = [];

    for (var i = -1; i <= 1; i++) {
        nx = x + i;
        for (var j = -1; j <= 1; j++) {
            ny = y + j;
            if (x === nx && y === ny) {
                continue;
            }
            if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
                if (this[ny][nx] === SQUARE) {
                    neighbors.push({x: nx, y: ny});
                }
            }
        }
    }
    return neighbors;
};

Board.prototype.getCellScore = function(x, y, ignoreX, ignoreY) {
    var nx, ny, score = 0;

    if (this[y][x] === EMPTY) {
        return 0;
    }

    for (var i = -1; i <= 1; i++) {
        nx = x + i;
        for (var j = -1; j <= 1; j++) {
            ny = y + j;
            if (x === nx && y === ny) {
                continue;
            }
            if (ignoreX === nx && ignoreY === ny) {
                continue;
            }
            if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
                if (this[ny][nx] !== EMPTY) {
                    score += 1;
                }
            }
        }
    }
    return score;
};

Board.prototype.getRandomSquare = function() {
    var choices = [];

    // get all possible squares except squares on edges
    for (var y = 1; y < this.rows - 1; y++) {
        for (var x = 1; x < this.cols - 1; x++) {
            if (this[y][x] === SQUARE) {
                choices.push({x: x, y: y});
            }
        }
    }

    if (choices.length) {
        return choices[Math.floor(Math.random() * choices.length)];
    }

    return null;
};

Board.prototype.movePiece = function(x1, y1, x2, y2) {
    this.setCell(x1, y1, SQUARE);
    this.setCell(x2, y2, PIECE);
};

Board.prototype.placePiece = function(x, y) {
    this.setCell(x, y, PIECE);
};

Board.prototype.removeSquare = function(x, y) {
    this.setCell(x, y, EMPTY);
};

Board.prototype.restoreSquare = function(x, y) {
    this.setCell(x, y, SQUARE);
};

Board.prototype.setCell = function(x, y, state) {
    this[y][x] = state;
};

Board.prototype.repr = function() {
    console.log('------------');
    for (var i = 0; i < this.rows; i++) {
        console.log('r' + i + ' ' + this[i].join(' '));
    }
    console.log('------------');
};

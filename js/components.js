Crafty.c('Board', {
    init: function() {
        this.attr({
            w: Game.board.cellSize,
            h: Game.board.cellSize
        });
    },
 
    // Locate cell at the given position on the grid
    at: function(x, y) {
        if (x === undefined && y === undefined) {
            return {
                x: Math.round(this.x / Game.board.cellSize),
                y: Math.round(this.y / Game.board.cellSize)
            };
        }
        else {
            return this.attr({
                x: x * Game.board.cellSize,
                y: y * Game.board.cellSize
            });
        }
    }
});


// Cell of the board: contains a hole (solid) and a square
Crafty.c('Cell', {
    init: function() {
        this.requires('2D, Canvas, Board');
    },

    _setSize: function() {
        this.attr({
            w: Game.board.cellSize,
            h: Game.board.cellSize
        });
        return this;
    }
});


Crafty.c('Hole', {
    init: function() {
        this.requires('Cell, holeSprite, Solid')
            ._setSize();
    }
});


Crafty.c('Square', {
    init: function() {
        this.requires('Cell, squareSprite, Tween, Tweener, Mouse')
            .attr({
                w: 0,
                h: 0
            })
            .bind('Click', this._onclick);
    },

    _onclick: function(event) {
        Crafty.trigger('SquareSelected', {square: this, source: 'human'});
    },

    appearAt: function(x, y) {
        this.attr({
            x: x * Game.board.cellSize + Game.board.cellSize / 2,
            y: y * Game.board.cellSize + Game.board.cellSize / 2
        });
        return this.addTween({
            x: this.x - Game.board.cellSize / 2,
            y: this.y - Game.board.cellSize / 2,
            w: Game.board.cellSize,
            h: Game.board.cellSize
        }, 'easeOutBounce', 75);
    },

    remove: function() {
        this.tween({
            x: this.x + Game.board.cellSize / 2,
            y: this.y + Game.board.cellSize / 2,
            w: 0,
            h: 0
        }, 400);
    }
});


Crafty.c('Piece', {
    num: null,
    animationDuration: 1000,

    init: function() {
        this.requires('Cell, Tween, SpriteAnimation, PiecesSprite')
            ._setSize();
    },

    piece: function(num, rotated) {
        this.num = num;
        if (rotated) {
            this.origin('center');
            this.rotation = 180;
        }
        return this.sprite(this.num === 0 ? 0 : 2, 0, 1, 1)
            .reel('Pulse', this.animationDuration, this.num * 2, 0, 2);
    },

    loose: function() {
        return this.stopPulse()
            .sprite(this.num === 0 ? 4 : 5, 0, 1, 1);
    },

    moveTo: function(x, y) {
        return this.tween({x: x, y: y}, 400);
    },
    
    startPulse: function() {
        return this.animate('Pulse', -1);
    },

    stopPulse: function() {
        return this.reel('Pulse').resetAnimation();
    }
});

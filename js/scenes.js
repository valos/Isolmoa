Crafty.scene('Game', function() {
    var self = this;
    this.model = new Model();
    this.pieces = null;
    this.squares = null;

    function newGame() {
        Game.readOptions();

        drawBoard();
        self.model.newGame(Game.board.rows, Game.board.cols);

        if (Game.players[self.model.turn].type === 'ai') {
            self.trigger('AITurn');
        }
    }

    function drawBoard() {
        // destroy all previously components created (if exist)
        Crafty("Board").each(function(i) {
            this.destroy();
        });

        self.pieces = [];
        self.squares = [];

        // draw board (holes + squares components)
        for (y = 0; y < Game.board.rows; y++) {
            for (x = 0; x < Game.board.cols; x++) {
                Crafty.e('Hole').at(x, y);
            }
        }
        for (y = 0; y < Game.board.rows; y++) {
            self.squares[y] = new Array(Game.board.cols);
            for (x = 0; x < Game.board.cols; x++) {
                self.squares[y][x] = Crafty.e('Square').at(x, y);
            }
        }
    }

    this.aiTurn = this.bind('AITurn', function() {
        var scores, choices, best, square;

        switch(self.model.step) {
        case 'start':
            var pos = self.model.board.getRandomSquare();
            square = self.squares[pos.y][pos.x];
            break;
        case 'move':
            console.log('computer move', self.model.turn);
            scores = self.model.getCellsScores(1, self.model.turn);
            choices = self.model.getChoices(scores, self.model.turn);
            best = self.model.getBestChoice(choices, 1);
            console.log('best', best);
            square = self.squares[best.y][best.x];
            break;
        case 'remove':
            console.log('computer remove', self.model.turn^1);
            scores = self.model.getCellsScores(1, self.model.turn^1);
            choices = self.model.getChoices(scores, self.model.turn^1);
            best = self.model.getBestChoice(choices, 1);
            console.log('best', best);
            square = self.squares[best.y][best.x];
            break;
        }
        if (square) {
            self.trigger('SquareSelected', {square: square, source: 'ai'});
        }
    });

    this.squareSelected = this.bind('SquareSelected', function(data) {
        var turn = self.model.turn;
        var square = data.square;
        var source = data.source;
        var squareAt = square.at();

        console.log(squareAt);
        if (Game.players[turn].type === 'ai' && source == 'human') {
            return;
        }
                                    
        switch(self.model.step) {
        case 'start':
            // create player piece
            var rotated = Game.players[0].type === 'human' && Game.players[1].type === 'human' && turn === 1 ? true : false;
            if (self.model.placePiece(squareAt.x, squareAt.y)) {
                console.log('new piece', turn, squareAt.x, squareAt.y);
                self.pieces.push(Crafty.e('Piece').piece(turn, rotated).at(squareAt.x, squareAt.y));
                if (turn === 1) {
                    self.pieces[0].startPulse();
                }
            }
            break;
        case 'move':
            console.log('move');
            if (self.model.movePiece(squareAt.x, squareAt.y)) {
                console.log('move done');
                self.pieces[turn].moveTo(square.x, square.y);
            }
            break;
        case 'remove':
            if (self.model.removeSquare(squareAt.x, squareAt.y)) {
                square.remove();
                self.pieces[turn].stopPulse();
                self.pieces[turn^1].startPulse();
            }
            self.model.board.repr();

            _.each(self.pieces, function(piece, i) {
                var nb = self.model.getPieceNbNeighbors(i);
                console.log('piece nb: ' + i + ', neighbors: ' + nb);
                if (nb === 0) {
                    self.model.step = 'end';
                    piece.loose();
                }
            });

            break;
        }

        if (Game.players[self.model.turn].type === 'ai') {
            setTimeout(function() {
                self.trigger('AITurn');
            }, 2000);
        }
    });

    $('#btn-new-game').on('click', newGame);
    newGame();
});


Crafty.scene('Loading', function() {
    // Draw some text for the player to see in case the file
    // takes a noticeable amount of time to load
    Crafty.e('2D, DOM, Text')
        .attr({
            x: 0,
            y: Game.board.size / 2 - 24,
            w: Game.board.size
        })
        .text('Loading...')
        .textColor('#FFFFFF')
        .textFont({size: '24px', weight: 'bold'})
        .css({'text-align': 'center'});
    
    // Load our sprite map image
    Crafty.load(['img/sprite-cell.png', 'img/sprite-pieces.png'], function() {
        // Once the image is loaded...
        Crafty.sprite(53, 'img/sprite-cell.png', {
            holeSprite: [0, 0],
            squareSprite: [1, 0]
        }, 0, 0);
        Crafty.sprite(53, 'img/sprite-pieces.png', {
            PiecesSprite: [0, 0]
        });

        // Now that sprites are ready to draw, start the game
        Crafty.scene('Game');
    });
});

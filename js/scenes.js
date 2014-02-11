Crafty.scene('Game', function() {
    var self = this;
    this.model = new Model();
    this.startPlayer = null;
    this.players = null;
    this.pieces = null;
    this.squares = null;
    this.messages = [$('#message-0'), $('#message-1')];
    this.aiTurnTimeout = null;

    function newGame() {
        Game.gameover = null;
        Game.readLaunchOptions();

        audioplay("new_game");

        drawBoard();
        self.model.newGame(Game.board.rows, Game.board.cols);

        self.startPlayer = Game.startPlayer !== 'random' ? Game.startPlayer : Math.floor(Math.random() * 2);
        self.players = [
            Game.players[self.startPlayer],
            Game.players[self.startPlayer^1]
        ];

        displayPlayerInstruction();

        if (self.players[self.model.turn].type === 'ai') {
            aiTurn();
        }
    }

    function drawBoard() {
        var x, y;

        // destroy all previously components created (if exist)
        Crafty("Board").each(function() {
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
                self.squares[y][x] = Crafty.e('Square').appearAt(x, y).bind("TweenEnd", displayPlayerInstruction);
                if (x === 0 || y === 0 || x === Game.board.cols - 1 || y === Game.board.rows - 1) {
                    // edges are overshadowed to indicate that pieces can't be placed on edges
                    self.squares[y][x].overshadow(true);
                }
            }
        }
    }
    
    function aiTurn() {
        var scores, choices, best;

        switch(self.model.step) {
        case 'start':
            best = self.model.board.getRandomSquare();
            break;
        case 'move':
            switch (self.players[self.model.turn].level) {
            case 'easy':
                scores = self.model.getCellsScores(1, self.model.turn);
                choices = self.model.getScoredChoices(scores, self.model.turn);
                best = self.model.getBestChoice(choices, 1);
                break;
            case 'medium':
                scores = self.model.getCellsScores(3, self.model.turn);
                choices = self.model.getScoredChoices(scores, self.model.turn);
                best = self.model.getBestChoice(choices, 0);
                break;
            case 'hard':
                best = self.model.alphabeta(2, -1000000, 1000000)[0];
                break;
            }
            break;
        case 'remove':
            switch (self.players[self.model.turn].level) {
            case 'easy':
                scores = self.model.getCellsScores(1, self.model.turn^1);
                choices = self.model.getScoredChoices(scores, self.model.turn^1);
                best = self.model.getBestChoice(choices, 1);
                break;
            case 'medium':
                scores = self.model.getCellsScores(3, self.model.turn^1);
                choices = self.model.getScoredChoices(scores, self.model.turn^1);
                best = self.model.getBestChoice(choices, 0);
                break;
            case 'hard':
                self.model.turn ^= 1;
                best = self.model.alphabeta(2, -1000000, 1000000)[0];
                self.model.turn ^= 1;
                break;
            }
            if (!_.isObject(best)) {
                best = self.model.getRandomSquare(self.model.turn, true);
            }
            break;
        }

        self.trigger('SquareSelected', {square: self.squares[best.y][best.x], source: 'ai'});
    }

    function audioplay(name) {
        if (Game.sound === false) {
            return;
        }
        if (typeof Android !== 'undefined') {
            Android.audioplay('sfx/' + name + '.mp3');
        }
        else {
            Crafty.audio.play(name);
        }
    }

    function displayPlayerInstruction() {
        var y, effect, id, msgs = [];

        if (self.players[0].type === 'ai' && self.players[1].type === 'ai') {
            return;
        }
        else if (self.players[0].type === 'human' && self.players[1].type === 'human') {
            // Human vs Human (2 distinct messages)
            msgs = ['...', '...'];
        }
        else {
            // Human vs AI (one common message)
            msgs[0] = self.players[self.model.turn].type === 'human' ? 'You' : 'AI';
        }

        id = self.startPlayer === self.model.turn ? 0 : 1;
        switch (self.model.step) {
        case 'start':
            effect = self.model.turn ? 'bounceInLeft' : 'bounceInRight';
            if (msgs.length === 2) {
                msgs[id] = 'Choose a cell';
            }
            else {
                msgs[0] += ' : Choose a cell';
            }
            break;
        case 'move':
            effect = 'bounce';
            if (msgs.length === 2) {
                msgs[id] = 'Move';
            }
            else {
                msgs[0] += ' : Move';
            }
            break;
        case 'remove':
            effect = 'pulse';
            if (msgs.length === 2) {
                msgs[id] = 'Destroy a square';
            }
            else {
                msgs[0] += ' : Destroy a square';
            }
            break;
        case 'end':
            effect = 'bounce';
            if (self.model.getPieceNbNeighbors(0) === 0 && self.model.getPieceNbNeighbors(1) === 0) {
                if (msgs.length === 2) {
                    msgs[0] = msgs[1] = 'No winner: draw';
                }
                else {
                    msgs[0] = 'No winner: draw';
                }
            }
            else if (self.model.getPieceNbNeighbors(1) === 0) {
                Game.gameover = {
                    winner: self.startPlayer,
                    msgs: []
                };
                if (msgs.length === 2) {
                    msgs[self.startPlayer] = 'You win';
                    msgs[self.startPlayer^1] = 'You lose';
                    Game.gameover.msgs = msgs;
                }
                else {
                    msgs[0] = self.players[0].type === 'human' ? 'You win' : 'AI wins';
                    Game.gameover.msgs[0] = self.players[0].type === 'human' ? 'You win' : 'You lose';
                }
            }
            else {
                Game.gameover = {
                    winner: self.startPlayer^1,
                    msgs: []
                };
                if (msgs.length === 2) {
                    msgs[self.startPlayer] = 'You lose';
                    msgs[self.startPlayer^1] = 'You win';
                    Game.gameover.msgs = msgs;
                }
                else {
                    msgs[0] = self.players[1].type === 'human' ? 'You win' : 'AI wins';
                    Game.gameover.msgs[0] = self.players[1].type === 'human' ? 'You win' : 'You lose';
                }
            }
            break;
        }

        y = (window.innerHeight - Game.board.size - $('header').outerHeight() - $('footer').outerHeight()) / 4;
        if (msgs.length === 2) {
            $.each(self.messages, function(i, $message) {
                $message.css(i === 0 ? 'top' : 'bottom', y + 'px');
                $message.children(':last')
                    .css('color', '#fff')
                    .text(msgs[i]);
                $message.children(':first').show();
                $message.children(':first').css('background-position', (i === 0 ? 0 : -106) + 'px 0');
                if (i === id) {
                    $message.children(':last')
                        .addClass(effect + ' animated')
                        .one('webkitAnimationEnd animationend', function() {
                            $(this).removeClass();
                        });
                }
            });
        }
        else {
            self.messages[0]
                .css('top', y + 'px');
            self.messages[0].children(':first')
                .show()
                .css('background-position', (self.model.turn === self.startPlayer ? 0 : -106) + 'px 0');
            self.messages[0].children(':last')
                .css('color', '#fff')
                .text(msgs[0])
                .addClass(effect + ' animated')
                .one('webkitAnimationEnd animationend', function() {
                    $(this).removeClass();
                });
            self.messages[1].children(':first').hide();
            self.messages[1].children(':last').text('');
        }

        if (Game.gameover !== null) {
            setTimeout(function() {
                Crafty.scene('Gameover');
            }, 1000);
        }
    }
    
    this.uniqueBind('SquareSelected', function(data) {
        var turn = self.model.turn;
        var piece;
        var square = data.square;
        var source = data.source;
        var squareAt = square.at();
        var rotated;

        if (self.players[turn].type === 'ai' && source === 'human') {
            return;
        }
                                    
        switch(self.model.step) {
        case 'start':
            if (self.model.placePiece(squareAt.x, squareAt.y)) {
                if (self.players[0].type === 'human' && self.players[1].type === 'human') {
                    rotated = self.startPlayer === turn ? false : true;
                }
                else {
                    rotated = false;
                }
                piece = Crafty.e('Piece')
                    .piece(self.startPlayer === turn ? 0 : 1, rotated)
                    .at(squareAt.x, squareAt.y)
                    .bind("TweenEnd", displayPlayerInstruction);
                self.pieces.push(piece);
                if (turn === 1) {
                    self.pieces[0].startPulse();
                    // 2 pieces are placed, remove edges overshadow
                    for (var y = 0; y < Game.board.rows; y++) {
                        for (var x = 0; x < Game.board.cols; x++) {
                            if (x === 0 || y === 0 || x === Game.board.cols - 1 || y === Game.board.rows - 1) {
                                self.squares[y][x].overshadow(false);
                            }
                        }
                    }
                }
                displayPlayerInstruction();
            }
            break;
        case 'move':
            if (self.model.movePiece(squareAt.x, squareAt.y)) {
                audioplay("move");
                self.pieces[turn].moveTo(square.x, square.y);
            }
            break;
        case 'remove':
            if (self.model.removeSquare(squareAt.x, squareAt.y)) {
                audioplay("remove");
                square.remove();
                self.pieces[turn].stopPulse();
                self.pieces[turn^1].startPulse();
            }

            _.each(self.pieces, function(piece, i) {
                var nb = self.model.getPieceNbNeighbors(i);
                if (nb === 0) {
                    audioplay('win');
                    self.model.step = 'end';
                    piece.loose();
                }
            });

            break;
        }

        if (self.model.step !== 'end' && self.players[self.model.turn].type === 'ai') {
            clearTimeout(self.aiTurnTimeout);
            self.aiTurnTimeout = setTimeout(function() {
                aiTurn();
            }, 2000);
        }
    });

    newGame();
}, function() {this.unbind('SquareSelected');});


Crafty.scene('Gameover', function() {
    if (Game.gameover.msgs.length === 1) {
        Crafty.e('2D, DOM, Text')
            .attr({
                x: 0,
                y: Game.board.size / 2 - 24,
                w: Game.board.size
            })
            .text(Game.gameover.msgs[0])
            .textColor('#FFFFFF')
            .textFont({size: '48px', weight: 'bold'})
            .css({'text-align': 'center'});
    }
    else {
        Crafty.e('2D, DOM, Text')
            .attr({
                x: 0,
                y: Game.board.size / 2 - 96,
                w: Game.board.size
            })
            .text(Game.gameover.msgs[0])
            .textColor('#FFFFFF')
            .textFont({size: '48px', weight: 'bold'})
            .css({'text-align': 'center'});
        Crafty.e('2D, DOM, Text')
            .attr({
                x: 0,
                y: Game.board.size / 2 + 96,
                w: Game.board.size,
                _flipY: true,
                _flipX: true
            })
            .text(Game.gameover.msgs[1])
            .textColor('#FFFFFF')
            .textFont({size: '48px', weight: 'bold'})
            .css({'text-align': 'center'});
    }

    var box = {
        topleft: {
            x: -Game.board.cellSize,
            y: -Crafty.viewport.y - Game.board.cellSize + $('header').outerHeight()
        },
        bottomright: {
            x: Crafty.viewport.width,
            y: Crafty.viewport.height - Crafty.viewport.y - $('footer').outerHeight()
        }
    };

    for (var i = 0; i < Game.board.rows * 2; i++) {
        Crafty.e('Piece')
            .piece(Game.gameover.winner, false)
            .origin('center')
            .attr({
                // random position, rotation and speed
                x: Crafty.math.randomInt(box.topleft.x, box.bottomright.x),
                y: Crafty.math.randomInt(box.topleft.y, box.bottomright.y),
                xspeed: Crafty.math.randomInt(-5, 5),
                yspeed: Crafty.math.randomInt(-5, 5),
                rspeed: Crafty.math.randomInt(-5, 5),
                frameLimit: 1000
            })
            .bind("EnterFrame", function() {
                this.frameLimit--;
                if (this.frameLimit < 0) {
                    return false;
                }
                var x = this._x + this.xspeed;
                var y = this._y + this.yspeed;
                var rotation = this._rotation + this.rspeed;

                if (x > box.bottomright.x) {
                    x = box.topleft.x;
                }
                if (x < box.topleft.x) {
                    x = box.bottomright.x;
                }
                if (y > box.bottomright.y) {
                    y =  box.topleft.y;
                }
                if (y < box.topleft.y) {
                    y = box.bottomright.y;
                }
                this.attr({
                    x: x, y: y, rotation: rotation
                });
            });
    }
});


Crafty.scene('Loading', function() {
    // Draw some text for the player to see in case files take a noticeable amount of time to load
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

    // Load sounds
    Crafty.audio.add('new_game', ['sfx/new_game.mp3', 'sfx/new_game.ogg', 'sfx/new_game.wav']);
    Crafty.audio.add('move', ['sfx/move.mp3', 'sfx/move.ogg', 'sfx/move.wav']);
    Crafty.audio.add('remove', ['sfx/remove.mp3', 'sfx/remove.ogg', 'sfx/remove.wav']);
    Crafty.audio.add('win', ['sfx/win.mp3', 'sfx/win.ogg', 'sfx/win.wav']);
    
    // Load sprite images
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

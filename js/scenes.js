Crafty.scene('Game', function() {
    var self = this;
    this.model = new Model();
    this.pieces = null;
    this.squares = null;
    this.messages = [$('#message-0'), $('#message-1')];

    function newGame() {
        audioplay("new_game");
        Game.readOptions();

        drawBoard();
        self.model.newGame(Game.board.rows, Game.board.cols);
        displayPlayerInstruction();

        // init with a debug state
/*
        self.model.board[0] = [1,1,1,1,1,1];
        self.model.board[1] = [1,1,1,0,1,1];
        self.model.board[2] = [0,0,0,0,0,1];
        self.model.board[3] = [1,1,0,1,0,0];
        self.model.board[4] = [2,1,0,2,0,1];
        self.model.board[5] = [1,0,0,1,1,1];
        for (y = 0; y < Game.board.rows; y++) {
            for (x = 0; x < Game.board.cols; x++) {
                if (self.model.board[y][x] === 0)
                    self.squares[y][x].remove();
            }
        }
        self.pieces.push(Crafty.e('Piece').piece(0, false).at(0, 4));
        self.pieces.push(Crafty.e('Piece').piece(1, false).at(3, 4));
        self.model.pieces = [{x:0, y:4}, {x:3, y:4}];
*/
/*
        self.model.board[0] = [1,1,1,1,1,1];
        self.model.board[1] = [1,1,1,1,1,1];
        self.model.board[2] = [2,1,1,1,1,1];
        self.model.board[3] = [1,1,1,1,2,1];
        self.model.board[4] = [1,1,1,1,1,1];
        self.model.board[5] = [1,1,1,1,1,1];
        for (y = 0; y < Game.board.rows; y++) {
            for (x = 0; x < Game.board.cols; x++) {
                if (self.model.board[y][x] === 0)
                    self.squares[y][x].remove();
            }
        }
        self.pieces.push(Crafty.e('Piece').piece(0, false).at(0, 2));
        self.pieces.push(Crafty.e('Piece').piece(1, false).at(4, 3));
        self.model.pieces = [{x:0, y:2}, {x:4, y:3}];

        self.model.turn = 0;
        self.model.step = 'move';
        self.pieces[1].startPulse();
*/
        // end init

        if (Game.players[self.model.turn].type === 'ai') {
            aiTurn();
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
                self.squares[y][x] = Crafty.e('Square').appearAt(x, y).bind("TweenEnd", displayPlayerInstruction);
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
            switch (Game.players[self.model.turn].level) {
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
                best = self.model.alphabeta(3, -1000000, 1000000)[0];
                break;
            }
            break;
        case 'remove':
            switch (Game.players[self.model.turn].level) {
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
                best = self.model.alphabeta(3, -1000000, 1000000)[0];
                self.model.turn ^= 1;
                break;
            }
            if (!_.isObject(best)) {
                best = self.model.getRandomSquare(self.model.turn);
                //console.log('NO BEST remove found, get a random square instead', best);
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
        var y, effect, msgs = [];

        if (Game.players[0].type === 'ai' && Game.players[1].type === 'ai') {
            return;
        }
        else if (Game.players[0].type === 'human' && Game.players[1].type === 'human') {
            // Human vs Human (2 distinct messages)
            msgs = ['...', '...'];
        }
        else {
            // Human vs AI (1 common message)
            msgs[0] = Game.players[self.model.turn].type === 'human' ? 'You' : 'AI';
        }

        switch (self.model.step) {
        case 'start':
            effect = self.model.turn ? 'bounceInLeft' : 'bounceInRight';
            if (msgs.length === 2) {
                msgs[self.model.turn] = 'Choose a cell';
            }
            else {
                msgs[0] += ' : Choose a cell';
            }
            break;
        case 'move':
            effect = 'bounce';
            if (msgs.length === 2) {
                msgs[self.model.turn] = 'Move';
            }
            else {
                msgs[0] += ' : Move';
            }
            break;
        case 'remove':
            effect = 'pulse';
            if (msgs.length === 2) {
                msgs[self.model.turn] = 'Destroy a square';
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
                if (msgs.length === 2) {
                    msgs[0] = 'You wins';
                    msgs[1] = 'You loses';
                }
                else {
                    msgs[0] = Game.players[0].type === 'human' ? 'You' : 'AI';
                    msgs[0] += ' wins';
                }
            }
            else {
                if (msgs.length === 2) {
                    msgs[0] = 'You loses';
                    msgs[1] = 'You wins';
                }
                else {
                    msgs[0] = Game.players[1].type === 'human' ? 'You' : 'AI';
                    msgs[0] += ' wins';
                }
            }
            break;
        }

        y = (window.innerHeight - Game.board.size) / 4;
        if (msgs.length === 2) {
            $.each(self.messages, function(i, $message) {
                $message.css(i === 0 ? 'top' : 'bottom', y + 'px');
                $message.children(':first')
                    .css('color', '#fff')
                    .text(msgs[i]);
                if (self.model.turn === i) {
                    $message.children(':first')
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
                .css('color', '#fff')
                .text(msgs[0])
                .addClass(effect + ' animated')
                .one('webkitAnimationEnd animationend', function() {
                    $(this).removeClass();
		});
            self.messages[1].children(':first').text('');
        }
    }
    
    this.squareSelected = this.bind('SquareSelected', function(data) {
        var turn = self.model.turn;
        var piece;
        var square = data.square;
        var source = data.source;
        var squareAt = square.at();

        if (Game.players[turn].type === 'ai' && source == 'human') {
            return;
        }
                                    
        switch(self.model.step) {
        case 'start':
            // create player piece
            var rotated = Game.players[0].type === 'human' && Game.players[1].type === 'human' && turn === 1 ? true : false;
            if (self.model.placePiece(squareAt.x, squareAt.y)) {
                piece = Crafty.e('Piece')
                    .piece(Game.startPlayer === 0 ? turn : turn^1, rotated)
                    .at(squareAt.x, squareAt.y)
                    .bind("TweenEnd", displayPlayerInstruction);
                self.pieces.push(piece);
                if (turn === 1) {
                    self.pieces[0].startPulse();
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

        if (self.model.step !== 'end' && Game.players[self.model.turn].type === 'ai') {
            setTimeout(function() {
                aiTurn();
            }, 2000);
        }
    });

    $('#btn-new-game').on('click', newGame);
    newGame();
});


Crafty.scene('Loading', function() {
    Crafty.audio.add('new_game', ['sfx/new_game.mp3', 'sfx/new_game.ogg', 'sfx/new_game.wav']);
    Crafty.audio.add('move', ['sfx/move.mp3', 'sfx/move.ogg', 'sfx/move.wav']);
    Crafty.audio.add('remove', ['sfx/remove.mp3', 'sfx/remove.ogg', 'sfx/remove.wav']);
    Crafty.audio.add('win', ['sfx/win.mp3', 'sfx/win.ogg', 'sfx/win.wav']);

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

Game = {
    // board's grid size and the size of each of its cell
    board: {
        size: null,
        rows: null,
        cols: null,
        cellSize: null
    },
    // players type (human or ai) and level if ai
    players: null,
    sound: false,

    readOptions: function() {
        var option;
        option = $('input[name=board-size]:checked').val().split('x');
        this.board.rows = option[0];
        this.board.cols = option[1];
        
        option = $('input[name=player-type-1]:checked').val().split(':');
        this.players = [];
        this.players.push({
            type: option[0],
            level: option[1]
        });
        
        option = $('input[name=player-type-2]:checked').val().split(':');
        this.players.push({
            type: option[0],
            level: option[1]
        });

        option = $('input[name=sound-fx]:checked').val();
        this.sound = option === 'on' ? true : false;

        // compute cells size
        this.board.cellSize = this.board.size / Math.max(this.board.rows, this.board.cols);
    },

    // Initialize and start game
    start: function() {
        Game.board.size = Math.min(window.innerHeight, window.innerWidth);

        $('#form-options').sisyphus({
            onSave: function () {
                Game.readOptions();
                //console.log('options save');
            },
            onRestore: function () {
                Game.readOptions();
                console.log('options restore');
            }
        });

        // Start crafty
        Crafty.init(window.innerWidth, window.innerHeight, 'board');

        function detectOrientation() {
            if (window.orientation === 0 || window.innerWidth < window.innerHeight) {
                // portrait
                $('footer').show();
                $('header').show();
                Crafty.viewport.x = 0;
                Crafty.viewport.y = (window.innerHeight - Game.board.size) / 2;
            }
            else {
                // landscape
                $('footer').hide();
                $('header').hide();
                Crafty.viewport.x = (window.innerWidth - Game.board.size) / 2;
                Crafty.viewport.y = 0;
            }
        }
        detectOrientation();
        window.addEventListener("orientationchange", detectOrientation, false);
        window.addEventListener("resize", detectOrientation, false);

        // on some Mobile Webkit browsers (Android, iOS, BB, WebOS, etc.), and others with Touch support
        // a force reflow is required
        function forceReflow(e) {
            if ($(e.target).prev().is(':checked')) {
                // force reflow
                document.body.className = document.body.className;
            }
            else {
                // if the input is not checked yet, try again
                setTimeout(function() {
                    forceReflow(e);
                }, 100);
            }
        }
        $('.switch-toggle label').on('click', forceReflow);

        new iScroll('rules');
        
        Crafty.scene('Loading');
    }
};

//document.addEventListener('DOMComponentsLoaded', Game.start);
window.addEventListener('load', Game.start, false);

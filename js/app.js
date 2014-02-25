var Game = {
    // board's grid size and the size of each of its cell
    board: {
        size: null,
        rows: null,
        cols: null,
        cellSize: null
    },
    // players type (human or ai) and level if AI
    players: null,
    sound: false,
    startPlayer: false,

    gameover: null,

    animatePage: new AnimatePage(),

    // Read options when a new game is launched
    readLaunchOptions: function() {
        var option;

        // board size
        option = $('input[name=board-size]:checked').val().split('x');
        this.board.rows = option[0];
        this.board.cols = option[1];

        // start player
        option = $('input[name=start-player]:checked').val();
        this.startPlayer = option !== 'random' ? parseInt(option, 10) : 'random';

        this.players = [null, null];
        // player 1: human or ai (level easy, medium, hard)
        option = $('input[name=player-type-1]:checked').val().split(':');
        this.players[0] = {
            type: option[0],
            level: option[1]
        };
        
        // player 2: human or ai (level easy, medium, hard)
        option = $('input[name=player-type-2]:checked').val().split(':');
        this.players[1] = {
            type: option[0],
            level: option[1]
        };

        this.readInGameOptions();

        // compute cells size
        this.board.cellSize = this.board.size / Math.max(this.board.rows, this.board.cols);
    },

    // Options that can be changed during the game
    readInGameOptions: function() {
        var option;

        // sound FX on/off
        option = $('input[name=sound-fx]:checked').val();
        this.sound = option === 'on' ? true : false;
    },

    // Initialize and start game
    start: function() {
        Game.board.size = Math.min(window.innerHeight, window.innerWidth);

        // display or not a button to install site as an app
        installMe();

        $('#options form').sisyphus({
            onSave: function () {
                Game.readInGameOptions();
            }
        });

        $('#btn-new-game').on('click', function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();

            Crafty.scene('Game');
        });

        $('.btn-page').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            var page = $(this).data('page');
            var onEndCallback = function() {
                if (page === 'board') {
                    $('#btn-new-game').show();
                }
            };

            if (Game.animatePage.current === 'board') {
                $('#btn-new-game').hide();
                Game.animatePage.animate(page, 54);
            }
            else if (Game.animatePage.current === 'rules' && page === 'options') {
                Game.animatePage.animate(page, 54);
            }
            else if (Game.animatePage.current === 'rules' && page === 'board') {
                Game.animatePage.animate(page, 55, onEndCallback);
            }
            else if (Game.animatePage.current === 'options') {
                Game.animatePage.animate(page, 55, onEndCallback);
            }
        });

        // Start crafty
        Crafty.init(Crafty.DOM.window.width, Crafty.DOM.window.height, 'board');
        Crafty.canvas.init();
        Crafty.viewport.x = 0;
        Crafty.viewport.y = (window.innerHeight - Game.board.size) / 2;

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

function installMe() {
    var manifestUrl = location.href + 'manifest.webapp';
    var button = document.getElementById('btn-install');
    var installCheck;

    function installFirefoxOS(event) {
        event.preventDefault();

        var installLocFind = navigator.mozApps.install(manifestUrl);
        installLocFind.onsuccess = function(data) {
            // App is installed, do something
        };
        installLocFind.onerror = function() {
            // App wasn't installed
            alert(installLocFind.error.name);
        };
    }

    if (navigator.mozApps) {
        try {
            installCheck = navigator.mozApps.checkInstalled(manifestUrl);
        }
        catch (err) {
            return;
        }

        installCheck.onsuccess = function() {
            if (installCheck.result) {
                button.style.display = "none";
            }
            else {
                button.style.display = "";
                button.addEventListener('click', installFirefoxOS, false);
            }
        };
    }    
}

//document.addEventListener('DOMContentLoaded', Game.start, true);
window.addEventListener('load', Game.start, false);

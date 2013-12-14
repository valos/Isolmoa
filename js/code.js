/*
 * Isolmoa -- A two-player abstract strategy board game.
 * By: Valery Febvre <vfebvre@easter-eggs.com>
 *
 * Copyright (C) 2012 Valéry Febvre
 * http://gitorious.org/valos-labs/isolmoa
 *
 * This file is part of Isolmoa.
 *
 * Isolmoa is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * Isolmoa is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*jslint nomen: true, debug: true, evil: true, vars: true, continue: true, plusplus: true, browser: true, white: true*/
/*global  $, _, PIXI, Class*/

"use strict";

var debug = true;
var canvas, stage;
var piecesColors = ['#16b6f0', '#f63892'];

// Ideas
// http://dracsoft.com/atge/tests/game-frontend.html


function playSfx(sound) {
    if ($('#sfx').val() === 'on') {
        //$('#sfx-' + sound).get(0).play();
        //var ea = $('#sfx-' + sound).get(0);
        //ea.src = 'sfx/' + sound + '.ogg';
        //ea.play();
    }
}


var Piece = Class.extend({
    defaults: {
        direction: 'normal',
        posX: null,
        posY: null,
        color: null,
        strokeWidth: 2,
        parent: null
    },

    _setGeometry: function (direction) {
        var self = this;

        //this.group.x = this.parent.cellDim * this.posX + this.parent.cellDim / 2 + this.parent.delta;
        //this.group.y = this.parent.cellDim * this.posY + this.parent.cellDim / 2 + this.parent.delta;
/*
        this.circle.setRadius((this.parent.cellDim - this.parent.cellBorder * 3 - this.strokeWidth * 2) / 2);

        if (this.eyeL && this.eyeR && this.mouth) {
            this.eyeL.setAttrs({
                radius: {
                    x: this.circle.getRadius() / 6,
                    y: this.circle.getRadius() / 5
                },
                x: -this.circle.getRadius() / 3,
                y: -this.circle.getRadius() / 3
            });

            this.eyeR.setAttrs({
                radius: {
                    x: this.circle.getRadius() / 6,
                    y: this.circle.getRadius() / 5
                },
                x:  this.circle.getRadius() / 3,
                y: -this.circle.getRadius() / 3
            });
            this.mouth.setAttrs({
                drawFunc: function(context) {
                    context.beginPath();
                    context.moveTo(-self.circle.getRadius() * 0.666, self.circle.getRadius() / 4);
                    context.quadraticCurveTo(
                        0, self.circle.getRadius(),
                        self.circle.getRadius() * 0.666, self.circle.getRadius() / 4
                    );
                    context.closePath();
                    this.fill(context);
                }
            });
         }

        if (direction) {
            if (direction === 'reverse') {
                if (this.direction === 'normal') {
                    this.group.rotateDeg(180);
                }
            }
            else {
                if (this.direction === 'reverse') {
                    this.group.rotateDeg(-180);
                }
            }
            this.direction = direction;
        }
*/
    },

    constructor: function (options) {
        var self = this;
        options = _.defaults(options, this.defaults);

        this.parent = options.parent;
        this.dim = this.parent.cellDim;
        this.direction = this.defaults.direction; // set later by _setGeometry
        this.posX = options.posX;
        this.posY = options.posY;
        this.color = options.color;
        this.strokeWidth = options.strokeWidth;

        this.hidden = false;
        this.choices = null;

        this.sprite = new PIXI.Sprite(
            PIXI.Texture.fromImage("img/piece-blue-happy.png")
        );
        console.log(this.posX, this.posY);
        this.sprite.position.x = this.posX * this.dim + this.dim / 2 + this.parent.delta;
        this.sprite.position.y = this.posY * this.dim + this.dim / 2 + this.parent.delta;

        this.sprite.anchor.x = 0.5;
	this.sprite.anchor.y = 0.5;

        this.sprite.width = this.dim;
        this.sprite.height = this.dim;

        stage.addChild(this.sprite);

/*
        this.group = new Kinetic.Group();

        this.circle = new Kinetic.Circle({
            fill: this.color,
            stroke: "#333",
            strokeWidth: this.strokeWidth
        });
        this._setGeometry(options.direction);
        this.group.add(this.circle);

        this.eyeL = new Kinetic.Ellipse({
            fill: '#333',
            radius: {
                x: this.circle.getRadius() / 6,
                y: this.circle.getRadius() / 5
            },
            x: -this.circle.getRadius() / 3,
            y: -this.circle.getRadius() / 3
        });
        this.group.add(this.eyeL);

        this.eyeR = new Kinetic.Ellipse({
            fill: '#333',
            radius: {
                x: this.circle.getRadius() / 6,
                y: this.circle.getRadius() / 5
            },
            x:  this.circle.getRadius() / 3,
            y: -this.circle.getRadius() / 3
        });
        this.group.add(this.eyeR);

        // mouth
        this.mouth = new Kinetic.Shape({
            drawFunc: function(context) {
                context.beginPath();
                context.moveTo(-self.circle.getRadius() * .666, self.circle.getRadius() / 4);
                context.quadraticCurveTo(
                    0, self.circle.getRadius(),
                    self.circle.getRadius() * .666, self.circle.getRadius() / 4
                );
                context.closePath();
                this.fill(context);
            },
            fill: "#333"
        });
        this.group.add(this.mouth);

        layer.add(this.group);
        layer.draw();
*/
    },

    frown: function () {
        var self = this;

        this.mouth.setAttrs({
            drawFunc: function(context) {
                context.beginPath();
                context.moveTo(-self.circle.getRadius() / 2, self.circle.getRadius() / 2);
                context.quadraticCurveTo(
                    0, -self.circle.getRadius() / 4,
                    self.circle.getRadius() / 2, self.circle.getRadius() / 2
                );
                context.closePath();
                this.fill(context);
            }
        });
    },

    hide: function () {
        this.stopPulse();

        this.group.hide();

        this.hidden = true;
        this.choices = null;
    },

    move: function (posX, posY) {
        this.posX = posX;
        this.posY = posY;

        var x = this.parent.cellDim * this.posX + this.parent.cellDim / 2 + this.parent.delta;
        var y = this.parent.cellDim * this.posY + this.parent.cellDim / 2 + this.parent.delta;

        playSfx('move');

        this.group.transitionTo({
            x: x,
            y: y,
            duration: 0.5,
            easing: 'ease-in-out'
        });
    },

    redraw: function () {
        // used when board is resized
        this._setGeometry();
    },

    show: function (posX, posY, color, direction) {
        this.posX = posX;
        this.posY = posY;

        this._setGeometry(direction);
        this.circle.setAttrs({fill: color}); 

        this.group.show();
        this.group.moveToTop();
        layer.draw();

        this.hidden = false;
    },

    smile: function () {
        var self = this;

        this.mouth.setAttrs({
            drawFunc: function(context) {
                context.beginPath();
                context.moveTo(-2 * self.circle.getRadius() / 3, self.circle.getRadius() / 4);
                context.quadraticCurveTo(
                    0, self.circle.getRadius() * 1.33,
                    2 * self.circle.getRadius() / 3, self.circle.getRadius() / 4
                );
                context.closePath();
                this.fill(context);
            }
        });
    },

    startPulse: function () {
        var self = this;

        //this.pulseAnimationTimer = setInterval(function () {
        //    self.circle.setStroke(self.circle.getStroke() === '#ddd' ? '#333' : '#ddd');
        //    layer.draw();
        //}, 500);
    },

    stopPulse: function () {
        // stop pulse animation
        //clearInterval(this.pulseAnimationTimer);
        //this.circle.setStroke('#333');
    }
});


var Cell = Class.extend({
    defaults: {
        posX: null,
        posY: null,
        parent: null
    },

    constructor: function (options) {
        this.options = _.defaults(options, this.defaults);

        this.parent = this.options.parent;
        this.posX = this.options.posX;
        this.posY = this.options.posY;
        this.dim = this.parent.cellDim;
        //this.squareBorder = this.parent.cellBorder;
        //this.holeBorder = this.squareBorder + Math.ceil(this.squareBorder / 2);
        this.state = 'square';

        this.width = this.height = this.dim;
        this.x = this.posX * this.dim + this.parent.delta + this.width / 2;
        this.y = this.posY * this.dim + this.parent.delta + this.width / 2;

        this.hole = new PIXI.Sprite(
            PIXI.Texture.fromImage("img/hole.png")
        );
        this.hole.position.x = this.x;
        this.hole.position.y = this.y;

        this.hole.anchor.x = 0.5;
	this.hole.anchor.y = 0.5;

        this.hole.width = this.dim;
        this.hole.height = this.dim;

        stage.addChild(this.hole);

        this.square = new PIXI.Sprite(
            PIXI.Texture.fromImage("img/square.png")
        );
        this.square.position.x = this.x;
        this.square.position.y = this.y;

        this.square.anchor.x = 0.5;
	this.square.anchor.y = 0.5;

        this.square.width = this.dim;
        this.square.height = this.dim;

        this.square.setInteractive(true);

        stage.addChild(this.square);

        //console.log(this.posY, this.posX);
        //console.log(this.posX, this.posY, this.dim, this.border);
        //console.log(this.x, this.y, this.width, this.height);

        this.onclickHandler = null;

/*
        this.group = canvas.makeGroup();
        this.group.translation.set(
            this.x,
            this.y
        );

        this.hole = canvas.makeRectangle(
            this.holeBorder / 2,
            this.holeBorder / 2,
            this.width - this.holeBorder,
            this.height - this.holeBorder
        );
        this.hole.fill = '#000';
        this.hole.stroke = "#272727";
        this.hole.linewidth = this.holeBorder;
        this.hole.join = 'miter';
        this.group.add(this.hole);

        this.square = canvas.makeRectangle(
            this.squareBorder,
            this.squareBorder,
            this.width - this.squareBorder * 2,
            this.height - this.squareBorder * 2
        );
        this.square.on('click', function(){console.log('click')});

        this.square.fill = "#ffa809";
        this.square.stroke = "#d97007";
        this.square.linewidth = this.squareBorder;
        this.group.add(this.square);
*/
    },

    onclick: function (handler) {
        var self = this;
        this.onclickHandler = function () {
            handler(self);
        };
        this.square.click = this.square.tap = this.onclickHandler;

        return this;
    },

    redraw: function () {
        // used when board is resized
        this.dim = this.parent.cellDim;
        //this.squareBorder = this.parent.cellBorder;
        //this.holeBorder = this.squareBorder + Math.ceil(this.squareBorder / 2);

        this.width = this.height = this.dim;
        this.x = this.posX * this.dim + this.parent.delta + this.width / 2;
        this.y = this.posY * this.dim + this.parent.delta + this.width / 2;

        this.hole.position.x = this.x;
        this.hole.position.y = this.y;
        this.hole.width = this.width;
        this.hole.height = this.height;

        this.square.position.x = this.x;
        this.square.position.y = this.y;
        this.square.width = this.width;
        this.square.height = this.height;
/*
        this.hole.width = this.width - this.holeBorder;
        this.hole.height = this.height - this.holeBorder;

        this.square.width = this.width - this.squareBorder * 2 - this.squareBorder;
        this.square.height = this.height - this.squareBorder * 2 - this.squareBorder;
*/
/*
        this.group.setAttrs({
            x: this.x,
            y: this.y
        });

        this.hole.setAttrs({
            x: this.holeBorder / 2,
            y: this.holeBorder / 2,
            width: this.width - this.holeBorder,
            height: this.height - this.holeBorder,
            strokeWidth: this.holeBorder
        });

        if (this.state === 'hole') {
            return;
        }

        this.square.setAttrs({
            x: this.squareBorder,
            y: this.squareBorder,
            width: this.width - this.squareBorder * 2,
            height: this.height - this.squareBorder * 2,
            strokeWidth: this.squareBorder
        });
*/
    },

    remove: function () {
        this.group.off("touchend mouseup");
        this.group.removeChildren();
        layer.remove(this.group);
        this.onclickHandler = null;
    },

    removeSquare: function () {
        // squares under pieces can't be removed
        if (this.state === 'piece') {
            return false;
        }
        this.state = 'hole';

        playSfx('remove');

        this.square.transitionTo({
            x: this.width / 2,
            y: this.height / 2,
            width: 0,
            height: 0,
            stroke: '#000',
            duration: 0.5
        });

        return true;
    }
});


var Board = Class.extend({
    defaultOptions: {
        width: null,
        height: null,
        scale: 1.0,
        gridDim: null,
        gridCols: 6,
        gridRows: 6
    },

    _getBestChoice: function (choices, turn, degrade) {
        var max = [];
        _.each(choices, function (choice) {
            max.push(choice.score);
        });
        max = _.uniq(max).sort(function (a, b) { return a - b; });
        degrade = degrade || 0;

        var best = [];
        var maxPos = max.length - 1 - degrade;
        _.each(choices, function (choice) {
            if (choice.score === max[maxPos]) {
                best.push(choice);
            }
        });

        if (best.length) {
            var rnd = Math.floor(Math.random() * best.length);
            return _.clone(best[rnd]);
        }

        return null;
    },

    _getCellScore: function (cell, ignorePiece) {
        if (cell.state === 'hole') {
            return 0;
        }

        var i, j, score = 0;

        for (i = -1; i <= 1; i++) {
            var x = cell.posX + i;
            for (j = -1; j <= 1; j++) {
                var y = cell.posY + j;
                if (cell.posX === x && cell.posY === y) {
                    continue;
                }
                if (ignorePiece && ignorePiece.posX === x && ignorePiece.posY === y) {
                    continue;
                }
                if (x >= 0 && x < this.options.gridCols && y >= 0 && y < this.options.gridRows) {
                    if (this.cells[y][x].state !== 'hole') {
                        score += 1;
                    }
                }
            }
        }

        return score;
    },

    _getCellsScores: function (depth, turn, prevScores) {
        var i, j, k, l, scores = [];

        for (i = 0; i < this.options.gridRows; i++) {
            scores[i] = [];
            for (j = 0; j < this.options.gridCols; j++) {
                if (prevScores && prevScores[i][j]) {
                    for (k = -1; k <= 1; k++) {
                        var y = i + k;
                        for (l = -1; l <= 1; l++) {
                            var x = j + l;
                            if (x >= 0 && x < this.options.gridCols && y >= 0 && y < this.options.gridRows) {
                                if (scores[i][j] === undefined) {
                                    scores[i][j] = prevScores[y][x];
                                }
                                else {
                                    scores[i][j] += prevScores[y][x];
                                }
                            }
                        }
                    }
                }
                else {
                    if (this.pieces[(turn + 1) % 2].posY === i && this.pieces[(turn + 1) % 2].posX === j) {
                        scores[i][j] = 0;
                    }
                    else {
                        scores[i][j] = this._getCellScore(this.cells[i][j], this.pieces[(turn + 1) % 2]);
                    }
                }
            }
        }

        if (depth - 1) {
            //console.log('recursion', depth, scores);
            return this._getCellsScores(depth - 1, turn, scores);
        }

        //console.log(scores);
        return scores;
    },

    _getChoices: function (scores, turn) {
        var i, j, choices = [];

        for (i = -1; i <= 1; i++) {
            var y = this.pieces[turn].posY + i;
            for (j = -1; j <= 1; j++) {
                var x = this.pieces[turn].posX + j;
                if (x >= 0 && x < this.options.gridCols && y >= 0 && y < this.options.gridRows && (i !== 0 || j !== 0)) {
                    if (scores[y][x] && (x !== this.pieces[(turn + 1) % 2].posX || y !== this.pieces[(turn + 1) % 2].posY)) {
                        choices.push({posX: x, posY: y, score: scores[y][x]});
                    }
                }
            }
        }

        // sort
        choices.sort(function (a, b) {
            return a.score - b.score;
        });

        return choices;
    },

    _chooseRandomCell: function (excludePlayerNeighboringCells) {
        var i, j, choices = [];

        var excludes = [];
        if (excludePlayerNeighboringCells) {
            var piece = this.pieces[this.turn];
            for (i = -1; i <= 1; i++) {
                var x = piece.posX + i;
                for (j = -1; j <= 1; j++) {
                    var y = piece.posY + j;
                    if (x >= 0 && x < this.options.gridCols && y >= 0 && y < this.options.gridRows) {
                        if (this.cells[y][x].state === 'square') {
                            excludes.push(this.cells[y][x]);
                        }
                    }
                }
            }
        }

        _.each(this.cells, function (row) {
            _.each(row, function (cell) {
                if (cell.state === 'square') {
                    var i, ok = true;
                    for (i = 0; i < excludes.length; i++) {
                        if (excludes[i].posX === cell.posX && excludes[i].posY === cell.posY) {
                            ok = false;
                            break;
                        }
                    }
                    if (ok) {
                        choices.push(cell);
                    }
                }
            });
        });

        if (choices.length) {
            var rnd = Math.floor(Math.random() * choices.length);
            return {posX: choices[rnd].posX, posY: choices[rnd].posY};
        }

        return null;
    },

    _updateCellChoices: function (cell) {
        var i, j, x, y;

        if (!cell.hidden) {
            cell.choices = 0;
            for (i = -1; i <= 1; i++) {
                x = cell.posX + i;
                for (j = -1; j <= 1; j++) {
                    y = cell.posY + j;
                    if (cell.posX === x && cell.posY === y) {
                        continue;
                    }
                    if (x >= 0 && x < this.options.gridCols && y >= 0 && y < this.options.gridRows) {
                        if (this.cells[y][x].state === 'square') {
                            cell.choices += 1;
                        }
                    }
                }
            }
        }
        return cell.choices;
    },

    constructor: function (options) {
        var self = this;

        this.step = 'piece';
        this.turn = 0;
        this.pieces = [null, null];
        this.cells = null;

        canvas = new PIXI.CanvasRenderer(600, 600); //PIXI.autoDetectRenderer(600, 600);
        document.getElementById('canvas').appendChild(canvas.view);
        stage = new PIXI.Stage(0xFFFFFF, true);

        this.options = $.extend(this.defaultOptions, options);
        // gridRows/gridCols, scaling, players type/level
        this.readOptions();
        this.updateSizes();
        this.createGrid();

	requestAnimFrame( animate );
        function animate() {
	    requestAnimFrame( animate );
	    canvas.render(stage);
	}

        $('#btn-restart').bind('click', function () {
            self.restart();
            return false;
        });
        if (debug) {
            $('#btn-step').bind('click', function () {
                self.processAction();
                return false;
            });
        }

        $(window).on('resize', $.proxy(this.resizeGrid, this)).trigger('resize');

        this.displayCurrentAction();
    },

    createGrid: function () {
        var i, j;

        playSfx('new-game');

        this.cells = [];
        for (i = 0; i < this.options.gridRows; i++) {
            this.cells[i] = [];
            for (j = 0; j < this.options.gridCols; j++) {
                this.cells[i][j] = new Cell({
                    posX: j,
                    posY: i,
                    parent: this
                }).onclick($.proxy(this.processAction, this));
            }
        }

        //layer.draw();
        //canvas.play();

        if (this.options.players[0].type === 'computer') {
            this.processAction();
        }
    },

    displayCurrentAction: function () {
        var msgs = [];

        if (this.options.players[1].direction === 'reverse') {
            // Human vs Human (2 distinct messages in 2 players panels)
            msgs = ['...', '...'];
        }
        else {
            // Human vs Computer or Computer vs Computer
            msgs[0] = this.options.players[this.turn].type === 'human' ? 'Player' : 'Computer';

            if (this.options.players[0].type === 'computer' && this.options.players[1].type === 'computer') {
                msgs[0] += ' ' + (this.turn + 1);
            }
        }

        switch (this.step) {
        case 'piece':
            if (msgs.length === 2) {
                msgs[this.turn] = 'Choose a cell';
            }
            else {
                msgs[0] += ': Choose a cell';
            }
            break;
        case 'move':
            if (msgs.length === 2) {
                msgs[this.turn] = 'Move';
            }
            else {
                msgs[0] += ': Move';
            }
            break;
        case 'hole':
            if (msgs.length === 2) {
                msgs[this.turn] = 'Destroy a square';
            }
            else {
                msgs[0] += ': Destroy a square';
            }
            break;
        case 'win':
            if (this.pieces[0].choices === 0 && this.pieces[1].choices === 0) {
                if (msgs.length === 2) {
                    msgs[0] = msgs[1] = 'No winner: draw';
                }
                else {
                    msgs[0] = 'No winner: draw';
                }
            }
            else if (this.pieces[1].choices === 0) {
                if (msgs.length === 2) {
                    msgs[0] = 'You wins';
                    msgs[1] = 'You loses';
                }
                else {
                    msgs[0] = this.options.players[0].type === 'human' ? 'Player' : 'Computer';
                    if (this.options.players[0].type === 'computer' &&
                        this.options.players[1].type === 'computer') {
                        msgs[0] += ' 1';
                    }
                    msgs[0] += ' wins';
                }
                this.pieces[0].smile();
                this.pieces[1].frown();
            }
            else {
                if (msgs.length === 2) {
                    msgs[0] = 'You loses';
                    msgs[1] = 'You wins';
                }
                else {
                    msgs[0] = this.options.players[1].type === 'human' ? 'Player' : 'Computer';
                    if (this.options.players[0].type === 'computer' &&
                        this.options.players[1].type === 'computer') {
                        msgs[0] += ' 2';
                    }
                    msgs[0] += ' wins';
                }
                this.pieces[0].frown();
                this.pieces[1].smile();
            }
            setTimeout(function () {
                //console.log('timeout playSfx');
                playSfx('win');
            }, 250);
            break;
        }

        if (msgs.length === 2) {
            $('#current-action-p1').text(msgs[0]);
            $('#current-action-p2').text(msgs[1]);
        }
        else {
            $('#current-action-p1').text(msgs[0]);
            $('#current-action-p2').text('');
        }
    },

    movePiece: function (posX, posY) {
        var piece = this.pieces[this.turn];

        this.cells[piece.posY][piece.posX].state = 'square';

        piece.move(posX, posY);

        this.cells[piece.posY][piece.posX].state = 'piece';

        return true;
    },

    movePieceComputer: function () {
        var scores, choices, best;

        switch (this.options.players[this.turn].level) {
        case 'easy':
            scores = this._getCellsScores(1, this.turn);
            choices = this._getChoices(scores, this.turn);
            best = this._getBestChoice(choices, 1);
            break;
        case 'normal':
            scores = this._getCellsScores(3, this.turn);
            choices = this._getChoices(scores, this.turn);
            best = this._getBestChoice(choices, 0);
            break;
        case 'hard':
            best = this._alphabeta(3, -1000000, 1000000, {});
            break;
        }

        return this.movePiece(best.posX, best.posY);
    },

    movePieceHuman: function (posX, posY) {
        var piece = this.pieces[this.turn];
        // move piece to a neighboring (horizontally, vertically, or diagonally) cell that contains a square
        if (Math.abs(piece.posX - posX) > 1 || Math.abs(piece.posY - posY) > 1) {
            return false;
        }
        if (this.cells[posY][posX].state !== 'square') {
            return false;
        }

        return this.movePiece(posX, posY);
    },

    placePiece: function (posX, posY) {
        if (!this.pieces[this.turn]) {
            // piece doesn't exist, create it
            this.pieces[this.turn] = new Piece({
                color: this.options.players[this.turn].color,
                direction: this.options.players[this.turn].direction,
                posX: posX,
                posY: posY,
                parent: this
            });
        }
        else {
            // piece already exists, just show it
            this.pieces[this.turn].show(
                posX, posY, this.options.players[this.turn].color, this.options.players[this.turn].direction);
        }

        this.cells[posY][posX].state = 'piece';
    },

    placePieceComputer: function () {
        var c = this._chooseRandomCell();

        this.placePiece(c.posX, c.posY);
        return true;
    },

    placePieceHuman: function (posX, posY) {
        if (this.pieces[0] && !this.pieces[0].hidden && posX === this.pieces[0].posX && posY === this.pieces[0].posY) {
            // place is already occupied by piece of player 1
            return false;
        }
        this.placePiece(posX, posY);
        return true;
    },

    processAction: function (cell) {
        var self = this, ret;

        if (cell && this.options.players[this.turn].type === 'computer') {
            // human player clicks on board during computer turn
            return;
        }
        console.log(cell.posX, cell.posY, this.step, this.options.players[this.turn].type);

        switch (this.step) {
        case 'piece':
            if (this.options.players[this.turn].type === 'computer') {
                ret = this.placePieceComputer();
            }
            else {
                ret = this.placePieceHuman(cell.posX, cell.posY);
            }
            if (ret) {
                if (this.turn === 1) {
                    this.step = 'move';
                }
                this.updateTurn();
            }
            break;
        case 'move':
            if (this.options.players[this.turn].type === 'computer') {
                ret = this.movePieceComputer();
            }
            else {
                ret = this.movePieceHuman(cell.posX, cell.posY);
            }
            if (ret) {
                this.step = 'hole';
                this.displayCurrentAction();
            }
            break;
        case 'hole':
            if (this.options.players[this.turn].type === 'computer') {
                ret = this.removeSquareComputer();
            }
            else {
                ret = this.removeSquareHuman(cell);
            }
            if (ret) {
                this.step = 'move';
                this.updateTurn();
            }
            break;
        }

        if (this.step !== 'win' && this.options.players[this.turn].type === 'computer') {
            this.processActionTimer = setTimeout(function () {
                //console.log('timeout processAction');
                self.processAction();
            }, 2000);
        }
    },

    readOptions: function () {
        this.options.gridCols = this.options.gridRows = parseInt($('#grid-size').val(), 10);
        this.options.players = [
            {
                type: $('#player-type-0').val(),
                level: $('#player-level-0').val(),
                color: $('#player-color-0').val() ? $('#player-color-0').val() : piecesColors[1], // FIXME
                direction: 'normal'
            },
            {
                type: $('#player-type-1').val(),
                level: $('#player-level-1').val(),
                color: $('#player-color-1').val() ? $('#player-color-1').val() : piecesColors[0],
                direction: 'normal'
            }
        ];
        // set 2nd player's direction to reverse if 2 players are humans
        if (this.options.players[0].type === 'human' && this.options.players[1].type === 'human') {
            this.options.players[1].direction = 'reverse';
            $('#current-action-p2').css('padding', '4px 0');
        }
        else {
            $('#current-action-p2').css('padding', '1px 0 0 0');
        }
    },

    _alphabeta: function (depth, alpha, beta, scores, turn) {
        // P1 : M R     M R     M R
        // P2 :     M R     M R     M R

        var i, j, pposX, pposY, doBreak;
        var localAlpha = alpha;
        var bestValue = -1000000;
        var value, evaluation;

        var piece = this.pieces[this.turn];
        var scoresM, choicesM;
        var scoresR, choicesR;

        if (turn === undefined) {
            turn = this.turn;
        }

        if (depth === 0) {
            // return evaluation of piece 
            // normal evaluation for player, -evaluation for opponent
            evaluation = this._updateCellChoices(this.cells[piece.posY][piece.posX]);
            return turn === this.turn ? evaluation : -evaluation;
        }

        // get possible choices (moves)
        scoresM = this._getCellsScores(3, this.turn);
        choicesM = this._getChoices(scoresM, this.turn);

        if (choicesM.length === 0) {
            // no more move for piece
            return turn === this.turn ? -1000000 : 1000000;
        }

        for (i = 0; i < choicesM.length; i++) {
            // do move
            pposX = piece.posX;
            pposY = piece.posY;
            this.cells[piece.posY][piece.posX].state = 'square';
            this.cells[choicesM[i].posY][choicesM[i].posX].state = 'piece';
            piece.posX = choicesM[i].posX;
            piece.posY = choicesM[i].posY;

            // get possible choices (removes)
            scoresR = this._getCellsScores(3, (this.turn + 1) % 2);
            choicesR = this._getChoices(scoresR, (this.turn + 1) % 2);

            if (choicesR.length === 0) {
                // no more remove for piece
                value = this.turn === turn ? -1000000 : 1000000;

                if (scores !== null) {
                    scores[value] = choicesM[i];
                }

                bestValue = Math.max(value, bestValue);
                if (bestValue >= beta) {
                    // undo move
                    piece.posX = pposX;
                    piece.posY = pposY;
                    this.cells[piece.posY][piece.posX].state = 'piece';
                    this.cells[choicesM[i].posY][choicesM[i].posX].state = 'square';
                    break;
                }
                if (bestValue > localAlpha) {
                    localAlpha = bestValue;
                }
            }

            if (choicesR.length > 0) {
                for (j = 0; j < choicesR.length; j++) {
                    // do remove
                    this.cells[choicesR[j].posY][choicesR[j].posX].state = 'hole';

                    this.turn = (this.turn + 1) % 2;
                    value = -this._alphabeta(depth - 1, -beta, -localAlpha, null, turn);
                    this.turn = (this.turn + 1) % 2;

                    // undo remove
                    this.cells[choicesR[j].posY][choicesR[j].posX].state = 'square';

                    if (scores !== null) {
                        scores[value] = choicesM[i];
                    }

                    bestValue = Math.max(value, bestValue);
                    if (bestValue >= beta) {
                        doBreak = true;
                        break;
                    }
                    if (bestValue > localAlpha) {
                        localAlpha = bestValue;
                    }
                }
            }
            else {
                // no more remove for piece
                value = this.turn === turn ? -1000000 : 1000000;

                if (scores !== null) {
                    scores[value] = choicesM[i];
                }

                bestValue = Math.max(value, bestValue);
                if (bestValue >= beta) {
                    doBreak = true;
                }
                if (bestValue > localAlpha) {
                    localAlpha = bestValue;
                }
            }

            // undo move
            piece.posX = pposX;
            piece.posY = pposY;
            this.cells[piece.posY][piece.posX].state = 'piece';
            this.cells[choicesM[i].posY][choicesM[i].posX].state = 'square';

            if (doBreak) {
                break;
            }
        }

        if (scores !== null) {
            return scores[bestValue];
        }
        return bestValue;
    },

    removeSquareComputer: function () {
        var scores, choices, best;

        switch(this.options.players[this.turn].level) {
        case 'easy':
            scores = this._getCellsScores(1, (this.turn + 1) % 2);
            choices = this._getChoices(scores, (this.turn + 1) % 2);
            best = this._getBestChoice(choices, 1);
            break;
        case 'normal':
            scores = this._getCellsScores(3, (this.turn + 1) % 2);
            choices = this._getChoices(scores, (this.turn + 1) % 2);
            best = this._getBestChoice(choices, 0);
            break;
        case 'hard':
            this.turn = (this.turn + 1) % 2;
            best = this._alphabeta(3, -1000000, 1000000, {});
            this.turn = (this.turn + 1) % 2;
            break;
        }
        if (!best) {
            // no best choice => instead, choose a random cell
            // excluding neighboring cell of current player
            best = this._chooseRandomCell(true);
        }

        return this.cells[best.posY][best.posX].removeSquare();
    },

    removeSquareHuman: function (cell) {
        return cell.removeSquare();
    },

    resizeGrid: function (e) {
        this.updateSizes();
        console.log('resizeGrid', this.cellDim);

        _.each(this.cells, function (row) {
            _.each(row, function (cell) {
                cell.redraw();
            });
        });
        _.each(this.pieces, function (piece) {
            if (piece) {
                //piece.redraw();
            }
        });

        //canvas.update();

        // adjust board layout grid
        // via CSS3 media query, 2 players panels and canvas are set
        // horizontally or vertically depending of device orientation
        // here, we modify #panel-p1 and #panel-p2 sizes to be equal.
        if ($(window).width() > $(window).height()) {
            var w = ($(window).width() - canvas.width) / 2;
            $('#panel-p1').width(w);
            $('#panel-p2').width(w);
        }
        else {
            $('#panel-p1').width('auto');
            $('#panel-p2').width('auto');
        }
    },

    restart: function () {
        this.step = 'piece';
        this.turn = 0;

        clearInterval(this.processActionTimer);
        this.readOptions();
        this.updateSizes();

        // reset grid
        _.each(this.cells, function (row) {
            _.each(row, function (cell) {
                cell.remove();
            });
        });
        _.each(this.pieces, function (piece) {
            if (piece) {
                piece.hide();
            }
        });
        this.createGrid();

        this.displayCurrentAction();
    },

    updateSizes: function () {
        $('body').css('overflow', 'hidden');
        var w = $(window).width();
        $('body').css('overflow', '');
        var h = $(window).height();
        this.options.width = this.options.height = this.options.gridDim = Math.min(w, h);

        canvas.resize(
            Math.floor(this.options.width * this.options.scale),
            Math.floor(this.options.height * this.options.scale)
        );
        this.cellDim = Math.floor(Math.floor(this.options.gridDim * this.options.scale) / this.options.gridCols);
        this.cellBorder = Math.round(4 * this.options.scale);
        this.delta = Math.floor((canvas.width - this.options.gridCols * this.cellDim) /  2);
    },

    updateTurn: function () {
        this.pieces[this.turn].stopPulse();

        this.turn = (this.turn + 1) % 2;

        if (this.pieces[1]) {
            // check if winner/looser
            this._updateCellChoices(this.pieces[0]);
            this._updateCellChoices(this.pieces[1]);
            if (this.pieces[0].choices === 0 || this.pieces[1].choices === 0) {
                this.step = 'win';
            }
        }

        this.displayCurrentAction();

        if (this.pieces[this.turn] && this.step !== 'win') {
            this.pieces[this.turn].startPulse(true);
        }
    }
});


$(document).bind("mobileinit", function () {
    $.mobile.defaultPageTransition = 'slide';

    $(document).on('pageinit', '#board', function (event) {
    });

    $('#options').on('pageinit', function (event) {
        $('#player-type-0').on('change', function () {
            if ($(this).val() === 'human') {
                $('#player-level-0').parent().parent().hide();
            }
            else {
                $('#player-level-0').parent().parent().show();
            }
        }).trigger('change');
        $('#player-type-1').on('change', function () {
            if ($(this).val() === 'human') {
                $('#player-level-1').parent().parent().hide();
            }
            else {
                $('#player-level-1').parent().parent().show();
            }
        }).trigger('change');

        $('#player-color-radio-0').on('click tap', function () {
            if ($('#player-color-0').val() === piecesColors[0]) {
                $('#player-color-0').val(piecesColors[1]).trigger('change');
                $('#player-color-1').val(piecesColors[0]).trigger('change');
            }
            else {
                $('#player-color-0').val(piecesColors[0]).trigger('change');
                $('#player-color-1').val(piecesColors[1]).trigger('change');
            }
        });
        $('#player-color-radio-1').on('click tap', function () {
            if ($('#player-color-1').val() === piecesColors[0]) {
                $('#player-color-0').val(piecesColors[0]).trigger('change');
                $('#player-color-1').val(piecesColors[1]).trigger('change');
            }
            else {
                $('#player-color-0').val(piecesColors[1]).trigger('change');
                $('#player-color-1').val(piecesColors[0]).trigger('change'); 
            }
        });
        $('#player-color-0').on('change', function () {
            if ($(this).val() === piecesColors[0]) {
                $('#player-color-radio-0').next().css('background', piecesColors[0]);
                $('#player-color-radio-1').next().css('background', piecesColors[1]);
            }
            else {
                $('#player-color-radio-0').next().css('background', piecesColors[1]);
                $('#player-color-radio-1').next().css('background', piecesColors[0]);
            }
        }).trigger('change');
    });
});


$(function() {
    var board = new Board();

    $('#form-options').sisyphus({
        onSave: function () {
            //console.log('options save');
        },
        onRestore: function () {
            //console.log('options restore');
        }
    });
});

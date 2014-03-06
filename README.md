Isolmoa
=======

A two-player abstract strategy board game based on [Isola](http://en.wikipedia.org/wiki/Isola_%28board_game%29) written in pure HTML5 (canvas, audio elements, data storage) + JavaScript (jQuery, Underscore, Sisyphus, Crafty).

It's a small project initially created to learn/play with some new HTML5 stuffs. Now, it is also a test case of HTML5 mobile app.

Rules
-----
The board initially contains squares.

Each of the two players has one piece.

To begin, each player places his/her piece.

Next, each turn of play is composed of two actions:
- moving his/her piece to a neighboring (horizontally, vertically, or diagonally) position that contains a square but not the opponent's piece
- removing any square with no piece on it.

The goal of the game is to block the opponent by destroying all the squares which surround him before being blocked yourself.

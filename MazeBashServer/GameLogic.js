"use strict";
var makePlayer = require("./Player.js");

var GameLogic = function () {
    
    const player_speed = 10;
    
    var red_player = null;
    var blue_player = null;
    
    var gameFull = function () {
        return (red_player && blue_player);
    };
    
    var playerState = function (player) {
        if (!player) {
            return null;
        }
        return {
            position: player.position()
        };
    };

    
    var _update = function () {
        if (!gameFull()) {
            return;
        }
        red_player.advance(player_speed);
        blue_player.advance(player_speed);
    };

    var _currentState = function () {
        return {
            players: {
                red: playerState(red_player),
                blue: playerState(blue_player)
            }
        };
    };

    var _isAllowedToJoin = function (data) {
        if (!data.colour) {
            return false;
        }
        if (data.colour !== "red" && data.colour !== "blue") {
            return false;
        }
        if (data.colour === "red" && red_player) {
            return false;
        }
        if (data.colour === "blue" && blue_player) {
            return false;
        }
        return true;
    };

    var _addPlayerToGame = function (id, name, data) {
        if (data.colour === "red") {
            red_player = makePlayer({ x: 50, y: 50 });
            red_player.id = id;
        } else if (data.colour === "blue") {
            blue_player = makePlayer({ x: 250, y: 250 });
            blue_player.id = id;
        } else {
            console.log("Unexpected colour");
        }
    };

    var _removePlayerById = function (id) {
        if (red_player && red_player.id === id) {
            red_player = null;
        } else if (blue_player && blue_player.id === id) {
            blue_player = null;
        }
    };

    var _receivePlayerInput = function (id, data) {
        if (!(data.position && data.position.x && data.position.y)) {
            console.log("Invalid player input");
            return;
        }
        if (red_player.id === id) {
            red_player.setTarget(data.position);
        } else if (blue_player.id === id) {
            blue_player.setTarget(data.position);
        } else {
            console.log("Data received from unknown player");
        }
    };

    return {
        update: _update
        , currentState: _currentState
        , isAllowedToJoin: _isAllowedToJoin
        , addPlayerToGame: _addPlayerToGame
        , removePlayerById: _removePlayerById
        , receivePlayerInput: _receivePlayerInput
    };
};

module.exports = GameLogic;
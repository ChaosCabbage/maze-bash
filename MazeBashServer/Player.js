"use strict";

var makePlayer = function (start_pos) {
    
    var position = { x: start_pos.x, y: start_pos.y };
    var target = { x: start_pos.x, y: start_pos.y };
    
    var setTarget = function (new_pos) {
        target = new_pos;
    };
    
    var length = function (vector) {
        return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    };
    
    var vectorToTarget = function () {
        return {
            x: target.x - position.x,
            y: target.y - position.y
        };
    };
    
    var advance = function (distance_to_move) {
        var vector = vectorToTarget();
        var dist_remaining = length(vector);
        if (dist_remaining == 0) {
            return;
        }
        
        var d = Math.max(dist_remaining, distance_to_move);
        var proportion = d / dist_remaining
        position.x += vector.x * proportion;
        position.y += vector.y * proportion;
    };
    
    return {
        position: function () { return position; },
        advance: advance,
        setTarget: setTarget
    };
};

module.exports = makePlayer;
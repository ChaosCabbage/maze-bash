"use strict";

var makePlayer = function (start_pos) {
    
    var position = { x: start_pos.x, y: start_pos.y };
    var target = position;
    
    var setTarget = function (new_pos) {
        target = new_pos;
    };
    
    var length = function (vector) {
        return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    };
    
    var vectorToTarget = function () {
        return {
            x: position.x - target.x,
            y: position.y - target.y
        };
    };
    
    var advance = function (distance) {
        var vector = vectorToTarget();
        var proportion = Math.max(1, distance / length(vector));
        
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
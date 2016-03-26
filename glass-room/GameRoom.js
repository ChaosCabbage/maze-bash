var RoomIO = require("./GameRoom/IO");

function GameRoom(io, room_name, logic) {

    var room_io = RoomIO(io, room_name, logic);

    var delay = 200;
    var looper = null;

    var loop = function () {
        logic.update();
        room_io.broadcastGameState();
    };

    var run = function () {
        if (looper == null) {
            console.log("Beginning main loop");
            looper = setInterval(loop, delay);
        }
    };

	return {
		  nameIsAvailable: room_io.nameIsAvailable
		, addNewPlayer: room_io.tryToJoinRoom
		, run: run
	};
};

module.exports = GameRoom;
"use strict";

var GameRoomIO = function (io, room_name, room_logic) {
	
	var _people_in_room = (function() {
		var names = [];
		
		return {
			nameIsAvailable: function(name) {
				return (names.indexOf(name) == -1);
			}
		
			, add: function(name) {	
				names.push(name); 
			}
			
			, remove: function(name) {  
				names.splice(names.indexOf(name), 1); 
			}
		};
    }());
    
    var _addPlayerToGame = function (socket, join_data, name) {
        room_logic.addPlayerToGame(socket.id, name, join_data);
        socket.on("try update", function (data) {
            room_logic.receivePlayerInput(socket.id, data);
        });
    };
	
    var _tryToJoinGame = function (socket, join_request, name) {
        console.log(name + " (" + socket.id + "): trying to join with " + JSON.stringify(join_request));
        if (room_logic.isAllowedToJoin(join_request)) {
            _addPlayerToGame(socket, join_request, name);
			socket.removeAllListeners("join game");
		} else {
			socket.emit("failed to join", {reason: "Class taken"});
		}
	};

	var _tryToJoinRoom = function(player_socket, name)	{
	    player_socket.join(room_name);
        _people_in_room.add(name);
		player_socket.emit("joined room", room_logic.currentState());
		
		player_socket.on("join game", function(data) {
			_tryToJoinGame(player_socket, data, name);
		});			
		
		player_socket.on("disconnect", function () {
			room_logic.removePlayerById(player_socket.id);
			_people_in_room.remove(name);
        });
	};
	
	var _broadcastGameState = function() {
		io.sockets.in(room_name).emit("game update", room_logic.currentState());
	};
	
	return {
        tryToJoinRoom : _tryToJoinRoom
		, broadcastGameState : _broadcastGameState
		, nameIsAvailable: _people_in_room.nameIsAvailable
	};	
};

module.exports = GameRoomIO;
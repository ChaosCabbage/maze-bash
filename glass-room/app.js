var GameRoom = require("./GameRoom");

var GlassRoom = function (server, game_logic) {
    var io = require('socket.io').listen(server);
    var mainRoom = GameRoom(io, "the", game_logic);
    
    mainRoom.run();
    
    io.on('connection', function (socket) {
        console.log(socket.id.toString() + " connected");
        socket.on('disconnect', function () {
            console.log(socket.id.toString() + " disconnected");
        });
        
        socket.on("join room", function (data) {
            if (mainRoom.nameIsAvailable(data.name)) {
                mainRoom.addNewPlayer(socket, data.name);
                socket.removeAllListeners("join room");
            } else {
                socket.emit("name taken");
            }
        });
  
    });

};

module.exports = GlassRoom;
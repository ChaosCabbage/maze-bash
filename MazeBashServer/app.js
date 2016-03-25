var glass = require("glass-room");

var app = require("./server");
var makeLogic = require("./GameLogic");

var http = require("http");

var server = http.createServer(app);
server.listen(process.env.PORT || 3000);

glass(server, makeLogic());

module.exports = app;
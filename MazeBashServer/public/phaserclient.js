var SimpleGame = (function () {
    function SimpleGame() {
        var game = new Phaser.Game(800, 600, Phaser.AUTO, 'content');
        game.state.add("Boot", BootState);
        game.state.add("Preload", PreloadState);
        game.state.add("NameInput", NameInputState);
        game.state.add("Lobby", LobbyState);
        game.state.add("TheGame", GameState);
        game.state.start("Boot");
    }
    return SimpleGame;
})();
window.onload = function () {
    var game = new SimpleGame();
};
var Debug = (function () {
    function Debug() {
    }
    Debug.SERVER_ADDRESS = null;
    return Debug;
})();
var BootState = (function () {
    function BootState(game) {
        var _this = this;
        this.preload = function () {
            _this.game.load.image("loading", "assets/images/loading.png");
        };
        this.create = function () {
            _this.game.state.start("Preload");
        };
        console.log("%cStarting my awesome game", "color:white; background:red");
        this.game = game;
    }
    return BootState;
})();
var PlayerNameMap = (function () {
    function PlayerNameMap() {
    }
    return PlayerNameMap;
})();
var toNameMap = function (players) {
    var map = new PlayerNameMap;
    players.forEach(function (p) {
        map[p.name] = p;
    });
    return map;
};
var GameState = (function () {
    function GameState(game) {
        var _this = this;
        this.playerEntities = {};
        this.init = function (socket, yourName, data) {
            _this.socket = socket;
            _this.yourName = yourName;
            _this.latestServerState = data;
        };
        this.addPlayerToGame = function (name) {
            _this.playerEntities[name] = new PlayerEntity(_this.game);
        };
        this.processServerUpdate = function (newState) {
            var diff = new ServerStateDiff(_this.latestServerState, newState);
            diff.removedPlayers.forEach(function (name) {
                _this.playerEntities[name].removeFromGame();
                delete _this.playerEntities[name];
            });
            diff.addedPlayers.forEach(function (player) {
                _this.addPlayerToGame(player.name);
            });
            newState.players.forEach(function (player) {
                var entity = _this.playerEntities[player.name];
                entity;
            });
            _this.latestServerState = newState;
        };
        this.create = function () {
            console.log("Entering main game state");
            _this.game.stage.backgroundColor = '#437698';
            var map = _this.game.add.tilemap('cave');
            map.addTilesetImage('cave', 'cavetiles');
            var floor = map.createLayer('Tile Layer 1');
            var walls = map.createLayer('Walls');
            floor.resizeWorld();
            var x = Math.random() * 500;
            var y = Math.random() * 500;
            var you = new PlayerEntity(_this.game);
            you.reconcile({
                pos: { x: x, y: y },
                name: _this.yourName
            });
            _this.playerEntities[_this.yourName] = you;
            _this.socket.on("game update", function (data) {
                if (!data || !data.players) {
                    return;
                }
                _this.processServerUpdate(data);
            });
        };
        this.update = function () {
            for (var name in _this.playerEntities) {
                _this.playerEntities[name].update();
            }
        };
        this.render = function () {
        };
        this.game = game;
    }
    return GameState;
})();
var LobbyState = (function () {
    function LobbyState(game) {
        var _this = this;
        this.init = function (socket, yourName, data) {
            _this.socket = socket;
            _this.you = yourName;
            _this.state = data;
        };
        this.create = function () {
            console.log("Entering Lobby state");
            _this.socket.emit("join game", { job: "Gimp" });
            _this.socket.on("failed to join", function () {
                alert("Sad face");
            });
            _this.game.state.start("TheGame", true, false, _this.socket, _this.you, _this.state);
        };
        this.game = game;
    }
    return LobbyState;
})();
var NameInputState = (function () {
    function NameInputState(game) {
        var _this = this;
        this.preload = function () {
        };
        this.init = function (socket) {
            _this.socket = socket;
            _this.input = document.getElementById("hiddennameinput");
        };
        this.strings = {
            error: {
                pos: { x: 0, y: 0 },
                text: "Sorry, there is a problem with the page.\nPlease contact the author with your cricket bat, by swinging it at his head.",
                style: { font: "65px Arial", fill: "#ff0000", align: "center" }
            },
            enter: {
                pos: { x: 0, y: -100 },
                text: "Enter a name:",
                style: { font: "50px Arial", fill: "#0faedb", align: "center" }
            },
            name: {
                pos: { x: 0, y: 0 },
                text: "",
                style: { font: "65px Arial", fill: "#339944", align: "center" }
            },
            taken: {
                pos: { x: 0, y: 50 },
                text: "That name's been taken by some bugger.",
                style: { font: "38px Arial", fill: "#ff0000", align: "center" }
            }
        };
        this.create = function () {
            if (_this.input == null) {
                _this.display(_this.strings.error);
                _this.update = function () { };
                return;
            }
            _this.display(_this.strings.enter);
            _this.textEntity = _this.display(_this.strings.name);
            _this.join = function () {
                if (_this.nameIsValid()) {
                    _this.socket.emit("join room", { name: _this.currentName() });
                }
            };
            _this.socket.on("joined room", function (data) {
                _this.game.state.start("Lobby", true, false, _this.socket, _this.currentName(), data);
            });
            _this.socket.on("name taken", function () {
                _this.display(_this.strings.taken);
                _this.input.value = "";
            });
            _this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.ENTER);
            var enterKey = _this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
            enterKey.onUp.add(_this.join);
            _this.cursor = (function () {
                var player = _this.game.add.sprite(_this.game.world.centerX, _this.game.world.centerY, 'player', 1);
                player.anchor.set(0, 0.5);
                player.animations.add('right', [1, 2], 10, true);
                player.play("right");
                return player;
            })();
        };
        this.update = function () {
            _this.textEntity.setText(_this.currentName());
            _this.cursor.x = _this.textEntity.x + (_this.textEntity.width / 2) + 10;
            _this.focusInput();
        };
        this.game = game;
    }
    NameInputState.prototype.display = function (stringData) {
        var text = this.game.add.text(this.game.world.centerX + stringData.pos.x, this.game.world.centerY + +stringData.pos.y, stringData.text, stringData.style);
        text.anchor.set(0.5, 0.5);
        return text;
    };
    NameInputState.prototype.currentName = function () {
        return this.input.value;
    };
    NameInputState.prototype.nameIsValid = function () {
        return this.currentName() != "";
    };
    NameInputState.prototype.focusInput = function () {
        this.input.focus();
    };
    return NameInputState;
})();
var PreloadState = (function () {
    function PreloadState(game) {
        var _this = this;
        this.preload = function () {
            var loadingBar = _this.game.add.sprite(160, 240, "loading");
            loadingBar.anchor.setTo(0.5, 0.5);
            _this.game.load.setPreloadSprite(loadingBar);
            _this.game.load.spritesheet("player", "assets/sprites/spaceman.png", 16, 16);
            _this.game.load.tilemap("cave", "assets/tilemap/caveMap.json", null, Phaser.Tilemap.TILED_JSON);
            _this.game.load.image("cavetiles", "assets/tilemap/cave.png");
        };
        this.create = function () {
            var address = Debug.SERVER_ADDRESS || "";
            var socket = io(address);
            _this.game.state.start("NameInput", true, false, socket);
        };
        this.game = game;
    }
    return PreloadState;
})();
var Emitter = (function () {
    function Emitter(socket, player) {
        this.socket = socket;
        this.player = player;
    }
    Emitter.prototype.emit = function () {
        this.socket.emit("try update", {
            x: this.player.body.position.x,
            y: this.player.body.position.y
        });
    };
    return Emitter;
})();
var PlayerEntity = (function () {
    function PlayerEntity(game) {
        var _this = this;
        this.waitingUpdate = null;
        this.update = function () {
            if (_this.waitingUpdate != null) {
                _this.sprite.body.position.setTo(_this.waitingUpdate.x, _this.waitingUpdate.y);
                _this.waitingUpdate = null;
            }
        };
        this.reconcile = function (data) {
            _this.waitingUpdate = data.pos;
        };
        this.removeFromGame = function () {
            _this.sprite.destroy();
        };
        this.sprite = game.add.sprite(100, 100, "player", 1);
        this.sprite.animations.add("left", [8, 9], 10, true);
        this.sprite.animations.add("right", [1, 2], 10, true);
        this.sprite.animations.add("up", [11, 12, 13], 10, true);
        this.sprite.animations.add("down", [4, 5, 6], 10, true);
        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.body.setSize(10, 14, 2, 1);
        this.sprite.play("left");
    }
    return PlayerEntity;
})();
var ServerStateDiff = (function () {
    function ServerStateDiff(oldState, newState) {
        this.nameList = function (state) {
            return state.players.map(function (p) {
                return p.name;
            });
        };
        var oldNames = this.nameList(oldState);
        var newNames = this.nameList(newState);
        this.addedPlayers = newState.players.filter(function (p) {
            return oldNames.indexOf(p.name) == -1;
        });
        this.removedPlayers = oldNames.filter(function (name) {
            return newNames.indexOf(name) == -1;
        });
    }
    return ServerStateDiff;
})();

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
var GameState = (function () {
    function GameState(game) {
        var _this = this;
        this.init = function (socket, yourColour, data) {
            _this.socket = socket;
            _this.latestServerState = data;
            _this.you = null;
            _this.enemy = null;
            if (yourColour === "red") {
                _this.processState = _this.processRed;
            }
            else if (yourColour === "blue") {
                _this.processState = _this.processBlue;
            }
            else {
                _this.processState = function () {
                    console.error("Wrong colour!");
                };
            }
        };
        this.create = function () {
            console.log("Entering main game state");
            _this.game.stage.backgroundColor = '#435261';
            var map = _this.game.add.tilemap('maze');
            map.addTilesetImage('Maze', 'mazetiles');
            var floor = map.createLayer('Maze');
            floor.resizeWorld();
            _this.you = new LocalPlayer(_this.game);
            _this.socket.on("game update", function (data) {
                _this.processServerUpdate(new ValidatedServerState(data));
            });
        };
        this.update = function () {
            _this.you.update();
            if (_this.enemy) {
                _this.enemy.update();
            }
            _this.socket.emit("try update", _this.you.data());
        };
        this.render = function () {
        };
        this.game = game;
    }
    GameState.prototype.processRed = function (newState) {
        var diff = new ServerStateDiff(this.latestServerState, newState);
        if (diff.blueRemoved()) {
            this.enemy = null;
        }
        if (!this.enemy && newState.players.blue) {
            this.enemy = new RemotePlayer(this.game);
        }
        if (this.enemy) {
            this.enemy.reconcile(newState.players.blue);
        }
        this.you.reconcile(newState.players.red);
    };
    GameState.prototype.processBlue = function (newState) {
        var diff = new ServerStateDiff(this.latestServerState, newState);
        if (diff.redRemoved()) {
            this.enemy = null;
        }
        if (!this.enemy && newState.players.red) {
            this.enemy = new RemotePlayer(this.game);
        }
        if (this.enemy) {
            this.enemy.reconcile(newState.players.red);
        }
        this.you.reconcile(newState.players.blue);
    };
    GameState.prototype.processServerUpdate = function (newState) {
        this.processState(newState);
        this.latestServerState = newState;
    };
    return GameState;
})();
var LobbyState = (function () {
    function LobbyState(game) {
        var _this = this;
        this.init = function (socket, yourName, data) {
            _this.socket = socket;
            _this.you = yourName;
            _this.state = new ValidatedServerState(data);
        };
        this.create = function () {
            console.log("Entering Lobby state");
            var colourToJoinAs = "red";
            if (_this.state.players.red != null) {
                colourToJoinAs = "blue";
            }
            _this.socket.emit("join game", { colour: colourToJoinAs });
            _this.socket.on("failed to join", function () {
                alert("Sad face");
            });
            _this.game.state.start("TheGame", true, false, _this.socket, colourToJoinAs, _this.state);
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
            _this.game.load.spritesheet("red", "assets/sprites/red.png", 32, 32);
            _this.game.load.tilemap("maze", "assets/tilemap/maze.json", null, Phaser.Tilemap.TILED_JSON);
            _this.game.load.image("mazetiles", "assets/tilemap/maze.png");
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
var ValidatedServerState = (function () {
    function ValidatedServerState(serverData) {
        this.players = {
            red: null,
            blue: null
        };
        if (serverData.players && ("red" in serverData.players) && ("blue" in serverData.players)) {
            this.players.red = serverData.players.red;
            this.players.blue = serverData.players.blue;
        }
    }
    return ValidatedServerState;
})();
var LocalPlayer = (function () {
    function LocalPlayer(game) {
        this.waitingUpdate = null;
        this.game = game;
        this.sprite = Sprites.red(game);
        this.sprite.play("right");
    }
    LocalPlayer.prototype.update = function () {
        if (this.waitingUpdate != null) {
            this.sprite.body.position.setTo(this.waitingUpdate.x, this.waitingUpdate.y);
            this.waitingUpdate = null;
        }
        if (this.game.input.mousePointer.isDown) {
            this.game.physics.arcade.moveToPointer(this.sprite, 100);
            if (Phaser.Rectangle.contains(this.sprite.body, this.game.input.x, this.game.input.y)) {
                this.sprite.body.velocity.setTo(0, 0);
            }
        }
        else {
            this.sprite.body.velocity.setTo(0, 0);
        }
    };
    LocalPlayer.prototype.reconcile = function (data) {
        this.waitingUpdate = data.position;
    };
    LocalPlayer.prototype.data = function () {
        return {
            position: {
                x: this.sprite.body.x,
                y: this.sprite.body.y
            }
        };
    };
    LocalPlayer.prototype.removeFromGame = function () {
        this.sprite.destroy();
    };
    return LocalPlayer;
})();
var RemotePlayer = (function () {
    function RemotePlayer(game) {
        this.waitingUpdate = null;
        this.sprite = game.add.sprite(100, 100, "player", 1);
        this.sprite.animations.add("left", [8, 9], 10, true);
        this.sprite.animations.add("right", [1, 2], 10, true);
        this.sprite.animations.add("up", [11, 12, 13], 10, true);
        this.sprite.animations.add("down", [4, 5, 6], 10, true);
        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.body.setSize(10, 14, 2, 1);
        this.sprite.play("left");
    }
    RemotePlayer.prototype.update = function () {
        if (this.waitingUpdate != null) {
            this.sprite.body.position.setTo(this.waitingUpdate.x, this.waitingUpdate.y);
            this.waitingUpdate = null;
        }
    };
    RemotePlayer.prototype.reconcile = function (data) {
        this.waitingUpdate = data.position;
    };
    RemotePlayer.prototype.removeFromGame = function () {
        this.sprite.destroy();
    };
    return RemotePlayer;
})();
var ServerStateDiff = (function () {
    function ServerStateDiff(oldState, newState) {
        this._old = oldState;
        this._new = newState;
    }
    ServerStateDiff.prototype.blueAdded = function () {
        return (this._old.players.blue == null) && (this._new.players.blue != null);
    };
    ServerStateDiff.prototype.redAdded = function () {
        return (this._old.players.red == null) && (this._new.players.red != null);
    };
    ServerStateDiff.prototype.blueRemoved = function () {
        return (this._old.players.blue != null) && (this._new.players.blue == null);
    };
    ServerStateDiff.prototype.redRemoved = function () {
        return (this._old.players.red != null) && (this._new.players.red == null);
    };
    return ServerStateDiff;
})();
var Sprites = (function () {
    function Sprites() {
    }
    Sprites.spaceman = function (game) {
        var sprite = game.add.sprite(100, 100, "player", 1);
        sprite.animations.add("left", [8, 9], 10, true);
        sprite.animations.add("right", [1, 2], 10, true);
        sprite.animations.add("up", [11, 12, 13], 10, true);
        sprite.animations.add("down", [4, 5, 6], 10, true);
        game.physics.enable(sprite, Phaser.Physics.ARCADE);
        sprite.body.setSize(10, 14, 2, 1);
        return sprite;
    };
    Sprites.red = function (game) {
        var sprite = game.add.sprite(-100, -100, "red", 1);
        sprite.animations.add("right", [0, 1, 2, 3], 10, true);
        game.physics.enable(sprite, Phaser.Physics.ARCADE);
        sprite.body.setSize(27, 30, 5, 2);
        return sprite;
    };
    return Sprites;
})();

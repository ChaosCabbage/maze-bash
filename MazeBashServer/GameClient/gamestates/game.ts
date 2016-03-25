class PlayerNameMap {
    [key: string]: PlayerData;
}

var toNameMap = (players: PlayerData[]): PlayerNameMap => {
    var map = new PlayerNameMap;

    players.forEach((p: PlayerData) => {
        map[p.name] = p;
    });

    return map;
}

class GameState {

    private game: Phaser.Game;
    private socket: Socket;
    private yourName: string;
    private latestServerState: ServerState;

    private playerEntities: any = {};

    constructor(game: Phaser.Game) {
        this.game = game;
    }

    init = (socket: Socket, yourName: string, data: ServerState) => {
        this.socket = socket;
        this.yourName = yourName;
        this.latestServerState = data;
    }

    private addPlayerToGame = (name: string) => {
        this.playerEntities[name] = new PlayerEntity(this.game);
    }

    private processServerUpdate = (newState: ServerState) => {
        var diff = new ServerStateDiff(this.latestServerState, newState);
        diff.removedPlayers.forEach((name: string) => {
            this.playerEntities[name].removeFromGame();
            delete this.playerEntities[name];
        });
        diff.addedPlayers.forEach((player: PlayerData) => {
            this.addPlayerToGame(player.name);
        });
        newState.players.forEach((player: PlayerData) => {
            var entity: PlayerEntity = this.playerEntities[player.name];
            entity
        });

        this.latestServerState = newState;
    }

    create = () => {
        console.log("Entering main game state");

        this.game.stage.backgroundColor = '#437698';
        
        var map = this.game.add.tilemap('cave');
        map.addTilesetImage('cave', 'cavetiles');
    
        var floor = map.createLayer('Tile Layer 1');
        var walls = map.createLayer('Walls');

        //  This resizes the game world to match the layer dimensions
        floor.resizeWorld();

        var x = Math.random() * 500;
        var y = Math.random() * 500;

        var you = new PlayerEntity(this.game);
        you.reconcile({
            pos: { x: x, y: y },
            name: this.yourName
        });
        this.playerEntities[this.yourName] = you;

        this.socket.on("game update", (data: ServerState) => {
            if (!data || !data.players) {
                return;
            }
            this.processServerUpdate(data);
        });
    }
    
    update = () => {
        for (var name in this.playerEntities) {
            this.playerEntities[name].update();
        }
    }
    
    render = () => {

    }
}

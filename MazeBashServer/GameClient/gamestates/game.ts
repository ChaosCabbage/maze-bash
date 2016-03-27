class GameState {

    private game: Phaser.Game;
    private socket: Socket;
    private yourName: string;
    private latestServerState: ServerState;
    
    private you: LocalPlayer;
    private enemy: RemotePlayer;

    constructor(game: Phaser.Game) {
        this.game = game;
    }

    init = (socket: Socket, yourColour: string, data: ServerState) => {
        this.socket = socket;
        this.latestServerState = data;
        this.you = null;
        this.enemy = null;

        if (yourColour === "red") {
            this.processState = this.processRed;
        } else if (yourColour === "blue") {
            this.processState = this.processBlue;
        } else {
            this.processState = () => {
                console.error("Wrong colour!");
            };
        }
    }

    private processState: (ServerState) => void;

    private processRed(newState: ServerState) {
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
    }

    private processBlue(newState: ServerState) {
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
    }

    private processServerUpdate(newState: ServerState) {
        this.processState(newState);
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

        this.you = new LocalPlayer(this.game);

        this.socket.on("game update", (data: ServerState) => {
            this.processServerUpdate(new ValidatedServerState(data));
        });
    }
    
    update = () => {
        this.you.update();
        if (this.enemy) {
            this.enemy.update();
        }
    }
    
    render = () => {

    }
}

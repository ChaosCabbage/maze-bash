class LobbyState {

    game: Phaser.Game;
    socket: Socket;
    you: string;
    state: ServerState;

    constructor(game: Phaser.Game) {
        this.game = game;
    }

    init = (socket: Socket, yourName: string, data: ServerState) => {
        this.socket = socket;
        this.you = yourName;
        this.state = new ValidatedServerState(data);
    }

    create = () => {        
        console.log("Entering Lobby state");

        var colourToJoinAs = "red";
        if (this.state.players.red != null) {
            colourToJoinAs = "blue";
        }

        this.socket.emit("join game", { colour: colourToJoinAs });

        this.socket.on("failed to join", function () {
            alert("Sad face");
        });

        this.game.state.start("TheGame", true, false, this.socket, colourToJoinAs, this.state);
    }

}

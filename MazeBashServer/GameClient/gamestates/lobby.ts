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
        this.state = data;
    }

    create = () => {        
        console.log("Entering Lobby state");

        this.socket.emit("join game", { job: "Gimp" });

        this.socket.on("failed to join", function () {
            alert("Sad face");
        });

        this.game.state.start("TheGame", true, false, this.socket, this.you, this.state);
    }

}

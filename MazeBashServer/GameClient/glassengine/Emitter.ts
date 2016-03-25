class Emitter {

    socket: Socket;
    player: Phaser.Sprite;

    constructor(socket: Socket, player: Phaser.Sprite) {
        this.socket = socket;
        this.player = player;
    }

    emit() {
        this.socket.emit("try update",
            <Point>{
                x: this.player.body.position.x,
                y: this.player.body.position.y
            });
    }
}
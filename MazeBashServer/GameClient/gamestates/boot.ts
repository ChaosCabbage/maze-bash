class BootState {

    game: Phaser.Game;

    constructor(game: Phaser.Game) {
        console.log("%cStarting my awesome game", "color:white; background:red");
        this.game = game;
    }

    preload = () => {
        this.game.load.image("loading", "assets/images/loading.png");
    }

    create = () => {
        this.game.state.start("Preload");
    }
}

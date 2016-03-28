class PreloadState {

    game: Phaser.Game;

    constructor(game: Phaser.Game) {
        this.game = game;
    }
    
    preload = () => {

        var loadingBar = this.game.add.sprite(160, 240, "loading");
        loadingBar.anchor.setTo(0.5, 0.5);
        this.game.load.setPreloadSprite(loadingBar);

        this.game.load.spritesheet("player", "assets/sprites/spaceman.png", 16, 16);
        this.game.load.spritesheet("red", "assets/sprites/red.png", 32, 32);
        this.game.load.tilemap("cave", "assets/tilemap/caveMap.json", null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image("cavetiles", "assets/tilemap/cave.png");
    }

    create = () => {

        var address = Debug.SERVER_ADDRESS || "";
        var socket = io(address);
        this.game.state.start("NameInput", true, false, socket);
    }
    
}

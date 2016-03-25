class SimpleGame {

    constructor() {
        var game = new Phaser.Game(800, 600, Phaser.AUTO, 'content');

        game.state.add("Boot", BootState);
        game.state.add("Preload", PreloadState);
        game.state.add("NameInput", NameInputState);
        game.state.add("Lobby", LobbyState);
        game.state.add("TheGame", GameState);

        game.state.start("Boot");
    }

}

window.onload = () => {
    var game = new SimpleGame();
};

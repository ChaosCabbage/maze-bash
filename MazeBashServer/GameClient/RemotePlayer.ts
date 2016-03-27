class RemotePlayer {

    private sprite: Phaser.Sprite;
    private waitingUpdate: Point = null;

    constructor(game: Phaser.Game) {
        this.sprite = game.add.sprite(100, 100, "player", 1);
        this.sprite.animations.add("left", [8, 9], 10, true);
        this.sprite.animations.add("right", [1, 2], 10, true);
        this.sprite.animations.add("up", [11, 12, 13], 10, true);
        this.sprite.animations.add("down", [4, 5, 6], 10, true);

        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);

        this.sprite.body.setSize(10, 14, 2, 1);

        this.sprite.play("left");
    }

    update() {
        if (this.waitingUpdate != null) {
            this.sprite.body.position.setTo(this.waitingUpdate.x, this.waitingUpdate.y);
            this.waitingUpdate = null;
        }
    }

    reconcile(data: PlayerData) {
        this.waitingUpdate = data.position;
    }

    removeFromGame() {
        this.sprite.destroy();
    }
}

class Sprites {

    static spaceman(game: Phaser.Game) : Phaser.Sprite {
        var sprite = game.add.sprite(100, 100, "player", 1);
        sprite.animations.add("left", [8, 9], 10, true);
        sprite.animations.add("right", [1, 2], 10, true);
        sprite.animations.add("up", [11, 12, 13], 10, true);
        sprite.animations.add("down", [4, 5, 6], 10, true);
        game.physics.enable(sprite, Phaser.Physics.ARCADE);
        sprite.body.setSize(10, 14, 2, 1);

        return sprite;
    }

    static red(game: Phaser.Game): Phaser.Sprite {
        var sprite = game.add.sprite(-100, -100, "red", 1);
        sprite.animations.add("right", [0, 1, 2, 3], 10, true);
        game.physics.enable(sprite, Phaser.Physics.ARCADE);
        sprite.body.setSize(27, 30, 5, 2);
        return sprite;
    }

}

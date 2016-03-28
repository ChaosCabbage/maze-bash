﻿class LocalPlayer {

    private sprite: Phaser.Sprite;
    private waitingUpdate: Point = null;

    private game: Phaser.Game;

    constructor(game: Phaser.Game) {
        this.game = game;
        this.sprite = Sprites.red(game);
        this.sprite.play("right");
    } 

    update() {
        if (this.waitingUpdate != null) {
            this.sprite.body.position.setTo(this.waitingUpdate.x, this.waitingUpdate.y);
            this.waitingUpdate = null;
        }


        //  only move when you click
        if (this.game.input.mousePointer.isDown) {
            //  400 is the speed it will move towards the mouse
            this.game.physics.arcade.moveToPointer(this.sprite, 100);

            //  if it's overlapping the mouse, don't move any more
            if (Phaser.Rectangle.contains(this.sprite.body, this.game.input.x, this.game.input.y)) {
                this.sprite.body.velocity.setTo(0, 0);
            }
        } else {
            this.sprite.body.velocity.setTo(0, 0);
        }
    }

    reconcile(data: PlayerData) {
        this.waitingUpdate = data.position;
    }

    data(): PlayerData {
        return {
            position: {
                x: this.sprite.body.x,
                y: this.sprite.body.y
            }
        };
    }

    removeFromGame() {
        this.sprite.destroy();   
    }
}


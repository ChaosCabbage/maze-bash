class NameInputState {

    game: Phaser.Game;

    socket: Socket;
    join: Function;

    input: HTMLInputElement;
    textEntity: Phaser.Text;

    cursor: Phaser.Sprite;


    constructor(game: Phaser.Game) {
        this.game = game;
    }

    preload = () => {
                
    }

    init = (socket: Socket) => {
        this.socket = socket;
        this.input = <HTMLInputElement> document.getElementById("hiddennameinput");
    }

    display(stringData): Phaser.Text {
        var text = this.game.add.text(
            this.game.world.centerX + stringData.pos.x,
            this.game.world.centerY + + stringData.pos.y,
            stringData.text,
            stringData.style);
        text.anchor.set(0.5, 0.5);

        return text;
    }

    strings = {
        error: {
            pos: { x: 0, y: 0 },
            text: "Sorry, there is a problem with the page.\nPlease contact the author with your cricket bat, by swinging it at his head.",
            style: { font: "65px Arial", fill: "#ff0000", align: "center" }
        },
        enter: {
            pos: { x: 0, y: -100 },
            text: "Enter a name:",
            style: { font: "50px Arial", fill: "#0faedb", align: "center" }
        },
        name: {
            pos: { x: 0, y: 0 },
            text: "",
            style: { font: "65px Arial", fill: "#339944", align: "center" }
        },
        taken: {
            pos: { x: 0, y: 50 },
            text: "That name's been taken by some bugger.",
            style: { font: "38px Arial", fill: "#ff0000", align: "center" }
        }
    };

    currentName() {
        return this.input.value;
    }
    
    nameIsValid(): boolean {
        return this.currentName() != "";
    }

    focusInput() : void {
        this.input.focus();
    }
    
    create = () => {

        // Check that the HTML contains the right thingy.
        if (this.input == null) {
            this.display(this.strings.error);
            this.update = () => { };
            return;
        }
        
        this.display(this.strings.enter);
        this.textEntity = this.display(this.strings.name);

        // Socket calls
        this.join = () => {
            if (this.nameIsValid()) {
                this.socket.emit("join room", { name: this.currentName() });
            }
        };
        
        // Socket callbacks
        this.socket.on("joined room", (data) => {
            this.game.state.start("Lobby", true, false, this.socket, this.currentName(), data);
        });

        this.socket.on("name taken",() => {
            this.display(this.strings.taken);
            this.input.value = "";
        });      

        // Set the enter key to submit the name
        this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.ENTER);
        var enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        enterKey.onUp.add(this.join);

        //  Add an animated cursor which will sit at the end of the text
        this.cursor = (() => {
            var player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'player', 1);
            player.anchor.set(0, 0.5);
            player.animations.add('right', [1, 2], 10, true);
            player.play("right");
            return player;
        })();
    }

    update = () => {
        this.textEntity.setText(this.currentName());
        this.cursor.x = this.textEntity.x + (this.textEntity.width / 2) + 10;
        
        this.focusInput();
    }
}

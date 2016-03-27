interface ServerState {
    players: {
        red: PlayerData,
        blue: PlayerData
    }
}

class ValidatedServerState implements ServerState {

    players = {
        red: null,
        blue: null
    }

    constructor(serverData: any) {
        if (serverData.players && ("red" in serverData.players) && ("blue" in serverData.players)) {
            this.players.red = <PlayerData>serverData.players.red;
            this.players.blue = <PlayerData>serverData.players.blue;
        }
    }
    
}


class ServerStateDiff {

    addedPlayers: PlayerData[];
    removedPlayers: string[];

    private nameList = (state: ServerState) => {
        return state.players.map((p: PlayerData) => {
            return p.name;
        });
    }

    constructor(oldState: ServerState, newState: ServerState) {
        var oldNames = this.nameList(oldState);
        var newNames = this.nameList(newState);

        this.addedPlayers = newState.players.filter((p: PlayerData) => {
            return oldNames.indexOf(p.name) == -1;
        });
        this.removedPlayers = oldNames.filter((name: string) => {
            return newNames.indexOf(name) == -1;
        });
    }
}
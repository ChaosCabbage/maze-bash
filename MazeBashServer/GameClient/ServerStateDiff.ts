class ServerStateDiff {

    private _old: ServerState;
    private _new: ServerState;

    constructor(oldState: ServerState, newState: ServerState) {
        this._old = oldState;
        this._new = newState;
    }

    blueAdded() {
        return (this._old.players.blue == null) && (this._new.players.blue != null);
    }

    redAdded() {
        return (this._old.players.red == null) && (this._new.players.red != null);
    }

    blueRemoved() {
        return (this._old.players.blue != null) && (this._new.players.blue == null);
    }

    redRemoved() {
        return (this._old.players.red != null) && (this._new.players.red == null);
    }

    
}

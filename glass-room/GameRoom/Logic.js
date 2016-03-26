var FakeRoomLogic = function () {
    
    var _currentState = function () { };
    var _update = function () { };

    var _isAllowedToJoin = function (data) {
        return false;
    };

    var _addPlayerToGame = function (id, name, data) {
        return Player();
    };

    var _removePlayerById = function (id) {
    };
    
    var _receivePlayerInput = function (id, data) {
    };
	
	return {
        update: _update
		, currentState: _currentState
		, isAllowedToJoin: _isAllowedToJoin
		, addPlayerToGame: _addPlayerToGame
        , removePlayerById: _removePlayerById
        , receivePlayerInput: _receivePlayerInput
	};
};

module.exports = FakeRoomLogic;
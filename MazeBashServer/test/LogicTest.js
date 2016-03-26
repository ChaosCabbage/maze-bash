var expect = require('expect.js');
var Logic = require("../GameLogic");

//  update: _update
//, currentState: _currentState
//, isAllowedToJoin: _isAllowedToJoin
//, addPlayerToGame: _addPlayerToGame
//, removePlayerById: _removePlayerById
//, receivePlayerInput: _receivePlayerInput

describe('Game Logic', function() {
    
    describe('Adding players', function () {
        
        var logic = Logic();

        it('Should allow me to add a red and a blue person', function () {
            expect(logic.isAllowedToJoin({ colour: "red" }));
            expect(logic.isAllowedToJoin({ colour: "blue" }));

            logic.addPlayerToGame("1", "bob", { colour: "red" });
            expect(logic.isAllowedToJoin({ colour: "red" })).to.be(false);

            logic.addPlayerToGame("2", "trev", { colour: "blue" });
            expect(logic.isAllowedToJoin({ colour: "blue" })).to.be(false);
        });
        
        it('Should not allow me to add any other colours', function () {
            expect(logic.isAllowedToJoin({ colour: "purple" })).to.be(false);
            expect(logic.isAllowedToJoin({ colour: "the pope" })).to.be(false);
        });
    });

    describe('Current state', function () {
        
        var logic = Logic();
        logic.addPlayerToGame("1", "bob", { colour: "red" });
        logic.addPlayerToGame("2", "trev", { colour: "blue" });

        it('Should describe the position of the players', function () {
            var state = logic.currentState();

            var expected = {
                players: {
                    red: {
                        position: {
                            x: 0,
                            y: 0
                        }
                    },
                    blue: {
                        position: {
                            x: 0,
                            y: 0
                        }
                    }
                }
            };

            expect(state).to.eql(expected);
        });
    });
});

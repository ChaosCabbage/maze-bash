"use strict";

var test_map = {
    "height": 4,
    "width": 3,
    "tileheight": 10,
    "tilewidth": 10,
    
    "layers": [
        {
            "data": [
                0, 0, 0,
                4, 7, 1,
                0, 2, 1,
                0, 3, 1
            ]
        }, 
        {
            "data": [
                9, 9, 4,
                9, 4, 4,
                4, 4, 8,
                4, 4, 8
            ]
        }
    ],
    "tilesets": [{
        "tileproperties": {
            "0": { "collidable": "true" },
            "1": { "collidable": "true" },
            "7": { "collidable": "false" },
            "9": { "collidable": "true" },
        }
    }]
};


var expect = require("expect");
var make_map = require("../app");

describe('collision-map', function () {
    describe('#is_point_colliding()', function () {
        
        var map = make_map(test_map);

        it('should never collide before I set the collision property', function () {
            expect(map.is_point_colliding({ left: 5, top: 5 }) == false);
        });

        map.set_collision_tile_property("collidable");

        it('should only collide with a collidable tile', function () {
            expect(map.is_point_colliding({ left: 5, top: 5 })   == true);
            expect(map.is_point_colliding({ left: 15, top: 15 }) == false);
            expect(map.is_point_colliding({ left: 5, top: 25 })  == true);
            expect(map.is_point_colliding({ left: 5, top: 5 })   == true);
            expect(map.is_point_colliding({ left: 15, top: 35 }) == false);
        });

    });
});

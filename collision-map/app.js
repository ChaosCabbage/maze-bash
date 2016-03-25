// Provide collision information from a Tiled map in JSON format.
// Suitable for use on a server.
//
// API:
//       var make_collision_map = require("collision-map");
//       var map = make_collision_map(tiled_json_object);
//
//       // Collide with all tiles marked with the "collidable" property.
//       map.set_collision_tile_property("collidable");
//
//       var point_ok = map.is_point_colliding({
//           left: 12,
//           top: 32
//       });
//
//       var rect_ok = map.is_rectangle_colliding({
//           left: 12,
//           top: 32,
//           right: 23,
//           bottom: 46
//       });
//
"use strict";

function newTileCollideLookup(tileset, collision_property) {

    return function is_tile_collidable(tile_id) {
        var tile_props = tileset.tileproperties[tile_id];
        if (!tile_props) {
            return false;
        }
        var collision_prop = tile_props[collision_property];
        return (collision_prop == "true");
    };

}

function newCollisionMap(tilemap) {

    var _tile_collides;

    var _set_collision_property = function(name) {
        _tile_collides = newTileCollideLookup(tilemap.tilesets[0], name);
    };

    var _outside_map_entirely = function (tilespace_rectangle) {
        if (tilespace_rectangle.right < 0) { return true; }
        if (tilespace_rectangle.bottom < 0) { return true; }
        if (tilespace_rectangle.top >= tilemap.height) { return true; }
        if (tilespace_rectangle.left >= tilemap.width) { return true; }
        return false;
    };

    var _is_layer_colliding = function (clamped_integer_rectangle, layer) {
        for (var x = clamped_integer_rectangle.left; x <= clamped_integer_rectangle.right; ++x) {
            for (var y = clamped_integer_rectangle.top; y <= clamped_integer_rectangle.bottom; ++y) {
                
                var i = y * tilemap.width + x;
                var tile_id = layer.data[i];
                if (_tile_collides(tile_id)) {
                    return true;
                }
            }
        }
        return false;
    };
    
    var _is_map_colliding = function (world_rectangle) {
        var tile_rect = _tilespace_rectangle(world_rectangle);
        if (_outside_map_entirely(tile_rect)) {
            return false;
        }
        var clamped_rect = _clamped_int_rectangle(_integer_rectangle(tile_rect));
        tilemap.layers.some(function (layer) {
            return _is_layer_colliding(clamped_rect, layer);
        });
    }

    var _is_point_colliding = function (point) {
        return _is_map_colliding({
            left: point.left,
            top: point.top,
            right: point.left,
            bottom: point.top
        });
    }

    var _clamped_int_rectangle = function (tile_rectangle) {
        return {
            left: Math.max(tile_rectangle.left, 0),
            right: Math.min(tile_rectangle.right, tilemap.width),
            top: Math.max(tile_rectangle.top, 0),
            bottom: Math.min(tile_rectangle.bottom, tilemap.height)
        };
    }

    var _integer_rectangle = function (tile_rectangle) {
        return {
            left: Math.floor(tile_rectangle.left),
            right: Math.ceil(tile_rectangle.right),
            top: Math.floor(tile_rectangle.top),
            bottom: Math.floor(tile_rectangle.bottom)
        };
    }

    var _tilespace_rectangle = function (worldspace_rectangle) {
        return {
            left: worldspace_rectangle.left / tilemap.tilewidth,
            top: worldspace_rectangle.top / tilemap.tileheight,
            right: worldspace_rectangle.right / tilemap.tilewidth,
            bottom: worldspace_rectangle.bottom / tilemap.tileheight
        };
    };

    // Default
    _tile_collides = function () { };

    return {
        set_collision_tile_property : _set_collision_property,
        is_point_colliding : _is_point_colliding,
        is_rectangle_colliding : _is_map_colliding
    };
}

module.exports = newCollisionMap;



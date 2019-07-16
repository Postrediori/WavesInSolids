'use strict';

function CartesianToRadial(coord, origin) {
    var dX = coord.x - origin.x;
    var dY = coord.y - origin.y;
    
    var theta = Math.atan2(dY, dX);
    var r = Math.sqrt(dX * dX + dY * dY);
    
    return {theta: theta, r: r};
}

function DistanceBetweenPoints(p1, p2) {
    var dX = p1.x - p2.x;
    var dY = p1.y - p2.y;
    return Math.sqrt(dX * dX + dY * dY);
}

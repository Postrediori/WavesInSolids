'use strict';

var COORD_SIZE = 2,
    X_INDEX = 0,
    Y_INDEX = 1,
    R_INDEX = 0,
    THETA_INDEX = 1;

function addCoords(coordOut, coordA, coordB) {
    var dx = coordA[X_INDEX] + coordB[X_INDEX],
        dy = coordA[Y_INDEX] + coordB[Y_INDEX];

    coordOut[X_INDEX] = dx;
    coordOut[Y_INDEX] = dy;

    return coordOut;
}

function subCoords(coordOut, coordA, coordB) {
    var dx = coordA[X_INDEX] - coordB[X_INDEX],
        dy = coordA[Y_INDEX] - coordB[Y_INDEX];

    coordOut[X_INDEX] = dx;
    coordOut[Y_INDEX] = dy;

    return coordOut;
}

function lengthVector(vector) {
    var dx = vector[X_INDEX],
        dy = vector[Y_INDEX];
    return Math.sqrt(dx * dx + dy * dy);
}

function distanceCoords(coordOut, coordA, coordB) {
    subCoords(coordOut, coordA, coordB);
    return lengthVector(coordOut);
}

function convertCartesianToRadial(radialCoord, cartesianCoord, origin) {
    subCoords(radialCoord, cartesianCoord, origin);
    
    var theta = Math.atan2(radialCoord[Y_INDEX], radialCoord[X_INDEX]);
    var r = lengthVector(radialCoord);
    
    radialCoord[R_INDEX] = r;
    radialCoord[THETA_INDEX] = theta;

    return radialCoord;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.colorUpdate = exports.getRandomArbitrary = exports.Dist = exports.map_range = exports.ForceField = void 0;
function ForceField(position1, position2, radius) {
    let vectorLaenge = Dist(position1, position2);
    let richtungsVector = {
        x: position1.x - position2.x,
        y: position1.y - position2.y
    };
    vectorLaenge = map_range(vectorLaenge, 0, radius, 1, 0.001);
    // vectorLaenge *= 1000;
    // vectorLaenge = Math.floor(vectorLaenge);
    // vectorLaenge /= 1000;
    richtungsVector.x *= vectorLaenge;
    richtungsVector.y *= vectorLaenge;
    return richtungsVector;
}
exports.ForceField = ForceField;
function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
exports.map_range = map_range;
function Dist(position1, position2) {
    return Math.sqrt(Math.pow(position2.x - position1.x, 2) + Math.pow(position2.y - position1.y, 2));
}
exports.Dist = Dist;
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
exports.getRandomArbitrary = getRandomArbitrary;
function colorUpdate(color, stepSize) {
    if (color > 360) {
        color = 0;
    }
    return color + stepSize;
}
exports.colorUpdate = colorUpdate;

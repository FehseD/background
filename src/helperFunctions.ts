import { vec2 } from "./types";

export function ForceField(position1: vec2, position2: vec2, radius: number): vec2 {
    let vectorLaenge: number = Dist(position1, position2);
    let richtungsVector: vec2 = {
        x: position1.x - position2.x,
        y: position1.y - position2.y
    }

    vectorLaenge = map_range(vectorLaenge, 0, radius, 1, 0.001);
    // vectorLaenge *= 1000;
    // vectorLaenge = Math.floor(vectorLaenge);
    // vectorLaenge /= 1000;

    richtungsVector.x *= vectorLaenge;
    richtungsVector.y *= vectorLaenge;

    return richtungsVector
}

export function map_range(value: number, low1: number, high1: number, low2: number, high2: number) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

export function Dist(position1: vec2, position2: vec2): number {
    return Math.sqrt(Math.pow(position2.x - position1.x, 2) + Math.pow(position2.y - position1.y, 2));
}

export function getRandomArbitrary(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export function colorUpdate(color: number, stepSize: number): number {
    if (color > 360) {
        color = 0;
    }
    return color + stepSize;
}
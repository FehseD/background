// import type { Ball, vec2, Mouse } from './types';

let deltaTime: number = Date.now();

//#region helper Functions
function multiplayArrays(a: vec2, b: vec2): vec2 {
    return {x: a.x * b.x, y: a.y * b.y} as vec2;
}

function ForceField(position1: vec2, position2: vec2, radius: number): vec2 {
    let vectorLaenge: number = Dist(position1, position2);
    let richtungsVector: vec2 = {
        x: position1.x - position2.x,
        y: position1.y - position2.y
    }

    vectorLaenge = map_range(vectorLaenge, 0, radius, 1, 0.001);

    richtungsVector.x *= vectorLaenge;
    richtungsVector.y *= vectorLaenge;

    return richtungsVector
}

function map_range(value: number, low1: number, high1: number, low2: number, high2: number): number {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function Dist(position1: vec2, position2: vec2): number {
    return Math.sqrt(Math.pow(position2.x - position1.x, 2) + Math.pow(position2.y - position1.y, 2));
}

function getRandomArbitrary(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function colorUpdate(color: number, stepSize: number): number {
    if (color > 360) {
        color = 0;
    }
    return color + stepSize;
}

//#endregion

onmessage = function (e) {

    let maxRadius: number = e.data[0];
    let mouse: Mouse = e.data[1];
    let windowInnerWidth: number = e.data[2];
    let windowInnerHeight: number = e.data[3];
    let ballArray: Ball[] = e.data[4];

    let frameTime: number = Date.now() - deltaTime;

    deltaTime = Date.now();

    //#region Grid Aufbau

    let gridSize = {x: Math.ceil(windowInnerWidth / maxRadius), y: Math.ceil(windowInnerHeight / maxRadius)}; //Neuer Key

    let grid: Array<Array<Ball[]>> = [];

    for (let x = 0; x < gridSize.x; x++) {
        let neuesArrayX: Array<Ball[]> = [];

        for (let y = 0; y < gridSize.y; y++) {
            let neuesArrayY: Ball[] = [];
            neuesArrayX.push(neuesArrayY);
        }

        grid.push(neuesArrayX);
    }

    //#endregion

    //#region Zuordnen im Grid

    for (const ball of ballArray) {
        let gridKey = {x: Math.ceil(ball.position.x / maxRadius), y: Math.ceil(ball.position.y / maxRadius)}; //Neuer Key
        ball.gridPlace = gridKey;

        if (gridKey.x > grid.length - 1) {
            gridKey.x = grid.length - 1;
        }
        if (gridKey.y > grid[0].length - 1) {
            gridKey.y = grid[0].length - 1;
        }

        if (gridKey.x < 0) {
            gridKey.x = 0;
        }
        if (gridKey.y < 0) {
            gridKey.y = 0;
        }

        grid[gridKey.x][gridKey.y].push(ball);
    }

    //#endregion

    for (const ball of ballArray) {

        //#region Collision Update

        let ballsToScan: Ball[] = [];
        let start = {x: ball.gridPlace.x - 1, y: ball.gridPlace.y - 1}

        for (let x = start.x; x < start.x + 3; x++) { //sammelt alle kacheln die getestet werden müssen.

            if (x < 0 || x > grid.length - 1) {
                break
            }

            for (let y = start.y; y < start.y + 3; y++) {

                if (y < 0 || y > grid[0].length - 1) {
                    break
                }

                let foundGridTiel = grid[x][y];

                if (foundGridTiel.length) {

                    foundGridTiel.forEach(ballInGrid => {
                        if (ballInGrid.index != ball.index && !ballsToScan.includes(ballInGrid)) {
                            ballsToScan.push(ballInGrid);
                        }
                    })
                }
            }
        }

        //#region MousColl

        let dist = Dist(mouse.position, ball.position);

        if (dist < ball.radius + mouse.radius) {

            let collForce = ForceField(ball.position, mouse.position, mouse.radius + ball.radius);

            var collLaenge = Math.sqrt(Math.pow(collForce.x, 2) + Math.pow(collForce.y, 2));
            ball.position.x += (collForce.x / collLaenge) * Math.abs(ball.radius + mouse.radius - dist);
            ball.position.y += (collForce.y / collLaenge) * Math.abs(ball.radius + mouse.radius - dist);

            ball.TEST_color = colorUpdate(ball.TEST_color, frameTime / 10);

        }

        //#endregion

        // #region Collisions mit balls

        ball.near = ballsToScan;

        if (ballsToScan.length) {

            // console.log("Near");

            ballsToScan.forEach(collBall => {

                let dist = Dist(collBall.position, ball.position);

                if (dist < ball.radius + collBall.radius) {

                    let collisionForce: vec2 = ForceField(ball.position, collBall.position, collBall.radius + ball.radius);

                    ball.position.x += collisionForce.x * frameTime / 10;
                    ball.position.y += collisionForce.y * frameTime / 10;

                    ball.TEST_color = colorUpdate(ball.TEST_color, frameTime / 10);
                }
            })
        }

        //#endregion

        //#region Phys Update / Collisions mit Border

        ball.rotationVector.x = ball.rotationVector.x > 2 ? getRandomArbitrary(-2, 0) : ball.rotationVector.x + .001;
        ball.rotationVector.y = ball.rotationVector.y > 2 ? getRandomArbitrary(-2, 0) : ball.rotationVector.y + .001;

        ball.position.x += multiplayArrays(ball.velocity, ball.rotationVector).x * ((frameTime > 50 ? 50 : frameTime) / 10); //TODO simplify
        ball.position.y += multiplayArrays(ball.velocity, ball.rotationVector).y * ((frameTime > 50 ? 50 : frameTime) / 10);

        if (ball.position.x + ball.radius > windowInnerWidth) { //Border Rechts
            ball.velocity.x *= -1;
            ball.position.x = windowInnerWidth - ball.radius;

            ball.TEST_color = colorUpdate(ball.TEST_color, frameTime / 10);
        } else if (ball.position.x - ball.radius < 0) { //Border Links
            ball.velocity.x *= -1;
            ball.position.x = ball.radius;

            ball.TEST_color = colorUpdate(ball.TEST_color, frameTime / 10);
        }

        if (ball.position.y + ball.radius > windowInnerHeight) { //Border Oben
            ball.velocity.y *= -1;
            ball.position.y = windowInnerHeight - ball.radius;

            ball.TEST_color = colorUpdate(ball.TEST_color, frameTime / 10);
        } else if (ball.position.y - ball.radius < 0) { //Border Unten
            ball.velocity.y *= -1;
            ball.position.y = ball.radius;

            ball.TEST_color = colorUpdate(ball.TEST_color, frameTime / 10);
        }
    }

    //#endregion

    postMessage(ballArray);
}
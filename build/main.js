"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helperFunctions_1 = require("./helperFunctions");
var canvas = document.getElementById("canvas");
var msAnzeige = document.getElementById("ms_Anzeige");
const context = canvas.getContext('2d');
const maxRadius = 20;
const minRadius = 5;
const ballCount = 1000;
var deltaTime = Date.now();
var splitSize = 50;
var ballArray = [];
var mous = {
    position: {
        x: -1000,
        y: -1000
    },
    radius: 100
};
window.onmouseout = () => {
    mous.position.x = -mous.radius * 4;
    mous.position.y = -mous.radius * 4;
};
window.onmousemove = e => {
    mous.position.x = e.clientX;
    mous.position.y = e.clientY;
};
window.onresize = e => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let gridWidth = Math.ceil(window.innerWidth / maxRadius);
    gridWidth /= splitSize;
    gridWidth = Math.round(gridWidth);
};
window.onload = e => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let gridWidth = Math.ceil(window.innerWidth / maxRadius);
    gridWidth /= splitSize;
    gridWidth = Math.round(gridWidth);
    Start();
};
while (ballArray.length < ballCount) {
    let ballRadius = Math.round((0, helperFunctions_1.getRandomArbitrary)(minRadius, maxRadius / 2)); //max Radius / 2 damit die striche voher connecten
    ballArray.push({
        position: {
            x: (0, helperFunctions_1.getRandomArbitrary)(((window.innerWidth / 100) * 5), window.innerWidth - (window.innerWidth / 100) * 5),
            y: (0, helperFunctions_1.getRandomArbitrary)(((window.innerHeight / 100) * 5), window.innerHeight - (window.innerHeight / 100) * 5)
        },
        velocity: {
            x: (Math.random() - .5),
            y: (Math.random() - .5)
        },
        radius: ballRadius,
        index: ballArray.length,
        color: "red",
        gridPlace: {
            x: 0,
            y: 0
        },
        near: [],
        TEST_color: Math.round(Math.random() * 360),
    });
}
function PhysUpdate() {
    let frameTime = Date.now() - deltaTime;
    deltaTime = Date.now();
    //#region Grid Aufbau
    let gridSize = { x: Math.ceil(window.innerWidth / maxRadius), y: Math.ceil(window.innerHeight / maxRadius) }; //Neuer Key
    var grid = [];
    for (let x = 0; x < gridSize.x; x++) {
        let neuesArrayX = [];
        for (let y = 0; y < gridSize.y; y++) {
            let neuesArrayY = [];
            neuesArrayX.push(neuesArrayY);
        }
        grid.push(neuesArrayX);
    }
    //#endregion
    ballArray.forEach(ball => {
        let gridKey = { x: Math.ceil(ball.position.x / maxRadius), y: Math.ceil(ball.position.y / maxRadius) }; //Neuer Key
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
    });
    ballArray.forEach(ball => {
        //#region Collision Update
        let ballsToScan = [];
        let start = { x: ball.gridPlace.x - 1, y: ball.gridPlace.y - 1 };
        for (let x = start.x; x < start.x + 3; x++) { //sammelt alle kacheln die getestet werden müssen.
            if (x < 0 || x > grid.length - 1) {
                break;
            }
            for (let y = start.y; y < start.y + 3; y++) {
                if (y < 0 || y > grid[0].length - 1) {
                    break;
                }
                let foundGridTiel = grid[x][y];
                if (foundGridTiel.length) {
                    foundGridTiel.forEach(ballInGrid => {
                        if (ballInGrid.index != ball.index && !ballsToScan.includes(ballInGrid)) {
                            ballsToScan.push(ballInGrid);
                        }
                    });
                }
            }
        }
        //#region MousColl
        let dist = (0, helperFunctions_1.Dist)(mous.position, ball.position);
        if (dist < ball.radius + mous.radius) {
            let collForce = (0, helperFunctions_1.ForceField)(ball.position, mous.position, mous.radius + ball.radius);
            var collLaenge = Math.sqrt(Math.pow(collForce.x, 2) + Math.pow(collForce.y, 2));
            ball.position.x += (collForce.x / collLaenge) * Math.abs(ball.radius + mous.radius - dist);
            ball.position.y += (collForce.y / collLaenge) * Math.abs(ball.radius + mous.radius - dist);
            ball.TEST_color = (0, helperFunctions_1.colorUpdate)(ball.TEST_color, frameTime / 10);
        }
        //#endregion
        //#region Collisions oder so
        ball.near = ballsToScan;
        if (ballsToScan.length) {
            // console.log("Near");
            ballsToScan.forEach(collBall => {
                let dist = (0, helperFunctions_1.Dist)(collBall.position, ball.position);
                if (dist < ball.radius + collBall.radius) {
                    let collForce = (0, helperFunctions_1.ForceField)(ball.position, collBall.position, collBall.radius + ball.radius);
                    ball.position.x += collForce.x * frameTime / 10;
                    ball.position.y += collForce.y * frameTime / 10;
                    ball.TEST_color = (0, helperFunctions_1.colorUpdate)(ball.TEST_color, frameTime / 10);
                }
            });
        }
        //#endregion
        //#region Phys Update / Collisions mit Border
        ball.position.x += ball.velocity.x * ((frameTime > 50 ? 50 : frameTime) / 10);
        ball.position.y += ball.velocity.y * ((frameTime > 50 ? 50 : frameTime) / 10);
        if (ball.position.x + ball.radius > window.innerWidth) { //Border Rechts
            ball.velocity.x *= -1;
            ball.position.x = window.innerWidth - ball.radius;
            ball.TEST_color = (0, helperFunctions_1.colorUpdate)(ball.TEST_color, frameTime / 10);
        }
        else if (ball.position.x - ball.radius < 0) { //Border Links
            ball.velocity.x *= -1;
            ball.position.x = ball.radius;
            ball.TEST_color = (0, helperFunctions_1.colorUpdate)(ball.TEST_color, frameTime / 10);
        }
        if (ball.position.y + ball.radius > window.innerHeight) { //Border Oben
            ball.velocity.y *= -1;
            ball.position.y = window.innerHeight - ball.radius;
            ball.TEST_color = (0, helperFunctions_1.colorUpdate)(ball.TEST_color, frameTime / 10);
        }
        else if (ball.position.y - ball.radius < 0) { //Border Unten
            ball.velocity.y *= -1;
            ball.position.y = ball.radius;
            ball.TEST_color = (0, helperFunctions_1.colorUpdate)(ball.TEST_color, frameTime / 10);
        }
    });
    //#endregion
}
var frames = 0;
var totalUpdateTime = Date.now();
function Start() {
    frames++;
    for (let index = 0; index < 5; index++) {
        PhysUpdate();
    }
    if (frames < 2) { //Bild wird nur alle 2 Updates gedrawed
        setTimeout(() => {
            Start();
        }, 0.1);
        return;
    }
    frames = 0;
    msAnzeige.innerText = Date.now() - totalUpdateTime;
    totalUpdateTime = Date.now();
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ballArray.forEach(ball => {
        //#region Draw
        context.beginPath();
        context.moveTo(ball.position.x, ball.position.y);
        context.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
        context.fillStyle = 'hsl(' + ball.TEST_color + ', 100%, 50%)';
        context.fill();
        if (ball.near.length != 0) {
            ball.near.forEach(nearBall => {
                context.beginPath();
                context.moveTo(ball.position.x, ball.position.y);
                context.lineTo(nearBall.position.x, nearBall.position.y);
                // context.strokeStyle = "hsla(" + ball.TEST_color + ", 100%, 50%, " + map_range(Dist(ball.position, nearBall.position), 0, maxRadius * 1.5, 1, 0) + ")";
                context.strokeStyle = "hsla( 0, 0%, 0%, " + (0, helperFunctions_1.map_range)((0, helperFunctions_1.Dist)(ball.position, nearBall.position), 0, maxRadius * 1.5, 1, 0) + ")";
                context.stroke();
            });
        }
        //#endregion
        //#regionDebug
        // context.beginPath();
        // context.moveTo(ball.position.x, ball.position.y);
        // context.lineTo((ball.velocity.x * 100) + ball.position.x, (ball.velocity.y * 100) + ball.position.y);
        // context.strokeStyle = "white";
        // context.stroke();
        // context.beginPath();
        // context.rect(ball.gridPlace.x * maxRadius - (maxRadius / 2), ball.gridPlace.y * maxRadius - (maxRadius / 2), maxRadius, maxRadius);
        // context.strokeStyle = 'white';
        // context.stroke();
        //
        // context.beginPath();
        // context.rect(ball.gridPlace.x * maxRadius - ((maxRadius * 3) / 2), ball.gridPlace.y * maxRadius - ((maxRadius * 3) / 2), maxRadius * 3, maxRadius * 3);
        // context.strokeStyle = 'red';
        // context.stroke();
        // #endregion
        //#region Draw Light
        // let halfRad = ball.radius / 2;
        // context.beginPath();
        // context.rect(ball.position.x - halfRad, ball.position.y - halfRad, ball.radius, ball.radius);
        // context.fillStyle = "black";
        // context.fill();
        //#endregion
    });
    setTimeout(() => {
        Start();
    }, 0.1);
}

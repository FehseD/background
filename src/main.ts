import type { Ball, vec2, Mouse } from './types';

//#region helper Functions
function multiplayArrays(a: vec2, b: vec2): vec2 {
    return {x: a.x * b.x, y: a.y * b.y} as vec2;
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

var canvas: HTMLCanvasElement = document.getElementById("canvas");
var msAnzeige: HTMLSpanElement = document.getElementById("ms_Anzeige");

const context: CanvasRenderingContext2D | null | undefined = canvas?.getContext('2d');

const maxRadius: number = 20;
const minRadius: number = 5;
const gridScale: number = maxRadius * 3;
const ballCount: number = 1000;
var splitSize: number = 50;
let physicsWorker: Worker = new Worker('build/physicsUpdate.js');
let physicsWorker1: Worker = new Worker('build/physicsUpdate.js');
let physicsWorker2: Worker = new Worker('build/physicsUpdate.js');
let physicsWorker3: Worker = new Worker('build/physicsUpdate.js');

let physicsWorkerPromise: Promise<Ball[]> = new Promise<Ball[]>(resolve => {
});
let physicsWorker1Promise: Promise<Ball[]> = new Promise<Ball[]>(resolve => {
});
let physicsWorker2Promise: Promise<Ball[]> = new Promise<Ball[]>(resolve => {
});
let physicsWorker3Promise: Promise<Ball[]> = new Promise<Ball[]>(resolve => {
});

var ballArray: Ball[] = [];

var mouse: Mouse = {
    position: {
        x: -1000,
        y: -1000
    },
    radius: 100
}

window.onmouseout = (): void => {
    mouse.position.x = -mouse.radius * 4;
    mouse.position.y = -mouse.radius * 4;
}

window.onmousemove = (e: MouseEvent): void => {
    mouse.position.x = e.clientX;
    mouse.position.y = e.clientY;
}

window.onresize = (e: UIEvent): void => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.onload = (e: Event): void => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    draw();
}

while (ballArray.length < ballCount) {

    let ballRadius = Math.round(getRandomArbitrary(minRadius, maxRadius / 2)); //max Radius / 2 damit die striche voher connecten

    ballArray.push({
        position: {
            x: getRandomArbitrary(((window.innerWidth / 100) * 5), window.innerWidth - (window.innerWidth / 100) * 5),
            y: getRandomArbitrary(((window.innerHeight / 100) * 5), window.innerHeight - (window.innerHeight / 100) * 5)
        } as vec2,
        velocity: {
            x: (Math.random() - .5),
            y: (Math.random() - .5)
        } as vec2,
        radius: ballRadius,
        index: ballArray.length,
        color: "red",
        gridPlace: {
            x: 0,
            y: 0
        } as vec2,
        near: [] as Ball[],
        TEST_color: Math.round(Math.random() * 360),
        rotationVector: {
            x: getRandomArbitrary(-2, 2),
            y: getRandomArbitrary(-2, 2)
        } as vec2,
    } as Ball)

}

var totalUpdateTime: number = Date.now();

function draw() {

    context?.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // if (tempBallArray[0]?.length) {
    // let test = [];
    // test.push(...tempBallArray[0]);
    // test.push(...tempBallArray[1]);
    // test.push(...tempBallArray[2]);
    // test.push(...tempBallArray[3]);

    // console.log(tempBallArray, [...tempBallArray[0], ...tempBallArray[1], ...tempBallArray[2], ...tempBallArray[3]], ballArray.length, tempBallArray[0].length, 'tempBallArray')

    // ballArray = [...tempBallArray[0], ...tempBallArray[1], ...tempBallArray[2], ...tempBallArray[3]];
    // console.log(ballArray);
    // }

    for (let i = 0; i < 4; i++) {
        context?.beginPath();
        context?.moveTo((window.innerWidth / 4) * i, 0);
        context?.lineTo((window.innerWidth / 4) * i, , window.innerHeight);
        context?.stroke();
    }

    for (const ball of ballArray) { //DRAW

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
                context.strokeStyle = "hsla( 0, 0%, 0%, " + map_range(Dist(ball.position, nearBall.position), 0, maxRadius * 1.5, 1, 0) + ")";
                context.stroke();
            })
        }

        //#endregion

        //#regionDebug

        // context.beginPath();
        // context.moveTo(ball.position.x, ball.position.y);
        // context.lineTo((ball.velocity.x * 100) + ball.position.x, (ball.velocity.y * 100) + ball.position.y);
        // context.strokeStyle = "black";
        // context.stroke();
        //

        // context.beginPath();
        // context.rect(ball.gridPlace.x * maxRadius - (maxRadius / 2), ball.gridPlace.y * maxRadius - (maxRadius / 2), gridScale, gridScale);
        // context.strokeStyle = 'blue';
        // context.stroke();

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

        // context.beginPath();
        // context.rect(ball.gridPlace.x * maxRadius - ((maxRadius * 3) / 2), ball.gridPlace.y * maxRadius - ((maxRadius * 3) / 2), maxRadius * 3, maxRadius * 3);
        // context.strokeStyle = 'red';
        // context.stroke();
    }

//#region Grid Aufbau

    let gridSize: vec2 = {
        x: Math.ceil(window.innerWidth / gridScale),
        y: Math.ceil(window.innerHeight / gridScale)
    }; //Neuer Key

    let grid: Array<Array<Array<Ball>>> = [];

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
        let gridKey: vec2 = {
            x: Math.ceil(ball.position.x / gridScale),
            y: Math.ceil(ball.position.y / gridScale)
        }; //Neuer Key
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

// for (let index = 0; index < 5; index++) {

    physicsWorker.postMessage([grid.slice(0, grid.length / 4), mouse, window.innerWidth, window.innerHeight]);
    physicsWorker1.postMessage([grid.slice(grid.length / 4, (grid.length / 4) * 2), mouse, window.innerWidth, window.innerHeight]);
    physicsWorker2.postMessage([grid.slice((grid.length / 4) * 2, (grid.length / 4) * 3), mouse, window.innerWidth, window.innerHeight]);
    physicsWorker3.postMessage([grid.slice((grid.length / 4) * 3, grid.length), mouse, window.innerWidth, window.innerHeight]);

    physicsWorkerPromise = new Promise<Ball[]>(resolve => {
        physicsWorker.onmessage = (e: MessageEvent): void => {
            // console.log("Worker0", e.data);
            resolve(e.data);
        }
    });
    physicsWorker1Promise = new Promise<Ball[]>(resolve => {
        physicsWorker1.onmessage = (e: MessageEvent): void => {
            // console.log("Worker1", e.data);
            resolve(e.data);
        }
    });
    physicsWorker2Promise = new Promise<Ball[]>(resolve => {
        physicsWorker2.onmessage = (e: MessageEvent): void => {
            // console.log("Worker2", e.data);
            resolve(e.data);
        }
    });
    physicsWorker3Promise = new Promise<Ball[]>(resolve => {
        physicsWorker3.onmessage = (e: MessageEvent): void => {
            // console.log("Worker3", e.data);
            resolve(e.data);
        }
    });
    Promise.all([physicsWorkerPromise, physicsWorker1Promise, physicsWorker2Promise, physicsWorker3Promise])
        .then(values => {
            // console.log("TEST")
            ballArray = [...values[0], ...values[1], ...values[2], ...values[3]];
            msAnzeige.innerText = (Date.now() - totalUpdateTime).toString();

            totalUpdateTime = Date.now();
            // console.clear();
            draw();
        });
}
import { Ball, vec2, Mouse } from './types';

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
    // vectorLaenge *= 1000;
    // vectorLaenge = Math.floor(vectorLaenge);
    // vectorLaenge /= 1000;

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

var canvas: HTMLCanvasElement = document.getElementById("canvas");
var msAnzeige: HTMLSpanElement = document.getElementById("ms_Anzeige");

const context: CanvasRenderingContext2D | null | undefined = canvas?.getContext('2d');

const maxRadius: number = 20;
const minRadius: number = 5
const ballCount: number = 1000;
var splitSize: number = 50;
let physicsWorker: Worker = new Worker('build/physicsUpdate.js');

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

function draw(): void {

    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

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
        // context.rect(ball.gridPlace.x * maxRadius - (maxRadius / 2), ball.gridPlace.y * maxRadius - (maxRadius / 2), maxRadius, maxRadius);
        // context.strokeStyle = 'blue';
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

        // context.beginPath();
        // context.rect(ball.gridPlace.x * maxRadius - ((maxRadius * 3) / 2), ball.gridPlace.y * maxRadius - ((maxRadius * 3) / 2), maxRadius * 3, maxRadius * 3);
        // context.strokeStyle = 'red';
        // context.stroke();
    }

    // for (let index = 0; index < 5; index++) {
        physicsWorker.postMessage([maxRadius, mouse, window.innerWidth, window.innerHeight, ballArray]);
    // }

    setTimeout((): void => { //FIXME WARUM?
        msAnzeige.innerText = (Date.now() - totalUpdateTime).toString();

        totalUpdateTime = Date.now();

        draw();
    }, 1);
}

physicsWorker.onmessage = (e: MessageEvent): void => {
    ballArray = e.data;
}
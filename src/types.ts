export type vec2 = {
    x: number,
    y: number
}

export type Ball = {
    position: vec2,
    radius: number,
    velocity: vec2,
    color: string,
    TEST_color: number,
    gridPlace: vec2,
    index: number,
    near: Ball[],
}

export type Mous = {
    position: vec2,
    radius: number
}
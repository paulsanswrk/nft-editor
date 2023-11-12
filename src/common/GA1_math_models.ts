import {Cos, Power, Sech, Sin, Tanh} from "../CommonMath";
import {Spiral_Dynamic_Config} from "../base/Spiral_Dynamic";

function List(...elements: any[]) {
    return elements
}

let m1 = 0, m2 = 0, m3 = 0, offsetR = 0, offsetZ = 0, z_Irreg = 0, cTanh = 0, zScale = 0, u1 = 0;

export function set_GA1_config(config: Spiral_Dynamic_Config) {
    ({m1, m2, m3, offsetR, offsetZ, z_Irreg, cTanh, zScale, u1} = config);
}

export const G_derivatives = {
    m1: (t: number) => List((t * Sin(t) * Sin(m1 * t) * Tanh(2 * (offsetR + t - u1))) / m2, (t * Cos(t) * Sin(m1 * t) * Tanh(2 * (offsetR + t - u1))) / m2, 0),
    m2: (t: number) => List((Cos(m1 * t) * Sin(t) * Tanh(2 * (offsetR + t - u1))) / Power(m2, 2), (Cos(t) * Cos(m1 * t) * Tanh(2 * (offsetR + t - u1))) / Power(m2, 2), 0),
    m3: (t: number) => List(0, 0, t * z_Irreg * Cos(m3 * t)),
    offsetR: (t: number) => List(2 * (1 - Cos(m1 * t) / m2) * Power(Sech(2 * (offsetR + t - u1)), 2) * Sin(t), 2 * Cos(t) * (1 - Cos(m1 * t) / m2) * Power(Sech(2 * (offsetR + t - u1)), 2), 0),
    offsetZ: (t: number) => List(0, 0, cTanh * t * zScale * Power(Sech(cTanh * (offsetZ + t - u1)), 2)),
    cTanh: (t: number) => List(0, 0, t * (offsetZ + t - u1) * zScale * Power(Sech(cTanh * (offsetZ + t - u1)), 2)),
    z_Irreg: (t: number) => List(0, 0, Sin(m3 * t)),
    zScale: (t: number) => List(0, 0, t * Tanh(cTanh * (offsetZ + t - u1))),
};


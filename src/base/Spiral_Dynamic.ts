import {Spiral_Base, Spiral_Config} from "./Spiral_Base";
import {Cos, Power, Sech, Sin, Tanh} from "../CommonMath";
import {solve} from "@bluemath/linalg";
import {NDArray} from "@bluemath/common";

// import {NDArray, solve} from "vectorious";

export interface Spiral_Dynamic_Config extends Spiral_Config {
    // n_config?: number;
    m2?: number;
    rot_cnt?: number;
    z_Irreg?: number;
    at0?: number;
    at4?: number;
    cTanh?: number;
    u1?: number;
    u2?: number;
    offsetZ?: number;
    offsetR?: number;
    tube_radius?: number;
    g_colors?: { pos: number, color: string }[];
    s_colors?: { pos: number, color: string }[];
}

export class Spiral_Dynamic extends Spiral_Base {
    public m1: number = 15.6;

    get id(): string {
        return `m1_${this.m1}_m2_${this.m2}`;
    }

    type: string = 'dynamic';

    static readonly factory = new Spiral_Dynamic();

    constructor() {
        super();
        window['g_color'] = (z: number) => this.G_color_func_hex(z);
    }


    create_spiral(config: Spiral_Dynamic_Config): Spiral_Dynamic {
        let spiral = new Spiral_Dynamic();
        spiral.calc_cc();
        spiral.calc_points();

        return spiral;
    }

    public get_config(): Spiral_Dynamic_Config {
        return {
            m1: this.m1,
            m2: this.m2,
            z_Irreg: this.z_Irreg,
            at0: this.at0,
            at4: this.at4,
            cTanh: this.cTanh,
            u1: this.u1,
            u2: this.u2,
            offsetZ: this.offsetZ,
            offsetR: this.offsetR,
            rot_cnt: this.rot_cnt,
            tube_radius: this.tube_radius,
            g_colors: this.g_colors,
            s_colors: this.s_colors,
        };
    }

    public set_config(config: Spiral_Dynamic_Config) {
        if (config.m1 !== undefined) this.m1 = config.m1;
        if (config.m2 !== undefined) this.m2 = config.m2;
        if (config.rot_cnt !== undefined) this.rot_cnt = config.rot_cnt;
        if (config.z_Irreg !== undefined) this.z_Irreg = config.z_Irreg;
        if (config.at0 !== undefined) this.at0 = config.at0;
        if (config.at4 !== undefined) this.at4 = config.at4;
        if (config.cTanh !== undefined) this.cTanh = config.cTanh;
        if (config.u1 !== undefined) this.u1 = config.u1;
        if (config.u2 !== undefined) this.u2 = config.u2;
        if (config.offsetZ !== undefined) this.offsetZ = config.offsetZ;
        if (config.offsetR !== undefined) this.offsetR = config.offsetR;
        if (config.tube_radius !== undefined) this.tube_radius = config.tube_radius;
        if (config.g_colors !== undefined) this.g_colors = config.g_colors;
        if (config.s_colors !== undefined) this.s_colors = config.s_colors;

        this.calc_cc();
        this.calc_points();
    }

    protected calc_cc() {
        function List(...elements: any[]) {
            return elements
        }

        const m1 = this.m1;
        const m2 = this.m2;
        const u1 = this.u1;
        const u2 = this.u2;
        const at0 = this.at0;
        const at4 = this.at4;

        const zIrreg = this.z_Irreg;
        const cTanh = this.cTanh;
        const offsetZ = this.offsetZ;
        const offsetR = this.offsetR;

        const lp = List(List(1, at0, Power(at0, 2), Power(at0, 3), 0, 0, 0, 0, 0, 0, 0, 0), List(0, 0, 0, 0, 1, at0, Power(at0, 2), Power(at0, 3), 0, 0, 0, 0), List(0, 0, 0, 0, 0, 0, 0, 0, 1, at0, Power(at0, 2), Power(at0, 3)), List(0, 1, 2 * at0, 3 * Power(at0, 2), 0, 0, 0, 0, 0, 0, 0, 0), List(0, 0, 0, 0, 0, 1, 2 * at0, 3 * Power(at0, 2), 0, 0, 0, 0), List(0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2 * at0, 3 * Power(at0, 2)),
            List(1, at4, Power(at4, 2), Power(at4, 3), 0, 0, 0, 0, 0, 0, 0, 0), List(0, 0, 0, 0, 1, at4, Power(at4, 2), Power(at4, 3), 0, 0, 0, 0), List(0, 0, 0, 0, 0, 0, 0, 0, 1, at4, Power(at4, 2), Power(at4, 3)), List(0, 1, 2 * at4, 3 * Power(at4, 2), 0, 0, 0, 0, 0, 0, 0, 0), List(0, 0, 0, 0, 0, 1, 2 * at4, 3 * Power(at4, 2), 0, 0, 0, 0), List(0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2 * at4, 3 * Power(at4, 2)));

        const rp = List((1 - Cos(m1 * u1) / m2) * Sin(u1) * Tanh(2 * offsetR), Cos(u1) * (1 - Cos(m1 * u1) / m2) * Tanh(2 * offsetR), zIrreg * Sin(m1 * u1) + (u1 * Tanh(cTanh * offsetZ)) / 4., -2 * (1 - Cos(m1 * u1) / m2) * Power(Sech(2 * offsetR), 2) * Sin(u1) - Cos(u1) * (1 - Cos(m1 * u1) / m2) * Tanh(2 * offsetR) - (m1 * Sin(u1) * Sin(m1 * u1) * Tanh(2 * offsetR)) / m2,
            -2 * Cos(u1) * (1 - Cos(m1 * u1) / m2) * Power(Sech(2 * offsetR), 2) + (1 - Cos(m1 * u1) / m2) * Sin(u1) * Tanh(2 * offsetR) - (m1 * Cos(u1) * Sin(m1 * u1) * Tanh(2 * offsetR)) / m2, -(m1 * zIrreg * Cos(m1 * u1)) - (cTanh * u1 * Power(Sech(cTanh * offsetZ), 2)) / 4. - Tanh(cTanh * offsetZ) / 4., (1 - Cos(m1 * u2) / m2) * Sin(u2) * Tanh(2 * (offsetR - u1 + u2)),
            Cos(u2) * (1 - Cos(m1 * u2) / m2) * Tanh(2 * (offsetR - u1 + u2)), zIrreg * Sin(m1 * u2) + (u2 * Tanh(cTanh * (offsetZ - u1 + u2))) / 4., -2 * (1 - Cos(m1 * u2) / m2) * Power(Sech(2 * (offsetR - u1 + u2)), 2) * Sin(u2) - Cos(u2) * (1 - Cos(m1 * u2) / m2) * Tanh(2 * (offsetR - u1 + u2)) - (m1 * Sin(u2) * Sin(m1 * u2) * Tanh(2 * (offsetR - u1 + u2))) / m2,
            -2 * Cos(u2) * (1 - Cos(m1 * u2) / m2) * Power(Sech(2 * (offsetR - u1 + u2)), 2) + (1 - Cos(m1 * u2) / m2) * Sin(u2) * Tanh(2 * (offsetR - u1 + u2)) - (m1 * Cos(u2) * Sin(m1 * u2) * Tanh(2 * (offsetR - u1 + u2))) / m2, -(m1 * zIrreg * Cos(m1 * u2)) - (cTanh * u2 * Power(Sech(cTanh * (offsetZ - u1 + u2)), 2)) / 4. - Tanh(cTanh * (offsetZ - u1 + u2)) / 4.);

        let A = new NDArray(lp);
        let X = new NDArray(rp);
        solve(A, X);

        const cc = X.toArray();

        this.set_cc(cc);
    }

}
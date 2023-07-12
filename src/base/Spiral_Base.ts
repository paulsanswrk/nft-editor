import {Vector3} from "@babylonjs/core/Maths/math.vector";
import {FloatArray} from "@babylonjs/core/Legacy/legacy";
import {Color3} from "@babylonjs/core";

export interface Spiral_Config {
    n_config?: number;
}

const u1 = 0.21, u2 = 25;
const G_steps = 1200, S_steps = 400, du = (u2 - u1) / G_steps;
const hueG = 0.032;

export abstract class Spiral_Base {
    public rot_cnt: number = 6;
    public m1: number = 1.19;
    protected m2: number = 4.5;

    protected at0: number = 4.8;
    protected at4: number = 8.8;

    protected z_Irreg: number = 0.15;
    protected cTanh: number = 1;
    readonly rot_G: number = Math.PI / 10;

    private cx0: number;
    private cx1: number;
    private cx2: number;
    private cx3: number;
    private cy0: number;
    private cy1: number;
    private cy2: number;
    private cy3: number;
    private cz0: number;
    private cz1: number;
    private cz2: number;
    private cz3: number;

    protected abstract set_config(config: Spiral_Config);

    protected get dt() {
        return (this.at4 - this.at0) / S_steps;
    }

    public abstract create_spiral(config: Spiral_Config): Spiral_Base;

    spiralPoints = new Array<Vector3>(G_steps + S_steps);

    private Gmod(t) {
        return (1 - Math.cos(this.m1 * t) / this.m2) * Math.tanh(2 * (t - u1));
    }

    private G(t) {
        //BJS implements left-handed coordinate system, so negate x
        return [-this.Gmod(t) * Math.sin(t), Math.cos(t) * this.Gmod(t), this.z_Irreg * Math.sin(this.m1 * t) + (t * Math.tanh(this.cTanh * (t - u1))) / 4];
    }

    private z_max = this.G(u2)[2];

    private S(t) {
        return [
            //BJS implements left-handed coordinate system, so negate x
            -(this.cx0 + this.cx1 * t + this.cx2 * Math.pow(t, 2) + this.cx3 * Math.pow(t, 3)),
            this.cy0 + this.cy1 * t + this.cy2 * Math.pow(t, 2) + this.cy3 * Math.pow(t, 3),
            this.cz0 + this.cz1 * t + this.cz2 * Math.pow(t, 2) + this.cz3 * Math.pow(t, 3),
        ]
    }

    public calc_points(full = true) {
        let p = 0;
        for (let i = 0, t = u1; i < G_steps; i++, t += du) {
            this.spiralPoints[p++] = new Vector3(...this.G(t));
        }

        if (full)
            for (let t = this.at4; t >= this.at0; t -= this.dt) {
                this.spiralPoints[p++] = new Vector3(...this.S(t));
            }

        // return this;
    }

    public calc_colors(positions: FloatArray) {
        const vertices_cnt = positions.length / 3;
        const g_vertices_cnt = vertices_cnt * G_steps / (G_steps + S_steps);
        const s_vertices_cnt = vertices_cnt * S_steps / (G_steps + S_steps);
        const colors = [];
        for (let p = 0; p < positions.length; p += 3) {
            let z = Math.abs(positions[p + 2])
            if (p < g_vertices_cnt * 3) {
                let c = Color3.FromHSV(z / this.z_max * u2 * hueG * 360, 1, 1);
                colors.push(...c.asArray(), 1);
            } else {
                let t = this.at4 + (this.at0 - this.at4) * (p / 3 - g_vertices_cnt) / s_vertices_cnt;
                let colorFunc = this.ColorFunc(t);
                let c = Color3.FromHSV(colorFunc[0] * 360, colorFunc[1], colorFunc[2]); //
                // colors.push(0,0,0, 0)
                colors.push(...c.asArray(), 1);
            }
        }
        return colors;
    }

    private ColorFunc(t): number[] {
        return [
            u1 * hueG / Math.cosh((t - this.at0) * 8) + u2 * hueG / Math.cosh((t - this.at4) * 5),
            1 / Math.cosh((t - this.at0) * 8) + 1 / Math.cosh((t - this.at4) * 5),
            1
        ];
    }

    protected set_cc(cc: number[]) {
        [this.cx0, this.cx1, this.cx2, this.cx3, this.cy0, this.cy1, this.cy2, this.cy3, this.cz0, this.cz1, this.cz2, this.cz3] = cc;
    }
}
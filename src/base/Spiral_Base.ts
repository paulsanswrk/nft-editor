import {Vector3} from "@babylonjs/core/Maths/math.vector";
import {FloatArray} from "@babylonjs/core/Legacy/legacy";
import {Color3} from "@babylonjs/core";

export interface Spiral_Config {
    n_config?: number;
//not used here
    m1?: number;
}

export abstract class Spiral_Base {
    public m1: number = 1.19;
    public m2: number = 4.5;
    public rot_cnt: number = 6;

    public at0: number = 4.8;
    public at4: number = 8.8;

    public z_Irreg: number = 0.15;
    public cTanh: number = 1;
    public offsetZ: number = 0;
    public offsetR: number = 0;
    public u1 = 0.21;
    public u2 = 25;

    public tube_radius: number = 0.006;

    protected readonly G_steps = 2000;
    protected readonly S_steps = 400;
    protected readonly hueG = 0.032;

    protected cx0: number = 0;
    protected cx1: number = 0;
    protected cx2: number = 0;
    protected cx3: number = 0;
    protected cy0: number = 0;
    protected cy1: number = 0;
    protected cy2: number = 0;
    protected cy3: number = 0;
    protected cz0: number = 0;
    protected cz1: number = 0;
    protected cz2: number = 0;
    protected cz3: number = 0;

    public abstract get id(): string;

    type: string = 'base';

    protected abstract set_config(config: Spiral_Config);

    abstract get_config(): Spiral_Config;

    public param_limits: { [k: string]: { lo?: number, hi?: number } } = {};

    protected get dt() {
        return (this.at4 - this.at0) / this.S_steps;
    }

    public abstract create_spiral(config: Spiral_Config): Spiral_Base;

    spiralPoints = new Array<Vector3>(this.G_steps + this.S_steps);

    protected transform(v: number[]): number[] {
        return v;
    }

    private Gmod(t) {
        return (1 - Math.cos(this.m1 * t) / this.m2) * Math.tanh(2 * (t - this.u1 + this.offsetR));
    }

    protected G(t) {
        //BJS implements left-handed coordinate system, so negate x
        return [-this.Gmod(t) * Math.sin(t), Math.cos(t) * this.Gmod(t), this.z_Irreg * Math.sin(this.m1 * t) + (t * Math.tanh(this.cTanh * (t - this.u1 + this.offsetZ))) / 4];
    }

    private z_max = this.G(this.u2)[2];

    private S(t) {
        return [
            //BJS implements left-handed coordinate system, so negate x
            -(this.cx0 + this.cx1 * t + this.cx2 * Math.pow(t, 2) + this.cx3 * Math.pow(t, 3)),
            this.cy0 + this.cy1 * t + this.cy2 * Math.pow(t, 2) + this.cy3 * Math.pow(t, 3),
            this.cz0 + this.cz1 * t + this.cz2 * Math.pow(t, 2) + this.cz3 * Math.pow(t, 3),
        ];
    }

    public calc_points(full = true) {
        let p = 0;
        const du = (this.u2 - this.u1) / this.G_steps;
        for (let i = 0, t = this.u1; i < this.G_steps; i++, t += du) {
            let v = this.G(t);
            v = this.transform(v);
            this.spiralPoints[p++] = new Vector3(...v);
        }

        if (full)
            for (let t = this.at4; t >= this.at0; t -= this.dt) {
                let v = this.S(t);
                v = this.transform(v);
                this.spiralPoints[p++] = new Vector3(...v);
            }

        // console.log(this.spiralPoints);

    }

    public calc_colors(positions: FloatArray) {
        const vertices_cnt = positions.length / 3;
        const g_vertices_cnt = vertices_cnt * this.G_steps / (this.G_steps + this.S_steps);
        const s_vertices_cnt = vertices_cnt * this.S_steps / (this.G_steps + this.S_steps);
        const colors = [];
        for (let p = 0; p < positions.length; p += 3) {
            let z = Math.abs(positions[p + 2])
            if (p < g_vertices_cnt * 3) {
                let c = Color3.FromHSV(z / this.z_max * this.u2 * this.hueG * 360, 1, 1);
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
            this.u1 * this.hueG / Math.cosh((t - this.at0) * 8) + this.u2 * this.hueG / Math.cosh((t - this.at4) * 5),
            1 / Math.cosh((t - this.at0) * 8) + 1 / Math.cosh((t - this.at4) * 5),
            1
        ];
    }

    protected set_cc(cc: number[]) {
        [this.cx0, this.cx1, this.cx2, this.cx3, this.cy0, this.cy1, this.cy2, this.cy3, this.cz0, this.cz1, this.cz2, this.cz3] = cc;
    }
}
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import {FloatArray} from "@babylonjs/core/Legacy/legacy";
import {Color3} from "@babylonjs/core";

const u1 = 0.21, u2 = 25;
const G_steps = 1200, S_steps = 400, du = (u2 - u1) / G_steps;
const hueG = 0.032;
const at0 = 4.8, at4 = 8.8, dt = (at4 - at0) / S_steps;

export abstract class Spiral_Base {

    readonly rot_cnt: number = 6;
    readonly m1: number = 1.19;
    readonly m2: number = 4.5;

    readonly z_Irreg: number = 0.15;
    readonly cTanh: number = 1;
    readonly rot_G: number = Math.PI / 10;

    readonly n_config: number;

    static readonly factory: Spiral_Base;

    protected get s_data(): { m1: number, cc: number[] }[] {
        return [];
    }

    public abstract readonly config_len: number;

    // public readonly all_configs = this.s_data.slice(0, this.config_len);

    protected constructor(n_config: number = 0) {
        /*        if (p.m1 !== undefined) this.m1 = p.m1;
                if (p.z !== undefined) {
                    this.set_cc(closestValue(this.z_values, p.z));
                }*/
        this.n_config = n_config;

        [this.cx0, this.cx1, this.cx2, this.cx3, this.cy0, this.cy1, this.cy2, this.cy3, this.cz0, this.cz1, this.cz2, this.cz3] = this.s_data[this.n_config].cc;
        this.m1 = this.s_data[this.n_config].m1;

    }

    public abstract create_spiral(n: number): Spiral_Base;

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

    protected calc_points(full = true) {
        let p = 0;
        for (let i = 0, t = u1; i < G_steps; i++, t += du) {
            this.spiralPoints[p++] = new Vector3(...this.G(t));
        }

        if (full)
            for (let t = at4; t >= at0; t -= dt) {
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
                let t = at4 + (at0 - at4) * (p / 3 - g_vertices_cnt) / s_vertices_cnt;
                let colorFunc = this.ColorFunc(t);
                let c = Color3.FromHSV(colorFunc[0] * 360, colorFunc[1], colorFunc[2]); //
                // colors.push(0,0,0, 0)
                colors.push(...c.asArray(), 1);
            }
        }
        return colors;
    }

    /*    private ColorFunc_z(z): number[] {
            let t = at4 - (1 - z / this.z_max) * (at4 - at0) - 0.1;
            return this.ColorFunc(t)
        }*/

    private ColorFunc(t): number[] {
        return [
            u1 * hueG / Math.cosh((t - at0) * 8) + u2 * hueG / Math.cosh((t - at4) * 5),
            1 / Math.cosh((t - at0) * 8) + 1 / Math.cosh((t - at4) * 5),
            1
        ];
    }

    /*    private z_Irreg_dir = 'down';
        private z_Irreg_up = 0.3;
        private z_Irreg_down = 0.12;
        private z_Irreg_step = 0.002;

        private var_m1() {
            // if (m1 > 0.2) m1 -= 0.001; else if (m1 < 1.2) m1 += 0.001;

            if (this.z_Irreg_dir == 'up') {
                this.z_Irreg += this.z_Irreg_step;
                if (this.z_Irreg > this.z_Irreg_up) this.z_Irreg_dir = 'down'
            } else {
                this.z_Irreg -= this.z_Irreg_step;
                if (this.z_Irreg < this.z_Irreg_down) this.z_Irreg_dir = 'up';
            }
        }*/

    // private s_by_z: Map<number, typeof s_data[0]> = new Map(s_data.map(x => [x.z, x]));
    // private s_by_m1 = new Map(s_data.map(x => [x.m1, x]));
// const s_by_z = Object.fromEntries(s_data.map(x => [x.z, x]));
// const s_by_m1: { [p: number]: any } = Object.fromEntries(s_data.map(x => [x.m1, x]));
// const z_values: number[] = s_data.map(x => x.z).sort();
//     private z_values: number[] = [...this.s_by_z.keys()].sort();

// console.log(z_values);

    // private m1_values: number[] = [...this.s_by_m1.keys()];
// const m1_values: number[] = Object.keys(s_by_m1).sort();

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

    /*    private set_cc(z: number) {
            [this.cx0, this.cx1, this.cx2, this.cx3, this.cy0, this.cy1, this.cy2, this.cy3, this.cz0, this.cz1, this.cz2, this.cz3] = this.s_by_z.get(z).cc;
            this.m1 = this.s_by_z.get(z).m1;
        }*/

    /*    handle_z_click(z: number) {
            let z1 = closestValue(this.z_values, z);
            this.set_cc(z1);
            // console.log(z, z1, this.m1, cx0)
        }*/
}





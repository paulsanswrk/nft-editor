import {Vector3} from "@babylonjs/core/Maths/math.vector";
import {Color4, FloatArray} from "@babylonjs/core/Legacy/legacy";
import {Color3} from "@babylonjs/core";
import {color4_to_hsva_array, HSVA_Lerp} from "../common/help_funcs";

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

    public g_colors: { pos: number, color: string }[] = [
        {pos: 0, color: Color4.FromColor3(Color3.FromHSV(0, 1, 1)).toHexString()},
        {pos: 1, color: Color4.FromColor3(Color3.FromHSV(320, 1, 1)).toHexString()},
    ];

    public s_colors: { pos: number, color: string }[] = [
        {pos: 0.25, color: Color4.FromColor3(Color3.White()).toHexString()},
        {pos: 0.8, color: Color4.FromColor3(Color3.White()).toHexString()},
    ];

    public need_recalc_z_bounds = true;

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

    protected z_min: number = 0; //for G only
    protected z_max: number = 0;

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

    // private z_max = this.G(this.u2)[2];

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
            this.z_min = Math.min(this.z_min, v[2]);
            this.z_max = Math.max(this.z_max, v[2]);
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



    private prepare_colors() {
        this.g_colors_ext = [...this.g_colors, {
            pos: 2,
            color: HSVA_Lerp(color4_to_hsva_array(this.g_colors[this.g_colors.length - 2].color), color4_to_hsva_array(this.g_colors[this.g_colors.length - 1].color), 2).toHexString()
        }].map(x => ({pos: x.pos, color: color4_to_hsva_array(x.color)}));


        const z_g_min_norm = (this.G(this.u1)[2] - this.z_min) / (this.z_max - this.z_min);
        const g_start_color = this.segm_color_func(z_g_min_norm, this.g_colors_ext).toHexString();
        const z_g_max_norm = (this.G(this.u2)[2] - this.z_min) / (this.z_max - this.z_min);
        const g_end_color = this.segm_color_func(z_g_max_norm, this.g_colors_ext).toHexString();

        const s_colors = [
            {pos: 0, color: g_end_color},
            ...this.s_colors,
            {pos: 1, color: g_start_color},
        ];

        this.s_colors_ext = [
            ...s_colors,
            {
                pos: 2,
                color: HSVA_Lerp(color4_to_hsva_array(s_colors[s_colors.length - 2].color), color4_to_hsva_array(s_colors[s_colors.length - 1].color), 2).toHexString()
            }
        ].map(x => ({pos: x.pos, color: color4_to_hsva_array(x.color)}));
    }

    private g_colors_ext: { color: number[]; pos: number }[];
    private s_colors_ext: { color: number[]; pos: number }[];

    protected segm_color_func(norm_z: number, colors: { color: number[]; pos: number }[], do_log: boolean = false): Color4 {
        try {
            let n_color_segment = colors.findIndex(x => x.pos > norm_z) - 1;
            const amount = (norm_z - colors[n_color_segment].pos) / (colors[n_color_segment + 1].pos - colors[n_color_segment].pos);

            if (do_log)
                console.log('segm_color_func', {norm_z, n_color_segment, amount})

            return HSVA_Lerp(colors[n_color_segment].color, colors[n_color_segment + 1].color, amount);
        } catch (e) {
            console.log('segm_color_func exception', norm_z);
            return Color4.FromColor3(Color3.White())
        }
    }

    public G_color_func_hex(norm_z: number): string {
        const color4 = this.segm_color_func(norm_z, this.g_colors_ext, false)
        return color4.toHexString(true);
    }

    public calc_colors(positions: FloatArray) {
        if (this.need_recalc_z_bounds) {
            for (let i = 2; i < positions.length; i += 3) {
                const z = positions[i];
                this.z_min = Math.min(this.z_min, z)
                this.z_max = Math.max(this.z_max, z)
            }
            this.need_recalc_z_bounds = false;
        }

        this.prepare_colors();

        const vertices_cnt = positions.length / 3;
        const g_vertices_cnt = vertices_cnt * this.G_steps / (this.G_steps + this.S_steps);
        const s_vertices_cnt = vertices_cnt * this.S_steps / (this.G_steps + this.S_steps);
        const colors = [];

        const z_max = this.G(this.u2)[2];
        let z_norm_min = 10, z_norm_max = 0;
        let z_pos_min = 10, z_pos_max = 0;

        // console.log('z_min/z_max', this.z_min, this.z_max)

        for (let p = 0; p < positions.length; p += 3) {
            // const z = Math.abs(positions[p + 2]);
            const z = positions[p + 2];
            z_pos_min = Math.min(z_pos_min, z)
            z_pos_max = Math.max(z_pos_max, z)

            if (p < g_vertices_cnt * 3) { //G
                const z_norm = (z - this.z_min) / (this.z_max - this.z_min);
                z_norm_min = Math.min(z_norm_min, z_norm)
                z_norm_max = Math.max(z_norm_max, z_norm)
                // const z_norm = z / z_max;
                const color = this.segm_color_func(z_norm, this.g_colors_ext);
                colors.push(...color.asArray());
            } else { //S
                const color_pos = (p / 3 - g_vertices_cnt) / s_vertices_cnt;
                const color = this.segm_color_func(color_pos, this.s_colors_ext);
                colors.push(...color.asArray());
            }
        }

        // console.log({z_norm_min, z_norm_max})
        // console.log({z_pos_min, z_pos_max})

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
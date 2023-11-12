import {Spiral_Base, Spiral_Config} from "./Spiral_Base";
import {Cos, Power, Sech, Sin, Tanh} from "../CommonMath";
import {solve} from "@bluemath/linalg";
import {NDArray} from "@bluemath/common";
import {G_derivatives, set_GA1_config} from "../common/GA1_math_models";
import {add_to_array, left_deriv, lerp_numeric, right_deriv} from "../common/help_funcs";
import {mapValues, some} from "lodash";

// import {NDArray, solve} from "vectorious";

export interface Spiral_Dynamic_Config extends Spiral_Config {
    // n_config?: number;
    m2?: number;
    m3?: number;
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
    zScale?: number;
    g_colors?: { pos: number, color: string }[];
    s_colors?: { pos: number, color: string }[];
    g_thickness?: { pos: number, val: number }[];
    s_thickness?: { pos: number, val: number }[];

    m1_segmented?: { pos: number, val: number }[];
    m2_segmented?: { pos: number, val: number }[];
    m3_segmented?: { pos: number, val: number }[];
    offsetR_segmented?: { pos: number, val: number }[];
    offsetZ_segmented?: { pos: number, val: number }[];
    z_Irreg_segmented?: { pos: number, val: number }[];
    cTanh_segmented?: { pos: number, val: number }[];
    zScale_segmented?: { pos: number, val: number }[];
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
            m3: this.m3,
            z_Irreg: this.z_Irreg,
            at0: this.at0,
            at4: this.at4,
            cTanh: this.cTanh,
            u1: this.u1,
            u2: this.u2,
            offsetZ: this.offsetZ,
            offsetR: this.offsetR,
            zScale: this.zScale,
            rot_cnt: this.rot_cnt,
            tube_radius: this.tube_radius,
            g_colors: this.g_colors,
            s_colors: this.s_colors,
            g_thickness: this.g_thickness,
            s_thickness: this.s_thickness,

        };
    }

    public set_config(config: Spiral_Dynamic_Config) {
        if (config.m1 !== undefined) this.m1 = config.m1;
        if (config.m2 !== undefined) this.m2 = config.m2;
        if (config.m3 !== undefined) this.m3 = config.m3;
        if (config.rot_cnt !== undefined) this.rot_cnt = config.rot_cnt;
        if (config.z_Irreg !== undefined) this.z_Irreg = config.z_Irreg;
        if (config.at0 !== undefined) this.at0 = config.at0;
        if (config.at4 !== undefined) this.at4 = config.at4;
        if (config.cTanh !== undefined) this.cTanh = config.cTanh;
        if (config.u1 !== undefined) this.u1 = config.u1;
        if (config.u2 !== undefined) this.u2 = config.u2;
        if (config.offsetZ !== undefined) this.offsetZ = config.offsetZ;
        if (config.offsetR !== undefined) this.offsetR = config.offsetR;
        if (config.zScale !== undefined) this.zScale = config.zScale;
        if (config.tube_radius !== undefined) this.tube_radius = config.tube_radius;
        if (config.g_colors !== undefined) this.g_colors = config.g_colors;
        if (config.s_colors !== undefined) this.s_colors = config.s_colors;
        if (config.g_thickness !== undefined) this.g_thickness = config.g_thickness;
        if (config.s_thickness !== undefined) this.s_thickness = config.s_thickness;

        this.calc_cc();
        this.calc_points();
    }

    public segmented_params: { [k: string]: { pos: number, val: number }[] | null } = {
        m1: null,
        m2: null,
        m3: null,
        offsetR: null,
        offsetZ: null,
        z_Irreg: null,
        cTanh: null,
        zScale: null,
    };

    private have_segmented_params() {
        return some(this.segmented_params, p => !!p);
    }

    public get_segmented_param(name: string): { pos: number; val: number }[] {
        return this.segmented_params[name];
    }

    public set_segmented_param(name: string, value: { pos: number; val: number }[] | null) {
        this.segmented_params[name] = value;
        this.calc_cc();
        this.calc_points();
    }

    private calc_all_segmented_params_values(t_norm: number): { [p: string]: number } {
        const config = this.get_config();
        return mapValues(this.segmented_params, (v, k) => v ? lerp_numeric(v, t_norm) : config[k]);
        // return this.segmented_params_names.map(k => this.segmented_params[k] ? lerp_numeric(this.segmented_params[k], t_norm) : config[k]);
    }

    private get_all_segmented_params_bound_values(bnd: 'top' | 'bot'): { [p: string]: number } {
        const config = this.get_config();
        return mapValues(this.segmented_params, (v, k) => v ? v[bnd === "bot" ? 0 : v.length - 1].val : config[k]);
    }

    private Gmod1(t: number, m1: number, m2: number, offsetR: number) {
        return (1 - Math.cos(m1 * t) / m2) * Math.tanh(2 * (t - this.u1 + offsetR));
    }

    protected override G(t: number) {
        const t_norm = (t - this.u1) / (this.u2 - this.u1);
        const {m1, m2, m3, offsetR, offsetZ, z_Irreg, cTanh, zScale} = this.calc_all_segmented_params_values(t_norm);

        //BJS implements left-handed coordinate system, so negate x
        return [-this.Gmod1(t, m1, m2, offsetR) * Math.sin(t),
            Math.cos(t) * this.Gmod1(t, m1, m2, offsetR),
            z_Irreg * Math.sin(m3 * t) + (t * Math.tanh(cTanh * (t - this.u1 + offsetZ))) * zScale];
    }

    protected calc_cc() {
        function List(...elements: any[]) {
            return elements
        }

        const bot_config = this.get_all_segmented_params_bound_values('bot');
        let {m1, m2, m3, offsetR, offsetZ, z_Irreg, cTanh, zScale} = bot_config;
        const [m1Bot, m2Bot, m3Bot, offsetRBot, offsetZBot, zIrregBot, cTanhBot, zScaleBot] = [m1, m2, m3, offsetR, offsetZ, z_Irreg, cTanh, zScale];

        const top_config = this.get_all_segmented_params_bound_values('top');
        ({m1, m2, m3, offsetR, offsetZ, z_Irreg, cTanh, zScale} = top_config);
        const [m1Top, m2Top, m3Top, offsetRTop, offsetZTop, zIrregTop, cTanhTop, zScaleTop] = [m1, m2, m3, offsetR, offsetZ, z_Irreg, cTanh, zScale];

        const u1 = this.u1;
        const u2 = this.u2;
        const at0 = this.at0;
        const at4 = this.at4;

        const lp = List(List(1, at0, Power(at0, 2), Power(at0, 3), 0, 0, 0, 0, 0, 0, 0, 0), List(0, 0, 0, 0, 1, at0, Power(at0, 2), Power(at0, 3), 0, 0, 0, 0),
            List(0, 0, 0, 0, 0, 0, 0, 0, 1, at0, Power(at0, 2), Power(at0, 3)), List(0, 1, 2 * at0, 3 * Power(at0, 2), 0, 0, 0, 0, 0, 0, 0, 0), List(0, 0, 0, 0, 0, 1, 2 * at0, 3 * Power(at0, 2), 0, 0, 0, 0),
            List(0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2 * at0, 3 * Power(at0, 2)), List(1, at4, Power(at4, 2), Power(at4, 3), 0, 0, 0, 0, 0, 0, 0, 0), List(0, 0, 0, 0, 1, at4, Power(at4, 2), Power(at4, 3), 0, 0, 0, 0),
            List(0, 0, 0, 0, 0, 0, 0, 0, 1, at4, Power(at4, 2), Power(at4, 3)), List(0, 1, 2 * at4, 3 * Power(at4, 2), 0, 0, 0, 0, 0, 0, 0, 0), List(0, 0, 0, 0, 0, 1, 2 * at4, 3 * Power(at4, 2), 0, 0, 0, 0),
            List(0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2 * at4, 3 * Power(at4, 2)));

        const rp = List((1 - Cos(m1Bot * u1) / m2Bot) * Sin(u1) * Tanh(2 * offsetRBot), Cos(u1) * (1 - Cos(m1Bot * u1) / m2Bot) * Tanh(2 * offsetRBot),
            zIrregBot * Sin(m3Bot * u1) + u1 * zScaleBot * Tanh(cTanhBot * offsetZBot),
            -2 * (1 - Cos(m1Bot * u1) / m2Bot) * Power(Sech(2 * offsetRBot), 2) * Sin(u1) - Cos(u1) * (1 - Cos(m1Bot * u1) / m2Bot) * Tanh(2 * offsetRBot) -
            (m1Bot * Sin(u1) * Sin(m1Bot * u1) * Tanh(2 * offsetRBot)) / m2Bot, -2 * Cos(u1) * (1 - Cos(m1Bot * u1) / m2Bot) * Power(Sech(2 * offsetRBot), 2) +
            (1 - Cos(m1Bot * u1) / m2Bot) * Sin(u1) * Tanh(2 * offsetRBot) - (m1Bot * Cos(u1) * Sin(m1Bot * u1) * Tanh(2 * offsetRBot)) / m2Bot,
            -(m3Bot * zIrregBot * Cos(m3Bot * u1)) - cTanhBot * u1 * zScaleBot * Power(Sech(cTanhBot * offsetZBot), 2) - zScaleBot * Tanh(cTanhBot * offsetZBot),
            (1 - Cos(m1Top * u2) / m2Top) * Sin(u2) * Tanh(2 * (offsetRTop - u1 + u2)), Cos(u2) * (1 - Cos(m1Top * u2) / m2Top) * Tanh(2 * (offsetRTop - u1 + u2)),
            zIrregTop * Sin(m3Top * u2) + u2 * zScaleTop * Tanh(cTanhTop * (offsetZTop - u1 + u2)),
            -2 * (1 - Cos(m1Top * u2) / m2Top) * Power(Sech(2 * (offsetRTop - u1 + u2)), 2) * Sin(u2) - Cos(u2) * (1 - Cos(m1Top * u2) / m2Top) * Tanh(2 * (offsetRTop - u1 + u2)) -
            (m1Top * Sin(u2) * Sin(m1Top * u2) * Tanh(2 * (offsetRTop - u1 + u2))) / m2Top,
            -2 * Cos(u2) * (1 - Cos(m1Top * u2) / m2Top) * Power(Sech(2 * (offsetRTop - u1 + u2)), 2) + (1 - Cos(m1Top * u2) / m2Top) * Sin(u2) * Tanh(2 * (offsetRTop - u1 + u2)) -
            (m1Top * Cos(u2) * Sin(m1Top * u2) * Tanh(2 * (offsetRTop - u1 + u2))) / m2Top,
            -(m3Top * zIrregTop * Cos(m3Top * u2)) - cTanhTop * u2 * zScaleTop * Power(Sech(cTanhTop * (offsetZTop - u1 + u2)), 2) - zScaleTop * Tanh(cTanhTop * (offsetZTop - u1 + u2)));

        // console.log({lp})
        // console.log({rp})

        if (this.have_segmented_params()) {
            set_GA1_config({...bot_config, u1});
            for (const name in this.segmented_params)
                if (!!this.segmented_params[name])
                    add_to_array(G_derivatives[name](u1), rp, 3, -left_deriv(this.segmented_params[name], u2 - u1));

            set_GA1_config({...top_config, u1});
            for (const name in this.segmented_params)
                if (!!this.segmented_params[name])
                    add_to_array(G_derivatives[name](u2), rp, 9, -right_deriv(this.segmented_params[name], u2 - u1));
        }

        let A = new NDArray(lp);
        let X = new NDArray(rp);
        solve(A, X);

        const cc = X.toArray();

        this.set_cc(cc);
    }

}
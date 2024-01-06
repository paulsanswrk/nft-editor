import {SpiralViewFullControl_instance} from "../SpiralViewFullControl";
import EditorVM from "./EditorVM";

const spiral_view = SpiralViewFullControl_instance;


export default class EditorNumericVM extends EditorVM {
    param_min: number;

    constructor(param_name: string, param_min: number, param_max: number, steps?: number[]) {
        super(param_name);
        this.param_min = param_min;
        this.param_max = param_max;
        this.steps = steps;
    }

    param_max: number;
    steps?: number[];

    component_name = 'NumericEditor';

    param_get(): number {
        return Number(spiral_view.active_spiral.get_config()[this.param_name]);
    }

    param_get_serialized(): number {
        return Math.round(this.param_get() * 1000) / 1000;
    }

    format(v: number): string {
        if (v === undefined || v === null) return '';

        const n = Number(v);

        if (this.param_name === 'alpha' || this.param_name === 'beta') return `${(n / Math.PI).toFixed(3).replace(/\.?0+$/, '')} π`;

        return n.toFixed(3).replace(/\.?0+$/, '');
    }

    param_set(value: number | string, do_update_spiral = true) {
        spiral_view.active_spiral.set_config({[this.param_name]: Number(value)});
        spiral_view.active_spiral.need_recalc_z_bounds = true;

        if (do_update_spiral)
            spiral_view.update_spiral();
    }

    param_set_serialized(value: string, default_value: any) {
        this.param_set(value ?? default_value);
    }

    param_set_lerp(a: number, b: number, pos: number): void {
        const value = a + pos * (b - a);
        this.param_set(value, false);
    }
}

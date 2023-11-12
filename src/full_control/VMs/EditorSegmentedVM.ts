import EditorVM from "./EditorVM";
import {SpiralViewFullControl_instance} from "../SpiralViewFullControl";

const spiral_view = SpiralViewFullControl_instance;

export default class EditorSegmentedVM extends EditorVM {
    constructor(param_name: string) {
        super(param_name);
    }

    override get_active_spiral_config(): any {
        return spiral_view.active_spiral.get_segmented_param(this.param_name);
    }

    override set_active_spiral_config(value: any, do_update_spiral = true) {
        spiral_view.active_spiral.set_segmented_param(this.param_name, value);
        if (do_update_spiral)
            spiral_view.update_spiral();
    }

    param_get(): { pos: number; val: number }[] {
        // return spiral_view.active_spiral.get_config()[this.param_name];
        return this.get_active_spiral_config();
    }

    override param_get_serialized(): string {
        return this.param_get().map(s => `${(s.pos * 100).toFixed(0)}:${s.val}`).join('|');
    }

    param_set(segments: { pos: number, val: number }[]) {
        this.set_active_spiral_config(segments);
        // spiral_view.update_spiral();
        // spiral_view.active_spiral.set_config({[this.param_name]: segments})
    }

    param_set_serialized(param: any, default_value: any) {
        const segments: { val: string; pos: number }[] =
            Array.isArray(param) ? param :
                param?.split('|')
                    .map(s => s.split(':'))
                    .map(a => ({pos: Number(a[0]) / 100, val: Number(a[1])}));

        this.set_active_spiral_config(segments ?? default_value);
    }

    param_set_lerp(a: { pos: number, val: number }[], b: { pos: number, val: number }[], morphing_percent: number): void {
        const new_segments = a.map((s, n) => {
            const pos = a[n].pos + morphing_percent * (b[n].pos - a[n].pos);
            const val = a[n].val + morphing_percent * (b[n].val - a[n].val);
            return {pos, val};
        });

        this.param_set(new_segments);
    }

}

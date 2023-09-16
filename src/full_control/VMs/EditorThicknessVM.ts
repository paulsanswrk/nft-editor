import EditorVM from "./EditorVM";
import {SpiralViewFullControl_instance} from "../SpiralViewFullControl";

const spiral_view = SpiralViewFullControl_instance;

export class EditorThickness_G_VM extends EditorVM {

    component_name = 'ThicknessEditor';

    constructor(name: string = 'g_thickness') {
        super(name);
    }

    param_get(): { pos: number; val: number }[] {
        return spiral_view.active_spiral.get_config()[this.param_name];
    }

    override param_get_serialized(): string {
        return spiral_view.active_spiral.get_config()[this.param_name].map(s => `${(s.pos * 100).toFixed(0)}:${s.val}`).join('|');
    }

    param_set(segments: { pos: number, val: number }[]) {
        spiral_view.active_spiral.set_config({[this.param_name]: segments})
        spiral_view.update_spiral();
    }

    param_set_serialized(param: any, default_value: any) {
        const segments: { val: string; pos: number }[] =
            Array.isArray(param) ? param :
                param?.split('|')
                    .map(s => s.split(':'))
                    .map(a => ({pos: Number(a[0]) / 100, val: Number(a[1])}));

        spiral_view.active_spiral.set_config({[this.param_name]: segments ?? default_value});
        spiral_view.update_spiral();
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

export class EditorThickness_S_VM extends EditorThickness_G_VM {
    constructor() {
        super('s_thickness');
    }
}

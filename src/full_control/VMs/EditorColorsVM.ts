import EditorVM from "./EditorVM";
import {SpiralViewFullControl_instance} from "../SpiralViewFullControl";
import {Spiral_Base} from "../../base/Spiral_Base";

const spiral_view = SpiralViewFullControl_instance;

export class EditorColors_G_VM extends EditorVM {

    component_name = 'ColorsEditor';

    constructor() {
        super('g_colors');
    }

    protected get g_colors() {
        return spiral_view.active_spiral['g_colors'];
    }

    param_get(): { pos: number, val: string }[] {
        return this.g_colors.map(s => ({pos: s.pos, val: s.color}));
    }

    override param_get_serialized(): string {
        return spiral_view.active_spiral[this.param_name].map(s => `${(s.pos * 100).toFixed(0)}:${s.color}`).join('|');
    }

    param_set(segments: { pos: number, val: string }[]) {
        spiral_view.active_spiral['g_colors'] = segments.map(c => ({pos: c.pos, color: c.val}));

        spiral_view.update_colors();
    }

    param_set_serialized(segments: string, default_value: any) {
        spiral_view.active_spiral[this.param_name] = segments?.split('|')
                .map(s => s.split(':'))
                .map(a => ({pos: Number(a[0]) / 100, color: a[1]}))
            ?? default_value;

        spiral_view.update_colors();
    }

    param_set_lerp(a: { pos: number, val: string }[], b: { pos: number, val: string }[], morphing_percent: number): void {
        const new_segments = a.map((s, n) => {
            const pos = a[n].pos + morphing_percent * (b[n].pos - a[n].pos);
            const val = Spiral_Base.HSVA_Lerp(Spiral_Base.color4_to_hsva_array(a[n].val), Spiral_Base.color4_to_hsva_array(b[n].val), morphing_percent).toHexString();
            return {pos, val};
        });

        this.param_set(new_segments);
    }

}

export class EditorColors_S_VM
    extends EditorColors_G_VM {
    param_name = 's_colors';

    protected get s_colors() {
        return spiral_view.active_spiral['s_colors'];
    }

    param_get(): { pos: number, val: string }[] {
        const segments = [{pos: 0, color: '#000000ff'}, ...this.s_colors, {pos: 1, color: '#000000ff'}];
        return segments.map(s => ({pos: s.pos, val: s.color}));
    }

    param_set(segments: { pos: number, val: string }[]) {
        segments = segments.slice(1, -1);
        spiral_view.active_spiral['s_colors'] = segments.map(c => ({pos: c.pos, color: c.val}));

        spiral_view.update_colors();
    }

}

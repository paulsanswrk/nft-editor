import {SpiralViewFullControl_instance} from "./SpiralViewFullControl";
import EditorNumericVM from "./VMs/EditorNumericVM";
import {EditorColors_G_VM, EditorColors_S_VM} from "./VMs/EditorColorsVM";
import EditorVM from "./VMs/EditorVM";
import {forEach, mapValues, sortBy} from "lodash";
import EditorNumeric_BJS_VM from "./VMs/EditorNumeric_BJS_VM";
import EditorAnimPointsVM from "./VMs/EditorAnimPointsVM";
import {EditorThickness_G_VM, EditorThickness_S_VM} from "./VMs/EditorThicknessVM";
import {anim_points} from "./animation";
import EditorNumericOrSegmentedVM from "./VMs/EditorNumericOrSegmentedVM";
import EditorLighting_BJS_VM from "./VMs/EditorLighting_BJS_VM";

const spiral_view = SpiralViewFullControl_instance;


export class EditorsVM {

    all_models: { [k: string]: EditorVM } = {
        m1: new EditorNumericOrSegmentedVM('m1', 0, 30),
        m2: new EditorNumericOrSegmentedVM('m2', 0.1, 50),
        m3: new EditorNumericOrSegmentedVM('m3', -5, 5),
        z_Irreg: new EditorNumericOrSegmentedVM('z_Irreg', -6, 6),
        cTanh: new EditorNumericOrSegmentedVM('cTanh', -1, 1),
        at0: new EditorNumericVM('at0', -25, 8),
        at4: new EditorNumericVM('at4', 8.1, 50),
        camH: new EditorNumeric_BJS_VM('camH', -30, 30),
        fov: new EditorNumeric_BJS_VM('fov', 0.05, 5),
        rot_cnt: new EditorNumeric_BJS_VM('rot_cnt', 1, 20, [1]),
        u1: new EditorNumericVM('u1', -40, 17.5),
        u2: new EditorNumericVM('u2', 18, 60),
        offsetZ: new EditorNumericOrSegmentedVM('offsetZ', -80, 30),
        offsetR: new EditorNumericOrSegmentedVM('offsetR', -30, 10),
        zScale: new EditorNumericOrSegmentedVM('zScale', -2, 2),
        alpha: new EditorNumeric_BJS_VM('alpha', -700, 700, [Math.PI / 2, Math.PI / 20]),
        beta: new EditorNumeric_BJS_VM('beta', 0, 10, [Math.PI / 2, Math.PI / 20]),
        // tube_radius: new EditorNumericVM('tube_radius', 0, 0.02, [0.001]),
        inner_r: new EditorNumericVM('inner_r', 0, 40),
        smod_a: new EditorNumericOrSegmentedVM('smod_a', -5, 5),
        smod_f: new EditorNumericOrSegmentedVM('smod_f', 0.01, 40),
        g_colors: new EditorColors_G_VM(),
        s_colors: new EditorColors_S_VM(),
        anim_points: new EditorAnimPointsVM(),
        g_thickness: new EditorThickness_G_VM(),
        s_thickness: new EditorThickness_S_VM(),
        lighting: new EditorLighting_BJS_VM('lighting'),
    };

    all_params: string[] = sortBy(Object.keys(this.all_models), k => k);

    create_values(f: Function) {
        return Object.fromEntries(this.all_params.map(p => [p, f(p)]))
    }

    get_config(): { [p: string]: any } {
        return mapValues(this.all_models, v => v.param_get() as any);
    }

    set_config(config: { [p: string]: any }, defaults?: { [p: string]: any }) {
        defaults ??= spiral_view.spiral_factory.get_config();

        for (const k in this.all_models)
            if (config[k] !== undefined)
                this.all_models[k].param_set(config[k] ?? defaults[k] ?? spiral_view.defaults[k]);

    }

    get_config_serialized(): { [p: string]: string } {
        return mapValues(this.all_models, v => v.param_get_serialized());
    }

    get_curr_anim_point_serialized(): { [p: string]: string } {
        return (this.all_models['anim_points'] as EditorAnimPointsVM).param_get_curr_point_serialized();
    }

    set_config_serialized(config: { [p: string]: string }, spiral_defaults?: { [p: string]: any }) {
        spiral_defaults ??= spiral_view.spiral_factory.get_config();

        if (config.m3 === undefined) config.m3 = config.m1;

        for (const k in this.all_models) {
            this.all_models[k].param_set_serialized(config[k], spiral_defaults[k] ?? spiral_view.defaults[k]);
        }
    }

    set_curr_anim_point_serialized(config: { [p: string]: string }): void {
        (this.all_models['anim_points'] as EditorAnimPointsVM).param_set_curr_point_serialized(config);
    }

    set_config_lerp(a: { [p: string]: any }, b: { [p: string]: any }, pos: number, pos_w_easing: number) {
        for (const k in this.all_models)
            if (a[k] !== undefined)
                this.all_models[k].param_set_lerp(a[k], b[k], k === 'alpha' ? pos : pos_w_easing);

        spiral_view.update_spiral();
    }

    segments_count_match() {
        const g_colors_segment_cnt = anim_points.value[0].val.g_colors.length;
        const s_colors_segment_cnt = anim_points.value[0].val.s_colors.length;
        const g_thickness_segment_cnt = anim_points.value[0].val.g_thickness.length;
        const s_thickness_segment_cnt = anim_points.value[0].val.s_thickness.length;

        return !anim_points.value.some(p => p.val.g_colors.length != g_colors_segment_cnt)
            && !anim_points.value.some(p => p.val.s_colors.length != s_colors_segment_cnt)
            && !anim_points.value.some(p => p.val.g_thickness.length != g_thickness_segment_cnt)
            && !anim_points.value.some(p => p.val.s_thickness.length != s_thickness_segment_cnt);

    }

    active_spiral_changed() {
        forEach(this.all_models, m => m.active_spiral_changed());
    }
}

export const editor_models = new EditorsVM();

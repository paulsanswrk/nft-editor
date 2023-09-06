import {SpiralViewFullControl_instance} from "./SpiralViewFullControl";
import EditorNumericVM from "./VMs/EditorNumericVM";
import {EditorColors_G_VM, EditorColors_S_VM} from "./VMs/EditorColorsVM";
import EditorVM from "./VMs/EditorVM";
import {mapValues, sortBy} from "lodash";
import EditorNumeric_BJS_VM from "./VMs/EditorNumeric_BJS_VM";

const spiral_view = SpiralViewFullControl_instance;


export class EditorsVM {

    all_models: { [k: string]: EditorVM } = {
        m1: new EditorNumericVM('m1', 0, 30),
        m2: new EditorNumericVM('m2', 0.1, 30),
        z_Irreg: new EditorNumericVM('z_Irreg', -6, 6),
        cTanh: new EditorNumericVM('cTanh', -1, 1),
        at0: new EditorNumericVM('at0', -25, 8),
        at4: new EditorNumericVM('at4', 8.1, 50),
        camH: new EditorNumeric_BJS_VM('camH', -30, 30),
        fov: new EditorNumeric_BJS_VM('fov', 0.05, 5),
        rot_cnt: new EditorNumeric_BJS_VM('rot_cnt', 1, 20, [1]),
        u1: new EditorNumericVM('u1', -40, 17.5),
        u2: new EditorNumericVM('u2', 18, 60),
        offsetZ: new EditorNumericVM('offsetZ', -50, 30),
        offsetR: new EditorNumericVM('offsetR', -20, 10),
        beta: new EditorNumeric_BJS_VM('beta', 0, 10),
        tube_radius: new EditorNumericVM('tube_radius', 0, 0.02, [0.001]),
        inner_r: new EditorNumericVM('inner_r', 0, 40),
        g_colors: new EditorColors_G_VM(),
        s_colors: new EditorColors_S_VM(),
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

    set_config_serialized(config: { [p: string]: string }, defaults?: { [p: string]: any }) {
        defaults ??= spiral_view.spiral_factory.get_config();

        for (const k in this.all_models) {
            this.all_models[k].param_set_serialized(config[k], defaults[k] ?? spiral_view.defaults[k]);
        }
    }

    set_config_lerp(a: { [p: string]: any }, b: { [p: string]: any }, pos: number) {
        for (const k in this.all_models)
            if (a[k] !== undefined)
                this.all_models[k].param_set_lerp(a[k], b[k], pos);

        spiral_view.update_spiral();
    }

    color_segments_count_match(configs: { [p: string]: any }[]) {
        return !configs.some(c => c.g_colors.length != configs[0].g_colors.length) && !configs.some(c => c.s_colors.length != configs[0].s_colors.length);
    }
}


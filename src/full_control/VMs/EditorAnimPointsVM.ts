import EditorVM from "./EditorVM";
import {anim_points, current_anim_point_num} from "../animation";
import {SpiralViewFullControl_instance} from "../SpiralViewFullControl";
import {editor_models} from "../EditorsVM";

const spiral_view = SpiralViewFullControl_instance;

export default class EditorAnimPointsVM extends EditorVM {
    constructor() {
        super('anim_points');
    }

    component_name = 'AnimationPointsEditor';

    param_get(): any {
        // return undefined;
    }

    param_set(arg: any, do_update_spiral = true): void {
    }

    param_set_lerp(a: any, b: any, pos: number, do_update_spiral: boolean): void {
    }

    param_get_serialized(): string {
        return JSON.stringify(anim_points.value);
    }

    param_get_curr_point_serialized(): { [p: string]: string } {
        return anim_points.value[current_anim_point_num.value].val;
    }

    param_set_serialized(param: any, default_value: any, do_update_spiral = true): void {
        if (!param) return;

        const segments: { pos: number, val: { [k: string]: any } } [] = Array.isArray(param) ? param : JSON.parse(param);
        const spiral_defaults = spiral_view.spiral_factory.get_config();

        for (const segment of segments)
            for (const segmentKey in segment.val)
                segment.val[segmentKey] ??= spiral_defaults[segmentKey] ?? spiral_view.defaults[segmentKey];

        anim_points.value = segments;
        current_anim_point_num.value = 0;
    }

    param_set_curr_point_serialized(segment_val: { [k: string]: any }): void {
        if (!segment_val) return;

        delete segment_val['anim_points'];

        editor_models.set_config_serialized(segment_val);

        /*const spiral_defaults = spiral_view.spiral_factory.get_config();


        for (const segmentKey in segment_val)
            segment_val[segmentKey] ??= spiral_defaults[segmentKey] ?? spiral_view.defaults[segmentKey];

        anim_points.value[current_anim_point_num.value].val = segment_val;*/
    }
}
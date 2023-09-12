import EditorVM from "./EditorVM";
import {anim_points} from "../animation";
import {SpiralViewFullControl_instance} from "../SpiralViewFullControl";

const spiral_view = SpiralViewFullControl_instance;

export default class EditorAnimPointsVM extends EditorVM {
    constructor() {
        super('anim_points');
    }

    component_name = 'AnimationPointsEditor';

    param_get(): any {
        // return undefined;
    }

    param_set(arg: any): void {
    }

    param_set_lerp(a: any, b: any, pos: number): void {
    }

    param_get_serialized(): string {
        return JSON.stringify(anim_points.value);
    }

    param_set_serialized(param: any, default_value: any): void {
        if (!param) return;

        const segments: { pos: number, val: { [k: string]: any } } [] = param;
        const spiral_defaults = spiral_view.spiral_factory.get_config();

        for (const segment of segments)
            for (const segmentKey in segment.val)
                segment.val[segmentKey] ??= spiral_defaults[segmentKey] ?? spiral_view.defaults[segmentKey];

        anim_points.value = segments;
    }
}
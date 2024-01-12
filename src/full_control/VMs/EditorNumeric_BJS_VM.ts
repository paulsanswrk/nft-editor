import {SpiralViewFullControl_instance} from "../SpiralViewFullControl";
import EditorNumericVM from "./EditorNumericVM";

const spiral_view = SpiralViewFullControl_instance;


export default class EditorNumeric_BJS_VM extends EditorNumericVM {
    param_min: number;

    constructor(param_name: string, param_min: number, param_max: number, steps?: number[]) {
        super(param_name, param_min, param_max, steps);
    }

    param_get(): number {
        let res = 0;

        switch (this.param_name) {
            case 'camH':
                res = spiral_view.camera_h;
                break;
            case 'fov':
                res = spiral_view.camera_fov;
                break;
            case 'alpha':
                res = spiral_view.camera.alpha;
                break;
            case 'beta':
                res = spiral_view.camera.beta;
                break;
            case 'rot_cnt':
                return super.param_get();
            default:
                throw `EditorNumeric_BJS_VM.param_get with unknown param '${this.param_name}'`;
        }

        return Number(res);

    }

    param_set(value: number, do_update_spiral = true) {
        if (!do_update_spiral) return;

        switch (this.param_name) {
            case 'camH':
                spiral_view.camera_h = value;
                break;
            case 'fov':
                spiral_view.camera_fov = value;
                break;
            case 'rot_cnt':
                super.param_set(value);
                spiral_view.change_rot_cnt(value);
                break;
            case 'alpha':
                spiral_view.camera.alpha = value;
                break;
            case 'beta':
                spiral_view.camera.beta = value;
                break;
        }
    }
}

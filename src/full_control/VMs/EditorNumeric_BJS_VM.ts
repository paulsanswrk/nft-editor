import {SpiralViewFullControl_instance} from "../SpiralViewFullControl";
import EditorNumericVM from "./EditorNumericVM";

const spiral_view = SpiralViewFullControl_instance;


export default class EditorNumeric_BJS_VM extends EditorNumericVM {
    param_min: number;

    constructor(param_name: string, param_min: number, param_max: number, steps?: number[]) {
        super(param_name, param_min, param_max, steps);
    }

    param_get(): number {
        switch (this.param_name) {
            case 'camH':
                return spiral_view.camera_h;
            case 'fov':
                return spiral_view.camera_fov;
            case 'beta':
                return spiral_view.camera.beta;
            case 'rot_cnt':
                return super.param_get();
        }

        throw `EditorNumeric_BJS_VM.param_get with unknown param '${this.param_name}'`;
    }

    param_set(value: number) {
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
            case 'beta':
                spiral_view.camera.beta = value;
                break;
        }
    }
}

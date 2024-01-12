import {SpiralViewFullControl_instance} from "../SpiralViewFullControl";

const spiral_view = SpiralViewFullControl_instance;

export default abstract class EditorVM {
    get affects_geometry(): boolean {
        return false;
    }
    protected constructor(param_name: string) {
        this.param_name = param_name;
    }

    param_name: string;
    component_name: string;

    abstract param_get(): any;

    get_active_spiral_config(): any {
        return spiral_view.active_spiral.get_config()[this.param_name];
    }

    set_active_spiral_config(value: any, do_update_spiral = true) {
        spiral_view.active_spiral.set_config({[this.param_name]: value});
        if (do_update_spiral)
            spiral_view.update_spiral_geometry();
    }

    param_get_serialized(): any {
        return this.param_get();
    }

    active_spiral_changed() {
    }

    abstract param_set_serialized(param: string, default_value: any, do_update_spiral: boolean): void;

    abstract param_set(arg: any, do_update_spiral: boolean): void;

    abstract param_set_lerp(a: any, b: any, pos: number, do_update_spiral: boolean): void;


}

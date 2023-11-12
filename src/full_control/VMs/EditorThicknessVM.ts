import EditorVM from "./EditorVM";
import {SpiralViewFullControl_instance} from "../SpiralViewFullControl";
import EditorSegmentedVM from "./EditorSegmentedVM";

const spiral_view = SpiralViewFullControl_instance;

export class EditorThickness_G_VM extends EditorSegmentedVM {

    component_name = 'ThicknessEditor';

    constructor(name: string = 'g_thickness') {
        super(name);
    }

    override get_active_spiral_config(): any {
        return EditorVM.prototype.get_active_spiral_config.call(this);
    }

    override set_active_spiral_config(value: any, do_update_spiral: boolean = true) {
        EditorVM.prototype.set_active_spiral_config.call(this, value, do_update_spiral)
    }

}

export class EditorThickness_S_VM extends EditorThickness_G_VM {
    constructor() {
        super('s_thickness');
    }
}

import EditorVM from "./EditorVM";
import EditorNumericVM from "./EditorNumericVM";
import EditorSegmentedVM from "./EditorSegmentedVM";
import {avg_of_segments, is_segment_string} from "../../common/help_funcs";
import {SpiralViewFullControl_instance} from "../SpiralViewFullControl";

const spiral_view = SpiralViewFullControl_instance;

export default class EditorNumericOrSegmentedVM extends EditorVM {

    is_segmented = false;

    readonly editorNumericVM: EditorNumericVM | null = null;
    readonly editorSegmentedVM: EditorSegmentedVM | null = null;

    component_name = 'NumericOrSegmentedEditor';

    constructor(param_name: string, param_min: number, param_max: number, steps?: number[]) {
        super(param_name);
        this.editorNumericVM = new EditorNumericVM(param_name, param_min, param_max, steps);
        this.editorSegmentedVM = new EditorSegmentedVM(param_name); // + '_segmented'
    }

    private get editor(): EditorSegmentedVM | EditorNumericVM {
        return this.is_segmented ? this.editorSegmentedVM : this.editorNumericVM;
    }

    param_get(): any {
        return this.editor.param_get();
    }

    param_get_serialized(): any {
        return this.editor.param_get_serialized();
    }

    param_set(arg: number | { pos: number; val: number; }[]): void {
        if (Array.isArray(arg)) {
            this.is_segmented = true;
            this.editorSegmentedVM.param_set(arg);
            // spiral_view.active_spiral.set_segmented_param(this.param_name, arg)
        } else {
            this.is_segmented = false;
            this.editorNumericVM.param_set(arg, false);
            // spiral_view.active_spiral.set_segmented_param(this.param_name, null)
            this.editorSegmentedVM.param_set(null);
        }
        // spiral_view.update_spiral();
    }

    param_set_lerp(a: any, b: any, pos: number): void {
        this.editor.param_set_lerp(a, b, pos);
    }

    private param_remove_serialized() {
        spiral_view.active_spiral.set_segmented_param(this.param_name, null);
    }

    param_set_serialized(param: string, default_value: any): void {
        if (Array.isArray(param) || is_segment_string(param)) {
            this.is_segmented = true;
            this.editorSegmentedVM.param_set_serialized(param, default_value);
        } else {
            this.is_segmented = false;
            this.editorNumericVM.param_set_serialized(param, default_value);
            this.param_remove_serialized();
        }
    }

    toggle() {
        if (this.is_segmented) {
            this.editorNumericVM.param_set(avg_of_segments(this.editorSegmentedVM.param_get()));
            this.editorSegmentedVM.param_set(null);
            this.is_segmented = false;
        } else {
            const val = this.editorNumericVM.param_get();
            this.editorSegmentedVM.param_set([{pos: 0, val: val}, {pos: 1, val: val}]);
            this.is_segmented = true;
        }
    }

    override active_spiral_changed() {
        this.is_segmented = spiral_view.active_spiral.get_segmented_param(this.param_name) !== null;
    }

}
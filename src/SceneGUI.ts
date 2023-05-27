import * as GUI from "@babylonjs/gui";
import ISpiralParams from "./ISpiralParams";

export default class SceneGUI {
    params: ISpiralParams;

    constructor(params: ISpiralParams) {
        this.params = params;
    }

    private txt_m1 = new GUI.TextBlock();

    public m1_changed() {
        this.txt_m1.text = `m1: ${this.params.spiral_m1.toFixed(2)}`
    }

    init() {
        const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        const panel = new GUI.StackPanel();
        panel.width = "470px";
        panel.isVertical = true;
        panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        panel.color = "white";
        advancedTexture.addControl(panel);

        const header = new GUI.TextBlock();
        header.text = `Camera H: ${this.params.camera_h}`;
        header.height = "30px";
        header.color = "white";
        panel.addControl(header);

        const slider = new GUI.Slider();
        slider.minimum = 0;
        slider.maximum = 16;
        slider.value = this.params.camera_h;
        slider.background = "white";
        slider.color = "blue";
        slider.height = "20px";
        slider.width = "450px";
        slider.onValueChangedObservable.add(function (value) {
            header.text = `Camera H: ${value.toFixed(2)}`;
            this.params.camera_h = value;
        });
        panel.addControl(slider);

        const text1 = this.txt_m1;
        text1.text = `m1: ${this.params.spiral_m1.toFixed(2)}`;
        text1.height = "30px";
        text1.color = "white";
        text1._offsetTop(80);
// text1.fontSize = 24;
        panel.addControl(text1);
    }
}
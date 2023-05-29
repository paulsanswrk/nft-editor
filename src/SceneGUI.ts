import * as GUI from "@babylonjs/gui";
import ISpiralParams from "./ISpiralParams";

export default class SceneGUI {
    params: ISpiralParams;

    constructor(params: ISpiralParams) {
        this.params = params;
    }

    private txt_m1 = new GUI.TextBlock();

    public m1_changed(v: number) {
        this.txt_m1.text = `m1: ${v.toFixed(1)}`
    }

    init() {
        const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        const panel = new GUI.StackPanel();
        panel.width = "1200px";
        panel.height = "70px";
        panel.isVertical = false;
        panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        panel.color = "white";
        advancedTexture.addControl(panel);

        /* const header = new GUI.TextBlock();
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
         panel.addControl(slider);*/

        const text1 = this.txt_m1;
        text1.text = `m1: ${this.params.spiral_m1.toFixed(2)}`;
        text1.height = "30px";
        text1.width = "100px";
        text1.color = "white";
        // text1._offsetTop(80);
// text1.fontSize = 24;
        panel.addControl(text1);

        for (let n = 0; n < this.params.configs_count; n++) {
            const button = GUI.Button.CreateSimpleButton(`btn_${n}`, this.params.spirals[n].m1.toFixed(1));
            button.width = "50px";
            button.height = "20px";
            // button.color = "white";
            // button.background = "green";
            // button.top = '200px';
            // button.left = '200px';
            panel.addControl(button);

            button.onPointerClickObservable.add(() => {
                this.params.switch_spiral_to(n);
            });
        }
    }
}
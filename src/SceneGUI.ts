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

        const item_cnt = this.params.configs_count;
        const max_cols = 20;
        const row_cnt = Math.ceil(item_cnt / max_cols);
        const panel_h = 25;
        let n_item = 0;

        for (let n_row = 0; n_row < row_cnt; n_row++) {

            const panel = new GUI.StackPanel();
            panel.width = "1200px";
            panel.height = `${panel_h}px`;
            panel.isVertical = false;
            panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
            panel.top = n_row * panel_h;
            panel.color = "white";
            advancedTexture.addControl(panel);

            if (n_row === 0) {
                const text1 = this.txt_m1;
                text1.text = `m1: ${this.params.spiral_m1.toFixed(2)}`;
                text1.height = "30px";
                text1.width = "100px";
                text1.color = "white";
                panel.addControl(text1);
            }

            for (let n_col = 0; n_col < max_cols && this.params.spirals[n_item]; n_col++) {
                const button = GUI.Button.CreateSimpleButton(`btn_${n_item}`, this.params.spirals[n_item].m1.toFixed(1));
                button.width = "50px";
                button.height = "20px";
                panel.addControl(button);

                const n = n_item;

                button.onPointerClickObservable.add(() => {
                    this.params.switch_spiral_to(n);
                });

                n_item++;
            }
        }

        window.addEventListener("resize", () => {
            advancedTexture.scaleTo(innerWidth, innerHeight);
        });
    }
}
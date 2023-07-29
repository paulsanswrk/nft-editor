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

    private readonly hw_scaling_level = true;
    private readonly camera_h = false;
    private readonly camera_speed = false;
    private readonly auto_advance = false;
    private readonly m1_buttons = false;

    init() {
        const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        if (this.hw_scaling_level) {
            const panel = new GUI.StackPanel();
            panel.width = "100%";
            panel.height = `50px`;
            panel.top = `20px`;
            panel.isVertical = false;
            panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
            advancedTexture.addControl(panel);

            let header = new GUI.TextBlock();
            header.text = `Scaling: ${this.params.hw_scaling_level}`;
            header.height = "30px";
            header.width = "200px";
            header.color = "white";
            panel.addControl(header);

            const slider = new GUI.Slider();
            slider.minimum = .1;
            slider.maximum = 1;
            slider.value = this.params.hw_scaling_level;
            slider.background = "white";
            slider.color = "blue";
            slider.height = "20px";
            slider.width = "60%";
            slider.onValueChangedObservable.add(value => {
                header.text = `Scaling: ${value.toFixed(2)}`;
                this.params.hw_scaling_level = value;
            });
            panel.addControl(slider);
        }

        if (this.camera_h) {
            const panel = new GUI.StackPanel();
            panel.width = "1500px";
            panel.height = `50px`;
            panel.top = `-20px`;
            panel.isVertical = false;
            panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

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
        }

        if (this.camera_speed) {
            const panel = new GUI.StackPanel();
            panel.width = "1500px";
            panel.height = `50px`;
            panel.top = `-20px`;
            panel.isVertical = false;
            panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            advancedTexture.addControl(panel);

            let header = new GUI.TextBlock();
            header.text = `Camera speed: ${this.params.camera_speed}`;
            header.height = "30px";
            header.width = "200px";
            header.color = "white";
            panel.addControl(header);

            const slider = new GUI.Slider();
            slider.minimum = -0.5;
            slider.maximum = 0;
            slider.value = this.params.camera_speed;
            slider.background = "white";
            slider.color = "blue";
            slider.height = "20px";
            slider.width = "1000px";
            slider.onValueChangedObservable.add(value => {
                header.text = `Camera speed: ${value.toFixed(2)}`;
                this.params.camera_speed = value;
            });
            panel.addControl(slider);

            if (this.auto_advance) {
                const chk_auto_advance = new GUI.Checkbox();
                chk_auto_advance.isChecked = true; // this.params.auto_change;
                chk_auto_advance.width = "20px";
                chk_auto_advance.height = "20px";
                chk_auto_advance.color = "white";
                chk_auto_advance.onIsCheckedChangedObservable.add(v => {
                    this.params.auto_change = v;
                });
                panel.addControl(chk_auto_advance);

                header = new GUI.TextBlock();
                header.text = "Auto advance";
                header.width = "180px";
                header.paddingLeft = 5;
                header.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                header.color = "white";
                panel.addControl(header);
            }
        }

        if (this.m1_buttons) {
            const item_cnt = this.params.configs_count;
            const max_cols = 20;
            const row_cnt = Math.ceil(item_cnt / max_cols);
            const panel_h = 50;
            let n_item = 0;

            for (let n_row = 0; n_row < row_cnt; n_row++) {

                const panel = new GUI.StackPanel();
                panel.width = "1500px";
                panel.height = `${panel_h}px`;
                panel.isVertical = false;
                panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                panel.top = n_row * panel_h;
                panel.color = "white";
                advancedTexture.addControl(panel);

                if (n_row === 0) {
                    const text1 = this.txt_m1;
                    text1.text = `m1: ${this.params.spiral_m1.toFixed(1)}`;
                    text1.height = `${panel_h}px`;
                    text1.width = "125px";
                    text1.color = "white";
                    text1.fontSize = panel_h / 2;
                    panel.addControl(text1);
                }

                for (let n_col = 0; n_col < max_cols && this.params.spirals[n_item]; n_col++) {
                    const button = GUI.Button.CreateSimpleButton(`btn_${n_item}`, this.params.spirals[n_item].m1.toFixed(1));
                    button.width = `${panel_h * 1.2}px`;
                    button.fontSize = panel_h / 2;
                    button.height = `${panel_h * 0.7}px`;
                    panel.addControl(button);

                    const n = n_item;

                    button.onPointerClickObservable.add(() => {
                        this.params.switch_spiral_to({n_config: n});
                    });

                    n_item++;
                }
            }
        }


        window.addEventListener("resize", () => {
            advancedTexture.scaleTo(innerWidth, innerHeight);
        });
    }
}
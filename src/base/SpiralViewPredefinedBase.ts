// import { Inspector } from '@babylonjs/inspector';
import ISpiralParams from "../ISpiralParams";
import SceneGUI from "../SceneGUI";
import {Spiral_Predefined_Base} from "./Spiral_Predefined_Base";
import SpiralViewBase from "./SpiralViewBase";
import {Spiral_Config} from "./Spiral_Base";

export abstract class SpiralViewPredefinedBase extends SpiralViewBase implements ISpiralParams {

    protected abstract spiral_factory: Spiral_Predefined_Base;
    spirals: Spiral_Predefined_Base[];

    /// #if CONTROLS
    gui = new SceneGUI(this);

    /// #endif

    protected init_spirals() {
        this.spirals = Array.from(Array(this.spiral_factory.config_len), () => 0).map((s, n) => this.spiral_factory.create_spiral({n_config: n}));
    }

    protected init_additional() {
        /// #if CONTROLS
        this.gui.init();
        /// #endif

        this.auto_change = true;
    }

    click_handler(p, pick) {
        this.last_click_time = new Date();
        // return;

        const screenWidth = this.canvas.clientWidth;
        const screenHeight = this.canvas.clientHeight;
        const screenCenterX = screenWidth / 2;
        const screenCenterY = screenHeight / 2;

        // console.log(screenWidth, screenHeight, arguments);

        const pointX = p.x;
        const pointY = p.y;

        const distance = Math.sqrt((pointX - screenCenterX) ** 2 + (pointY - screenCenterY) ** 2);

        const maxDistance = Math.sqrt(screenWidth ** 2 + screenHeight ** 2) / 2;
        const scaledDistance = distance / maxDistance * this.spiral_factory.config_len;

        let n = Math.round(scaledDistance);
        n = Math.min(n, this.spiral_factory.config_len - 1);
        this.switch_spiral_to({n_config: n});
        // console.log(n, Spiral_Top.all_configs.length, this.targets.map(t => t.influence), this.do_transition, this.spirals[this.new_n].m1);
        // this.camera.autoRotationBehavior.resetLastInteractionTime(0);


        if (pick.hit) {
            // console.log(pick.pickedPoint.z)
            // handle_z_click(pick.pickedPoint.z)
            // console.log(pick.pickedPoint)
        }
    }

    switch_spiral_to(config: Spiral_Config) {
        const n = config.n_config;

        if (this.do_transition || n === this.new_n) return;
        // console.log('switch to', n);

        // this.create_spiral_mesh(n, this.spirals[n]);
        this.curr_n = this.new_n;
        this.new_n = n;
        this.do_transition = true;

        /// #if CONTROLS
        this.notify_gui({m1: this.spirals[this.new_n].m1})
        /// #endif
    }

    protected post_transition() {
        /*for (let n = 0; n < this.spiral_factory.config_len; n++) {
            if (n === this.start_n) continue;
            if (this.meshes[n]?.length) {
                // console.log('remove', n)

                this.meshes[n].forEach(m => m.dispose());
                delete this.meshes[n];
            }
            if (this.targets[n]) {
                // this.manager.removeTarget(this.targets[n]);
                // delete this.targets[n];
            }
        }*/
    }

    get configs_count(): number {
        return this.spiral_factory.config_len;
    }

    private _auto_change = false;
    private is_first_auto_change = true;
    private _auto_change_interval = 0;
    auto_change_time_sec = 5;
    auto_change_time2_sec = 15;
    no_auto_change_after_click_sec = 60;

    get auto_change(): boolean {
        return this._auto_change;
    }

    set auto_change(v) {
        this._auto_change = v;

        if (this._auto_change)
            this._auto_change_interval = window.setInterval(() => this.handle_auto_change(), this.auto_change_time_sec * 1000);
        else window.clearInterval(this._auto_change_interval);
    }

    protected handle_auto_change() {
        // console.log(new Date().getTime() - this.last_click_time.getTime(), this.no_auto_change_after_click_sec * 1000)
        if ((new Date().getTime() - this.last_click_time.getTime()) < this.no_auto_change_after_click_sec * 1000) return;

        const new_n_opts = this.spirals.map((x, n) => n)
            .filter(n => n != this.curr_n && n != this.new_n);
        this.fisherYates(new_n_opts);
        const new_n = new_n_opts[0];

        this.switch_spiral_to({n_config: new_n});

        if (this.is_first_auto_change) {
            this.is_first_auto_change = false;
            this.auto_change = false;
            this.auto_change_time_sec = this.auto_change_time2_sec;
            this.auto_change = true;
        }

    }

    get spiral_m1(): number {
        return this.spirals[this.curr_n].m1;
    }

    notify_gui(changes: Spiral_Config) {
        /// #if CONTROLS
        this.gui.m1_changed(this.spirals[this.new_n].m1);
        /// #endif
    }

    fisherYates(array: number[]) {
        let count = array.length, random_number, temp;
        while (count) {
            random_number = Math.random() * count-- | 0;
            temp = array[count];
            array[count] = array[random_number];
            array[random_number] = temp
        }
    }

}


import {ArcRotateCamera} from "@babylonjs/core/Cameras/arcRotateCamera"
import {Engine} from "@babylonjs/core/Engines/engine"
import {MeshBuilder} from "@babylonjs/core/Meshes/meshBuilder"
import {Scene} from "@babylonjs/core/scene"
import {Vector3} from "@babylonjs/core/Maths/math.vector"
import * as BABYLON from "@babylonjs/core";
import {Color3, DirectionalLight, Mesh, StandardMaterial} from "@babylonjs/core";
// import { Inspector } from '@babylonjs/inspector';
import {Inspector} from '@babylonjs/inspector';
import {MorphTarget} from '@babylonjs/core/Legacy/legacy';
import ISpiralParams from "../ISpiralParams";
import SceneGUI from "../SceneGUI";
import {Spiral_Base} from "./Spiral_Base";

export abstract class SpiralViewBase implements ISpiralParams {

    protected abstract spiral_factory: Spiral_Base;
    // curr_n = 14; //m1 == 8.6
    curr_n = 0;
    new_n: number;
    start_n: number;
    do_transition = false;
    spirals: Spiral_Base[];

    canvas = document.getElementById("view") as HTMLCanvasElement;
    engine = new Engine(this.canvas, true, {}, true);
    scene = new Scene(this.engine);

    /// #if CONTROLS
    gui = new SceneGUI(this);
    /// #endif

    camera: ArcRotateCamera;

    manager = new BABYLON.MorphTargetManager();
    meshes: Mesh[][] = [];
    targets: MorphTarget[] = [];
    spiralMaterial = new StandardMaterial("spiralMaterial", this.scene);
    // randomColor = Color3.White();
    // curr_mesh =

    // bulbLight = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(0, 0, 15), this.scene);


    light: DirectionalLight;

    private numberOfTimes: number = 0;

    protected abstract setup_camera();

    public init() {
        this.start_n = this.new_n = this.curr_n;
        this.spirals = Array.from(Array(this.spiral_factory.config_len), () => 0).map((s, n) => this.spiral_factory.create_spiral(n));

        this.setup_camera();

        this.scene.clearColor = new BABYLON.Color4(0, 0, 0);
        // this.scene.performancePriority = ScenePerformancePriority.Aggressive;

        this.camera.attachControl(this.canvas);


        /*this.spiralMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        this.spiralMaterial.emissiveColor = this.randomColor;*/

        this.scene.registerBeforeRender(() => this.render_handler());
        this.engine.setHardwareScalingLevel(this.engine.getHardwareScalingLevel() * 0.7);
        // this.engine.adaptToDeviceRatio = true;
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        /// #if CONTROLS
        this.gui.init();
        /// #endif

        this.scene.onPointerUp = (evt, pickInfo) => this.click_handler(evt, pickInfo);


        // this.create_spiral_mesh(this.curr_n, this.spirals[this.curr_n]);
        this.spirals.forEach((s, n) => this.create_spiral_mesh(n, s));

        // this.scene.freezeActiveMeshes();
        // this.scene.blockMaterialDirtyMechanism = true;
        this.scene.getAnimationRatio();

        /// #if INSPECTOR
        Inspector.Show(this.scene, {
            overlay: true,
        });
        /// #endif

        // Watch for browser/canvas resize events
        window.addEventListener("resize", () => this.numberOfTimes = 5);

        this.auto_change = true;
    }


    create_spiral_mesh(n_config, spiral: Spiral_Base) {
        if (this.meshes[n_config]) return;

        const mesh: Mesh = MeshBuilder.CreateTube(`spiral_${n_config}`, {
            path: spiral.spiralPoints,
            radius: 0.006,
            updatable: false,
            tessellation: 4,
        }, this.scene);

        this.meshes[n_config] = [mesh];

        this.spiralMaterial.specularColor = Color3.Black();
        mesh.freezeNormals();

        mesh.setEnabled(n_config == this.curr_n);
        // if (n == this.curr_n)
        mesh.setVerticesData("color", spiral.calc_colors(mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind)));

        // this.spiralMaterial.freeze();
        // mesh.doNotSyncBoundingInfo = true;

        this.spiralMaterial.disableLighting = true;
        this.spiralMaterial.emissiveColor = BABYLON.Color3.White();
        this.spiralMaterial.reservedDataStore = {hidden: true, isVertexColorMaterial: true};
        mesh.useVertexColors = true;
        mesh.material = this.spiralMaterial;

        mesh.morphTargetManager = this.manager;
        this.targets[n_config] = BABYLON.MorphTarget.FromMesh(mesh, `spiral_${n_config}`, 0);
        this.manager.addTarget(this.targets[n_config]);

        for (let n_rot = 1; n_rot < spiral.rot_cnt; n_rot++) {
            const clone = mesh.clone();
            clone.rotate(new Vector3(0, 0, 1), 2 * Math.PI / spiral.rot_cnt * n_rot).name = `${mesh.name} rot ${n_rot}`;
            this.meshes[n_config].push(clone);
        }

        return mesh;
    }

    render_handler() {
        if (this.numberOfTimes--) {
            this.engine.resize();
        }

        const di = 0.01;

        if (this.do_transition) {
            let finished = true;

            this.targets.forEach(
                (target, n) => {
                    if (n == this.new_n) {
                        if (Math.abs(target.influence - 1) < di)
                            target.influence = 1;
                        else {
                            target.influence += di;
                            finished = false;
                        }
                    } else {
                        if (Math.abs(target.influence) < di)
                            target.influence = 0;
                        else {
                            target.influence -= di;
                            finished = false;
                        }
                    }
                }
            );

            /*if (finished) {
                for (let n = 0; n < this.spiral_factory.config_len; n++) {
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
                }
            }*/

            this.do_transition = !finished;
        }

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
        this.switch_spiral_to(n);
        // console.log(n, Spiral_Top.all_configs.length, this.targets.map(t => t.influence), this.do_transition, this.spirals[this.new_n].m1);
        // this.camera.autoRotationBehavior.resetLastInteractionTime(0);


        if (pick.hit) {
            // console.log(pick.pickedPoint.z)
            // handle_z_click(pick.pickedPoint.z)
            // console.log(pick.pickedPoint)
        }
    }

    switch_spiral_to(n: number) {
        if (this.do_transition || n === this.new_n) return;
        // console.log('switch to', n);

        // this.create_spiral_mesh(n, this.spirals[n]);
        this.curr_n = this.new_n;
        this.new_n = n;
        this.do_transition = true;

        /// #if CONTROLS
        this.gui.m1_changed(this.spirals[this.new_n].m1);
        /// #endif
    }

    get configs_count(): number {
        return this.spiral_factory.config_len;
    }

    get camera_h(): number {
        return this.camera.radius;
    }

    set camera_h(v) {
        this.camera.radius = v;
    }

    get camera_speed(): number {
        return this.camera.autoRotationBehavior.idleRotationSpeed;
    }

    set camera_speed(v) {
        this.camera.autoRotationBehavior.idleRotationSpeed = v;
    }

    private _auto_change = false;
    private is_first_auto_change = true;
    private _auto_change_interval = 0;
    auto_change_time_sec = 5;
    auto_change_time2_sec = 15;
    no_auto_change_after_click_sec = 60;
    private last_click_time: Date = new Date(0);

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

        this.switch_spiral_to(new_n);

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

    fisherYates(array: number[]) {
        var count = array.length, randomnumber, temp;
        while (count) {
            randomnumber = Math.random() * count-- | 0;
            temp = array[count];
            array[count] = array[randomnumber];
            array[randomnumber] = temp
        }
    }

    get hw_scaling_level(): number {
        return this.engine.getHardwareScalingLevel();
    }

    set hw_scaling_level(v: number) {
        this.engine.setHardwareScalingLevel(v);
    }

}


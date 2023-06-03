import {ArcRotateCamera} from "@babylonjs/core/Cameras/arcRotateCamera"
import {Engine} from "@babylonjs/core/Engines/engine"
import {MeshBuilder} from "@babylonjs/core/Meshes/meshBuilder"
import {Scene} from "@babylonjs/core/scene"
import {Vector3} from "@babylonjs/core/Maths/math.vector"
import * as BABYLON from "@babylonjs/core";
// import { Inspector } from '@babylonjs/inspector';
import { Inspector } from '@babylonjs/inspector';
import {Color3, DirectionalLight, Mesh, StandardMaterial} from "@babylonjs/core";
import {MorphTarget} from '@babylonjs/core/Legacy/legacy';
import ISpiralParams from "../ISpiralParams";
import SceneGUI from "../SceneGUI";
import {Spiral_Base} from "./Spiral_Base";

export abstract class SpiralViewBase implements ISpiralParams {

    protected abstract spiral_factory: Spiral_Base;
    // curr_n = 14; //m1 == 8.6
    curr_n = 0;
    new_n = this.curr_n;
    do_transition = false;
    spirals: Spiral_Base[];

    view = document.getElementById("view") as HTMLCanvasElement;
    engine = new Engine(this.view, true, {}, true);
    scene = new Scene(this.engine);

    /// #if CONTROLS
    gui = new SceneGUI(this);
    /// #endif

    camera: ArcRotateCamera;

    manager = new BABYLON.MorphTargetManager();
    meshes: Mesh[] = [];
    targets: MorphTarget[] = [];
    spiralMaterial = new StandardMaterial("spiralMaterial", this.scene);
    // randomColor = Color3.White();
    // curr_mesh =

    // bulbLight = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(0, 0, 15), this.scene);


    light: DirectionalLight;

    private numberOfTimes: number = 0;

    protected abstract setup_camera();

    public init() {
        this.spirals = Array.from(Array(this.spiral_factory.config_len), () => 0).map((s, n) => this.spiral_factory.create_spiral(n));

        this.setup_camera();

        this.scene.clearColor = new BABYLON.Color4(0, 0, 0);

        this.camera.attachControl(this.view);


        /*this.spiralMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        this.spiralMaterial.emissiveColor = this.randomColor;*/

        this.scene.registerBeforeRender(() => this.render_handler());

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        /// #if CONTROLS
        this.gui.init();
        /// #endif

        this.scene.onPointerUp = (evt, pickInfo) => this.click_handler(evt, pickInfo);


        this.create_spiral_mesh(this.curr_n, this.spirals[this.curr_n]);

        /// #if CONTROLS
        Inspector.Show(this.scene, {
            overlay: true,
        });
        /// #endif

        // Watch for browser/canvas resize events
        window.addEventListener("resize", () => this.numberOfTimes = 5);

    }


    create_spiral_mesh(n, spiral: Spiral_Base) {
        const mesh: Mesh = MeshBuilder.CreateTube(`spiral_${n}`, {
            path: spiral.spiralPoints,
            radius: 0.006,
            updatable: false,
            tessellation: 4,
        }, this.scene);

        this.meshes[n] = mesh;

        mesh.material = this.spiralMaterial;
        this.spiralMaterial.specularColor = Color3.Black();
        mesh.freezeNormals();

        mesh.setEnabled(n == this.curr_n);
        // if (n == this.curr_n)
        mesh.setVerticesData("color", spiral.calc_colors(mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind)));
        mesh.morphTargetManager = this.manager;
        this.targets[n] = BABYLON.MorphTarget.FromMesh(mesh, `spiral_${n}`, 0);
        this.manager.addTarget(this.targets[n]);

        for (let n = 1; n < spiral.nRot; n++)
            mesh.clone().rotate(new Vector3(0, 0, 1), 2 * Math.PI / spiral.nRot * n).name = `${mesh.name} rot ${n}`;

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
                for (let n = 0; n < Spiral_Top.config_len; n++) {
                    if (n === this.curr_n || n === this.new_n) continue;
                    if (this.meshes[n]) {
                        this.meshes[n].dispose();
                        delete this.meshes[n];
                    }
                    if (this.targets[n]) {
                        this.manager.removeTarget(this.targets[n]);
                        delete this.targets[n];
                    }
                }
            }*/

            this.do_transition = !finished;
        }

    }

    click_handler(p, pick) {
        return;

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const screenCenterX = screenWidth / 2;
        const screenCenterY = screenHeight / 2;

        const pointX = p.pageX;
        const pointY = p.pageY;

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

        this.create_spiral_mesh(n, this.spirals[n]);
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

    get spiral_m1(): number {
        return this.spirals[this.curr_n].m1;
    }

}


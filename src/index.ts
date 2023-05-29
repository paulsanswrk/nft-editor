import {ArcRotateCamera} from "@babylonjs/core/Cameras/arcRotateCamera"
import {Engine} from "@babylonjs/core/Engines/engine"
import {MeshBuilder} from "@babylonjs/core/Meshes/meshBuilder"
import {Scene} from "@babylonjs/core/scene"
import {Vector3} from "@babylonjs/core/Maths/math.vector"
import * as BABYLON from "@babylonjs/core";
import {Color3, Mesh, StandardMaterial} from "@babylonjs/core";
import {MorphTarget} from '@babylonjs/core/Legacy/legacy';
import {Spiral_Top} from "./Spiral_Top";
import ISpiralParams from "./ISpiralParams";
import SceneGUI from "./SceneGUI";
import {Inspector} from '@babylonjs/inspector';

class SpiralView implements ISpiralParams {

    curr_n = 16;
    new_n = this.curr_n;
    do_transition = false;
    spirals = Spiral_Top.all_configs.map((s, n) => new Spiral_Top(n));

    view = document.getElementById("view") as HTMLCanvasElement;
    engine = new Engine(this.view, true);
    scene = new Scene(this.engine);

    gui = new SceneGUI(this);

    camera = new ArcRotateCamera(
        "camera",
        Math.PI / 2,
        0,
        8,
        new Vector3(0, 0, 3),
        this.scene);

    manager = new BABYLON.MorphTargetManager();
    // meshes: Mesh[] = [];
    // targets: MorphTarget[] = [];
    spiralMaterial = new StandardMaterial("spiralMaterial", this.scene);
    // randomColor = Color3.White();
    curr_mesh: Mesh = this.create_spiral_mesh(this.curr_n, this.spirals[this.curr_n]);
    new_mesh: Mesh;

    curr_target: MorphTarget;
    new_target: MorphTarget;

    // bulbLight = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(0, 0, 15), this.scene);
// bulbLight.diffuse = randomColor
// bulbLight.specular = randomColor
// bulbLight.position.copyFrom(curr_mesh.position);

    light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0, 0, -1), this.scene);

    // light2 = new BABYLON.SpotLight("SpotLight", new BABYLON.Vector3(0, 0, 5), new BABYLON.Vector3(0, 0, -10), 90, 2, this.scene);

    public init() {
        this.scene.clearColor = new BABYLON.Color4(0, 0, 0);

        this.camera.attachControl(this.view);
        this.camera.upVector = new Vector3(0, 0, 1);
        this.camera.lowerBetaLimit = 0;

        this.camera.useAutoRotationBehavior = true;
// camera.rotation = new Vector3(0,0,1);

        this.camera.autoRotationBehavior.idleRotationSpeed = -0.05;
        this.camera.autoRotationBehavior.idleRotationWaitTime = 0;
        this.camera.autoRotationBehavior.zoomStopsAnimation = false;

        this.camera.inertia = 0;

        /*this.spiralMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        this.spiralMaterial.emissiveColor = this.randomColor;*/

        this.scene.registerBeforeRender(() => this.render_handler());

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        // this.manager.

        // this.gui.init();
        this.scene.onPointerUp = (evt, pickInfo) => this.click_handler(evt, pickInfo);

        this.light.diffuse = new BABYLON.Color3(1, 1, 1);
        this.light.specular = new BABYLON.Color3(1, 1, 1);
        this.light.intensity = 5;
        // this.light.groundColor = new BABYLON.Color3(0, 1, 0);

        Inspector.Show(this.scene, {
            overlay: true,
        });
    }


    create_spiral_mesh(n, spiral: Spiral_Top, enabled: boolean = true) {
        const mesh: Mesh = MeshBuilder.CreateTube(`spiral_${n}`, {
            path: spiral.spiralPoints,
            radius: 0.006,
            updatable: false,
            tessellation: 4,
        }, this.scene);

        // this.meshes[n] = mesh;

        mesh.material = this.spiralMaterial;
        this.spiralMaterial.specularColor = Color3.Black();
        mesh.freezeNormals();

        // if (n == this.curr_n)
        mesh.setVerticesData("color", spiral.calc_colors(mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind)));
        // this.targets[n] = MorphTarget.FromMesh(mesh, `spiral_${n}`, 0);
        // this.manager.addTarget(this.targets[n]);

        const meshes = [mesh];

        for (let n = 1; n < spiral.nRot; n++) {
            const clone = mesh.clone();
            clone.rotate(new Vector3(0, 0, 1), 2 * Math.PI / spiral.nRot * n);
            clone.name = `${mesh.name} rot ${n}`;
            meshes.push(clone);
        }

        const merged_mesh = BABYLON.Mesh.MergeMeshes(meshes, undefined, true, undefined, true, undefined);
        merged_mesh.morphTargetManager = this.manager;
        merged_mesh.setEnabled(enabled);

        return merged_mesh;
    }

    render_handler() {
        const di = 0.01;

        if (this.do_transition) {
            let finished = true;

            if (Math.abs(this.new_target.influence - 1) < di)
                this.new_target.influence = 1;
            else {
                this.new_target.influence += di;
                finished = false;
            }

            if (Math.abs(this.curr_target.influence) < di)
                this.curr_target.influence = 0;
            else {
                this.curr_target.influence -= di;
                finished = false;
            }

            if (finished) {
                this.manager.removeTarget(this.curr_target);
                this.manager.removeTarget(this.new_target);

                this.curr_mesh.dispose();
                this.curr_mesh = this.new_mesh;
                this.curr_mesh.setEnabled(true);
            }


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
        if(this.do_transition) return;

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const screenCenterX = screenWidth / 2;
        const screenCenterY = screenHeight / 2;

        const pointX = p.pageX;
        const pointY = p.pageY;

        const distance = Math.sqrt((pointX - screenCenterX) ** 2 + (pointY - screenCenterY) ** 2);

        const maxDistance = Math.sqrt(screenWidth ** 2 + screenHeight ** 2) / 2;
        const scaledDistance = distance / maxDistance * Spiral_Top.config_len;

        let n = Math.round(scaledDistance);
        n = Math.min(n, Spiral_Top.all_configs.length - 1);
        if (n != this.new_n) {
            this.new_n = n;

            this.curr_target = MorphTarget.FromMesh(this.curr_mesh, `spiral_${this.curr_n}`, 1);
            this.new_mesh = this.create_spiral_mesh(n, this.spirals[n], false);
            this.new_target = MorphTarget.FromMesh(this.new_mesh, `spiral_${this.new_n}`, 0);
            this.manager.addTarget(this.curr_target);
            this.manager.addTarget(this.new_target);
            this.curr_n = this.new_n;
            this.do_transition = true;
            this.gui.m1_changed();
        }
        // console.log(n, Spiral_Top.all_configs.length, this.targets.map(t => t.influence), this.do_transition, this.spirals[this.new_n].m1);
        // this.camera.autoRotationBehavior.resetLastInteractionTime(0);


        if (pick.hit) {
            // console.log(pick.pickedPoint.z)
            // handle_z_click(pick.pickedPoint.z)
            // console.log(pick.pickedPoint)
        }
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


    /*scene.onPointerObservable.add(function (pointerInfo) {
        switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERDOWN:
                console.log("POINTER DOWN");
                break;
            case BABYLON.PointerEventTypes.POINTERUP:
                console.log("POINTER UP", arguments);
                break;
            case BABYLON.PointerEventTypes.POINTERMOVE:
                console.log("POINTER MOVE");
                break;
            case BABYLON.PointerEventTypes.POINTERWHEEL:
                console.log("POINTER WHEEL");
                break;
            case BABYLON.PointerEventTypes.POINTERPICK:
                console.log("POINTER PICK");
                break;
            case BABYLON.PointerEventTypes.POINTERTAP:
                console.log("POINTER TAP");
                break;
            case BABYLON.PointerEventTypes.POINTERDOUBLETAP:
                console.log("POINTER DOUBLE-TAP");
                break;
        }
    });*/

}

new SpiralView().init();
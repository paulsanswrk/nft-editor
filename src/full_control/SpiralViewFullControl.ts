import SpiralViewBase from "../base/SpiralViewBase";
import {Spiral_Dynamic, Spiral_Dynamic_Config} from "../base/Spiral_Dynamic";
import {ArcRotateCamera} from "@babylonjs/core/Cameras/arcRotateCamera";
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import * as BABYLON from "@babylonjs/core";
import {Mesh} from "@babylonjs/core";
import {MeshBuilder} from "@babylonjs/core/Meshes/meshBuilder";

export class SpiralViewFullControl extends SpiralViewBase {
    spiral_factory = new Spiral_Dynamic();
    spiral: Spiral_Dynamic;
    spirals: Spiral_Dynamic[] = [Spiral_Dynamic.factory.create_spiral({})];

    get params() {
        return this.spiral ?? this.spiral_factory;
    }

    curr_n = 0;

    protected setup_camera() {
        this.camera = new ArcRotateCamera(
            "camera",
            Math.PI / 2,
            0,
            6.96,
            new Vector3(0, 0, 3),
            this.scene);

        this.camera.upVector = new Vector3(0, 0, 1);
        // this.camera.lowerBetaLimit = 0;
        this.camera.inertia = 0;
        this.camera.fov = 0.8732;
        // this.camera.upperBetaLimit = Math.PI;
        // this.camera.lowerBetaLimit = Math.PI;

        this.camera.inputs.clear();

        this.light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0, 0, -1), this.scene);
        this.light.diffuse = new BABYLON.Color3(1, 1, 1);
        this.light.specular = new BABYLON.Color3(1, 1, 1);
        this.light.intensity = 5;
    }


    protected init_spirals() {
        this.spiral = this.spiral_factory.create_spiral({});
    }

    switch_spiral_to(config: Spiral_Dynamic_Config) {
        // console.log('switch to', n);
        this.spiral = this.spiral_factory.create_spiral(config);

        this.create_spiral_mesh(this.spiral, true, 1);
        this.curr_n = 0;
        this.new_n = 1;
        this.do_transition = true;

    }

    public change_rot_cnt(rot_cnt: number) {
        this.rot_cnt = rot_cnt;
        this.remove_clones(0);
        this.create_rotated_clones(this.spiral, this.meshes[0][0]);
    }

    update_spiral() {
        const mesh: Mesh = MeshBuilder.CreateTube(`spiral_${this.spiral.id}`, {
            path: this.spiral.spiralPoints,
            instance: this.meshes[0][0],
        }, this.scene);
    }

    protected post_transition() {
        this.manager.removeTarget(this.targets[0]);
        this.targets[0] = this.targets[1];
    }
}

export const SpiralViewFullControl_instance = new SpiralViewFullControl();
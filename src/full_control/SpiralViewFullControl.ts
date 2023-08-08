import SpiralViewBase from "../base/SpiralViewBase";
import {Spiral_Dynamic} from "../base/Spiral_Dynamic";
import {ArcRotateCamera} from "@babylonjs/core/Cameras/arcRotateCamera";
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import * as BABYLON from "@babylonjs/core";
import {Mesh} from "@babylonjs/core";
import {MeshBuilder} from "@babylonjs/core/Meshes/meshBuilder";
import {Spiral_Transformed} from "../base/Spiral_Transformed";

export class SpiralViewFullControl extends SpiralViewBase {
    spiral_factory = new Spiral_Dynamic();
    spiral: Spiral_Dynamic;
    shadow_spiral: Spiral_Transformed;
    spirals: Spiral_Dynamic[] = [Spiral_Dynamic.factory.create_spiral({})];

    active_spiral: Spiral_Dynamic;

    get params() {
        return this.active_spiral ?? this.spiral_factory;
    }

    readonly defaults = {fov: 0.8732, beta: 0, camH: 6.96};

    curr_n = 0;

    protected setup_camera() {
        this.camera = new ArcRotateCamera(
            "camera",
            Math.PI / 2,
            this.defaults.beta,
            this.defaults.camH,
            new Vector3(0, 0, 3),
            this.scene);

        this.camera.upVector = new Vector3(0, 0, 1);
        // this.camera.lowerBetaLimit = 0;
        this.camera.lowerBetaLimit = -10;
        this.camera.upperBetaLimit = 10;
        this.camera.inertia = 0;
        this.camera.fov = this.defaults.fov;
        // this.camera.upperBetaLimit = Math.PI;
        // this.camera.lowerBetaLimit = Math.PI;

        this.camera.inputs.clear();

        this.light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0, 0, -1), this.scene);
        this.light.diffuse = new BABYLON.Color3(1, 1, 1);
        this.light.specular = new BABYLON.Color3(1, 1, 1);
        this.light.intensity = 5;
    }


    protected init_spirals() {
        this.active_spiral = this.spiral = this.spiral_factory.create_spiral({});
    }

    public create_shadow_spiral() {
        if (!this.shadow_spiral) {
            this.shadow_spiral = (new Spiral_Transformed()).create_spiral({});
            this.create_spiral_mesh(this.shadow_spiral, true, 1);
        } else
            this.meshes[1].forEach(m => m.setEnabled(true));
    }

    public hide_shadow_spiral() {
        this.meshes[1]?.forEach(m => m.setEnabled(false));
    }

    public set_active_spiral(name: 'main' | 'shadow') {
        switch (name) {
            case "main":
                this.active_spiral = this.spiral;
                break;
            case "shadow":
                this.active_spiral = this.shadow_spiral;
                break;
        }
    }

    public change_rot_cnt(rot_cnt: number) {
        const nMesh = this.active_spiral.type === 'dynamic' ? 0 : 1;

        this.remove_clones(nMesh);
        this.create_rotated_clones(this.active_spiral, this.meshes[nMesh][0], nMesh);
    }

    update_spiral() {
        const nMesh = this.active_spiral.type === 'dynamic' ? 0 : 1;

        const mesh: Mesh = MeshBuilder.CreateTube(`spiral_${this.spiral.id}`, {
            path: this.active_spiral.spiralPoints,
            radius: this.active_spiral.tube_radius,
            instance: this.meshes[nMesh][0],
        }, this.scene);
    }

    protected post_transition() {
        this.manager.removeTarget(this.targets[0]);
        this.targets[0] = this.targets[1];
    }
}

export const SpiralViewFullControl_instance = new SpiralViewFullControl();
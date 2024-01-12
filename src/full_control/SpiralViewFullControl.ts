import SpiralViewBase from "../base/SpiralViewBase";
import {Spiral_Dynamic} from "../base/Spiral_Dynamic";
import {ArcRotateCamera} from "@babylonjs/core/Cameras/arcRotateCamera";
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import * as BABYLON from "@babylonjs/core";
import {Color3, Mesh} from "@babylonjs/core";
import {MeshBuilder} from "@babylonjs/core/Meshes/meshBuilder";
import {Spiral_Transformed} from "../base/Spiral_Transformed";

export class SpiralViewFullControl extends SpiralViewBase {
    spiral_factory = new Spiral_Dynamic();
    spiral: Spiral_Dynamic;
    shadow_spiral: Spiral_Transformed;
    spirals: Spiral_Dynamic[] = [Spiral_Dynamic.factory.create_spiral({})];

    active_spiral = new Spiral_Dynamic();

    use_inspector = false;

    get params() {
        return this.active_spiral ?? this.spiral_factory;
    }

    readonly defaults = {
        fov: 0.8732,
        alpha: Math.PI / 2,
        beta: 0,
        camH: 6.96,
        lighting: {
            scene_clearColor: "#000000FF",
            scene_ambientColor: "#000000",
            light_diffuseColor: "#FFFFFF",
            light_groundColor: "#000000",
            light_direction: {
                x: 0,
                y: 0,
                z: -1
            },
            mat_ambientColor: "#000000",
            mat_diffuseColor: "#FFFFFF",
            mat_emissiveColor: "#FFFFFF",
            mat_specularColor: "#000000",
            mat_specularPower: 64
        }
    };

    curr_n = 0;

    protected setup_camera() {
        this.camera = new ArcRotateCamera(
            "camera",
            this.defaults.alpha,
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

        // this.light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0, 0, -1), this.scene);
        const {x, y, z} = this.defaults.lighting.light_direction;
        const hemispheric_light = new BABYLON.HemisphericLight("HemisphericLight", new BABYLON.Vector3(x, y, z), this.scene);
        hemispheric_light.diffuse = BABYLON.Color3.FromHexString(this.defaults.lighting.light_diffuseColor);
        hemispheric_light.groundColor = BABYLON.Color3.FromHexString(this.defaults.lighting.light_groundColor);
        // hemispheric_light.specular = new BABYLON.Color3(1, 1, 1);
        hemispheric_light.intensity = 5;
        this.light = hemispheric_light;

        const postProcess = new BABYLON.FxaaPostProcess("fxaa", 1.0, this.camera);

        this.spiralMaterial.ambientColor = Color3.FromHexString(this.defaults.lighting.mat_ambientColor);
        this.spiralMaterial.diffuseColor = Color3.FromHexString(this.defaults.lighting.mat_diffuseColor);
        this.spiralMaterial.emissiveColor = Color3.FromHexString(this.defaults.lighting.mat_emissiveColor);
        this.spiralMaterial.specularColor = Color3.FromHexString(this.defaults.lighting.mat_specularColor);

        // var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, this.scene);
        // const ground = MeshBuilder.CreateGround("ground1", {}, this.scene);

        /*const ground = BABYLON.MeshBuilder.CreatePlane("plane", {sideOrientation: 1, size: 10});
        ground.receiveShadows = true;

        // Create and tweak the background material.
        var backgroundMaterial = new BABYLON.BackgroundMaterial("backgroundMaterial", this.scene);
        backgroundMaterial.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/backgroundGround.png", this.scene);
        backgroundMaterial.diffuseTexture.hasAlpha = true;
        backgroundMaterial.opacityFresnel = false;
        backgroundMaterial.shadowLevel = 0.4;

        ground.material = backgroundMaterial;*/
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

    update_spiral_geometry(spiralPoints: Vector3[] | null = null) {
        const nMesh = this.active_spiral.type === 'dynamic' ? 0 : 1;

        const mesh: Mesh = MeshBuilder.CreateTube(`spiral_${this.spiral.id}`, {
            path: spiralPoints ?? this.active_spiral.spiralPoints,
            radius: this.active_spiral.tube_radius,
            radiusFunction: (index, distance) => {
                return this.active_spiral.radius_function(index);
            },
            instance: this.meshes[nMesh][0],
        }, this.scene);
    }

    update_colors() {
        const nMesh = this.active_spiral.type === 'dynamic' ? 0 : 1;
        this.assign_colors(this.meshes[nMesh][0], this.active_spiral);
    }

    protected post_transition() {
        this.manager.removeTarget(this.targets[0]);
        this.targets[0] = this.targets[1];
    }
}

export const SpiralViewFullControl_instance = new SpiralViewFullControl();
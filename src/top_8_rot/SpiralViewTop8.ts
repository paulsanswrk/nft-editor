import ISpiralParams from "../ISpiralParams";
import {SpiralViewBase} from "../base/SpiralViewBase";
import {ArcRotateCamera} from "@babylonjs/core/Cameras/arcRotateCamera";
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import * as BABYLON from "@babylonjs/core";
import {Spiral_Top_8} from "./Spiral_Top_8";

export class SpiralViewTop8 extends SpiralViewBase implements ISpiralParams {
    protected spiral_factory = new Spiral_Top_8();

    curr_n = 11;

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
        // this.camera.fov = 1.0460;
        this.camera.fov = 0.8732;
        // this.camera.upperBetaLimit = Math.PI;
        // this.camera.lowerBetaLimit = Math.PI;

        this.camera.useAutoRotationBehavior = true;
// camera.rotation = new Vector3(0,0,1);

        this.camera.autoRotationBehavior.idleRotationSpeed = -0.05;
        this.camera.autoRotationBehavior.idleRotationWaitTime = 0;
        this.camera.autoRotationBehavior.zoomStopsAnimation = false;
        this.camera.inputs.clear();

        this.light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0, 0, -1), this.scene);
        this.light.diffuse = new BABYLON.Color3(1, 1, 1);
        this.light.specular = new BABYLON.Color3(1, 1, 1);
        this.light.intensity = 5;
        // this.light.autoUpdateExtends = false;
        // this.light.groundColor = new BABYLON.Color3(0, 1, 0);
        // light2 = new BABYLON.SpotLight("SpotLight", new BABYLON.Vector3(0, 0, 5), new BABYLON.Vector3(0, 0, -10), 90, 2, this.scene);

        /*this.bulbLight.diffuse = this.randomColor
         this.bulbLight.specular = this.randomColor
         this.bulbLight.position.copyFrom(this.curr_mesh.position);*/

    }

}



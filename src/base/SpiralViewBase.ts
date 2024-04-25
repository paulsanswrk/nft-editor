import {Spiral_Base, Spiral_Config} from "./Spiral_Base";
import {Engine} from "@babylonjs/core/Engines/engine";
import {Scene} from "@babylonjs/core/scene";
import {ArcRotateCamera} from "@babylonjs/core/Cameras/arcRotateCamera";
import * as BABYLON from "@babylonjs/core";
import {Light, Mesh, StandardMaterial} from "@babylonjs/core";
import {MorphTarget} from "@babylonjs/core/Legacy/legacy";
import {Inspector} from "@babylonjs/inspector";
import {MeshBuilder} from "@babylonjs/core/Meshes/meshBuilder";
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import {arrayBufferToBlob, blobToDataURL, dataURLToBlob} from "blob-util";
import * as HME from "h264-mp4-encoder";
import {sleep} from "../common/help_funcs";
import {fps} from "../full_control/AppVM";

export default abstract class SpiralViewBase {
    protected abstract spiral_factory: Spiral_Base;

    canvas = document.getElementById("view") as HTMLCanvasElement;
    engine = new Engine(this.canvas, true, {preserveDrawingBuffer: true}, true);
    scene = new Scene(this.engine);

    camera: ArcRotateCamera;
    spiralMaterial = new StandardMaterial("spiralMaterial", this.scene);

    light: Light;

    // curr_n = 14; //m1 == 8.6
    curr_n = 0;
    start_n: number;
    new_n: number;
    do_transition = false;
    spirals: Spiral_Base[];

    manager = new BABYLON.MorphTargetManager();
    // meshes: { [k: string]: Mesh[] } = {};
    meshes: Mesh[][] = [];
    targets: MorphTarget[] = [];

    protected use_inspector: boolean = false;

    protected numberOfTimes: number = 0;
    protected last_click_time: Date = new Date(0);

    protected abstract init_spirals();

    public init() {
        this.start_n = this.new_n = this.curr_n;
        this.init_spirals();

        this.setup_camera();

        this.scene.clearColor = new BABYLON.Color4(0, 0, 0);

        this.camera.attachControl(this.canvas);

        /*this.spiralMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        this.spiralMaterial.emissiveColor = this.randomColor;*/

        this.scene.registerBeforeRender(() => this.render_handler());
        this.engine.setHardwareScalingLevel(this.engine.getHardwareScalingLevel() * 0.7);
        // this.engine.adaptToDeviceRatio = true;
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        this.scene.onPointerUp = (evt, pickInfo) => this.click_handler(evt, pickInfo);

        // this.create_spiral_mesh(this.curr_n, this.spirals[this.curr_n]);
        this.spirals.forEach((s, n) => this.create_spiral_mesh(s, n == this.curr_n, n));

        // this.scene.freezeActiveMeshes();
        // this.scene.blockMaterialDirtyMechanism = true;
        this.scene.getAnimationRatio();

        /// if INSPECTOR
        if (this.use_inspector)
            Inspector.Show(this.scene, {
                overlay: true,
            });
        /// endif

        // Watch for browser/canvas resize events
        window.addEventListener("resize", () => this.numberOfTimes = 5);

        this.init_additional();

    }

    public show_inspector(on: boolean) {
        if (on)
            Inspector.Show(this.scene, {overlay: true});
        else Inspector.Hide();
    }

    protected init_additional() {
    }

    protected abstract setup_camera();

    reset_camera() {
        this.camera.alpha = Math.PI / 2;
        this.camera.beta = 0;
    }

    create_spiral_mesh(spiral: Spiral_Base, set_enabled: boolean, spiral_target_n: number = 0) {
        if (this.meshes[spiral_target_n]) return;

        const mesh: Mesh = MeshBuilder.CreateTube(`spiral_${spiral.id}`, {
            path: spiral.spiralPoints,
            radius: spiral.tube_radius,
            updatable: true,
            tessellation: 4,
            radiusFunction: (index, distance) => {
                return spiral.radius_function(index);
            },
        }, this.scene);

        this.meshes[spiral_target_n] = [mesh];

        // this.spiralMaterial.specularColor = Color3.Black();
        // mesh.freezeNormals();

        mesh.setEnabled(set_enabled);
        mesh.hasVertexAlpha = true;
        // if (n == this.curr_n)
        this.assign_colors(mesh, spiral);

        // this.spiralMaterial.freeze();
        // mesh.doNotSyncBoundingInfo = true;

        // this.spiralMaterial.alphaMode = 4;
        this.spiralMaterial.needDepthPrePass = true;
        this.spiralMaterial.separateCullingPass = true;
        // this.spiralMaterial.disableLighting = true;
        this.spiralMaterial.emissiveColor = BABYLON.Color3.White();
        this.spiralMaterial.diffuseColor = BABYLON.Color3.White();
        this.spiralMaterial.specularColor = BABYLON.Color3.Black();
        this.spiralMaterial.reservedDataStore = {hidden: true, isVertexColorMaterial: true};
        mesh.useVertexColors = true;
        mesh.material = this.spiralMaterial;

        mesh.morphTargetManager = this.manager;
        this.targets[spiral_target_n] = BABYLON.MorphTarget.FromMesh(mesh, `spiral_${spiral.id}`, 0);
        this.manager.addTarget(this.targets[spiral_target_n]);

        this.create_rotated_clones(spiral, mesh, spiral_target_n);

        return mesh;
    }

    protected assign_colors(mesh: Mesh, spiral: Spiral_Base) {
        mesh.setVerticesData("color", spiral.calc_colors(mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind))); //TODO: vertices data is unused
    }

    protected create_rotated_clones(spiral: Spiral_Base, mesh: Mesh, spiral_target_n: number = 0) {
        for (let n_rot = 1; n_rot < spiral.rot_cnt; n_rot++) {
            const clone = mesh.clone();
            clone.rotate(new Vector3(0, 0, 1), 2 * Math.PI / spiral.rot_cnt * n_rot).name = `${mesh.name} rot ${n_rot}`;
            this.meshes[spiral_target_n].push(clone);
        }
    }

    protected remove_clones(spiral_target_n: number = 0) {
        let group = this.meshes[spiral_target_n];
        group.forEach((m, n) => {
            if (n) {
                m.dispose();
                delete group[n];
            }
        });
        this.meshes[spiral_target_n] = [group[0]];
    }


    get camera_h(): number {
        return this.camera.radius;
    }

    set camera_h(v) {
        this.camera.radius = v;
    }

    get camera_fov(): number {
        return this.camera.fov;
    }

    set camera_fov(v) {
        this.camera.fov = v;
    }

    get camera_speed(): number {
        return this.camera.autoRotationBehavior.idleRotationSpeed;
    }

    set camera_speed(v) {
        this.camera.autoRotationBehavior.idleRotationSpeed = v;
    }

    get hw_scaling_level(): number {
        return this.engine.getHardwareScalingLevel();
    }

    set hw_scaling_level(v: number) {
        this.engine.setHardwareScalingLevel(v);
    }

    render_handler() {
        //handle resize
        if (this.numberOfTimes--) {
            this.engine.resize();
        }

        //handle transition
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
            this.do_transition = !finished;

            //post-transition cleanup
            if (finished) {
                this.post_transition();
            }

        }

    }

    protected post_transition() {

    }

    click_handler(p, pick) {
    }

    notify_gui(changes: Spiral_Config) {
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

    export_image_base64(size: number = 600): Promise<string> {
        return new Promise<string>((resolve) => {
            // const canvas: HTMLCanvasElement = document.getElementById("view") as any;
            // canvas.toBlob(blob => resolve(blob));

            BABYLON.Tools.CreateScreenshot(this.engine, this.camera, size, function (base64_url) {
                resolve(base64_url);
            });
        });
    }

    async export_image_blob(size: number = 600): Promise<Blob> {
        const base64_url = await this.export_image_base64(size);
        return dataURLToBlob(base64_url);
    }

    async download_file(blob: Blob, filename: string) {
        const link = document.createElement("a");
        link.download = filename + '';
        link.href = await blobToDataURL(blob);
        link.setAttribute("target", "_blank");
        link.click();
        link.remove();
    }

    async download_canvas_image(filename: string, render_size: number = 600) {
        const bak_scaling = this.engine.getHardwareScalingLevel();
        const canvas_size = document.getElementById('view')?.clientWidth;
        if (!!canvas_size && (canvas_size < render_size)) this.engine.setHardwareScalingLevel(canvas_size / render_size);

        const img_data_url = await this.export_image_base64(render_size);

        if ((window as any).pp_func)
            (window as any).pp_func(img_data_url);
        else {
            const blob = dataURLToBlob(img_data_url);
            await this.download_file(blob, filename);
        }

        this.engine.setHardwareScalingLevel(bak_scaling);
    }

    async download_image_sequence(gen_frame: (n_frame: number) => void, size: number = 1200, n_start_frame: number, n_end_frame: number, fn_prefix: string) {
        const numberFormat = new Intl.NumberFormat('en', {minimumIntegerDigits: 6, useGrouping: false});

        for (let n_frame = n_start_frame; n_frame <= n_end_frame; n_frame++) {
            gen_frame(n_frame);
            await this.download_canvas_image(fn_prefix + numberFormat.format(n_frame + 1), size);
        }
    }

    async render_mp4(gen_frame: (n_frame: number) => void, n_start_frame: number, n_end_frame: number) {
        const size = this.canvas.width;
        const encoder = await HME.createH264MP4Encoder();
        // Must be a multiple of 2.
        encoder.width = size;
        encoder.height = size;
        encoder.frameRate = fps.value;
        // encoder.debug = true;
        encoder.initialize();
        const ctx = this.canvas.getContext("webgl2", {preserveDrawingBuffer: true,});

        const row = encoder.width * 4;
        const end = (encoder.height - 1) * row;
        const length = encoder.width * encoder.height * 4;
        const arr = new Uint8Array(length);
        const pixels = new Uint8Array(length);

        for (let n_frame = n_start_frame; n_frame <= n_end_frame; n_frame++) {
            gen_frame(n_frame);
            ctx.readPixels(0, 0, encoder.width, encoder.height, ctx.RGBA, ctx.UNSIGNED_BYTE, arr);

            //revert array according to https://stackoverflow.com/questions/67811153/webgl-readpixels-returns-flipped-y-axis
            for (let i = 0; i < length; i += row) {
                pixels.set(arr.subarray(i, i + row), end - i);
            }

            encoder.addFrameRgba(pixels);
            console.log({n_frame})
            await sleep(1);
        }

        encoder.finalize();
        const uint8Array = encoder.FS.readFile(encoder.outputFilename, {encoding: "binary"});
        encoder.delete();

        return arrayBufferToBlob(uint8Array.buffer, "video/mp4");
    }
}
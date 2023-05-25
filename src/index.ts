import {ArcRotateCamera} from "@babylonjs/core/Cameras/arcRotateCamera"
import {Engine} from "@babylonjs/core/Engines/engine"
import {HemisphericLight} from "@babylonjs/core/Lights/hemisphericLight"
import {MeshBuilder} from "@babylonjs/core/Meshes/meshBuilder"
import {Scene} from "@babylonjs/core/scene"
import {Vector3} from "@babylonjs/core/Maths/math.vector"
import * as BABYLON from '@babylonjs/core/Legacy/legacy';

import {Color3, StandardMaterial} from '@babylonjs/core';
import {Spiral_Top} from "./Spiral_Top";
import {MorphTarget} from "@babylonjs/core/Legacy/legacy";


const view = document.getElementById("view") as HTMLCanvasElement
const engine = new Engine(view, true)

const scene = new Scene(engine);
scene.clearColor = new BABYLON.Color4(0, 0, 0);

// const axes = new BABYLON.AxesViewer(scene, 3);

const camera = new ArcRotateCamera(
    "camera",
    Math.PI / 2,
    0,
    8,
    new Vector3(0, 0, 3),
    scene);

camera.attachControl(view);
camera.upVector = new Vector3(0, 0, 1);

camera.useAutoRotationBehavior = true;
// camera.rotation = new Vector3(0,0,1);

camera.autoRotationBehavior.idleRotationSpeed = -0.05;
camera.autoRotationBehavior.idleRotationWaitTime = 0;
camera.autoRotationBehavior.zoomStopsAnimation = false;

let curr_n = 3;
let new_n = curr_n;
let do_transition = false;

const light = new HemisphericLight(
    "light",
    new Vector3(0, -1, 0.3),
    scene);

const spirals = Spiral_Top.all_configs.map((s, n) => new Spiral_Top(n));
spirals.forEach(s => s.calc_points());

const meshes = [];

const manager = new BABYLON.MorphTargetManager();
const targets: MorphTarget[] = [];

// Create the spiral material
const spiralMaterial = new StandardMaterial("spiralMaterial", scene);
spiralMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

function create_spiral_mesh(n, spiral: Spiral_Top) {
    const mesh = MeshBuilder.CreateTube(`spiral_${n}`, {
        path: spiral.spiralPoints,
        radius: 0.004,
        updatable: false,
        tessellation: 4,
    }, scene);

    meshes.push(mesh);

    mesh.material = spiralMaterial;
    mesh.freezeNormals();

    mesh.setEnabled(n == curr_n);
    if (n == curr_n)
        mesh.setVerticesData("color", spiral.calc_colors(mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind)));
    mesh.morphTargetManager = manager;
    targets[n] = BABYLON.MorphTarget.FromMesh(mesh, `spiral_${n}`, 0);
    manager.addTarget(targets[n]);

    for (let n = 1; n < spiral.nRot; n++)
        mesh.clone().rotate(new Vector3(0, 0, 1), 2 * Math.PI / spiral.nRot * n);
}

for (const spiral of spirals) {
    const n = spirals.indexOf(spiral);

    create_spiral_mesh(n, spiral);
}


var randomColor = BABYLON.Color3.Random();
randomColor = Color3.White();
spiralMaterial.emissiveColor = randomColor

var bulbLight = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(0, 0, 0), scene);
bulbLight.diffuse = randomColor
bulbLight.specular = randomColor
bulbLight.position.copyFrom(meshes[0].position);


const di = 0.1;
scene.registerBeforeRender(function () {

    if (do_transition) {
        let finished = true;

        targets.forEach(
            (target, n) => {
                if (n == new_n) {
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
        )

        do_transition = !finished;
    }

})
/*scene.registerBeforeRender(function () {
    if(!need_recalc) return;
    // var_m1();
    calc_points(true);
    spiral = MeshBuilder.CreateTube(null, {path: spiralPoints, instance: spiral});
    set_colors();
    need_recalc = false;
});*/

engine.runRenderLoop(() => {
    scene.render();
});

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

scene.onPointerUp = function (p, pick) {
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
    if (n != new_n) {
        curr_n = new_n;
        new_n = n;
        do_transition = true;
    }
    console.log(n, Spiral_Top.all_configs.length, targets.map(t => t.influence), do_transition, spirals[new_n].m1);
    camera.autoRotationBehavior.resetLastInteractionTime(0);


    if (pick.hit) {
        // console.log(pick.pickedPoint.z)
        // handle_z_click(pick.pickedPoint.z)
        // console.log(pick.pickedPoint)
    }
}

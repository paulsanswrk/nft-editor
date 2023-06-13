/*
var createScene = function () {
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, 0, 1, new BABYLON.Vector3(0, 5, -10), scene);

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);
    camera.fov = 0.2;

    camera.useAutoRotationBehavior = true;
    camera.autoRotationBehavior.idleRotationSpeed = 0.05;

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    //const axes = new BABYLON.AxesViewer(scene, 3);

    const turns = 40;
    const majorRadius = 1;
    const minorRadius = 0.1;
    const segments = 1000;

    const toroidalSpiralPoints = [];
    for (let i = 0; i <= segments; i++) {
        const theta = i * (2 * Math.PI) / segments;
        const phi = i * (turns * 2 * Math.PI) / segments;
        const x = (majorRadius + minorRadius * Math.cos(phi)) * Math.cos(theta);
        const y = minorRadius * Math.sin(phi);
        const z = (majorRadius + minorRadius * Math.cos(phi)) * Math.sin(theta);
        toroidalSpiralPoints.push(new BABYLON.Vector3(x, y, z));
    }

    const toroidalSpiral = BABYLON.MeshBuilder.CreateTube("toroidalSpiral", {
        path: toroidalSpiralPoints,
        radius: 0.002
    }, scene);

    const colors = [];
    const verticesData = toroidalSpiral.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    for (let n = 0; n < verticesData.length / 3; n++) {
        colors.push(...BABYLON.Color3.FromHSV(1080 * n / verticesData.length, 1, 1).asArray(), 1);
    }

    toroidalSpiral.setVerticesData("color", colors);

    const toroidalSpiralMaterial = new BABYLON.StandardMaterial("toroidalSpiralMaterial", scene);
    //toroidalSpiralMaterial.emissiveColor = new BABYLON.Color3(1,0,0);
    toroidalSpiral.material = toroidalSpiralMaterial;

    return scene;
};*/

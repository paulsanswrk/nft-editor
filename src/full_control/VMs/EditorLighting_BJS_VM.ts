import {SpiralViewFullControl_instance} from "../SpiralViewFullControl";
import EditorVM from "./EditorVM";
import {Color3, HemisphericLight} from "@babylonjs/core";
import {Color4} from "@babylonjs/core/Legacy/legacy";
import {color4_to_hsva_array, HSVA_Lerp} from "../../common/help_funcs";
import {mapValues} from "lodash";

const spiral_view = SpiralViewFullControl_instance;


interface Lighting_Params {
    scene_clearColor?: string;
    mat_emissiveColor?: string;
    mat_specularColor?: string;
    scene_ambientColor?: string;
    mat_diffuseColor?: string;
    light_direction?: { x, y, z };
    light_diffuseColor?: string;
    mat_ambientColor?: string;
    light_groundColor?: string;
    mat_specularPower?: number;
}

export default class EditorLighting_BJS_VM extends EditorVM {

    constructor(param_name: string) {
        super(param_name);
    }

    component_name = 'LightingEditor';

    param_get(): Lighting_Params {
        const {x, y, z} = (spiral_view.scene.lights[0] as HemisphericLight)?.direction ?? {};

        return {
            scene_clearColor: spiral_view.scene.clearColor.toHexString(),
            scene_ambientColor: spiral_view.scene.ambientColor.toHexString(),
            light_diffuseColor: (spiral_view.scene.lights[0] as HemisphericLight)?.diffuse.toHexString(),
            light_groundColor: (spiral_view.scene.lights[0] as HemisphericLight)?.groundColor.toHexString(),
            light_direction: {x, y, z},
            mat_ambientColor: spiral_view.spiralMaterial.ambientColor.toHexString(),
            mat_diffuseColor: spiral_view.spiralMaterial.diffuseColor.toHexString(),
            mat_emissiveColor: spiral_view.spiralMaterial.emissiveColor.toHexString(),
            mat_specularColor: spiral_view.spiralMaterial.specularColor.toHexString(),
            mat_specularPower: spiral_view.spiralMaterial.specularPower,
        }
    }

    param_set(arg: Lighting_Params, do_update_spiral = true): void {
        if (!do_update_spiral) return;

        if (arg.scene_clearColor) spiral_view.scene.clearColor = Color4.FromHexString(arg.scene_clearColor);
        if (arg.scene_ambientColor) spiral_view.scene.ambientColor = Color3.FromHexString(arg.scene_ambientColor);
        if (arg.light_diffuseColor) (spiral_view.scene.lights[0] as HemisphericLight).diffuse = Color3.FromHexString(arg.light_diffuseColor);
        if (arg.light_groundColor) (spiral_view.scene.lights[0] as HemisphericLight).groundColor = Color3.FromHexString(arg.light_groundColor);
        if (arg.light_direction) {
            const light_direction = (spiral_view.scene.lights[0] as HemisphericLight).direction;
            light_direction.x = arg.light_direction.x;
            light_direction.y = arg.light_direction.y;
            light_direction.z = arg.light_direction.z;
        }
        if (arg.mat_ambientColor) spiral_view.spiralMaterial.ambientColor = Color3.FromHexString(arg.mat_ambientColor);
        if (arg.mat_diffuseColor) spiral_view.spiralMaterial.diffuseColor = Color3.FromHexString(arg.mat_diffuseColor);
        if (arg.mat_emissiveColor) spiral_view.spiralMaterial.emissiveColor = Color3.FromHexString(arg.mat_emissiveColor);
        if (arg.mat_specularColor) spiral_view.spiralMaterial.specularColor = Color3.FromHexString(arg.mat_specularColor);
        if (arg.mat_specularPower !== undefined) spiral_view.spiralMaterial.specularPower = arg.mat_specularPower;
    }

    param_set_lerp(a: any, b: any, morphing_percent: number): void {
        const res: any = {};

        /*const color_props = reflect<Lighting_Params>().as("interface").reflectedInterface.properties
            .filter(p => p.name.includes('Color')).map(p => p.name);*/

        const color_props = Object.keys(a).filter(p => p.includes('Color'));

        for (const color_prop of color_props)
            res[color_prop] = HSVA_Lerp(color4_to_hsva_array(a[color_prop]), color4_to_hsva_array(b[color_prop]), morphing_percent).toHexString(true);

        res.light_direction = mapValues({x: 0, y: 0, z: 0}, (v, k) => a.light_direction[k] + morphing_percent * (b.light_direction[k] - a.light_direction[k]));
        res.mat_specularPower = a.mat_specularPower + morphing_percent * (b.mat_specularPower - a.mat_specularPower);

        this.param_set(res);
    }

    param_get_serialized(): string {
        const props = this.param_get();

        return [
            props.scene_clearColor,
            props.scene_ambientColor,
            props.light_direction.x.toFixed(1),
            props.light_direction.y.toFixed(1),
            props.light_direction.z.toFixed(1),
            props.light_diffuseColor,
            props.light_groundColor,
            props.mat_ambientColor,
            props.mat_diffuseColor,
            props.mat_emissiveColor,
            props.mat_specularColor,
            props.mat_specularPower.toFixed(2),
        ].join('|');

    }

    param_set_serialized(s: string, default_value: any, do_update_spiral = true): void {
        if (!s) {
            this.param_set(default_value);
            return;
        }

        if (typeof s === 'string') {
            const [scene_clearColor, scene_ambientColor, s_x, s_y, s_z, light_diffuseColor, light_groundColor, mat_ambientColor, mat_diffuseColor,
                mat_emissiveColor, mat_specularColor, s_mat_specularPower] = s.split('|');
            const x = Number(s_x);
            const y = Number(s_y);
            const z = Number(s_z);
            const mat_specularPower = Number(s_mat_specularPower);

            this.param_set({
                scene_clearColor, scene_ambientColor, light_direction: {x, y, z}, light_diffuseColor, light_groundColor, mat_ambientColor, mat_diffuseColor,
                mat_emissiveColor, mat_specularColor, mat_specularPower
            });
        } else {
            this.param_set(<object>s);
        }
    }

}
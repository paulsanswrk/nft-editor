import {TinyColor} from "@ctrl/tinycolor";
import {Color4} from "@babylonjs/core/Legacy/legacy";
import {Color3} from "@babylonjs/core";

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function color4_to_hsva_array(color: string): number[] {
    const {h, s, v, a} = new TinyColor(color).toHsv();
    // console.log('color4_to_hsva_array', {h, s, v, a})
    return [h, s, v, a];
}

export function HSVA_Lerp(color1_hsva: number[], color2_hsva: number[], amount: number) {
    color1_hsva = [...color1_hsva];
    for (let i = 0; i < 4; i++)
        color1_hsva[i] += (color2_hsva[i] - color1_hsva[i]) * amount;

    color1_hsva[0] %= 360;

    return Color4.FromColor3(Color3.FromHSV(color1_hsva[0], color1_hsva[1], color1_hsva[2]), color1_hsva[3]);
}
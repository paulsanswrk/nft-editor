import {TinyColor} from "@ctrl/tinycolor";
import {Color4} from "@babylonjs/core/Legacy/legacy";
import {Color3} from "@babylonjs/core";
import {isString} from "lodash";

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

export function lerp_numeric(segments: { pos: number, val: number }[], x_norm: number) {
    let n1 = 0, n2 = 1;
    while (x_norm > segments[n2].pos && n2 < segments.length) {
        n1++;
        n2++;
    }

    return segments[n1].val + (segments[n2].val - segments[n1].val) * (x_norm - segments[n1].pos) / (segments[n2].pos - segments[n1].pos);
}

export function moveItemInArray<T>(workArray: T[], fromIndex: number, toIndex: number): T[] {
    if (toIndex === fromIndex) {
        return workArray;
    }
    const target = workArray[fromIndex];
    const increment = toIndex < fromIndex ? -1 : 1;

    for (let k = fromIndex; k !== toIndex; k += increment) {
        workArray[k] = workArray[k + increment];
    }
    workArray[toIndex] = target;
    return workArray;
}

export function is_segment_string(s: any) {
    return isString(s) && s.startsWith('0:');
}

export function avg_of_segments(segments: { pos: number; val: number; }[]) {
    let avg = 0;

    for (let i = 0; i < segments.length - 1; i++)
        avg += segments[i].val * (segments[i + 1].pos - segments[i].pos);

    return avg;
}

export function add_to_array(from: number[], to: number[], start_pos: number = 0, mul_by: number = 1) {
    for (let i = 0; i < from.length; i++)
        to[start_pos + i] += from[i] * mul_by;
}

export function left_deriv(segments: { pos: number; val: number; }[], full_len = 1) {
    return (segments[1].val - segments[0].val) / (segments[1].pos * full_len);
}

export function right_deriv(segments: { pos: number; val: number; }[], full_len = 1) {
    const len = segments.length;
    return (segments[len - 1].val - segments[len - 2].val) / (segments[len - 1].pos - segments[len - 2].pos) / full_len;
}


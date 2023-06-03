import {Spiral_Base} from "./base/Spiral_Base";

export default interface ISpiralParams {
    spirals: Spiral_Base[];

    get configs_count(): number;

    get camera_h(): number;

    set camera_h(v: number);

    get spiral_m1(): number;

    switch_spiral_to(n: number): void;
}
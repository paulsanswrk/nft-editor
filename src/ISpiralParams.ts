import {Spiral_Base} from "./base/Spiral_Base";

export default interface ISpiralParams {
    spirals: Spiral_Base[];

    get configs_count(): number;

    get camera_h(): number;

    set camera_h(v: number);

    get camera_speed(): number;

    set camera_speed(v: number);

    get auto_change(): boolean;

    set auto_change(v: boolean);

    get spiral_m1(): number;

    get hw_scaling_level(): number;

    set hw_scaling_level(v: number);

    switch_spiral_to(n: number): void;
}
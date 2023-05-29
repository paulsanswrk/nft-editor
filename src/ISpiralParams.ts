import {Spiral_Top} from "./Spiral_Top";

export default interface ISpiralParams {
    spirals: Spiral_Top[];

    get configs_count(): number;

    get camera_h(): number;

    set camera_h(v: number);

    get spiral_m1(): number;

    switch_spiral_to(n: number): void;
}
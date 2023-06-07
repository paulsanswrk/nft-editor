import * as s_data from './spiral_top.json';
import {Spiral_Base} from "../base/Spiral_Base";


export class Spiral_Top_8 extends Spiral_Base {

    // public static readonly config_len = s_data.length;

    readonly rot_cnt: number = 8;

    readonly config_len: number = s_data.length;

    constructor(n_config: number = 0) {
        super(n_config);
    }

    protected override get s_data(): { m1: number, cc: number[] }[] {
        return s_data;
    }

    static readonly factory: Spiral_Base = new Spiral_Top_8;

    create_spiral(n: number = 0): Spiral_Top_8 {
        let spiral = new Spiral_Top_8(n);
        spiral.calc_points();
        return spiral;
    }
}





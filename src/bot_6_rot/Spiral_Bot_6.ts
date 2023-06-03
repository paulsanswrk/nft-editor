import * as s_data from './spiral_bot.json';
import {Spiral_Base} from "../base/Spiral_Base";

export class Spiral_Bot_6 extends Spiral_Base {

    // public static readonly config_len = s_data.length;

    readonly nRot: number = 6;

    readonly config_len: number = s_data.length;

    constructor(n_config: number = 0) {
        super(n_config);
    }

    protected override get s_data(): { m1: number, cc: number[] }[] {
        return s_data;
    }

    static readonly factory: Spiral_Base = new Spiral_Bot_6;

    create_spiral(n: number = 0): Spiral_Bot_6 {
        let spiral = new Spiral_Bot_6(n);
        spiral.calc_points();
        return spiral;
    }
}





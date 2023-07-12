import {Spiral_Base, Spiral_Config} from "./Spiral_Base";

export abstract class Spiral_Predefined_Base extends Spiral_Base {

    static readonly factory: Spiral_Predefined_Base;

    protected get s_data(): { m1: number, cc: number[] }[] {
        return [];
    }

    protected n_config: number;
    public abstract readonly config_len: number;

    protected constructor(config: Spiral_Config) {
        super();
        // this.n_config = n_config;
        this.set_config(config);

        // if (!!this.s_data?.[this.n_config])
        this.set_cc(this.s_data[this.n_config].cc);
        this.m1 = this.s_data[this.n_config].m1;
    }

    protected set_config(config: { n_config?: number }) {
        this.n_config = config.n_config;
    }

    public abstract create_spiral(config: Spiral_Config): Spiral_Predefined_Base;

}







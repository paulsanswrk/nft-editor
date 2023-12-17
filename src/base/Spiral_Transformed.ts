import {Spiral_Dynamic, Spiral_Dynamic_Config} from "./Spiral_Dynamic";
import {Power, Sqrt} from "../CommonMath";


export interface Spiral_Transformed_Config extends Spiral_Dynamic_Config {
    inner_r?: number;
}

export class Spiral_Transformed extends Spiral_Dynamic {
    public offsetR: number = 0.5;
    public inner_r: number = 10;

    type: string = 'transformed';

    transform_type: string = 'squeeze_out_cylinder';

    param_limits = {m2: {lo: 1.1}, offsetR: {lo: 0.1}};

    get id(): string {
        return `shadow_spiral`;
    }

    create_spiral(config: Spiral_Transformed_Config): Spiral_Transformed {
        let spiral = new Spiral_Transformed();
        spiral.calc_cc();
        spiral.calc_points();

        return spiral;
    }

    public get_config(): Spiral_Transformed_Config {
        return {...super.get_config(), inner_r: this.inner_r};
    }

    public set_config(config: Spiral_Transformed_Config) {
        super.set_config(config);
        if (config.inner_r !== undefined) this.inner_r = config.inner_r;
    }

    protected transform([x, y, z]: number[]): number[] {
        const a = this.inner_r;
        let x1 = Sqrt(Power(x, 2) * (Power(a, 2) + Power(x, 2) + Power(y, 2) + 2 * a * Sqrt(Power(x, 2) + Power(y, 2)))) / Sqrt(Power(x, 2) + Power(y, 2));
        let y1 = (y * Sqrt(Power(x, 2) * (Power(a, 2) + Power(x, 2) + Power(y, 2) + 2 * a * Sqrt(Power(x, 2) + Power(y, 2))))) / (x * Sqrt(Power(x, 2) + Power(y, 2)));

        x1 = Math.sign(x) * Math.abs(x1);
        y1 = Math.sign(y) * Math.abs(y1);

        if (isNaN(x1) || isNaN(y1)) {
            // console.log('NAN:', x, y)
            const phi = Math.random() * 2 * Math.PI;
            return [a * Math.cos(phi), a * Math.sin(phi), z];
        }

        return [x1, y1, z];
    }

}
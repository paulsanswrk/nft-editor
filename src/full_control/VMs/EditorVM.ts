export default abstract class EditorVM {
    protected constructor(param_name: string) {
        this.param_name = param_name;
    }

    param_name: string;
    component_name: string;

    abstract param_get(): any;

    param_get_serialized(): string {
        return String(this.param_get());
    }

    abstract param_set_serialized(param: string, default_value: any): void;

    abstract param_set(arg: any): void;

    abstract param_set_lerp(a: any, b: any, pos: number): void;


}

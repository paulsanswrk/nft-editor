export interface EditorModel {
    component: any,
    param_name: string,
    param_get: () => number,
    param_set: (number) => void,
    param_min: number,
    param_max: number,
    steps?: number[],
};

export interface GDriveFile {
    name: string;
    properties: { [k: string]: string | number };
    thumbnailLink: string;
    webContentLink: string;
    webViewLink: string;
}


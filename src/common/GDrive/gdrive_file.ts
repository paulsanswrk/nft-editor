import axios from "axios";
import {ref} from "vue";

/*axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    alert('Axios error: ' + error)
    return Promise.reject(error);
});*/

const CLIENT_ID = '245623700514-utgsq529q9a820svr8k7djt2l1k3c37l.apps.googleusercontent.com';
const API_KEY = 'AIzaSyA2Nsh3yDFbJT3S84_1CMQGHFkpgdNRX00';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

const SCOPES = 'https://www.googleapis.com/auth/drive';

let tokenClient: google.accounts.oauth2.TokenClient;

// const spiral_editor_folder_id: string = '1YXgCu0lUehpJWaYi3hrpbn1AkxJFVyCx';
const static_objects_folder_id: string = '16vTYEvDAvIwWDtn2u2zrep3bx97_hnlY';
const animated_objects_folder_id: string = '1FsAfSsjeJR3VjjovutAeVZdw9iezagoS';
const animated_objects_json_folder_id: string = '1bLJMUsgM2MD3wHuk02BGTb9eiEZ9lJuq';

export let force_gdrive_auth = ref(false);

export async function gdrive_init() {
    // Initializes the client with the API key
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
}

export abstract class GDriveFile {
    name: string;
    properties: {
        [k: string]: string
    };
    thumbnailLink: string;

    abstract list_files(): Promise<GDriveFile[]>;

    abstract factory(): GDriveFile;

    protected folder_id: string;

    get accessToken() {
        return gapi.client.getToken().access_token;
    }

    protected init_from_gapi_file(f: gapi.client.drive.File) {
        this.name = f.name;
        this.thumbnailLink = f.thumbnailLink;
        return this;
    }

    async load_details() {
    }

    private have_valid_token() {
        if (!!gapi.client.getToken()) return true;

        const access_token = localStorage['gapi_token'];
        const expires_at = localStorage['expires_at'];

        if (!!access_token && !!expires_at && Number(expires_at) > new Date().getTime()) {
            gapi.client.setToken({access_token});
            return true;
        }

        return false;
    }

    protected do_auth_call(callback: (resolve: (value: any) => void, reject: (reason?: any) => void, data?: any) => Promise<any>, data?: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: async (tokenResponse: google.accounts.oauth2.TokenResponse) => {
                    localStorage['gapi_token'] = tokenResponse.access_token;
                    localStorage['expires_at'] = new Date().getTime() + 1000 * parseInt(tokenResponse.expires_in);
                    await callback(resolve, reject, data);
                }
            });

            try {
                if (force_gdrive_auth.value || !this.have_valid_token()) {
                    // Prompt the user to select a Google Account and ask for consent to share their data
                    // when establishing a new session.
                    tokenClient.requestAccessToken({prompt: 'consent'});
                    force_gdrive_auth.value = false;
                } else {
                    // Skip display of account chooser and consent dialog for an existing session.
                    // tokenClient.requestAccessToken({prompt: '',});
                    await callback(resolve, reject, data);
                }

            } catch (e) {
                console.error(e);
                localStorage['gapi_token'] = localStorage['expires_at'] = undefined;
                force_gdrive_auth.value = true;
                reject();
            }
        });

    }

    protected async request_files_list(resolve: (value: GDriveFile[]) => void, reject: (reason?: any) => void) {
        try {
            const response = await gapi.client.drive.files.list({
                'pageSize': 200,
                'fields': 'files(name,properties,appProperties,thumbnailLink)',
                'q': `"${this.folder_id}" in parents and mimeType != "application/vnd.google-apps.folder"`
            });

            const files: GDriveFile[] = response.result.files?.map(f => this.factory().init_from_gapi_file(f)) ?? [];

            resolve(files);
        } catch (e) {
            console.error(e);
            reject();
        }
    }

    protected async request_file_with_contents(resolve: (value: any) => void, reject: (reason?: any) => void, fileId: string) {
        try {
            const response = await gapi.client.drive.files.get({fileId, alt: 'media'});
            resolve({content: response.body});
        } catch (e) {
            console.error(e);
            reject();
        }
    }

    abstract save(blob: Blob, filename: string, properties: any) ;

    protected async request_save_file(resolve: (v?: {
        id: string
    }) => void, reject: (reason?: any) => void, form_data: FormData) {
        try {
            const data = await axios.post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true', form_data,
                {headers: {'Authorization': `Bearer ${this.accessToken}`, 'Content-Type': 'multipart/form-data'}});

            resolve({id: data.data.id});
        } catch (e) {
            console.error(e);
            reject();
        }
        resolve();
    }

}


export class GDriveFileImage extends GDriveFile {
    factory() {
        return new GDriveFileImage();
    }

    folder_id = static_objects_folder_id;

    init_from_gapi_file(f: gapi.client.drive.File) {
        super.init_from_gapi_file(f);
        this.properties = {...f.properties, ...f.appProperties, g_colors: f.appProperties?.gc, s_colors: f.appProperties?.sc};
        return this;
    }

    async list_files(): Promise<GDriveFile[]> {
        return await this.do_auth_call((resolve, reject) => this.request_files_list(resolve, reject));
    }

    async save(blob: Blob, filename: string, properties: {
        [p: string]: any
    }) {
        const appProperties: {
            [k: string]: any
        } = {gc: properties.g_colors, sc: properties.s_colors,}

        delete properties.g_colors;
        delete properties.s_colors;

        if (properties.ss_g_colors) {
            appProperties['ssgc'] = properties.ss_g_colors;
            appProperties['sssc'] = properties.ss_s_colors;
            delete properties.ss_g_colors;
            delete properties.ss_s_colors;
        }

        if (properties.ss_g_thickness) {
            appProperties['ssgth'] = properties.ss_g_thickness;
            delete properties.ss_g_thickness;
        }

        if (properties.ss_s_thickness) {
            appProperties['sssth'] = properties.ss_s_thickness;
            delete properties.ss_s_thickness;
        }

        const metadata = {
            name: filename,
            mimeType: "image/png",
            parents: [static_objects_folder_id],
            properties,
            appProperties,
        };

        const form_data = new FormData();
        form_data.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
        form_data.append('file', blob);

        return await this.do_auth_call((resolve, reject) => this.request_save_file(resolve, reject, form_data));
    }
}

export class GDriveFileVideo extends GDriveFile {

    json_file_id: string;
    json_file_name: string;

    factory() {
        return new GDriveFileVideo();
    }

    folder_id = animated_objects_folder_id;

    init_from_gapi_file(f: gapi.client.drive.File) {
        super.init_from_gapi_file(f);
        this.json_file_id = f.appProperties.json_file_id;
        this.json_file_name = f.appProperties.json_file_name;
        return this;
    }

    async list_files(): Promise<GDriveFile[]> {
        return await this.do_auth_call((resolve, reject) => this.request_files_list(resolve, reject));
    }

    async load_details() {
        const file = await this.do_auth_call((resolve, reject) => this.request_file_with_contents(resolve, reject, this.json_file_id));
        const anim_points = JSON.parse(file.content);
        this.properties = {anim_points, ...anim_points[0].val};
    }

    async save(blob: Blob, filename: string, properties: string) {
        //save json file first
        const json_file_name = `${filename}_${Date.now()}`;
        let metadata = {
            name: json_file_name,
            mimeType: "application/json",
            parents: [animated_objects_json_folder_id],
            appProperties: undefined
        };

        let form_data = new FormData();
        form_data.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
        form_data.append('file', new Blob([properties], {type: 'application/json'}));
        const res = await this.do_auth_call((resolve, reject) => this.request_save_file(resolve, reject, form_data));

        //save video file
        metadata = {
            name: filename,
            mimeType: "video/mp4",
            parents: [animated_objects_folder_id],
            appProperties: {
                json_file_id: res.id,
                json_file_name,
            }
        };

        form_data = new FormData();
        form_data.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
        form_data.append('file', blob);

        return await this.do_auth_call((resolve, reject) => this.request_save_file(resolve, reject, form_data));
    }

}



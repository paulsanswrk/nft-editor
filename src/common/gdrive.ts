import axios from "axios";
import {GDriveFile} from "../full_control/common";

const CLIENT_ID = '245623700514-utgsq529q9a820svr8k7djt2l1k3c37l.apps.googleusercontent.com';
const API_KEY = 'AIzaSyA2Nsh3yDFbJT3S84_1CMQGHFkpgdNRX00';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

const SCOPES = 'https://www.googleapis.com/auth/drive';

let tokenClient: google.accounts.oauth2.TokenClient;

const spiral_editor_folder_id: string = '1YXgCu0lUehpJWaYi3hrpbn1AkxJFVyCx';

export async function gdrive_init() {
    // Initializes the client with the API key
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });

    /*tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: async function (tokenResponse: google.accounts.oauth2.TokenResponse) {
        }
    });

    if (gapi.client.getToken() === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({prompt: '',});
    }*/
}

export async function gdrive_save(blob: Blob, filename: string, properties: { [k: string]: any }) {
    const metadata = {
        name: filename,
        mimeType: "image/png",
        parents: [spiral_editor_folder_id],
        properties
    };

    return new Promise<void>((resolve, reject) => {

        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: async function (tokenResponse: google.accounts.oauth2.TokenResponse) {
                var accessToken = gapi.client.getToken().access_token;
                var form = new FormData();
                form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
                form.append('file', blob);

                try {
                    await axios.post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true', form,
                        {headers: {'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'multipart/form-data'}});
                } catch (e) {
                    console.error(e);
                    reject();
                }
                resolve();
            }
        });

        try {
            if (gapi.client.getToken() === null) {
                // Prompt the user to select a Google Account and ask for consent to share their data
                // when establishing a new session.
                tokenClient.requestAccessToken({prompt: 'consent'});
            } else {
                // Skip display of account chooser and consent dialog for an existing session.
                tokenClient.requestAccessToken({prompt: '',});
            }
        } catch (e) {
            console.error(e);
            reject();
        }

    });

}

export async function gdrive_listFiles(): Promise<GDriveFile[]> {
    return new Promise<GDriveFile[]>((resolve, reject) => {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: async function (tokenResponse: google.accounts.oauth2.TokenResponse) {
                try {
                    const response = await gapi.client.drive.files.list({
                        'pageSize': 100,
                        'fields': 'files(name,properties,thumbnailLink,webContentLink,webViewLink)',
                        'q': `"${spiral_editor_folder_id}" in parents and mimeType != "application/vnd.google-apps.folder"`
                    });

                    const files: GDriveFile[] = response.result.files?.map(f => ({
                        name: f.name, properties: f.properties, thumbnailLink: f.thumbnailLink, webContentLink: f.webContentLink, webViewLink: f.webViewLink
                    })) ?? [];

                    resolve(files);
                } catch (e) {
                    console.error(e);
                    reject();
                }

            }
        });

        try {
            if (gapi.client.getToken() === null) {
                // Prompt the user to select a Google Account and ask for consent to share their data
                // when establishing a new session.
                tokenClient.requestAccessToken({prompt: 'consent'});
            } else {
                // Skip display of account chooser and consent dialog for an existing session.
                tokenClient.requestAccessToken({prompt: '',});
            }
        } catch (e) {
            console.error(e);
            reject();
        }


    });
}
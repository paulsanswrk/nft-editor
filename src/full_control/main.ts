/// <reference types="gapi" />
/// <reference types="google.accounts" />
import {createApp} from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
// @ts-ignore
import App from "./App.vue";
import ToastService from 'primevue/toastservice';
// @ts-ignore
import 'bootstrap/dist/css/bootstrap.css'
import {SpiralViewFullControl_instance} from "./SpiralViewFullControl";
import {createRouter, createWebHashHistory} from 'vue-router';
import {gdrive_init, CLIENT_ID} from "../common/GDrive/gdrive_file";

globalThis.__VUE_OPTIONS_API__ = true;
globalThis.__VUE_PROD_DEVTOOLS__ = false;


const app = createApp(App);

app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

app.use(ToastService);
const router = createRouter({
    history: createWebHashHistory(),
    routes: []
});
app.use(router);
function initApp() {
    const loginContainer = document.getElementById('login-container');
    if (loginContainer) loginContainer.style.display = 'none';
    
    const canvasWrapper = document.getElementById('canvas-wrapper');
    if (canvasWrapper) canvasWrapper.style.display = 'block';
    
    const appContainer = document.getElementById('app');
    if (appContainer) appContainer.style.display = 'block';

    app.mount('#app');
    SpiralViewFullControl_instance.init();

    gapi.load('client', async () => {
        await gdrive_init();
    });
}

function handleCredentialResponse(response: any) {
    if (response.credential) {
        initApp();
    }
}

window.onload = function () {
    // @ts-ignore
    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleCredentialResponse
    });
    // @ts-ignore
    google.accounts.id.renderButton(
      document.getElementById("login-container")!,
      { type: "standard", theme: "outline", size: "large" }
    );
};


window.onerror = function (msg, url, line, col, error) {
    // alert(msg)
    if (window['add_error_to_list'])
        window['add_error_to_list'](msg);
};

window.addEventListener('unhandledrejection', function (event) {
    //handle error here
    // alert('Promise rejection: ' + event.reason);
    if (window['add_error_to_list'])
        window['add_error_to_list'](event.reason);
    //event.promise contains the promise object
    //event.reason contains the reason for the rejection
});
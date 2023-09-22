import {createApp} from 'vue';
import PrimeVue from 'primevue/config';
// @ts-ignore
import App from "./App.vue";
import drag from "v-drag";
import ToastService from 'primevue/toastservice';

import 'bootstrap/dist/css/bootstrap.css'
import "primevue/resources/themes/bootstrap4-dark-blue/theme.css";
// import "primevue/resources/themes/bootstrap4-light-blue/theme.css";
import "primevue/resources/primevue.min.css";
import {SpiralViewFullControl_instance} from "./SpiralViewFullControl";
import {useRouter} from 'vue-router';
import {gdrive_init} from "../common/GDrive/gdrive_file";

globalThis.__VUE_OPTIONS_API__ = true;
globalThis.__VUE_PROD_DEVTOOLS__ = false;


const app = createApp(App);

app.use(PrimeVue);
app.use(drag, {
    // global configuration
});
app.use(ToastService);
const router = useRouter();
app.use(router);
app.mount('#app')

SpiralViewFullControl_instance.init();

gapi.load('client', async () => {
    await gdrive_init();
});


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
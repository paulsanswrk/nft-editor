import {createApp} from 'vue';
import PrimeVue from 'primevue/config';
import App from "./App.vue";
import drag from "v-drag";

import 'bootstrap/dist/css/bootstrap.css'
import "primevue/resources/themes/bootstrap4-dark-blue/theme.css";
// import "primevue/resources/themes/bootstrap4-light-blue/theme.css";
import "primevue/resources/primevue.min.css";
import {SpiralViewFullControl_instance} from "./SpiralViewFullControl";
import {gdrive_init} from "../common/gdrive";
import {useRouter} from 'vue-router';

globalThis.__VUE_OPTIONS_API__ = true;
globalThis.__VUE_PROD_DEVTOOLS__ = false;


const app = createApp(App);

app.use(PrimeVue);
app.use(drag, {
    // global configuration
});
const router = useRouter();
app.use(router);
app.mount('#app')

SpiralViewFullControl_instance.init();

gapi.load('client', async () => {
    await gdrive_init();
});



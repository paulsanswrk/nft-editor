import {createApp} from 'vue';
import PrimeVue from 'primevue/config';
import App from "./App.vue";

import 'bootstrap/dist/css/bootstrap.css'
import "primevue/resources/themes/bootstrap4-dark-blue/theme.css";
// import "primevue/resources/themes/bootstrap4-light-blue/theme.css";
import "primevue/resources/primevue.min.css";
import {SpiralViewTop8} from "../top_8_rot/SpiralViewTop8";

globalThis.__VUE_OPTIONS_API__ = true;
globalThis.__VUE_PROD_DEVTOOLS__ = false;


const app = createApp(App);
app.use(PrimeVue);


app.mount('#app')

new SpiralViewTop8().init();

import { createApp } from 'vue'
import { createPinia } from 'pinia'


import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice' 
import Toast from 'primevue/toast';


// MAIN SCSS
import './assets/main.scss'

// PRIME VUE
import 'primevue/resources/themes/aura-light-green/theme.css'   // PrimeVue Theme
import 'primevue/resources/themes/lara-light-blue/theme.css'
import 'primevue/resources/primevue.min.css' // PrimeVue Core
import 'primeicons/primeicons.css' // PrimeVue ICONS


const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(PrimeVue);
app.use(ToastService);
app.use(ConfirmationService) 

app.component("Toast", Toast);

app.mount('#app')

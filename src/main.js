import { createApp } from 'vue'
import { createPinia } from 'pinia'


import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'


// MAIN SCSS
import './assets/main.scss'

// PRIME VUE
import 'primevue/resources/themes/aura-light-green/theme.css'   // PrimeVue Theme
import 'primevue/resources/primevue.min.css' // PrimeVue Core
import 'primeicons/primeicons.css' // PrimeVue ICONS


const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(PrimeVue);

app.mount('#app')

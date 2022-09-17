import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import 'amfe-flexible'
import navbarVue from './components/navbar.vue'
const app = createApp(App)
app.component("navbarVue", navbarVue);
app.use(router)
app.use(createPinia())
app.mount('#app')
export default app
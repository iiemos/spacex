import './assets/main.css'
import './assets/js/web3.min.js'
import './assets/js/player-min.js'
import EventEmitter from 'events';
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n' 
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import i18n from './i18n'
import App from './App.vue'
import router from './router'
import countTo from 'vue3-count-to'

import Vconsole from 'vconsole'
let vConsole = new Vconsole()
 


window.EventEmitter = EventEmitter
const app = createApp(App)

import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
app.use(i18n)
app.use(vConsole)
app.use(ElementPlus)
app
    .component('Footer', Footer)
    .component('Header', Header)
app.use(countTo)
app.use(createPinia())
app.use(router)

app.mount('#app')


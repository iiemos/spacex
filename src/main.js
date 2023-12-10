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

// const messages = {
//     en: () => import('./i18n/en.json'),
//     zh: () => import('./i18n/zh.json'),
//     ko: () => import('./i18n/ko.json'),
//     ja: () => import('./i18n/ja.json'),
//     fr: () => import('./i18n/fr.json'),
// };
// console.log('messages',messages);
// const i18n = createI18n({
//     locale: 'en',
//     fallbackLocale: 'en',
//     messages
// // something vue-i18n options here ...
// })

window.EventEmitter = EventEmitter;
const app = createApp(App)

import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
app.use(i18n)
app.use(ElementPlus)
app
    .component('Footer', Footer)
    .component('Header', Header)
app.use(createPinia())
app.use(router)

app.mount('#app')


import { createI18n } from 'vue-i18n'
import enLocale from './i18n/en.json'
import zhLocale from './i18n/zh.json'
import koLocale from './i18n/ko.json'
import jaLocale from './i18n/ja.json'
import frLocale from './i18n/fr.json'
const messages = {
    en: enLocale,
    'zh-cn': zhLocale,
    ko: koLocale,
    ja: jaLocale,
    fr: frLocale,
};

const i18n = createI18n({
  legacy:false,
  locale: localStorage.getItem('language') || 'en', // 默认语言
  messages
})

export default i18n
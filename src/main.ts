import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import 'amfe-flexible'
import navbarVue from './components/navbar.vue'
import { createI18n } from "vue-i18n";
import en from '../src/assets/language/en.json'
import zhcn from '../src/assets/language/zh-cn.json'
import zhht from '../src/assets/language/zh-tw.json'
document.onselectstart = function () { return false; }

const languageList = {
    "en": en,
    "zh-cn": zhcn,
    "zh-tw": zhht
};
export const getLocale = () => {
    //读取本地存入的当前语言
    const localLanguage = localStorage.getItem('language')
    //如果有返回当前语言
    if (localLanguage) {
        return localLanguage;
    }
    //如果没有，获取系统语言
    let language = navigator.language.toLowerCase();

    if (language == "zh-hk" || language == "zh-mo") {
        language = "zh-tw"
    }
    //获取messages 语言 遍历
    const locales = Object.keys(languageList);
    for (const locale of locales) {
        //如果语言列表里面有系统语言返回
        if (language.indexOf(locale) > -1) {
            return locale;
        }
    }
    // 默认语言 简体中文
    return "zh-cn";
};
const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: getLocale(),
    messages: languageList,
});
const app = createApp(App)
app.component("navbarVue", navbarVue);
app.use(router)
app.use(i18n)
app.use(createPinia())
app.mount('#app')
export default app
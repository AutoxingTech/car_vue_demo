import { createApp, getCurrentInstance, reactive } from 'vue'
import Toast from './Toast.vue'
let timeoutinter: any = ''
const msg = reactive({
    show: false,
    title: '提示',
    time: 2000
})
const $toast = createApp(Toast, { msg }).mount(document.createElement('div'))
const toast = {
    show(title: any = msg.title, time: number = msg.time) { // 控制显示toast的方法
        if (timeoutinter) { clearTimeout(timeoutinter) }
        msg.show = true
        msg.title = title
        document.body.appendChild($toast.$el)
        timeoutinter = setTimeout(() => {
            msg.show = false
            document.body.removeChild($toast.$el)
        }, time);
    }
}
export { toast }
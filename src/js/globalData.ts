import { ref, reactive, nextTick } from "vue"
export const globalData = {
    sn: String,
    businessId: ''
}
export const Logs: any = ref([])
export const setLog = (data: any) => {
    Logs.value.unshift(data)
    if (Logs.value.length > 200) {
        Logs.value.pop()
    }
}

//急停状态
export const CrashStatus = ref(0)
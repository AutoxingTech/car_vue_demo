import { ref, reactive, nextTick } from "vue"
export const globalData = {
    sn: String,
    businessId: ''
}
export const updateMap = ref(true)
export const Logs: any = ref([])
export const setLog = (data: any) => {
    Logs.value.unshift(data)
    if (Logs.value.length > 200) {
        Logs.value.pop()
    }
}
export const cleanLog = () => {
    Logs.value = []
}
export const changeupdateMap = () => {
    updateMap.value = !updateMap.value
}

//急停状态
export const CrashStatus = ref(0)
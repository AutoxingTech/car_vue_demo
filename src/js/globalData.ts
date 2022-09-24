import { ref } from "vue"

export const globalData = {
    sn: String,
    businessId: '',
}

//急停状态
export const CrashStatus = ref(0)
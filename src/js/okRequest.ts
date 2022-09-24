import { baseUrl } from "../js/globalConfig"
import { Axios } from "axios"
import { globalData } from "../js/globalData"
import { ControlLoading } from '../js/settingUtil'
import store from "../store";

const instance = new Axios({
    baseURL: baseUrl,
    timeout: 1000 * 5
});
var TOKEN = ""

export function setToken(token: string) {
    TOKEN = token
    console.log(token)
}

function request(path: string, data: any = {}, method: string = "POST", commonfail: boolean = true, retry: number = 2, showloaddding = false,) {
    console.log("接口请求1:", path, method, data)
    let headers: any = {
        "X-Token": TOKEN,
        "Content-Type": "application/x-www-form-urlencoded"
    }
    if (showloaddding) {
        ControlLoading(true)
    }
    return new Promise((resolve, reject) => {
        let reqfail: Function
        let request = () => {
            instance.request({
                url: path,
                data: data,
                method: method,
                headers: headers,
            }).then((res) => {
                if (res.status == 200) {
                    if (res.data) {
                        let responeData = res.data
                        if ((typeof res.data) == "string") {
                            try {
                                responeData = JSON.parse(res.data)
                            } catch (e) {
                                reqfail("res.data json解析失败")
                            }
                        }
                        if (responeData.status == 200) {
                            ControlLoading(false)
                            console.log("接口内容", responeData.data)
                            resolve(responeData.data)
                        } else {
                            if (responeData.message && responeData.message.length > 0) {
                                reqfail(responeData.message)
                            } else {
                                reqfail("服务器请求失败" + res.status)
                            }
                        }
                    } else {
                        reqfail("服务器无返回值")
                    }
                } else {
                    if (res.statusText && res.statusText.length > 0) {
                        reqfail(res.statusText)
                    } else {
                        reqfail("请求失败http" + res.status)
                    }
                }
            }).catch((err) => {
                reqfail("网络失败")
            })
        }
        reqfail = (err: any) => {
            retry = retry - 1
            if (retry > 0) {
                console.log("重试", retry, err, path, method)
                request()
            } else {
                if (commonfail == true) {
                    //todo 调用通用错误处理
                    console.log("异常内容", err)
                    store().$patch((state: any) => {
                        state.showAbnormal = 1
                    })
                    return new Promise(() => { })
                } else {
                    ControlLoading(false)
                    reject()
                }
            }
        }
        request()
    })
}

export const okRequest = {
    /**
     * 机器人信息
     */
    robotInfo() {
        return request("/robot_soft/info?robotId=" + globalData.sn, null, "get")
    },
    /**
     * 检查更新
     * packageType": "安装包类型：1 = apk; 2 = wgt; 3 = zip
     * businessType": " 业务类型： 1 = 餐厅; 9 = 通用
     * apk 1,9 ,h5 3,2
     */
    upgrade_newest(packageType: number, businessType: number) {
        return request("/upgrade/newest", JSON.stringify({
            packageType: packageType,
            businessType: businessType,
            robotSN: globalData.sn
        }))
    },

    /**
     * 
     * {"robotId": "car_99999999",
     *  "apkVersion": "1.0.0",
     * "appletVersion": "1.0.0",
     * "businessType": 2,
     *"businessScene": //1常规
     * settings
     * extInfo //备用}
     */
    upload_setting(data: object) {
        console.log(data, "param")
        return request("/robot_soft/save", JSON.stringify(data))
    },

    /**
    * 巡游列表信息
    */
    CuriseList() {
        return request("/cruise/list?businessId=" + globalData.businessId, null, "get")
    },

    /**
    * 语音播报内容
    * {
    *"businessId": "60d998a1fccc72d6fd363627",
    *"businessType": 1,
    *"taskType": 1,   // 1=送餐;2=配送;3=巡游;4=引领
    *"robotId": "car_99999999"
    *}
    */
    // return okRequest.broadcast_effect({ "businessId": globalData.businessId, "businessType": 1, "taskType": 3, "robotId": globalData.sn })
    broadcast_effect(data: object) {
        return request("/broadcast/effect", JSON.stringify(data))
    }
}
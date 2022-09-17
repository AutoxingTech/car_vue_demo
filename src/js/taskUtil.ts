import { globalData } from "./globalData"
import router from '../router';
import { reactive } from "vue";
import store from "../store";
import { EmergencyType } from "@autoxing/robot-js-sdk-dev/index.js";
const useStore = store()
//底盘状态
var state: any = {}
var taskId = ""
var isEmergencyStop = false

export var taskInfo = reactive({
    pallet: [{
        name: null,
        status: 0, //0未配送 1正在配送 2已到达 3已完成
    }],//按托盘排列
    list: [{
        name: null,
        status: 0, //0未配送 1正在配送 2已到达 3已完成
        idx: []//托盘位置
    }],//取餐按任务排列
    backPt: {
        name: null,
        status: 0,
        idx: []
    } || null,
    currentTask: {
        name: null,
        status: 0,
        idx: []
    } || null,
    runType: 0
})

// taskType: 2,//2餐厅
// runType: 20,//20 快捷 21多点 22引领 23巡游 24返航 25充电桩

const goTaskUI = (data: any) => {
    taskId = data.taskId
    taskInfo.runType = 0
    globalData.axRobot.getCurrentTask().then((res: any) => {
        console.log("getCurrentTask:", res)
        taskInfo.runType = res.runType
        //构造托盘数据
        let len = undefined
        for (let taskPt of res.taskPts) {
            if (taskPt.ext.len) {
                len = taskPt.ext.len
            }
        }
        if (len == undefined) { //后台任务没有len
            len = res.taskPts.length
        }
        //已获取托盘层数
        const pallet: any = []
        const list: any = []
        for (let i = 0; i < len; i++) {
            pallet.push({
                name: null,
                id: null,
                status: -1
            })
        }
        console.log("_____", len, pallet);
        for (let i in res.taskPts) {
            let ext = res.taskPts[i].ext
            if (ext.idx == undefined) { //后台任务没有len
                ext.idx = [i]
            }

            for (let i = 0; i < ext.idx.length; i++) {//同一个桌号有多个托盘的物品
                let ix = ext.idx[i]
                let pt = pallet[ix]
                console.log(i, ix, pt, ext.name)
                pt.name = ext.name
                pt.id = ext.id
                pt.status = 0
                if (i == 0) {
                    pt.idx = ext.idx
                    list.push(pt)
                }
            }
        }
        taskInfo.pallet = pallet
        taskInfo.list = list
        if (res.backPt) {
            taskInfo.backPt = res.backPt.ext
        } else {
            taskInfo.backPt.name = null
        }
        console.log("goTaskUI_taskInfo", taskInfo)
    }).then(() => {
        router.push({
            path: '/task'
        })
    }).catch((e: any) => {
        console.log(e)
    })
}

//用于通知UI tag 1 餐到了
var UICallBack: any = null

const callBack = (tag: number) => {
    if (UICallBack) {
        UICallBack(tag)
    } else {
        console.log("任务UI未初始化完成")
    }
}

const actExe: any = {

    actType14(data: any) {
        let setData = (data: any) => {
            let name = data.target.name
            for (let pt of taskInfo.list) {
                if (pt.name == name) { //todo 需要改id
                    console.log(name, "出发")
                    pt.status = 1
                    callBack(14)
                }
            }
        }
        if (taskInfo.runType == 0) {
            setTimeout(() => {
                if (taskInfo.runType == 0) {
                    setTimeout(() => {
                        setData(data)
                    }, 1000);
                } else {
                    setData(data)
                }
            }, 1000);
        } else {
            setData(data)
        }

    },

    actType16(data: any) {
        let name = data.current.name
        for (let pt of taskInfo.pallet) {
            if (pt.name == name) { //todo 需要改id
                console.log(name, "达到")
                pt.status = 2
                callBack(16)
            }
        }
    },

    actType1000(data: any) {
        goTaskUI(data)
    },

    actType1001(data: any) {
        //任务完成，，可以返回了
        callBack(1001)
    }
}

//actType:14当前要去的站点 16到达 1000开始 1001完成
const onTaskChanged = (data: any) => {
    console.log("on__Task__Changed:", data)
    let actType = data.actType
    let info = data.data
    if (actExe["actType" + actType]) {
        actExe["actType" + actType](info)
    }
}

const onStateChanged = (data: any) => {
    delete data.timestamp
    delete data.x
    delete data.y
    delete data.yaw
    delete data.speed
    if (JSON.stringify(state) != JSON.stringify(data)) {
        console.log("on____________State__Changed:", data)
        useStore.$patch((state: any) => {
            let robotstatus = JSON.parse(JSON.stringify(data))
            for (let i in robotstatus) {
                state.robotstate[i] = robotstatus[i];
            }
        })
        state = data
        if (isEmergencyStop != data.isEmergencyStop) {
            isEmergencyStop = data.isEmergencyStop
            if (isEmergencyStop == true) {
                router.push({
                    path: '/crashstop'
                })
            } else {
                if (router.currentRoute.value.path == "/crashstop") {
                    router.back()
                }
            }
        }

    }
}

export const taskUtil = {

    init() {

        console.log("-------taskUtil-init---------")

        globalData.axRobot.subscribeTaskState({
            onTaskChanged: onTaskChanged
        })

        globalData.axRobot.subscribeRealState({
            onStateChanged: onStateChanged
        })
    },

    goCheck() {
        return state.locQuality > 70
    },

    setUICallBack(callBack: Function) {
        UICallBack = callBack
    },

    startTask(task: any) {
        console.log("startTask")
        return globalData.axRobot.startTask(task)
    },

    pauseTask() {
        console.log("pauseTask")
        return globalData.axRobot.pauseTask()
    },

    resumeTask() {
        console.log("resumeTask")
        return globalData.axRobot.resumeTask()
    },

    continueTask() {
        console.log("continueTask")
        return globalData.axRobot.continueTask()
    },

    resumeMotion() {
        console.log("continueTask")
        return globalData.axRobot.resumeMotion()
    },

    cancelTask() {
        console.log("cancelTask")
        return globalData.axRobot.cancelTask()
    },

    updateTask(arr: any) {
        console.log("updateTask", taskId, arr)
        return globalData.axRobot.updateTask(taskId, arr)
    },

    emergencyStop() {
        console.log("emergencyStop")
        return globalData.axRobot.setEmergency(EmergencyType.Start)
    },

    cancelEmergencyStop() {
        console.log("cancelEmergencyStop")
        return globalData.axRobot.setEmergency(EmergencyType.Stop).then(() => {
            if (router.currentRoute.value.path == "/crashstop") {
                router.back()
            }
        })
    },

}



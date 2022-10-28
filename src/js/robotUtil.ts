import router from '../router';
import { reactive, ref } from "vue";
import store from "../store";
import settingUtil, { ControlLoading } from './settingUtil'
import { appId, appSecret, robotId, appMode, AXRobot, EmergencyType, MotionType } from "../js/globalConfig";
import { toast } from "../components/Toast/Toast";
import { CrashStatus } from '../js/globalData'
import { Rlog, Levels, Modetags } from './Rlog';
export const MinLocQuality = 70  //定位状态 0～100 70以上可用

export const Lowest_power = 19  //低电量
export const charing: any = ref('')  //记录充电状态 (用于首页进行监听)

var axRobot: any = null
var taskStartTimeout: any = null
var actType0Timeout: any = null
var taskId: any = null

//底盘状态
var state: any = {}
var isEmergencyStop = false
var isError = false
let gocharTime: any = ''

export var taskInfo = reactive({
    pallet: [{
        name: null,
        status: 0, //0未配送 1正在配送 2已到达 3已完成
    }],//按托盘排列
    list: [{
        name: null,
        status: 0, //0未配送 1正在配送 2已到达 3已完成
        idx: [],//托盘位置
        preGet: false
    }],//取餐按任务排列
    backPt: {
        name: null,
        status: 0,
        idx: []
    } || null,
    currentTask: {
        name: "",
        status: 0,
        idx: []
    } || null,
    runType: 0
})

// taskType: 2,//2餐厅
// runType: 20,//20 快捷 21多点 22引领 23巡游 24返航 25充电桩

const goTaskUI = (data: any) => {
    taskInfo.runType = 0
    taskId = data.taskId
    axRobot.getCurrentTask().then((res: any) => {
        Rlog(res, "getCurrentTask:")
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
        for (let i in res.taskPts) {
            let ext = res.taskPts[i].ext
            if (ext.idx == undefined) { //后台任务没有len
                ext.idx = [i]
            }

            for (let i = 0; i < ext.idx.length; i++) {//同一个桌号有多个托盘的物品
                let ix = ext.idx[i]
                let pt = pallet[ix]
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
        Rlog(taskInfo, "goTaskUI_TaskInfo")
    }).then(() => {
        //播放背景音乐
        if (taskInfo.runType == 20 || taskInfo.runType == 21 || taskInfo.runType == 22 || taskInfo.runType == 23) {
            settingUtil.audioPlay(settingUtil.getbackgroundSong())
        }
        clearTimeout(taskStartTimeout)
        ControlLoading(false)
        if (store().isModify) {
            store().$patch((state: any) => {
                state.isModify = false
            })
        }
        if (router.currentRoute.value.path == "/crashstop" && store().tapType == 1) {
            //如果是从任务中急停  并且发充电桩或者待命点的任务
            store().$patch((state: any) => {
                state.tapType = 0
                router.back()
            })
        } else {
            //正常发任务
            if (router.currentRoute.value.path != '/task') {
                router.push({
                    path: '/task'
                })
            }
        }
    })
}

//用于通知UI tag 1 餐到了
var UICallBack: any = null

const callBack = (tag: number) => {
    if (UICallBack) {
        UICallBack(tag)
    } else {
        Rlog("任务UI未初始化完成")
    }
}

const actExe: any = {

    actType14(data: any) {
        let setData = (data: any) => {
            let name = data.target.name
            for (let pt of taskInfo.list) {
                if (pt.name == name) { //todo 需要改id
                    Rlog(name, "出发")
                    pt.status = 1
                }
            }
            callBack(14)
        }
        clearTimeout(actType0Timeout)
        if (taskInfo.runType == 0) {
            actType0Timeout = setTimeout(() => {
                if (taskInfo.runType == 0) {
                    actType0Timeout = setTimeout(() => {
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

        let setData = (data: any) => {
            let name = data.current.name
            for (let pt of taskInfo.pallet) {
                if (pt.name == name) { //todo 需要改id
                    Rlog(name, "达到")
                    pt.status = 2
                }
            }
            callBack(16)
        }

        clearTimeout(actType0Timeout)
        if (taskInfo.runType == 0) {
            actType0Timeout = setTimeout(() => {
                if (taskInfo.runType == 0) {
                    actType0Timeout = setTimeout(() => {
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


    actType40(data: any) {
        callBack(40)
    },

    actType1000(data: any) {
        isError = false
        goTaskUI(data)
    },

    actType1001(data: any) {
        //任务完成，，可以返回了
        settingUtil.audioStop()  //结束播放
        callBack(1001)
    },

    actType1002(data: any) {
        if (data.isWheelOverload == true) { //过载
            settingUtil.AbnormalControl(data.isTakeElevator == true ? 4 : 3)
        } else { //过载清楚了
            return robotUtil.motionForAuto().then(() => {
                return robotUtil.restartTask()
            }).then(() => {
                settingUtil.AbnormalControl(0)
            })
        }
    },
}

//actType:14当前要去的站点 16到达 1000开始 1001完成
const onTaskChanged = (data: any) => {
    Rlog(Modetags.TaskState, "____________", data)
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
        Rlog(Modetags.RealState, "____________", data,)
        store().$patch((state: any) => {
            let robotstatus = JSON.parse(JSON.stringify(data))
            for (let i in robotstatus) {
                state.robotstate[i] = robotstatus[i];
            }
            state.vers = data.vers.hwVer + ' / ' + data.vers.softVer
        })
        state = data

        if (store().showAbnormal == 2 && data.isCharging == true) {
            settingUtil.AbnormalControl(0)
            robotUtil.motionForAuto()
            robotUtil.stopPlayAudio()
        }

        // if (charing.value != data.isCharging) {
        //     //充电状态发生变化
        //     charing.value = data.isCharging
        // }

        if (isEmergencyStop != data.isEmergencyStop) {
            isEmergencyStop = data.isEmergencyStop
            if (isEmergencyStop == true && router.currentRoute.value.path != "/starup" && router.currentRoute.value.path != "/ficsetting") {
                if (router.currentRoute.value.path != '/starup') {
                    router.push({
                        path: '/crashstop'
                    })
                }
            } else {
                if (router.currentRoute.value.path == "/crashstop") {

                    if (CrashStatus.value == 0) {
                        CrashStatus.value = 1
                    }
                    router.back()
                }
            }
        }

        if (isError == false && data.isTasking && data.moveState == "failed") {
            isError = true
            robotUtil.cancelTask().then(() => {
                let abnormalType = 1
                for (let err of data.errors) {
                    if (err == 100 || err == 101) { //对撞失败
                        abnormalType = 2
                        robotUtil.motionForManual()
                        break;
                    }
                }
                settingUtil.AbnormalControl(abnormalType)
            })
            Rlog("===============moveState failed=================")
        }

        for (let err of data.errors) {
            if (err == 20009) { //电动门异常
                robotUtil.cancelTask()
                settingUtil.AbnormalControl(1)
                break;
            }
        }

        if (data.battery <= Lowest_power && router.currentRoute.value.path != '/task' && router.currentRoute.value.path != '/starup' && router.currentRoute.value.path != '/crashstop' && router.currentRoute.value.path != '/ficsetting' && data.isCharging == false) {
            let NowTime = new Date().getTime()
            if (gocharTime == '' || (Math.abs(NowTime - gocharTime) / 1000) > 60) {
                gocharTime = NowTime
                settingUtil.goCharpile(settingUtil.getChargeStation())
            }
        }
    }
}

//不处理异常
const commonR = (promise: any, name: string, reqObj = {}, reqObj2 = {}) => {
    Rlog(Modetags.API, name, "__Req:::", reqObj)
    return promise.then((res: any) => {
        Rlog(Modetags.API, name, "__res>>>", res)
        return Promise.resolve(res)
    }).catch((err: any) => {
        Rlog(Levels.error, Modetags.API, name, "__ERR###", err)
        return Promise.reject(err)
    })
}

//处理异常
const commonP = (promise: any, name: string, reqObj = {}, reqObj2 = {}) => {
    Rlog(Modetags.API, name, "__Req:::", reqObj)
    return promise.then((res: any) => {
        Rlog(Modetags.API, name, "__res>>>", res)
        return Promise.resolve(res)
    }).catch((err: any) => {
        ControlLoading(false)
        settingUtil.AbnormalControl(1)
        Rlog(Levels.error, Modetags.API, name, "__ERR###", err)
        return new Promise(() => { })
    })
}


export const robotUtil = {

    init() {
        Rlog({ appId, appSecret, appMode }, "init")
        axRobot = new AXRobot(appId, appSecret, appMode);
        return commonR(axRobot.init(), "axRobot.init")
    },

    connectRobot() {
        let reqObj = { robotId: robotId }
        return commonR(axRobot.connectRobot(reqObj), "axRobot.connectRobot", reqObj).then((res: any) => {
            axRobot.subscribeTaskState({
                onTaskChanged: onTaskChanged
            })
            axRobot.subscribeRealState({
                onStateChanged: onStateChanged
            })
            return Promise.resolve(res)
        })
    },

    getToken(appMode: any) {
        return commonR(axRobot.getToken(appMode), "axRobot.getToken", appMode)
    },
    getVersion_P() {
        return axRobot.getVersion()
    },

    isTasking() {
        if (state && state.isTasking) {
            return true
        } else {
            return false
        }
    },

    getPoiList(reqObj: any) {
        return commonR(axRobot.getPoiList(reqObj), "axRobot.getPoiList", reqObj)
    },

    getEffectiveAreaList(reqObj: any) {
        return commonR(axRobot.getEffectiveAreaList(reqObj), "axRobot.getEffectiveAreaList", reqObj)
    },
    //是否进行业务绑定
    getBusinessId() {
        return commonR(axRobot.getBusinessId(), "axRobot.getBusinessId")
    },
    setLanguage_R(reqObj: any) {
        return commonR(axRobot.setLanguage(reqObj), "axRobot.setLanguage", reqObj)
    },
    setLanguage_P(reqObj: any) {
        return commonP(axRobot.setLanguage(reqObj), "axRobot.setLanguage", reqObj)
    },
    getState_P() {
        return commonR(axRobot.getState(), "axRobot.getState")
    },

    goCheck_R() {
        return commonR(axRobot.getState(), "axRobot.getState").then((res: any) => {
            return Promise.resolve(res.locQuality > MinLocQuality)
        })
    },

    resetMap(areaId: any) {
        return commonP(axRobot.resetMap(areaId), "axRobot.resetMap", areaId)
    },

    resetPose(pose: any) {
        return commonP(axRobot.resetPose(pose), "axRobot.resetPose", pose)
    },

    motionForAuto() {
        return this._motionFor(MotionType.Auto)
    },

    motionForManual() {
        return this._motionFor(MotionType.Manual)
    },

    _motionFor(type: any) {
        return commonP(axRobot.motionFor(type), "axRobot.motionFor", type)
    },

    startTask(task: any) {
        ControlLoading(true)

        this.getState_P().then((res: any) => {
            if (res.locQuality > MinLocQuality) {
                if (res.battery > Lowest_power) {
                    if (res.isManualMode == true || res.isRemoteMode == true) {
                        return this.motionForAuto().then(() => {
                            return Promise.resolve(1)
                        })
                    } else {
                        return Promise.resolve(1)
                    }
                } else {
                    if (task.runType == 25) {
                        return Promise.resolve(1)
                    } else {
                        return Promise.resolve(3)
                    }
                }
            } else {
                return Promise.resolve(2)
            }

        }).then((res: number) => {
            if (res == 1) {
                clearTimeout(taskStartTimeout)
                taskStartTimeout = setTimeout(() => {
                    Rlog("任务发送超时")
                    ControlLoading(false)
                }, 1000 * 10);
                // commonP(axRobot.createTask(task), "axRobot.startTask", task).then((taskId:any) => {
                //     this.executeTask(taskId)
                // })
                commonP(axRobot.startTask(task), "axRobot.startTask", task)
            } else if (res == 2) {
                toast.show("请复位")
                ControlLoading(false)
            } else if (res == 3) {
                toast.show("电量不足")
                ControlLoading(false)
            }
        })
    },

    executeTask() {
        return commonP(axRobot.executeTask(taskId), "axRobot.executeTask", taskId)
    },

    restartTask() {
        return commonP(axRobot.restartTask(taskId), "axRobot.restartTask", taskId)
    },

    removeWheelOverload() {
        return commonP(axRobot.removeWheelOverload(), "axRobot.removeWheelOverload")
    },

    exportOpreationLogger(level: string, modelTag: string, logdata: any, msg: string) {
        if (axRobot != null && robotId) {
            axRobot.exportOpreationLogger(level, robotId, modelTag, logdata, msg)
        }
    },

    pauseTask() {
        return commonP(axRobot.pauseTask(), "axRobot.pauseTask")
    },

    resumeTask() {
        return commonP(axRobot.resumeTask(), "axRobot.resumeTask")
    },

    continueTask() {
        return commonP(axRobot.continueTask(), "axRobot.continueTask")
    },

    // resumeMotion() {
    //     return commonP(axRobot.resumeMotion(), "axRobot.resumeMotion")
    // },
    stopPlayAudio() {
        commonP(axRobot.stopPlayAudio(), "axRobot.stopPlayAudio")
    },

    cancelTask() {
        this.stopPlayAudio()
        return commonP(axRobot.cancelTask(), "axRobot.cancelTask")
    },


    updateTask(arr: any) {
        return commonP(axRobot.updateTask(taskId, arr), "axRobot.updateTask", taskId, arr)
    },

    _emergency(type: any) {
        return commonP(axRobot.setEmergency(type), "axRobot.emergency", type)
    },

    emergencyStop() {
        return this._emergency(EmergencyType.Start)
    },

    getPoiById(reqObj: any) {
        return commonR(axRobot.getPoiById(reqObj), "axRobot.getPoiById", reqObj)
    },

    updateMap() {
        return commonP(axRobot.updateMap(), "axRobot.updateMap")
    },

    cancelEmergencyStop() {
        return this._emergency(EmergencyType.Stop)
    },

    setUICallBack(callBack: Function) {
        UICallBack = callBack
    },

    setGocharTime() {
        gocharTime = new Date().getTime()
    }

}



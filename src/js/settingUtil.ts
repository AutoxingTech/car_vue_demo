import { robotUtil } from './robotUtil'
import { StandbyPoint, ChargingPile, songlist } from '../js/Datacollation'
import store from '../store'
import { useLoading } from 'vue3-loading-overlay';
import { webRefresh, app } from './android'
import router from '../router';
import { ActionType } from "../js/globalConfig"
export const Loading = useLoading()
export const ControlLoading = (e: boolean) => {
    if (e) {
        Loading.show({ color: '#83A9FF', backgroundColor: '#ffffff', opacity: 0.1, zIndex: 9999 });
    } else {
        let chArr = document.getElementsByClassName("vld-overlay");
        if (chArr) {
            for (var i = 0; i < chArr.length; i++) {
                let charArry: any = chArr[i]
                if (charArry != null) {
                    charArry.parentNode.removeChild(chArr[i]);
                }
            }
        }
    }
}

export default {
    //重启app
    restart() {
        if (!app) {
            store().$patch((state: any) => {
                state.reFresh = true
            })
        }
        webRefresh('')
    },
    //设置为自动模式
    autoModel: () => {
        return robotUtil.motionForAuto()
    },
    //设置为手动模式
    manualModel: () => {
        return robotUtil.motionForManual()
    },
    //充电桩复位
    setPos: (item: any) => {
        return robotUtil.resetPose({ x: item.coordinate[0], y: item.coordinate[1], yaw: item.yaw, areaId: item.areaId })
    },

    //返航 取待命点
    getStandbyStation: () => {
        const useStore: any = store()
        let returnPoin: any = [...StandbyPoint, ...ChargingPile]
        let station: any
        if (!useStore.customSetting.basic.standby || useStore.customSetting.basic.standby == "") {
            station = returnPoin[0]
        } else {
            for (let i of returnPoin) {
                if (i.id == useStore.customSetting.basic.standby) {
                    station = i
                    break
                }
            }
        }
        if (station == null && returnPoin.length > 0) {
            station = returnPoin[0]
        }

        return station
    },

    //取充电桩
    getChargeStation: () => {
        const useStore: any = store()
        let powerPoint: any = ChargingPile
        let station: any
        if (!useStore.customSetting.basic.char || useStore.customSetting.basic.char == "") {
            station = powerPoint[0]
        } else {
            for (let i of powerPoint) {
                if (i.id == useStore.customSetting.basic.char) {
                    station = i
                    break
                }
            }
        }
        if (station == null && powerPoint.length > 0) {
            station = powerPoint[0]
        }
        return station
    },

    //回桩充电
    goCharpile: (standby: any) => {
        robotUtil.setGocharTime()
        const useStore: any = store()
        let task = {
            name: "充电任务" + new Date().getTime(),
            runNum: 1,
            taskType: 2,
            runType: 25,  //25回桩充电
            curPt: {
                ext: {
                    name: "起点",//起点要做的事件
                },
                stepActs: [
                    {
                        type: ActionType.SetSpeed,  //设置速度
                        data: {
                            speed: useStore.customSetting.delivery.runSpeed / 100
                        }
                    },
                ],
            },
            pts: [{
                type: standby.type,
                x: standby.coordinate[0],
                y: standby.coordinate[1],
                yaw: standby.yaw,
                areaId: standby.areaId,
                ext: {
                    name: standby.name,
                    id: standby.id
                },
                stepActs: [

                ],
            }],
            backPt: {}
        };
        robotUtil.startTask(task)
    },

    //返航待命点
    goStandby: (standby: any) => {
        const useStore: any = store()
        let task = {
            name: "返航任务" + new Date().getTime(),
            runNum: 1,
            taskType: 2,
            runType: 24, //返航24
            curPt: {
                ext: {
                    name: "起点",//起点要做的事件
                },
                stepActs: [
                    {
                        type: ActionType.SetSpeed,  //设置速度
                        data: {
                            speed: useStore.customSetting.delivery.runSpeed / 100
                        }
                    },
                ],
            },
            pts: [{
                type: standby.type,
                x: standby.coordinate[0],
                y: standby.coordinate[1],
                yaw: standby.yaw,
                areaId: standby.areaId,
                ext: {
                    name: "返航中",
                    id: standby.id
                },
                stepActs: [
                ],
            }],
            backPt: {}
        };
        robotUtil.startTask(task)
    },


    //取背景音乐
    getbackgroundSong: () => {
        const useStore: any = store()
        let songlists: any = songlist
        let song = null
        if (!useStore.customSetting.sound.musicFile || useStore.customSetting.sound.musicFile == "") {
            song = songlists[0]
        } else {
            for (let i of songlists) {
                if (i.id == useStore.customSetting.sound.musicFile) {
                    song = i
                    break
                }
            }
        }
        if (song == null && songlists.length > 0) {
            song = songlists[0]
        }
        return song.id
    },

    //异常对话框

    AbnormalControl: (e: number) => {
        if (e != 0) {
            if (router.currentRoute.value.path != "/crashstop" && router.currentRoute.value.path != "/ficsetting") {
                store().$patch((state: any) => {
                    state.showAbnormal = e
                })
            }
        } else {
            store().$patch((state: any) => {
                state.showAbnormal = 0
            })
        }
    },
}
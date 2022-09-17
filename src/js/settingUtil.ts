import { globalData } from '../js/globalData'
import { AXRobot, AppMode, MotionType, EmergencyType } from '@autoxing/robot-js-sdk-dev/index.js'
import { StandbyPoint, ChargingPile } from '../js/Datacollation'
import store from '../store'
const useStore: any = store()
const AbnormalShow = () => {
    useStore.$patch((state: any) => {
        useStore.showAbnormal = 1
    })
}
export default {
    //重启app
    restart() {
        console.log("重启app")
    },
    //设置为自动模式
    autoModel: () => {
        return globalData.axRobot.motionFor(MotionType.Auto).catch(() => {
            AbnormalShow()
        })
    },
    //设置为手动模式
    manualModel: () => {
        return globalData.axRobot.motionFor(MotionType.Manual).catch(() => {
            AbnormalShow()
        })
    },
    //充电桩复位
    setPos: (item: any) => {
        return globalData.axRobot.resetMap(item.areaId).then(() => {
            return globalData.axRobot.resetPose({ x: item.coordinate[0], y: item.coordinate[1], yaw: item.yaw }).then(() => {
                return globalData.axRobot.motionFor(MotionType.Auto)
            })
        }).catch(() => {
            AbnormalShow()
        })
    },
    //返航 取待命点
    getStandbyStation: () => {
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
        if (station.type == 9) {
            station.is_charging = true
        }
        return station
    },

    //取充电桩
    getChargeStation: () => {
        let powerPoint: any = ChargingPile
        if (!useStore.customSetting.basic.char || useStore.customSetting.basic.char == "") {
            useStore.customSetting.basic.char = powerPoint[0].id
        }
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
        station.is_charging = true
        return station
    },

}
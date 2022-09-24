import { AXRobot as AXRobotDis, EmergencyType as EmergencyTypeDis, MotionType as MotionTypeDis, AppMode as AppModeDis } from "@autoxing/robot-js-sdk/index.js";
import { AXRobot as AXRobotDev, EmergencyType as EmergencyTypeDev, MotionType as MotionTypeDev, AppMode as AppModeDev } from "@autoxing/robot-js-sdk-dev/index.js";

const storage_key_url = "storage_key_url"
const storage_key_app_mode = "storage_key_app_mode"
const storage_key_sn = "storage_key_robotId"

const url = localStorage.getItem(storage_key_url)
const modeStr = localStorage.getItem(storage_key_app_mode)
const sn = localStorage.getItem(storage_key_sn)

let AXRobot = AXRobotDis
let EmergencyType = EmergencyTypeDis
let MotionType = MotionTypeDis
let AppMode = AppModeDis

let devurl = "https://api.autoxing.com/mobileapp/v1.1"
let disurl =  "https://api.autoxing.com/mobileapp/v1.1"
let SN = sn == null ? '' : sn  // "71822011000140e" //71822011000140e //81822013000871p //A1922066005088c
let host = url == null ? disurl : url
let APPID = ""
let APPSecret = ""
if (host == devurl) {
    AXRobot = AXRobotDev
    EmergencyType = EmergencyTypeDev
    MotionType = MotionTypeDev
    AppMode = AppModeDev
    APPID = ""
    APPSecret = ""
}
let mode = AppMode.LOCAL_APP
if(modeStr){
    mode = parseInt(modeStr)
}
if (mode == AppMode.LOCAL_APP) {//LOCAL_APP //WAN_APP
    SN = ""
}

export const H5Version = '100'



export const baseUrl: any = "https://api.autoxing.com/mobileapp/v1.1"
export const appId = "ax1498b3afe2fd____" 
export const appSecret = "6ff7a110628f4d20822195221eec____"
export const robotId = "23922077002____"  //机器人sn
export const appMode = AppMode.WAN_APP
export const audioMode = 1 //1车机2底盘



export { devurl, disurl, storage_key_url, storage_key_app_mode, storage_key_sn }
export { AXRobot, AppMode, MotionType, EmergencyType }



import { AXRobot as AXRobotDis, EmergencyType as EmergencyTypeDis, MotionType as MotionTypeDis, AppMode as AppModeDis } from "@autoxing/robot-js-sdk/index.js"
const storage_key_url = "storage_key_url"
const storage_key_app_mode = "storage_key_app_mode"
const storage_key_sn = "storage_key_robotId"

let AXRobot = AXRobotDis
let EmergencyType = EmergencyTypeDis
let MotionType = MotionTypeDis
let AppMode = AppModeDis

let devurl = "https://api.autoxing.com/mobileapp/v1.1"
let disurl =  "https://api.autoxing.com/mobileapp/v1.1"


export const H5Version = '100'

export const baseUrl: any = disurl
export const appId = "ax1498b3afe2fd419f" 
export const appSecret = "6ff7a110628f4d20822195221eecf60c"
export const robotId = "239220770025345"  //机器人sn
export const appMode = AppMode.WAN_APP
export const audioMode = 1 //1车机2底盘


export { devurl, disurl, storage_key_url, storage_key_app_mode, storage_key_sn }
export { AXRobot, AppMode, MotionType, EmergencyType }



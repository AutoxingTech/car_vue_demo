import { AXRobot, AppMode } from "@autoxing/robot-js-sdk-dev/index.js";

const storage_key_url = "storage_key_url"


const url = localStorage.getItem(storage_key_url)
// const host=url==null?'https://mobileapp.autoxing.com':url
const host = url == null ? 'https://devapi.autoxing.com/mobileapp/v1.1' : url


export const baseUrl: any = host
export const appId = "xxx" 
export const appSecret = "xxx"

export const audioMode = 1 //1车机2底盘
export const appMode = AppMode.WAN_APP
export const robotId = "xxx"  //机器人sn

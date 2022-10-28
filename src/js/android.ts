import { reactive, ref } from 'vue'
import router from '../router'


export const downloadStatus = reactive({
  progress: 0,//下载进度
  res: 0 //下载结果
})

export const compressStatu = ref(0)

//test todo wife start    //wife监听
export const wifeEvent: any = ref('')
//test todo wife end


const callJSDownloadSuccess = (name: String) => {
  downloadStatus.res = 1
}
const callJSDownloading = (progress: any) => {
  downloadStatus.progress = progress
}
const callJSDownloadFail = (name: any) => {
  downloadStatus.res = -1
}
const callJSCompressDone = (res: number) => {
  compressStatu.value = res
}

//test todo wife start
const callJSBoastCase = (res: any) => {
  wifeEvent.value = res
}


//test todo wife end

export let app: any = null;

export function setWin(win: any) {
  win.callJSDownloadSuccess = callJSDownloadSuccess
  win.callJSDownloading = callJSDownloading
  win.callJSDownloadFail = callJSDownloadFail
  win.callJSCompressDone = callJSCompressDone
  //test todo wife start
  //是否开启wife
  win.callJSBoastCase = callJSBoastCase
  //test todo wife end
  app = win.apk
}

export function download(url: String, path: String, name: String) {
  downloadStatus.progress = 0, downloadStatus.res = 0
  app.actionFromJsDownLoad(url, path, name)
}

export function compress(zipFilePath: String, filepath: String) {
  compressStatu.value = 0
  if (app) {
    app.actionFromJsCompress(zipFilePath, filepath)
  }
}

export function installApk(filepath: String) {
  if (app) {
    app.actionFromJsInstallApk(filepath)
  }
}

export function webRefresh(url: String) {
  if (app) {
    app.actionFromJsWebRefresh(url)
  } else {
    if (router.currentRoute.value.path == '/starup') {
      location.reload()
    } else {
      router.replace('/')
    }
  }
}

export function OpenSetting() {
  if (app) {
    app.actionFromJsOpenSysSetting()
  }
}


export function appVersion() {
  if (app) {
    return app.actionFromJsAppVersion()
  } else {
    return "1.0.1,101"
  }

}

//wifi
export function wifi_command(event: any) {
  if (app) {
    return app.actionFromJsHandleWifi(event)
  }
}

export function saveLogcatToFile() {
  if (app) {
    return app.actionFromJsSaveLogcatToFile()
  }else{
    return null
  }
}

//检测是否连接网络
export function getNetWorkInfo() {
  if (app) {
    return app.actionFromJsNetWorkInfo()
  } else {
    return 1
  }
}
//检测网络是否可用
export function isNetSystemUsable() {
  if (app) {
    return app.actionFromJsNetSystemUsable()
  } else {
    return true
  }
}

//播放背景音乐
export function audioJsPlay(id: any, volume: any) {
  if (app) {
    app.actionFromJsPlay(id, volume)
  }
}
//停止播放音乐
export function audioJsStop() {
  if (app) {
    app.actionFromJsStop()
  }
}





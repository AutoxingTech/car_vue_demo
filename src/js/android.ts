import { reactive, ref } from 'vue'


export const downloadStatus = reactive({
  progress: 0,//下载进度
  res: 0 //下载结果
})

export const compressStatu = ref(0)

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

let app: any = null;

export function setWin(win: any) {
  win.callJSDownloadSuccess = callJSDownloadSuccess
  win.callJSDownloading = callJSDownloading
  win.callJSDownloadFail = callJSDownloadFail
  win.callJSCompressDone = callJSCompressDone
  app = win.apk
}

export function download(url: String, path: String, name: String) {
  downloadStatus.progress = 0, downloadStatus.res = 0
  app.actionFromJsDownLoad(url, path, name)
}

export function compress(zipFilePath: String, filepath: String) {
  compressStatu.value = 0
  if(app){
    app.actionFromJsCompress(zipFilePath, filepath)
  }
}

export function installApk(filepath: String) {
  if(app){
    app.actionFromJsInstallApk(filepath)
  }
}

export function webRefresh(url: String) {
  if(app){
    app.actionFromJsWebRefresh(url)
  }
}

export function appVersion() {
  console.log(app)
  if(app){
    return app.actionFromJsAppVersion()
  }else{
    return "1,1"
  }
  
}


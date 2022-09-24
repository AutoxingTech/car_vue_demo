import { reactive, ref } from 'vue'
import router from '../router'


export const downloadStatus = reactive({
  progress: 0,//下载进度
  res: 0 //下载结果
})

export const compressStatu = ref(0)

//test todo wife start
//是否开启wife
export const wifeEnable = ref('')

//wife info
export const wifeInfo = ref('')
//wife列表
export const wifeList = ref('')

//更改连接状态
export const wifecontentstatue = ref('')

//忘记网络状态
export const forgetwife = ref('')
//连接网络状态
export const connectwife = ref('')

//wife监听
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
const callJSwifiEnable = (res: any) => {
  wifeEnable.value = res
}

const callJSwifInfo = (res: any) => {
  wifeInfo.value = res
}

const callJSwifList = (res: any) => {
  wifeList.value = res
}

const callJSchangeStatu = (res: any) => {
  wifecontentstatue.value = res
}

const callJSforgetWife = (res: any) => {
  forgetwife.value = res
}

const callJSconnectWife = (res: any) => {
  connectwife.value = res
}
const callJSwifeEvent = (res: any) => {
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
  win.callJSwifiEnable = callJSwifiEnable
  //wife详情
  win.callJSwifInfo = callJSwifInfo
  //wife列表
  win.callJSwifList = callJSwifList
  //更改状态
  win.callJSwifList = callJSchangeStatu
  //忘记网络
  win.callJSforgetWife = callJSforgetWife
  //连接网络
  win.callJSconnectWife = callJSconnectWife
  //wife监听
  win.callJSwifeEvent = callJSwifeEvent
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
    router.replace('/')
  }
}

export function OpenSetting() {
  if (app) {
    app.actionFromJsOpenSysSetting()
  }
}


export function appVersion() {
  console.log(app)
  if (app) {
    return app.actionFromJsAppVersion()
  } else {
    return "1.0.1,101"
  }

}


export function wifi_command(event: any) {
  if (app) {
    app.actionFromJsAndriodWife(event)
  }
}



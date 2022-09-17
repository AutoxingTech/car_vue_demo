<script setup lang="ts">
import router from "../router";
// import VueSlider from 'vue-slider-component'
// import 'vue-slider-component/theme/antd.css'
import {
    download,
    downloadStatus,
    compress,
    compressStatu,
    installApk,
    webRefresh,
    appVersion,
} from "../js/android";
import { ref, watch, defineComponent } from "@vue/runtime-core";
import { AXRobot } from "@autoxing/robot-js-sdk/index.js";
import { okRequest, setToken } from "../js/okRequest";
import { initTable } from '../js/Datacollation'
import { appId, appSecret, robotId, appMode } from "../js/globalConfig";
import { globalData } from "../js/globalData";
import { taskUtil } from "../js/taskUtil"
import store from "../store";
import { onBeforeRouteLeave } from "vue-router";
// import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';
let downWatch: Function, compressWatch: Function;
const useStore = store()
const CA = ref(1) //检查机器人状态 0无状态 1正在进行 2 完成
const CB = ref(0)  //检查软件资源
const CC = ref(0)  //设置站点信息
const CD = ref(0)  //检查定位系统图

const CurrentappVersion = ref('1.0.1') // appVersion()   appversion
const CurrentH5Version = ref(globalData.H5Version)  //H5version
const Abnormalcause = ref()  //错误弹框
const downloading = ref(false) //正在下载
const gosetting = ref(false) //是否跳转到设置页
const setposeTip = ref(false)

let timeoutgo: any = ''  //倒计时跳转
let axRobot = new AXRobot(appId, appSecret, appMode);

globalData.axRobot = axRobot


//初始化
axRobot.init().then((res: any) => {
    console.log("axRobot.init()", res)
    return axRobot.connectRobot({
        robotId: robotId,
    })
}).then((res: any) => {
    console.log(res)
    globalData.sn = res.robotId;
    taskUtil.init()
    return axRobot.getToken();
}).then((res: any) => {
    setToken(res);
    return okRequest.robotInfo();
}).then((res: any) => {
    CA.value = 2
    CB.value = 1
    useStore.$patch((state: any) => {
        state.customSetting = res.settings
    })
    console.log(useStore.customSetting)
    return CheackAppVersion()  //检查app版本
}).then(() => {
    return CheckH5Version()    //检查h5版本
}).then(() => {
    CB.value = 2
    CC.value = 1
    return new Promise((resolve, reject) => {
        return initTable(axRobot, resolve, reject)  //设置站点
    })
}).then(() => {
    CC.value = 2
    CD.value = 1
    return axRobot.getState()
}).then((res: any) => {
    return new Promise((resolve) => {  //检查定位信息
        if (res.locQuality > 70) {
            setTimeout(() => {
                resolve(true)
            }, 1000);
        } else {
            setTimeout(() => {
                resolve(false)
            }, 1000);
        }
    })
}).then((res: boolean) => {
    CD.value = 2
    if (res) {
        useStore.$patch((state: any) => {
            state.nextpage = 1
        })
        if (!gosetting.value) {
            timeoutgo = setTimeout(() => {
                redirectPage('/index')
            }, 1500);
        }
    } else {
        setposeTip.value = true
        useStore.$patch((state: any) => {
            state.nextpage = 2
        })
        if (!gosetting.value) {
            timeoutgo = setTimeout(() => {
                redirectPage('/setting')

            }, 1500);
        }
    }
}).catch((error: any) => {
    Abnormalcause.value = error
})
//跳转
function redirectPage(e: any) {
    router.replace({
        path: e
    })
}
//检查app版本  todo
function CheackAppVersion() {
    return new Promise((resolve) => {
        okRequest.upgrade_newest(1, 9).then((res: any) => {
            if (res) {
                if (CurrentappVersion.value != res.data.versionLabel) {
                    //app有更新
                    downloading.value = true
                    upgradeApk(res.url)
                } else {
                    //app无更新 -->
                    resolve(1)
                }
            } else {
                //app无更新 -->
                resolve(1)
            }
        })
        //catch 全局异常弹框
    })
}
//检查H5
function CheckH5Version() {
    return new Promise((resolve) => {
        okRequest.upgrade_newest(3, 1).then((res: any) => {
            if (res) {
                if (CurrentH5Version.value != res.versionLabel) {
                    //h5有更新
                    downloading.value = true
                    upgradeH5(res.url)
                } else {
                    //h5无更新  -->
                    resolve(1)
                }
            } else {
                resolve(1)
            }
        })
        //catch 全局异常弹框
    })
}
//重试刷新
function TryRefresh() {
    webRefresh("");
}
//下载
function upgrade(url: String, name: String) {
    const path = "/storage/emulated/0/Android/data/com.autoxing.delivery/files";
    let pathName = path + "/" + name;

    download(url, path, name);
    if (downWatch) {
        downWatch();
    }
    downWatch = watch(
        () => downloadStatus.res,
        (newvalue, oldvalue) => {
            if (newvalue == 1) {
                //下载成功
                if (name == "dist.zip") {
                    compress(pathName, path);
                } else if (name == "carPad.apk") {
                    installApk(pathName);
                }
            } else if (newvalue == -1) {
                //下载失败
            }
        }
    );
    if (compressWatch) {
        compressWatch();
    }
    compressWatch = watch(
        () => compressStatu.value,
        (newvalue, oldvalue) => {
            if (newvalue == 1) {
                webRefresh("");
                //解压成功
            } else if (newvalue == -1) {
                //解压失败
            }
        }
    );
}
//下载h5路径
function upgradeH5(e: any) {
    const url = e
    const name = "dist.zip"; //carPad.apk
    upgrade(url, name);
}
// 下载apk路径
function upgradeApk(e: any) {
    const url = e
    const name = "carPad.apk"; //carPad.apk dist.zip
    upgrade(url, name);
}
//顶部设置按钮点击
function navsetting() {
    clearTimeout(timeoutgo)
    if (useStore.nextpage != 0) {
        redirectPage('/setting')
    } else {
        router.push({
            path: "/ficsetting",
        });
    }
}
//模拟设置页面返回后跳转
function navPage() {
    timeoutgo = setTimeout(() => {
        redirectPage('/setting')
    }, 1500);
}
//如果点击设置
onBeforeRouteLeave((to, from) => {
    if (to.fullPath == '/ficsetting') {
        gosetting.value = true
    }
})
defineExpose({ navPage, useStore, gosetting });
</script>
<script lang="ts">
export default defineComponent({
    //从上一页返回 获取上一页路径
    beforeRouteEnter(to, from, next) {
        if (from.fullPath == "/ficsetting") {
            next((vm) => {
                const instance: any = vm;
                instance.gosetting = false
                if (instance.useStore.nextpage != 0) {
                    instance.navPage()
                }
            });
        } else {
            next()
        }
    },
});
</script>
<template>
    <div></div>
    <div class="top_header ocenter">
        <img src="../assets/img/logo.png" />
    </div>
    <div class="box_center">
        <div class="mask_starok" v-if="CD==2">
            <div>
                <img src="../assets/img/checksuccess.png" />
            </div>
            <div>
                设备检测成功
                <!-- ,{{ downloadStatus.res }},{{ compressStatu }},{{
                        downloadStatus.progress
                        }} -->
            </div>
        </div>

        <div class="box_header">
            <div>
                <img src="../assets/img/starupico.png" />
                <div>轻舟机器人</div>
            </div>
            <div>设备状态检测</div>
        </div>
        <!-- 各状态检测信息 -->
        <!-- 1 -->
        <div class="one_box noborder">
            <div>检查机器人状态</div>
            <div>
                <img v-if="CA==1" class="loadingico roate_loading" src="../assets/img/loading.png" />
                <img v-if="CA==2" class="loadingico" src="../assets/img/loadingover.png" />
            </div>
        </div>
        <!-- 2 -->
        <div class="one_box">
            <div>检查软件资源</div>
            <div>
                <div class="lefttip" v-if="downloading">更新软件资源</div>
                <img v-if="CB==1" class="loadingico roate_loading" src="../assets/img/loading.png" />
                <img v-if="CB==2" class="loadingico" src="../assets/img/loadingover.png" />
            </div>
        </div>
        <!-- 3 -->
        <div class="one_box">
            <div>设置站点信息</div>
            <div>
                <img v-if="CC==1" class="loadingico roate_loading" src="../assets/img/loading.png" />
                <img v-if="CC==2" class="loadingico" src="../assets/img/loadingover.png" />
            </div>
        </div>
        <!-- 4 -->
        <div class="one_box">
            <div>检查定位系统图</div>
            <div>
                <div class="lefttip" v-if="setposeTip">请去设置画面执行【充电桩复位】</div>
                <img v-if="CD==1" class="loadingico roate_loading" src="../assets/img/loading.png" />
                <img v-if="CD==2" class="loadingico" src="../assets/img/loadingover.png" />
            </div>
        </div>

    </div>
    <div class="set_buttom ocenter" @click="navsetting">
        <img src="../assets/img/set.png" />
        <div>系统设置</div>
    </div>
    <!-- <div class="font1" style="margin-top: -100px" @click="goindex">模拟启动</div>
        <div class="font1" @click="upgradeH5">升级H5</div>
        <div class="font1" @click="upgradeApk">升级APK车机测试</div> -->

    <!-- 流程弹框 -->
    <div class="ocenter startank" v-if="Abnormalcause">
        <div class="portrait horizontal tankcontent">
            <div>
                异常
            </div>
            <div>
                {{Abnormalcause}}
            </div>
            <div @click="TryRefresh">
                重试
            </div>
        </div>
    </div>
    <!-- 地图不匹配弹框 -->
</template>
    
<style scoped>
page {
    background-color: #f1f2f6;
}

.top_header {
    height: 156.5px;
    width: 100%;
}

.top_header>img {
    width: 168px;
    height: 58px;
}

.box_center {
    width: 773px;
    margin: 0 auto;
    border-radius: 35px;
    box-shadow: 1px 1px 15px rgba(0, 0, 0, 0.2);
    position: relative;
}

.box_header {
    height: 95px;
    width: 729px;
    border-bottom: 3px solid #e1e2e3;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 18px;
    box-sizing: border-box;
}

.box_header>div:nth-child(1) {
    display: flex;
    font-size: 23px;
    font-weight: bold;
    color: #83a9ff;
    align-items: center;
}

.box_header>div:nth-child(2) {
    font-size: 23px;
    font-weight: 400;
    color: #333333;
}

.box_header>div:nth-child(1)>img {
    width: 26px;
    height: 26px;
    margin-right: 8px;
}

.one_box {
    /* height: 68px; */
    height: 90.7px;
    border-top: 3px solid #e1e2e3;
    width: 634px;
    margin: 0 auto;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.one_box>div:nth-child(1) {
    font-size: 20px;
    font-weight: 400;
    color: #333333;
}

.one_box>div:nth-child(2) {
    height: 29px;
    display: flex;
    align-items: center;
}

.loadingico {
    width: 29px;
    height: 29px;
    margin-left: 15px;
}

.noborder {
    border: none;
}

.set_buttom {
    width: 191px;
    height: 63.5px;
    background-color: #83a9ff;
    margin: 0 auto;
    /* 4个 +68 */
    position: fixed;
    bottom: 20px;
    left: 50%;
    margin-left: -95.5px;
    /* margin-top: 18px; */
    color: white;
    border-radius: 14px;
    font-size: 23px;
    font-weight: bold;
    z-index: 99999999999 !important;
}

.set_buttom>img {
    width: 30px;
    height: 28px;
    margin-right: 8px;
}

.ficnac {
    width: 191px;
    height: 63.5px;
    background-color: #83a9ff;
    margin: 0 auto;
    margin-top: 18px;
    color: white;
    border-radius: 14px;
    font-weight: bold;
    position: fixed;
    right: 20px;
    bottom: 20px;
    line-height: 63.5px;
    text-align: center;
}

.mask_starok {
    width: 229px;
    height: 110px;
    background: #83a9ff;
    opacity: 0.8;
    border-radius: 31px;
    position: absolute;
    top: 146px;
    left: 50%;
    margin-left: -114.5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.mask_starok>div:nth-child(1)>img {
    width: 30px;
    height: 30px;
}

.mask_starok>div:nth-child(2) {
    font-size: 23px;
    font-weight: bold;
    color: #ffffff;
}


@keyframes rotate {
    0% {
        -webkit-transform: rotate(0deg);
    }

    25% {
        -webkit-transform: rotate(90deg);
    }

    50% {
        -webkit-transform: rotate(180deg);
    }

    75% {
        -webkit-transform: rotate(270deg);
    }

    100% {
        -webkit-transform: rotate(360deg);
    }
}

.roate_loading {
    animation: rotate 1s linear infinite;
}

.startank {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 20;
    background-color: rgba(0, 0, 0, 0.6);
}

.startank>div {
    width: 350px;
    background-color: #fff;
    border-radius: 10px;
}

.tankcontent>div:nth-child(1) {
    line-height: 60px;
    color: #F03800;
    text-align: center;
    font-weight: Bold;
    font-size: 22px;
}

.tankcontent>div:nth-child(2) {
    width: 280px;
    line-height: 32px;
    color: #333333;
    text-align: center;
    font-weight: Bold;
    font-size: 16px;
    margin-top: 10px;
    margin-bottom: 10px;
}

.tankcontent>div:nth-child(3) {
    width: 212px;
    line-height: 44px;
    margin-top: 15px;
    text-align: center;
    background-color: #37E5EB;
    color: #333;
    font-size: 15px;
    font-weight: bold;
    border-radius: 8px;
    margin-bottom: 15px;
}

.lefttip {
    font-size: 20px;
    color: red;
}
</style>
        
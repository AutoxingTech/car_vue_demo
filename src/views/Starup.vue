<script setup lang="ts">
import router from "../router";
import {
    download,
    downloadStatus,
    compress,
    compressStatu,
    installApk,
    webRefresh,
    appVersion,
    getNetWorkInfo,
    isNetSystemUsable
} from "../js/android";
import { ref, watch, defineComponent, reactive } from "@vue/runtime-core";
import { okRequest, setToken } from "../js/okRequest";
import { initTable, setCurrentFloor } from '../js/Datacollation'
import { globalData } from "../js/globalData";
import { robotUtil, MinLocQuality } from "../js/robotUtil"
import { H5Version, AppMode } from "../js/globalConfig";
import store from "../store";
import { onBeforeRouteLeave } from "vue-router";
import { useI18n } from 'vue-i18n'
import { getLocale } from '../main'
import { Rlog } from "../js/Rlog";
const { t } = useI18n()
let downWatch: Function, compressWatch: Function;
const useStore = store()
const CA = ref(1) //检查机器人状态 0无状态 1正在进行 2 完成
const CB = ref(0)  //检查软件资源
const CC = ref(0)  //设置站点信息
const CD = ref(0)  //检查定位系统图

let tap_num = 0 //点击次数
let curTime: any = 0 //当前时间戳
let lastTime: any = 0 //最后一次点击的时间戳

const CurrentappVersion = ref(appVersion())
const CurrentH5Version = ref(H5Version)  //H5version
const Abnormalcause = ref()  //错误弹框
const downloading = ref(false) //正在下载
const gosetting = ref(false) //是否跳转到设置页
const setposeTip = ref(false)
const NetWorkInfo = ref(getNetWorkInfo())
// const isNetUsable = ref(isNetSystemUsable())
const checklist = reactive(
    [{
        id: 0,
        IsCheck: false
    }]
)
const networkOut = ref(0)

let timeoutgo: any = ''  //倒计时跳转

function resetDate() {
    CA.value = 1
    CB.value = 0
    CC.value = 0
    CD.value = 0
    Abnormalcause.value = ''
    downloading.value = false
    gosetting.value = false
    setposeTip.value = false
    timeoutgo = false
    networkOut.value = 0
}

//清除十次点击数据
function cleanData() {
    tap_num = 0
    curTime = 0
    lastTime = 0
}
function initStart() {
    resetDate()
    robotUtil.init().then((res: any) => {
        return robotUtil.connectRobot()
    }).then((res: any) => {
        globalData.sn = res.robotId;
        return robotUtil.getBusinessId()
    }).then((BusinessId: any) => {
        Rlog(BusinessId, "BusinessId")
        return robotUtil.getToken(AppMode.WAN_APP);
    }).then((res: any) => {
        setToken(res);
        return okRequest.robotInfo();
    }).then((res: any) => {
        CA.value = 2
        CB.value = 1
        useStore.$patch((state: any) => {
            state.customSetting = res.settings
            if (!state.customSetting.basic.fontSize || (state.customSetting.basic.fontSize != 0 && state.customSetting.basic.fontSize != 1 && state.customSetting.basic.fontSize != 2)) {
                state.customSetting.basic.fontSize = 0
            }
            localStorage.setItem('adminPass', state.customSetting.basic.adminPass)
            const button = document.getElementById('app') as HTMLButtonElement;
            button.setAttribute("class", 'theme_' + '' + state.customSetting.basic.fontSize + '');
        })
        const currentLanguage = getLocale()  //当前的语言
        let languageindex = 1
        if (currentLanguage == 'zh-cn') {
            languageindex = 1
        } else if (currentLanguage == 'en') {
            languageindex = 2
        } else if (currentLanguage == 'zh-tw') {
            languageindex = 3
        }
        return robotUtil.setLanguage_R(languageindex)
    }).then(() => {
        return CheackAppVersion()  //检查app版本
    }).then(() => {
        return CheckH5Version()    //检查h5版本
    }).then(() => {
        let version = robotUtil.getVersion_P()
        useStore.$patch((state: any) => {
            state.sdkVers = version
        })
        CB.value = 2
        CC.value = 1
        return initTable()  //设置站点
    }).then(() => {
        CC.value = 2
        CD.value = 1
        return robotUtil.getState_P()
    }).then((res: any) => {
        CD.value = 2
        setCurrentFloor(res.areaId)
        useStore.$patch((state: any) => {
            state.robotstate.battery = res.battery
            state.robotstate.isCharging = res.isCharging
        })
        if (res.locQuality > MinLocQuality) {
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

}

function StartPage() {
    //启动 ===> 获取  是否跳过<无网络弹框> 直接执行“跳过”操作
    if (localStorage.getItem('notipcheck') == '1') {
        Rlog("选择了不再提示 执行跳过操作,检测网络")
        chekwifi()
    } else {
        if (NetWorkInfo.value == 1) {
            Rlog("当前网络状态————wifi")
            //有网络的话 检测网络是否可用
            networkOut.value = 0
            chekwifi()
        } else {
            Rlog("未连接wifi")
            //无网络 弹框
            networkOut.value = 1
        }
    }
}
//检测网络是否可用
function chekwifi() {
    if (isNetSystemUsable()) {
        Rlog("网络正常")
        initStart()
    } else {
        Rlog("网络不可用")
        networkOut.value = 2
    }
}

// StartPage()
initStart()
// useStore.$patch((state: any) => {
//     state.showLogs = true
// })
// function getuse() {
//     NetWorkInfo.value = getNetWorkInfo()
//     isNetUsable.value = isNetSystemUsable()
// }


//跳转
function redirectPage(e: any) {
    router.replace({
        path: e
    })
}
//检查app版本 
function CheackAppVersion() {
    return okRequest.upgrade_newest(1, 9).then((res: any) => {
        if (res) {
            if (CurrentappVersion.value.split(',')[1] != res.versionNumber) {
                //app有更新
                downloading.value = true
                upgradeApk(res.url)
                return new Promise(() => { })
            } else {
                //app无更新 -->
                return Promise.resolve(1)
            }
        } else {
            //app无更新 -->
            return Promise.resolve(1)
        }
    })
    //catch 全局异常弹框
}
//检查H5
function CheckH5Version() {
    return okRequest.upgrade_newest(3, 1).then((res: any) => {
        if (res) {
            if (CurrentH5Version.value != res.versionNumber) {
                //h5有更新
                downloading.value = true
                upgradeH5(res.url)
                return new Promise(() => { })
            } else {
                //h5无更新  -->
                return Promise.resolve(1)
            }
        } else {
            return Promise.resolve(1)
        }
    })
}
//重试刷新
function TryRefresh() {
    initStart()
}
//下载
function upgrade(url: String, path: String, name: String) {

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
                Abnormalcause.value = t('starup.wjxzsb')
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
                Abnormalcause.value = t('starup.wjjysb')
            }
        }
    );
}
//下载h5路径
function upgradeH5(e: any) {
    const url = e
    const path = "/storage/emulated/0/Android/data/com.autoxing.delivery/files";
    const name = "dist.zip"; //carPad.apk
    upgrade(url, path, name);
}
// 下载apk路径
function upgradeApk(e: any) {
    const url = e
    const path = "/storage/emulated/0/Download";
    const name = "carPad.apk";
    upgrade(url, path, name);
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

//十击关闭弹框
const startBluetooth = () => {
    let time1: any = new Date()
    tap_num++;
    if (tap_num == 1) {
        curTime = Math.round(time1);
        lastTime = Math.round(time1);
    } else if (tap_num == 10) {
        if (curTime - lastTime < 3000) {
            cleanData()
            Abnormalcause.value = ''
            return;
        } else {
            cleanData()
            return;
        }
    } else {
        lastTime = curTime;
        curTime = Math.round(time1);
        if (curTime - lastTime > 300) {
            cleanData()
        }
    }

}
//如果点击设置
onBeforeRouteLeave((to, from) => {
    if (to.fullPath == '/ficsetting') {
        gosetting.value = true
    }
})
//切换选择
function changeinput() {
    checklist[0].IsCheck = !checklist[0].IsCheck
}
//去wifi设置页面
function gowifi() {
    if (checklist[0].IsCheck == true) {
        Rlog('选择了不再展示非wifi弹框')
        localStorage.setItem('notipcheck', '1')
    }
    networkOut.value = 0
    router.push('./WifeSetting')
}

// 跳过继续执行获取机器人sn	
function skipout() {
    if (checklist[0].IsCheck == true) {
        Rlog('选择了不再展示非wifi弹框')
        localStorage.setItem('notipcheck', '1')
    }
    networkOut.value = 0
    chekwifi()
}

//网络不可用的话就重试
function tryAgain() {
    networkOut.value = 0
    chekwifi()
}
defineExpose({ navPage, useStore, gosetting, chekwifi });
</script>
<script lang="ts">
export default defineComponent({
    //从上一页返回 获取上一页路径
    beforeRouteEnter(to, from, next) {
        if (from.fullPath == "/ficsetting") {
            next((vm) => {
                const instance: any = vm;
                if (instance.useStore.reFresh) {
                    instance.useStore.$patch((state: any) => {
                        state.reFresh = false
                        location.reload()
                    })
                } else {
                    instance.gosetting = false
                    if (instance.useStore.nextpage != 0) {
                        instance.navPage()
                    }
                }
            });
        } else {
            if (from.fullPath == "/WifeSetting") {
                next((vm) => {
                    const instance: any = vm;
                    instance.chekwifi()
                })
            } else {
                next((vm) => {
                    const instance: any = vm;
                    if (instance.useStore.reFresh) {
                        instance.useStore.$patch((state: any) => {
                            state.reFresh = false
                            location.reload()
                        })
                    }
                })
            }
        }
    },
});
</script>
<template>
    <!-- <button @click="getuse" style="width:300px;height: 100px;">看能否可用</button>
    网络类型:
    <span v-if="NetWorkInfo==1">WiFi</span>
    <span v-if="NetWorkInfo==0">SIM网络</span>
    <span v-if="NetWorkInfo==-1">无网络</span>
    可用吗:
    {{isNetUsable}} -->
    <div class="top_header ocenter">
        <img src="../assets/img/logo.png" />
    </div>
    <div class="box_center">
        <div class="mask_totaltip" v-if="CD == 2">
            <div>
                <img src="../assets/img/checksuccess.png" />
            </div>
            <div>
                {{ $t('starup.sbjccg') }}
            </div>
        </div>

        <div class="box_header">
            <div>
                <img src="../assets/img/starupico.png" />
                <div>{{ $t('starup.qzjqr') }}</div>
            </div>
            <div>{{ $t('starup.sbztjc') }}</div>
        </div>
        <!-- 各状态检测信息 -->
        <!-- 1 -->
        <div class="one_box noborder">
            <div>{{ $t('starup.jcjqrzt') }}</div>
            <div>
                <img v-if="CA == 1" class="loadingico roate_loading" src="../assets/img/loading.png" />
                <img v-if="CA == 2" class="loadingico" src="../assets/img/loadingover.png" />
            </div>
        </div>
        <!-- 2 -->
        <div class="one_box">
            <div>{{ $t('starup.jcrjzy') }}</div>
            <div>
                <div class="lefttip" v-if="downloading">{{ $t('starup.gxrjzy') }}</div>
                <img v-if="CB == 1" class="loadingico roate_loading" src="../assets/img/loading.png" />
                <img v-if="CB == 2" class="loadingico" src="../assets/img/loadingover.png" />
            </div>
        </div>
        <!-- 3 -->
        <div class="one_box">
            <div>{{ $t('starup.szzdxx') }}</div>
            <div>
                <img v-if="CC == 1" class="loadingico roate_loading" src="../assets/img/loading.png" />
                <img v-if="CC == 2" class="loadingico" src="../assets/img/loadingover.png" />
            </div>
        </div>
        <!-- 4 -->
        <div class="one_box">
            <div>{{ $t('starup.jcdwxtt') }}</div>
            <div>
                <div class="lefttip" v-if="setposeTip">{{ $t('starup.qqszfw') }}</div>
                <img v-if="CD == 1" class="loadingico roate_loading" src="../assets/img/loading.png" />
                <img v-if="CD == 2" class="loadingico" src="../assets/img/loadingover.png" />
            </div>
        </div>

    </div>
    <div class="set_buttom ocenter" @click="navsetting">
        <img src="../assets/img/set.png" />
        <div>{{ $t('starup.xtsz') }}</div>
    </div>

    <!-- 流程弹框 -->
    <div class="ocenter startank" v-if="Abnormalcause">
        <div class="portrait horizontal tankcontent">
            <div @click="startBluetooth">
                {{ $t('starup.yc') }}
            </div>
            <div>
                {{ Abnormalcause }}
            </div>
            <div @click="TryRefresh">
                {{ $t('starup.cs') }}
            </div>
        </div>
    </div>

    <div class="ocenter startank" v-if="networkOut != 0">
        <div class="portrait horizontal tankcontentip">
            <div>
                {{ $t('starup.ts') }}
            </div>
            <div v-if="networkOut == 1">
                {{ $t('starup.jcdwlkwf') }}
            </div>

            <div v-if="networkOut == 2">
                {{ $t('starup.wjcdkywl') }}
            </div>

            <div @click="changeinput" v-if="networkOut == 1"
                style="height: 25px;width: 280px;font-size: 15px;line-height: 25px;margin-top: 10px;display: flex;align-items: center;">
                <input type="checkbox" :value="checklist[0].id" v-model="checklist[0].IsCheck"
                    style="margin-right: 6px;"><span>
                    {{ $t('starup.qdsbzts') }}</span>
            </div>

            <div v-if="networkOut == 1">
                <div class="twoenter">
                    <div class="tip1" @click="gowifi">
                        {{ $t('index.sz') }}
                    </div>
                    <div class="tip2" @click="skipout">
                        {{ $t('starup.tg') }}
                    </div>
                </div>
            </div>

            <div v-if="networkOut == 2">
                <div class="twoenter">
                    <div class="tip1" @click="gowifi">
                        {{ $t('index.sz') }}
                    </div>
                    <div class="tip2" @click="tryAgain">
                        {{ $t('starup.cs') }}
                    </div>
                </div>
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
    min-width: 191px;
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
    padding: 0 15px;
    box-sizing: border-box;

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

.mask_totaltip {
    width: 240px;
    height: 130px;
    background: #3EC130;
    opacity: 0.8;
    border-radius: 31px;
    position: fixed;
    top: 50%;
    left: 50%;
    margin-top: -55px;
    margin-left: -114.5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    font-weight: bold;
    z-index: 99999;
    box-sizing: border-box;
}


.mask_totaltip>div:nth-child(1)>img {
    width: 30px;
    height: 30px;
}

.mask_totaltip>div:nth-child(2) {
    text-align: center;
    font-size: 23px;
    display: flex;
    align-items: center;
    justify-content: center;
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

.tankcontentip>div:nth-child(1) {
    line-height: 60px;
    color: #F03800;
    text-align: center;
    font-weight: Bold;
    font-size: 22px;
}

.tankcontentip>div:nth-child(2) {
    width: 280px;
    line-height: 32px;
    color: #333333;
    text-align: center;
    font-weight: Bold;
    font-size: 16px;
    margin-top: 10px;
    margin-bottom: 10px;
}

.twoenter {
    width: 240px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

.tip1 {
    width: 105px;
    height: 44px;
    line-height: 44px;
    margin-top: 25px;
    text-align: center;
    background-color: #83a9ff;
    color: white;
    font-size: 15px;
    font-weight: bold;
    border-radius: 8px;
    box-sizing: border-box;
}

.tip2 {
    width: 105px;
    height: 44px;
    line-height: 44px;
    margin-top: 25px;
    text-align: center;
    color: #333;
    font-size: 15px;
    font-weight: bold;
    border-radius: 8px;
    border: 1px solid gray;
    box-sizing: border-box;
}
</style>
        
<template>
    <div class="flexColumn" style="align-items: center;">
        <div class="landscape horizontal" style="width: 1204px;height: 74px;margin: 0 auto;">
            <navbarVue :heights="'79'" />
        </div>
        <div class="container" :style="safeHeight">
            <div class="section">
                <div class="cell">
                    <text class="title" style="color: #5677E7;">WIFI</text>
                    <text v-if="!wifiName" class="subtitle" style="color: #5677E7;">{{ stateToast }}</text>
                    <text class="subtitle">{{ wifiName }}</text>
                    <Soundswitch v-model="wifiEnable"></Soundswitch>
                    <div @click="onSwitchChange"
                        style="height: 60px;width: 80px;position: absolute;right: 60px;z-index: 99;">
                        <div style="height: 60px;width: 80px;"></div>
                    </div>
                </div>
            </div>
            <div class="section scrolls" :style="poiScrollHeight">
                <div v-for="(item, index) in wifiList" :key="index">
                    <div class="cell" @click="onWifiConfirm(item)">
                        <text class="title">{{ item.ssid }}</text>
                        <text class="subtitle">{{ item.ssid == wifiName ? $t('wifi.ylj') : "" }}</text>
                        <img v-if="item.isPwd" src="../assets/img/wifi_pwd.png"
                            style="width: 30px;height: 30px;margin: 0 20px;" />
                        <img src="../assets/img/wifi_icon.png" v-if="item.level == 2"
                            style="width: 30px;height: 30px;margin: 0 20px;" />
                        <img src="../assets/img/wifi_2.png" v-if="item.level == 1"
                            style="width: 30px;height: 30px;margin: 0 20px;" />
                        <img src="../assets/img/wifi_1.png" v-if="item.level != 2 && item.level != 1"
                            style="width: 30px;height: 30px;margin: 0 20px;" />
                    </div>
                    <div class="cell_line"></div>
                </div>
            </div>

            <div v-if="skipShow" class="flexColumnCenter btnSubmit" @click="onSkip">
                <text style="color: #FFFFFF;font-size: 23px;font-weight: bold;">{{ btnTitle }}({{ timeLimit }})</text>
            </div>
        </div>
    </div>

    <div class="model_on" v-if="modelshow != 0">
        <div class="on1">
            <div>{{ currentwife.ssid }}</div>
            <div :class="modelshow == 2 ? 'inp' : 'inp2'"> <input type="text" :placeholder="$t('wifi.qsrmm')"
                    v-model="password" v-if="modelshow == 2"> </div>
            <div class="bottom_tip">
                <div @click="canclmodel">{{ $t('index.qx') }}</div>
                <div @click="forgetpass" v-if="modelshow == 1">{{ $t('wifi.wjwl') }}</div>
                <div v-if="modelshow == 2" @click="connectwifeon">{{ $t('wifi.lj') }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import { toast } from './Toast/Toast';
export default defineComponent({
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            const instance: any = vm;
            instance.onTimeLimit() //开始倒计时
            wifi_command(JSON.stringify({ event: 'openBroadcast' }))
            instance.onwifeEnable()
            // 状态监听
            instance.EventWath = watch(() => wifeEvent.value, (newvalue: any, oldvalue: any) => {
                if (newvalue.event == "wifi_enable") {
                    if (instance.inpagetime.length != 3) {
                        instance.inpagetime.push(1)
                        return
                    }
                    const tmpWifiEnable = parseInt(newvalue.data);
                    if (tmpWifiEnable == 0) {
                        instance.wifiName = instance.t('wifi.zzgb')
                    } else if (tmpWifiEnable == 1) {
                        instance.wifiName = "";
                        if (instance.wifiEnable) {
                            instance.wifiEnable = false;
                            instance.wifiList = [];
                        }
                    } else if (tmpWifiEnable == 2) {
                        instance.wifiName = instance.t('wifi.zzdk')
                    } else if (tmpWifiEnable == 3) {
                        instance.wifiName = "";
                        if (!instance.wifiEnable) {
                            instance.wifiEnable = true
                            instance.onwifiinfo()
                        }
                    }
                } else if (newvalue.event == "wifi_state") {
                    if (instance.inpagetime.length != 3) {
                        instance.inpagetime.push(1)
                        return
                    }
                    if (newvalue.data == "CONNECTED") {
                        let wifiinfo = wifi_command(JSON.stringify({ event: 'info' }))
                        if (wifiinfo && JSON.parse(wifiinfo).data) {
                            clearTimeout(instance.downtime)
                            clearTimeout(instance.downtime2)
                            clearTimeout(instance.downtime3)
                            instance.stateToast = ''
                            instance.wifiConnecting = false
                            instance.wifiName = JSON.parse(wifiinfo).data
                            instance.btnTitle = instance.t('wifi.xyb')
                        } else {
                            instance.wifiName = "";
                        }
                    }
                } else if (newvalue.event == "wifi_password") {
                    if (instance.inpagetime.length != 3) {
                        instance.inpagetime.push(1)
                        return
                    }
                    if (instance.wifiConnecting) {
                        if (newvalue.data == "error")
                            instance.downtime = setTimeout(() => {
                                instance.stateToast = instance.t('wifi.mmcw')
                                instance.downtime2 = setTimeout(() => {
                                    instance.stateToast = "";
                                    instance.wifiConnecting = false
                                    clearTimeout(instance.downtime)
                                    clearTimeout(instance.downtime2)
                                    clearTimeout(instance.downtime3)
                                }, 3000);
                            }, 1000);
                    }

                }
            })
        });
    },
    //关闭监听
    beforeRouteLeave(to, from, next) {
        next((vm) => {
            const instance: any = vm;
            instance.EventWath = ''
            wifi_command(JSON.stringify({ event: ' closeBroadcast' }))
        })
    }
});
</script>

<script lang="ts" setup>
import { computed } from '@vue/reactivity';
import { ref } from 'vue';
import Soundswitch from '../components/Setting/component/WifSwitch.vue'
import { wifi_command, wifeEvent } from "../js/android";
import router from '../router';
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const skipShow = ref(true)  //跳过按钮
const wifiEnable = ref(true)  //开启wife
const wifiConnecting = ref(false)  //是否连接
const wifiName = ref('')
const wifiList: any = ref()
const btnTitle = ref(t('starup.tg'))  //按钮显示内容
const timeLimit = ref(300)   //倒计时
let timeoutId: any = ''
let timeoutIdWifiList: any = ''
const stateToast = ref('')   //提示
const inpagetime = ref([])
const downtime: any = ref('')
const downtime2: any = ref('')
const downtime3: any = ref('')
const safeHeight = computed({
    get() {
        let h = document.documentElement.clientHeight - 158
        return `height: ${h}px`;
    },
    set(value) {
    }
})
const poiScrollHeight = computed({
    get() {
        let h = document.documentElement.clientHeight - 280
        return `height: ${h}px`;
    },
    set(value) {
    }
})
const currentwife: any = ref('') //当前点击的wifi数据
const modelshow = ref(0)  //点击后的弹框
const password = ref('') //输入的密码
const EventWath = ''
const forgetwifi = ref(false)
const onTimeLimit = () => {
    timeoutId = setTimeout(() => {
        if (timeLimit.value > 0) {
            timeLimit.value = timeLimit.value - 1;
            onTimeLimit();
        } else {
            clearTimeout(timeoutId);
            onSkip();
        }
    }, 1000);
}
//hideenmodel操作
const canclmodel = () => {
    modelshow.value = 0
    password.value = ''
}
//忘记网络
const forgetpass = () => {
    stateToast.value = ''
    wifi_command(JSON.stringify({ event: "forget", ssid: currentwife.value.ssid }))
    wifiName.value = "";
    onsearchlist();
    canclmodel()
}
//连接wife
const connectwifeon = () => {
    clearTimeout(downtime3.value)
    clearTimeout(downtime.value)
    clearTimeout(downtime2.value)
    if (password.value && password.value.length >= 8) {
        downtime3.value = setTimeout(() => {
            setTimeout(() => {
                stateToast.value = t('wifi.ljcs')
                setTimeout(() => {
                    stateToast.value = "";
                    wifiConnecting.value = false
                }, 2000);
            }, 1000);
        }, 30 * 1000);
        stateToast.value = t('wifi.zzlj')
        wifi_command(JSON.stringify({ event: "connect", ssid: currentwife.value.ssid, password: password.value }))
        wifiConnecting.value = true;
        wifiName.value = ''
        canclmodel()
    } else {
        toast.show(t("wifi.mmcdbndy"))
    }
}
//点击wife
const onWifiConfirm = (e: any) => {
    currentwife.value = e
    if (wifiName.value == e.ssid) {
        modelshow.value = 1
    } else {
        if (e.isPwd) {
            modelshow.value = 2
        } else {
            wifi_command({ event: "connect", ssid: currentwife.value.ssid, password: "" })
            wifiConnecting.value = true;
            wifiName.value = "";
            stateToast.value = t('wifi.zzlj')
        }
    }
}
//点击跳过
const onSkip = () => {
    clearTimeout(timeoutId)
    timeLimit.value = 300
    router.back()
}

//切换 开启或者关闭wifi
const onSwitchChange = () => {
    wifi_command(JSON.stringify({ event: 'setEnable', enable: !wifiEnable.value }))
}

const onwifiinfo = () => {
    let wifiinfo = wifi_command(JSON.stringify({ event: 'info' }))
    if (wifiinfo && JSON.parse(wifiinfo).data) {
        wifiName.value = JSON.parse(wifiinfo).data
        btnTitle.value = t('wifi.xyb')
    } else {
        wifiName.value = "";
    }
    if (wifiName.value !== "") {
        stateToast.value = "";
    }
    onsearchlist()
}
const onsearchlist = () => {
    let resObj = JSON.parse(wifi_command(JSON.stringify({ event: 'list' })))
    let tmpList = [];
    for (let s of resObj.data) {
        if (s.capabilities.indexOf("EAP") > -1) {
            s.isPwd = true;
            s.type = "eap";
        } else if (s.capabilities.indexOf("WPA") > -1) {
            s.isPwd = true;
            s.type = "wpa";
        } else if (s.capabilities.indexOf("WEP") > -1) {
            s.isPwd = true;
            s.type = "wep";
        } else {
            s.isPwd = false;
        }

        tmpList.push(s);
    }
    wifiList.value = [];
    wifiList.value = tmpList;
}

const onwifeEnable = () => {
    let enablecheck = wifi_command(JSON.stringify({ event: 'enable' }))
    wifiEnable.value = JSON.parse(enablecheck).data
    //如果开启了wifi
    let cheakwife = (e: boolean) => {
        if (e == true) {
            onwifiinfo()
            //检查wife列表
            if (wifiList.value.length == 0) {
                clearTimeout(timeoutIdWifiList)
                timeoutIdWifiList = setTimeout(() => {
                    onsearchlist()
                }, 3000);
            }
        } else {
            wifiName.value = "";
            wifiList.value = [];
        }
    }
    cheakwife(JSON.parse(enablecheck).data)
}

defineExpose({ wifiEnable, wifiName, wifiList, btnTitle, stateToast, timeoutIdWifiList, wifiConnecting, inpagetime, EventWath, downtime, downtime2, downtime3, onTimeLimit, onwifeEnable, onwifiinfo, t });
</script>



<style scoped>
page {
    background-color: #30333F;
}

.scrolls {
    overflow-y: scroll
}

.container {
    width: 100%;
    padding: 0 45px;
    box-sizing: border-box;
}

.section {
    border-radius: 20px;
    background-color: #FFFFFF;
    margin: 10px 0;
}

.section .cell {
    height: 80px;
    margin-left: 33px;
    margin-right: 23px;
    display: flex;
    flex-direction: row;
    align-items: center;
}

.section .cell_line {
    margin: 0 33px;
    background-color: #cfd6f0;
    height: 1px;
}

.section .cell .title {
    font-size: 23px;
    color: #333333;
    flex: 1;
}

.section .cell .subtitle {
    font-size: 16px;
    color: #999999;
    margin-left: 14px;
    text-align: right;
    padding-right: 20px;
}

.setting {
    width: 100px;
    height: 90px;
    align-items: center;
    justify-content: center;
    position: absolute;
    left: 10px;
    bottom: 0px;
}

.btnSubmit {
    background-color: #5677E7;
    border-radius: 16px;
    height: 64px;
    width: 180px;
    position: fixed;
    left: 50%;
    margin-left: -90px;
    line-height: 64px;
    text-align: center;
    bottom: 10px;
}

.model_on {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    z-index: 99999;
    background-color: rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
}

.on1 {
    width: 450px;
    height: 200px;
    background-color: white;
    border-radius: 20px;
    position: relative;

}

.on1>div:nth-child(1) {
    height: 70px;
    line-height: 70px;
    font-weight: bold;
    text-align: center;
    font-size: 23px;
}

.bottom_tip {
    height: 70px;
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    border-top: 1px solid #999999;
    line-height: 70px;
    display: flex;

}

.bottom_tip>div {
    flex: 1;
    text-align: center;
    font-size: 24px;
    color: #007aff;
}

.bottom_tip>div:nth-child(1) {
    border-right: 1px solid #999999;
    color: #000000;
}

.inp {
    height: 50px;
    width: 400px;
    margin: 0 auto;
    border-bottom: 1px solid #999999;
}

.inp2 {
    height: 50px;
    width: 400px;
    margin: 0 auto;
}

.inp2>input {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    font-size: 22px;
}

.inp>input {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    font-size: 22px;
}
</style>

<template>
    <div class="flexColumn" style="align-items: center;">
        <div class="landscape horizontal" style="width: 1204px;height: 74px;margin: 0 auto;">
            <navbarVue :heights="'79'" />
        </div>
        <div class="container" :style="safeHeight">
            <div class="section">
                <div class="cell">
                    <text class="title" style="color: #5677E7;" @click="goLogPage">WIFI</text>
                    <text class="subtitle" style="color: #5677E7;">{{ stateToast}}</text>
                    <text class="subtitle">{{ wifiName}}</text>
                    <Soundswitch v-model="wifiEnable" @change-switch="Changeswitch"></Soundswitch>
                </div>
            </div>
            <div class="section scrolls" :style="poiScrollHeight">
                <div v-for="(item, index) in wifiList" :key="index">
                    <div class="cell" @click="onWifiConfirm(item)">
                        <text class="title">{{item.ssid}}</text>
                        <text class="subtitle">{{item.ssid==wifiName ? '已连接' : ""}}</text>
                        <img v-if="item.isPwd" src="../assets/img/wifi_pwd.png"
                            style="width: 30px;height: 30px;margin: 0 20px;" />
                        <img :src="item.img" style="width: 30px;height: 30px;margin: 0 20px;" />
                    </div>
                    <div class="cell_line"></div>
                </div>
            </div>

            <div v-if="skipShow" class="flexColumnCenter btnSubmit" @click="onSkip">
                <text style="color: #FFFFFF;font-size: 23px;font-weight: bold;">{{btnTitle}}({{timeLimit}})</text>
            </div>
        </div>
    </div>

    <div class="model_on" v-if="modelshow!=0">
        <div class="on1">
            <div>{{currentwife.ssid}}</div>
            <div :class="modelshow==2?'inp':'inp2'"> <input type="text" placeholder="请输入密码" v-model="password"
                    v-if="modelshow==2"> </div>
            <div class="bottom_tip">
                <div @click="canclmodel">取消</div>
                <div @click="forgetpass" v-if="modelshow==1">忘记网络</div>
                <div v-if="modelshow==2" @click="connectwifeon">连接</div>
            </div>
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent, watch } from 'vue';
export default defineComponent({
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            const instance: any = vm;
            instance.onTimeLimit()
            //检查是否开启wife
            wifi_command({ event: 'enable' })
            const wifeEnablewatch = watch(
                () => wifeEnable, (newvalue: any, oldvalue: any) => {
                    instance.wifiEnable = JSON.parse(newvalue).data
                    if (instance.wifiEnable == true) {
                        wifi_command({ event: 'info' })
                    } else {
                        instance.wifiName = "";
                        instance.wifiList = [];
                    }
                }
            );
            //wife信息监听
            const wifeInfowatch = watch(
                () => wifeInfo, (newvalue: any, oldvalue: any) => {
                    const resObj = JSON.parse(newvalue);
                    if (resObj.data) {
                        instance.wifiName = resObj.data;
                        instance.btnTitle = '下一步'
                    } else {
                        instance.wifiName = "";
                    }
                    if (instance.wifiName !== "") {
                        instance.stateToast = "";
                    }
                    wifi_command({ event: 'list' })
                }
            );
            //wife list监听
            const wifeListwatch = watch(
                () => wifeInfo, (newvalue: any, oldvalue: any) => {
                    const resObj = JSON.parse(newvalue);
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
                        if (s.level == 2) {
                            s.img = "../../static/image/wifi_icon.png";
                        } else if (s.level == 1) {
                            s.img = "../../static/image/wifi_2.png";
                        } else {
                            s.img = "../../static/image/wifi_1.png";
                        }
                        tmpList.push(s);
                    }
                    instance.wifiList = [];
                    instance.wifiList = tmpList;
                    //检查wife列表
                    if (instance.wifiList.length == 0) {
                        clearTimeout(instance.timeoutIdWifiList)
                        instance.timeoutIdWifiList = setTimeout(() => {
                            wifi_command({ event: 'list' })
                        }, 3000);
                    }
                }
            );
            //wife状态检测
            const wifecontentstatuewatch = watch(
                () => wifecontentstatue, (newvalue: any, oldvalue: any) => {
                    wifi_command({ event: 'enable' })
                }
            );
            //忘记网络
            const forgetwifewatch = watch(
                () => forgetwife, (newvalue: any, oldvalue: any) => {
                    instance.wifiName = "";
                    wifi_command({ event: 'list' })
                }
            );
            //连接网络
            const connectwifewatch = watch(
                () => connectwife, (newvalue: any, oldvalue: any) => {
                    instance.wifiConnecting = true;
                    instance.wifiName = "";
                    instance.stateToast = '正在连接'
                }
            )
            //状态监听
            const eventReceive = watch(
                () => wifeEvent, (newvalue: any, oldvalue: any) => {

                    if (newvalue.event == "wifi_enable") {
                        const tmpWifiEnable = parseInt(newvalue.data);
                        if (tmpWifiEnable == 0) {
                            instance.wifiName = '正在关闭'
                        } else if (tmpWifiEnable == 1) {
                            instance.wifiName = "";
                            if (instance.wifiEnable) {
                                instance.wifiEnable = false;
                                instance.wifiList = [];
                            }
                        } else if (tmpWifiEnable == 2) {
                            instance.wifiName = instance.$t('settingwifi.zzdk');
                        } else if (tmpWifiEnable == 3) {
                            instance.wifiName = "";
                            if (!instance.wifiEnable) {
                                instance.wifiEnable = true;
                                wifi_command({ event: 'info' })
                            }
                        }
                    } else if (newvalue.event == "wifi_state") {
                        if (newvalue.data == "CONNECTED") {
                            wifi_command({ event: 'info' })
                        }
                    } else if (newvalue.event == "wifi_password") {
                        instance.wifiName = "";
                        if (instance.wifiConnecting) {
                            instance.stateToast = '密码错误'
                            setTimeout(() => {
                                instance.wifiConnecting = false;
                                instance.stateToast = "";
                            }, 3000);
                        }
                    }
                })
        });
    },
});
</script>

<script lang="ts" setup>
import { computed } from '@vue/reactivity';
import { reactive, ref } from 'vue';
import Soundswitch from '../components/Setting/component/WifSwitch.vue'
import { wifi_command, wifeEnable, wifeList, wifeInfo, wifecontentstatue, forgetwife, connectwife, wifeEvent } from "../js/android";
import router from '../router';
const skipShow = ref(true)  //跳过按钮
const wifiEnable = ref(true)  //开启wife
const wifiConnecting = ref(false)  //是否连接
const wifiName = ref('TP-LINK 1007')
const wifiList: any = reactive([
    {
        ssid: 'TP-LINK 1008',
        img: new URL('../assets/img/wifi_icon.png', import.meta.url),
        isPwd: 111
    },
    {
        ssid: 'kasnkajs',
        img: new URL('../assets/img/wifi_icon.png', import.meta.url),
    },
    {
        ssid: 'TP-LINK 1007',
        img: new URL('../assets/img/wifi_icon.png', import.meta.url),
    },
    {
        ssid: 'TP-LINK 1006',
        img: new URL('../assets/img/wifi_icon.png', import.meta.url),
    }
])
const btnTitle = ref('跳过')  //按钮显示内容
const timeLimit = ref(10)   //倒计时
let timeoutId: any = ''
const timeoutIdWifiList = ref(-1)
const stateToast = ref('')   //提示
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
const currentwife: any = ref('')
const modelshow = ref(0)
const password = ref('')

const goLogPage = () => {
}

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
    wifi_command({ event: "forget", ssid: currentwife.value.ssid })
}
//连接wife
const connectwifeon = () => {
    if (password.value && password.value.length > 0) {
        wifi_command({ event: "connect", ssid: currentwife.value.ssid, password: password.value })
    }
}
//点击wife
const onWifiConfirm = (e: any) => {
    currentwife.value = e
    console.log(currentwife.value, "当前wife")
    console.log(wifiName.value, "无线名称")
    if (wifiName.value == e.ssid) {
        modelshow.value = 1
    } else {
        if (e.isPwd) {
            modelshow.value = 2
        } else {
            wifi_command({ event: "connect", ssid: currentwife.value.ssid, password: "" })
        }
    }
}
const onSkip = () => {
    clearTimeout(timeoutId)
    timeLimit.value = 300
    router.back()
}
const Changeswitch = (e: boolean) => {
    // wifi_command({ event: 'setEnable', enable: !wifiEnable.value })
    wifiEnable.value = !wifiEnable.value
    console.log(e, "当前状态")
}
defineExpose({ wifiEnable, wifiName, wifiList, btnTitle, stateToast, timeoutIdWifiList, wifiConnecting, onTimeLimit });
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

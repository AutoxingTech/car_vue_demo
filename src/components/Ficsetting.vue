
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            const instance: any = vm
            if (instance.useStore.showAbnormal == 1) {
                settingUtil.AbnormalControl(0)
            }

            if (from.fullPath == '/starup') {
                instance.passwordControl = true  //输入密码界面
            }
        });
    },
});
</script>
<script setup lang="ts">
import router from '../router';
import { ref, reactive, onMounted } from 'vue'
import settingUtil from '../js/settingUtil';
import store from '../store';
import { toast } from './Toast/Toast';
import { devurl, disurl, storage_key_url, storage_key_app_mode, storage_key_sn } from '../js/globalConfig';
import SettingPassVue from './SettingPass.vue'
import { OpenSetting } from '../js/android';
import { Rlog } from '../js/Rlog';
const useStore = store()
const showrestartApp = ref(false) //是否显示重启app
const passwordControl = ref(true) //控制密码交互界面
const showTapApk = ref(false)  //是否跳转建图APP
const current_Set = ref(4)  //当前展示的左侧部分下标
const hiddenSettings = reactive({
    times: 0,
    visible: false,//显示隐藏
    mode: 0, //0广域 1本地
    serv: 1, //0开发 1生产
    sn: ""
})
//左侧循环列表
const setList: any = [
    {
        id: 0,
        name: 'setting.jcsz',
        img: new URL('../assets/img/setleft1sel.png', import.meta.url),
        img2: new URL('../assets/img/setleft1nosel.png', import.meta.url),
    },
    {
        id: 1,
        name: 'setting.sysz',
        img: new URL('../assets/img/setleft2sel.png', import.meta.url),
        img2: new URL('../assets/img/setleft2nosel.png', import.meta.url),
    },
    {
        id: 2,
        name: 'setting.scsz',
        img: new URL('../assets/img/setleft3sel.png', import.meta.url),
        img2: new URL('../assets/img/setleft3nosel.png', import.meta.url),
    },
    {
        id: 3,
        name: 'setting.xysz',
        img: new URL('../assets/img/setleft4sel.png', import.meta.url),
        img2: new URL('../assets/img/setleft4nosel.png', import.meta.url),
    },
    {
        id: 4,
        name: 'starup.xtsz',
        img: new URL('../assets/img/setleft5sel.png', import.meta.url),
        img2: new URL('../assets/img/setleft5nosel.png', import.meta.url),
    }
]
//功能列表
const modetype: any = reactive([{
    id: 1,
    name: 'setting.zdms',
    sel: false,
    img1: new URL('../assets/img/sys_1notsel.png', import.meta.url),  //未选中
    img2: new URL('../assets/img/sys_1notsel.png', import.meta.url),  //选中

},
{
    id: 2,
    name: 'setting.sdms',
    sel: false,
    img1: new URL('../assets/img/sys_2.png', import.meta.url),  //未选中
    img2: new URL('../assets/img/sys_2.png', import.meta.url),
},
{
    id: 3,
    name: 'setting.cqapp',
    sel: true,
    img1: new URL('../assets/img/sys_3.png', import.meta.url),
    img2: new URL('../assets/img/sys_3.png', import.meta.url),
}, {
    id: 4,
    name: 'setting.cdzfw',
    sel: false,
    img1: new URL('../assets/img/sys_4.png', import.meta.url),
    img2: new URL('../assets/img/sys_4.png', import.meta.url),

},
{
    id: 5,
    name: 'starup.xtsz',
    sel: false,
    img1: new URL('../assets/img/sys_5.png', import.meta.url),
    img2: new URL('../assets/img/sys_5.png', import.meta.url),
},
{
    id: 6,
    name: 'setting.wlan',
    sel: true,
    img1: new URL('../assets/img/sys_6.png', import.meta.url),
    img2: new URL('../assets/img/sys_6.png', import.meta.url),
}])

onMounted(() => {
    let obj: any = localStorage.getItem("hiddenSettings")
    if (obj) {
        obj = JSON.parse(obj)
        hiddenSettings.serv = obj.serv;
        hiddenSettings.mode = obj.mode;
        hiddenSettings.sn = obj.sn;
    }
})
//退出当前页面
function exitSetting() {
    if (useStore.nextpage == 1) {
        router.replace({
            path: '../index'
        })
    } else if (useStore.nextpage == 2) {
        //跳转setting
        router.go(-1)
    } else if (useStore.nextpage == 0) {
        router.go(-1)
    }
}
//跳转建图app弹框控制
function TapApkControl() {
    showTapApk.value = !showTapApk.value
}
//重启和系统设置点击事件
function ModelClick(e: any) {
    if (e == 3) {
        restartApkControl()
    }
    if (e == 5) {
        if (modetype[4].sel == true) {
            OpenSetting()
        }
    }
    if (e == 6) {
        router.push('./wifesetting')
    }
}
//控制重启app确认弹框的显示和隐藏
function restartApkControl() {
    showrestartApp.value = !showrestartApp.value
}
//隐藏密码交互界面
function hiddenPass() {
    passwordControl.value = false
}
//**设置sn */
//**设置网络模式 */
function hiddenSettingsmode(mode: any) {
    hiddenSettings.mode = mode
}
function hiddenSettingsserv(serv: any) {
    hiddenSettings.serv = serv
}
function hiddenSetting() {
    hiddenSettings.times++
    if (hiddenSettings.times % 10 == 9) {
        hiddenSettings.visible = true
        modetype[4].sel = true
    } else {
        hiddenSettings.visible = false
        modetype[4].sel = false
    }
}
function hiddenSettingConfim() {
    if (hiddenSettings.mode == 1) {
        localStorage.setItem(storage_key_app_mode, "1")
        Rlog(storage_key_app_mode, '1')
    } else {
        if (hiddenSettings.sn.length != 15) {
            toast.show("sn长度15")
            return
        } else {
            localStorage.setItem(storage_key_sn, hiddenSettings.sn)
            localStorage.setItem(storage_key_app_mode, "0")
        }
    }
    if (hiddenSettings.serv == 0) {
        localStorage.setItem(storage_key_url, devurl)
        Rlog(storage_key_url, devurl)
    } else {
        localStorage.setItem(storage_key_url, disurl)
        Rlog(storage_key_url, disurl)
    }
    localStorage.setItem("hiddenSettings", JSON.stringify(hiddenSettings))

}
//打开日志
function showLogs() {
    useStore.$patch((state: any) => {
        state.showLogs = true
    })
}
defineExpose({ useStore, passwordControl });

</script>

<template>
    <SettingPassVue :PasswordControl="passwordControl" :defautType="1" @ficback="exitSetting" @passin="hiddenPass" />
    <div class="all">
        <div class="mask_tapapk" v-if="showrestartApp">
            <div class="_makcontent">
                <div class="tip_apk">
                    {{ $t('setting.sfcqcjApp') }}
                </div>
                <div class="tip_meth">
                    <div @click="restartApkControl"> {{ $t('setting.fou') }}</div>
                    <div @click="settingUtil.restart()">{{ $t('setting.shi') }}</div>
                </div>
            </div>
        </div>
        <div class="tip">
            <!-- <navbarVue :heights="'84'" /> -->
        </div>
        <div class="set_content">
            <div class="set_left">
                <div class="set_font1" @click="showLogs">
                    {{ $t('setting.szgl') }}
                </div>

                <div class="set_list">
                    <div class="set_control" v-for="(item, index) in setList" :key="index">
                        <div class="gip" v-if="current_Set == index"></div>
                        <div :class="current_Set == index ? 'control_box' : 'control_box2'">
                            <img :src="current_Set == index ? item.img : item.img2">
                            <div>{{ $t(item.name) }}</div>
                        </div>
                    </div>
                </div>
                <div class="exit_set" @click="exitSetting">{{ $t('setting.tcsz') }}</div>
            </div>

            <div class="set_right">
                <div>
                    <div>
                        <div class="sys_top">
                            <div class="sys_bj font4">{{ $t('setting.bjgn') }}</div>
                            <div class="sys_modetype">
                                <!-- :class="item.sel?'sys_mode_one2':'sys_mode_one'"  -->
                                <div v-for="(item, index) in modetype" :key="index"
                                    :class="item.sel ? 'sys_mode_one2' : 'sys_mode_one'" @click="ModelClick(item.id)">
                                    <img :src="item.img1" style="width:38px;height: 38px;margin-bottom: 13px;">
                                    <div :class="item.sel ? 'f1' : 'f2'">{{ $t(item.name) }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="sys_setting">
                        <div>
                            <div>
                                <span class="sys_span1 font4">{{ $t('setting.dyysz') }}</span>
                            </div>
                            <div>{{ $t('setting.qhyy') }}</div>
                        </div>
                    </div>
                    <div class="sys_setting">
                        <div>
                            <div>
                                <span class="sys_span1 font4">{{ $t('setting.glymm') }}</span>
                            </div>
                            <div>{{ $t('setting.xgmm') }}</div>
                        </div>
                    </div>
                    <div v-if="hiddenSettings.visible" class="sys_user_setting" style="border-radius: 13px 13px 0 0;">
                        <div @click="hiddenSettingsmode(1)"
                            :class="hiddenSettings.mode == 1 ? 'sys_user_setting_sel' : 'sys_user_setting_unsel'">本地模式
                        </div>
                        <div @click="hiddenSettingsmode(0)"
                            :class="hiddenSettings.mode == 0 ? 'sys_user_setting_sel' : 'sys_user_setting_unsel'">广域网模式
                        </div>
                        <input placeholder="SN" v-model="hiddenSettings.sn"
                            style="padding-left: 24px;margin-top: 14px;border-radius: 8px;margin-left: 12px;height: 38px;width: 180px;font-weight: bold;font-size: 18px;color: cornflowerblue;" />
                    </div>
                    <div v-if="hiddenSettings.visible" class="sys_user_setting"
                        style="margin-top: 1px;border-radius:0 0 13px 13px;">
                        <div @click="hiddenSettingsserv(0)"
                            :class="hiddenSettings.serv == 0 ? 'sys_user_setting_sel' : 'sys_user_setting_unsel'">测试环境
                        </div>
                        <div @click="hiddenSettingsserv(1)"
                            :class="hiddenSettings.serv == 1 ? 'sys_user_setting_sel' : 'sys_user_setting_unsel'">生产环境
                        </div>
                        <div style="flex:1"></div>
                        <div @click="hiddenSettingConfim()" class="sys_user_setting_sel"
                            style="margin-right: 32px;background-color: #608FFA;">确定</div>
                    </div>
                    <!-- <div class="sys_setting">
                        <div>
                            <div>
                                <span class="sys_span1 font4">车机建图APP</span>
                            </div>
                            <div @click="">进入车机建图</div>
                        </div>
                    </div> -->
                    <div class="sys_message">
                        <div @click="hiddenSetting()" class="sys_message_top font4">{{ $t('setting.xtxx') }}</div>
                        <div class="sys_onemessage">
                            <div>{{ $t('setting.jqrlx') }}</div>
                            <div>{{ $t('setting.zwsj') }}</div>
                        </div>

                        <div class="sys_onemessage">
                            <div>{{ $t('setting.jqrsn') }}</div>
                            <div>{{ $t('setting.zwsj') }}</div>
                        </div>

                        <div class="sys_onemessage">
                            <div>{{ $t('setting.jqrbb') }}</div>
                            <div>{{ $t('setting.zwsj') }}</div>
                        </div>
                        <div class="sys_onemessage">
                            <div>{{ $t('setting.jqrdpbb') }}</div>
                            <div>{{ $t('setting.zwsj') }}</div>
                        </div>
                        <div class="sys_onemessage noborder">
                            <div>{{ $t('setting.jqrbssj') }}</div>
                            <div>{{ $t('setting.zwsj') }}</div>
                        </div>
                    </div>
                    <div class="emptyline"></div>
                    <div class="mask_tapapk" v-if="showTapApk">
                        <div class="_makcontent">
                            <div class="tip_apk">
                                {{ $t('setting.sftz') }}
                            </div>
                            <div class="tip_meth">
                                <div @click="TapApkControl">{{ $t('setting.fou') }}</div>
                                <div @click="TapApkControl">{{ $t('setting.shi') }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
    
<style scoped>
.all {
    background-color: #F1F2F6;
}

.tip {
    height: 24px;
    width: 1255px;
    margin: 0 auto;
}

.set_content {
    width: 100%;
    display: flex;
    height: calc(100% - 24px);
}

.set_left {
    width: 323px;
    height: calc(100vh - 24px);
    background-color: white;
    border-radius: 0px 13px 13px 0px;
    position: relative;
}

.set_right {
    width: 908px;
    height: calc(100vh - 24px);
    margin-left: 29px;
    overflow-y: scroll;

}


.set_font1 {
    height: 90px;
    line-height: 90px;
    padding-left: 74px;
    font-size: 25px;
    font-weight: bold;
    color: #83A9FF;

}

.exit_set {
    height: 51px;
    width: 250px;
    position: absolute;
    left: 50%;
    margin-left: -125px;
    background-color: #608FFA;
    font-size: 19px;
    font-weight: bold;
    color: #FFFFFF;
    text-align: center;
    bottom: 18px;
    line-height: 51px;
    border-radius: 9px;
}

.set_list {
    height: 350px;
    display: flex;
    flex-direction: column;
    align-content: space-between;
}

.set_control {
    height: 64px;
    color: white;
    font-weight: bold;
    font-size: 20px;
    display: flex;
    position: relative;
}

.gip {
    height: 100%;
    width: 9px;
    background-color: #83A9FF;
    border-radius: 0px 8px 8px 0px;
    position: absolute;
    left: 0;
    top: 0;
}

.control_box {
    display: flex;
    align-items: center;
    height: 100%;
    width: 285px;
    background-color: #83A9FF;
    border-radius: 13px 0px 0px 13px;
    position: absolute;
    right: 0;
}

.control_box2 {
    display: flex;
    align-items: center;
    height: 100%;
    width: 285px;
    position: absolute;
    right: 0;
    border-radius: 13px 0px 0px 13px;
    color: #666666;
    font-weight: 400;
}

.control_box2>img {
    width: 24px;
    height: 24px;
    margin: 0 14px 0 34px;
}

.control_box>img {
    width: 24px;
    height: 24px;
    margin: 0 14px 0 34px;
}

.sys_top {
    width: 100%;
    height: 192px;
    background-color: #ffffff;
    border-radius: 13px;
}

.sys_bj {
    height: 80px;
    width: 850px;
    display: flex;
    align-items: center;
    font-weight: 400;
    color: #333333;
    margin: 0 auto;
}

.sys_modetype {
    width: 850px;
    height: 96px;
    display: flex;
    justify-content: space-between;
    margin: 0 auto;
}

.sys_mode_one {
    height: 96px;
    width: 130px;
    background-color: #F1F2F6;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: bold;
    color: #666666;
    border-radius: 6px;

}

.sys_mode_one2 {
    height: 96px;
    width: 130px;
    background-color: #83A9FF;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: bold;
    color: #333333;
    border-radius: 6px;
}

.sys_mode_one>img {
    width: 38px;
    height: 38px;
    margin-bottom: 10px;

}


.sys_user_setting {
    width: 100%;
    background: #FFFFFF;
    border-radius: 13px;
    margin-top: 12px;
    position: relative;
    display: flex;
    flex-direction: row;
}

.sys_user_setting_sel {
    height: 42px;
    line-height: 42px;
    border-radius: 8px;
    width: 120px;
    font-size: 18px;
    color: #333;
    text-align: center;
    margin: 12px 12px 12px 24px;
    background-color: #83A9FF
}

.sys_user_setting_unsel {
    height: 42px;
    line-height: 42px;
    border-radius: 8px;
    width: 120px;
    font-size: 18px;
    color: #666;
    text-align: center;
    margin: 12px 12px 12px 32px;
    background-color: #F1F2F6;
}

.sys_setting {
    height: 86px;
    width: 100%;
    background: #FFFFFF;
    border-radius: 13px;
    margin-top: 12px;
    position: relative;
}

.sys_setting>div {
    width: 850px;
    height: 100%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.now_lan {
    height: 100%;
    position: absolute;
    right: 180px;
    font-size: 16px;
    font-weight: bold;
    color: #83A9FF;
    left: -80px;
    white-space: nowrap;
}

.sys_setting>div>div:nth-child(1) {
    display: flex;
    align-items: center;
}

.sys_setting>div>div:nth-child(2) {
    min-width: 120px;
    padding: 0 25px;
    box-sizing: border-box;
    background: #F1F2F6;
    border-radius: 13px;
    font-size: 16px;
    font-weight: bold;
    color: #666666;
    text-align: center;
    line-height: 40px;
}

.sys_span1 {
    font-weight: 400;
    color: #333333;
}

.sys_message {
    background-color: #ffffff;
    border-radius: 13px;
    margin-top: 13px;
}

.sys_message_top {
    height: 58px;
    width: 850px;
    margin: 0 auto;
    line-height: 75px;
    font-weight: bold;
    color: #5677E7;
}

.sys_onemessage {
    height: 62px;
    width: 850px;
    margin: 0 auto;
    border-bottom: 1px solid #636468;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.sys_onemessage>:nth-child(1) {
    font-size: 16px;
    font-weight: bold;
    color: #666666;
}

.sys_onemessage>:nth-child(2) {
    font-size: 16px;
    font-weight: 400;
    color: #666666;
}

.noborder {
    border-bottom: none;
}

.emptyline {
    height: 16px;
}

.mask_tapapk {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 99;
}

._makcontent {
    width: 535px;
    height: 237px;
    background-color: #F3F3F3;
    border-radius: 15px;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -267.5px;
    margin-top: -118px;

}

.tip_apk {
    width: 485px;
    height: 124px;
    background: #FFFFFF;
    border-radius: 15px;
    margin: 0 auto;
    margin-top: 19px;
    text-align: center;
    line-height: 124px;
    font-size: 19px;
    font-weight: bold;
    color: #333333;
}



.tip_meth {
    display: flex;
    justify-content: space-between;
    height: 50px;
    width: 400px;
    margin: 0 auto;
    text-align: center;
    line-height: 50px;
    margin-top: 22px;

}

.tip_meth>div:nth-child(1) {
    width: 173px;
    background: #E5E5E5;
    border-radius: 6px;
    font-size: 16px;
    font-weight: bold;
    color: #333333;
}

.tip_meth>div:nth-child(2) {
    width: 173px;
    background: #608FFA;
    border-radius: 6px;
    font-size: 16px;
    font-weight: bold;
    color: white;
}

.f1 {
    color: black;
}

.f2 {
    color: #666666;
}
</style>
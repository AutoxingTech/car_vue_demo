
<script lang="ts" setup>
import { ref, reactive } from 'vue';
import switchLanguage from './component/Switchlanguage.vue'
import store from '../../store';
import settingUtil from '../../js/settingUtil'
import { chargingPile, standbyPoint } from '../../js/Datacollation'
import { globalData, changeupdateMap } from '../../js/globalData';
import { ControlLoading } from '../../js/settingUtil'
import { toast } from '../Toast/Toast'
import { OpenSetting, appVersion } from '../../js/android'
import { H5Version } from '../../js/globalConfig'
import router from '../../router';
import { useI18n } from 'vue-i18n'
import { getLocale } from '../../main'
import { robotUtil } from "../../js/robotUtil"
import { initTable, setCurrentFloor } from '../../js/Datacollation'
import BaseSettingtank from './component/BaseSettingtank.vue';
import { Rlog } from '../../js/Rlog';
const { locale, t } = useI18n()

const useStore: any = store()
const CurrentappVersion = ref(appVersion())
const modetype: any = reactive([{
    id: 1,
    name: 'setting.zdms',
    sel: true,
    img1: new URL('../../assets/img/sys_1notsel.png', import.meta.url),  //未选中
    img2: new URL('../../assets/img/sys_1.png', import.meta.url),  //选中

},
{
    id: 2,
    name: 'setting.sdms',
    sel: false,
    img1: new URL('../../assets/img/sys_2.png', import.meta.url),  //未选中
    img2: new URL('../../assets/img/sys_1sel.png', import.meta.url),
},
{
    id: 3,
    name: 'setting.cqapp',
    sel: false,
    img1: new URL('../../assets/img/sys_3.png', import.meta.url),
    img2: new URL('../../assets/img/sys_3.png', import.meta.url),
}, {
    id: 4,
    name: 'setting.cdzfw',
    sel: false,
    img1: new URL('../../assets/img/sys_4.png', import.meta.url),
    img2: new URL('../../assets/img/sys_4.png', import.meta.url),
}, {
    id: 5,
    name: 'setting.gxdt',
    sel: false,
    img1: new URL('../../assets/img/sys_5.png', import.meta.url),
    img2: new URL('../../assets/img/sys_5.png', import.meta.url),
},
{
    id: 6,
    name: 'setting.wlan',
    sel: false,
    img1: new URL('../../assets/img/sys_6.png', import.meta.url),
    img2: new URL('../../assets/img/sys_6.png', import.meta.url),
}
])
const showChangeLan = ref(false)  //是否显示选择语言弹框

const currentLanguage = ref(getLocale())  //当前的语言
const showTapApk = ref(false)  //是否显示跳转apk
const showrestartApp = ref(false) //是否显示重启app
const showchangePass = ref(false)//是否显示更改密码

const password1 = ref() //原密码
const password2 = ref() //新密码
const password3 = ref() //确认新密码

const clickTimes = ref(0)
const settingVisible = ref(false)

const standbyPointList: any = standbyPoint  //待命点列表
const chargingPileList: any = chargingPile  //充电桩
const defaultstandby = ref(0) //默认待命点
const defaultcharplie = ref(0) //默认充电桩
const charname = ref() //充电桩name
const standbyname = ref() //待命点name
const controlType = ref(0)  //控制弹框相应显示内容
const baseset: any = ref<null | HTMLElement>(null);
//控制只能输入四个
const setinputc = (item: any, e: number) => {
    if (e == 1) {
        if (password1.value.length > 4) {
            password1.value = String(password1.value).slice(0, 4)
        }
    } else if (e == 2) {
        if (password2.value.length > 4) {
            password2.value = String(password2.value).slice(0, 4)
        }
    } else if (e == 3) {
        if (password3.value.length > 4) {
            password3.value = String(password3.value).slice(0, 4)
        }
    }

}

//控制修改密码的显示和隐藏
const tapChangepass = () => {
    password1.value = ''
    password2.value = ''
    password3.value = ''
    showchangePass.value = !showchangePass.value
}
//确认修改密码
const Changepassword = () => {
    if (password1.value && password2.value && password3.value) { //判断原密码和两次输入的新密码是否为空
        if (password1.value == useStore.customSetting.basic.adminPass) {  //判断原密码是否相同
            if (password2.value.length == 4 && password3.value.length == 4) {  //判断两次输入的密码是否都是4位
                if (password2.value == password3.value) {  //判断两次输入的密码是否相同
                    if (password1.value !== password2.value) { //判断原密码和旧密码是否相同
                        useStore.$patch((state: any) => {  //成立修改
                            state.customSetting.basic.adminPass = password2.value
                        })
                        tapChangepass()
                        toast.show(t('setting.xgcg'))
                    } else {
                        toast.show(t('setting.xmmyymmxt'))
                    }
                } else {
                    toast.show(t('setting.lcsrmmbxt'))
                }

            } else {
                toast.show(t('setting.qwsggnr'))
            }
        } else {
            toast.show(t('setting.ymmbzq'))
        }

    } else {
        toast.show(t('setting.qwsggnr'))
    }
    //todo
    // showchangePass.value = !showchangePass.value
}
//控制跳转建图app的显示和隐藏
const TapApkControl = () => {
    showTapApk.value = !showTapApk.value
}
//控制重启app确认弹框的显示和隐藏
const restartApkControl = () => {
    showrestartApp.value = !showrestartApp.value
}
//确认跳转建图app
const TapAPK = () => {
    //to do
    showTapApk.value = !showTapApk.value
}
//控制修改语言的显示和隐藏
const Changelanguage = () => {
    showChangeLan.value = !showChangeLan.value
}
//修改语言确定
const Setlanguage = (e: any) => {
    currentLanguage.value = e
    localStorage.setItem('language', e)
    locale.value = e
    showChangeLan.value = !showChangeLan.value
    let languageindex = 1
    if (e == 'zh-cn') {
        languageindex = 1
    } else if (e == 'en') {
        languageindex = 2
    } else if (e == 'zh-tw') {
        languageindex = 3
    }
    robotUtil.setLanguage_P(languageindex)
}
//点击便捷功能
const ModelClick = (e: number) => {
    if (e == 1) {
        //点击自动模式
        ControlLoading(true)
        settingUtil.autoModel().then(() => {
            ControlLoading(false)
        })
    } else if (e == 2) {
        // 点击手动模式
        ControlLoading(true)
        settingUtil.manualModel().then(() => {
            ControlLoading(false)
        })
    } else if (e == 3) {
        //点击重启App
        restartApkControl()
    } else if (e == 4) {
        // 点击充电桩复位
        ControlLoading(true)
        if (!useStore.customSetting.basic.char) {
            useStore.$patch((state: any) => {
                state.customSetting.basic.char = chargingPileList.value[0].id
            })
        }
        for (let item of chargingPileList.value) {
            if (useStore.customSetting.basic.char == item.id) {
                return settingUtil.setPos(item).then(() => {
                    ControlLoading(false)
                    if (item.areaId) {
                        setCurrentFloor(item.areaId)
                    }
                    toast.show(t('setting.cdzfwcg'))
                })
            }
        }
    } else if (e == 5) {
        // 点击系统设置
        ControlLoading(true)
        robotUtil.updateMap().then(() => {
            return initTable()  //设置站点
        }).then(() => {
            return robotUtil.getState_P()
        }).then((res: any) => {
            setCurrentFloor(res.areaId)
            changeupdateMap()
            setstand() //更新当前页面的充电桩待命点以及弹框组件内的内容
            ControlLoading(false)
        })
    } else if (e == 6) {
        //点击WLAN
        router.push({
            path: '/WifeSetting'
        })
    }
}

function hiddenSetting() {
    clickTimes.value++
    if (clickTimes.value % 10 == 9) {
        settingVisible.value = !settingVisible.value
        clickTimes.value = 0
    }
}
//充电桩 待命点弹框显示
function TankControl(e: number) {
    controlType.value = e
    if (e == 3 || e == 5) {
        baseset.value.setcur()
    }
}
//回充电桩
function gochargepile() {
    settingUtil.goCharpile(settingUtil.getChargeStation())
}
//返航
function gostandby() {
    settingUtil.goStandby(settingUtil.getStandbyStation())
}

//修改待命点
function ChangeStand(e: number) {
    const type: number = e
    useStore.$patch((state: any) => {
        state.customSetting.basic.standby = type
        defaultstandby.value = type
    })
    for (var i of standbyPointList.value) {
        if (i.id == useStore.customSetting.basic.standby) {
            standbyname.value = i.name
            break
        }
    }
    controlType.value = 0
}

//修改充电桩
function ChangeChar(e: number) {
    const type: number = e
    useStore.$patch((state: any) => {
        state.customSetting.basic.char = type
        defaultcharplie.value = type
    })
    for (var i of chargingPileList.value) {
        if (i.id == useStore.customSetting.basic.char) {
            charname.value = i.name
            break
        }
    }
    controlType.value = 0
}

//设置 充电桩和待命点（不存在 及 存在areaid但是不存在站点的处理）
function setstand() {
    defaultstandby.value = 0
    defaultcharplie.value = 0
    charname.value = ''
    standbyname.value = ''
    if (!useStore.customSetting.basic.standby) {
        defaultstandby.value = standbyPointList.value[0].id
        useStore.$patch((state: any) => {
            state.customSetting.basic.standby = standbyPointList.value[0].id
        })
    } else {
        defaultstandby.value = useStore.customSetting.basic.standby
    }
    for (var i of standbyPointList.value) {
        if (i.id == useStore.customSetting.basic.standby) {
            standbyname.value = i.name
            break
        }
    }
    //设置里的站点如果不存在
    if (!standbyname.value) {
        defaultstandby.value = standbyPointList.value[0].id
        useStore.$patch((state: any) => {
            state.customSetting.basic.standby = standbyPointList.value[0].id
        })
        standbyname.value = standbyPointList.value[0].name
    }


    if (!useStore.customSetting.basic.char) {
        defaultcharplie.value = chargingPileList.value[0].id
        useStore.$patch((state: any) => {
            state.customSetting.basic.char = chargingPileList.value[0].id
        })
    } else {
        defaultcharplie.value = useStore.customSetting.basic.char
    }
    for (var i of chargingPileList.value) {
        if (i.id == useStore.customSetting.basic.char) {
            charname.value = i.name
            break
        }
    }

    //设置里的站点如果不存在
    if (!charname.value) {
        defaultcharplie.value = chargingPileList.value[0].id
        useStore.$patch((state: any) => {
            state.customSetting.basic.char = chargingPileList.value[0].id
        })
        charname.value = chargingPileList.value[0].name
    }

}
setstand()
defineExpose({ setstand });
</script>
<script lang="ts">
import { defineComponent, nextTick } from 'vue';
export default defineComponent({
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            const instance: any = vm;
            instance.setstand()
        })
    }
});
</script>
<template>
    <div>
        <BaseSettingtank ref="baseset" :controlType="controlType" :StandbyPointList="standbyPointList"
            @TankControl="TankControl" @change-stand="ChangeStand" @change-char="ChangeChar"
            :ChargingPileList="chargingPileList" :Defaultcharplie="defaultcharplie" :Defaultstandby="defaultstandby">
        </BaseSettingtank>
        <switchLanguage @changelanguage="Changelanguage" :currentLanguage="currentLanguage"
            :showChangeLan="showChangeLan" @last-changelan="Setlanguage">
        </switchLanguage>
        <div>
            <div class="sys_top">
                <div class="sys_bj font4">{{ $t('setting.bjgn') }}</div>
                <div class="sys_modetype">
                    <!-- :class="item.sel?'sys_mode_one2':'sys_mode_one'"  -->
                    <div v-for="(item, index) in modetype" :key="index"
                        :class="index == 0 || index == 1 ? (useStore.robotstate.isManualMode ? (index == 0 ? 'sys_mode_one' : 'sys_mode_one2') : (index == 0 ? 'sys_mode_one2' : 'sys_mode_one')) : 'sys_mode_one'"
                        @click="ModelClick(item.id)">
                        <!-- <img src="" alt=""> -->
                        <img v-if="index > 1" :src="item.img1" style="width:38px;height: 38px;margin-bottom: 13px;">
                        <img v-if="index == 0" :src="useStore.robotstate.isManualMode ? item.img1 : item.img2"
                            style="width:38px;height: 38px;margin-bottom: 13px;">
                        <img v-if="index == 1" :src="useStore.robotstate.isManualMode ? item.img2 : item.img1"
                            style="width:38px;height: 38px;margin-bottom: 13px;">

                        <!-- <img :src="item.img1" alt="" style="width:38px;height: 38px;margin-bottom: 13px;" /> -->
                        <div v-if="index == 0" :style="!useStore.robotstate.isManualMode ? 'color:white' : ''">
                            {{ $t(item.name) }}
                        </div>
                        <div v-if="index == 1" :style="useStore.robotstate.isManualMode ? 'color:white' : ''">
                            {{ $t(item.name) }}
                        </div>
                        <div v-if="index > 1">{{ $t(item.name) }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 返航待命点 -->
        <div class="char_sel" @click="TankControl(3)">
            <div>
                <div class="char_top">
                    <div class="setname font4">{{ $t('setting.fhdmd') }}</div>
                    <div class="setdesc" style='margin-left:13px'>{{ $t('setting.cjfhsfhwz') }}</div>
                    <div class="box_rightset font5" style="right:0">
                        <div style="margin-right:20px">{{ standbyname }}</div>
                        <img src="../../assets/img/setting_arrow_down.png" style="width: 16px;height: 9px;">
                    </div>
                </div>
            </div>
            <div @click.stop="gostandby">{{ $t('setting.yjfh') }}</div>
        </div>

        <!-- 回桩充电 -->
        <div class="char_sel" @click="TankControl(5)">
            <div>
                <div class="char_top">
                    <div class="setname font4">{{ $t('setting.cdzxz') }}</div>
                    <div class="setdesc" style='margin-left:13px'>{{ $t('setting.xzjqrcdz') }}</div>
                    <div class="box_rightset font5" style="right:0">
                        <div style="margin-right:20px">{{ charname }}</div>
                        <img src="../../assets/img/setting_arrow_down.png" style="width: 16px;height: 9px;">
                    </div>
                </div>
            </div>

            <div @click.stop="gochargepile">{{ $t('setting.hzcd') }}</div>
        </div>

        <div class="sys_setting" @click="Changelanguage()">
            <div>
                <div>
                    <span class="sys_span1 font4">{{ $t('setting.dyysz') }}</span>
                </div>
                <div style="position:relative">
                    <div class="now_lan">
                        <span v-if="currentLanguage == 'zh-cn'">简体中文</span>
                        <span v-if="currentLanguage == 'en'">English</span>
                        <span v-if="currentLanguage == 'zh-tw'">繁体中文</span>
                    </div>

                    {{ $t('setting.qhyy') }}
                </div>
            </div>
        </div>
        <div class="sys_setting" @click="tapChangepass()">
            <div>
                <div>
                    <span class="sys_span1 font4">{{ $t('setting.glymm') }}</span>
                </div>
                <div>{{ $t('setting.xgmm') }}</div>
            </div>
        </div>
        <div class="sys_setting" v-if="settingVisible">
            <div>
                <div>
                    <span class="sys_span1 font4">{{ $t('starup.xtsz') }}</span>
                </div>
                <div @click="OpenSetting">{{ $t('setting.dkxtsz') }}</div>
            </div>
        </div>
        <div class="sys_message">
            <div class="sys_message_top font4" @click="hiddenSetting">{{ $t('setting.xtxx') }}</div>
            <!-- <div class="sys_onemessage">
                <div>机器人类型</div>
                <div>R1餐厅机器人</div>
            </div> -->

            <div class="sys_onemessage">
                <div>{{ $t('setting.jqrsn') }}</div>
                <div>{{ globalData.sn }}</div>
            </div>

            <div class="sys_onemessage">
                <div>{{ $t('setting.jqrbb') }}</div>
                <div>{{ H5Version }} ({{ CurrentappVersion.split(',')[1] }})</div>
            </div>
            <div class="sys_onemessage">
                <div>{{ $t('setting.jqrdpbb') }}</div>
                <div>
                    <span v-if="useStore.vers">{{ useStore.vers }}</span>
                    <span v-else>{{ $t('setting.zwsj') }}</span>
                </div>
            </div>
            <div class="sys_onemessage noborder">
                <div>{{ $t('setting.jqrsdkbb') }}</div>
                <div>
                    <span v-if="useStore.sdkVers">{{ useStore.sdkVers }}</span>
                    <span v-else>{{ $t('setting.zwsj') }}</span>
                </div>
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
                    <div @click="TapAPK">{{ $t('setting.shi') }}</div>
                </div>
            </div>
        </div>


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
        <!-- 修改密码 -->
        <div class="update_password" v-if="showchangePass">
            <div class="_makcontent2">
                <div class="update_password_header font6">{{ $t('setting.xgmm') }}</div>
                <div class="password_cont">
                    <div class="passwrod_line">
                        <div>
                            {{ $t('setting.ymm') }}:
                        </div>
                        <input type="tel" pattern="[0-9]*" :placeholder="$t('setting.qsrymm')" v-model="password1"
                            onkeyup="value=value.replace(/[^\d]/g,'')" @input="setinputc($event, 1)"
                            style="-webkit-text-security:disc" />
                    </div>
                    <div class="passwrod_line">
                        <div>
                            {{ $t('setting.xmm') }}:
                        </div>
                        <input type="tel" pattern="[0-9]*" :placeholder="$t('setting.qsrxmm')" v-model="password2"
                            onkeyup="value=value.replace(/[^\d]/g,'')" @input="setinputc($event, 2)"
                            style="-webkit-text-security:disc">
                    </div>
                    <div class="passwrod_line" style="margin-bottom:0">
                        <div>
                            {{ $t('setting.zcsrmm') }}:
                        </div>
                        <input type="tel" pattern="[0-9]*" :placeholder="$t('setting.xrxmm')" v-model="password3"
                            onkeyup="value=value.replace(/[^\d]/g,'')" @input="setinputc($event, 3)"
                            style="-webkit-text-security:disc">
                    </div>
                </div>

                <div class="tip_meth">
                    <div @click="tapChangepass">{{ $t('index.qx') }}</div>
                    <div @click="Changepassword">{{ $t('index.qd') }}</div>
                </div>

            </div>
        </div>

    </div>
</template>

<style  scoped>
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
    background-color: #E8EFFF;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: bold;
    color: #333333;
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
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.now_lan {
    height: 100%;
    position: absolute;
    right: 1.40625rem;
    /* line-height: 0.67188rem; */
    font-size: 0.125rem;
    font-weight: bold;
    color: #83A9FF;
    left: px;
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
    background: #83A9FF;
    border-radius: 13px;
    font-size: 16px;
    font-weight: bold;
    color: #FFFEFE;
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
    font-weight: bold;
    color: #333333;
    font-size: 16px;
}

.tip_meth>div:nth-child(2) {
    width: 173px;
    background: #608FFA;
    border-radius: 6px;
    font-size: 16px;
    font-weight: bold;
    color: white;
}

.update_password {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.5);
}

.update_password_header {
    height: 54px;
    line-height: 54px;
    font-size: 16px;
    font-weight: bold;
    color: #333333;
    width: 100%;
    text-align: center;
}

.passwrod_line {
    height: 40px;
    width: 480px;
    margin: 0 auto;
    margin-bottom: 20px;
    display: flex;
}

.passwrod_line>div:nth-child(1) {
    width: 190px;
    font-size: 20px;
    color: #666666;
    display: flex;
    position: relative;
    justify-content: center;
    line-height: 40px;
    margin-right: 20px;
    white-space: nowrap;
    text-align: center;

}

.passwrod_line>input {
    width: 260px;
    font-size: 16px;
    color: #666666;
    font-size: 20px;
    line-height: 40px;
    border: none;
    outline: none;
    border: 1px solid gray;
    border-radius: 4px;
    padding: 0 10px;
    box-sizing: border-box;

}

.password_cont {
    width: 480px;
    background-color: #ffffff;
    margin: 0 auto;
    padding: 30px 0;
    border-radius: 20px;
    font-weight: bold;
}

._makcontent2 {
    width: 535px;
    background-color: #F3F3F3;
    border-radius: 15px;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -267.5px;
    margin-top: -169px;
    padding-bottom: 20px;

}

.char_sel {
    height: 145px;
    width: 100%;
    background: #FFFFFF;
    border-radius: 13px;
    padding: 0 34px;
    box-sizing: border-box;
    margin-top: 13px;
}

.char_sel>div:nth-child(1) {
    height: 73px;
    display: flex;
}

.char_sel>div:nth-child(2) {
    width: 100%;
    height: 58px;
    background: #83A9FF;
    border-radius: 13px;
    font-size: 16px;
    font-weight: bold;
    color: #FFFFFF;
    text-align: center;
    line-height: 58px;
}

.char_top {
    display: flex;
    height: 100%;
    align-items: center;
    position: relative;
    width: 100%;
}

.setname {
    font-weight: 400;
    color: #333333;
}

.setdesc {
    font-size: 16px;
    font-weight: 400;
    color: #999999;
    margin-left: 60px;
}

.box_rightset {
    position: absolute;
    right: 34px;
    height: 100%;
    top: 0;
    display: flex;
    align-items: center;
}

.box_rightset>div {
    font-weight: 400;
    color: #333333;
    line-height: 19px;
}
</style>
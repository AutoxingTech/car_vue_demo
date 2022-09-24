
<script lang="ts" setup>
import { ref, reactive } from 'vue';
import switchLanguage from './component/Switchlanguage.vue'
import store from '../../store';
import settingUtil from '../../js/settingUtil'
import { ChargingPile } from '../../js/Datacollation'
import { globalData, } from '../../js/globalData';
import { ControlLoading } from '../../js/settingUtil'
import { toast } from '../Toast/Toast'
import { OpenSetting, appVersion } from '../../js/android'
import { H5Version } from '../../js/globalConfig'
import router from '../../router';

let ChargingPileList: any = ChargingPile
const useStore: any = store()
const CurrentappVersion = ref(appVersion())
const modetype: any = reactive([{
    id: 1,
    name: '自动模式',
    sel: true,
    img1: new URL('../../assets/img/sys_1notsel.png', import.meta.url),  //未选中
    img2: new URL('../../assets/img/sys_1.png', import.meta.url),  //选中

},
{
    id: 2,
    name: '手动模式',
    sel: false,
    img1: new URL('../../assets/img/sys_2.png', import.meta.url),  //未选中
    img2: new URL('../../assets/img/sys_1sel.png', import.meta.url),
},
{
    id: 3,
    name: '重启APP',
    sel: false,
    img1: new URL('../../assets/img/sys_3.png', import.meta.url),
    img2: new URL('../../assets/img/sys_3.png', import.meta.url),
}, {
    id: 4,
    name: '充电桩复位',
    sel: false,
    img1: new URL('../../assets/img/sys_4.png', import.meta.url),
    img2: new URL('../../assets/img/sys_4.png', import.meta.url),
}, {
    id: 5,
    name: '系统设置',
    sel: false,
    img1: new URL('../../assets/img/sys_5.png', import.meta.url),
    img2: new URL('../../assets/img/sys_5.png', import.meta.url),
},
{
    id: 6,
    name: 'WLAN',
    sel: false,
    img1: new URL('../../assets/img/sys_6.png', import.meta.url),
    img2: new URL('../../assets/img/sys_6.png', import.meta.url),
}
])
const showChangeLan = ref(false)  //是否显示选择语言弹框
const currentLanguage = ref(useStore.customSetting.basic.language)  //当前的语言
const showTapApk = ref(false)  //是否显示跳转apk
const showchangePass = ref(false)//是否显示更改密码

const password1 = ref() //原密码
const password2 = ref() //新密码
const password3 = ref() //确认新密码
//控制只能输入四个
const setinput = (e: number) => {
    if (e == 1) {
        if (String(password1.value).length > 10) {
            password1.value = String(password1.value).slice(0, 10)
        }
    } else if (e == 2) {
        if (String(password2.value).length > 10) {
            password2.value = String(password2.value).slice(0, 10)
        }
    } else if (e == 3) {
        if (String(password3.value).length > 10) {
            password3.value = String(password3.value).slice(0, 10)
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
    if (password1.value && password2.value && password3.value) {
        if (password1.value == useStore.customSetting.basic.adminPass) {
            if (password2.value == password3.value) {
                if (password1.value !== password2.value) {
                    useStore.$patch((state: any) => {
                        state.customSetting.basic.adminPass = password2.value
                    })
                    tapChangepass()
                    toast.show('修改成功')
                } else {
                    toast.show('新密码与原密码相同')
                }
            } else {
                toast.show('两次输入密码不相同')
            }
        } else {
            toast.show('原密码不正确')
        }

    } else {
        toast.show('请完善更改内容')
    }
    //todo
    // showchangePass.value = !showchangePass.value
}
//控制跳转建图app的显示和隐藏
const TapApkControl = () => {
    showTapApk.value = !showTapApk.value
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
    useStore.$patch((state: any) => {
        state.customSetting.basic.language = e
    })
    showChangeLan.value = !showChangeLan.value
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
        console.log('重启App')
        settingUtil.restart()
    } else if (e == 4) {
        //点击充电桩复位
        ControlLoading(true)
        if (!useStore.customSetting.basic.char) {
            useStore.$patch((state: any) => {
                state.customSetting.basic.char = ChargingPileList[0].id
            })
        }
        for (let item of ChargingPileList) {
            if (useStore.customSetting.basic.char == item.id) {
                return settingUtil.setPos(item).then(() => {
                    ControlLoading(false)
                })
            }
        }
    } else if (e == 5) {
        //点击系统设置
        console.log('系统设置')
        OpenSetting()
    } else if (e == 6) {
        //点击WLAN
        console.log('WLAN')
        // router.push({
        //     path: '/WifeSetting'
        // })
    }
}
</script>
<template>
    <div>
        <switchLanguage @Changelanguage="Changelanguage" :currentLanguage="currentLanguage"
            :showChangeLan="showChangeLan" @last-changelan="Setlanguage">
        </switchLanguage>
        <div>
            <div class="sys_top">
                <div class="sys_bj font4">便捷功能</div>
                <div class="sys_modetype">
                    <!-- :class="item.sel?'sys_mode_one2':'sys_mode_one'"  -->
                    <div v-for="(item,index) in modetype" :key="index"
                        :class="index==0||index==1?(useStore.robotstate.isManualMode?(index==0?'sys_mode_one':'sys_mode_one2'):(index==0?'sys_mode_one2':'sys_mode_one') ):'sys_mode_one'"
                        @click="ModelClick(item.id)">
                        <!-- <img src="" alt=""> -->
                        <img v-if="index>1" :src="item.img1" style="width:38px;height: 38px;margin-bottom: 13px;">
                        <img v-if="index==0" :src="useStore.robotstate.isManualMode?item.img1:item.img2"
                            style="width:38px;height: 38px;margin-bottom: 13px;">
                        <img v-if="index==1" :src="useStore.robotstate.isManualMode?item.img2:item.img1"
                            style="width:38px;height: 38px;margin-bottom: 13px;">

                        <!-- <img :src="item.img1" alt="" style="width:38px;height: 38px;margin-bottom: 13px;" /> -->
                        <div v-if="index==0" :style="!useStore.robotstate.isManualMode?'color:white':''">{{item.name}}
                        </div>
                        <div v-if="index==1" :style="useStore.robotstate.isManualMode?'color:white':''">{{item.name}}
                        </div>
                        <div v-if="index>1">{{item.name}}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="sys_setting" @click="Changelanguage()">
            <div>
                <div>
                    <span class="sys_span1 font4">多语言设置</span>
                </div>
                <div>切换语言</div>

                <div class="now_lan">
                    <span v-if="currentLanguage=='zh-Hans'">简体中文</span>
                    <span v-if="currentLanguage=='en'">English</span>
                    <span v-if="currentLanguage=='zh-Hant'">繁体中文</span>
                </div>
            </div>
        </div>
        <div class="sys_setting" @click="tapChangepass()">
            <div>
                <div>
                    <span class="sys_span1 font4">管理员密码</span>
                </div>
                <div>修改密码</div>
            </div>
        </div>
        <!-- <div class="sys_setting">
            <div>
                <div>
                    <span class="sys_span1 font4">车机建图APP</span>
                </div>
                <div @click="TapApkControl">进入车机建图</div>
            </div>
        </div> -->
        <div class="sys_message">
            <div class="sys_message_top font4">系统信息</div>
            <!-- <div class="sys_onemessage">
                <div>机器人类型</div>
                <div>R1餐厅机器人</div>
            </div> -->

            <div class="sys_onemessage">
                <div>机器人SN</div>
                <div>{{globalData.sn}}</div>
            </div>

            <div class="sys_onemessage">
                <div>机器人版本</div>
                <div>{{H5Version}} ({{CurrentappVersion.split(',')[1]}})</div>
            </div>
            <div class="sys_onemessage noborder">
                <div>机器人底盘版本</div>
                <div>{{useStore.vers}}</div>
            </div>
            <!-- <div class="sys_onemessage noborder">
                <div>机器人部署时间</div>
                <div>2022-01-11</div>
            </div> -->
        </div>
        <div class="emptyline"></div>
        <div class="mask_tapapk" v-if="showTapApk">
            <div class="_makcontent">
                <div class="tip_apk">
                    是否跳转至车机建图app
                </div>
                <div class="tip_meth">
                    <div @click="TapApkControl">否</div>
                    <div @click="TapAPK">是</div>
                </div>
            </div>
        </div>
        <!-- 修改密码 -->
        <div class="update_password" v-if="showchangePass">
            <div class="_makcontent2">
                <div class="update_password_header font6">修改密码</div>
                <div class="password_cont">
                    <div class="passwrod_line">
                        <div>
                            原密码:
                        </div>
                        <input type="number" placeholder="请输入原密码" maxlength=4 v-model="password1" @input="setinput(1)"
                            style="-webkit-text-security:disc" />
                    </div>
                    <div class="passwrod_line">
                        <div>
                            新密码:
                        </div>
                        <input type="number" placeholder="请输入新密码" maxlength=4 v-model="password2" @input="setinput(2)"
                            style="-webkit-text-security:disc">
                    </div>
                    <div class="passwrod_line" style="margin-bottom:0">
                        <div>
                            再次输入新密码:
                        </div>
                        <input type="number" placeholder="确认新密码" maxlength=4 v-model="password3" @input="setinput(3)"
                            style="-webkit-text-security:disc">
                    </div>
                </div>

                <div class="tip_meth">
                    <div @click="tapChangepass">取消</div>
                    <div @click="Changepassword">确定</div>
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
    right: 180px;
    line-height: 86px;
    font-size: 16px;
    font-weight: bold;
    color: #83A9FF;
}

.sys_setting>div>div:nth-child(1) {
    display: flex;
    align-items: center;
}

.sys_setting>div>div:nth-child(2) {
    width: 120px;
    height: 40px;
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
    margin-top: -169px;

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
    width: 160px;
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
</style>

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
<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import store from "../../store";
import BaseSettingtank from './component/BaseSettingtank.vue';
import { standbyPoint, chargingPile } from '../../js/Datacollation'
import settingUtil from '../../js/settingUtil';
import { updateMap } from '../../js/globalData';

const useStore: any = store()
const standbyPointList: any = standbyPoint  //待命点列表
const chargingPileList: any = chargingPile  //充电桩
const controlType = ref(0)  //控制弹框相应显示内容
const fontSizetype = ref(0) //当前字号大小 0 小号  1中号 2大号
const defaultdisplay = ref(0) //默认展示tab的下标
const defaultstandby = ref(0) //默认待命点
const defaultcharplie = ref(0) //默认充电桩
const charname = ref() //充电桩name
const standbyname = ref() //待命点name
const guideplaytype = ref(0) //引领默认播放
const patternList: any = reactive([ //主页显示模式列表
    {
        name: 'index.kjsc',
        ico1: new URL('../../assets/img/selbase1.png', import.meta.url),
        ico2: new URL('../../assets/img/notselbase1.png', import.meta.url),
        sel: false
    },
    {
        name: 'index.ddsc',
        ico1: new URL('../../assets/img/selbase2.png', import.meta.url),
        ico2: new URL('../../assets/img/notselbase2.png', import.meta.url),
        sel: false
    },
    {
        name: 'index.ylsc',
        ico1: new URL('../../assets/img/selbase3.png', import.meta.url),
        ico2: new URL('../../assets/img/notselbase3.png', import.meta.url),
        sel: false
    },
    {
        name: 'index.xy',
        ico1: new URL('../../assets/img/selbase4.png', import.meta.url),
        ico2: new URL('../../assets/img/notselbase4.png', import.meta.url),
        sel: false
    }
])
const baseset: any = ref(null)

//初始化基础设置basesetting及服务器设置内缺
function initbaseSetting() {
    //如果机器设置内不存在mode 赋默认都显示
    if (!useStore.customSetting.basic.model) {
        useStore.$patch((state: any) => {
            state.customSetting.basic.model = [0, 1, 2, 3]
        })
    }
    for (let i of useStore.customSetting.basic.model) {  //将设置内存在的mode设置为高亮显示模式
        patternList[i].sel = true
    }
    //如果机器设置内不存在fontsize 赋默认值0 小号字体
    if (!useStore.customSetting.basic.fontSize || (useStore.customSetting.basic.fontSize != 0 && useStore.customSetting.basic.fontSize != 1 && useStore.customSetting.basic.fontSize != 2)) {
        fontSizetype.value = 0
        useStore.$patch((state: any) => {
            state.customSetting.basic.fontSize = 0
        })
    } else {
        fontSizetype.value = useStore.customSetting.basic.fontSize
    }

    //如果机器设置内不存在默认显示模式的下标 赋默认显示快捷送餐
    if (!useStore.customSetting.basic.currenttab) {
        defaultdisplay.value = 0
        useStore.$patch((state: any) => {
            state.customSetting.basic.currenttab = 0
        })
    } else {
        defaultdisplay.value = useStore.customSetting.basic.currenttab
    }

    //设置为当前现实的模式下标 不存在设置第一个
    setcurrent()
    //设置充电桩和待命点
    setstand()
}
//更换常用模式选择
function patterTap(index: number) {
    useStore.$patch((state: any) => {
        if (state.customSetting.basic.model.indexOf(index) > -1) {
            if (state.customSetting.basic.model.length == 1) {
                console.error('只剩下了一个 不可再关闭')
            } else {
                state.customSetting.basic.model.splice(state.customSetting.basic.model.indexOf(index), 1)
                patternList[index].sel = !patternList[index].sel
            }
        } else {
            state.customSetting.basic.model.push(index)
            state.customSetting.basic.model.sort()
            patternList[index].sel = !patternList[index].sel
        }
    })


    setcurrent()

}

function TankControl(e: number) {
    controlType.value = e
    if (e == 3 || e == 5) {
        baseset.value.setcur()
    }
}
//修改字体
function Changefont(e: number) {
    const type: number = e
    const button = document.getElementById('app') as HTMLButtonElement;
    button.setAttribute("class", `theme_${type}`);
    useStore.$patch((state: any) => {
        state.customSetting.basic.fontSize = type
        fontSizetype.value = type
    })
    controlType.value = 0
}
//设置当前默认显示的模式下标
function setcurrent() {
    if (patternList[useStore.customSetting.basic.currenttab].sel == false) {
        for (let i in patternList) {
            if (patternList[i].sel == true) {
                useStore.$patch((state: any) => {
                    state.customSetting.basic.currenttab = i
                    defaultdisplay.value = Number(i)
                })
                return
            }
        }
    }
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

//修改默认tab
function Changtab(e: number) {
    const type: number = e
    useStore.$patch((state: any) => {
        state.customSetting.basic.currenttab = type
        defaultdisplay.value = type
    })
    controlType.value = 0
}

// if (!useStore.customSetting.basic.guideplaytype) {
//     guideplaytype.value = 0
//     useStore.$patch((state: any) => {
//         state.customSetting.basic.guideplaytype = 0
//     })
// } else {
//     guideplaytype.value = useStore.customSetting.basic.guideplaytype
// }

//修改引领默认展示
function Changeguide(e: number) {
    const type: number = e
    useStore.$patch((state: any) => {
        state.customSetting.basic.guideplaytype = type
        guideplaytype.value = type
    })
    controlType.value = 0
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
//回充电桩
function gochargepile() {
    settingUtil.goCharpile(settingUtil.getChargeStation())
}
//初始化
initbaseSetting()
// 监听是否更新地图
watch(() => updateMap.value, (newvalue: any, oldvalue: any) => {
    setstand()
})
defineExpose({ setstand });
</script>
<template>
    <div>
        <div class="set_right_top">
            <div class="font4">{{ $t('setting.cyms') }}</div>
            <div>
                <div class="base_one_setting" v-for="(item, index) in patternList" :key="index"
                    @click="patterTap(index)">
                    <div>
                        <img :src="item.sel ? item.ico1 : item.ico2" style="width:55px;height: auto;">
                    </div>
                    <div class="font5" :style="item.sel ? 'color: #83A9FF;' : 'color: #999999;'">{{ $t(item.name) }}
                    </div>
                </div>
            </div>
        </div>
        <!-- 字体设置大小 -->
        <div class="one_setbox" @click="TankControl(1)">
            <div class="setname font4">{{ $t('setting.ztsz') }}</div>
            <div class="setdesc">{{ $t('setting.szztdx') }}</div>
            <div class="box_rightset font5">
                <div style="margin-right:20px">
                    <span v-if="fontSizetype == 0">{{ $t('setting.xhzt') }}</span>
                    <span v-if="fontSizetype == 1">{{ $t('setting.zhzt') }}</span>
                    <span v-if="fontSizetype == 2">{{ $t('setting.dhzt') }}</span>
                </div>
                <img src="../../assets/img/setting_arrow_down.png" style="width: 16px;height: 9px;">
            </div>
        </div>
        <!-- 主页显示模式 -->
        <div class="one_setbox" @click="TankControl(2)">
            <div class="setname font4">{{ $t('setting.zymsxs') }}</div>
            <div class="setdesc" style='margin-left:15px'>{{ $t('setting.jrcjzs') }}</div>
            <div class="box_rightset font5">
                <div style="margin-right:20px">
                    <span v-if="defaultdisplay == 0">{{ $t('index.kjsc') }}</span>
                    <span v-if="defaultdisplay == 1">{{ $t('index.ddsc') }}</span>
                    <span v-if="defaultdisplay == 2">{{ $t('index.yl') }}</span>
                    <span v-if="defaultdisplay == 3">{{ $t('index.xy') }}</span>
                </div>
                <img src="../../assets/img/setting_arrow_down.png" style="width: 16px;height: 9px;">
            </div>
        </div>
        <!-- 返航待命点 -->
        <div class="one_setbox" @click="TankControl(3)">
            <div class="setname font4">{{ $t('setting.fhdmd') }}</div>
            <div class="setdesc" style='margin-left:38px'>{{ $t('setting.cjfhsfhwz') }}</div>
            <div class="box_rightset font5">
                <div style="margin-right:20px">{{ standbyname }}</div>
                <img src="../../assets/img/setting_arrow_down.png" style="width: 16px;height: 9px;">
            </div>
        </div>
        <!-- 引领播放内容
        <div class="one_setbox" @click="TankControl(4)">
            <div class="setname font4">引领播放内容</div>
            <div class="setdesc" style='margin-left:34px'>引领时播放内容设置</div>
            <div class="box_rightset font5">
                <div style="margin-right:20px">
                    <span v-if="guideplaytype==0">图片</span>
                    <span v-if="guideplaytype==1">视频</span>
                    <span v-if="guideplaytype==2">表情</span>
                </div>
                <img src="../../assets/img/setting_arrow_down.png" style="width: 16px;height: 9px;">
            </div>
        </div> -->
        <!-- 充电桩选择 -->
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

        <div style=" height:20px"></div>

        <BaseSettingtank ref="baseset" :controlType="controlType" :fontSizetype="fontSizetype"
            :patternList="patternList" :Defaultdisplay="defaultdisplay" :StandbyPointList="standbyPointList"
            :ChargingPileList="chargingPileList" :Defaultcharplie="defaultcharplie" :Defaultstandby="defaultstandby"
            @TankControl="TankControl" @change-font="Changefont" @change-guide="Changeguide"
            :guideplaytype="guideplaytype" @change-tab="Changtab" @change-stand="ChangeStand" @change-char="ChangeChar">
        </BaseSettingtank>

    </div>
</template>
  
<style  scoped>
.set_right_top {
    height: 188px;
    width: 100%;
    background-color: white;
    border-radius: 13px;
}

.set_right_top>div:nth-child(1) {
    height: 80px;
    line-height: 80px;
    text-align: center;
    font-weight: 400;
    color: #333333;
}

.set_right_top>div:nth-child(2) {
    width: 722px;
    margin: 0 auto;
    margin-top: 4px;
    display: flex;
    justify-content: space-between;
}

.base_one_setting {
    width: 128px;
    font-size: 16px;
    font-weight: bold;
    /* color: #83A9FF; */
    color: #999999;
    text-align: center;
    display: flex;
    justify-content: center;
    flex-direction: column;
    white-space: nowarp;
}


.base_one_setting>div:nth-child(1) {
    height: 64px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.one_setbox {
    height: 75px;
    width: 100%;
    background-color: white;
    border-radius: 13px;
    margin-top: 13px;
    display: flex;
    padding: 0 34px;
    box-sizing: border-box;
    align-items: center;
    position: relative;
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
</style>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import store from "../../store";
import BaseSettingtank from './component/BaseSettingtank.vue';
import { StandbyPoint, ChargingPile } from '../../js/Datacollation'
import { robotUtil } from '../../js/robotUtil';
import settingUtil from '../../js/settingUtil';
const useStore: any = store()
let pointList: any = reactive({
    StandbyPointList: [...StandbyPoint, ...ChargingPile],
    ChargingPileList: [...ChargingPile]
})
//当前模式列表
const patternList: any = reactive([
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
if (!useStore.customSetting.basic.model) {
    useStore.$patch((state: any) => {
        state.customSetting.basic.model = [0, 1, 2, 3]
    })
}
for (let i of useStore.customSetting.basic.model) {
    patternList[i].sel = true
}
//更换常用模式选择
const patterTap = (index: number) => {
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

const fontSizetype = ref(0) //当前字号大小 0 小号  1中号 2大号
if (!useStore.customSetting.basic.fontSize || (useStore.customSetting.basic.fontSize != 0 && useStore.customSetting.basic.fontSize != 1 && useStore.customSetting.basic.fontSize != 2)) {
    fontSizetype.value = 0
    useStore.$patch((state: any) => {
        state.customSetting.basic.fontSize = 0
    })
} else {
    fontSizetype.value = useStore.customSetting.basic.fontSize
}


const controlType = ref(0)  //控制选择器选择

const TankControl = (e: number) => {
    controlType.value = e
}
//修改字体
const Changefont = (e: number) => {
    const type: number = e
    const button = document.getElementById('app') as HTMLButtonElement;
    button.setAttribute("class", `theme_${type}`);
    useStore.$patch((state: any) => {
        state.customSetting.basic.fontSize = type
        fontSizetype.value = type
    })
    controlType.value = 0
}



const Defaultdisplay = ref(0) //默认展示tab的下标
if (!useStore.customSetting.basic.currenttab) {
    Defaultdisplay.value = 0
    useStore.$patch((state: any) => {
        state.customSetting.basic.currenttab = 0
    })
} else {
    Defaultdisplay.value = useStore.customSetting.basic.currenttab
}


const setcurrent = () => {
    if (patternList[useStore.customSetting.basic.currenttab].sel == false) {
        for (let i in patternList) {
            if (patternList[i].sel == true) {
                useStore.$patch((state: any) => {
                    state.customSetting.basic.currenttab = i
                    Defaultdisplay.value = Number(i)
                })
                return
            }
        }
    }
}

setcurrent()

const Defaultstandby = ref(0) //默认待命点
if (!useStore.customSetting.basic.standby) {
    Defaultstandby.value = pointList.StandbyPointList[0].id
    useStore.$patch((state: any) => {
        state.customSetting.basic.standby = pointList.StandbyPointList[0].id
    })
} else {
    Defaultstandby.value = useStore.customSetting.basic.standby
}
const standbyname = ref()
for (var i of pointList.StandbyPointList) {
    if (i.id == useStore.customSetting.basic.standby) {
        standbyname.value = i.name
        break
    }
}
//设置里的站点如果不存在
if (!standbyname.value) {
    Defaultstandby.value = pointList.StandbyPointList[0].id
    useStore.$patch((state: any) => {
        state.customSetting.basic.standby = pointList.StandbyPointList[0].id
    })
    standbyname.value = pointList.StandbyPointList[0].name
}


const Defaultcharplie = ref(0) //默认充电桩
if (!useStore.customSetting.basic.char) {
    Defaultcharplie.value = pointList.ChargingPileList[0].id
    useStore.$patch((state: any) => {
        state.customSetting.basic.char = pointList.ChargingPileList[0].id
    })
} else {
    Defaultcharplie.value = useStore.customSetting.basic.char
}
const charname = ref()
for (var i of pointList.ChargingPileList) {
    if (i.id == useStore.customSetting.basic.char) {
        charname.value = i.name
        break
    }
}

//设置里的站点如果不存在
if (!charname.value) {
    Defaultcharplie.value = pointList.ChargingPileList[0].id
    useStore.$patch((state: any) => {
        state.customSetting.basic.char = pointList.ChargingPileList[0].id
    })
    charname.value = pointList.ChargingPileList[0].name
}


//修改默认tab
const Changtab = (e: number) => {
    const type: number = e
    useStore.$patch((state: any) => {
        state.customSetting.basic.currenttab = type
        Defaultdisplay.value = type
    })
    controlType.value = 0
}



const guideplaytype = ref(0) //引领默认播放

// if (!useStore.customSetting.basic.guideplaytype) {
//     guideplaytype.value = 0
//     useStore.$patch((state: any) => {
//         state.customSetting.basic.guideplaytype = 0
//     })
// } else {
//     guideplaytype.value = useStore.customSetting.basic.guideplaytype
// }

//修改引领默认展示
const Changeguide = (e: number) => {
    const type: number = e
    useStore.$patch((state: any) => {
        state.customSetting.basic.guideplaytype = type
        guideplaytype.value = type
    })
    controlType.value = 0
}

//修改待命点
const ChangeStand = (e: number) => {
    console.log(e)
    const type: number = e
    useStore.$patch((state: any) => {
        state.customSetting.basic.standby = type
        Defaultstandby.value = type
    })
    for (var i of pointList.StandbyPointList) {
        if (i.id == useStore.customSetting.basic.standby) {
            standbyname.value = i.name
            break
        }
    }
    controlType.value = 0
}
//修改充电桩

const ChangeChar = (e: number) => {
    const type: number = e
    useStore.$patch((state: any) => {
        state.customSetting.basic.char = type
        Defaultcharplie.value = type
    })
    for (var i of pointList.ChargingPileList) {
        if (i.id == useStore.customSetting.basic.char) {
            charname.value = i.name
            break
        }
    }
    controlType.value = 0
}

//回充电桩
const gochargepile = () => {
    settingUtil.goCharpile(settingUtil.getChargeStation())
}


</script>
<template>
    <div>
        <div class="set_right_top">
            <div class="font4">{{$t('setting.cyms')}}</div>
            <div>
                <div class="base_one_setting" v-for="(item,index) in patternList" :key="index"
                    @click="patterTap(index)">
                    <div>
                        <img :src="item.sel?item.ico1:item.ico2" style="width:55px;height: auto;">
                    </div>
                    <div class="font5" :style="item.sel?'color: #83A9FF;':'color: #999999;'">{{$t(item.name)}}</div>
                </div>
            </div>
        </div>
        <!-- 字体设置大小 -->
        <div class="one_setbox" @click="TankControl(1)">
            <div class="setname font4">{{$t('setting.ztsz')}}</div>
            <div class="setdesc">{{$t('setting.szztdx')}}</div>
            <div class="box_rightset font5">
                <div style="margin-right:20px">
                    <span v-if="fontSizetype==0">{{$t('setting.xhzt')}}</span>
                    <span v-if="fontSizetype==1">{{$t('setting.zhzt')}}</span>
                    <span v-if="fontSizetype==2">{{$t('setting.dhzt')}}</span>
                </div>
                <img src="../../assets/img/setting_arrow_down.png" style="width: 16px;height: 9px;">
            </div>
        </div>
        <!-- 主页显示模式 -->
        <div class="one_setbox" @click="TankControl(2)">
            <div class="setname font4">{{$t('setting.zymsxs')}}</div>
            <div class="setdesc" style='margin-left:15px'>{{$t('setting.jrcjzs')}}</div>
            <div class="box_rightset font5">
                <div style="margin-right:20px">
                    <span v-if="Defaultdisplay==0">{{$t('index.kjsc')}}</span>
                    <span v-if="Defaultdisplay==1">{{$t('index.ddsc')}}</span>
                    <span v-if="Defaultdisplay==2">{{$t('index.yl')}}</span>
                    <span v-if="Defaultdisplay==3">{{$t('index.xy')}}</span>
                </div>
                <img src="../../assets/img/setting_arrow_down.png" style="width: 16px;height: 9px;">
            </div>
        </div>
        <!-- 返航待命点 -->
        <div class="one_setbox" @click="TankControl(3)">
            <div class="setname font4">{{$t('setting.fhdmd')}}</div>
            <div class="setdesc" style='margin-left:38px'>{{$t('setting.cjfhsfhwz')}}</div>
            <div class="box_rightset font5">
                <div style="margin-right:20px">{{standbyname}}</div>
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
                    <div class="setname font4">{{$t('setting.cdzxz')}}</div>
                    <div class="setdesc" style='margin-left:13px'>{{$t('setting.xzjqrcdz')}}</div>
                    <div class="box_rightset font5" style="right:0">
                        <div style="margin-right:20px">{{charname}}</div>
                        <img src="../../assets/img/setting_arrow_down.png" style="width: 16px;height: 9px;">
                    </div>
                </div>
            </div>

            <div @click.stop="gochargepile">{{$t('setting.hzcd')}}</div>
        </div>

        <div style=" height:20px"></div>

        <BaseSettingtank :controlType="controlType" :fontSizetype="fontSizetype" :patternList="patternList"
            :Defaultdisplay="Defaultdisplay" :StandbyPointList="pointList.StandbyPointList"
            :ChargingPileList="pointList.ChargingPileList" :Defaultcharplie="Defaultcharplie"
            :Defaultstandby="Defaultstandby" @TankControl="TankControl" @change-font="Changefont"
            @change-guide="Changeguide" :guideplaytype="guideplaytype" @change-tab="Changtab"
            @change-stand="ChangeStand" @change-char="ChangeChar">
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
    width: 873px;
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
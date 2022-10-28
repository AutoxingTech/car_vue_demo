<script lang="ts" setup>
import { ref } from 'vue';
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'
import PallentSetting from '../Setting/component/PallentSetting.vue';
import store from '../../store';
import timeSet from './component/WifSwitch.vue'
const useStore: any = store()
const countdownSwitch = ref(true) //1开启 2关闭 送餐到达倒计时
const pallet: any = ref(useStore.customSetting.delivery.pallet) //托盘灯带数量
//到达取物点等待时长
const time1 = ref(useStore.customSetting.delivery.stopDuration)
const options1: any = ref({
    min: 10,
    max: 300,
    tooltip: 'always'
})
//暂停后倒计时时长
const time2 = ref(useStore.customSetting.delivery.pauseDuration)
const options2: any = ref({
    min: 10,
    max: 60,
    tooltip: 'always'
})
// 行走速度
const speed1 = ref(useStore.customSetting.delivery.runSpeed)
const options3: any = ref({
    min: 10,
    max: 80,
    tooltip: 'always'
})
//修改托盘相关信息
const showPallent = ref(false)

//不存在倒计时开关参数 默认设置为1
if (useStore.customSetting.delivery.countdownSwitch == undefined) {
    useStore.$patch((state: any) => {
        state.customSetting.delivery.countdownSwitch = true
    })
} else {
    countdownSwitch.value = useStore.customSetting.delivery.countdownSwitch
}

//修改到达取物点等待时长
function Time1change(e: any) {
    useStore.$patch((state: any) => {
        state.customSetting.delivery.stopDuration = e
    })
}
//修改暂停后倒计时时长
function Time2change(e: any) {
    useStore.$patch((state: any) => {
        state.customSetting.delivery.pauseDuration = e
    })
}
//修改行走速度
function speed1change(e: any) {
    useStore.$patch((state: any) => {
        state.customSetting.delivery.runSpeed = e
    })
}
//托盘设置
function Pallentset() {
    showPallent.value = !showPallent.value
}
//修改托盘
function setlastPallent(e: any) {
    pallet.value = e
    useStore.$patch((state: any) => {
        state.customSetting.delivery.pallet = e
    })
    showPallent.value = !showPallent.value
}

//送餐倒计时的开关
function switchcl() {
    useStore.$patch((state: any) => {
        state.customSetting.delivery.countdownSwitch = !state.customSetting.delivery.countdownSwitch
        countdownSwitch.value = state.customSetting.delivery.countdownSwitch
    })
}

</script>
<template>
    <div>
        <PallentSetting :showPallent="showPallent" @pallent-set="setlastPallent" :pallet="pallet"
            @cancle-pallent="Pallentset" />
        <div class="delive_setting">
            <div>
                <div>
                    <span class="delive_span1 font4">{{ $t('setting.tpsz') }}</span>
                    <span class="delive_span2">{{ $t('setting.sztpcs') }}</span>
                </div>
                <div @click="Pallentset()">{{ $t('setting.sztp') }}</div>
            </div>
        </div>

        <div class="delive_setting2">
            <div style="position:relative">
                <div class="countdowenble">
                    <div class="switchon" @click="switchcl"></div>
                    <timeSet v-model="countdownSwitch"></timeSet>
                </div>
                <div class="delive_top">
                    <span class="delive_span1 font4">{{ $t('setting.pstlsj') }}</span>
                    <span class="delive_span2">{{ $t('setting.ddqwdddsc') }}</span>
                </div>
                <div class="delive_bottom">
                    <div>10s</div>
                    <div class="delive_bottom_center">
                        <VueSlider style="width: 100%;" v-bind="options1" v-model="time1" @change="Time1change"
                            :tooltip-formatter="`${time1}s`" />
                    </div>
                    <div>300s</div>
                </div>
            </div>



            <div>
                <div class="delive_top">
                    <span class="delive_span1 font4">{{ $t('setting.psztsc') }}</span>
                    <span class="delive_span2">{{ $t('setting.zthdjssc') }}</span>
                </div>
                <div class="delive_bottom">
                    <div>10s</div>
                    <div class="delive_bottom_center">
                        <VueSlider style="width: 100%;" v-bind="options2" v-model="time2" @change="Time2change"
                            :tooltip-formatter="`${time2}s`" />
                    </div>
                    <div>1分钟</div>
                </div>
            </div>

            <div>
                <div class="delive_top">
                    <span class="delive_span1 font4">{{ $t('setting.xzsd') }}</span>
                    <span class="delive_span2">{{ $t('setting.szjqrswxssd') }}</span>
                </div>
                <div class="delive_bottom">
                    <div>10cm/s</div>
                    <div class="delive_bottom_center">
                        <VueSlider style="width: 100%;" v-bind="options3" v-model="speed1" @change="speed1change"
                            :tooltip-formatter="`${speed1}cm/s`" />
                    </div>
                    <div>80cm/s</div>
                </div>
            </div>
        </div>
    </div>
</template>


<style >
.delive_setting {
    height: 86px;
    width: 100%;
    background: #FFFFFF;
    border-radius: 13px;
}

.delive_setting>div {
    width: 841px;
    height: 100%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.delive_setting>div>div:nth-child(1) {
    display: flex;
    align-items: center;
}

.delive_top {
    display: flex;
    align-items: center;
    height: 60px;
    margin-bottom: 10px;
}

.delive_setting>div>div:nth-child(2) {
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

.delive_span1 {
    font-size: 23px;
    font-weight: 400;
    color: #333333;
}

.delive_span2 {
    font-size: 16px;
    font-weight: 400;
    color: #999999;
    margin-left: 14px;
}

.delive_setting2 {
    width: 100%;
    margin-top: 13px;
    border-radius: 13px;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
}

.delive_setting2>div {
    height: 106px;
    width: 841px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    box-sizing: border-box;
    margin: 0 auto;
}

.delive_setting2>div:nth-child(3) {
    border-bottom: none;
}

.delive_bottom {
    height: 30px;
    display: flex;
    justify-content: space-between;
    margin-top: -5px;

}

.delive_bottom>div:nth-child(1) {
    font-size: 14px;
    font-weight: bold;
    color: #333333;
    text-align: left;
    line-height: 30px;
}

.delive_bottom>div:nth-child(3) {
    font-size: 14px;
    font-weight: bold;
    color: #333333;
    text-align: right;
    line-height: 30px;
}

.delive_bottom_center {
    width: 704px;
    display: flex;
    align-items: center;
}

.delive_bottom_center .vue-slider-rail {
    height: 3px !important;
    background-color: #999999 !important;
}

.delive_bottom_center .vue-slider-process {
    background-color: #999999 !important;
    height: 3px !important;
}

.delive_bottom_center .vue-slider-dot-tooltip-inner {
    width: 48px;
    height: 22px;
    background-color: #ffffff !important;
    border-color: #ffffff;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    color: red;
    font-size: 14px;
    font-weight: bold;
}

.delive_bottom_center .vue-slider-dot-handle {
    cursor: pointer;
    width: 16px !important;
    height: 16px !important;
    border-radius: 50%;
    box-sizing: border-box;
    box-shadow: none;
    background-color: #5677E7 !important;
    margin-top: -1px;
}

.delive_bottom_center .vue-slider-dot-tooltip-top {
    top: -6px;
}

.countdowenble {
    position: absolute;
    top: 16px;
    right: 0px;
}

.switchon {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    z-index: 99;
}
</style>
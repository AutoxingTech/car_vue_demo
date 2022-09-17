<script lang="ts" setup>
import { reactive, ref } from 'vue';
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'
import PallentSetting from '../Setting/component/PallentSetting.vue';

import store from '../../store';
import { val } from 'dom7';
const useStore: any = store()
let palletfic: any = useStore.customSetting.delivery.pallet
const pallet: any = ref(useStore.customSetting.delivery.pallet);
let nums = 0  //灯总个数
let hasindex: any = []  //有灯的下标
let collationPallet: any = [0, 0, 0, 0,]
palletfic.forEach((item: any, index: number) => {
    nums += item
    if (item > 0) {
        hasindex.push(index)
    }
})

if (nums > 24) {
    let one = 24 / hasindex.length  //若大于24 现有的托盘平均分24
    for (let i in hasindex) {
        collationPallet[i] = one
    }
    useStore.$patch((state: any) => {
        state.customSetting.delivery.pallet = collationPallet
        pallet.value = state.customSetting.delivery.pallet
        console.log(pallet.value, "pallet")
    })
}
const time1 = ref(useStore.customSetting.delivery.stopDuration) //到达取物点等待时长

const options1: any = ref({
    min: 10,
    max: 300,
    tooltip: 'always'
})

const Time1change = (e: any) => {
    useStore.$patch((state: any) => {
        state.customSetting.delivery.stopDuration = e
    })
}

const time2 = ref(useStore.customSetting.delivery.pauseDuration)
const options2: any = ref({  //暂停后倒计时时长
    min: 10,
    max: 60,
    tooltip: 'always'
})

const Time2change = (e: any) => {
    useStore.$patch((state: any) => {
        state.customSetting.delivery.pauseDuration = e
    })
}

const speed1 = ref(useStore.customSetting.delivery.runSpeed)
const options3: any = ref({
    min: 10,
    max: 80,
    tooltip: 'always'
})

const speed1change = (e: any) => {
    useStore.$patch((state: any) => {
        state.customSetting.delivery.runSpeed = e
    })
}


const showPallent = ref(false)
const Pallentset = () => {
    showPallent.value = !showPallent.value
}
const setlastPallent = (e: any) => {
    console.log(e, "执行了吗")
    pallet.value = e
    useStore.$patch((state: any) => {
        state.customSetting.delivery.pallet = e
    })
    showPallent.value = !showPallent.value
}

</script>
<template>
    <div>
        <PallentSetting :showPallent="showPallent" @pallent-set="setlastPallent" :pallet="pallet"
            @cancle-pallent="Pallentset" />
        <div class="delive_setting">
            <div>
                <div>
                    <span class="delive_span1 font4">托盘设置</span>
                    <span class="delive_span2">设置托盘的层数和高度</span>
                </div>
                <div @click="Pallentset()">设置托盘</div>
            </div>
        </div>

        <div class="delive_setting2">
            <div>
                <div class="delive_top">
                    <span class="delive_span1 font4">配送停留时间</span>
                    <span class="delive_span2">到达取物点等待时长</span>
                </div>
                <div class="delive_bottom">
                    <div>10秒</div>
                    <div class="delive_bottom_center">
                        <VueSlider style="width: 100%;" v-bind="options1" v-model="time1" @change="Time1change"
                            :tooltip-formatter="`${time1}s`" />
                    </div>
                    <div>300秒</div>
                </div>
            </div>



            <div>
                <div class="delive_top">
                    <span class="delive_span1 font4">配送暂停时长</span>
                    <span class="delive_span2">暂停后倒计时时长</span>
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
                    <span class="delive_span1 font4">行走速度</span>
                    <span class="delive_span2">设置机器人送物时行驶速度</span>
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
</style>
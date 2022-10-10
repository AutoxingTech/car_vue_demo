<script lang="ts" setup>
import { reactive, ref } from 'vue';
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

import store from '../../store';
const useStore: any = store()

if (!useStore.customSetting.cruise) {
    useStore.$patch((state: any) => {
        state.customSetting.cruise = {}
        state.customSetting.cruise.standbyTime = 30
        state.customSetting.cruise.speed = 30
    })
}

const time1 = ref(useStore.customSetting.cruise.standbyTime)
const options1: any = ref({
    min: 10,
    max: 60,
    tooltip: 'always'
})
const Cruiesechange1 = (e: any) => {
    useStore.$patch((state: any) => {
        state.customSetting.cruise.standbyTime = e
    })
}
const cruisespeed = ref(useStore.customSetting.cruise.speed)
const options2: any = ref({
    min: 10,
    max: 80,
    tooltip: 'always'
})

const Cruiesechange2 = (e: any) => {
    useStore.$patch((state: any) => {
        state.customSetting.cruise.speed = e
    })
}

</script>
<template>
    <div class="cruise_setting2">
        <div>
            <div class="cruise_top">
                <span class="delive_span1 font4">{{$t('setting.psztsc')}}</span>
                <span class="delive_span2">{{$t('setting.zthdjssc')}}</span>
            </div>
            <div class="cruise_bottom">
                <div>10{{$t('setting.miao')}}</div>
                <div class="cruise_bottom_center">
                    <VueSlider style="width: 100%;" v-bind="options1" v-model="time1" @change="Cruiesechange1"
                        :tooltip-formatter="`${time1}s`" />
                </div>
                <div>1{{$t('setting.fenzhong')}}</div>
            </div>
        </div>



        <div>
            <div class="cruise_top">
                <span class="delive_span1 font4">{{$t('setting.xzsd')}}</span>
                <span class="delive_span2">{{$t('setting.szjqrswxssd')}}</span>
            </div>
            <div class="cruise_bottom">
                <div>10cm/s</div>
                <div class="cruise_bottom_center">
                    <VueSlider style="width: 100%;" v-bind="options2" v-model="cruisespeed" @change="Cruiesechange2"
                        :tooltip-formatter="`${cruisespeed}cm/s`" />
                </div>
                <div>80cm/s</div>
            </div>
        </div>
    </div>
</template>


<style>
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

.cruise_top {
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

.cruise_setting2 {
    width: 100%;
    height: 228px;
    margin-top: 13px;
    border-radius: 13px;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
}

.cruise_setting2>div {
    flex: 1;
    width: 841px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    box-sizing: border-box;
    margin: 0 auto;
}

.cruise_setting2>div:nth-child(2) {
    border-bottom: none;
}

.cruise_bottom {
    height: 30px;
    display: flex;
    justify-content: space-between;

}

.cruise_bottom>div:nth-child(1) {
    font-size: 14px;
    font-weight: bold;
    color: #333333;
    text-align: left;
    line-height: 30px;
}

.cruise_bottom>div:nth-child(3) {
    font-size: 14px;
    font-weight: bold;
    color: #333333;
    text-align: right;
    line-height: 30px;
}

.cruise_bottom_center {
    width: 704px;
    display: flex;
    align-items: center;
}

.cruise_bottom_center .vue-slider-rail {
    height: 3px !important;
    background-color: #999999 !important;
}

.cruise_bottom_center .vue-slider-process {
    background-color: #999999 !important;
    height: 3px !important;
}

.cruise_bottom_center .vue-slider-dot-tooltip-inner {
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

.cruise_bottom_center .vue-slider-dot-handle {
    cursor: pointer;
    width: 16px !important;
    height: 16px !important;
    border-radius: 50%;
    box-sizing: border-box;
    box-shadow: none;
    background-color: #5677E7 !important;
    margin-top: -1px;
}

.cruise_bottom_center .vue-slider-dot-tooltip-top {
    top: -6px;
}
</style>
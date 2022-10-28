<script lang="ts" setup>
import { reactive, ref } from 'vue';
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'
import store from '../../store';
import my_switch from "./component/Soundswitch.vue";
import SongSelectVue from './component/SongSelect.vue';
import { songlist } from '../../js/Datacollation'
const useStore: any = store()
const Defaultsong: any = ref()
const showSongsel = ref(false)
const defaultsongname = ref()

if (!useStore.customSetting.sound.musicFile) {
    Defaultsong.value = songlist[0].id
    useStore.$patch((state: any) => {
        state.customSetting.sound.musicFile = songlist[0].id
    })
} else {
    Defaultsong.value = useStore.customSetting.sound.musicFile
}

for (let i in songlist) {
    if (songlist[i].id == useStore.customSetting.sound.musicFile) {
        defaultsongname.value = songlist[i].name
        break
    }
}
//声音开启
const switchon = ref(useStore.customSetting.sound.switchon)
const Changeswitch = (e: boolean) => {
    useStore.$patch((state: any) => {
        state.customSetting.sound.switchon = e
    })
}

const volice1 = ref(useStore.customSetting.sound.musicVolume)  //背景音乐
const options1: any = ref({
    min: 0,
    max: 100,
    tooltip: 'always'
})
const Sound1change = (e: any) => {
    useStore.$patch((state: any) => {
        state.customSetting.sound.musicVolume = e
    })
}
const volice2 = ref(useStore.customSetting.sound.voiceVolume) //播报语言
const options2: any = ref({
    min: 0,
    max: 100,
    tooltip: 'always'
})
const Sound2change = (e: any) => {
    useStore.$patch((state: any) => {
        state.customSetting.sound.voiceVolume = e
    })
}

const volice3 = ref(useStore.customSetting.sound.avoidVolume)
const options3: any = ref({
    min: 0,
    max: 100,
    tooltip: 'always'
})
const Sound3change = (e: any) => {
    useStore.$patch((state: any) => {
        state.customSetting.sound.avoidVolume = e
    })
}
const TankControl = () => {
    showSongsel.value = !showSongsel.value
}
const changesong = (e: any) => {
    const type: number = e
    useStore.$patch((state: any) => {
        state.customSetting.sound.musicFile = type
        Defaultsong.value = type
        for (let i in songlist) {
            if (songlist[i].id == state.customSetting.sound.musicFile) {
                defaultsongname.value = songlist[i].name
                break
            }
        }
    })
    showSongsel.value = false
}


const setmin = (e: any) => {
    if (e == 1) {
        volice1.value = 0
        Sound1change(0)
    } else if (e == 2) {
        volice2.value = 0
        Sound2change(0)
    } else if (e == 3) {
        volice3.value = 0
        Sound3change(0)
    }
}

const setmax = (e: any) => {
    if (e == 1) {
        volice1.value = 100
        Sound1change(100)
    } else if (e == 2) {
        volice2.value = 100
        Sound2change(100)
    } else if (e == 3) {
        volice3.value = 100
        Sound3change(100)
    }
}

</script>
<template>
    <div>
        <div v-if="showSongsel">
            <SongSelectVue :songlist="songlist" @TankControl="TankControl" @change-stand="changesong" />
        </div>
        <div class="volive_control">
            <div class="volice1">
                <div class="font4">{{ $t('setting.sykz') }}</div>
                <div>
                    <my_switch v-model="switchon" @change-switch="Changeswitch"></my_switch>
                </div>
            </div>
            <div>
                <div class="one_volice">
                    <div class="font4">{{ $t('setting.bjyy') }}</div>
                    <div class="volice_change">
                        <img src="../../assets/img/jingyin.png" style="width:28px;height:23px" @click="setmin(1)">
                        <div class="center_control">
                            <VueSlider style="width: 100%;" v-bind="options1" v-model="volice1" @change="Sound1change"
                                :tooltip-formatter="`${volice1}%`" />
                        </div>
                        <img src="../../assets/img/nojingyin.png" style="width:27px;height:24px" @click="setmax(1)">
                    </div>
                </div>
            </div>
            <div>
                <div class="one_volice">
                    <div class="font4">{{ $t('setting.bbyy') }}</div>
                    <div class="volice_change">
                        <img src="../../assets/img/jingyin.png" style="width:28px;height:23px" @click="setmin(2)">
                        <div class="center_control">
                            <VueSlider style="width: 100%;" v-bind="options2" v-model="volice2" @change="Sound2change"
                                :tooltip-formatter="`${volice2}%`" />
                        </div>
                        <img src="../../assets/img/nojingyin.png" style="width:27px;height:24px" @click="setmax(2)">
                    </div>
                </div>
            </div>
            <div>
                <div class="one_volice">
                    <div class="font4">{{ $t('setting.bzts') }}</div>
                    <div class="volice_change">
                        <img src="../../assets/img/jingyin.png" style="width:28px;height:23px" @click="setmin(3)">
                        <div class="center_control">
                            <VueSlider style="width: 100%;" v-bind="options3" v-model="volice3" @change="Sound3change"
                                :tooltip-formatter="`${volice3}%`" />
                        </div>
                        <img src="../../assets/img/nojingyin.png" style="width:27px;height:24px" @click="setmax(3)">
                    </div>
                </div>
            </div>
        </div>

        <div class="vone_setbox" @click="TankControl">
            <div class="vsetname font4">{{ $t('setting.bjyyxz') }}</div>
            <div class="vbox_rightset">
                <div class="font5" style="margin-right:20px">{{ defaultsongname }}</div>
                <img src="../../assets/img/setting_arrow_down.png" style="width: 16px;height: 9px;">
            </div>
        </div>
    </div>
</template>


<style>
.volive_control {
    width: 100%;
    height: 320px;
    background: #FFFFFF;
    border-radius: 13px;
    display: flex;
    flex-direction: column;
}

.volive_control>div {
    width: 841px;
    box-sizing: border-box;
    height: 77px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    box-sizing: border-box;
    display: flex;
    margin: 0 auto;
    position: relative;
}

.one_volice {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 54px;
    display: flex;
    align-items: center;
    font-size: 23px;
    font-weight: 400;
    color: #333333;
}

.volice_change {
    position: absolute;
    right: 0;
    width: 584px;
    bottom: 0;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.center_control {
    width: 497px;
    height: 100%;
    display: flex;
    align-items: center;
}

.volive_control :last-child {
    border-bottom: 0
}

.volice1 {
    height: 100%;
    align-items: center;
    font-size: 23px;
    font-weight: 400;
    color: #333333;
    display: flex;
    justify-content: space-between;
}

.vone_setbox {
    height: 75px;
    width: 100%;
    background-color: white;
    border-radius: 13px;
    margin-top: 13px;
    display: flex;
    box-sizing: border-box;
    align-items: center;
    position: relative;
    padding: 0 34px;
}

.vbox_rightset {
    position: absolute;
    right: 34px;
    height: 100%;
    top: 0;
    display: flex;
    align-items: center;
}

.vbox_rightset>div {
    font-size: 16px;
    font-weight: 400;
    color: #333333;
    line-height: 19px;
}

.vsetname {
    font-size: 23px;
    font-weight: 400;
    color: #333333;
}

.setdesc {
    font-size: 16px;
    font-weight: 400;
    color: #999999;
    margin-left: 60px;
}

.center_control .vue-slider-dot-handle {
    cursor: pointer;
    width: 19px;
    height: 19px;
    border-radius: 50%;
    box-sizing: border-box;
    box-shadow: none;
    background-color: #5677E7 !important;
    margin-top: -3px;
}

.center_control .vue-slider-rail {
    height: 3px !important;
    background-color: #333333 !important;
}

.center_control .vue-slider-process {
    background-color: #5677E7 !important;
    height: 3px !important;
}

.center_control .vue-slider-dot-tooltip-inner {
    width: 48px;
    height: 22px;
    background-color: #EF2828 !important;
    border-color: #EF2828 !important;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
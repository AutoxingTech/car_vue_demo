<script setup lang="ts">
import router from '../router';
import { ref, defineComponent } from 'vue'
import store from '../store'
import { okRequest } from "../js/okRequest";
import { globalData } from '../js/globalData';
import SettingPassVue from '../components/SettingPass.vue';
const useStore = store()
function exitSetting() {
    console.log(useStore.customSetting)

    okRequest.upload_setting({
        settings: useStore.customSetting,
        robotId: globalData.sn
    }).then((res) => {
        console.log(res, "res:保存设置")
    })
    router.push({
        path: '/index'
    })
}
function passback() {
    router.push({
        path: '/index'
    })
}
const current_Set = ref(0)
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

const selectCurrent = (e: number) => {
    current_Set.value = e
    if (e == 0) {
        router.push('/setting/BasicSetting')
    } else if (e == 1) {
        router.push('/setting/VoliceSetting')
    } else if (e == 2) {
        router.push('/setting/DeliverySetting')
    } else if (e == 3) {
        router.push('/setting/CruiseSetting')
    } else if (e == 4) {
        router.push('/setting/SystemSetting')
    }
}
const PasswordControl = ref(true)
const hiddenPass = () => {
    PasswordControl.value = false
}
defineExpose({ selectCurrent, current_Set, PasswordControl });
</script>

<script lang="ts">
export default defineComponent({
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            const instance: any = vm;
            instance.selectCurrent(instance.current_Set)
            if (from.fullPath != '/task') {
                instance.PasswordControl = true
            }

        });
    },
});
</script>

<template>
    <SettingPassVue :PasswordControl="PasswordControl" @passback="passback" @passin="hiddenPass" :defautType="0" />
    <div class=" all">
        <div class="tip">
            <navbarVue :heights="'84'" />
        </div>
        <div class="set_content">
            <div class="set_left">
                <div class="set_font1">
                    {{$t('setting.szgl')}}
                </div>
                <div class="set_list">
                    <div class="set_control" v-for="(item,index) in setList" :key="index" @click="selectCurrent(index)">
                        <div class="gip" v-if="current_Set==index"></div>
                        <div :class="current_Set==index?'control_box':'control_box2'">
                            <img :src="current_Set==index?item.img:item.img2">
                            <div>{{$t(item.name)}}</div>
                        </div>
                    </div>
                </div>
                <div class="exit_set" @click="exitSetting">{{$t('setting.tcsz')}}</div>
            </div>

            <div class="set_right">
                <router-view v-slot="{ Component }">
                    <keep-alive>
                        <component :is="Component"></component>
                    </keep-alive>
                </router-view>
            </div>

        </div>
    </div>
</template>

<style scoped>
.all {
    background-color: #F1F2F6;
}

.tip {
    height: 84px;
    width: 1255px;
    margin: 0 auto;
}

.set_content {
    width: 100%;
    display: flex;
    height: calc(100% - 84px);
}

.set_left {
    width: 323px;
    height: calc(100vh - 84px);
    background-color: white;
    border-radius: 0px 13px 13px 0px;
    position: relative;
}

.set_right {
    width: 908px;
    height: calc(100vh - 84px);
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
</style>
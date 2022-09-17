
<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import store from '../store';
import router from '../router';
import settingUtil from '../js/settingUtil'
const userstore: any = store()
export default defineComponent({
    setup() {

        const modelList: any = reactive([
            {
                id: 0,
                name: '快捷送餐',
                show: false,
                sel: false,
                img1: new URL('../assets/img/tab1sel.png', import.meta.url),
                img2: new URL('../assets/img/tab1nosel.png', import.meta.url),
            },
            {
                id: 1,
                name: '多点送餐',
                show: false,
                sel: false,
                img1: new URL('../assets/img/tab2sel.png', import.meta.url),
                img2: new URL('../assets/img/tab2nosel.png', import.meta.url),
            },
            {
                id: 2,
                name: '引领',
                show: false,
                sel: false,
                img1: new URL('../assets/img/tab3sel.png', import.meta.url),
                img2: new URL('../assets/img/tab3nosel.png', import.meta.url),
            },
            {
                id: 3,
                name: '巡游',
                show: false,
                sel: false,
                img1: new URL('../assets/img/tab4sel.png', import.meta.url),
                img2: new URL('../assets/img/tab4nosel.png', import.meta.url),
            }
        ])
        //是否展示切换送餐模式的弹框
        const selcte_type = ref<boolean>(false)
        function changeType() {
            selcte_type.value = !selcte_type.value
        }
        //当前的模式是x
        const current_Tab: any = ref(0)
        if (userstore.customSetting.basic.currenttab) {
            current_Tab.value = userstore.customSetting.basic.currenttab
        }
        changeTab(current_Tab.value)
        function gosetting() {
            router.push({
                path: '/setting'
            })
        }
        function hiddenmask() {
            selcte_type.value = false
        }
        function changeTab(e: Number) {
            selcte_type.value = false
            current_Tab.value = e
            if (e == 0) {
                router.push({
                    path: '/index/Fastdelivery'
                })
            }
            if (e == 1) {
                router.push({
                    path: '/index/Multidelivery'
                })
            }
            if (e == 2) {
                router.push({
                    path: '/index/Guide'
                })
            }
            if (e == 3) {
                router.push({
                    path: '/index/Cruise'
                })
            }
        }
        function getStandby() {
            console.log(settingUtil.getStandbyStation(), "待命点")
        }
        return { current_Tab, selcte_type, modelList, changeType, gosetting, hiddenmask, changeTab, getStandby }
    },
    beforeRouteEnter(to, from, next) {
        next((e: any) => {
            // console.log(userstore.customSetting.basic.currenttab)
            // if (userstore.customSetting.basic.currenttab) {
            //     e.current_Tab = userstore.customSetting.basic.currenttab
            // }
            //判断tab的现实问题
            if (!userstore.customSetting.basic.model) {
                for (let i of e.modelList) {
                    i.show = true
                }
                return
            }
            for (let i of e.modelList) {
                i.show = false
            }
            for (let i of userstore.customSetting.basic.model) {
                e.modelList[i].show = true
            }
            e.changeTab(e.current_Tab)
            // 若当前页面是关闭的页面
            if (e.modelList[e.current_Tab].show == false) {
                for (let i in e.modelList) {
                    if (e.modelList[i].show) {
                        e.changeTab(i)
                        return
                    }
                }
            }
        })
    }
})
</script>
<template>
    <div class="indexpage">
        <div class="tip">
            <div class="navposi">
                <navbarVue :heights="'79'" />
            </div>
            <div class="type_select" @click="changeType">
                <img src="../assets/img/select.png">
                <div>
                    <text v-if="current_Tab == 0&&!selcte_type">快捷送餐</text>
                    <text v-if="current_Tab == 1&&!selcte_type">多点送餐</text>
                    <text v-if="current_Tab == 2&&!selcte_type">引领</text>
                    <text v-if="current_Tab == 3&&!selcte_type">巡游</text>
                    <text v-if="selcte_type">收起菜单</text>
                </div>
            </div>

            <div class="return_box" @click="getStandby">
                <img src="../assets/img/dirction.png">
                <div>返航</div>
            </div>
            <div class="current_local">当前机器人定位：19L</div>
        </div>
        <router-view v-slot="{ Component }">
            <keep-alive>
                <component :is="Component"></component>
            </keep-alive>
        </router-view>
        <div class="mask" v-if="selcte_type" @click="hiddenmask"></div>
        <div class="on_maskbox" v-if="selcte_type">
            <div class="select_box">
                <div class="box_all">
                    <div v-for="(item,index) in modelList" :key="index"
                        :class="item.show?(current_Tab == index ? 'sel_b font2' : 'seln_b font2'):'disnone'"
                        @click="changeTab(item.id)">
                        <img :src="current_Tab==index?item.img1:item.img2"
                            style="height: 50px;width: 50px;margin-bottom: 5px;">
                        <div>{{item.name}}</div>
                    </div>


                </div>
            </div>
            <div class="go_set">
                <img src="../assets/img/index_set.png">
                <div class="setfont" @click="gosetting">设置</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.tip {
    height: 97px;
    width: 1204px;
    display: flex;
    flex-direction: row-reverse;
    margin: 0 auto;
    align-items: center;
    position: relative;
}

.navposi {
    position: absolute;
    left: 0;
    top: 0;
}

.type_select {
    height: 57px;
    width: 163px;
    background-color: #FE6C5D;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 13px;
    border: 3px solid #FE6C5D;
    font-size: 19px;
    font-weight: bold;
    z-index: 3;
    box-sizing: border-box;
    margin-left: 29px;
}

.return_box {
    height: 57px;
    width: 163px;
    font-size: 19px;
    font-weight: bold;
    color: #83A9FF;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 13px;
    border: 3px solid #83A9FF;
    box-sizing: border-box;
    margin-left: 29px;
}

.return_box>img {
    height: 29px;
    width: 29px;
    margin-right: 8px;
}

.current_local {
    font-size: 19px;
    font-weight: bold;
    color: #FE6C5D;
}

.type_select>img {
    height: 31px;
    width: 31px;
    margin-right: 10px;
}

.mask {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 1;
}

.on_maskbox {
    width: 191px;
    height: 706px;
    background-color: white;
    position: fixed;
    right: 23px;
    top: 6px;
    z-index: 2;
    border-radius: 19px;
}

.select_box {
    height: 552px;
    margin-top: 70px;
    /* background-color: red; */
    display: flex;
    align-items: center;
    justify-content: center;
    width: 191px;
}

.go_set {
    height: calc(100% - 622px);
    width: 159px;
    margin: 0 auto;
    border-top: 1px solid #83A9FF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 19px;
    font-weight: bold;
    color: #83A9FF;
}

.go_set>img {
    width: 33px;
    height: 33px;
    margin-right: 6px;

}

.box_all {
    height: 470px;
    display: flex;
    flex-direction: column;
    /* justify-content: space-between; */
}

.box_all>div {
    margin-bottom: 32px;
}

.box_all>div :last-child {
    margin-bottom: 0;
}

.sel_b {
    padding: 10px 0;
    width: 131px;
    background-color: #83A9FF;
    border-radius: 13px;
    font-size: 15px;
    color: #ffffff;
    font-weight: bold;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;

}

.seln_b {
    height: 94px;
    width: 131px;
    border-radius: 13px;
    font-size: 15px;
    color: #666666;
    font-weight: bold;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.disnone {
    display: none;
}
</style>
<script lang="ts" setup>
import { reactive, ref } from 'vue';
import store from '../../../store';
const userstore: any = store()
const props = defineProps<{
    songlist: any,
}>()
const Defaultsong = ref(userstore.customSetting.sound.musicFile)
const emits = defineEmits(['TankControl', 'change-stand'])


//点击切换音乐
const Changesong = (item: any, index: any) => {
    Defaultsong.value = item.id
}
//取消选择音乐
const LastCancle_stand = () => {
    const index = userstore.customSetting.sound.musicFile
    Defaultsong.value = index
    emits('TankControl', 0)
}

//确定选择音乐
const LastChange_stand = () => {
    emits('change-stand', Defaultsong.value)
}

</script>
    
<template>

    <div class="base_mask">
        <!-- 音乐选择 -->
        <div class="guide_contnet">
            <div class="guide_tip_top font6">{{$t('setting.bjyyxz')}}</div>
            <div class="oneall">
                <div :class="songlist.length>4?'scrolstyl':''">
                    <div class="guide_tipone" v-for="(item,index) in songlist" :key="index"
                        @click="Changesong(item,index)">
                        <div class="font6">
                            {{item.name}}
                        </div>
                        <div class="">
                            <img v-if="item.id==Defaultsong" src="../../../assets/img/language1.png" alt="">
                            <img v-else src="../../../assets/img/selout.png" alt="">
                        </div>
                    </div>
                </div>
            </div>
            <div class="base_tip_meth font7">
                <div @click="LastCancle_stand">{{$t('index.qx')}}</div>
                <div @click="LastChange_stand()">{{$t('index.qd')}}</div>
            </div>
        </div>



    </div>

</template>
    
<style scoped>
.base_mask {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    z-index: 6;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
}

.guide_tip_top {
    height: 54px;
    line-height: 54px;
    font-size: 16px;
    font-weight: bold;
    color: #333333;
    width: 100%;
    text-align: center;
}

.guide_contnet {
    width: 535px;
    /* height: 322px; */
    background-color: #F3F3F3;
    border-radius: 13px;
    padding-bottom: 20px;
}

.guide_tipone {
    height: 61px;
    display: flex;
    justify-content: center;
    width: 444px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.21);
    margin: 0 auto;
    align-items: center;
    justify-content: space-between;
}

.guide_tipone>div {
    font-size: 16px;
    font-weight: 400;
    color: #333333;
}

.guide_tipone>div:nth-child(2) {
    width: 21px;
    height: 21px;
}

.guide_tipone>div:nth-child(2)>img {
    width: 100%;
    height: 100%;
}

.base_tip_meth {
    display: flex;
    justify-content: space-between;
    height: 50px;
    width: 400px;
    margin: 0 auto;
    text-align: center;
    line-height: 50px;
    margin-top: 22px;

}

.base_tip_meth>div:nth-child(1) {
    width: 173px;
    background: #E5E5E5;
    border-radius: 6px;
    font-weight: bold;
    color: #333333;
}

.base_tip_meth>div:nth-child(2) {
    width: 173px;
    background: #608FFA;
    border-radius: 6px;
    font-weight: bold;
    color: white;
}

.grayfont {
    color: gray !important;
}

.scrolstyl {
    max-height: 245px;
    overflow-y: scroll;
}

.scrolstyl>div:last-child {
    border-bottom: none;
}


.oneall {
    width: 485px;
    border-radius: 15px;
    margin: 0 auto;
    max-height: 245px;
    overflow: hidden;
    background-color: white;
}

.oneall>div:last-child {
    border-bottom: none;
}
</style>
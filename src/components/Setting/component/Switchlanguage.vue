
<script lang="ts" setup>
import { reactive, ref } from 'vue';

const props =
    defineProps<{
        showChangeLan: boolean,
        currentLanguage: string
    }>()
const emits = defineEmits(["changelanguage", 'last-changelan']);
const currentLanguage = ref(props.currentLanguage)
//取消
const Canclechange = () => {
    currentLanguage.value = props.currentLanguage
    emits("changelanguage");

}

const languagelist = reactive([
    {
        language: '简体中文',
        desc: '简体中文',
        char: 'zh-cn'

    },
    {
        language: 'English',
        desc: '英语',
        char: 'en'
    },
    {
        language: '繁体中文',
        desc: '繁体',
        char: 'zh-tw'
    }
])
const choiceLanguage = (e: any) => {
    currentLanguage.value = e.char
}
const Enerchange = () => {
    console.log(currentLanguage.value)
    emits("last-changelan", currentLanguage.value)
}

</script>
<template>
    <div class="mask_on" v-if="showChangeLan">
        <div class="change_cont">
            <div class="language_top font6">{{$t('setting.dyylb')}}</div>
            <div class="language_center">
                <div v-for="(item,index) in languagelist" :key="index" @click="choiceLanguage(item)">
                    <div class="language_center_left">
                        <div class="font6">{{item.language}}</div>
                        <div>{{item.desc}}</div>
                    </div>
                    <div class="rght1">
                        <!-- <img
                            :src="currentLanguage==item.char?'/src/assets/img/language1.png':'/src/assets/img/selout.png'"> -->

                        <img v-if="currentLanguage==item.char" src="../../../assets/img/language1.png" />
                        <img v-else src="../../../assets/img/selout.png" />
                    </div>
                </div>

            </div>

            <div class="language_meth font7">
                <div @click="Canclechange">{{$t('index.qx')}}</div>
                <div @click="Enerchange">{{$t('setting.qhyy')}}</div>
            </div>
        </div>



    </div>
</template>

<style scoped>
.mask_on {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 5;
}

.change_cont {
    width: 535px;
    height: 333px;
    background: #F3F3F3;
    border-radius: 15px;
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -267.5px;
    margin-top: -166px;
}

.language_top {
    height: 54px;
    width: 100%;
    line-height: 54px;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    color: #333333;
}

.language_center {
    width: 485px;
    height: 196px;
    background-color: white;
    background: #FFFFFF;
    border-radius: 15px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
}

.language_center>div {
    flex: 1;
    width: 444px;
    margin: 0 auto;
    border-bottom: 1px solid rgba(0, 0, 0, 0.26);
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;

}

.language_center>div:last-child {
    border-bottom: none;
}

.language_center_left>div:nth-child(1) {
    font-size: 16px;
    font-weight: 400;
    color: #333333;
}

.language_center_left>div:nth-child(2) {
    font-size: 16px;
    font-size: 13px;
    font-weight: 400;
    color: #333333;
}

.rght1 {
    width: 21px;
    height: 21px;
}

.rght1>img {
    width: 100%;
    height: 100%;
}

.language_meth {
    display: flex;
    justify-content: space-between;
    height: 50px;
    width: 400px;
    margin: 0 auto;
    text-align: center;
    line-height: 50px;
    margin-top: 15px;

}

.language_meth>div:nth-child(1) {
    width: 173px;
    background: #E5E5E5;
    border-radius: 6px;
    font-weight: bold;
    color: #333333;
}

.language_meth>div:nth-child(2) {
    width: 173px;
    background: #608FFA;
    border-radius: 6px;
    font-weight: bold;
    color: white;
}
</style>
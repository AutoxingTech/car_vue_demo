

<script lang="ts" setup >
import { ref } from 'vue'
import store from '../store';
const userstore: any = store()
const props = defineProps<{
    PasswordControl: boolean,  //显示弹框
}>()
const emits = defineEmits(['passback', 'passin'])
let tailNum: any = ''
const refresh_ = ref(true)
function numClick(num: number) {
    tailNum = tailNum + '' + num + ''
    let password = tailNum.substring(tailNum.length - String(userstore.customSetting.basic.adminPass).length)
    if (password == userstore.customSetting.basic.adminPass) {
        tailNum = ''
        emits('passin')
    }
}
function navback() {
    tailNum = ''
    emits('passback')
}
</script>

<template>
    <div class="passbox" v-if="props.PasswordControl">
        <div style="height: 74px;position: absolute;" @click="navback">
            <div class="back_style">
                退出
            </div>
        </div>

        <div class="kuang1" style="width: 950px;height: 629px;margin: 0 auto;margin-top: 74px; ">
            <div class="passtitle">
                密码验证
            </div>
            <div class="landscape" style="flex-wrap: wrap;width: 590px;height: 345px;">
                <div v-for="(item,index) in [1,2,3,4,5,6,7,8,9]" class="kg">
                    <div @click="numClick(item)" :class="index==2||index==5||index==8?'kuangnum2':'kuangnum'">{{item}}
                    </div>
                </div>
                <div style="width: 175px;margin-right: 32px;"></div>
                <div @click="numClick(0)" class="kuangnum2">0</div>
                <div style="width: 175px;"></div>
            </div>

        </div>
        <div v-if="refresh_"></div>
    </div>
</template>



<style scoped>
.passbox {
    background-color: #F1F2F6 !important;
    z-index: 100000000;
    height: 100%;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}

.kuang1 {
    border-radius: 50px;
    box-shadow: #E3E4E8 0px 0px 17px 3px inset;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.kuangnum {
    background-color: #E1E2E3;
    border-radius: 13px;
    margin-right: 32px;
    margin-bottom: 19px;
    width: 175px;
    height: 101px;
    line-height: 101px;
    text-align: center;
    color: white;
    font-size: 38px;
    font-weight: bold;
    color: #666666;
}

.kuangnum:active {
    background-color: #83A9FF;
    border-radius: 13px;
    margin-right: 32px;
    margin-bottom: 19px;
    width: 175px;
    height: 101px;
    line-height: 101px;
    text-align: center;
    color: white;
    font-size: 38px;
    font-weight: bold;
    color: white;
    box-shadow: 0 0px 6px 0px #83A9FF;
}

.kuangnum2 {
    background-color: #E1E2E3;
    border-radius: 13px;
    margin-right: 0px;
    margin-bottom: 19px;
    width: 175px;
    line-height: 101px;
    height: 101px;
    text-align: center;
    font-size: 38px;
    font-weight: bold;
    color: #666666;
}

.kuangnum2:active {
    background-color: #83A9FF;
    border-radius: 13px;
    margin-right: 0px;
    margin-bottom: 19px;
    width: 175px;
    line-height: 101px;
    height: 101px;
    text-align: center;
    font-size: 38px;
    font-weight: bold;
    color: white;
    box-shadow: 0 0px 15px 0px #83A9FF;
}


.passtitle {
    height: 121px;
    width: 100%;
    text-align: center;
    line-height: 121px;
    font-size: 30px;
    font-weight: bold;
    color: #666666;
    line-height: 121px;
}

.back_style {
    width: 134px;
    height: 49px;
    background-color: #DC4141;
    text-align: center;
    line-height: 49px;
    color: white;
    font-size: 19px;
    font-weight: bold;
    color: #FFFFFF;
    border-radius: 12px;
    position: absolute;
    left: 22px;
    top: 22px;

}
</style>

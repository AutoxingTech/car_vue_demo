<script lang="ts" setup>
import store from '../store/index'
import settingUtil from '../js/settingUtil';
import router from '../router';
const storeMe = store()
let tap_num = 0 //点击次数
let curTime: any = 0 //当前时间戳
let lastTime: any = 0 //最后一次点击的时间戳
//关闭异常弹框 操作
const closeAbor = () => {
    settingUtil.restart() //重启
    settingUtil.AbnormalControl(0)
}
const cleanData = () => {
    tap_num = 0
    curTime = 0
    lastTime = 0
}
const startBluetooth = () => {
    let time1: any = new Date()
    tap_num++;
    if (tap_num == 1) {
        curTime = Math.round(time1);
        lastTime = Math.round(time1);
    } else if (tap_num == 10) {
        if (curTime - lastTime < 3000) {
            cleanData()
            settingUtil.AbnormalControl(0)
            //不再启动页或者模拟设置页面 关闭弹框并且回到首页
            if (router.currentRoute.value.path !== "/starup" && router.currentRoute.value.path !== "/ficsetting" && router.currentRoute.value.path.indexOf('/index') < 0) {
                router.replace({
                    path: '/index'
                })
            }
            return;
        }
    } else {
        lastTime = curTime;
        curTime = Math.round(time1);
        if (curTime - lastTime > 300) {
            cleanData()
        }
    }

}
</script>
<template>
    <div v-if="storeMe.showAbnormal!=0">
        <!-- 异常重启弹框 -->
        <div v-if="storeMe.showAbnormal==1" class="ocenter abnormaltank">
            <div class="erroinner">
                <div class="ico_sty" @click="startBluetooth">
                    <img src="../assets/img/robotstop.png" style="width:100%;height: 100%;">
                </div>
                <div class="tip1">{{$t('abnormal.jqrztyc')}}</div>
                <div class="tip2">{{$t('abnormal.qjjqrtz')}}</div>
                <div class="enter1" @click="closeAbor">{{$t('abnormal.cq')}}</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.abnormaltank {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9999999999;
    background-color: rgba(0, 0, 0, 0.6);
}

.erroinner {
    width: 613px;
    height: 378px;
    background-color: #ffffff;
    border-radius: 25px
}

.ico_sty {
    width: 184px;
    height: 160px;
    margin: 0 auto;
    margin-top: 36px;
    margin-bottom: 20px;
}

.tip1 {
    font-size: 23px;
    font-weight: bold;
    color: #EA5D5C;
    text-align: center;
}

.tip2 {
    font-size: 23px;
    font-weight: bold;
    color: #333333;
    text-align: center;
}

.enter1 {
    width: 583px;
    height: 57px;
    background: #608FFA;
    border-radius: 9px 9px 25px 25px;
    margin: 0 auto;
    margin-top: 20px;
    font-size: 23px;
    font-weight: bold;
    color: #FFFFFF;
    text-align: center;
    line-height: 57px;

}
</style>
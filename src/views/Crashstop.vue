<script lang='ts'>
import { defineComponent, reactive } from 'vue'
import { CrashStatus } from '../js/globalData';
import { robotUtil } from '../js/robotUtil';
import settingUtil from '../js/settingUtil';
import router from '../router';
import store from '../store';
export default defineComponent({
    setup() {
        let obj = reactive({
            frompath: '',
        })

        function goon() {
            console.log("goon")
            CrashStatus.value = 1
            robotUtil.cancelEmergencyStop().then(() => {

            })
        }

        function gostay() {
            console.log("gostay")
            CrashStatus.value = 2
            if (obj.frompath == '/task') {
                robotUtil.cancelTask().then(() => {
                    robotUtil.cancelEmergencyStop().then((res: any) => {
                        if(router.currentRoute.value.path=="/crashstop"){
                            router.go(-2)
                        }else{
                            router.go(-1)
                        }
                    })
                })
            } else {
                robotUtil.cancelEmergencyStop().then((res: any) => {
                    router.back()
                })
            }

        }

        function gochar() {
            CrashStatus.value = 3
            robotUtil.cancelEmergencyStop().then((res: any) => {
                settingUtil.goCharpile(settingUtil.getChargeStation())
            })
        }

        function goit() {
            CrashStatus.value = 4
            robotUtil.cancelEmergencyStop().then((res: any) => {
                settingUtil.goStandby(settingUtil.getStandbyStation())
            })
        }

        return { obj, goon, gochar, gostay, goit }
    },
    beforeRouteEnter(to, from, next) {
        next((e: any) => {
            e.obj.frompath = from.fullPath
            CrashStatus.value = 0
            store().$patch((state: any) => {
                state.showAbnormal = 0
            })
        })
    },
})
</script>
    
<template>
    <div class="float1"></div>
    <div class="float2"></div>
    <div class="float3"></div>
    <div class="tip"></div>
    <div class="crash_tip">
        <div class="tip1">{{$t('crash.nyax')}}</div>
        <div class="tip2">{{$t('crash.jtan')}}</div>
    </div>
    <div class="tip3">可以自由推行机器人{{$t('crash.kyzytxjqr')}}</div>
    <div class="crash_center">
        <div class="enter_logo">
            <div class="logo_center">
                <img src="../assets/img/crashico0.png" style="width:184px;height: 184px;">
            </div>
        </div>
        <div class="crash_choice" @click="goon" style="box-shadow: 0 0px 40px 0px #83A9FF;">
            <div class="li1">{{$t('crash.jxrw')}}</div>
            <div class="taskonimg">
                <img src="../assets/img/crashstopic1.png" style="width:100%;height: 100%;">
            </div>
        </div>
        <div class="crash_choice" @click="gochar">
            <div class="li2">{{$t('crash.fhcs')}}</div>
            <div class="taskonimg2">
                <img src="../assets/img/crashico2.png" style="width:100%;height: 100%;">
            </div>
        </div>
        <div class="crash_choice" @click="gostay">
            <div class="li3">{{$t('crash.yddm')}}</div>
            <div class="taskonimg">
                <img src="../assets/img/crashico3.png" style="width:100%;height: 100%;">
            </div>
        </div>
        <div class="crash_choice" @click="goit">
            <div class="li4">{{$t('crash.fhdmd')}}</div>
            <div class="taskonimg2">
                <img src="../assets/img/crashico4.png" style="width:100%;height: 100%;">
            </div>
        </div>
    </div>
</template>
    
<style scoped>
.tip {
    height: 100px;
    width: 100%;
}

.crash_tip {
    height: 44px;
    width: 100%;
    display: flex;
    justify-content: center;
}

.tip1 {
    font-weight: bold;
    color: #333333;
    font-size: 30px;
    line-height: 44px;

}

.tip2 {
    font-size: 45px;
    font-weight: bold;
    color: #C92F1F;
    line-height: 44px;
}

.tip3 {
    font-weight: bold;
    color: #333333;
    font-size: 30px;
    text-align: center;
}

.crash_center {
    height: 422px;
    width: 863px;
    margin: 0 auto;
    display: flex;
    display: flex;
    justify-content: space-between;
    align-content: space-between;
    flex-wrap: wrap;
    margin-top: 49px;
    position: relative;

}

.crash_choice {
    height: 178px;
    width: 374px;
    background-color: #83A9FF;
    border-radius: 20px;
}

.enter_logo {
    position: absolute;
    width: 240px;
    height: 240px;
    border-radius: 50%;
    left: 50%;
    top: 50%;
    margin-left: -120px;
    margin-top: -120px;
    z-index: 1;
    overflow: hidden;
    background-color: #F1F2F6;
    display: flex;
    align-items: center;
    justify-content: center;


}

.logo_center {
    width: 184px;
    height: 184px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    overflow: hidden;

}

.li1 {
    margin-left: 46px;
    margin-top: 34px;
    font-size: 34px;
    font-weight: bold;
    color: white;
}

.li2 {
    margin-left: 179px;
    margin-top: 34px;
    font-size: 34px;
    font-weight: bold;
    color: white;
}

.li3 {
    margin-left: 46px;
    margin-top: 34px;
    font-size: 34px;
    font-weight: bold;
    color: white;
}

.li4 {
    margin-left: 140px;
    margin-top: 34px;
    font-size: 34px;
    font-weight: bold;
    color: white;
}

.taskonimg {
    width: 61px;
    height: 61px;
    margin-left: 46px;
    margin-top: 5px;
}

.taskonimg2 {
    width: 61px;
    height: 61px;
    margin-left: 258px;
    margin-top: 5px;
}

.float1 {
    width: 350px;
    height: 350px;
    position: fixed;
    left: -175px;
    top: -175px;
    background-color: #C9D8F9;
    border-radius: 50%;
}

.float2 {
    width: 250px;
    height: 250px;
    position: fixed;
    left: -190px;
    bottom: 70px;
    background-color: #C9D8F9;
    border-radius: 50%;
}

.float3 {
    width: 200px;
    height: 200px;
    position: fixed;
    right: -80px;
    top: 230px;
    background-color: #C9D8F9;
    border-radius: 50%;
}
</style>
    
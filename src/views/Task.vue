<script setup lang="ts">
import router from '../router';
import { robotUtil, taskInfo } from '../js/robotUtil';
import { CrashStatus } from '../js/globalData'
import { onMounted, reactive, ref, watch } from 'vue';
import store from '../store';
import { onBeforeRouteLeave } from 'vue-router';
import { Rlog } from '../js/Rlog';
const userStore: any = store()
const task = taskInfo
const takeMeal = ref(false)
const isPause = ref(false)
const cruiseStop = ref(false)
const getcurrentearly = ref(false)
let currentTaskIndex = 0
let countdownTimeout: any = ''  //倒计时
let pauseshowtime = ref(0)
let getearly_pausetime = ref(0)
let curise_pausetime = ref(0)
let curiseCur = ref()
let getmeal_pausetime = ref(0) //取餐等待时长
//14出发 16到达 到达状态巡游不需要暂停，临时解决 
//sdk暂停状态 暂停无效也怕时间差寸交互不及时
const cruisePauseAble = ref(0)
const countdownSwitch = ref(true) //送餐倒计时开关
function setCurrentTask(t: any) {
    task.currentTask = t
}

function UICallBack(tag: number) {
    Rlog(tag, "==============UICallBack==========")
    switch (tag) {
        case 14: {//前往
            cruisePauseAble.value = 14
            updateCurrentTaskIndex()
        }
            break;
        case 16: {//到达
            Rlog("到达16")
            cruisePauseAble.value = 16
            if (taskInfo.runType == 23) {
                curiseCur.value = taskInfo.currentTask.name
                Rlog(curiseCur.value, "value")
            }

        }
            break;
        case 40: {//到达
            Rlog("到达40")
            takeMeal.value = true
            if (taskInfo.runType == 20 || taskInfo.runType == 21 || taskInfo.runType == 22) {
                //到达之前点击了提前取
                getcurrentearly.value = false
                clearTimeout(countdownTimeout)
                if (countdownSwitch.value) {
                    TimeoutSet_getmeal(0)
                }
            }
        }
            break;
        case 1001: {//结束
            task.currentTask.name = ""
            navIndex()
        }
            break;
    }
}

onMounted(() => {
    robotUtil.setUICallBack(UICallBack)
    currentTaskIndex = 0
    updateCurrentTaskIndex()

    watch(() => CrashStatus.value,
        (newvalue, oldvalue) => {
            if (newvalue == 1) {
                goonTask()
            }
        }
    );
})

//更新当前显示的正在配送任务
function updateCurrentTaskIndex() {
    let hastask = false
    for (let i = 0; i < task.list.length; i++) {
        if (task.list[i].status == 1) {
            currentTaskIndex = i
            hastask = true
            break
        }
    }
    if (hastask == false) {
        for (let i = 0; i < task.list.length; i++) {
            if (task.list[i].status == 0) {
                currentTaskIndex = i
                hastask = true
                break
            }
        }
    }

    Rlog(currentTaskIndex, "Task-currentTaskIndex")
    if (hastask == true) {
        let t = task.list[currentTaskIndex]
        setCurrentTask(t)
    }
    if (hastask == false) {
        if (taskInfo.runType == 20 || taskInfo.runType == 21 || taskInfo.runType == 22 || taskInfo.runType == 23) {
            Rlog("该去待命点了")
            let t = taskInfo.backPt;
            taskInfo.runType = 24
            setCurrentTask(t)
        } else {
            //等待1001结束任务
        }
    }
}

//暂停/继续
function pause() {
    clearTimeout(countdownTimeout)
    if (taskInfo.runType == 20 || taskInfo.runType == 21) {
        if (isPause.value) {
            let arr = []
            for (let i = 0; i < task.list.length; i++) {
                if (task.list[i].preGet == true) { //todo 需要改id
                    arr.push({ index: i, isPass: true })
                }
            }
            if (arr.length > 0) {
                robotUtil.updateTask(arr).then((res: any) => {
                    return robotUtil.executeTask()
                }).then(() => {
                    for (let i = 0; i < task.list.length; i++) {
                        if (task.list[i].preGet == true) { //todo 需要改id
                            task.list[i].preGet = false
                        }
                    }
                    updateCurrentTaskIndex()
                    isPause.value = !isPause.value
                })
            } else {
                robotUtil.resumeTask().then(() => {
                    updateCurrentTaskIndex()
                    isPause.value = !isPause.value
                })
            }
        } else {
            robotUtil.pauseTask().then(() => {
                isPause.value = !isPause.value
                TimeoutSet(0)
            })
        }
    } else if (taskInfo.runType == 23) {
        //巡游暂停
        if (cruisePauseAble.value == 16) {
            return
        } else {
            if (cruiseStop.value) {
                robotUtil.resumeTask().then(() => {
                    cruiseStop.value = !cruiseStop.value
                })
            } else {
                robotUtil.pauseTask().then(() => {
                    cruiseStop.value = !cruiseStop.value
                    TimeoutSet_Curise(0)
                })
            }
        }
    }
}

//取消任务
function cancelTask() {
    clearTimeout(countdownTimeout)
    robotUtil.cancelTask()
}

//取餐
function takeAway(item: any) {
    clearTimeout(countdownTimeout)
    item.status = 3
    let arr = []
    for (let i = 0; i < task.list.length; i++) {
        if (task.list[i].preGet == true) { //todo 需要改id
            arr.push({ index: i, isPass: true })
        }
    }
    if (arr.length > 0) {
        robotUtil.updateTask(arr).then((res: any) => {
            return robotUtil.executeTask()
        }).then(() => {
            for (let i = 0; i < task.list.length; i++) {
                if (task.list[i].preGet == true) { //todo 需要改id
                    task.list[i].preGet = false
                }
            }
            updateCurrentTaskIndex()
            takeMeal.value = false
        })
    } else {
        robotUtil.continueTask().then(() => {
            updateCurrentTaskIndex()
            takeMeal.value = false
        })
    }
}

//提前取
function preGet(item: any) {
    item.status = 3
    item.preGet = true
}

//点击当前提前取
function preGetCurrent() {
    clearTimeout(countdownTimeout)
    robotUtil.pauseTask().then(() => {
        getcurrentearly.value = true
        TimeoutSet_getEary(0)
    })
}

//取消提前取餐
function Cancle_getEarly() {
    clearTimeout(countdownTimeout)
    robotUtil.resumeTask().then(() => {
        updateCurrentTaskIndex()
        getcurrentearly.value = false
    })
}


//确定提前取
function getEarly() {
    clearTimeout(countdownTimeout)
    for (let i = 0; i < task.list.length; i++) {
        let item = task.list[i]
        if (item.status == 1) { //todo 需要改id
            robotUtil.updateTask([{ index: i, isPass: true }]).then(() => {
                return robotUtil.executeTask()
            }).then(() => {
                item.status = 3
                updateCurrentTaskIndex()
                getcurrentearly.value = false
            })
            break;
        }
    }
}


function navCrashstop() {
    robotUtil.emergencyStop()
}

function navIndex() {
    takeMeal.value = false
    isPause.value = false

    if (router.currentRoute.value.path == '/task') {
        router.back()
    }
}

function getcolor(status: any) {
    if (status == 0) {
        return '#6A96FB'  //未配送
    } else if (status == 1 || status == 2) {
        return '#ED8037'  //正在配送 已到达
    } else if (status == 3) {
        return '#999999'  //已完成
    }
}

function getTakeMelcalss(status: any) {
    if (status == 0 || status == 1) {
        return 'takeone2'  //未配送
    } else if (status == 2) {
        return 'takeone' //已到达
    } else if (status == 3) {
        return 'takeone3'  //已完成
    }
}

function TimeoutSet(e: number) {
    let pauseTime = userStore.customSetting.delivery.pauseDuration
    let i = e
    countdownTimeout = setTimeout(() => {
        i += 1
        if (i == pauseTime) {
            //继续任务
            pause()
        } else {
            TimeoutSet(i)
        }
    }, 1000)
    pauseshowtime.value = pauseTime - i
}
//点击提前取餐开始倒计时
function TimeoutSet_getEary(e: number) {
    let pauseTime = userStore.customSetting.delivery.pauseDuration
    let i = e
    countdownTimeout = setTimeout(() => {
        i += 1
        if (i == pauseTime) {
            getEarly()
        } else {
            TimeoutSet_getEary(i)
        }
    }, 1000)
    getearly_pausetime.value = pauseTime - i
}


//点击巡游暂停开始倒计时
function TimeoutSet_Curise(e: number) {
    let pauseTime = userStore.customSetting.delivery.pauseDuration
    let i = e
    countdownTimeout = setTimeout(() => {
        i += 1
        if (i == pauseTime) {
            pause()
        } else {
            TimeoutSet_Curise(i)
        }
    }, 1000)
    curise_pausetime.value = pauseTime - i
}

//到达点位开始倒计时
function TimeoutSet_getmeal(e: number) {
    let pauseTime = userStore.customSetting.delivery.stopDuration
    let i = e
    countdownTimeout = setTimeout(() => {
        i += 1
        if (i == pauseTime) {
            for (let item of task.list) {
                if (item.status == 2) {
                    takeAway(item)
                    break
                }
            }
        } else {
            TimeoutSet_getmeal(i)
        }
    }, 1000)
    getmeal_pausetime.value = pauseTime - i
}


//修改任务
function ModifyTask() {
    //标记为修改任务状态
    userStore.$patch((state: any) => {
        state.isModify = true
        clearTimeout(countdownTimeout)
        Rlog("结束当前任务")
        robotUtil.cancelTask()
    })
}

//继续任务
function goonTask() {
    if (!takeMeal) {
        robotUtil.resumeTask()
        robotUtil.continueTask()
    }
}


//离开页面
onBeforeRouteLeave(() => {
    Rlog("离开页面清除倒计时")
    clearTimeout(countdownTimeout)
    isPause.value = false
    cruiseStop.value = false

})
defineExpose({ userStore, countdownSwitch });
</script>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            const instance: any = vm;
            //不存在倒计时开关参数 默认设置为1
            if (instance.userStore.customSetting.delivery.countdownSwitch == undefined) {
                instance.countdownSwitch = true
            } else {
                instance.countdownSwitch = instance.userStore.customSetting.delivery.countdownSwitch

            }
        });
    },
});
</script>

<template>
    <!-- 顶部开始 -->
    <div class="tip">
        <div class="navposi">
            <navbarVue :heights="'65'" />
        </div>
    </div>
    <!-- 顶部结束 -->


    <!-- 任务中画面 -->
    <div class="task_content" @click="pause" v-if="!isPause">
        <div class="center_table" v-if="task.runType !== 23">{{ task.currentTask.name }}</div>
        <div class="center_table" v-if="task.runType == 23 && cruiseStop == false && cruisePauseAble != 16">{{
                $t('task.xyz')
        }}
        </div>

        <div class="center_table" v-if="task.runType == 23 && cruiseStop == false && cruisePauseAble == 16">
            {{ task.currentTask.name }}
        </div>
        <!-- 巡游已暂停 -->
        <div class="center_table" v-if="task.runType == 23 && cruiseStop == true">{{ $t('task.xyyzt') }}</div>

        <div v-if="task.runType == 20 || task.runType == 21" class="center_give">{{ $t('task.scz') }}</div>
        <div v-if="task.runType == 23 && cruiseStop == false && cruisePauseAble == 16" class="center_give">{{
                $t('task.xyydd')
        }}
        </div>

        <div v-if="task.runType == 23 && cruiseStop == true" class="center_give" style="bottom:140px">
            <div>{{ $t('task.ztxyrwz') }}</div>
            <div>{{ $t('task.djpmjxxy') }}</div>
            <div style="color: #ED8037;">{{ $t('task.dsjsz') }} ({{ curise_pausetime }}s)</div>
        </div>

        <img src="../assets/img/taskcircle.png" style="height: 100%;width: 100%;position: absolute;">
        <img src="../assets/img/taskcircle2.png"
            style="height: 550px;width: 564.48px;z-index: 1;position: absolute;top: 5.76px;left: 5.76px;">
        <img src="../assets/img/taskcircle3.png" class="centercircle">
    </div>
    <div class="stop_now" @click="navCrashstop" v-if="!isPause">
        <!-- 急停 -->
        <img src="../assets/img/stoppress.jpg">
        <div class="la_font">{{ $t('task.jtms') }}</div>
    </div>
    <div class="ealy_get" @click="preGetCurrent()" v-if="!isPause && (task.runType == 20 || task.runType == 21)">
        <!-- 提前取 -->
        <img src="../assets/img/earyget.jpg" />
        <div class="la_font">{{ $t('task.tqq') }}</div>
    </div>


    <div class="curise_mode" v-if="task.runType == 23 && cruiseStop == true">
        <div class="mode_right" @click="cancelTask">
            <div>
                <img src="../assets/img/taskr2.png" style="width:100%;height: 100%;">
            </div>
            <div class="font8">{{ $t('task.jsrw') }}</div>
        </div>
    </div>

    <!-- //提前取餐的弹框 -->
    <div class="early_gettank" v-if="getcurrentearly == true">
        <div class="earlycenter">
            <div class="imgcenter">
                <img src="../assets/img/eary_getmeal.png" style="width:100%;height: 100%;">
            </div>
            <div class="overtime">
                {{ $t('task.sfwccz') }}
            </div>

            <div class="bot-button">
                <div @click="Cancle_getEarly">{{ $t('index.qx') }}</div>
                <div @click="getEarly">{{ $t('task.wc') }} （{{ getearly_pausetime }}s）</div>
            </div>
        </div>
    </div>
    <!-- 任务中画面 -->


    <!-- 暂停画面 -->
    <div v-if="isPause">
        <div class="stopsty">
            <div class="leftdevery" @click="pause">
                <div class="annicont">
                    <div class="ondeliveryable">{{ task.currentTask.name }}</div>
                    <div v-if="task.runType == 20 || task.runType == 21" class="deliverytip font9">
                        <div>{{ $t('task.ztrwz') }}</div>
                        <div>{{ $t('task.djpmjxps') }}</div>
                        <div>{{ $t('task.dsjsz') }} ({{ pauseshowtime }}s)</div>
                    </div>
                    <img src="../assets/img/taskcircle.png" style="height: 100%;width: 100%;position: absolute;">
                    <img src="../assets/img/taskcircle2.png"
                        style="height: 550px;width: 564.48px;z-index: 1;position: absolute;top: 5.76px;left: 5.76px;">
                </div>
            </div>
            <div class="rightdevery">
                <div class="delivery_list">
                    <div class="topmess">{{ $t('task.rwlb') }} <div class="emptyline"></div>
                        <div class="list_scroll">
                            <div class="one_li" v-for="(item, index) in task.pallet">
                                <div class="lineem" v-if="index != task.pallet.length - 1">
                                    <div></div>
                                </div>
                                <div class="li_cont">
                                    <div :class="item.status == 1 ? 'one_num2' : 'one_num'">{{ index + 1 }}</div>
                                    <div class="one_cont"
                                        :style="'border-bottom: 4px solid ' + getcolor(item.status) + '!important'">
                                        <div :style="'color:' + getcolor(item.status) + ''">L{{ index + 1 }}：</div>
                                        <div :style="'color:' + getcolor(item.status) + ''" class="font8">{{ item.name
                                        }}
                                        </div>
                                    </div>
                                </div>
                                <div @click="preGet(item)" class="bottom_Co font8"
                                    v-if="item.status == 0 || item.status == 1">{{ $t('task.tqq') }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="delivery_bottom">
                    <div class="bottom1 font8" @click="ModifyTask">
                        <img src="../assets/img/taskr1.png" alt="">
                        {{ $t('index.xgrw') }}
                    </div>
                    <div class="bottom2 font8" @click="cancelTask">
                        <img src="../assets/img/taskr2.png" alt="">
                        {{ $t('task.jsrw') }}
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- 暂停画面 -->



    <!-- 取餐画面 -->
    <div class="Take_meal" v-if="takeMeal">
        <!-- 多餐桌 -->
        <div class="take_cont" v-if="task.list.length > 1">
            <div :class="getTakeMelcalss(item.status)" v-for="(item, index) in task.list" :key="index">
                <div>
                    {{ item.name }}
                </div>
                <div v-if="task.runType == 20">
                    <span v-for="(item2, index2) in item.idx" :key="index2">
                        {{ item2 + 1 }}{{ $t('task.ceng') }}<span v-if="index2 != item.idx.length - 1">、</span>
                    </span>{{ $t('task.tuopan') }}
                </div>
                <div class="taketype" @click="takeAway(item)" v-if="item.status == 2">
                    <div>{{ $t('task.liji') }}</div>
                    <div>{{ $t('task.quchu') }}</div>
                </div>

                <div class="taketype2" v-if="item.status == 3">
                    <div>{{ $t('task.yqc') }}</div>
                </div>
                <div class="taketype3" @click="preGet(item)" v-if="item.status == 1 || item.status == 0">
                    <div>{{ $t('task.tiqian') }}</div>
                    <div>{{ $t('task.quchu') }}</div>
                </div>
            </div>
            <div class="interview" v-if="countdownSwitch">
                {{ $t('task.lkjsz') }}({{ getmeal_pausetime }}s)
            </div>
        </div>

        <!-- 单餐桌 -->
        <div v-if="task.list.length == 1" class="take_cont2">
            <div class="onetasktake">
                <div>{{ task.currentTask.name }}</div>
                <div>{{ $t('task.qqc') }}</div>
            </div>
            <div @click="takeAway(task.currentTask)" class="onepallent_take">{{ $t('task.ljqc') }}</div>

            <div class="interview" v-if="countdownSwitch">
                {{ $t('task.lkjsz') }}({{ getmeal_pausetime }}s)
            </div>
        </div>


    </div>
    <!-- 取餐画面 -->
</template>



<style scoped>
.demoBtn {
    margin: 20px;
    border: 1px solid saddlebrown;
}

.tip {
    width: 1204px;
    height: 65px;
    position: relative;
    margin: 0 auto;
}

.navposi {
    position: absolute;
    left: 0;
    top: 0
}

.task_content {
    height: 573.12px;
    width: 573.12px;
    margin: 0 auto;
    position: relative;

}

.stop_now {
    height: 194px;
    width: 166px;
    border: 4px dashed #efefee;
    position: fixed;
    left: 20px;
    bottom: 25px;
}

.stop_now>img {
    width: 100%;
    height: 100%;
}

.ealy_get>img {
    width: 100%;
    height: 100%;
}

.ealy_get {
    height: 194px;
    width: 166px;
    border: 4px dashed #efefee;
    position: fixed;
    right: 20px;
    bottom: 25px;
}

.la_font {
    width: 100%;
    text-align: center;
    font-size: 22px;
    color: white;
    position: absolute;
    bottom: 55px;
    font-weight: bold;
    height: 32px;

}

.center_table {
    width: 435px;
    font-size: 75px;
    font-weight: bold;
    color: #000000;
    line-height: 574px;
    text-align: center;
    position: absolute;
    left: 50%;
    margin-left: -217.5px;
    top: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

}

.center_give {
    font-size: 20px;
    font-weight: bold;
    color: #000000;
    text-align: center;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 160px;
}

.centercircle {
    height: 435px;
    width: 435px;
    z-index: 2;
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -217px;
    margin-top: -217px;
}

.stopsty {
    height: calc(100vh - 67px);
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.leftdevery {
    width: 839px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.rightdevery {
    width: 392px;
    height: 628px;
}

.annicont {
    width: 573.12px;
    height: 573.12px;
    border-radius: 50%;
    position: relative;
}

.ondeliveryable {
    width: 435px;
    position: absolute;
    left: 50%;
    margin-left: -217.5px;
    right: 0;
    top: 0;
    bottom: 0;
    font-size: 75px;
    font-family: Microsoft YaHei;
    font-weight: bold;
    color: #000000;
    text-align: center;
    line-height: 579px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.deliverytip {
    position: absolute;
    height: 200px;
    left: 0;
    right: 0;
    bottom: 0;
}

.deliverytip>div:nth-child(1) {
    font-size: 20px;
    font-weight: bold;
    color: #000000;
    width: 100%;
    text-align: center;
    margin-bottom: 10px;
}

.deliverytip>div:nth-child(2) {
    font-size: 20px;
    font-weight: bold;
    color: #000000;
    width: 100%;
    text-align: center;
    margin-bottom: 15px;
}

.deliverytip>div:nth-child(3) {
    font-size: 20px;
    font-weight: bold;
    color: #ED8037;
    width: 100%;
    text-align: center;
}

.delivery_list {
    height: 493.5px;
    width: 100%;
    border: 3px solid #C4D6FF;
    border-radius: 20px 20px 38px 38px;
    box-sizing: border-box;
}

.topmess {
    height: 63.4px;
    margin-left: 31px;
    font-size: 30px;
    font-weight: bold;
    color: #608FFA;
    line-height: 63.4px;
    position: relative;
}

.emptyline {
    width: 53px;
    height: 4px;
    background: #6090FA;
    border-radius: 1px;
    position: absolute;
    left: 0;
    bottom: 0;
}

.list_scroll {
    max-height: 410px;
    width: 331px;
    padding: 18px 0;
    box-sizing: border-box;
    overflow-y: scroll;
}

.list_scroll::-webkit-scrollbar {
    width: 0px !important;
    height: 0px !important;
}

.one_li {
    height: 134.5px;
    /* display: flex;
    justify-content: space-between; */
    position: relative;

}

.lineem {
    position: absolute;
    width: 37px;
    height: 134.5px;
    left: 0;
    top: 19px;
    display: flex;
    justify-content: center;
}

.lineem>div {
    width: 5px;
    background: #C4D6FF;
}

.li_cont {
    height: 40.5px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.one_num {
    width: 35px;
    height: 35px;
    background-color: #6A96FB;
    border-radius: 50%;
    font-size: 23px;
    font-weight: bold;
    color: #FFFFFF;
    line-height: 35px;
    text-align: center;
    z-index: 1;
}

.one_num2 {
    width: 35px;
    height: 35px;
    background-color: #ED8037;
    border-radius: 50%;
    font-size: 23px;
    font-weight: bold;
    color: #FFFFFF;
    line-height: 35px;
    text-align: center;
    z-index: 1;
}

.one_cont {
    height: 40.5px;
    width: 259px;
    border-bottom: 4px solid #C4D6FF;
    font-size: 30px;
    text-align: center;
    font-weight: bold;
    color: #999999;
    line-height: 40.5px;
    display: flex;
    align-items: center;

}

.one_cont>div:nth-child(1) {
    font-size: 23px;
    margin-left: 10px;

}

.bottom_Co {
    height: 57.5px;
    width: 201px;
    background-color: #C4D6FF;
    font-size: 23px;
    font-weight: bold;
    color: #6A96FB;
    line-height: 57.5px;
    text-align: center;
    margin-left: 93px;
    margin-top: 10px;
    border: 1px solid #FFFFFF;
    border-radius: 13px;
    box-sizing: border-box;
}

.delivery_bottom {
    height: 117px;
    width: 100%;
    border: 3px solid #C4D6FF;
    border-radius: 38px 38px 20px 20px;
    box-sizing: border-box;
    margin-top: 9px;
    display: flex;
    align-items: center;
}

.delivery_bottom>div {
    flex: 1;
    height: 85px;
    display: flex;
    align-items: center;
    flex-direction: column;
    font-size: 18px;
    color: #6A96FB;
    font-weight: bold;
}

.bottom1 {
    border-right: 2px solid #C4D6FF;
}

.bottom1>img {
    height: 49px;
    width: 49px;
    margin-bottom: 5px;

}

.bottom2>img {
    height: 49px;
    width: 49px;
    margin-bottom: 5px;

}

.Take_meal {
    height: calc(100vh - 65px);
    background-color: #F1F2F6;
    position: fixed;
    z-index: 2;
    left: 0;
    right: 0;
    top: 65px;

}

.take_cont {
    width: 1143px;
    height: calc(100% - 40px);
    border-radius: 25px;
    box-shadow: #E3E4E8 0px 0px 17px 3px inset;
    margin: 0 auto;
    margin-top: 5px;
    padding: 47px 53px 0 53px;
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    align-content: baseline;
    position: relative;
}

.take_cont2 {
    width: 1143px;
    height: calc(100% - 40px);
    border-radius: 25px;
    box-shadow: #E3E4E8 0px 0px 17px 3px inset;
    margin: 0 auto;
    margin-top: 5px;
    padding: 47px 53px 0 53px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;

}

.take_cont>div:nth-child(2n) {
    margin-right: 0 !important;
}

.takeone {
    width: 485px;
    height: 166px;
    background: #83A9FF;
    border-radius: 26px;
    margin-bottom: 28px;
    margin-right: 66px;
    padding: 30px 0 0 38px;
    box-sizing: border-box;
    position: relative;
    box-shadow: 1px 1px 15px #83A9FF;
}

.takeone>div:nth-child(1) {
    font-size: 45px;
    font-weight: bold;
    color: #FFFFFF;
}

.takeone>div:nth-child(2) {
    font-size: 23px;
    font-weight: bold;
    color: #FFFFFF;
}



.takeone2 {
    width: 485px;
    height: 166px;
    background: #C4D6FF;
    border-radius: 26px;
    margin-bottom: 28px;
    margin-right: 66px;
    padding: 30px 0 0 38px;
    box-sizing: border-box;
    position: relative;
    box-shadow: 1px 1px 15px #C4D6FF;
}

.takeone2>div:nth-child(1) {
    font-size: 45px;
    font-weight: bold;
    color: #333333;
}

.takeone2>div:nth-child(2) {
    font-size: 23px;
    font-weight: bold;
    color: #333333;
}



.takeone3 {
    width: 485px;
    height: 166px;
    background: #E1E2E3;
    border-radius: 26px;
    margin-bottom: 28px;
    margin-right: 66px;
    padding: 30px 0 0 38px;
    box-sizing: border-box;
    position: relative;
}

.takeone3>div:nth-child(1) {
    font-size: 45px;
    font-weight: bold;
    color: #666666;
}

.takeone3>div:nth-child(2) {
    font-size: 23px;
    font-weight: bold;
    color: #666666;
}

.taketype {
    min-width: 126px;
    height: 141px;
    padding: 0 10px;
    box-sizing: border-box;
    position: absolute;
    right: 13px;
    top: 12px;
    background: #C4D6FF;
    border-radius: 26px;
    font-size: 30px;
    font-weight: bold;
    color: #333333;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    box-shadow: 1px 1px 15px #C4D6FF;
}

.taketype2 {
    min-width: 126px;
    max-width: 150px;
    text-align: center;
    height: 141px;
    padding: 0 10px;
    box-sizing: border-box;
    position: absolute;
    right: 13px;
    top: 12px;
    background: #A1A1A1;
    border-radius: 26px;
    font-size: 30px;
    font-weight: bold;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.taketype3 {
    min-width: 126px;
    height: 141px;
    padding: 0 10px;
    box-sizing: border-box;
    position: absolute;
    right: 13px;
    top: 12px;
    background: #83A9FF;
    border-radius: 26px;
    font-size: 30px;
    font-weight: bold;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    box-shadow: 1px 1px 15px #83A9FF;
}

.onetasktake {
    height: 254px;
    width: 571px;
    background: #83A9FF;
    box-shadow: 1px 1px 20px #83A9FF;
    border-radius: 13px;
    margin-top: 80px;
    text-align: center;
}

.onetasktake>div:nth-child(1) {
    font-size: 45px;
    font-weight: bold;
    color: white;
    margin-top: 63px;

}

.onetasktake>div:nth-child(2) {
    font-size: 23px;
    font-weight: bold;
    color: white;
    margin-top: 23px;

}

.onepallent_take {
    width: 689px;
    height: 73px;
    background: #83A9FF;
    border-radius: 13px;
    box-shadow: 1px 1px 20px #83A9FF;
    text-align: center;
    line-height: 73px;
    font-size: 23px;
    font-weight: bold;
    color: white;
    margin-top: 100px;
}

.early_gettank {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999999;

}

.earlycenter {
    width: 613px;
    height: 378px;
    border-radius: 25px;
    background: #FFFFFF;

}

.imgcenter {
    width: 154px;
    height: 154px;
    margin: 0 auto;
    margin-top: 50px;

}

.overtime {
    font-size: 26px;
    font-weight: bold;
    color: #333333;
    width: 100%;
    text-align: center;
    margin-top: 10px;
}

.bot-button {
    height: 57px;
    width: 540px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 auto;
    margin-top: 40px;
}

.bot-button>div:nth-child(1) {
    width: 250px;
    height: 57px;
    background: #ECECEC;
    border-radius: 9px 9px 9px 25px;
    font-size: 23px;
    font-weight: bold;
    color: #999999;
    text-align: center;
    line-height: 57px;
}

.bot-button>div:nth-child(2) {
    width: 250px;
    height: 57px;
    background: #608FFA;
    border-radius: 9px 9px 25px 9px;
    font-size: 23px;
    font-weight: bold;
    color: white;
    text-align: center;
    line-height: 57px;
}

.curise_mode {
    width: 151px;
    height: 125px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 3px solid #C4D6FF;
    position: absolute;
    bottom: 16px;
    right: 16px;
    box-sizing: border-box;
    border-radius: 30px 30px 20px 20px;
}



.mode_right {
    width: 100%;
    height: 94px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    flex-direction: column;
}

.mode_right>div:nth-child(1) {
    width: 51px;
    height: 51px;
}

.mode_right>div:nth-child(2) {
    font-size: 19px;
    font-weight: bold;
    color: #608FFA;
    margin-top: 10px;

}

.interview {
    width: 100%;
    text-align: center;
    padding: 0 10px;
    position: absolute;
    bottom: 20px;
    font-size: 20px;
    font-family: Microsoft YaHei;
    font-weight: bold;
    color: #ED8037;
    text-align: center;
}
</style>
<script setup lang="ts">
import router from '../router';
import { taskUtil, taskInfo } from '../js/taskUtil';
import { onMounted, reactive, ref } from 'vue';

const task = taskInfo
const takeMeal = ref(false)
const isPause = ref(false)

let currentTaskIndex = 0

function setCurrentTask(t: any) {
    task.currentTask = t
}

function UICallBack(tag: number) {
    console.log("UICallBack", tag)
    switch (tag) {
        case 14: {//前往
            updateCurrentTaskIndex()
        }
            break;
        case 16: {//到达
            takeMeal.value = true
        }
            break;
        case 1001: {//结束
            navIndex()
        }
            break;
    }
}

onMounted(() => {
    console.log("onMounted")
    taskUtil.setUICallBack(UICallBack)
    currentTaskIndex = 0
    updateCurrentTaskIndex()
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

    console.log("currentTaskIndex", currentTaskIndex)
    if (hastask == true) {
        let t = task.list[currentTaskIndex]
        setCurrentTask(t)
    }
    if (hastask == false) {
        if (taskInfo.runType == 20 || taskInfo.runType == 21 || taskInfo.runType == 23) {
            console.log("该去待命点了")
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
    if (taskInfo.runType == 20 || taskInfo.runType == 21) {
        if (isPause.value) {
            taskUtil.resumeMotion().then(() => {
                updateCurrentTaskIndex()
                isPause.value = !isPause.value
            }).catch((e: any) => {
                console.log(e)
            })
        } else {
            taskUtil.pauseTask().then(() => {
                isPause.value = !isPause.value
            }).catch((e: any) => {
                console.log(e)
            })
        }
    }
}

//取消任务
function cancelTask() {
    taskUtil.cancelTask().then(() => {

    }).catch((e: any) => {
        console.log(e)
    })
}

//取餐
function takeAway(item: any) {
    item.status = 3
    taskUtil.continueTask().then(() => {
        updateCurrentTaskIndex()
        takeMeal.value = false
    }).catch((e: any) => {
        console.log(e)
    })
}

//提前取
function preGet(item: any) {
    let idx = -1
    for (let i = 0; i < task.list.length; i++) {
        if (item.name == task.list[i].name) { //todo 需要改id
            idx = i
            break;
        }
    }
    taskUtil.updateTask([{ index: idx, isPass: true }]).then((res: any) => {
        console.log("__________", res)
        item.status = 3
    }).catch((e: any) => {
        console.log(e)
    })
}

function preGetCurrent() {
    console.log("preGetCurrent")
    for (let i = 0; i < task.list.length; i++) {
        let item = task.list[i]
        console.log(item)
        if (item.status == 1) { //todo 需要改id
            taskUtil.updateTask([{ index: i, isPass: true }]).then(() => {
                item.status = 3
                updateCurrentTaskIndex()
            }).catch((e: any) => {
                console.log(e)
            })
            break;
        }
    }
}


function navCrashstop() {
    taskUtil.emergencyStop()
}

function navIndex() {
    takeMeal.value = false
    isPause.value = false
    router.go(-1)
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
        <div class="center_table">{{task.currentTask.name}}</div>
        <div v-if="task.runType==20||task.runType==21" class="center_give">送餐中</div>
        <img src="../assets/img/taskcircle.png" style="height: 100%;width: 100%;position: absolute;">
        <img src="../assets/img/taskcircle2.png" style="height: 100%;width: 100%;z-index: 1;position: absolute;">
        <img src="../assets/img/taskcircle3.png" class="centercircle">
    </div>
    <div class="stop_now" @click="navCrashstop" v-if="!isPause">
        <!-- 急停 -->
        <img src="../assets/img/stoppress.jpg">
    </div>
    <div class="ealy_get" @click="preGetCurrent()" v-if="!isPause&&(task.runType==20||task.runType==21)">
        <!-- 提前取 -->
        <img src="../assets/img/earyget.jpg" />
    </div>
    <!-- 任务中画面 -->


    <!-- 暂停画面 -->
    <div v-if="isPause">
        <div class="stopsty">
            <div class="leftdevery" @click="pause">
                <div class="annicont">
                    <div class="ondeliveryable">{{task.currentTask.name}}</div>
                    <div v-if="task.runType==20||task.runType==21" class="deliverytip">
                        <div>暂停任务中</div>
                        <div>点击屏幕继续配送</div>
                        <div>倒数计时中(58s)</div>
                    </div>
                    <img src="../assets/img/taskcircle.png" style="height: 100%;width: 100%;position: absolute;">
                    <img src="../assets/img/taskcircle2.png"
                        style="height: 100%;width: 100%;z-index: 1;position: absolute;">
                </div>
            </div>
            <div class="rightdevery">
                <div class="delivery_list">
                    <div class="topmess">任务列表 <div class="emptyline"></div>
                        <div class="list_scroll">
                            <div class="one_li" v-for="(item,index) in task.pallet">
                                <div class="lineem" v-if="index!=task.pallet.length-1">
                                    <div></div>
                                </div>
                                <div class="li_cont">
                                    <div :class="item.status==1?'one_num2':'one_num'">{{index+1}}</div>
                                    <div class="one_cont"
                                        :style="'border-bottom: 4px solid '+getcolor(item.status)+'!important'">
                                        <div :style="'color:'+getcolor(item.status)+''">L{{index+1}}：</div>
                                        <div :style="'color:'+getcolor(item.status)+''">{{item.name}}</div>
                                    </div>
                                </div>
                                <div @click="preGet(item)" class="bottom_Co" v-if="item.status==0||item.status==1">提前取
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="delivery_bottom">
                    <div class="bottom1">
                        <img src="../assets/img/taskr1.png" alt="">
                        修改任务
                    </div>
                    <div class="bottom2" @click="cancelTask">
                        <img src="../assets/img/taskr2.png" alt="">
                        结束任务
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- 暂停画面 -->



    <!-- 取餐画面 -->
    <div class="Take_meal" v-if="takeMeal">
        <!-- 多餐桌 -->
        <div class="take_cont" v-if="task.list.length>1">
            <div :class="getTakeMelcalss(item.status)" v-for="(item,index) in task.list" :key="index">
                <div>
                    {{item.name}}
                </div>
                <div>
                    <span v-for="(item2,index2) in item.idx" :key="index2">
                        {{item2+1}}层<span v-if="index2!=item.idx.length - 1">、</span>
                    </span>托盘
                </div>
                <div class="taketype" @click="takeAway(item)" v-if="item.status==2">
                    <div>立即</div>
                    <div>取出</div>
                </div>

                <div class="taketype2" v-if="item.status==3">
                    <div>已取出</div>
                </div>
                <div class="taketype3" @click="preGet(item)" v-if="item.status==1||item.status==0">
                    <div>提前</div>
                    <div>取出</div>
                </div>
            </div>
        </div>

        <!-- 单餐桌 -->
        <div v-if="task.list.length==1" class="take_cont2">
            <div class="onetasktake">
                <div>{{task.currentTask.name}}</div>
                <div>请取餐</div>
            </div>
            <div @click="takeAway(task.currentTask)" class="onepallent_take">立即取餐</div>
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
    height: 574px;
    width: 574px;
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

.center_table {
    font-size: 75px;
    font-weight: bold;
    color: #000000;
    line-height: 574px;
    text-align: center;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;

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
    width: 579px;
    height: 579px;
    border-radius: 50%;
    position: relative;
}

.ondeliveryable {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    font-size: 75px;
    font-family: Microsoft YaHei;
    font-weight: bold;
    color: #000000;
    text-align: center;
    line-height: 579px;

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
    height: 514px;
    width: 100%;
    border: 3px solid #C4D6FF;
    border-radius: 20px 20px 38px 38px;
    box-sizing: border-box;
}

.topmess {
    height: 66px;
    margin-left: 31px;
    font-size: 30px;
    font-weight: bold;
    color: #608FFA;
    line-height: 66px;
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
    max-height: 427px;
    width: 331px;
    padding: 20px 0;
    box-sizing: border-box;
    overflow-y: scroll;
}
.list_scroll::-webkit-scrollbar {
    width: 0px !important;
    height: 0px !important;
}

.one_li {
    height: 140px;
    /* display: flex;
    justify-content: space-between; */
    position: relative;

}

.lineem {
    position: absolute;
    width: 37px;
    height: 140px;
    left: 0;
    top: 21px;
    display: flex;
    justify-content: center;
}

.lineem>div {
    width: 5px;
    background: #C4D6FF;
}

.li_cont {
    height: 42px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.one_num {
    width: 37px;
    height: 37px;
    background-color: #6A96FB;
    border-radius: 50%;
    font-size: 23px;
    font-weight: bold;
    color: #FFFFFF;
    line-height: 37px;
    text-align: center;
    z-index: 1;
}

.one_num2 {
    width: 37px;
    height: 37px;
    background-color: #ED8037;
    border-radius: 50%;
    font-size: 23px;
    font-weight: bold;
    color: #FFFFFF;
    line-height: 37px;
    text-align: center;
    z-index: 1;
}

.one_cont {
    height: 42px;
    width: 259px;
    border-bottom: 4px solid #C4D6FF;
    font-size: 30px;
    text-align: center;
    font-weight: bold;
    color: #999999;
    line-height: 42px;
    display: flex;
    align-items: center;

}

.one_cont>div:nth-child(1) {
    font-size: 23px;
    margin-left: 10px;

}

.bottom_Co {
    height: 60px;
    width: 201px;
    background-color: #C4D6FF;
    font-size: 23px;
    font-weight: bold;
    color: #6A96FB;
    line-height: 60px;
    text-align: center;
    margin-left: 93px;
    margin-top: 10px;
    border: 1px solid #FFFFFF;
    border-radius: 13px;
    box-sizing: border-box;
}

.delivery_bottom {
    height: 120px;
    width: 100%;
    border: 3px solid #C4D6FF;
    border-radius: 38px 38px 20px 20px;
    box-sizing: border-box;
    margin-top: 10px;
    display: flex;
    align-items: center;
}

.delivery_bottom>div {
    flex: 1;
    height: 87px;
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
    height: 50px;
    width: 50px;
    margin-bottom: 5px;

}

.bottom2>img {
    height: 50px;
    width: 50px;
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
    width: 126px;
    height: 141px;
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
    width: 126px;
    height: 141px;
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
    width: 126px;
    height: 141px;
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
</style>
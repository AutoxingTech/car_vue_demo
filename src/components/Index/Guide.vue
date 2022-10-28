
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            const instance: any = vm;
            if (from.fullPath == '/task') { //从任务页面返回取消当前选中
                if (instance.Guidelist) {
                    instance.Guidelist.select = 0
                    instance.Guidelist = ''
                }
            }
            instance.initscroll()
        })
    }
});
</script>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { modedisplay, modelAudioMap, currentfloor } from '../../js/Datacollation';
import { audioMode, ActionType } from "../../js/globalConfig"
import settingUtil from '../../js/settingUtil'
import store from '../../store'
import { robotUtil } from '../../js/robotUtil';
import { toast } from '../Toast/Toast';
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const userstore: any = store()
const currentType = ref(1) //当前显示餐桌还是包间
const tabMessage: any = modedisplay[2] //引领数据   
const Guidelist: any = ref() //当前选择的直达餐桌
const max_left = ref(false)   //餐桌楼层是否还可以向左滑动
const max_right = ref(false)  //餐桌楼层是否还可以向右滑动
const max_left1 = ref(false)  //包间楼层是否还可以向左滑动
const max_right1 = ref(false) //包间楼层是否还可以向右滑动
let curSwiper: any = null; //餐厅swiper的对象
let curSwiper2: any = null; //包间swiper的对象

onMounted(() => {
    //餐桌floorlist添加滚动监听
    var scrollDiv: any = document.getElementById('scroll1');
    scrollDiv.addEventListener('scroll', function () {
        if (scrollDiv.scrollLeft <= 10) {  //若滚动距离距离最左侧低于10 设置 max_left=true 已到达最左侧
            if (max_left.value == false) { //防止重读设置同样值
                max_left.value = true
            }
        } else {
            if (max_left.value == true) { //若滚动距离距离最左侧超过10 设置 max_left=false 距离左侧还有一段距离
                max_left.value = false
            }
        }

        if (scrollDiv.scrollWidth - scrollDiv.offsetWidth - scrollDiv.scrollLeft <= 10) {   //scroll内置的距离 - 固定宽的长度 - 滚动的长度<10 即将达到右侧
            if (max_right.value == false) {//防止重读设置同样值
                max_right.value = true
            }
        } else {
            if (max_right.value == true) { //scroll内置的距离 - 固定宽的长度 - 滚动的长度>0  //距离右侧还有一段距离
                max_right.value = false
            }
        }
    });

    //包间floorlist添加滚动监听
    var scrollDiv2: any = document.getElementById('scroll2');
    scrollDiv2.addEventListener('scroll', function () {
        if (scrollDiv2.scrollLeft <= 10) {
            if (max_left1.value == false) {
                max_left1.value = true
            }
        } else {
            if (max_left1.value == true) {
                max_left1.value = false
            }
        }
        if (scrollDiv2.scrollWidth - scrollDiv2.offsetWidth - scrollDiv2.scrollLeft <= 10) {
            if (max_right1.value == false) {
                max_right1.value = true
            }
        } else {
            if (max_right1.value == true) {
                max_right1.value = false
            }
        }
    });
})
//餐桌左右滚动一段距离
function floor1contscroll(e: any) {
    if (e == 1) {
        let scrollDiv: any = document.getElementById('scroll1');
        scrollDiv.scrollLeft -= 60
    } else {
        let scrollDiv: any = document.getElementById('scroll1');
        scrollDiv.scrollLeft += 69
    }
}
//包间左右滚动一段距离
function floor2contscroll(e: any) {
    if (e == 1) {
        let scrollDiv: any = document.getElementById('scroll2');
        scrollDiv.scrollLeft -= 60
    } else {
        let scrollDiv: any = document.getElementById('scroll2');
        scrollDiv.scrollLeft += 69
    }
}
//获取餐厅swiper对象方法
function onSwiper(e: any) {
    curSwiper = e
}
//获取包间swiper对象方法
function onSwiper2(e: any) {
    curSwiper2 = e
}
//楼层点击  swiper切换至对应位
function floorTap(item: any) {
    if (currentType.value == 1) {
        for (let i in tabMessage.boardlist) {
            if (tabMessage.boardlist[i][0].floor == item) {
                tabMessage.swipertab = Number(i)
                curSwiper.slideTo(Number(i));
                break
            }
        }
    } else {
        for (let i in tabMessage.boardlist2) {
            if (tabMessage.boardlist2[i][0].floor == item) {
                tabMessage.swipertab2 = Number(i)
                curSwiper2.slideTo(Number(i));
                break
            }
        }
    }

}
//将swiepr展示的楼层设为高亮
function computeFloor() {
    let ficlist = currentType.value == 1 ? tabMessage.floorlist : tabMessage.floorlist2
    let ficfloor = currentType.value == 1 ? tabMessage.boardlist[tabMessage.swipertab][0].floor : tabMessage.boardlist2[tabMessage.swipertab2][0].floor
    for (let i in ficlist) {
        if (ficlist[i].name == ficfloor) {
            ficlist[i].sel = true
            setcurrent(Number(i))
        } else {
            ficlist[i].sel = false
        }
    }
}
//swiper上一页
function swiperPrev() {
    currentType.value == 1 ? curSwiper.slidePrev() : curSwiper2.slidePrev()
}
//swiper下一页
function swiperNext() {
    currentType.value == 1 ? curSwiper.slideNext() : curSwiper2.slideNext()
}
//属于餐桌的swiper
function onSlideChange(e: any) {
    tabMessage.swipertab = e.activeIndex
    computeFloor()
}
//属于包间
function onSlideChange2(e: any) {
    tabMessage.swipertab2 = e.activeIndex
    computeFloor()
}
//点击站点
function pointTap(index: number, index2: number) {
    let boardlist = currentType.value == 1 ? tabMessage.boardlist : tabMessage.boardlist2
    let table = boardlist[index][index2]
    table.select = 1

    if (!Guidelist.value) {
        Guidelist.value = table
    } else {
        if (table.id == Guidelist.value.id) {
            Guidelist.value.select = 0
            Guidelist.value = ''
        } else {
            Guidelist.value.select = 0
            Guidelist.value = ''
            Guidelist.value = table
        }
    }
}
//站点语音
function volumeculation(e: any) {
    let currentcast = null
    let broadcasts = modelAudioMap[3 + ""]  //3==引领
    if (broadcasts[e + ""] != undefined) {
        currentcast = broadcasts[e + ""]
    }
    if (currentcast) {
        let Fobj: any = {
            mode: audioMode,
            url: currentcast.fileUrl,
            volume: userstore.customSetting.sound.switchon ? userstore.customSetting.sound.voiceVolume : 0,
            interval: currentcast.ruleInterval,
            duration: -1,
        }
        // 1 按播报次数  2按照播报时间
        if (currentcast.ruleType == 1) {
            Fobj.num = currentcast.ruleCount
        } else if (currentcast.ruleType == 2) {
            Fobj.duration = currentcast.ruleDuration
        }
        return Fobj
    } else {
        return {}
    }
}
//开始引领
function goTask() {
    let Guide_site = Guidelist.value
    if (!Guide_site) {
        toast.show(t('index.wxzzd'))
        return
    }
    let pts = [];
    pts.push(
        {
            x: Guide_site.coordinate[0],
            y: Guide_site.coordinate[1],
            yaw: Guide_site.yaw,
            areaId: Guide_site.areaId,
            dockingRadius: (Guide_site.properties && Guide_site.properties.dockingRadius) ? Guide_site.properties.dockingRadius : 0.5,
            ext: {
                name: Guide_site.name,
                id: Guide_site.id
            },
            stepActs: [
                {
                    type: ActionType.PlayAudio,//本地音频 //todo 没有引领音乐最好不传
                    data: volumeculation(Guide_site.id)
                }
            ],
        });

    let standby = settingUtil.getStandbyStation()
    let backPt = {
        type: standby.type,
        x: standby.coordinate[0],
        y: standby.coordinate[1],
        yaw: standby.yaw,
        areaId: standby.areaId,
        dockingRadius: (standby.properties && standby.properties.dockingRadius) ? standby.properties.dockingRadius : 0.5,
        ext: {
            name: t('setting.fhz'),//standby.name,
            id: standby.id,
        },
        stepActs: [
        ],
    }

    let curPt = {
        ext: {
            name: "起点",//起点要做的事件
        },
        stepActs: [
            {
                type: ActionType.SetSpeed,  //速度设置
                data: {
                    speed: userstore.customSetting.delivery.runSpeed / 100
                }
            },
        ],
    }

    let task = {
        name: "直达任务" + new Date().getTime(),
        runNum: 1,
        taskType: 2,
        runType: 22,
        curPt: curPt,
        pts: pts,
        backPt: {}
    };
    robotUtil.startTask(task)

}
//滚动到当前位置
function setcurrent(i: number) {
    var element1 = document.getElementById("id" + (Number(i)))
    if (element1) {
        element1.scrollIntoView({ block: 'center', inline: 'center', behavior: 'auto' })
    }
}
//初始化滚动条
function initscroll() {
    let ficlist = currentType.value == 1 ? tabMessage.floorlist : tabMessage.floorlist2
    for (let i in ficlist) {
        if (ficlist[i].sel) {
            setcurrent(Number(i))
        }
    }
}
//当前楼层是否发生变化
watch(() => currentfloor.value, (newvalue: any, oldvalue: any) => {
    floorTap(newvalue) //切换为当前楼层的swiper
})

defineExpose({ Guidelist, userstore, initscroll });
</script>
    
<template>
    <div class="multideliverycontent">
        <div class="multitop">

            <!-- 餐厅的楼层循环选择 begin-->
            <div :class="tabMessage.floorlist.length > 0 ? 'floor_content' : 'floor_content2'"
                v-show="currentType == 1">
                <div :class="max_left ? 'floorleft_per1' : 'floorleft_per2'" v-if="tabMessage.floorlist.length > 5"
                    @click="floor1contscroll(1)">
                    <img src="../../assets/img/floorl.png" style="width:13px;height: 21px;">
                </div>
                <div class="floor_list2" v-if="tabMessage.floorlist.length > 0" id="scroll1">
                    <div :id="'id' + index" :class="item.sel ? 'one_floor' : 'nosel_floor'"
                        v-for="(item, index) in tabMessage.floorlist" @click="floorTap(item.name)" :key="index">{{
                                item.name
                        }}</div>
                </div>
                <div :class="max_right ? 'floorright_per1' : 'floorright_per2'" v-if="tabMessage.floorlist.length > 5"
                    @click="floor1contscroll(2)">
                    <img src="../../assets/img/floorr.png" style="width:13px;height: 21px;">
                </div>
            </div>
            <!-- 餐厅的楼层循环选择 end-->

            <!-- 包间的楼层循环选择 begin-->
            <div :class="tabMessage.floorlist2.length > 0 ? 'floor_content' : 'floor_content2'"
                v-show="currentType == 2">
                <div :class="max_left1 ? 'floorleft_per1' : 'floorleft_per2'" v-if="tabMessage.floorlist2.length > 5"
                    @click="floor2contscroll(1)">
                    <img src="../../assets/img/floorl.png" style="width:13px;height: 21px;">
                </div>
                <div class="floor_list2" id="scroll2">
                    <div :id="'id' + index" :class="item.sel ? 'one_floor' : 'nosel_floor'"
                        v-for="(item, index) in tabMessage.floorlist2" @click="floorTap(item.name)" :key="index">{{
                                item.name
                        }}</div>
                </div>
                <div :class="max_right1 ? 'floorright_per1' : 'floorright_per2'" v-if="tabMessage.floorlist2.length > 5"
                    @click="floor2contscroll(2)">
                    <img src="../../assets/img/floorr.png" style="width:13px;height: 21px;">
                </div>
            </div>
            <!-- 包间的楼层循环选择 end-->


            <div class="sel_type">
                <div @click="currentType = 1" :class="currentType == 1 ? 'left_content_in' : 'left_content_out'">
                    {{ $t("index.xcz") }}
                </div>
                <div @click="currentType = 2" :class="currentType == 2 ? 'right_content_in' : 'right_content_out'">
                    {{ $t("index.xbj") }}
                </div>
            </div>
        </div>
        <!--列表 -->
        <div class="mu_point_list">
            <div class="left_pre" style="margin-top: -12px;">
                <span @click="swiperPrev" v-if="currentType == 1 && tabMessage.floorlist.length > 0"
                    :style="tabMessage.swipertab == 0 ? 'border-right-color: #C6C6C6 !important;' : 'border-right-color: #83A9FF !important;'"
                    class="swiper-button-prev"></span>
                <span @click="swiperPrev" v-if="currentType == 2 && tabMessage.floorlist2.length > 0"
                    :style="tabMessage.swipertab2 == 0 ? 'border-right-color: #C6C6C6 !important;' : 'border-right-color: #83A9FF !important;'"
                    class="swiper-button-prev"></span>
            </div>
            <!-- 餐桌点位选择 start-->
            <div class="left_center" v-if="currentType == 1">
                <div class="mu_swiper_content">
                    <swiper :initialSlide='tabMessage.swipertab' :slides-per-view="1" :space-between="50"
                        @swiper="onSwiper" @slideChange="onSlideChange">
                        <swiper-slide v-for="(item, index) in tabMessage.boardlist" :key="index" class="slideone">
                            <div v-for="(item2, index2) in item" :key="index2" @click="pointTap(index, index2)"
                                :class="item2.select == 1 ? 'mu_one_Point font1' : 'mu_one_Point2 font1'"
                                :style="!item2.name ? 'display:none' : ''">
                                {{ item2.name }}
                            </div>
                        </swiper-slide>
                    </swiper>
                </div>

            </div>
            <!-- 餐桌选择 end-->

            <!-- 包间点位选择 start-->
            <div class="left_center" v-if="currentType == 2">
                <swiper style="width: 100%;height: 100%;" :initialSlide='tabMessage.swipertab2' :slides-per-view="1"
                    :space-between="50" @swiper="onSwiper2" @slideChange="onSlideChange2">
                    <swiper-slide class="mu_swiper_content" v-for="(item, index) in tabMessage.boardlist2" :key="index">
                        <div v-for="(item2, index2) in item" :key="index2" @click="pointTap(index, index2)"
                            :class="item2.select == 1 ? 'mu_one_Point font1' : 'mu_one_Point2 font1'"
                            :style="!item2.name ? 'display:none' : ''">
                            {{ item2.name }}
                        </div>
                    </swiper-slide>
                </swiper>
            </div>
            <!-- 包间点位选择 end-->
            <div class="right_pre" style="margin-top: -12px;">
                <span @click="swiperNext" v-if="currentType == 1 && tabMessage.floorlist.length > 0"
                    :style="tabMessage.swipertab == tabMessage.boardlist.length - 1 ? 'border-left-color: #C6C6C6 !important;' : 'border-left-color: #83A9FF !important;'"
                    class="swiper-button-next"></span>

                <span @click="swiperNext" v-if="currentType == 2 && tabMessage.floorlist2.length > 0"
                    :style="tabMessage.swipertab2 == tabMessage.boardlist2.length - 1 ? 'border-left-color: #C6C6C6 !important;' : 'border-left-color: #83A9FF !important;'"
                    class="swiper-button-next"></span>
            </div>
        </div>
        <div class="mu_dot">
            <div class="dotscontent" v-if="currentType == 1">
                <div v-for="(item, index) in tabMessage.boardlist"
                    :class="index == tabMessage.swipertab ? 'one_dot' : 'one_dot2'">
                </div>
            </div>

            <div class="dotscontent" v-if="currentType == 2">
                <div v-for="(item, index) in tabMessage.boardlist2"
                    :class="index == tabMessage.swipertab2 ? 'one_dot' : 'one_dot2'">
                </div>
            </div>
        </div>
        <div class="mu_sel_point">
            <div class="guide_task font1" @click="goTask">
                <span v-if="userstore.isModify"> {{ $t("index.xgrw") }}</span>
                <span v-else> {{ $t("index.ljcf") }}</span>
            </div>
        </div>

    </div>
</template>
    
    
<style scoped>
.multideliverycontent {
    width: 1205px;
    height: 604px;
    box-shadow: #E3E4E8 0px 0px 17px 3px inset;
    margin-left: 38px;
    border-radius: 13px;

}

.multitop {
    height: 105px;
    border-bottom: 3px solid #83A9FF;
    width: 1120px;
    margin: 0 auto;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.mu_point_list {
    height: 379px;
    width: 100%;
    display: flex;
}

.mu_dot {
    height: 33.5px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.mu_sel_point {
    width: 1166px;
    height: 66px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
}

.mu_sel_left {
    width: 953px;
    height: 66px;
    background-color: #83A9FF;
    border-radius: 6px 13px 6px 13px;
    box-shadow: 0px 0px 3px #83A9FF;
    display: flex;
    align-items: center;
}

.mu_sel_right {
    width: 188px;
    height: 66px;
    background-color: #83A9FF;
    border-radius: 13px 6px 13px 6px;
    box-shadow: 0px 0px 3px #83A9FF;
    text-align: center;
    line-height: 66px;
    font-weight: bold;
    color: #FFFFFF;
    font-size: 23px;

}

.mu_swiper_content {
    height: 100%;
    padding-top: 2px;
    display: flex;
    flex-wrap: wrap;
}

.mu_swiper_content>div:nth-child(5n) {
    margin-right: 0;
}

.mu_one_Point {
    width: 189px;
    height: 96px;
    background-color: #83A9FF;
    margin-right: 43px;
    margin-top: 28.8px;
    box-shadow: 0px 0px 4px #83A9FF;
    border-radius: 13px;
    text-align: center;
    line-height: 96px;
    font-weight: bold;
    color: #FFFFFF;
    box-sizing: border-box;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.mu_one_Point2 {
    width: 189px;
    height: 96px;
    background-color: #E1E2E3;
    margin-right: 43px;
    margin-top: 28.8px;
    border-radius: 13px;
    text-align: center;
    line-height: 96px;
    font-weight: bold;
    color: #666666;
    box-sizing: border-box;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.draf_cont {
    width: 833px;
    height: 43px;
    border-right: 3px solid #FFFFFF;
    box-sizing: border-box;
    display: flex;
    align-items: center;
}

.one_drag {
    width: 105px;
    height: 100%;
    text-align: center;
    font-size: 23px;
    font-weight: bold;
    color: #FFFFFF;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.clean_cont {
    font-size: 23px;
    font-family: Microsoft YaHei;
    font-weight: bold;
    color: #FFFFFF;
    text-align: center;
    width: 118px;
}

.slideone {
    display: flex;
    flex-wrap: wrap;
    align-content: baseline;
}

.slideone>div:nth-child(5n) {
    margin-right: 0;
}

/* //公共样式 */
.floor_content {
    height: 50px;
    background: #E1E2E3;
    border-radius: 13px;
    display: flex;
    align-items: center;
    padding-left: 0 11px 0 11px;
    box-sizing: border-box;
    border-radius: 13px;
    overflow: hidden;
}

.floor_list {
    max-width: 278px;
    height: 36px;
    display: flex;

}

.floor_list>div:last-child {
    margin-right: 0;
}

.floor_list2 {
    /* max-width: 332px; */
    max-width: 346px;
    height: 36px;
    overflow-x: scroll;
    display: -webkit-box;
    white-space: nowrap;
    padding: 0 11px 0 11px;
    box-sizing: border-box;

}

.floor_list2>div:last-child {
    margin-right: 0;
}

.one_floor {
    display: inline-block;
    height: 36px;
    width: 49px;
    background-color: #83A9FF;
    border-radius: 6px;
    font-size: 23px;
    font-weight: bold;
    color: #FFFFFF;
    text-align: center;
    line-height: 36px;
    margin-right: 15px;

}

.nosel_floor {
    display: inline-block;
    height: 36px;
    width: 49px;
    background-color: #E1E2E3;
    font-size: 23px;
    font-weight: bold;
    color: #666666;
    text-align: center;
    line-height: 36px;
    margin-right: 22px;
}

.sel_type {
    width: 437px;
    height: 63px;
    display: flex;
}

.left_content_in {
    width: 220px;
    height: 75px;
    font-size: 23px;
    line-height: 68px;
    background-color: #83A9FF;
    color: #FFFFFF;
    border-radius: 17px;
    text-align: center;
    transform: perspective(45px)scale(1.0, 1.0) rotateX(-4deg);
    transform-origin: top left;
    box-shadow: 0 0px 6px 0px #83A9FF;
    font-weight: bold;
    position: relative;
    border: 3px solid #83A9FF;
    box-sizing: border-box;

}

.left_content_out {
    width: 220px;
    height: 75px;
    font-size: 23px;
    line-height: 68px;
    border: 3px solid #83A9FF;
    border-radius: 17px;
    transform: perspective(45px)scale(1.0, 1.0) rotateX(-4deg);
    transform-origin: top left;
    position: relative;
    color: #83A9FF;
    font-weight: bold;
    text-align: center;
    box-sizing: border-box;

}

.right_content_out {
    width: 220px;
    height: 75px;
    line-height: 75px;
    border: 3px solid #83A9FF;
    border-radius: 17px;
    transform: perspective(45px)scale(1.0, 1.0) rotateX(4deg);
    transform-origin: bottom RIGHT;
    color: #83A9FF;
    text-align: center;
    position: relative;
    font-size: 23px;
    font-weight: bold;
    margin-top: -8px;
    box-sizing: border-box;

}

.right_content_in {
    width: 220px;
    height: 75px;
    font-size: 23px;
    line-height: 75px;
    border: 3px solid #83A9FF;
    background-color: #83A9FF;
    border-radius: 17px;
    transform: perspective(45px)scale(1.0, 1.0) rotateX(4deg);
    transform-origin: bottom right;
    position: relative;
    font-weight: bold;
    color: #FFFFFF;
    box-shadow: 0 0px 6px 0px #83A9FF;
    text-align: center;
    margin-top: -8px;
    box-sizing: border-box;
}

.floor_content2 {
    background-color: #F1F2F6;
}

.more {
    width: 70px;
    height: 100%;
    display: flex;
    align-items: center;
    font-size: 19px;
    font-weight: bold;
    color: #FE6C5D;
    justify-content: flex-end;
}



.left_pre {
    height: 100%;
    width: 44px;
    position: relative;
}

.right_pre {
    height: 100%;
    width: 44px;
    position: relative;
}

.right_pre>span {
    display: block;
    width: 0px;
    height: 0px;
    border: 25px solid;
    border-left-color: #83A9FF;
    border-right-color: transparent;
    border-top-color: transparent;
    border-bottom-color: transparent;
    position: absolute;
    left: 11px;
    top: 50%;
    margin-top: -25px;
}

.left_pre>span {
    display: block;
    width: 0px;
    height: 0px;
    border: 25px solid;
    border-left-color: transparent;
    border-right-color: #C6C6C6;
    border-top-color: transparent;
    border-bottom-color: transparent;
    position: absolute;
    right: 11px;
    top: 50%;
    margin-top: -25px;
}

.left_center {
    width: calc(100% - 88px);
    height: 100%;
}

/* //公共样式 */


/* 公共样式 */
.dotscontent {
    display: flex;
    justify-content: space-between;
}

.dotscontent>div:last-child {
    margin-right: 0;
}

.one_dot {
    width: 13px;
    height: 13px;
    background-color: #FE6C5D;
    border-radius: 50%;
    margin-right: 13px;
}

.one_dot2 {
    width: 13px;
    height: 13px;
    border: 3px solid #FE6C5D;
    border-radius: 50%;
    margin-right: 13px;
    box-sizing: border-box;
}

/* 公共样式 */
.guide_task {
    width: 1165px;
    height: 69px;
    background: #83A9FF;
    border-radius: 6px 6px 38px 38px;
    margin-top: 0 auto;
    font-weight: bold;
    color: #FFFFFF;
    line-height: 69px;
    text-align: center;
}

.floorleft_per1 {
    width: 31px;
    height: 100%;
    background-color: #B5B5B5;
    display: flex;
    align-items: center;
    justify-content: center;
}

.floorleft_per2 {
    width: 31px;
    height: 100%;
    background-color: #FE6C5D;
    display: flex;
    align-items: center;
    justify-content: center;
}

.floorright_per1 {
    width: 31px;
    height: 100%;
    background-color: #B5B5B5;
    display: flex;
    align-items: center;
    justify-content: center;
}

.floorright_per2 {
    width: 31px;
    height: 100%;
    background-color: #FE6C5D;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
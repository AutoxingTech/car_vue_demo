
<script lang="ts">
import { defineComponent } from 'vue';
import { ActionType } from "@autoxing/robot-js-sdk-dev/index.js";
import { globalData } from "../../js/globalData"
import { audioMode } from "../../js/globalConfig"
export default defineComponent({
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            const instance: any = vm;
            if (from.matched[0].path == '/setting') {
                instance.setpallent()
            }
        });
    },
});
</script>
<script setup lang="ts">
import { ref, reactive, } from 'vue'
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { tables } from '../../js/Datacollation'
import store from '../../store';
import { taskUtil } from '../../js/taskUtil';
import settingUtil from "../../js/settingUtil"

const userstore: any = store()
const currentType = ref(1) //当前是餐桌还是包间

const tabMessage: any = reactive(tables)[0] //快捷送餐数据  
const floorlist1: any = tabMessage.floorlist //餐桌楼层
const floorlist2: any = tabMessage.floorlist2  //包间楼层
let curSwiper: any = null; //餐厅swiper的对象
let curSwiper2: any = null; //包间swiper的对象
const ficpallet: any = reactive([
    {
        sel: false,
        taskStatus: 0,
        table: null,
        show: true
    }, {
        sel: false,
        taskStatus: 0,
        table: null,
        show: true
    }, {
        sel: false,
        taskStatus: 0,
        table: null,
        show: true
    },
    {
        sel: false,
        taskStatus: 0,
        table: null,
        show: true
    }
])
const pallet: any = reactive([])
//设置左侧托盘展示
function setpallent() {
    ficpallet.forEach((item: any) => {
        item.show = true
    })
    pallet.splice(0, pallet.length)
    //根据设置托盘数进行展示
    for (let i in userstore.customSetting.delivery.pallet) {
        if (userstore.customSetting.delivery.pallet[i] == 0) {
            ficpallet[i].show = false
            if (ficpallet[i].table) {
                ficpallet[i].table.select = false
            }

        }
    }
    //去除等于show==fasle托盘
    for (let i in ficpallet) {
        if (ficpallet[i].show) {
            pallet.push(ficpallet[i])
        }
    }
    let hascheak = false
    for (let i in pallet) {
        if (pallet[i].sel == true) {
            hascheak = true
        }
    }
    if (!hascheak) {
        pallet[0].sel = true
    }
}
setpallent()
//将swiepr展示的楼层设为高亮
function computeFloor() {
    let ficlist = currentType.value == 1 ? floorlist1 : floorlist2
    let ficfloor = currentType.value == 1 ? tabMessage.boardlist[tabMessage.swipertab][0].floor : tabMessage.boardlist2[tabMessage.swipertab2][0].floor
    for (let i of ficlist) {
        if (i.name == ficfloor) {
            i.sel = true
        } else {
            i.sel = false
        }
    }
}
function showMorefloor() {
    currentType.value == 1 ? tabMessage.floorlist1scroll = true : tabMessage.floorlist2scroll = true
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
//获取餐厅swiper对象方法
function onSwiper(e: any) {
    curSwiper = e
}
//获取包间swiper对象方法
function onSwiper2(e: any) {
    curSwiper2 = e
}
//swiper上一页
function swiperPrev() {
    currentType.value == 1 ? curSwiper.slidePrev() : curSwiper2.slidePrev()
}
//swiper下一页
function swiperNext() {
    currentType.value == 1 ? curSwiper.slideNext() : curSwiper2.slideNext()
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

// 点击当前托盘
function revise(item: any) {
    for (let obj of pallet) {
        obj.sel = false
    }
    item.sel = true
}
//选择点位
function selectit(index: number, index2: number) {
    let boardlist = currentType.value == 1 ? tabMessage.boardlist : tabMessage.boardlist2
    let table = boardlist[index][index2]
    let selobj = null //选中的托盘  
    let unselobj = null  //预备托盘
    for (let obj of pallet) {
        if (obj.sel == true) {
            selobj = obj
        } else if (unselobj == null && obj.table == null) {
            unselobj = obj
        }
    }
    if (selobj.table) {
        delectcurrent(selobj)
    }
    selobj.table = table
    if (unselobj != null) {
        unselobj.sel = true
        selobj.sel = false
    }
    table.select = 1
}
//删除选中的点位
function delectcurrent(item: any) {
    let table = item.table
    item.table = null
    item.taskStatus = 0
    let tablein = false
    for (let obj of pallet) {
        if (obj.table == table) {
            tablein = true
        }
    }
    if (tablein == false) {
        table.select = 0
    }
}

//灯带数据
function lightcalculation(arr: any) {
    let palletfic: any = userstore.customSetting.delivery.pallet  //用于判断当前托盘层的灯带数量
    console.log("palletfic", palletfic)
    let lights = []
    for (let i of arr) {
        lights.push({
            "index": i,
            "num": palletfic[i]
        })
    }
    return lights;
}

//去任务
function goTask() {
    // console.log("检查可执行性");
    // if (taskUtil.goCheck() == false) {
    //     return;
    // }

    let list = []
    let palletmap: any = {} //站点与托盘的一对多关系
    for (let i = 0; i < pallet.length; i++) {
        let p = pallet[i]
        let obj = p.table
        if (obj) {
            let exist = false
            for (let ojb1 of list) {
                if (ojb1.id == obj.id) {
                    exist = true
                }
            }
            if (palletmap[obj.id + ""] == undefined) {
                palletmap[obj.id + ""] = [i]
            } else {
                palletmap[obj.id + ""].push(i)
            }
            if (exist == false) {
                list.push(obj)
            }
        }
    }

    let pts = [];
    for (let i = 0; i < list.length; i++) {
        let poi = list[i]
        pts.push({
            x: poi.coordinate[0],
            y: poi.coordinate[1],
            yaw: poi.yaw,
            ext: {
                name: poi.name,
                id: poi.id,
                idx: palletmap[poi.id + ""], //在哪几层托盘
                len: pallet.length //托盘总层数
            },
            stepActs: [
                {
                    type: 5,//本地音频
                    data: {
                        mode: audioMode,
                        audioId: "3111002",//您的餐到了
                        // url: "https://autoxingtest1.oss-cn-beijing.aliyuncs.com/mp3/autoxing/beijingtalk01.mp3", num: 1,
                        volume: 50,
                        interval: -1,
                        duration: -1
                    },
                },
                {
                    type: 37, //灯带控制
                    data: {
                        mode: 1,//"color":1, //颜色  1红色 3绿色 4蓝色 5黄色 
                        color: 1,
                        indexs: lightcalculation(palletmap[poi.id + ""]),
                    }
                },
                {
                    type: 40
                },
                {
                    type: 38,
                    data: {
                        mode: 1,
                        color: 4
                    }
                },
            ],
        });
    }

    if (pts.length > 0) {
        let standby = settingUtil.getStandbyStation()
        let backPt = {
            x: standby.coordinate[0],
            y: standby.coordinate[1],
            yaw: standby.yaw,
            ext: {
                name: "返航中",//standby.name,
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
                    type: 5,//
                    data: {
                        mode: audioMode,
                        audioId: "3111012",//"小舟要出发送餐了，请让一让"
                        num: 1,
                        volume: 50,
                        interval: -1,
                        duration: -1
                    },
                }
            ],
        }

        let task = {
            name: "快捷任务" + new Date().getTime(),
            runNum: 1,
            taskType: 2,
            runType: 20,
            curPt: curPt,
            pts: pts,
            backPt: backPt
        };
        console.log("发送任务", task);
        taskUtil.startTask(task).then((res: any) => {
            console.log(res);
        }).catch((e: any) => {
            console.log(e);
        })
    } else {
        console.log("未选择站点");
    }
}
defineExpose({ pallet, setpallent });
</script>

<template>
    <div class="content">
        <div class="index_left">
            <div class="index_left_top">
                <div></div>
                <div>托盘层</div>
                <div></div>
            </div>
            <!-- 托盘层 -->
            <div :class="index == 0 ? 'tray_layer' : 'tray_layer layer_top'" v-for="(item, index) in pallet"
                :key="index" @click="revise(item)">
                <div class="layer1">L{{ index + 1 }}</div>
                <div class="layer2" v-if="item.table">
                    <div class="font3" :style="item.sel ? 'font-size:18px;color:#FE6C5D' : ''">{{ item.table.name }}
                    </div>
                    <img src="../../assets/img/fastdeveryico1.png" @click.stop="delectcurrent(item)">
                </div>
                <div v-if="!item.table && item.sel" class="layer3 font3">(请选择点位)</div>
                <div v-if="!item.table && !item.sel" class="layer4 font3">点选点位</div>
                <div class="layer5"></div>
            </div>
        </div>
        <div class="index_right">
            <div class="index_right_top">
                <!-- 餐厅的楼层循环选择 begin-->
                <div class="floor_content" v-if="currentType == 1">
                    <div class="floor_list"
                        v-if="floorlist1.length <= 4 || (floorlist1.length > 4 && !tabMessage.floorlist1scroll)">
                        <div :class="item.sel ? 'one_floor' : 'nosel_floor'" @click="floorTap(item.name)"
                            v-for="(item, index) in floorlist1.slice(0, 4)" :key="index">{{ item.name }}</div>
                    </div>
                    <div class="floor_list2" v-if="floorlist1.length > 4 && tabMessage.floorlist1scroll">
                        <div :class="item.sel ? 'one_floor' : 'nosel_floor'" v-for="(item, index) in floorlist1"
                            @click="floorTap(item.name)" :key="index">{{ item.name }}</div>
                    </div>
                    <div class="more" v-if="floorlist1.length > 4 && !tabMessage.floorlist1scroll"
                        @click="showMorefloor()">更多</div>
                </div>
                <!-- 餐厅的楼层循环选择 end-->

                <!-- 包间的楼层循环选择 begin-->
                <div class="floor_content" v-if="currentType == 2">
                    <div class="floor_list"
                        v-if="floorlist2.length <= 4 || (floorlist2.length > 4 && !tabMessage.floorlist2scroll)">
                        <div :class="item.sel ? 'one_floor' : 'nosel_floor'" @click="floorTap(item.name)"
                            v-for="(item, index) in floorlist2.slice(0, 4)" :key="index">{{ item.name }}</div>
                    </div>
                    <div class="floor_list2" v-if="floorlist2.length > 4 && tabMessage.floorlist2scroll">
                        <div :class="item.sel ? 'one_floor' : 'nosel_floor'" v-for="(item, index) in floorlist2"
                            @click="floorTap(item.name)" :key="index">{{ item.name }}</div>
                    </div>
                    <div class="more" v-if="floorlist2.length > 4 && !tabMessage.floorlist2scroll"
                        @click="showMorefloor()">更多</div>
                </div>
                <!-- 包间的楼层循环选择 end-->
                <div class="sel_type">
                    <div @click="currentType = 1" :class="currentType == 1 ? 'left_content_in' : 'left_content_out'">
                        选餐桌
                    </div>
                    <div @click="currentType = 2" :class="currentType == 2 ? 'right_content_in' : 'right_content_out'">
                        选包间
                    </div>
                </div>
            </div>
            <!-- 餐厅点位循环 start -->
            <div class="index_right_center" v-if="currentType == 1">
                <div class="left_pre">
                    <span @click="swiperPrev()" class="swiper-button-prev"></span>
                </div>
                <div class="left_center">
                    <div class="swiper_content">
                        <swiper :initialSlide='tabMessage.swipertab' :slides-per-view="1" :space-between="50"
                            @swiper="onSwiper" @slideChange="onSlideChange">
                            <swiper-slide v-for="(item, index) in tabMessage.boardlist" :key="index" class="slideone">
                                <div v-for="(item2, index2) in item" :key="index2"
                                    :class="item2.select == 1 ? 'one_Point font1' : 'one_Point2 font1'"
                                    :style="!item2.name ? 'display:none' : ''" @click="selectit(index, index2)">
                                    {{ item2.name }}
                                </div>
                            </swiper-slide>
                        </swiper>

                    </div>
                    <div class="dots">
                        <div class="dotscontent">
                            <div v-for="(item, index) in tabMessage.boardlist"
                                :class="index == tabMessage.swipertab ? 'one_dot' : 'one_dot2'">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="right_pre">
                    <span @click="swiperNext()" class="swiper-button-next"></span>
                </div>
            </div>
            <!-- 餐厅点位循环 end -->




            <!-- 包间点位循环 start -->
            <div class="index_right_center" v-if="currentType == 2">
                <div class="left_pre">
                    <span @click="swiperPrev()" class="swiper-button-prev"></span>
                </div>
                <div class="left_center">
                    <div class="swiper_content">
                        <swiper :initialSlide='tabMessage.swipertab2' :slides-per-view="1" :space-between="50"
                            @swiper="onSwiper2" @slideChange="onSlideChange2">
                            <swiper-slide v-for="(item, index) in tabMessage.boardlist2" :key="index" class="slideone">
                                <div v-for="(item2, index2) in item" :key="index2"
                                    :class="item2.select == 1 ? 'one_Point font1' : 'one_Point2 font1'"
                                    :style="!item2.name ? 'display:none' : ''" @click="selectit(index, index2)">
                                    {{ item2.name }}
                                </div>
                            </swiper-slide>
                        </swiper>

                    </div>
                    <div class="dots">
                        <div class="dotscontent">
                            <div v-for="(item, index) in tabMessage.boardlist2"
                                :class="index == tabMessage.swipertab2 ? 'one_dot' : 'one_dot2'">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="right_pre">
                    <span @click="swiperNext()" class="swiper-button-next"></span>
                </div>
            </div>
            <!-- 包间点位循环 end -->
            <div class="index_right_bottom font1" @click="goTask">立即出发</div>
        </div>
    </div>
</template>

<style scoped>
page {
    background-color: #F1F2F6;
}

.content {
    display: flex;
}

.index_left {
    width: 238px;
    height: 604px;
    margin-left: 38px;
    box-sizing: border-box;
    box-shadow: #E3E4E8 0px 0px 17px 3px inset;
    border-radius: 13px;
}

.index_left_top {
    height: 58.5px;
    position: relative;
}

.index_left_top>div:nth-child(1) {
    height: 18px;
}

.index_left_top>div:nth-child(2) {
    margin-left: 23px;
    font-size: 23px;
    font-weight: bold;
    color: #333333;
}

.index_left_top>div:nth-child(3) {
    width: 53px;
    height: 3px;
    background: #83A9FF;
    border-radius: 1px;
    position: absolute;
    left: 23px;
    bottom: 0;
}

.tray_layer {
    height: 86.5px;
    width: 193px;
    position: relative;
    margin: 0 auto;
}

.layer1 {
    font-size: 23px;
    font-weight: bold;
    color: #333333;
    padding-top: 19px;
}

.layer2 {
    display: flex;
    height: 28px;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: bold;
    color: #333333;
    margin-top: 5px;

}

.layer2>img {
    width: 28px;
    height: 28px;
}

.layer3 {
    height: 28px;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: bold;
    color: #FE6C5D;
}

.layer4 {
    height: 28px;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: 400;
    color: #999999;
}

.layer5 {
    height: 3px;
    background: #333333;
    opacity: 0.3;
    border-radius: 1px;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
}

.layer_top {
    margin-top: 34.5px;
}

.index_right {
    width: 950px;
    height: 604px;
    margin-left: 18px;
    box-sizing: border-box;
    border-radius: 13px;
    box-shadow: #E3E4E8 0px 0px 17px 3px inset;
}

.index_right_top {
    height: 104.5px;
    width: 865px;
    margin: 0 auto;
    border-bottom: 3px solid #83A9FF;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
}

/* //公共样式 */
.floor_content {
    height: 50px;
    background: #E1E2E3;
    border-radius: 13px;
    display: flex;
    align-items: center;
    padding: 0 23px 0 16px;
}

.floor_list {
    /* width: 278px; */
    height: 36px;
    display: flex;

}

.floor_list>div:last-child {
    margin-right: 0;
}

.floor_list2 {
    max-width: 332px;
    height: 36px;
    overflow-x: scroll;
    display: -webkit-box;
    white-space: nowrap;
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
    margin-right: 22px;

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
    line-height: 75px;
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

}

.left_content_out {
    width: 220px;
    height: 75px;
    font-size: 23px;
    line-height: 75px;
    border: 3px solid #83A9FF;
    border-radius: 17px;
    transform: perspective(45px)scale(1.0, 1.0) rotateX(-4deg);
    transform-origin: top left;
    position: relative;
    color: #83A9FF;
    font-weight: bold;
    text-align: center;
    /* box-sizing: border-box; */

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

.swiper_content {
    height: 380px;
    padding-top: 5px;
    display: flex;
    flex-wrap: wrap;
}

.index_right_center {
    height: 407px;
    width: 100%;
    display: flex;
}

.index_right_bottom {
    height: 66px;
    width: 885px;
    background-color: #83A9FF;
    margin: 0 auto;
    border-radius: 8px;
    box-shadow: 1px 1px 15px #83A9FF;
    font-weight: bold;
    color: #FFFFFF;
    line-height: 66px;
    text-align: center;
}

.one_Point {
    height: 104.6px;
    width: 189px;
    background-color: #83A9FF;
    margin-right: 34px;
    margin-top: 19px;
    box-shadow: 0px 0px 4px #83A9FF;
    border-radius: 13px;
    text-align: center;
    line-height: 104.6px;
    font-weight: bold;
    color: #FFFFFF;
    box-sizing: border-box;
}

.one_Point2 {
    height: 104.6px;
    width: 189px;
    background-color: #E1E2E3;
    margin-right: 34px;
    margin-top: 19px;
    border-radius: 13px;
    text-align: center;
    line-height: 104.6px;
    font-weight: bold;
    color: #666666;
    box-sizing: border-box;
}

.slideone {
    display: flex;
    flex-wrap: wrap;
    align-content: baseline;
}

.slideone>div:nth-child(4n) {
    margin-right: 0;
}

.dots {
    height: calc(100% - 385px);
    display: flex;
    justify-content: center;
    align-items: center;
}

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
</style>

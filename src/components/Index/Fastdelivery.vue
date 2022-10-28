
<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { audioMode, ActionType } from "../../js/globalConfig"
import { toast } from '../Toast/Toast';
export default defineComponent({
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            const instance: any = vm;
            if (from.matched[0].path == '/setting') {  //从设置页返回后重新初始化左侧托盘
                instance.setpallent()
            }
            //通过修改任务返回的主页  删除已经完成的任务所在的托盘数据
            if (instance.userstore.isModify) {
                taskInfo.pallet.forEach((item: any, index: number) => {
                    if (item.status == 3) {
                        instance.delectcurrent(instance.pallet[index])
                    }
                });
            } else {
                //完成任务或者取消等返回首页 就清空选中内容
                if (from.fullPath == '/task') {
                    for (let i in instance.pallet) {
                        if (instance.pallet[i].table) {
                            instance.delectcurrent(instance.pallet[i])
                        }
                    }
                    for (let obj of instance.pallet) {
                        obj.sel = false
                    }
                    instance.pallet[0].sel = true
                }
            }
            //初始化楼层滚动条
            instance.initscroll()
        });
    },
});
</script>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { modedisplay, modelAudioMap, currentfloor } from '../../js/Datacollation'
import { updateMap } from '../../js/globalData';
import store from '../../store';
import { robotUtil, taskInfo } from '../../js/robotUtil';
import settingUtil from "../../js/settingUtil"
import { useI18n } from 'vue-i18n'
import { Rlog } from '../../js/Rlog'
let lightlist: any = []
const { t } = useI18n()
const userstore: any = store()
const currentType = ref(1) //当前是餐桌还是包间
const tabMessage: any = modedisplay[0]//快捷送餐数据  
let curSwiper: any = null; //餐厅swiper的对象
let curSwiper2: any = null; //包间swiper的对象
const max_left = ref(false)   //餐桌楼层是否还可以向左滑动
const max_right = ref(false)  //餐桌楼层是否还可以向右滑动
const max_left1 = ref(false)  //包间楼层是否还可以向左滑动
const max_right1 = ref(false) //包间楼层是否还可以向右滑动
const ficpallet: any = [
    {
        sel: false,
        taskStatus: 0,
        table: null
    }, {
        sel: false,
        taskStatus: 0,
        table: null
    }, {
        sel: false,
        taskStatus: 0,
        table: null
    },
    {
        sel: false,
        taskStatus: 0,
        table: null
    }
]
const pallet: any = reactive([])  //托盘响应式数据
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
//设置左侧托盘展示
function setpallent() {

    const LightsLong = 76  //灯带总长度为76
    const SingleLight = LightsLong / 23
    let palletfic: any = userstore.customSetting.delivery.pallet  //用于判断当前托盘层的灯带数量
    const sum = palletfic.reduce((pre: number, item: any) => {
        return pre + parseInt(item)
    }, 0)
    //防止默认设置 大于76后导致错误
    if (sum > LightsLong) {
        palletfic = [20, 20, 20, 0]
    }
    let lightStartCM = 0;
    let lightEndCM = 0
    let palletxx = [].concat(pallet)
    pallet.splice(0, pallet.length)
    lightlist = []
    for (let i = 0; i < palletfic.length; i++) {
        lightEndCM += lightStartCM + palletfic[i]
        lightStartCM = lightEndCM - palletfic[i]
        if (palletfic[i] > 0) {
            lightlist.push(parseInt((lightEndCM / SingleLight) + "") - parseInt((lightStartCM / SingleLight) + ""))
            pallet.push(ficpallet[lightlist.length - 1])
        }
    }
    if (palletxx.length != pallet.length) {
        for (let p of palletxx) {
            delectcurrent(p)
        }
        revise(pallet[0])
    }
}
setpallent()
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
    let lights = []
    for (let i of arr) {
        let idx = 0
        for (let j = 0; j < i; j++) {
            idx += parseInt(lightlist[j])
        }
        lights.push({
            "index": idx,
            "num": lightlist[i]
        })
    }
    return lights;
}
//背景声音数据
function volumeculation(poiId: any) {
    let audioObj = null
    let fastAudioMap = modelAudioMap[2 + ""]  //2==配送
    if (fastAudioMap[poiId + ""] != undefined) {
        audioObj = fastAudioMap[poiId + ""]
    }
    let Fobj: any = {
        mode: audioMode,
        audioId: settingUtil.audioIdset('3111002'),//您的餐到了
        num: 1,
        volume: userstore.customSetting.sound.switchon ? userstore.customSetting.sound.voiceVolume : 0,
        interval: -1,
        duration: -1,
    }
    if (audioObj) {
        Fobj.url = audioObj.fileUrl
        Fobj.interval = audioObj.ruleInterval
        // 1 按播报次数  2按照播报时间
        if (audioObj.ruleType == 1) {
            Fobj.num = audioObj.ruleCount
        } else if (audioObj.ruleType == 2) {
            Fobj.duration = audioObj.ruleDuration
        }
    }
    return Fobj
}
//去任务
function goTask() {
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
        pts.push(
            {
                x: poi.coordinate[0],
                y: poi.coordinate[1],
                yaw: poi.yaw,
                areaId: poi.areaId,
                dockingRadius: (poi.properties && poi.properties.dockingRadius) ? poi.properties.dockingRadius : 0.5,
                ext: {
                    name: poi.name,
                    id: poi.id,
                    idx: palletmap[poi.id + ""],
                    len: pallet.length
                },
                stepActs: [
                    {
                        type: ActionType.PlayAudio,//本地音频
                        data: volumeculation(poi.id)
                    },
                    // {
                    //     type: ActionType.Pause,   //到达停留时间
                    //     data: {
                    //         pauseTime: 14
                    //     }
                    // },
                    // {
                    //     type: ActionType.PlayAudio,//本地音频
                    //     data: {
                    //         mode: audioMode,
                    //         audioId: settingUtil.audioIdset('3111004'),//请关闭箱门后点击立即取餐
                    //         num: 999,
                    //         volume: userstore.customSetting.sound.switchon ? userstore.customSetting.sound.voiceVolume : 0,
                    //         interval: -1,
                    //         duration: -1
                    //     }
                    // },
                    {
                        type: ActionType.OpenLight, //灯带控制
                        data: {
                            mode: 1,//"color":1, //颜色  1红色 3绿色 4蓝色 5黄色 
                            color: 1,
                            indexs: lightcalculation(palletmap[poi.id + ""]),
                        }
                    },
                    //等待交互
                    {
                        type: ActionType.InterAction
                    },
                    {
                        type: ActionType.StopAudio,
                        data: {
                            mode: audioMode
                        }
                    },
                    {
                        type: ActionType.PlayAudio,//本地音频
                        data: {
                            mode: audioMode,
                            audioId: settingUtil.audioIdset('3111007'),//客官请慢慢享用您的美食，我要继续工作了
                            num: 1,
                            volume: userstore.customSetting.sound.switchon ? userstore.customSetting.sound.voiceVolume : 0,
                            interval: -1,
                            duration: -1
                        }
                    },
                    //关闭灯带
                    {
                        type: ActionType.CloseLight,
                        data: {
                            mode: audioMode,
                            color: 4
                        }
                    },
                ],
            });
    }

    if (pts.length > 0) {
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
                id: standby.id
            },
            stepActs: [],
        }

        let curPt = {
            ext: {
                name: "起点",//起点要做的事件
            },
            stepActs: [
                {
                    type: ActionType.PlayAudio,//本地音频
                    data: {
                        mode: audioMode,
                        audioId: settingUtil.audioIdset('3111012'),//"小舟要出发送餐了，请让一让"
                        num: 1,
                        volume: userstore.customSetting.sound.switchon ? userstore.customSetting.sound.voiceVolume : 0,
                        interval: -1,
                        duration: -1,
                        channel: 1
                    },
                },
                {
                    type: ActionType.SetSpeed,  //设置速度
                    data: {
                        speed: userstore.customSetting.delivery.runSpeed / 100
                    }
                },
            ],
        }

        let task = {
            name: "快捷任务" + new Date().getTime(),
            runNum: 1,
            taskType: 2,
            routeMode: 2,
            runType: 20,
            curPt: curPt,
            pts: pts,
            backPt: backPt
        };
        robotUtil.startTask(task)
        Rlog(task, "发送task数据")
    } else {
        toast.show(t('index.wxzzd'))
    }
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
// 状态是否更新地图监听  //更新后清空选择的托盘
watch(() => updateMap.value, (newvalue: any, oldvalue: any) => {
    for (let n of pallet) {
        delectcurrent(n)
    }
})
//当前楼层是否发生变化
watch(() => currentfloor.value, (newvalue: any, oldvalue: any) => {
    floorTap(newvalue) //切换为当前楼层的swiper
})
defineExpose({ pallet, setpallent, delectcurrent, userstore, revise, initscroll });
</script>

<template>
    <div class="content">
        <div class="index_left">
            <div class="index_left_top">
                <div></div>
                <div>{{ $t('index.tpc') }}</div>
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
                <div v-if="!item.table && item.sel" class="layer3 font3">({{ $t('index.qxzdw') }})</div>
                <div v-if="!item.table && !item.sel" class="layer4 font3">{{ $t('index.dxdw') }}</div>
                <div class="layer5"></div>
            </div>
        </div>
        <div class="index_right" id="floorid">
            <div class="index_right_top">
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
                    <div :class="max_right ? 'floorright_per1' : 'floorright_per2'"
                        v-if="tabMessage.floorlist.length > 5" @click="floor1contscroll(2)">
                        <img src="../../assets/img/floorr.png" style="width:13px;height: 21px;">
                    </div>
                </div>
                <!-- 餐厅的楼层循环选择 end-->

                <!-- 包间的楼层循环选择 begin-->
                <div :class="tabMessage.floorlist2.length > 0 ? 'floor_content' : 'floor_content2'"
                    v-show="currentType == 2">
                    <div :class="max_left1 ? 'floorleft_per1' : 'floorleft_per2'"
                        v-if="tabMessage.floorlist2.length > 5" @click="floor2contscroll(1)">
                        <img src="../../assets/img/floorl.png" style="width:13px;height: 21px;">
                    </div>
                    <div class="floor_list2" id="scroll2">
                        <div :id="'id' + index" :class="item.sel ? 'one_floor' : 'nosel_floor'"
                            v-for="(item, index) in tabMessage.floorlist2" @click="floorTap(item.name)" :key="index">{{
                                    item.name
                            }}</div>
                    </div>
                    <div :class="max_right1 ? 'floorright_per1' : 'floorright_per2'"
                        v-if="tabMessage.floorlist2.length > 5" @click="floor2contscroll(2)">
                        <img src="../../assets/img/floorr.png" style="width:13px;height: 21px;">
                    </div>
                </div>
                <!-- 包间的楼层循环选择 end-->
                <div class="sel_type">
                    <div @click="currentType = 1" :class="currentType == 1 ? 'left_content_in' : 'left_content_out'">
                        {{ $t('index.xcz') }}
                    </div>
                    <div @click="currentType = 2" :class="currentType == 2 ? 'right_content_in' : 'right_content_out'">
                        {{ $t('index.xbj') }}
                    </div>
                </div>
            </div>
            <!-- 餐厅点位循环 start -->
            <div class="index_right_center">
                <div class="left_pre">
                    <span @click="swiperPrev" v-if="currentType == 1 && tabMessage.floorlist.length > 0"
                        :style="tabMessage.swipertab == 0 ? 'border-right-color: #C6C6C6 !important;' : 'border-right-color: #83A9FF !important;'"
                        class="swiper-button-prev"></span>

                    <span @click="swiperPrev" v-if="currentType == 2 && tabMessage.floorlist2.length > 0"
                        :style="tabMessage.swipertab2 == 0 ? 'border-right-color: #C6C6C6 !important;' : 'border-right-color: #83A9FF !important;'"
                        class="swiper-button-prev"></span>
                </div>

                <!-- 餐桌点位选择 start-->
                <div class="left_center" v-if="currentType == 1">
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
                <!-- 餐桌选择 end-->

                <!-- 包间点位选择 start-->
                <div class="left_center" v-if="currentType == 2">
                    <div class="swiper_content">
                        <swiper style="width: 100%;height: 100%;" :initialSlide='tabMessage.swipertab2'
                            :slides-per-view="1" :space-between="50" @swiper="onSwiper2" @slideChange="onSlideChange2">
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
                    <span @click="swiperNext" v-if="currentType == 1 && tabMessage.floorlist.length > 0"
                        :style="tabMessage.swipertab == tabMessage.boardlist.length - 1 ? 'border-left-color: #C6C6C6 !important;' : 'border-left-color: #83A9FF !important;'"
                        class="swiper-button-next"></span>

                    <span @click="swiperNext" v-if="currentType == 2 && tabMessage.floorlist2.length > 0"
                        :style="tabMessage.swipertab2 == tabMessage.boardlist2.length - 1 ? 'border-left-color: #C6C6C6 !important;' : 'border-left-color: #83A9FF !important;'"
                        class="swiper-button-next"></span>
                </div>
            </div>


            <div class="index_right_bottom font1" @click="goTask">
                <span v-if="userstore.isModify">{{ $t('index.xgrw') }}</span>
                <span v-else>{{ $t('index.ljcf') }}</span>
            </div>
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
    padding-left: 0 11px 0 11px;
    box-sizing: border-box;
    border-radius: 13px;
    overflow: hidden;
}

.floor_content2 {
    background-color: #F1F2F6;
}

.floor_list {
    max-width: 278px;
    height: 36px;
    display: flex;
    overflow-x: scroll;
    display: -webkit-box;
    white-space: nowrap;

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
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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


/* 公共样式 */
</style>

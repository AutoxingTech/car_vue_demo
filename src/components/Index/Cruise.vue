<script lang="ts" setup>
import { ref, reactive } from 'vue';
const showChoicemaptank = ref(false) //选择巡游地图的弹框
const showChoicenumtank = ref(false)
const currentmapId: any = ref(0) //巡游地图id
const ficcuriseType: any = ref(0) //循环类型（虚拟判断ui）
const curiseType: any = ref(0) //循环类型
const curiseNum: any = ref(0) //循环次数
const curiseMaps: any = reactive([
    {
        name: '巡游1',
        sel: true,
        sites: [
            {
                'poiName': '大门口'
            },
            {
                'poiName': '1层货柜'
            },
            {
                'poiName': '2层货柜'
            },
            {
                'poiName': '保安室'
            },
            {
                'poiName': '3号实验室'
            },
            {
                'poiName': '2号实验室'
            },
            {
                'poiName': '1层食堂'
            },
            {
                'poiName': '接待室'
            },
            {
                'poiName': '接待室'
            }
        ]
    },
    {
        name: '巡游2',
        sel: false,

    },
    {
        name: '巡游3',
        sel: false
    },
    {
        name: '巡游4',
        sel: false
    },
    {
        name: '巡游5',
        sel: false
    }
])

const circulatequene: any = reactive([])
for (let i = 1; i <= 12; i++) { //初始化巡游站点位置
    // console.log("-------", i, j)
    // let j = 12.0 / i
    // for (let k = 0; k < i; k++) {
    // console.log((k * j + 1).toFixed(0))
    // }
    let left, tag, top
    if (i <= 4) {
        if (i == 1) {
            left = 285
            tag = i % 2,
                top = 32
        } else {
            left = 285 + 175 * (i - 1)
            tag = i % 2,
                top = 32
        }

    } else if (i == 5 || i == 6) {
        left = 888.5
        tag = 2
        top = 212 - (6 - i) * 80
    } else if (i == 11 || i == 12) {
        left = 30
        tag = 3
        top = 212 - (12 - i) * 80
    } else {
        if (i != 10) {
            left = 285 + 175 * (10 - i)
            tag = (i + 1) % 2,
                top = 260
        } else {
            left = 159
            tag = (i + 1) % 2,
                top = 260
        }
    }
    circulatequene.push({
        tag: tag,
        left: left,
        top: top
    })
}

function curMmap() {
    if (currentmapId.value >= curiseMaps.length) {
        currentmapId.value = 0
    }
    let sites = curiseMaps[currentmapId.value].sites

    let i = sites.length
    let j = 12.0 / i
    let poses = []
    for (let f = 0; f < 12; f++) {
        circulatequene[f].table = null
    }
    for (let k = 0; k < i; k++) {
        let pos = (k * j).toFixed(0)
        circulatequene[pos].table = sites[k]
    }
    console.log(circulatequene, "列表")
}
curMmap()


//点击当前地图
function choice_map(index: any) {
    for (let i of curiseMaps) {
        i.sel = false
    }
    curiseMaps[index].sel = true
}
//确认选择本张地图
function sel_map() {
    for (let i in curiseMaps) {
        if (curiseMaps[i].sel) {
            currentmapId.value = i
        }
    }
    tank_control()
}
//取消切换巡游地图
function tank_control() {
    for (let i of curiseMaps) {
        i.sel = false
    }
    curiseMaps[currentmapId.value].sel = true
    showChoicemaptank.value = !showChoicemaptank.value
}
//选择巡游类型
function tank_control2() {
    ficcuriseType.value = curiseType.value
    showChoicenumtank.value = !showChoicenumtank.value
}
//去定选择巡游类型
function sel_num() {
    curiseType.value = ficcuriseType.value
    showChoicenumtank.value = !showChoicenumtank.value
}



//数量减
function numDown() {
    if (curiseNum.value != 0) {
        curiseNum.value -= 1
    }
}
//数量加
function numUp() {
    curiseNum.value += 1
}
</script>

<template>
    <div class="curise_cont">
        <div class="cursie_top">
            <div>
                <div class="mapfont">巡游地图</div>
                <div class="emptyline"></div>
            </div>
            <div class="curise_maplist" @click="tank_control">
                <div>{{curiseMaps[currentmapId].name}}</div>
                <div>切换</div>
            </div>
        </div>

        <div class="map_content">
            <!-- 926 346 -->
            <view style="width: 1126px;height: 384px;background-color: #C4D6FF;border-radius: 13px;">
                <view class="portrait horizontal"
                    style="position: absolute;margin: 74px 0 0 41px;width: 1046px;height: 225px;border: 3px dashed #FFFFFF;border-radius: 31px;">
                </view>
                <!-- 61 0 0 54 816 210 -->
                <div v-for="(item,index) in circulatequene">
                    <view v-if="item.tag<2&&item.table" class="portrait horizontal"
                        :style="'position: absolute;width: 175px;margin: '+item.top+'px 0 0 '+item.left+'px;'">
                        <view
                            style="font-size: 16px;color: #333333;;margin-bottom: 16px;line-height: 16px;height: 16px;">
                            {{item.tag==0?item.table.poiName:' '}}
                        </view>
                        <view style="width: 23px;height: 23px;background-color: #83A9FF;border-radius: 50%;"></view>
                        <view style="font-size: 16px;color: #333333;;margin-top:16px;line-height: 16px;height: 16px;">
                            {{item.tag==1?item.table.poiName:' '}}
                        </view>
                    </view>
                    <view v-else-if="item.tag==2&&item.table" class="landscape reverser horizontal"
                        :style="'position: absolute;margin: '+item.top+'px 0 0 '+item.left+'px;'">
                        <view style="width: 23px;height: 23px;background-color: #83A9FF;border-radius: 50%;"></view>
                        <view
                            style="font-size: 16px;color: #333333;;margin-right: 12px;width: 180px;text-align: right;">
                            {{item.table.poiName}}
                        </view>
                    </view>
                    <view v-else-if="item.tag==3&&item.table" class="landscape  horizontal"
                        :style="'position: absolute;margin: '+item.top+'px 0 0 '+item.left+'px;'">
                        <view style="width: 23px;height: 23px;background-color: #83A9FF;border-radius: 50%;"></view>
                        <view style="font-size: 16px;color: #333333;;margin-left: 12px;width: 180px;">
                            {{item.table.poiName}}
                        </view>
                    </view>
                </div>

                <img style="position: absolute;width: 41px;height: 50px;margin: 48px 0 0 316px;"
                    src="../../assets/img/xun0.png" />
                <img style="position: absolute;width: 34px;height: 34px;margin: 58px 0 0 494px;"
                    src="../../assets/img/xun1.png" />
                <img style="position: absolute;width: 34px;height: 34px;margin: 88px 0 0 1075px"
                    src="../../assets/img/xun2.png" />
                <img style="position: absolute;width: 34px;height: 34px;margin: 288px 0 0 744px;transform: rotate(180deg)"
                    src="../../assets/img/xun1.png" />
                <img style="position: absolute;width: 34px;height: 34px;margin: 246px 0 0 25px;"
                    src="../../assets/img/xun4.png" />
            </view>
        </div>

        <div class="curise_bottom">
            <div class="curise_enter1" @click="tank_control2">
                <div>
                    <span v-if="curiseType==0">循环巡游</span>
                    <span v-if="curiseType==1">按次巡游</span>
                </div>
                <img src="../../assets/img/curisedown.png">
            </div>
            <div class="curise_enter2 font1">立即出发</div>
        </div>

        <!-- //选择巡游图 -->
        <div class="cruise_tank" v-if="showChoicemaptank">
            <div class="curise_mapchoice">
                <div class="mapchoice_top font6">巡游路线选择</div>
                <div :class="curiseMaps.length>4?'mp_content2':'mp_content'">
                    <div v-for="(item,index) in curiseMaps" :key="index" @click="choice_map(index)">
                        <div class="font6">{{item.name}}</div>
                        <div class="curimg">
                            <img v-if="item.sel" src="../../assets/img/language1.png" alt="">
                            <img v-else src="../../assets/img/selout.png" alt="">
                        </div>
                    </div>
                </div>
                <div class="bottbutton">
                    <div @click="tank_control">取消</div>
                    <div @click="sel_map">确定</div>
                </div>
            </div>
        </div>
        <!-- //选择次数 -->
        <div class="cruise_tank" v-if="showChoicenumtank">
            <div class="curise_mapchoice">
                <div class="mapchoice_top font6">巡游路线选择</div>
                <div class="xunhuan1" @click="ficcuriseType=0">
                    <div class="font6">
                        循环巡游
                    </div>
                    <div class="curimg">
                        <img v-if="ficcuriseType==0" src="../../assets/img/language1.png" alt="">
                        <img v-else src="../../assets/img/selout.png" alt="">
                    </div>
                </div>
                <div class="number_xun" @click="ficcuriseType=1">
                    <div class="xunhuan1">
                        <div class="font6">
                            按次巡游
                        </div>
                        <div class="curimg">
                            <img v-if="ficcuriseType==1" src="../../assets/img/language1.png" alt="">
                            <img v-else src="../../assets/img/selout.png" alt="">
                        </div>
                    </div>
                    <div class="set_num">
                        <div class="font6">设置巡游次数</div>
                        <div>
                            <div class="jian" @click="numDown">-</div>
                            <div class="putnum">
                                <input type="number" v-model="curiseNum">
                            </div>
                            <div class="jia" @click="numUp">+</div>
                        </div>
                    </div>
                </div>
                <div class="bottbutton font7">
                    <div @click="tank_control2">取消</div>
                    <div @click="sel_num">确定</div>
                </div>
            </div>
        </div>
    </div>
</template>



<style scoped>
.curise_cont {
    width: 1205px;
    height: 604px;
    border-radius: 13px;
    box-shadow: #E3E4E8 0px 0px 17px 3px inset;
    margin: 0 auto;
}

.cursie_top {
    height: 100px;
    width: 1145px;
    margin: 0 auto;
    position: relative;
    padding-top: 30px;
    box-sizing: border-box;

}

.curise_maplist {
    position: absolute;
    height: 66px;
    width: 344px;
    right: 0;
    top: 50%;
    margin-top: -33px;
    border: 3px solid #83A9FF;
    border-radius: 13px;
    box-sizing: border-box;
    padding: 0 22px 0 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.curise_maplist>div:nth-child(1) {
    font-size: 19px;
    font-weight: bold;
    color: #83A9FF;
}

.curise_maplist>div:nth-child(2) {
    font-size: 19px;
    font-weight: bold;
    color: #FE6C5D;
}

.mapfont {
    font-size: 23px;
    font-weight: bold;
    color: #333333;
}

.emptyline {
    width: 52px;
    height: 4px;
    background: #83A9FF;
    border-radius: 1px;
    margin-top: 4px;
}

.map_content {
    width: 1145px;
    height: 401px;
    background: #83A9FF;
    border-radius: 13px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
}

.map_center {
    width: 1121px;
    height: 384px;
    background-color: #C4D6FF;
    border: 5px solid #F1F2F6;
    border-radius: 13px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

}

.curise_li {
    width: 1046px;
    height: 223px;
    border: 4px #FFFFFF dashed;
    border-radius: 30px;
    position: absolute;

}

.curise_bottom {
    width: 1145px;
    height: 66px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    margin-top: 25px;
}

.curise_enter1 {
    height: 66px;
    width: 344px;
    border: 3px solid #83A9FF;
    border-radius: 13px;
    box-sizing: border-box;
    padding: 0 16px 0 30px;
    font-size: 16px;
    font-weight: bold;
    color: #83A9FF;
    line-height: 66px;
    display: flex;
    justify-content: space-between;
    align-items: center;

}

.curise_enter1>img {
    width: 38px;
    height: 38px;

}

.curise_enter2 {
    height: 66px;
    width: 766px;
    background: #83A9FF;
    border-radius: 13px;
    text-align: center;
    line-height: 66px;
    font-weight: bold;
    color: #FFFFFF;

}

.cruise_tank {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9;
    display: flex;
    align-items: center;
    justify-content: center;

}

.curise_mapchoice {
    width: 553px;
    background-color: #F3F3F3;
    border-radius: 25px;

}

.mapchoice_top {
    height: 63px;
    width: 100%;
    font-size: 23px;
    font-weight: bold;
    color: #333333;
    line-height: 63px;
    text-align: center;
}

.mp_content {
    width: 520px;
    background: #FFFFFF;
    border-radius: 25px;
    display: flex;
    flex-direction: column;
    margin: 0 auto;
}

.mp_content>div {
    height: 74px;
    width: 451px;
    border-bottom: 1px solid #efefef;
    box-sizing: border-box;
    margin: 0 auto;
    text-align: center;
    line-height: 74px;
    font-size: 23px;
    font-weight: 400;
    color: #666666;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.mp_content>div:last-child {
    border-bottom: none;
}


.mp_content2 {
    width: 520px;
    background: #FFFFFF;
    border-radius: 25px;
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    max-height: 318px;
    overflow-y: scroll;
}

.mp_content2>div {
    height: 74px;
    width: 451px;
    border-bottom: 1px solid #efefef;
    box-sizing: border-box;
    margin: 0 auto;
    text-align: center;
    line-height: 74px;
    font-size: 23px;
    font-weight: 400;
    color: #666666;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.mp_content2>div:last-child {
    border-bottom: none;
}


.curimg {
    width: 29px;
    height: 29px;
    display: flex;
    align-items: center;
}

.curimg>img {
    width: 100%;
    height: 100%;
}

.bottbutton {
    width: 400px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 auto;
    margin-top: 27px;
    margin-bottom: 21px;
}

.bottbutton>div:nth-child(1) {
    width: 173px;
    height: 50px;
    line-height: 50px;
    font-weight: bold;
    color: #333333;
    text-align: center;
    background: #E5E5E5;
    border-radius: 6px;
}

.bottbutton>div:nth-child(2) {
    width: 173px;
    height: 50px;
    line-height: 50px;
    font-weight: bold;
    color: white;
    text-align: center;
    background: #608FFA;
    border-radius: 6px;
}

.xunhuan1 {
    font-size: 23px;
    font-family: Microsoft YaHei;
    font-weight: 400;
    color: #666666;
    display: flex;
    padding: 34px;
    box-sizing: border-box;
    background: #FFFFFF;
    border-radius: 25px;
    align-items: center;
    justify-content: space-between;
    width: 519px;
    margin: 0 auto;
}

.number_xun {
    width: 519px;

    background: #FFFFFF;
    border-radius: 25px;
    margin: 0 auto;
    margin-top: 14px;

}

.set_num {
    height: 78px;
    background-color: #ffffff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 34px;
    box-sizing: border-box;
    border-radius: 24px;

}

.set_num>div:nth-child(1) {
    font-size: 23px;
    font-weight: 400;
    color: #666666;
}

.set_num>div:nth-child(2) {
    display: flex;
    align-items: center;
    height: 65px;
    width: 246px;
    background: #F1F1F1;
    border-radius: 6px;
}

.putnum {
    width: 94px;
    height: 50px;
    background: #CFCFCF;
    border-radius: 6px;
}

.putnum>input {
    border: none;
    outline: none;
    width: 100%;
    height: 100%;
    background: #CFCFCF;
    font-size: 38px;
    font-weight: bold;
    color: #666666;
    text-align: center;
}

.jian {
    width: 76px;
    display: flex;
    align-content: center;
    justify-content: center;
}

.jia {
    width: 76px;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
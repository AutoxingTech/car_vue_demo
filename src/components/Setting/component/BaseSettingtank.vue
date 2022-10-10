<script lang="ts" setup>
import { reactive, ref } from 'vue';
import store from '../../../store';
import { useI18n } from 'vue-i18n'
const useStore: any = store()

const props = defineProps<{
    controlType: number,  //显示的是那个弹框 1字号大小选择
    fontSizetype: number,  //字号
    patternList: any,  //模式列表
    Defaultdisplay: any //默认显示tab下标
    guideplaytype: number,//引领默认显示
    StandbyPointList: any, //待命点列表
    Defaultstandby: any, //默认待命点
    ChargingPileList: any, //充电站列表
    Defaultcharplie: any //默认充电桩
}>()
const emits = defineEmits(['TankControl', 'change-font', 'change-tab', 'change-guide', 'change-stand', 'change-char'])
//字号列表
const fontSize = reactive([
    {
        name: 'setting.xhzt',
        sizetype: 0
    },
    {
        name: 'setting.zhzt',
        sizetype: 1
    },
    {
        name: 'setting.dhzt',
        sizetype: 2
    }
])

//引领列表
const guideList = reactive([
    {
        name: '图片',
        id: 0
    },
    {
        name: '视频',
        id: 1
    },
    {
        name: '表情',
        id: 2
    }
])
const StandbyPointList: any = reactive(props.StandbyPointList)
const Defaultstandby = ref(props.Defaultstandby)

const ChargingPileList: any = reactive(props.ChargingPileList)
const Defaultcharplie = ref(props.Defaultcharplie)

const fontSizetype = ref(props.fontSizetype)
const Defaultdisplay = ref(props.Defaultdisplay)
const guideplaytype = ref(props.guideplaytype)
const Changefont = (e: number) => {
    fontSizetype.value = e
}
const Changedefauttab = (item: any, e: number) => {
    if (item.sel) {
        Defaultdisplay.value = e
        useStore.$patch((state: any) => {
            state.customSetting.basic.currenttab = e
        })
    }
}
const Changeguideplay = (e: number) => {
    guideplaytype.value = e
}
//取消字体选择
const LastCancle_font = () => {
    const index = props.fontSizetype
    fontSizetype.value = index
    emits('TankControl', 0)
}
//确定更改字体大小
const LastChange_font = () => {
    emits('change-font', fontSizetype.value)
}
//取消更改默认展示的tab
const LastCancle_tab = () => {
    const index = props.Defaultdisplay
    Defaultdisplay.value = index
    useStore.$patch((state: any) => {
        state.customSetting.basic.currenttab = index
    })
    emits('TankControl', 0)
}
//确定更改默认显示tab
const LastChange_tab = () => {
    emits('change-tab', Defaultdisplay.value)
}


//取消引领默认显示
const LastCancle_guide = () => {
    const index = props.guideplaytype
    guideplaytype.value = index
    emits('TankControl', 0)
}
//确定更改引领默认显示
const LastChange_guide = () => {
    emits('change-guide', guideplaytype.value)
}


//点击待命点
const Changestandby = (item: any, index: any) => {
    Defaultstandby.value = item.id
}
//取消选择待命点
const LastCancle_stand = () => {
    const index = props.Defaultstandby
    Defaultstandby.value = index
    emits('TankControl', 0)
}

//确定选择待命点
const LastChange_stand = () => {
    emits('change-stand', Defaultstandby.value)
}

//点击充电桩
const Changechar = (item: any, index: any) => {
    Defaultcharplie.value = item.id
}

//取消选择待命点
const LastCancle_char = () => {
    const index = props.Defaultcharplie
    Defaultcharplie.value = index
    emits('TankControl', 0)
}
//确定选择待命点
const LastChange_char = () => {
    emits('change-char', Defaultcharplie.value)
}

</script>

<template>

    <div class="base_mask" v-if="controlType!=0">
        <!-- 字体选择 -->
        <div class="guide_contnet" v-if="controlType==1">
            <div class="guide_tip_top font6">{{$t('setting.ztsz')}}</div>
            <div class="one_all">
                <div class="guide_tipone font6" v-for="(item,index) in fontSize" :key="index"
                    @click="Changefont(item.sizetype)">
                    <div class="font6">
                        {{$t(item.name)}}
                    </div>
                    <div class="">
                        <img v-if="fontSizetype==item.sizetype" src="../../../assets/img/language1.png" alt="">
                        <img v-else src="../../../assets/img/selout.png" alt="">
                    </div>
                </div>
            </div>
            <div class="base_tip_meth font7">
                <div @click="LastCancle_font">{{$t('index.qx')}}</div>
                <div @click="LastChange_font">{{$t('index.qd')}}</div>
            </div>

        </div>
        <!-- 主页模式选择 -->
        <div class="guide_contnet" v-if="controlType==2">
            <div class="guide_tip_top font6">{{$t('setting.zymssz')}}</div>
            <div class="one_all">
                <div class="guide_tipone" v-for="(item,index) in patternList" :key="index"
                    @click="Changedefauttab(item,index)">
                    <div :class="item.sel?'font6':'grayfont font6'">
                        {{$t(item.name)}}
                    </div>
                    <div class="">
                        <img v-if="index==useStore.customSetting.basic.currenttab"
                            src="../../../assets/img/language1.png" alt="">
                        <img v-else src="../../../assets/img/selout.png" alt="">
                    </div>
                </div>
            </div>
            <div class="base_tip_meth font7">
                <div @click="LastCancle_tab">{{$t('index.qx')}}</div>
                <div @click="LastChange_tab()">{{$t('index.qd')}}</div>
            </div>

        </div>

        <!-- 待命点选择选择 -->
        <div class="guide_contnet" v-if="controlType==3">
            <div class="guide_tip_top font6">{{$t('setting.dmdxz')}}</div>
            <div class="one_all">
                <div :class="StandbyPointList.length>4?'scrolstyl':''">
                    <div class="guide_tipone" v-for="(item,index) in StandbyPointList" :key="index"
                        @click="Changestandby(item,index)">
                        <div class="font6">
                            {{item.name}}
                        </div>
                        <div class="">
                            <img v-if="item.id==Defaultstandby" src="../../../assets/img/language1.png" alt="">
                            <img v-else src="../../../assets/img/selout.png" alt="">
                        </div>
                    </div>
                </div>
            </div>
            <div class="base_tip_meth font7">
                <div @click="LastCancle_stand">{{$t('index.qx')}}</div>
                <div @click="LastChange_stand()">{{$t('index.qd')}}</div>
            </div>
        </div>

        <!-- 引领默认播放内容 -->
        <div class="guide_contnet" v-if="controlType==4">
            <div class="one_all">
                <div class="guide_tip_top font6">{{$t('setting.ylnr')}}</div>
                <div class="guide_tipone" v-for="(item,index) in guideList" :key="index"
                    @click="Changeguideplay(item.id)">
                    <div class="font6">
                        {{item.name}}
                    </div>
                    <div class="">
                        <img v-if="item.id==guideplaytype" src="../../../assets/img/language1.png" alt="">
                        <img v-else src="../../../assets/img/selout.png" alt="">
                    </div>
                </div>
            </div>

            <div class="base_tip_meth font7">
                <div @click="LastCancle_guide">{{$t('index.qx')}}</div>
                <div @click="LastChange_guide">{{$t('index.qd')}}</div>
            </div>

        </div>


        <!-- 充电桩选择选择 -->
        <div class="guide_contnet" v-if="controlType==5">
            <div class="guide_tip_top font6">{{$t('setting.cdzxz')}}</div>
            <div class='one_all'>
                <div :class="ChargingPileList.length>4?'scrolstyl':''">
                    <div class="guide_tipone" v-for="(item,index) in ChargingPileList" :key="index"
                        @click="Changechar(item,index)">
                        <div class="font6">
                            {{item.name}}
                        </div>
                        <div class="">
                            <img v-if="item.id==Defaultcharplie" src="../../../assets/img/language1.png" alt="">
                            <img v-else src="../../../assets/img/selout.png" alt="">
                        </div>
                    </div>
                </div>
            </div>
            <div class="base_tip_meth font7">
                <div @click="LastCancle_char">{{$t('index.qx')}}</div>
                <div @click="LastChange_char">{{$t('index.qd')}}</div>
            </div>
        </div>


    </div>

</template>

<style scoped>
.base_mask {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    z-index: 6;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
}

.guide_tip_top {
    height: 54px;
    line-height: 54px;
    font-size: 16px;
    font-weight: bold;
    color: #333333;
    width: 100%;
    text-align: center;
}

.guide_contnet {
    width: 535px;
    /* height: 322px; */
    background-color: #F3F3F3;
    border-radius: 13px;
    padding-bottom: 20px;
}

.one_all {
    width: 485px;
    border-radius: 15px;
    margin: 0 auto;
    max-height: 245px;
    overflow: hidden;
    background-color: white;
}

.one_all>div:last-child {
    border-bottom: none;
}

.guide_tipone {
    height: 60px;
    display: flex;
    justify-content: center;
    width: 444px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.21);
    margin: 0 auto;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
}

.guide_tipone>div {
    font-size: 16px;
    font-weight: 400;
    color: #333333;
}

.guide_tipone>div:nth-child(2) {
    width: 21px;
    height: 21px;
}

.guide_tipone>div:nth-child(2)>img {
    width: 100%;
    height: 100%;
}

.base_tip_meth {
    display: flex;
    justify-content: space-between;
    height: 50px;
    width: 400px;
    margin: 0 auto;
    text-align: center;
    line-height: 50px;
    margin-top: 22px;

}

.base_tip_meth>div:nth-child(1) {
    width: 173px;
    background: #E5E5E5;
    border-radius: 6px;
    font-weight: bold;
    color: #333333;
}

.base_tip_meth>div:nth-child(2) {
    width: 173px;
    background: #608FFA;
    border-radius: 6px;
    font-weight: bold;
    color: white;
}

.grayfont {
    color: gray !important;
}

.scrolstyl {
    max-height: 245px;
    overflow-y: scroll;
    background-color: white;
    width: 100%;
}

.scrolstyl>div:last-child {
    border-bottom: none;
}
</style>
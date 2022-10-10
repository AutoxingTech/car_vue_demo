<script lang="ts" setup>
import { reactive } from 'vue';
import { toast } from '../../Toast/Toast';
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const props = defineProps<{
    showPallent: boolean,
    pallet: any
}>()
const LightsLong = 76  //灯带总长度为76
const SingleLight = LightsLong / 23
const emits = defineEmits(["pallent-set", "cancle-pallent"]);
const Canle = () => {
    emits("cancle-pallent");
}
const Enterpallent = () => {
    console.log(pallentList)
    const list: any = []
    let has = false
    pallentList.forEach((item: any) => {
        if (item.num != 0) {
            has = true
        }
    });
    //如果全部为0  设置一个托盘
    if (has == false) {
        pallentList[0].num = LightsLong
    }
    for (let i in pallentList) {
        list.push(pallentList[i].num)
    }
    emits("pallent-set", list);
}


const pallentList: any = reactive([
    {
        name: 'setting.yiceng',
        num: 0,
        sel: true
    },
    {
        name: 'setting.erceng',
        num: 0,
        sel: true
    },
    {
        name: 'setting.sanceng',
        num: 0,
        sel: true
    },
    {
        name: 'setting.siceng',
        num: 0,
        sel: false
    }
])

const lightlong = props.pallet.reduce((pre: number, item: any) => {
    return pre + parseInt(item)
}, 0)
let lights = props.pallet
//如果总长度大于23
if (lightlong > 76) {
    lights = [20, 20, 20, 0]
}
for (let i = 0; i < lights.length; i++) {
    pallentList[i].num = parseInt(lights[i])
    if (lights[i] != 0) {
        pallentList[i].sel = true
    }
}

function blurNumber(e: any, index: any) {
    if (!e.num) {
        pallentList[index].num = 0;
    }
    if (e.num < SingleLight) {
        pallentList[index].num = 0;
    }
}
function setNum(e: any, index: number) {
    if (Numtotal() > LightsLong) {
        toast.show(t('setting.zslbdcg'))
        pallentList[index].num = 0
    }
}
function Numtotal() {
    let total = 0
    pallentList.forEach((item: any) => {
        if (item.num) {
            total += Number(item.num)
        }
    });
    console.log(total)
    return total
}

// const Changesel = (index: number) => {
//     pallentList[index].sel = !pallentList[index].sel
//     if (pallentList[index].sel) {
//         pallentList[index].cm = '30'
//     } else {
//         pallentList[index].cm = '0'
//     }
// }

</script>
<template>
    <div class="pallent_cont" v-if="showPallent">
        <div class="pallent_center">
            <div class="change_cont font6">
                {{$t('setting.tpsz')}}
            </div>
            <div class="pallent_list">
                <div v-for="(item,index) in pallentList" :key="index">
                    <div class="p_top_let">{{$t(item.name)}}</div>
                    <div class="p_top_right">
                        <img v-if="item.num==0" src="../../../assets/img/selout.png" />
                        <img v-else src="../../../assets/img/language1.png" />

                        <!-- <img :src="item.num!=0?'/src/assets/img/language1.png':'/src/assets/img/selout.png'" /> -->
                    </div>
                    <div class="p_bottom_left">{{$t('setting.ddslsz')}}</div>
                    <div class="p_bottom_right">
                        <div class="place_cont">
                            <input type="number" class="placeinput" v-model="item.num" @blur="blurNumber(item,index)"
                                @input="setNum($event,index)">
                        </div>
                        <span class="num">cm</span>
                    </div>
                </div>
            </div>

            <div class="pallent_meth font7">
                <div @click="Canle">{{$t('index.qx')}}</div>
                <div @click="Enterpallent">{{$t('index.qd')}}</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pallent_cont {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 10;
}

.pallent_center {
    width: 535px;
    height: 614px;
    background-color: red;
    position: absolute;
    left: 50%;
    margin-left: -267.5px;
    top: 50%;
    margin-top: -307px;
    background-color: #F3F3F3;
    border-radius: 15px;

}

.change_cont {
    height: 54px;
    width: 100%;
    line-height: 54px;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    color: #333333;
}


.pallent_list {
    width: 485px;
    height: 446px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin: 0 auto;
}

.pallent_list>div {
    width: 100%;
    position: relative;
    background-color: #FFFFFF;
    border-radius: 15px;
    height: 104px;
    background-color: #ffffff;
    box-sizing: border-box;

}

.p_top_let {
    font-size: 16px;
    font-weight: 400;
    color: #333333;
    position: absolute;
    left: 21px;
    top: 21px;

}

.p_top_right {
    position: absolute;
    right: 21px;
    top: 21px;
    width: 21px;
    height: 21px;
}

.p_top_right>img {
    width: 100%;
    height: 100%;
}

.p_bottom_left {
    position: absolute;
    left: 21px;
    bottom: 21px;
    font-size: 16px;
    font-weight: 400;
    color: #333333;
}

.p_bottom_right {
    position: absolute;
    right: 21px;
    bottom: 11px;
    font-size: 16px;
    font-weight: 400;
    color: #333333;
    display: flex;
    align-items: center;

}

.place_cont {
    width: 99px;
    height: 36px;
    line-height: 36px;
    text-align: center;
    font-size: 19px;
    font-weight: bold;
    color: #333333;
    background-color: #E5E5E5;
    border-radius: 6px;
    overflow: hidden;
}

.num {
    font-size: 16px;
    margin-left: 5px;
    font-weight: 400;
    color: #333333;
    line-height: 36px;
}


.pallent_meth {
    display: flex;
    justify-content: space-between;
    height: 50px;
    width: 400px;
    margin: 0 auto;
    text-align: center;
    line-height: 50px;
    margin-top: 30px;

}

.pallent_meth>div:nth-child(1) {
    width: 173px;
    background: #E5E5E5;
    border-radius: 6px;
    font-weight: bold;
    color: #333333;
}

.pallent_meth>div:nth-child(2) {
    width: 173px;
    background: #608FFA;
    border-radius: 6px;
    font-weight: bold;
    color: white;
}

.placeinput {
    height: 100%;
    width: 100%;
    background: #E5E5E5;
    text-align: center;
    font-weight: bold;
    color: #333333;

}

input {
    border: none;
    outline: none;
}
</style>
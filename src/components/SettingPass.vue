

<script lang="ts" setup >
import { ref } from 'vue'
import store from '../store';
const userstore: any = store()
const props = defineProps<{
    PasswordControl: boolean,  //显示弹框
    defautType: number  //0代表正常进去设置  1代表从启动页进去设置
}>()
const showerror = ref(false)
const errorSel = ref(false)
const emits = defineEmits(['passback', 'passin', "ficback"])
const tailNum: any = ref([
    {
        num: '',
        sel: true
    },
    {
        num: '',
        sel: false
    },
    {
        num: '',
        sel: false
    },
    {
        num: '',
        sel: false
    }

])
let errorshowtime: any = ''
function numClick(num: number) {
    errorSel.value = false
    if (props.defautType == 0) {
        //正常设置
        console.log("正常设置")
        ComparePasswords(num, userstore.customSetting.basic.adminPass)
    } else {
        if (userstore.customSetting && userstore.customSetting.basic && userstore.customSetting.basic.adminPass) {
            console.log("虚拟设置,已获取到服务器密码")
            ComparePasswords(num, userstore.customSetting.basic.adminPass)
        } else {
            console.log("虚拟设置,无服务器密码 但本地存有密码")
            if (localStorage.getItem('adminPass')) {
                ComparePasswords(num, localStorage.getItem('adminPass'))
            } else {
                console.log("虚拟设置,无服务器密码 无本地存有密码,使用默认密码")
                let pass = '9999'
                ComparePasswords(num, pass)
            }
        }
    }
}
//输入方法
function ComparePasswords(num: any, adminPass: any) {
    let haslast = false
    for (let k in tailNum.value) {
        tailNum.value[k].sel = false
        if (tailNum.value[k].num == '') {
            haslast = true
        }
    }

    if (haslast == false) {
        tailNum.value[tailNum.value.length - 1].sel = true
        tailNum.value[tailNum.value.length - 1].num = num
    }
    for (let i = 0; i < 4; i++) {
        if (tailNum.value[i].num === "") {
            tailNum.value[i].sel = true
            tailNum.value[i].num = num
            break;
        }
    }
    let li = []
    for (let i in tailNum.value) {
        li.push(tailNum.value[i].num)
    }
    let numstr = li.join("")
    if (numstr.length == 4) {
        setTimeout(() => {
            if (numstr == adminPass) {
                clear()
                emits('passin')
            } else {
                clearTimeout(errorshowtime)
                showerror.value = true
                errorSel.value = true
                errorshowtime = setTimeout(() => {
                    showerror.value = false
                }, 1500);
            }
        }, 300)
    }
}
//删除
function del() {
    errorSel.value = false
    for (let i = 3; i >= 0; i--) {
        if (tailNum.value[i].num !== "") {
            tailNum.value[i].num = ""
            break;
        }
    }
    for (let k in tailNum.value) {
        tailNum.value[k].sel = false
    }
    for (let i = 0; i < 4; i++) {
        if (tailNum.value[i].num == "") {
            tailNum.value[i].sel = true
            break;
        }
    }
}
//左上角返回
function navback() {
    if (props.defautType == 0) {
        clear()
        emits('passback')
    } else {
        emits('ficback')
    }
}
//clear
function clear() {

    for (let i in tailNum.value) {
        tailNum.value[i].sel = false
        tailNum.value[i].num = ''
    }
    tailNum.value[0].sel = true
}
</script>

<template>
    <div class="passbox" v-if="props.PasswordControl">
        <div style="height: 74px;position: absolute;" @click="navback">
            <div class="back_style">
                {{$t('setting.tuichu')}}
            </div>
        </div>

        <div class="kuang1" style="width: 950px;height: 604px;margin: 0 auto;margin-top: 74px; ">
            <!-- 顶 -->
            <div class="passtitle">
                {{$t('setting.mmyz')}}
            </div>
            <!-- 中 -->
            <div class="enterword">
                <div v-for="(item,index) in tailNum" :key="index"
                    :class="item.sel?(errorSel?'hasnum haserro':'hasnum'):''">
                    {{item.num}}
                </div>
            </div>

            <!-- 下 -->
            <div class="landscape" style="flex-wrap: wrap;width: 740px;height: 390px;">
                <div v-for="(item,index) in [1,2,3,4,5,6,7,8,9]" class="kg">
                    <div @click="numClick(item)" :class="index==2||index==5||index==8?'kuangnum2':'kuangnum'">{{item}}
                    </div>
                </div>
                <div style="width: 219px;margin-right: 41px;"></div>
                <div @click="numClick(0)" class="kuangnum">0</div>
                <div class="kuangnum2 sx" @click="del">
                    <img src="../assets/img/cuowu.png" style="width:33px;height: 33px;">
                </div>
            </div>
        </div>
        <div class="error_mask" v-if="showerror">密码错误，请重新输入</div>
    </div>
</template>



<style scoped>
.passbox {
    background-color: #F1F2F6 !important;
    z-index: 100000000;
    height: 100%;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}

.kuang1 {
    border-radius: 50px;
    box-shadow: #E3E4E8 0px 0px 17px 3px inset;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.kuangnum {
    background-color: #E1E2E3;
    border-radius: 13px;
    margin-right: 41px;
    margin-bottom: 14px;
    width: 219px;
    height: 87px;
    line-height: 87px;
    text-align: center;
    color: white;
    font-size: 38px;
    font-weight: bold;
    color: #666666;
}

.kuangnum:active {
    background-color: #83A9FF;
    border-radius: 13px;
    margin-right: 41px;
    margin-bottom: 14px;
    width: 219px;
    height: 87px;
    line-height: 87px;
    text-align: center;
    color: white;
    font-size: 38px;
    font-weight: bold;
    color: white;
    box-shadow: 0 0px 6px 0px #83A9FF;
}

.kuangnum2 {
    background-color: #E1E2E3;
    border-radius: 13px;
    margin-right: 0px;
    margin-bottom: 14px;
    width: 219px;
    height: 87px;
    line-height: 87px;
    text-align: center;
    font-size: 38px;
    font-weight: bold;
    color: #666666;
}

.kuangnum2:active {
    background-color: #83A9FF;
    border-radius: 13px;
    margin-right: 0px;
    margin-bottom: 14px;
    width: 219px;
    height: 87px;
    line-height: 87px;
    text-align: center;
    font-size: 38px;
    font-weight: bold;
    color: white;
    box-shadow: 0 0px 15px 0px #83A9FF;
}


.passtitle {
    height: 75px;
    width: 100%;
    text-align: center;
    line-height: 75px;
    font-size: 30px;
    font-weight: bold;
    color: #666666;
}

.back_style {
    width: 134px;
    height: 49px;
    background-color: #DC4141;
    text-align: center;
    line-height: 49px;
    color: white;
    font-size: 19px;
    font-weight: bold;
    color: #FFFFFF;
    border-radius: 12px;
    position: absolute;
    left: 22px;
    top: 22px;

}

.enterword {
    height: 87px;
    width: 740px;
    margin-bottom: 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.enterword>div {
    width: 129px;
    height: 88px;
    background: #E1E2E3;
    border-radius: 13px;
    text-align: center;
    line-height: 84px;
    background-color: #E1E2E3;
    font-weight: bold;
    color: #666666;
    font-size: 38px;
    box-sizing: border-box;

}

.hasnum {
    width: 129px;
    height: 88px;
    line-height: 84px;
    border: 4px solid #83A9FF;
    box-sizing: border-box;
    color: #83A9FF !important;
}

.haserro {
    width: 129px;
    height: 88px;
    line-height: 84px;
    border: 4px solid #DC4141;
    box-sizing: border-box;
    color: #DC4141 !important;
}

.error_mask {
    height: 101px;
    width: 547px;
    background: #D31600;
    opacity: 0.51;
    border-radius: 15px;
    position: fixed;
    bottom: 22px;
    left: 50%;
    margin-left: -273.5px;
    font-size: 30px;
    font-weight: bold;
    color: #FFFFFF;
    text-align: center;
    line-height: 103px;
}

.sx {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>

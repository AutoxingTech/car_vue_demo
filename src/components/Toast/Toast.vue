<template>
    <div class="mask_totaltip" ref="myRef" v-show="msg.show">
        <div>
            <img src="../../assets/img/tishitip.png" />
        </div>
        <div>{{msg.title}}</div>
    </div>
</template>
  
<script lang="ts" setup>
const props = defineProps<{
    msg: Object,
}>()
const msg: any = props.msg
</script>
  
<style scoped lang="less">
.mask_totaltip {
    width: 240px;
    height: 130px;
    background: #3EC130;
    opacity: 0.8;
    border-radius: 31px;
    position: fixed;
    top: 50%;
    left: 50%;
    margin-top: -55px;
    margin-left: -114.5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    font-weight: bold;
    z-index: 99999;
    padding: 0 20px;
    box-sizing: border-box;
}

.mask_totaltip>div:nth-child(1)>img {
    width: 30px;
    height: 30px;
}

.mask_totaltip>div:nth-child(2) {
    text-align: center;
    font-size: 23px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
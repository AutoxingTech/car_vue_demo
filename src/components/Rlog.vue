

<script lang="ts" setup>
import { Logs, cleanLog } from '../js/globalData'
import store from '../store'
const userstore: any = store()
let logtime: any = ''
const closeLog = () => {
    userstore.$patch((state: any) => {
        state.showLogs = false
    })
}
const getTouchStart = (item: any) => {
    clearTimeout(logtime);
    logtime = setTimeout(function () {
    }, 1000);
}
const getTouchEnd = () => {
    clearTimeout(logtime);
}
const cleanbug = () => {
    cleanLog()
}
</script>

<template>
    <div class="filter_top" v-if="userstore.showLogs" @click="closeLog">
        <div v-for="(item, index) in Logs" :key="index" @touchstart.pervent="getTouchStart(item)"
            @touchend.pervent="getTouchEnd" class="onelog">{{ item }}</div>

        <div class="right_log" @click.stop="cleanbug">清空</div>
    </div>
</template>



<style scoped>
.filter_top {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(256, 256, 256, 0.8);
    z-index: 9999999999999999999999999;
    overflow-y: scroll;
    white-space: wrap;
}

.onelog {
    margin: 2px 0px;
    font-size: 20px;
    color: #333333;
    display: flex;
    flex-wrap: wrap;
    padding: 2px 20px;
    border-bottom: 2px dashed #999999;
    width: 100%;
    box-sizing: border-box;
    word-break: break-all;

}

.right_log {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #5677E7;
    padding: 10px 40px;
    color: white;
    border-radius: 10px;
}
</style>

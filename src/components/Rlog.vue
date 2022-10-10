

<script lang="ts" setup>
import { Logs } from '../js/globalData'
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
</script>

<template>
    <div class="filter_top" v-if="userstore.showLogs" @click="closeLog">
        <div v-for="(item,index) in Logs" :key="index" @touchstart.pervent="getTouchStart(item)"
            @touchend.pervent="getTouchEnd" class="onelog">{{item}}</div>
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
    margin: 10px 20px;
    font-size: 28px;
    color: #333333;
    display: flex;
    flex-wrap: wrap;
    padding: 20px 0;
    border-bottom: 2px dashed #999999;
}
</style>

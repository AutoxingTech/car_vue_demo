<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import store from '../store'
import router from '../router';
const useStore: any = store()
const DataMessage: any = reactive({
  robotsce: 'nav.kx'
})
const time = ref()
onMounted(() => {
  let page = router.currentRoute.value.fullPath
  page && page.indexOf("task/task") >= 0 ? DataMessage.robotsce = 'nav.rwz' : DataMessage.robotsce = 'nav.kx'
})
const timecomp = () => {
  setInterval(() => {
    let myDate = new Date();
    let hours = myDate.getHours();
    let minutes = myDate.getMinutes() + ""
    if (minutes.length <= 1) {
      minutes = "0" + minutes
    }
    time.value = hours + ":" + minutes
  }, 1000)
}
timecomp()
const showLogs = () => {
  useStore.$patch((state: any) => {
    state.showLogs = true
  })
}
defineProps<{
  heights: string
}>()
</script>

<template>
  <div class="nav" :style="'height:'+heights+'px'">
    <div class="robot_statu">
      {{$t('nav.jqrdqzt')}}:{{$t(DataMessage.robotsce)}}
    </div>
    <div class="barrter">
      <img src="../assets/img/battery.png" class="batterimg">
      <div class="battercolor" :style="'width:'+(0.29*useStore.robotstate.battery)+'px'">
        <div class="batter100" v-if="useStore.robotstate.battery==100">Full</div>
      </div>
    </div>
    <img v-if="useStore.robotstate.isCharging" class="shandian" src="../assets/img/shandian.png" />
    <div class="wift_status" style="  font-weight: normal;color: #1FFF6D;margin-left: 5px;">
      {{useStore.robotstate.battery}}%
    </div>
    <div class="volice_status">
      <img src="../assets/img/shengyin_shiti.png">
    </div>
    <div class="wift_status" @click="showLogs">
      {{time}}
    </div>
  </div>
</template>

<style scoped>
.nav {
  display: flex;
  align-items: center;
}

.robot_statu {
  color: #333333;
  font-size: 23px;
}

.barrter {
  width: 35px;
  height: 21px;
  margin: 0 5px 0 10px;
  position: relative;
  display: flex;
  align-items: center;

}

.battercolor {
  background-color: #1FFF6D;
  height: 12px;
  margin-left: 3px;
}

.batter100 {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  text-align: center;
  display: flex;
  margin-left: 6px;
  color: white;
  font-size: 12px;
  align-items: center;
}

.batterimg {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  width: 100%;
}

.wife>img {
  width: 21px;
  height: 18px;
  margin: 0 14px;
}

.wift_status {
  font-weight: normal;
  color: #333333;
  font-size: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.volice_status {
  display: flex;
  align-items: center;
}

.volice_status>img {
  width: 24px;
  height: 26px;
  margin: 0 14px;
}

.shandian {
  width: 17px;
  height: 17px;
}
</style>

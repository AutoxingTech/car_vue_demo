<script setup lang="ts">
import './style/style.css'
import './style/font1.less'
import { onMounted } from '@vue/runtime-core';
import { setWin } from "./js/android"
import Abnormal from '../src/components/Abnormal.vue'
import Rlog from '../src/components/Rlog.vue'
import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';
const button = document.getElementById('app') as HTMLButtonElement;
button.setAttribute("class", "theme_0");
onMounted(() => {
  const win: any = window
  if (win.apk) {
    setWin(win)
    //车机访问 
  } else {
    //浏览器访问
  }
})
</script>

<template>
  <div class="all">
    <Abnormal></Abnormal>
    <Rlog></Rlog>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component"></component>
      </keep-alive>
    </router-view>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;

}

body {
  background-color: #F1F2F6 !important;
}
</style>

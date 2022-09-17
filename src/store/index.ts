import { defineStore } from 'pinia';
interface statetype {
    robotstate: any;
}

const store = defineStore('Store', {
    state: () => {
        //状态
        return {
            showAbnormal: 0, //异常弹框
            customSetting: {}, //设置内容,
            robotstate: {},
            nextpage: 0  //启动跳转设置 返回时使用判断
        }
    },
    getters: {
        //计算属性
    },
    actions: {
        //异步操作
    },
});

export default store
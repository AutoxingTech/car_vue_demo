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
            nextpage: 0,  //启动跳转设置 返回时使用判断
            isModify: false,  //是否编辑模式
            reFresh: false,  //是否刷新
            vers: '', //车机地盘版本
            sdkVers: '',  //机器人sdk版本
            showLogs: false,
            tapType: 0  //0:正常发任务跳转  1从任务中并且急停发待命点或者充电桩

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
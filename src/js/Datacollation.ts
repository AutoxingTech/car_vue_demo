
import { reactive, ref } from 'vue'
import { globalData } from './globalData'
import { robotUtil } from './robotUtil'
import { okRequest } from './okRequest'
import { Rlog } from './Rlog'


export const songlist: any = reactive([
    {
        name: '春の温度',
        id: '3111501'
    },
    {
        name: 'Minuet',
        id: '3111502'
    },
    {
        name: 'Happy Birthday To You',
        id: '3111503'
    },
    {
        name: 'Frühlingslied',
        id: '3111504'
    },
    {
        name: 'Bach in C Major bwv',
        id: '3111505'
    },
    {
        name: 'cromox',
        id: '3111506'
    },
    {
        name: 'hai-kuo-tian-kong-piano',
        id: '3111507'
    }
])  //音乐列表
export const modedisplay: any = [reactive({
    "boardlist": [],
    "boardlist2": [],
    "swipertab": 0,
    "swipertab2": 0,
    "sel": 0,
    "floorlist": [],
    "floorlist2": [],
}), reactive({
    "boardlist": [],
    "boardlist2": [],
    "swipertab": 0,
    "swipertab2": 0,
    "sel": 0,
    "floorlist": [],
    "floorlist2": []
}), reactive({
    "boardlist": [],
    "boardlist2": [],
    "swipertab": 0,
    "swipertab2": 0,
    "sel": 0,
    "floorlist": [],
    "floorlist2": []
})] //功能模式对应的数据
export const standbyPoint: any = ref([])  //待命点
export const chargingPile: any = ref([])  //充电桩
export let curiseLists = []  //巡游列表
export let effectivFloor: any = [] //当前可用楼层
export let modelAudioMap: any = {}  //自定义音乐
export let AFMap: any = {} //楼层和areaid对应关系
export const currentfloor: any = ref(-99) //当前楼层
let allstaion: any = [] //所有的站点 用于筛选AFMap
//设置高亮和首页当前swiper
export function setCurrentFloor(areaId: string) {
    for (const key in AFMap) {
        if (AFMap[key] == areaId) {
            currentfloor.value = key
            break
        }
    }
    setSwiper()
}
//初始化站点数据
export const initTable = () => {
    return robotUtil.getEffectiveAreaList({ effective: true }).then((res: any) => {
        effectivFloor = res.data.effective  //当前可用楼层
        if (effectivFloor == null || effectivFloor.length == 0) {
            return Promise.reject("无可用楼层")
        }
        currentfloor.value = effectivFloor[0]
        return robotUtil.getPoiList({ type: 11 }).then((res: any) => {
            setmessage(0, 11, 12, freshList(res.list))  //快捷餐桌数据
            setmessage(1, 11, 15, freshList(res.list))  //多点餐桌数据
            setmessage(2, 11, 15, freshList(res.list))  //引领餐桌数据
            getbussinessId(res.list)
            return robotUtil.getPoiList({ type: 12 })
        }).then((res: any) => {
            setmessage(0, 12, 12, freshList(res.list))  //快捷包间数据
            setmessage(1, 12, 15, freshList(res.list))  //多点包间数据
            setmessage(2, 12, 15, freshList(res.list))  //引领包间数据
            getbussinessId(res.list)
            if (allstaion.length == 0) {
                return Promise.reject("无站点数据")
            }
            //如果现有站点楼层都不在可用楼层里
            if (modedisplay[0].floorlist.length == 0) {
                return Promise.reject("无站点数据")
            }
            return robotUtil.getPoiList({ type: 10 })
        }).then((res: any) => {
            if (res.list != null) {
                standbyPoint.value = res.list
                allstaion = [...allstaion, ...res.list]
            }
            return robotUtil.getPoiList({ type: 9 })
        }).then((res: any) => {
            if (res.list != null) {
                chargingPile.value = res.list
                standbyPoint.value = [...standbyPoint.value, ...chargingPile.value]
                allstaion = [...allstaion, ...res.list]//获取充电桩列表
            }

            if (res.list == null || res.list.length == 0) {
                if (standbyPoint.value == null || standbyPoint.value.length == 0) {
                    return Promise.reject("无待命点数据")
                } else {
                    return Promise.reject("无充电桩数据")
                }
            }
            collationStaions()
            return okRequest.CuriseList()
        }).then((res: any) => {
            curiseLists = res      //获取巡游地图列表
            let promiselist = []
            for (let i of [1, 2, 3, 4]) {    // "taskType": 1,       1=巡游;2=配送;3=引领;4=行为
                promiselist.push(
                    okRequest.broadcast_effect({ "businessId": globalData.businessId, "businessType": 1, "taskType": i, "robotId": globalData.sn }, false).then((res: any) => {
                        modelAudioMap[i + ""] = res.poiMap
                    })
                )
            }
            return Promise.all(promiselist)
        })

    })
}
// AFMap, "楼层和areaid对应关系"
function collationStaions() {
    for (let item of allstaion) {
        if (AFMap[item.floor + ""] == undefined) {
            AFMap[item.floor + ""] = item.areaId
        }
    }
}
//设置swiper 拿到当前楼层对应的floorlist下标和swiper下标进行高亮标记
function setSwiper() {
    Rlog(currentfloor.value, "设置swiper")
    for (let i in modedisplay) {
        if (Number(i) < 3) {
            modedisplay[i].swipertab2 = 0
            for (let j in modedisplay[i].boardlist2) {
                if (modedisplay[i].boardlist2[j][0].floor == currentfloor.value) {
                    modedisplay[i].swipertab2 = Number(j)
                    break
                }
            }
            modedisplay[i].swipertab = 0
            for (let j in modedisplay[i].boardlist) {
                if (modedisplay[i].boardlist[j][0].floor == currentfloor.value) {
                    modedisplay[i].swipertab = Number(j)
                    break
                }
            }
        }
    }
    let currentindex: any = 0  //当前显示的楼层
    for (let p in modedisplay[0].floorlist) {
        if (modedisplay[0].floorlist[p].name == currentfloor.value) {
            currentindex = p
        }
    }
    let currentindex2: any = 0  //当前显示的楼层
    for (let p in modedisplay[0].floorlist2) {
        if (modedisplay[0].floorlist2[p].name == currentfloor.value) {
            currentindex2 = p
        }
    }

    for (let i = 0; i < modedisplay.length; i++) {
        if (Number(i) < 3) {
            if (modedisplay[i].floorlist && modedisplay[i].floorlist.length > 0) {
                for (let item of modedisplay[i].floorlist) {
                    item.sel = false
                }
                modedisplay[i].floorlist[Number(currentindex)].sel = true
            }
            if (modedisplay[i].floorlist2 && modedisplay[i].floorlist2.length > 0) {
                for (let item of modedisplay[i].floorlist2) {
                    item.sel = false
                }
                modedisplay[i].floorlist2[Number(currentindex2)].sel = true
            }
        }
    }


}
//根据站点筛选楼层列表和对站点进行规整
function setmessage(index: number, type: number, num: number, data: any) {
    type == 12 ? (modedisplay[index].floorlist2 = getFloor(data)) : (modedisplay[index].floorlist = getFloor(data))
    type == 12 ? (modedisplay[index].boardlist2 = arraysort(data, num)) : (modedisplay[index].boardlist = arraysort(data, num))
}
//防止面向对象 只用于数据规整
function freshList(e: any) {
    if (e == null) {
        e = []
    }
    return JSON.parse(JSON.stringify(e))
}
//根据数组内某个元素从小到达排序
function compare(name: any) {
    return function (obj1: any, obj2: any) {
        return Number(obj1[name]) - Number(obj2[name]);
    }
}
//获取楼层
function getFloor(e: any) {
    let floorlist: any = [] //可用且有站点的楼层
    let floorobj: any = {}  //站点中包含的所有楼层
    for (let item of e) {
        if (floorobj[item.floor] == undefined) {
            floorobj[item.floor] = ""
            if (effectivFloor.indexOf(Number(item.floor)) > -1) {
                floorlist.push({ name: item.floor, sel: false })
            }
        }
    }
    floorlist.sort(compare('name'))
    return floorlist
}
//站点分页
function split_array(arr: any, len: number) {
    var a_len = arr.length;
    var result = [];
    for (var i = 0; i < a_len; i += len) {
        result.push(arr.slice(i, i + len));
    }
    return result
}
//站点进行拆分
function arraysort(resData: any, num: number) {
    let tempArr = [];
    let Data = [];
    let sortdata = [];
    for (let i = 0; i < resData.length; i++) {
        if (tempArr.indexOf(resData[i].floor) === -1) {
            Data.push({
                floor: resData[i].floor,
                dataInfo: [resData[i]]
            });
            tempArr.push(resData[i].floor);
        } else {
            for (let j = 0; j < Data.length; j++) {
                if (Data[j].floor == resData[i].floor) {
                    Data[j].dataInfo.push(resData[i]);
                    break;
                }
            }
        }
    }

    Data.sort(compare('floor'))
    for (let l in Data) {
        if (effectivFloor.indexOf(Data[l].floor) > -1) {
            sortdata.push(...split_array(Data[l].dataInfo, num))
        }
    }


    return sortdata
}
//获取bussinishid
function getbussinessId(list: any) {
    if (list != null && list.length != 0) {
        globalData.businessId = list[0].businessId
        allstaion = [...allstaion, ...list]
    }
}

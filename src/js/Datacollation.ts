
import { ref, reactive } from 'vue'
import { globalData } from './globalData'
import { robotUtil } from './robotUtil'
import { okRequest } from './okRequest'

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
])

export const tables: any = reactive([{
    "img": "../../static/image/cg1.png",
    "name": "快捷送餐",
    "id": 0,
    "show": 1,
    "boardlist": [],
    "boardlist2": [],
    "swipertab": 0,
    "swipertab2": 0,
    "sel": 0,
    "floorlist": [],
    "floorlist2": [],
    "floorlist1scroll": false,
    "floorlist2scroll": false,
}, {
    "img": "../../static/image/cg2.png",
    "name": "多点送餐",
    "id": 1,
    "show": 1,
    "boardlist": [],
    "boardlist2": [],
    "swipertab": 0,
    "swipertab2": 0,
    "sel": 0,
    "floorlist": [],
    "floorlist2": []
}, {
    "img": "../../static/image/cg3.png",
    "name": "直达",
    "id": 2,
    "show": 1,
    "boardlist": [],
    "boardlist2": [],
    "swipertab": 0,
    "swipertab2": 0,
    "sel": 0,
    "floorlist": [],
    "floorlist2": []
}, {
    "img": "../../static/image/cg5.png",
    "name": "巡游",
    "id": 3,
    "show": 1,
    "sel": 0
}])
export let StandbyPoint = []  //待命点
export let ChargingPile = []  //充电桩
export let CuriseLists = []  //巡游列表
export let EffectivFloor = [] //当前可用楼层
export let poiMap: any = {}  //自定义音乐
export let AFMap: any = {} //楼层和areaid对应关系
export let currentfloor: any = -99  //当前楼层
export const setCurrentFloor = (areaId: string) => {  //设置当前楼层
    for (const key in AFMap) {
        if (AFMap[key] == areaId) {
            currentfloor = key
            //设置高亮和首页当前swiper
            setSwiper()
            break
        }
    }
}
let Allstaion: any = []
const CollationStaions = () => {   // AFMap, "楼层和areaid对应关系"
    for (let item of Allstaion) {
        if (AFMap[item.floor + ""] == undefined) {
            AFMap[item.floor + ""] = item.areaId
        }
    }
}
//设置swiper
const setSwiper = () => {
    for (let i in tables) {
        if (Number(i) < 3) {
            for (let j in tables[i].boardlist2) {
                if (tables[i].boardlist2[j][0].floor == currentfloor) {
                    tables[i].swipertab2 = Number(j)
                    break
                }
            }
            for (let j in tables[i].boardlist) {
                if (tables[i].boardlist[j][0].floor == currentfloor) {
                    tables[i].swipertab = Number(j)
                    break
                }
            }
        }
    }
    let currentindex: any = 0
    for (let p in tables[0].floorlist) {
        if (tables[0].floorlist[p].name == currentfloor) {
            currentindex = p
        }
    }

    for (let i in tables) {
        if (Number(i) < 3) {
            if (tables[i].floorlist && tables[i].floorlist.length > 0) {
                for (let item of tables[i].floorlist) {
                    item.sel = false
                }
                tables[i].floorlist[Number(currentindex)].sel = true
            }
            if (tables[i].floorlist2 && tables[i].floorlist2.length > 0) {
                for (let item of tables[i].floorlist2) {
                    item.sel = false
                }
                tables[i].floorlist2[Number(currentindex)].sel = true
            }
        }
    }
}
const setmessage = (index: number, type: number, num: number, data: any) => {
    type == 12 ? (tables[index].floorlist2 = getFloor(data)) : (tables[index].floorlist = getFloor(data))
    type == 12 ? (tables[index].boardlist2 = Arraysort(data, num)) : (tables[index].boardlist = Arraysort(data, num))
}
const freshList = (e: any) => {
    if (e == null) {
        e = []
    }
    return JSON.parse(JSON.stringify(e))
}
//获取楼层
//获取楼层
const getFloor = (e: any) => {
    let Flist = []
    let floorIndex = 0
    for (let i in e) {
        let has = false
        Flist.forEach((item, index) => {
            if (item.name == e[i].floor) {
                has = true
            }
            //等于currentfloor设置为高亮
            if (e[i].floor == currentfloor) {
                floorIndex = index
            }
        })
        if (has == false) {
            Flist.push({ name: e[i].floor, sel: false })
        }
        Flist[floorIndex].sel = true
    }
    return Flist
}
//站点分页
const split_array = (arr: any, len: number) => {
    var a_len = arr.length;
    var result = [];
    for (var i = 0; i < a_len; i += len) {
        result.push(arr.slice(i, i + len));
    }
    return result
}
//站点进行拆分
const Arraysort = (resData: any, num: number) => {
    let tempArr = [];
    let Data = [];
    let lastdata = [];
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
    for (let l in Data) {
        lastdata.push(...split_array(Data[l].dataInfo, num))
    }
    let floorlist: any = getFloor(resData)
    //添加无站点的空swiper
    let newtable = []
    for (let k in floorlist) {
        let has = false
        let indexn: any = []
        lastdata.forEach((res, index) => {
            if (res[0].floor == floorlist[k].name) {
                has = true
                indexn.push(index)
            }
        })
        if (has) {
            for (let it of indexn) {
                newtable.push(lastdata[it])
            }
        } else {
            newtable.push([{
                'floor': floorlist[k].name
            }])
        }

    }
    return newtable
}

//获取bussinishid
const getbussinessId = (list: any) => {
    if (list != null && list.length != 0) {
        globalData.businessId = list[0].businessId
        Allstaion = [...Allstaion, ...list]
    }

}

export const initTable = () => {
    return robotUtil.getEffectiveAreaList({ effective: true }).then((res: any) => {
        EffectivFloor = res.data.effective  //当前可用楼层
        currentfloor = EffectivFloor[0]  //楼层设置默认显示为第一个
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
            return robotUtil.getPoiList({ type: 10 })
        }).then((res: any) => {
            if (res.list != null) {
                StandbyPoint = res.list
                Allstaion = [...Allstaion, ...res.list]
            }
            return robotUtil.getPoiList({ type: 9 })
        }).then((res: any) => {
            if (res.list != null) {
                ChargingPile = res.list
                Allstaion = [...Allstaion, ...res.list]//获取充电桩列表
            }
            return robotUtil.getPoiList({ type: 6 })
        }).then((res: any) => {
            if (res.list != null) {
                Allstaion = [...Allstaion, ...res.list] //获取电梯点
            }
            CollationStaions()
            return okRequest.CuriseList()
        }).then((res: any) => {
            CuriseLists = res      //获取巡游地图列表
            let promiselist = []
            for (let i of [1, 2, 3, 4]) {    // "taskType": 1,       1=巡游;2=配送;3=引领;4=行为
                promiselist.push(
                    okRequest.broadcast_effect({ "businessId": globalData.businessId, "businessType": 1, "taskType": i, "robotId": globalData.sn }, false).then((res: any) => {
                        poiMap[i + ""] = res.poiMap
                    })
                )
            }
            return Promise.all(promiselist)   //console.log(poiMap, "背景声音列表")
        })

    })
}

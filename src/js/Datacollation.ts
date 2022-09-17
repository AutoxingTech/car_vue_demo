
import { json } from 'stream/consumers'
import { ref, reactive } from 'vue'

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
const currentfloor: any = ref(-99)  //当前楼层

const setmessage = (index: number, type: number, num: number, data: any) => {
    type == 12 ? (tables[index].floorlist2 = getFloor(data)) : (tables[index].floorlist = getFloor(data))
    type == 12 ? (tables[index].boardlist2 = Arraysort(data, num)) : (tables[index].boardlist = Arraysort(data, num))
    type == 12 ? (tables[index].swipertab2 = getSwiperindex(tables[index].boardlist2)) : (tables[index].swipertab = getSwiperindex(tables[index].boardlist))
}
const freshList = (e: any) => {
    return JSON.parse(JSON.stringify(e))
}
//获取当前楼层对应的swiperindex
const getSwiperindex = (list: any) => {
    for (let i in list) {
        if (list[i][0].floor == currentfloor.value) {
            return Number(i)
        }
    }
    return 0
}
//获取楼层
const getFloor = (e: any) => {
    let Flist = []
    let floorIndex = 0
    for (let i of e) {
        let has = false
        Flist.forEach((item) => {
            if (item.name == i.floor) {
                has = true
            }
            //等于currentfloor设置为高亮
            if (i.floor == currentfloor) {
                floorIndex = i
            }
        })
        if (has == false) { Flist.push({ name: i.floor, sel: false }) }
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

export const initTable = (axRobot: any, resolve: any, reject: any) => {
    // return axRobot.getAreaList().then((res: any) => {
    // floors[0] = res.data.list
    // console.log(floors, "楼层")
    return axRobot.getPoiList({ type: 11 }).then((res: any) => {
        setmessage(0, 11, 12, freshList(res.list))  //快捷餐桌数据
        setmessage(1, 11, 15, freshList(res.list))  //多点餐桌数据
        setmessage(2, 11, 15, freshList(res.list))  //引领餐桌数据
        axRobot.getPoiList({ type: 12 }).then((res: any) => {
            setmessage(0, 12, 12, freshList(res.list))  //快捷包间数据
            setmessage(1, 12, 15, freshList(res.list))  //多点包间数据
            setmessage(2, 12, 15, freshList(res.list))  //引领包间数据
            axRobot.getPoiList({ type: 10 }).then((res: any) => {
                StandbyPoint = res.list
                axRobot.getPoiList({ type: 9 }).then((res: any) => {
                    ChargingPile = res.list
                    resolve(1)
                })
            })


        }).catch((errMsg: String) => {
            reject(errMsg)
        })
    }).catch((errMsg: String) => {
        reject(errMsg)
    })

    // })
}

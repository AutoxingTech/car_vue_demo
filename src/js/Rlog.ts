import { dateFormatYYYY_mm_dd, dateFormatSSS } from './commonUtil';
import { setLog } from './globalData'
import { saveLogcatToFile } from "./android";
import { robotUtil } from './robotUtil';
/*
* level      ["info", "error"]
* modelTag   ["API", "RealState", "TaskState", "Common"]
* deviceId   robotId
* logdata    打印内容
* msg        打印说明
*/
var currentdate: any = null

export const Levels: any = {
    info: "info",
    error: 'error'
}
export const Modetags: any = {
    API: 'API',
    RealState: 'RealState',
    TaskState: 'TaskState',
    Common: 'Common'
}
const LevelValues = Object.values(Levels)
const ModetagValues = Object.values(Modetags)
export function Rlog(...param: any) {
    let currenLevel = '' //level
    let currenModelTag = '' //modelTag
    let args: any = Object.values(arguments)
    let levelInfLevels = false  //参数中是否存在level
    let modeInModetags = false  //参数中是否存在modelTag

    for (let item of LevelValues) {
        if (args.indexOf(item) > -1) {
            levelInfLevels = true
            currenLevel = args[args.indexOf(item)]  //若存在level，标记currenLevel
            args.splice(args.indexOf(item), 1)  //删除level
        }
    }

    for (let item of ModetagValues) {
        if (args.indexOf(item) > -1) {
            modeInModetags = true
            currenModelTag = args[args.indexOf(item)]   //若存在modetags，标记currenModelTag
            args.splice(args.indexOf(item), 1)   //删除modetags
        }
    }

    if (!levelInfLevels) {  //参数中不存在level 默认值info
        currenLevel = 'info'
    }
    if (!modeInModetags) {  //参数中不存在 modeTags 默认值common
        currenModelTag = 'Common'
    }
    if (args.length == 0) {
        return
    }
    //------------至此，args只剩下需要打印的内容----------  //
    let logData: any = "AXWEB＃#" + dateFormatSSS() + currenLevel + '(' + currenModelTag + ')'
    let logData2: any = {}
    for (var i in args) {
        logData2[i] = args[i]
        if (typeof args[i] == 'object') {
            logData += "＃" + JSON.stringify(args[i])
        } else {
            logData += "＃" + args[i]
        }
    }
    console.log(logData) //打印
    saveLogToFile()   //存在车机sd卡日志
    setLog(logData) //存到本地日志
    // saveLogToServer()//日志到车机服务器
    robotUtil.exportOpreationLogger(currenLevel, currenModelTag, logData2, 'AXWEB')
}

//存到sd卡文件
function saveLogToFile() {
    if (currentdate == null) {
        currentdate = saveLogcatToFile()
    } else {
        let datestr = dateFormatYYYY_mm_dd()
        if (datestr != currentdate) {
            currentdate = saveLogcatToFile()
        }
    }
}




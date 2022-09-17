<template>
    <div class="direct_cont">
        <div class="direct_center"></div>
        <div class="direct_rightcont">
            <div class="direct_choice_point">餐桌点选

                <span></span>
            </div>
            <div class="direct_choice_floor">当前楼层：19层
                <span></span>
            </div>
        </div>
        <div class="direct_bottomcont font1">立即出发</div>
    </div>
</template>
<style scoped>
.direct_cont {
    width: 1205px;
    height: 604px;
    margin: 0 auto;
    background-color: #BCEEDD;
    border-radius: 13px;
    box-shadow: #E3E4E8 0px 0px 17px 3px inset;
    padding-top: 42px;
    position: relative;
    box-sizing: border-box;
}

.direct_center {
    width: 724px;
    height: 541.5px;
    margin: 0 auto;
    border: 1px solid #83A9FF;
}

.direct_rightcont {
    width: 266px;
    height: 141px;
    position: absolute;
    right: 21px;
    top: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.direct_choice_point {
    height: 61px;
    width: 100%;
    background: #97BDA5;
    border-radius: 13px;
    display: flex;
    align-items: center;
    padding-left: 36px;
    font-size: 23px;
    font-weight: bold;
    color: #FFFFFF;
    box-sizing: border-box;
    position: relative;
}

.direct_choice_point>span {
    display: block;
    width: 0px;
    height: 0px;
    border: 10px solid;
    border-left-color: transparent;
    border-right-color: transparent;
    border-top-color: white;
    border-bottom-color: transparent;
    position: absolute;
    right: 17px;
    top: 50%;
    margin-top: -5px;
}

.direct_choice_floor {
    height: 61px;
    width: 100%;
    background: #83A9FF;
    border-radius: 13px;
    display: flex;
    align-items: center;
    padding-left: 36px;
    font-size: 23px;
    font-weight: bold;
    color: #FFFFFF;
    box-sizing: border-box;
    position: relative;
}

.direct_choice_floor>span {
    display: block;
    width: 0px;
    height: 0px;
    border: 10px solid;
    border-left-color: transparent;
    border-right-color: transparent;
    border-top-color: white;
    border-bottom-color: transparent;
    position: absolute;
    right: 17px;
    top: 50%;
    margin-top: -5px;
}

.direct_bottomcont {
    position: absolute;
    bottom: 18px;
    width: 1165px;
    height: 66.5px;
    background-color: #F05F38;
    text-align: center;
    line-height: 66.5px;
    font-weight: bold;
    color: #FFFFFF;
    left: 50%;
    margin-left: -582.5px;
    border-radius: 13px;
    box-shadow: 0px 0px 3px #F05F38;
}
</style>
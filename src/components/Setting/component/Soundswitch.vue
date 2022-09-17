
<script lang="ts" setup>
import { computed, ref, nextTick } from 'vue'
const props = defineProps({
    modelValue: {
        type: [Number, String, Boolean],
    },
    trueValue: {
        type: [Number, String, Boolean],
        default: true,
    },
    falseValue: {
        type: [Number, String, Boolean],
        default: true,
    },
    activeColor: {
        type: [String],
        default: '#409EFF',
    }
})
const emits = defineEmits(['update:modelValue', 'change-switch'])
//input事件 获取当前input事件
const handleInput = () => {
    nextTick(() => {
        const val = input.value.checked
        emits("update:modelValue", val);
        emits("change-switch", val);
    })
};
const input = ref()
//判断当前组件是否是打开状态
const checked = ref(computed(() => {
    return props.modelValue === props.trueValue
}))

</script>

<template>
    <div class="d-switch" :class="checked?'is-checked':''">
        <input class="d-switch__input" ref="input" type="checkbox" :checked="checked" @change="handleInput"
            :true-value="trueValue" :false-value="falseValue" />
        <span class="d-switch_action"></span>
    </div>
</template>


<style lang='less' scoped>
.d-switch {
    position: relative;
    height: 30px;
    transition: background 0.2s;
    width: 61px;
    border-radius: 50px;
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
    border: 2px solid #5677E7 !important;


    .d-switch__input {
        position: relative;
        z-index: 1;
        margin: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
    }

    .d-switch_action {
        position: absolute;
        transition: 0.2s;
        left: 2.5px;
        top: 2.5px;
        z-index: 0;
        height: 25px;
        width: 25px;
        background: #5677E7;
        border-radius: 50%;

    }

    &.is-checked {
        background: #5677E7;

        .d-switch_action {
            left: 52px;
            background: #fff;
            margin-left: -18px;
        }
    }
}
</style>
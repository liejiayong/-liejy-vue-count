# vue-countup

## Feature

- 新增兼容 ie11+

## Usage

### 引入模块

```vue
<template>
    <jcount :start="0" :end="8888">
</template>
<script>
import Vue from 'vue';
import jcount from '@liejy/vue-countup';
Vue.use(jcount);
</script>
```

如果想设置包裹元素样式，可以使用 childEle 来设置数字被包裹的 DOM.[【查看案例】](https://codepen.io/liejiayong/pen/GRjRdQE)

```vue
<jcount :start="0" :end="1688" :child-ele="span" :wrap-ele="div">
```

### props

- start - 开始数值
  - type: Number
  - required : false
  - default : 0
- end - 结束数值
  - type: Number
  - required : false
  - default : 0
- duration - 动画持续时间
  - type: Number
  - required : false
  - default : 3000
- decimals - // 小数点位数
  - type: Number
  - required : false
  - default : 0
- decimal - // 小数位符号
  - type: String
  - required : false
  - default : '.'
- separator - // 分隔符
  - type: String
  - required : false
  - default : ','
- prefix - // 前缀
  - type: String
  - required : false
  - default : ''
- suffix - // 后缀
  - type: false
  - required : true
  - default : ''
- wrapEle - // 父元素组件
  - type: false
  - required : true
  - default : 'span'
- childEle - // 子元素组件
  - type: false
  - required : true
  - default : ''

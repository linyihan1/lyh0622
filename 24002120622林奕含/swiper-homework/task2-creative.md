# 任务二 · creative effect 仿写（⭐⭐⭐）

> 作者：林奕含 · 学号：24002120622 · 时间：2026-11-09
> 目标：为 swiper-task.html 演示四新增第 7 种效果「creative 电影墙」

---

## 🔗 官方示例

https://swiperjs.com/swiper-api#creative-effect

```js
// 官方最小示例
new Swiper('.swiper', {
  effect: 'creative',
  creativeEffect: {
    prev: {
      translate: [0, 0, -400],  // Z 轴后移（缩小远退感）
    },
    next: {
      translate: ['100%', 0, 0],  // X 轴从右侧 100% 进场
    },
  },
});
```

---

## 🛠️ 我的实现代码

### 1. HTML：新增按钮

```html
<!-- 原 6 个按钮 -->
<button class="wy-on" data-fx="slide">slide 平推（默认·稳重）</button>
<button data-fx="fade">fade 淡入淡出（优雅）</button>
<button data-fx="cube">cube 3D 立方体（炫酷）</button>
<button data-fx="coverflow">coverflow 画廊堆叠（沉浸）</button>
<button data-fx="flip">flip 翻页（复古）</button>
<button data-fx="cards">cards 卡片（俏皮）</button>
<!-- lyh_新增第 7 个按钮 -->
<button data-fx="creative">creative 电影墙（拓展·自研）</button>
```

### 2. JS：creativeEffect 配置

```js
// lyh_任务二·creative 仿写：上一张缩小左移带角度，下一张放大右移进场
} else if (lyh_fx === 'creative') {
  lyh_new_opts.creativeEffect = {
    // prev: 离开的上一张——缩小到 0.7、Z 轴后移、逆时针转 12°、左移 30%
    prev: {
      translate: ['-30%', 0, -400],
      scale: 0.7,
      rotate: [0, 0, -12],
      opacity: 0.6,
    },
    // next: 进入的下一张——X 轴从右侧 100% 进场、放大到 1.15、顺时针转 12°
    next: {
      translate: ['100%', 0, 0],
      scale: 1.15,
      rotate: [0, 0, 12],
      opacity: 1,
    },
  };
  lyh_new_opts.speed = 1200;  // creative 电影墙动画稍慢，更有仪式感
}
```

### 3. 为什么要 destroy + rebuild

```js
// lyh_JS: Swiper 不支持运行时改 effect，必须 destroy 旧实例 + new 新实例
if (lyh_sw_4 && typeof lyh_sw_4.destroy === 'function') {
  lyh_sw_4.destroy(true, true);  // deleteInstance + cleanStyles
  lyh_sw_4 = null;
}
var lyh_new_opts = JSON.parse(JSON.stringify(lyh_sw_4_opts));  // 深拷贝
lyh_new_opts.effect = lyh_fx;
// ... 根据 effect 加专属参数 ...
lyh_sw_4 = new Swiper("#wySw4", lyh_new_opts);
```

---

## 🎨 参数调优思路

| 观察 | 原来 | 调整后 | 理由 |
|---|---|---|---|
| 上一张离场没退远 | translateZ 默认 0 | -400 | Z 轴后移产生"往后退"的电影感 |
| 只有平移没动态 | 没 rotate | rotateZ: ±12° | 轻微旋转增加"入场仪式感" |
| 动画太快没感觉 | speed 800 | 1200 | 电影墙需要慢节奏，1.2s 更从容 |
| 入场没放大 | scale 默认 1 | 1.15 | 放大 15% 强化"主角进场"效果 |

---

## 🎤 答辩三问

### Q1：prev / next 的 transform 各控制什么？

**答**：`prev` 定义"上一张即将离开时的样子"，`next` 定义"下一张即将进入时的样子"。Swiper 会用 CSS `transform` + `transition` 把当前 slide 从 **next 状态过渡到默认状态**（就是正常显示），同时把上一张从 **默认状态过渡到 prev 状态**。所以动画其实是：下一张"进场" + 上一张"退场"同时发生。

### Q2：transform 里的百分比是相对谁的？

**答**：百分比是相对 **当前 swiper-slide 容器自身的尺寸**。`translateX: '100%'` 就是"向右移动一个 slide 自身宽度"，`translateX: '-30%'` 就是"向左移动 30% 的 slide 宽度"。这和 CSS 里 `transform: translateX(100%)` 的百分比含义完全一致。

### Q3：改一个数值让卡片转 20 度试试？

**答**：改 `rotate: [0, 0, 12]` 里的第三个值（Z 轴旋转），改成 `rotate: [0, 0, 20]`。如果想反转方向就改成负数 `-20`。三个值分别对应 `[X轴, Y轴, Z轴]`——Z 轴是平面内旋转（像纸片转），X 轴是上下翻，Y 轴是左右翻。

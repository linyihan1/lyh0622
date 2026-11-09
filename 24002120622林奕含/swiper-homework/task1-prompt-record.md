# 任务一 · 提示词工程师（⭐⭐）

> 作者：林奕含 · 学号：24002120622 · 时间：2026-11-09
> 目标：让 AI 听懂并生成 `new Swiper('#wySw4', {...})` 配置

## 📋 原始需求（老师给的）

帮我写 `new Swiper('#wySw4', {...})` 配置：
① 无缝循环
② 3.2 秒自动翻页且手动操作后不停止
③ 圆点分页器可点击
④ 初始效果为 `cube`

---

## 🔵 第 1 轮提示词 & AI 回答

### ✍️ 我给 AI 的提示词（第 1 版）

```
帮我写一个 Swiper 的配置代码，new Swiper('#wySw4', {...}) 这样的形式，要求：
1. 循环播放
2. 自动翻页，3.2秒一次
3. 有圆点分页器
4. 初始效果是 cube
```

### 🤖 AI 第 1 次给我的代码

```js
var swiper = new Swiper('#wySw4', {
  loop: true,
  autoplay: {
    delay: 3200,
  },
  pagination: {
    el: '#wyPag4',
  },
  effect: 'cube',
});
```

### ❌ 第 1 版漏了什么

| 需求 | 要求 | AI 有没有？ |
|---|---|---|
| 无缝循环 | `loop: true` | ✅ |
| 3.2 秒自动翻页 | `autoplay.delay: 3200` | ✅ |
| **手动操作后不停止** | `autoplay.disableOnInteraction: false` | ❌ **漏了！默认是 true，用户拖一下 autoplay 就停了** |
| 圆点分页器可点击 | `pagination.clickable: true` | ❌ **漏了！默认 false，圆点只能看不能点** |
| 初始效果 cube | `effect: 'cube'` | ✅ |

> 💡 核心教训：模糊的"有分页器"AI 只会写 `el`，不会主动加 `clickable`；模糊的"自动翻页"AI 只会写 `delay`，不会主动加 `disableOnInteraction: false`。这两个是 Swiper 默认行为坑！

---

## 🟢 第 2 轮提示词 & AI 回答

### ✍️ 我给 AI 的提示词（第 2 版，精准对齐）

```
在你上一版基础上，补齐 4 个硬性要求，每个都要精准：

1. 无缝循环 → loop: true

2. 自动翻页必须同时写两行：
   autoplay: {
     delay: 3200,
     disableOnInteraction: false
   }
   注意：disableOnInteraction 必须写 false，不能漏！
   （因为默认 true 会导致用户手动拖一下之后自动播放就停了）

3. 圆点分页器必须写 clickable: true：
   pagination: {
     el: '#wyPag4',
     clickable: true
   }
   注意：默认 false，用户点圆点不会跳转

4. 初始效果：effect: 'cube'

请输出完整代码。
```

### 🤖 AI 第 2 次给我的代码（正确版）

```js
var swiper = new Swiper('#wySw4', {
  loop: true,
  autoplay: {
    delay: 3200,
    disableOnInteraction: false
  },
  pagination: {
    el: '#wyPag4',
    clickable: true
  },
  effect: 'cube'
});
```

### ✅ 验证结论

| 需求 | 第 2 版 AI 回答 | 是否满足 |
|---|---|---|
| 无缝循环 | `loop: true` | ✅ |
| 3.2s 自动翻页 | `delay: 3200` | ✅ |
| 手动后不停止 | `disableOnInteraction: false` | ✅ |
| 圆点可点 | `clickable: true` | ✅ |
| cube 效果 | `effect: 'cube'` | ✅ |

**粘进页面验证结果**：打开 `swiper-task.html` 任务 4，手动把 effect 按钮点成 cube 能 3D 翻转；拖一下松手继续自动翻；点圆点能直接跳到对应图片。**全部通过** ✅

---

## 🎤 答辩四连问（老师可能问的）

### Q1：你的第一版提示词漏掉了哪个需求？
**答**：漏掉了两个关键配置——`autoplay.disableOnInteraction: false`（用户拖了之后自动播放会停）和 `pagination.clickable: true`（圆点只能看不能点）。

### Q2：你是怎么在第二轮里"说清楚"的？
**答**：第二轮不再用模糊的"有分页器"、"自动翻页"，而是把 Swiper 隐藏的默认行为坑直接告诉 AI——"默认 true 会停"、"默认 false 不能点"，让 AI 知道为什么必须写这两行。

### Q3：AI 第一次给的代码错在哪？
**答**：`disableOnInteraction` 和 `clickable` 都是 Swiper 的**默认值**，AI 倾向于不写默认值。但这两个默认值恰恰是课堂任务的**强制要求**——老师明确说了"手动后不停止"和"可点击"，所以必须显式覆盖。

### Q4：以后给 AI 写提示词的技巧？
**答**：凡是涉及"默认值有坑"的配置（Swiper 的 autoplay、clickable，CSS 的 display 默认 inline，JS 的 == 自动类型转换），**显式告诉 AI 要写什么 + 为什么要写 + 不写会怎样**。

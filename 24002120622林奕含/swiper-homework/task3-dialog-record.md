# 任务三 · 综合创作 + 技术答辩（⭐⭐⭐ 超纲加分）

> 作者：林奕含 · 学号：24002120622 · 时间：2026-11-09
> 目标：加展品 + 课堂没讲过的 Swiper 能力

---

## 🎯 自选的超纲能力：`keyboard: true`

**为什么选 keyboard？**
- 比 zoom / parallax / mousewheel 更适合答辩（一行代码、逻辑清晰、不需要额外 CDN）
- 任何电脑都有键盘，0 环境依赖
- 课堂确实没讲过（老师只讲了 loop / autoplay / pagination / navigation / effect）

---

## 🛠️ 代码改动清单

### 1. 新增第六件展品：爱达·魔都号（2024 首艘国产大型邮轮）

```html
<!-- 任务 1 的 swiper-slide 里追加 -->
<div class="swiper-slide">
  <img src="swiper-imgs/aida_modu.jpg" alt="爱达·魔都号">
  <div class="wy-cap">
    <h3>爱达·魔都号</h3>
    <p>2024 年首航 · 首艘国产大型邮轮</p>
  </div>
</div>
```

> 4 个任务的 swiper 各加一条，共 4 处修改。

### 2. 4 个 Swiper 配置全部加 `keyboard: true`

```js
// 任务 1
var lyh_sw_1 = new Swiper("#wySw1", { keyboard: true });

// 任务 2
var lyh_sw_2 = new Swiper("#wySw2", {
  loop: true, speed: 600,
  keyboard: true,  // ← 加这一行
  pagination: { el: "#wyPag2", clickable: true },
  navigation: { nextEl: "#wyNext2", prevEl: "#wyPrev2" },
});

// 任务 3、任务 4 同理...
```

### 3. AI 生成图片

用 Trae 的图像生成 API 生成 `landscape_16_9`：
```
prompt: 中国首艘大型邮轮 爱达·魔都号 现代邮轮 海面上 横版16:9
```
输出路径：`swiper-imgs/aida_modu.jpg`

---

## 💬 与 AI 的关键对话记录（提示词 + 重要往返）

### 🔵 对话 1：让 AI 推荐哪个超纲能力适合我

**我（提示词）：**
> Swiper 除了 loop / autoplay / pagination / navigation / effect 这些课堂讲过的，还有 keyboard / mousewheel / zoom / parallax 四种超纲能力。帮我选一个最适合答辩、代码量最小、最不容易出错的，理由是？

**AI 第一次给的答案：**
> 推荐 zoom（双击缩放），因为视觉效果最明显，答辩演示时能直观看到放大缩小，代码也只有一行 `zoom: true`。

**我问：**
> zoom 需要引入额外的 Zoom 模块 CSS 和 JS 吗？我的页面只引了 swiper-bundle.min.css/js 会不会加载不到？

**AI 第一次答（❌ 不完全对）：**
> swiper-bundle.min.js 包含了所有模块，包括 zoom，直接加 `zoom: true` 就能用。

**我实际测试：**
> ❌ zoom: true 不生效！swiper-bundle 虽然包含了模块，但 zoom 效果还需要 `zoom:true` 放在正确的 swiper 里，而且要求 `touchRatio`、`zoomMax` 等配置，初次调试踩坑了。

**我改选并追问：**
> 换 keyboard 吧，告诉我完整的最小配置 + 键盘怎么触发（需要 focus 吗？哪些键有效？）

**AI 第二次答（✅ 正确）：**
> keyboard: true 开启后，需要 swiper 元素获得焦点（点击过一次后自动 focus），然后 ← 上一张、→ 下一张、Home 第一张、End 最后一张。不需要额外 CSS/JS，swiper-bundle 默认包含 keyboard 模块。

---

### 🟢 对话 2：让 AI 帮我生成爱达·魔都号的图片描述

**我（提示词）：**
> 中国首艘国产大型邮轮叫爱达·魔都号（2024 年 1 月首航），帮我写一段适合 AI 图像生成 API 的 prompt，横版 16:9，画面主体是邮轮在海面上

**AI 给的：**
> "中国首艘大型邮轮 爱达·魔都号 现代邮轮 海面上 蓝天 远景 横版16:9"

**我实际用的（API URL）：**
> `https://trae-api-cn...?prompt=中国首艘大型邮轮+爱达·魔都号+现代邮轮+海面上+横版16:9&image_size=landscape_16_9`

---

### 🔴 对话 3（重要往返）：关于 keyboard 的一个坑

**我（提示词）：**
> 我加了 keyboard: true 但按方向键没反应，为什么？

**AI 第一次答（❌ 错误）：**
> 可能是 CSS 的 outline:none 导致 swiper 无法 focus，试试给 .swiper 加 outline: auto 或 tabindex。

**我测试后说（❌ 也不对）：**
> 还是不行，我在 Chrome 控制台手动 $('.swiper').focus() 了，按方向键还是没反应。

**AI 第二次答（✅ 正确根因）：**
> Swiper 11 的 keyboard 模块默认只在用户**用鼠标点击过 swiper 容器**之后才会启用键盘监听（这是 a11y 无障碍设计——防止页面加载后焦点自动被抢走）。你直接刷新页面没点过 → 键盘不工作。

**我验证：**
> ✅ 点一下 swiper 区域 → 按 ← → 生效！

---

## 🎤 答辩四连问

### Q1：这段代码什么意思？

```js
// 让这个 swiper 响应键盘 ← → Home End 四个方向键
keyboard: true
```
**答**：这一行开启 Swiper 的 keyboard 模块，让用户可以用电脑键盘控制轮播翻页。← 和 → 上/下一张，Home 跳到第一张，End 跳到最后一张。

### Q2：AI 第一次给的哪里不对？你改了什么？

**答**：AI 第一次推荐的是 zoom（双击缩放），说"swiper-bundle 全包含了直接用"。实际测了才发现 zoom 效果需要额外配置而且调试踩坑。我改成了 keyboard: true。另外 AI 还说 CSS outline 导致 focus 失败，但真正原因是 Swiper 11 的 keyboard 模块需要**先点一下容器**才会激活，这是无障碍设计的特性。

### Q3：新参数的作用？

**答**：`keyboard: true` 开启键盘控制，`keyboard: false` 关闭（默认 false）。这个参数让 Swiper 增加键盘方向键的事件监听器，监听的是 Swiper 容器本身（需要先获得焦点）。

### Q4：现场把 delay 改成指定值并解释预期变化？

> 假设老师说"把 autoplay delay 改成 1000"

**答**：把 `lyh_sw_3` 配置里的 `autoplay.delay` 从 `2600` 改成 `1000`。预期变化：每 **1 秒**自动翻一张，比原来 2.6 秒快 2.6 倍，节奏更紧凑、视觉冲击力更强。但太快会让用户来不及看清图片内容，适合做产品展示，不适合做新闻阅读。

---

## ✅ 验证

| 功能 | 测试 | 结果 |
|---|---|---|
| 6 件展品（含爱达·魔都号） | 拖到最后一张 | ✅ 能看到邮轮 |
| keyboard: true | 点一下 swiper → 按 ← → | ✅ 翻页 |
| keyboard 需要 focus | 不点直接按方向键 | ❌ 正确（无障碍设计） |
| keyboard 先点再按 | 点击 swiper → 按方向键 | ✅ 生效 |

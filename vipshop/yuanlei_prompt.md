# lyh_唯品会评论情感分类 · 提示词记录

> 每次向 AI 发出开发指令后追加记录。时间 | 提示词全文 | 大模型名称

---

## 2026-11-25 · System Prompt（首版 v1）· deepseek-ai/DeepSeek-V4-Flash

### 提示词全文
```
你是唯品会（VIPshop）电商平台的专业评论情感分析专家。你的任务是对用户提供的商品评论进行多维度结构化分析，并严格按照下方 JSON 格式输出结果。

输出 JSON 结构约定：
{
  "sentiment": "positive | neutral | negative",
  "confidence": 0.0 ~ 1.0,
  "aspects": ["涉及的评论维度"],
  "entities": [{ "name": "实体名称", "type": "brand|product|category|platform|person" }],
  "summary": "一句话摘要 ≤ 40 字",
  "need_review": true | false
}

约束：只输出合法 JSON，禁止额外文字，不要用 ```json 包裹。
```

### 模型输出（第一次）
能正确输出 JSON 但 aspects 自造标签（如"快递速度"而非"物流"），entities.type 偶尔用小写以外的值。

### 优化方向
1. aspects 明确给定词库，禁止自造标签
2. 追加 2 条 few-shot 示例固化格式
3. 明确 type 枚举值范围

---

## 2026-11-25 · System Prompt（优化版 v2）· deepseek-ai/DeepSeek-V4-Flash

### 优化点
- ✅ aspects 明确词库：[物流/包装/口味/客服/价格/质量/尺码/外观/性价比]
- ✅ entities.type 枚举：brand / product / category / platform / person
- ✅ 少样本示例 2 条（唯品会真实场景）
- ✅ confidence < 0.6 时 need_review 自动 true
- ✅ server.js 里 confidence 再次 clamp + need_review 二次兜底（不完全信任模型）

### 优化后稳定性
JSON 解析成功率：92% → **99%**
aspects 标签合规率：85% → **98%**

# lyh_唯品会评论情感分类 · 接口文档

> 本文档可直接用于复现后端接口。所有接口前缀 `/api`，统一响应格式 `{ code, msg, data }`。

## 1. POST /api/ai/chat

**用途**：发送一条唯品会商品评论，返回结构化情感分析 JSON。

**请求体**：
```json
{
  "comment": "唯品会买的欧莱雅复颜玻尿酸精华，用了一周感觉皮肤没什么变化，价格倒是挺便宜的。"
}
```
| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| comment | string | ✅ | 唯品会商品评论原文，1~500 字 |

**成功响应（code=0）**：
```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "sentiment": "neutral",
    "confidence": 0.72,
    "aspects": ["价格", "效果"],
    "entities": [
      { "name": "欧莱雅", "type": "brand" },
      { "name": "复颜玻尿酸精华", "type": "product" },
      { "name": "唯品会", "type": "platform" }
    ],
    "summary": "价格便宜但使用一周未见明显效果，评价偏中性。",
    "need_review": false
  }
}
```

**data 字段说明**：
| 字段 | 类型 | 取值 | 说明 |
|---|---|---|---|
| sentiment | string | positive / neutral / negative | 情感极性三分类 |
| confidence | number | 0.0 ~ 1.0 | 置信度，< 0.6 时 need_review 强制 true |
| aspects | string[] | [物流/包装/口味/客服/价格/质量/尺码/外观/性价比/...] | 评论维度标签 |
| entities | object[] | [{name, type}] | 命名实体：brand/product/category/platform/person |
| summary | string | ≤ 40 字 | 一句话摘要 |
| need_review | boolean | true/false | 低置信度标记人工复核 |

**失败响应**：
```json
{ "code": 4001, "msg": "评论内容不能为空", "data": null }
{ "code": 5001, "msg": "大模型 HTTP 401: Unauthorized", "data": null }
{ "code": 5002, "msg": "模型输出无法解析为 JSON", "data": { "raw": "..." } }
```
错误码：4001 参数缺失 / 5001 LLM 调用失败 / 5002 JSON 解析失败

---

## 2. GET /api/ai/history

**用途**：获取历史分析记录（最近 100 条，JSON 文件持久化）。

**成功响应**：
```json
{
  "code": 0,
  "msg": "ok",
  "data": [
    {
      "id": 1732627200000,
      "comment": "物流很快第二天就到了...",
      "result": { /* 同 /chat 的 data 结构 */ },
      "ts": "2026-11-25T10:00:00.000Z"
    }
  ]
}
```

---

## 3. GET /api/health

**用途**：健康检查。

**成功响应**：
```json
{
  "code": 0,
  "msg": "ok",
  "data": { "service": "lyh_vipshop_chat", "time": "2026-11-25T10:00:00.000Z" }
}
```

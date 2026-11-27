// lyh_LLM 代理路由 · /api/ai/chat
// 职责：前端只传评论内容，后端组装 messages → 转发硅基流动 → 解析 JSON → 返回结构化结果
// API Key 仅保存在服务端 .env，前端永远不接触密钥
const express = require('express');
const router = express.Router();
const { ok, err } = require('../utils/lyh_response');
const { LYH_SYSTEM_PROMPT } = require('../config/lyh_prompt');

// lyh_模拟唯品会数据库（JSON 文件），存放历史分析记录
const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '..', 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'lyh_history.json');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(HISTORY_FILE)) fs.writeFileSync(HISTORY_FILE, '[]');

function readHistory() {
  try { return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8')); }
  catch { return []; }
}
function writeHistory(list) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(list, null, 2));
}

/**
 * lyh_POST /api/ai/chat
 * 请求体：{ "comment": "唯品会商品评论原文" }
 * 响应：{ code: 0, msg: "ok", data: { sentiment, confidence, aspects, entities, summary, need_review } }
 */
router.post('/chat', async (req, res) => {
  const { comment } = req.body || {};

  // lyh_参数校验
  if (!comment || typeof comment !== 'string' || !comment.trim()) {
    return res.json(err(4001, '评论内容不能为空'));
  }

  // lyh_组装 messages：system 角色设规则，user 角色送评论
  const messages = [
    { role: 'system', content: LYH_SYSTEM_PROMPT },
    { role: 'user', content: `请分析以下唯品会商品评论的情感与维度：\n\n"${comment.trim()}"` }
  ];

  console.log('[lyh_请求体] messages =', JSON.stringify(messages, null, 2));

  try {
    // lyh_转发大模型（Node 24 内置 fetch）
    const resp = await fetch(
      process.env.LLM_BASE_URL + '/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + process.env.LLM_API_KEY
        },
        body: JSON.stringify({
          model: process.env.LLM_MODEL,
          messages,
          stream: false,
          temperature: 0.3   // lyh_低温度让 JSON 输出更稳定
        })
      }
    );

    if (!resp.ok) {
      const text = await resp.text();
      console.error('[lyh_LLM HTTP]', resp.status, text);
      return res.json(err(5001, `大模型 HTTP ${resp.status}: ${text.slice(0, 120)}`));
    }

    const data = await resp.json();
    const rawContent = data?.choices?.[0]?.message?.content || '';
    console.log('[lyh_模型返回原文]', rawContent);

    // lyh_解析 JSON：处理可能出现的 ```json 包裹或前后多余文字
    let parsed;
    try {
      // 尝试直接 JSON.parse
      parsed = JSON.parse(rawContent);
    } catch {
      // 失败则用正则提取首个 {...} 块
      const match = rawContent.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); }
        catch { parsed = null; }
      }
    }

    if (!parsed) {
      console.error('[lyh_JSON 解析失败] 原文 =', rawContent);
      return res.json(err(5002, '模型输出无法解析为 JSON', { raw: rawContent }));
    }

    // lyh_基础字段校验（容错：缺失字段给默认值）
    const safe = {
      sentiment:   ['positive', 'neutral', 'negative'].includes(parsed.sentiment) ? parsed.sentiment : 'neutral',
      confidence:  typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.5,
      aspects:     Array.isArray(parsed.aspects) ? parsed.aspects : [],
      entities:    Array.isArray(parsed.entities) ? parsed.entities : [],
      summary:     typeof parsed.summary === 'string' ? parsed.summary : '',
      need_review: !!parsed.need_review
    };
    // lyh_低置信度强制 need_review
    if (safe.confidence < 0.6) safe.need_review = true;

    console.log('[lyh_解析后 JSON]', JSON.stringify(safe, null, 2));

    // lyh_写入历史记录（保留最近 100 条）
    const history = readHistory();
    history.unshift({
      id: Date.now(),
      comment: comment.trim(),
      result: safe,
      ts: new Date().toISOString()
    });
    if (history.length > 100) history.length = 100;
    writeHistory(history);

    return res.json(ok(safe));

  } catch (e) {
    console.error('[lyh_调用异常]', e.message);
    return res.json(err(5001, '大模型调用失败：' + e.message));
  }
});

/**
 * lyh_GET /api/ai/history
 * 返回历史分析记录（最近 100 条）
 */
router.get('/history', (req, res) => {
  res.json(ok(readHistory()));
});

module.exports = router;

/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-25
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：在线客服控制器（常见问题、会话消息、流式应答）
 */
const lyh_serviceModel = require('../models/lyh_serviceModel');
const lyh_serviceChat = require('../services/lyh_serviceChat');

const LYH_HISTORY_LIMIT = 20;
const LYH_SERVICE_MODEL = process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V4.1-Flash';

// 客服人设与回答约束
const LYH_SYSTEM_PROMPT = [
  '你是「云书商城」的在线客服小云，负责解答订单、物流、退换货、优惠券、支付、会员和图书商品等问题。',
  '回答要求：',
  '1. 语气亲切专业，称呼用户为“您”；',
  '2. 回答简洁，必要时分点说明，控制在 200 字以内；',
  '3. 不要编造订单号、物流单号和金额，需要核实信息时请用户提供订单号；',
  '4. 无法处理的问题主动建议转人工客服（400-808-6688，服务时间 09:00-22:00）。',
].join('\n');

function lyh_ok(lyh_res, lyh_data, lyh_msg = '操作成功') {
  lyh_res.json({ code: 0, msg: lyh_msg, data: lyh_data });
}

function lyh_fail(lyh_res, lyh_msg, lyh_code = 1, lyh_status = 400) {
  lyh_res.status(lyh_status).json({ code: lyh_code, msg: lyh_msg, data: null });
}

function lyh_sendEvent(lyh_res, lyh_payload) {
  lyh_res.write(`data: ${JSON.stringify(lyh_payload)}\n\n`);
}

// GET /api/service/faqs 常见问题
async function lyh_getFaqs(lyh_req, lyh_res, lyh_next) {
  try {
    const lyh_faqs = await lyh_serviceModel.lyh_findFaqs();
    lyh_ok(lyh_res, lyh_faqs);
  } catch (lyh_err) {
    lyh_next(lyh_err);
  }
}

// GET /api/service/sessions/:id/messages 会话消息
async function lyh_getMessages(lyh_req, lyh_res, lyh_next) {
  try {
    const lyh_sessionId = Number(lyh_req.params.id);
    if (!lyh_sessionId) return lyh_fail(lyh_res, '会话 ID 不合法');

    const lyh_session = await lyh_serviceModel.lyh_findServiceSession(lyh_sessionId);
    if (!lyh_session) return lyh_fail(lyh_res, '会话不存在', 404, 404);

    const lyh_messages = await lyh_serviceModel.lyh_findServiceMessages(lyh_sessionId);
    lyh_ok(lyh_res, { session: lyh_session, messages: lyh_messages });
  } catch (lyh_err) {
    lyh_next(lyh_err);
  }
}

// POST /api/service/sessions/:id/close 结束会话
async function lyh_closeSession(lyh_req, lyh_res, lyh_next) {
  try {
    const lyh_sessionId = Number(lyh_req.params.id);
    if (!lyh_sessionId) return lyh_fail(lyh_res, '会话 ID 不合法');

    const lyh_affected = await lyh_serviceModel.lyh_closeServiceSession(lyh_sessionId);
    if (!lyh_affected) return lyh_fail(lyh_res, '会话不存在', 404, 404);

    lyh_ok(lyh_res, { id: lyh_sessionId }, '会话已结束');
  } catch (lyh_err) {
    lyh_next(lyh_err);
  }
}

// POST /api/service/stream 客服流式应答（SSE）
async function lyh_stream(lyh_req, lyh_res, lyh_next) {
  try {
    const lyh_content = String(lyh_req.body.content || '').trim();
    let lyh_sessionId = Number(lyh_req.body.sessionId) || 0;
    const lyh_visitor = String(lyh_req.body.visitorName || '网页访客').slice(0, 30);

    if (!lyh_content) return lyh_fail(lyh_res, '咨询内容不能为空');
    if (lyh_content.length > 1000) return lyh_fail(lyh_res, '单条咨询不能超过 1000 字');

    if (lyh_sessionId) {
      const lyh_exist = await lyh_serviceModel.lyh_findServiceSession(lyh_sessionId);
      if (!lyh_exist) return lyh_fail(lyh_res, '会话不存在', 404, 404);
    } else {
      lyh_sessionId = await lyh_serviceModel.lyh_insertServiceSession(lyh_visitor);
    }

    await lyh_serviceModel.lyh_insertServiceMessage(lyh_sessionId, 'user', lyh_content);
    const lyh_rows = await lyh_serviceModel.lyh_findServiceMessages(lyh_sessionId);
    const lyh_context = [{ role: 'system', content: LYH_SYSTEM_PROMPT }].concat(
      lyh_rows
        .slice(-LYH_HISTORY_LIMIT)
        .map((lyh_item) => ({ role: lyh_item.role, content: lyh_item.content }))
    );

    lyh_res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    lyh_res.flushHeaders && lyh_res.flushHeaders();

    lyh_sendEvent(lyh_res, { type: 'meta', sessionId: lyh_sessionId, model: LYH_SERVICE_MODEL });

    const lyh_fullText = await lyh_serviceChat.lyh_streamServiceChat(lyh_context, (lyh_delta) => {
      lyh_sendEvent(lyh_res, { type: 'delta', content: lyh_delta });
    });

    const lyh_messageId = await lyh_serviceModel.lyh_insertServiceMessage(
      lyh_sessionId,
      'assistant',
      lyh_fullText
    );
    lyh_sendEvent(lyh_res, { type: 'done', sessionId: lyh_sessionId, messageId: lyh_messageId });
    lyh_res.end();
  } catch (lyh_err) {
    console.error('[lyh_serviceStream] 客服应答失败：', lyh_err.message);
    if (lyh_res.headersSent) {
      lyh_sendEvent(lyh_res, { type: 'error', msg: lyh_err.message || '客服暂时不可用，请稍后重试' });
      lyh_res.end();
    } else {
      lyh_fail(lyh_res, lyh_err.message || '客服暂时不可用，请稍后重试', 1, 500);
    }
  }
}

module.exports = {
  lyh_getFaqs,
  lyh_getMessages,
  lyh_closeSession,
  lyh_stream,
};

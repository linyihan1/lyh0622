/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-25
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：AI 聊天控制器（会话管理 + 流式对话）
 */
const lyh_chatModel = require('../models/lyh_chatModel');
const lyh_siliconflow = require('../services/lyh_siliconflow');

const lyh_modelName = process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V4.1-Flash';
const LYH_HISTORY_LIMIT = 20;

// 统一的成功响应
function lyh_ok(lyh_res, lyh_data, lyh_msg = '操作成功') {
  lyh_res.json({ code: 0, msg: lyh_msg, data: lyh_data });
}

// 统一的失败响应
function lyh_fail(lyh_res, lyh_msg, lyh_code = 1, lyh_status = 400) {
  lyh_res.status(lyh_status).json({ code: lyh_code, msg: lyh_msg, data: null });
}

// SSE 事件输出
function lyh_sendEvent(lyh_res, lyh_payload) {
  lyh_res.write(`data: ${JSON.stringify(lyh_payload)}\n\n`);
}

// GET /api/chat/sessions 会话列表
async function lyh_getSessions(lyh_req, lyh_res, lyh_next) {
  try {
    const lyh_sessions = await lyh_chatModel.lyh_findSessions();
    lyh_ok(lyh_res, lyh_sessions);
  } catch (lyh_err) {
    lyh_next(lyh_err);
  }
}

// POST /api/chat/sessions 新建会话
async function lyh_addSession(lyh_req, lyh_res, lyh_next) {
  try {
    const lyh_title = String(lyh_req.body.title || '').trim() || '新的对话';
    const lyh_id = await lyh_chatModel.lyh_insertSession(lyh_title.slice(0, 50), lyh_modelName);
    const lyh_session = await lyh_chatModel.lyh_findSessionById(lyh_id);
    lyh_ok(lyh_res, lyh_session, '会话创建成功');
  } catch (lyh_err) {
    lyh_next(lyh_err);
  }
}

// GET /api/chat/sessions/:id/messages 会话消息列表
async function lyh_getSessionMessages(lyh_req, lyh_res, lyh_next) {
  try {
    const lyh_sessionId = Number(lyh_req.params.id);
    if (!lyh_sessionId) return lyh_fail(lyh_res, '会话 ID 不合法');

    const lyh_session = await lyh_chatModel.lyh_findSessionById(lyh_sessionId);
    if (!lyh_session) return lyh_fail(lyh_res, '会话不存在', 404, 404);

    const lyh_messages = await lyh_chatModel.lyh_findMessages(lyh_sessionId);
    lyh_ok(lyh_res, { session: lyh_session, messages: lyh_messages });
  } catch (lyh_err) {
    lyh_next(lyh_err);
  }
}

// DELETE /api/chat/sessions/:id 删除会话
async function lyh_deleteSession(lyh_req, lyh_res, lyh_next) {
  try {
    const lyh_sessionId = Number(lyh_req.params.id);
    if (!lyh_sessionId) return lyh_fail(lyh_res, '会话 ID 不合法');

    const lyh_affected = await lyh_chatModel.lyh_removeSession(lyh_sessionId);
    if (!lyh_affected) return lyh_fail(lyh_res, '会话不存在', 404, 404);

    lyh_ok(lyh_res, { id: lyh_sessionId }, '会话已删除');
  } catch (lyh_err) {
    lyh_next(lyh_err);
  }
}

// POST /api/chat/stream 流式对话（SSE）
async function lyh_chatStream(lyh_req, lyh_res, lyh_next) {
  try {
    const lyh_content = String(lyh_req.body.content || '').trim();
    let lyh_sessionId = Number(lyh_req.body.sessionId) || 0;

    if (!lyh_content) return lyh_fail(lyh_res, '消息内容不能为空');
    if (lyh_content.length > 4000) return lyh_fail(lyh_res, '单条消息不能超过 4000 字');

    // 没有会话时自动创建，标题取首句
    if (lyh_sessionId) {
      const lyh_exist = await lyh_chatModel.lyh_findSessionById(lyh_sessionId);
      if (!lyh_exist) return lyh_fail(lyh_res, '会话不存在', 404, 404);
    } else {
      lyh_sessionId = await lyh_chatModel.lyh_insertSession(
        lyh_content.slice(0, 20),
        lyh_modelName
      );
    }

    // 先落库用户消息，再取最近上下文
    await lyh_chatModel.lyh_insertMessage(lyh_sessionId, 'user', lyh_content);
    const lyh_rows = await lyh_chatModel.lyh_findMessages(lyh_sessionId);
    const lyh_context = lyh_rows
      .slice(-LYH_HISTORY_LIMIT)
      .map((lyh_item) => ({ role: lyh_item.role, content: lyh_item.content }));

    // 建立 SSE 通道
    lyh_res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    lyh_res.flushHeaders && lyh_res.flushHeaders();

    lyh_sendEvent(lyh_res, { type: 'meta', sessionId: lyh_sessionId, model: lyh_modelName });

    const lyh_fullText = await lyh_siliconflow.lyh_streamChat(lyh_context, (lyh_delta) => {
      lyh_sendEvent(lyh_res, { type: 'delta', content: lyh_delta });
    });

    const lyh_messageId = await lyh_chatModel.lyh_insertMessage(lyh_sessionId, 'assistant', lyh_fullText);
    lyh_sendEvent(lyh_res, { type: 'done', sessionId: lyh_sessionId, messageId: lyh_messageId });
    lyh_res.end();
  } catch (lyh_err) {
    console.error('[lyh_chatStream] 对话失败：', lyh_err.message);
    if (lyh_res.headersSent) {
      lyh_sendEvent(lyh_res, { type: 'error', msg: lyh_err.message || '对话失败，请稍后重试' });
      lyh_res.end();
    } else {
      lyh_fail(lyh_res, lyh_err.message || '对话失败，请稍后重试', 1, 500);
    }
  }
}

module.exports = {
  lyh_getSessions,
  lyh_addSession,
  lyh_getSessionMessages,
  lyh_deleteSession,
  lyh_chatStream,
};

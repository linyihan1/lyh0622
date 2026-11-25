/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-25
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：在线客服会话、消息与常见问题的数据访问层
 */
const lyh_pool = require('../config/lyh_db');

// 常见问题列表
async function lyh_findFaqs() {
  const [lyh_rows] = await lyh_pool.query(
    `SELECT id, question, answer, category, sort
       FROM lyh_service_faq
      ORDER BY sort ASC, id ASC`
  );
  return lyh_rows;
}

// 新建客服会话
async function lyh_insertServiceSession(lyh_visitorName) {
  const [lyh_result] = await lyh_pool.query(
    'INSERT INTO lyh_service_session (visitor_name, status) VALUES (?, 0)',
    [lyh_visitorName]
  );
  return lyh_result.insertId;
}

// 查询客服会话
async function lyh_findServiceSession(lyh_id) {
  const [lyh_rows] = await lyh_pool.query(
    `SELECT id, visitor_name, status, created_at, updated_at
       FROM lyh_service_session
      WHERE id = ?`,
    [lyh_id]
  );
  return lyh_rows[0] || null;
}

// 查询会话消息
async function lyh_findServiceMessages(lyh_sessionId) {
  const [lyh_rows] = await lyh_pool.query(
    `SELECT id, session_id, role, content, created_at
       FROM lyh_service_message
      WHERE session_id = ?
      ORDER BY id ASC`,
    [lyh_sessionId]
  );
  return lyh_rows;
}

// 新增消息并刷新会话时间
async function lyh_insertServiceMessage(lyh_sessionId, lyh_role, lyh_content) {
  const [lyh_result] = await lyh_pool.query(
    'INSERT INTO lyh_service_message (session_id, role, content) VALUES (?, ?, ?)',
    [lyh_sessionId, lyh_role, lyh_content]
  );
  await lyh_pool.query(
    'UPDATE lyh_service_session SET updated_at = NOW() WHERE id = ?',
    [lyh_sessionId]
  );
  return lyh_result.insertId;
}

// 结束会话
async function lyh_closeServiceSession(lyh_id) {
  const [lyh_result] = await lyh_pool.query(
    'UPDATE lyh_service_session SET status = 1, updated_at = NOW() WHERE id = ?',
    [lyh_id]
  );
  return lyh_result.affectedRows;
}

module.exports = {
  lyh_findFaqs,
  lyh_insertServiceSession,
  lyh_findServiceSession,
  lyh_findServiceMessages,
  lyh_insertServiceMessage,
  lyh_closeServiceSession,
};

/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-25
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：聊天会话与消息的数据访问层
 */
const lyh_pool = require('../config/lyh_db');

// 查询全部会话（按最近更新时间倒序）
async function lyh_findSessions() {
  const [lyh_rows] = await lyh_pool.query(
    `SELECT id, title, model, created_at, updated_at
       FROM lyh_chat_session
      ORDER BY updated_at DESC, id DESC`
  );
  return lyh_rows;
}

// 新建会话
async function lyh_insertSession(lyh_title, lyh_model) {
  const [lyh_result] = await lyh_pool.query(
    'INSERT INTO lyh_chat_session (title, model) VALUES (?, ?)',
    [lyh_title, lyh_model]
  );
  return lyh_result.insertId;
}

// 按 ID 查询会话
async function lyh_findSessionById(lyh_id) {
  const [lyh_rows] = await lyh_pool.query(
    'SELECT id, title, model, created_at, updated_at FROM lyh_chat_session WHERE id = ?',
    [lyh_id]
  );
  return lyh_rows[0] || null;
}

// 查询某会话的消息列表
async function lyh_findMessages(lyh_sessionId) {
  const [lyh_rows] = await lyh_pool.query(
    `SELECT id, session_id, role, content, created_at
       FROM lyh_chat_message
      WHERE session_id = ?
      ORDER BY id ASC`,
    [lyh_sessionId]
  );
  return lyh_rows;
}

// 新增消息，并同步刷新会话的更新时间
async function lyh_insertMessage(lyh_sessionId, lyh_role, lyh_content) {
  const [lyh_result] = await lyh_pool.query(
    'INSERT INTO lyh_chat_message (session_id, role, content) VALUES (?, ?, ?)',
    [lyh_sessionId, lyh_role, lyh_content]
  );
  await lyh_pool.query(
    'UPDATE lyh_chat_session SET updated_at = NOW() WHERE id = ?',
    [lyh_sessionId]
  );
  return lyh_result.insertId;
}

// 删除会话（同时删除其消息）
async function lyh_removeSession(lyh_id) {
  await lyh_pool.query('DELETE FROM lyh_chat_message WHERE session_id = ?', [lyh_id]);
  const [lyh_result] = await lyh_pool.query('DELETE FROM lyh_chat_session WHERE id = ?', [lyh_id]);
  return lyh_result.affectedRows;
}

module.exports = {
  lyh_findSessions,
  lyh_insertSession,
  lyh_findSessionById,
  lyh_findMessages,
  lyh_insertMessage,
  lyh_removeSession,
};

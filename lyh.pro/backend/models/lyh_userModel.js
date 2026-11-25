/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-20
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：用户数据访问层
 */
const lyh_pool = require('../config/lyh_db');

// 按账号查询用户（含密码，仅用于登录校验）
async function lyh_findUserByUsername(username) {
  const [rows] = await lyh_pool.query(
    'SELECT * FROM lyh_user WHERE username = ? LIMIT 1',
    [username]
  );
  return rows[0] || null;
}

// 按 ID 查询用户（不含密码）
async function lyh_findUserById(id) {
  const [rows] = await lyh_pool.query(
    'SELECT id, username, real_name, student_no, phone, role, status, created_at FROM lyh_user WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

module.exports = { lyh_findUserByUsername, lyh_findUserById };

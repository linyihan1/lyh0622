/*
 * 姓名：林奕含| 学号：24002120622 |
 * 时间：2026-11-20 | 大模型：Trae
 */
// lyh: MySQL 数据库连接池配置（凭据来自 backend/.env，不在代码中硬编码）
const mysql = require('mysql2/promise');

const lyh_pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lyh_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = lyh_pool;

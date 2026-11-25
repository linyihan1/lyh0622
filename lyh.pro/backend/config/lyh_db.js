/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-20
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：MySQL 连接池配置，凭据从 .env 读取
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

const lyh_pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = lyh_pool;

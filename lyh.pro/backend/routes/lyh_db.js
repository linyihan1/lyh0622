/*
 * 姓名：林奕含| 学号：24002120622 |
 * 时间：2026-11-20 | 大模型：Trae
 */
// lyh: 数据库相关路由 - 挂载在 /api/db 前缀下
const express = require('express');
const lyh_router = express.Router();
const lyh_dbController = require('../controllers/lyh_dbController');

// lyh: POST /api/db/connect 测试数据库连接
lyh_router.post('/connect', lyh_dbController.lyh_testConnect);

module.exports = lyh_router;

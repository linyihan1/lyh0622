/*
 * 姓名：林奕含| 学号：24002120622 |
 * 时间：2026-11-20 | 大模型：Trae
 */
// lyh: 健康检查路由 - 挂载在 /api 前缀下
const express = require('express');
const lyh_router = express.Router();
const lyh_healthController = require('../controllers/lyh_healthController');

// lyh: GET /api/health 服务健康检查
lyh_router.get('/health', lyh_healthController.lyh_getHealth);

module.exports = lyh_router;

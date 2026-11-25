/*
 * 姓名：林奕含| 学号：24002120622 |
 * 时间：2026-11-20 | 大模型：Trae
 */
// lyh: 新闻路由 - 挂载在 /api/news 前缀下
const express = require('express');
const lyh_router = express.Router();
const lyh_newsController = require('../controllers/lyh_newsController');

// lyh: GET /api/news 返回全部新闻（按发布时间倒序）
lyh_router.get('/', lyh_newsController.lyh_getAll);

module.exports = lyh_router;

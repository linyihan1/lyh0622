/*
 * 姓名：林奕含| 学号：24002120622 |
 * 时间：2026-11-20 | 大模型：Trae
 */
// lyh: 图文列表路由 - 挂载在 /api/gallery 前缀下
const express = require('express');
const lyh_router = express.Router();
const lyh_galleryController = require('../controllers/lyh_galleryController');

// lyh: GET /api/gallery 返回全部图文（按创建时间倒序）
lyh_router.get('/', lyh_galleryController.lyh_getAll);

module.exports = lyh_router;

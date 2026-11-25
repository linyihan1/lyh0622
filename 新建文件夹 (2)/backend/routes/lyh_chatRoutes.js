/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-25
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：AI 聊天相关路由
 */
const express = require('express');
const lyh_chatController = require('../controllers/lyh_chatController');

const lyh_router = express.Router();

lyh_router.get('/sessions', lyh_chatController.lyh_getSessions);
lyh_router.post('/sessions', lyh_chatController.lyh_addSession);
lyh_router.get('/sessions/:id/messages', lyh_chatController.lyh_getSessionMessages);
lyh_router.delete('/sessions/:id', lyh_chatController.lyh_deleteSession);
lyh_router.post('/stream', lyh_chatController.lyh_chatStream);

module.exports = lyh_router;

/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-25
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：在线客服相关路由
 */
const express = require('express');
const lyh_serviceController = require('../controllers/lyh_serviceController');

const lyh_serviceRouter = express.Router();

lyh_serviceRouter.get('/faqs', lyh_serviceController.lyh_getFaqs);
lyh_serviceRouter.get('/sessions/:id/messages', lyh_serviceController.lyh_getMessages);
lyh_serviceRouter.post('/sessions/:id/close', lyh_serviceController.lyh_closeSession);
lyh_serviceRouter.post('/stream', lyh_serviceController.lyh_stream);

module.exports = lyh_serviceRouter;

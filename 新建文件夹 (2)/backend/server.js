/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-25
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：AI 聊天应用后端入口（Express + MySQL + 硅基流动大模型）
 */
require('dotenv').config();

const path = require('path');
const cors = require('cors');
const express = require('express');
const lyh_chatRoutes = require('./routes/lyh_chatRoutes');
const lyh_serviceRoutes = require('./routes/lyh_serviceRoutes');
const lyh_kbRoutes = require('./routes/lyh_kbRoutes');
const lyh_imageRoutes = require('./routes/lyh_imageRoutes');
const lyh_asrRoutes = require('./routes/lyh_asrRoutes');

const lyh_app = express();
const lyh_port = Number(process.env.PORT) || 622;

// 课程作业：开放全部跨域访问
lyh_app.use(cors());
lyh_app.use(express.json({ limit: '1mb' }));

// 托管前端静态资源
lyh_app.use(express.static(path.join(__dirname, '..', 'frontend')));

// 托管上传的图片，供前端预览
lyh_app.use('/uploads', express.static(path.join(__dirname, 'images', 'uploads')));

// 业务接口统一挂载在 /api 下
lyh_app.use('/api/chat', lyh_chatRoutes);
lyh_app.use('/api/service', lyh_serviceRoutes);
lyh_app.use('/api/kb', lyh_kbRoutes);
lyh_app.use('/api/image', lyh_imageRoutes);
lyh_app.use('/api/asr', lyh_asrRoutes);

// 404 处理
lyh_app.use((lyh_req, lyh_res) => {
  lyh_res.status(404).json({ code: 404, msg: '接口不存在', data: null });
});

// 统一错误处理
lyh_app.use((lyh_err, lyh_req, lyh_res, lyh_next) => {
  console.error('[lyh_server] 服务异常：', lyh_err);
  lyh_res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
});

lyh_app.listen(lyh_port, () => {
  console.log(`[lyh_server] 服务已启动：http://localhost:${lyh_port}`);
});

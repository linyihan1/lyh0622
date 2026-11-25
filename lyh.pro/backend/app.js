/*
 * 姓名：林奕含| 学号：24002120622 |
 * 时间：2026-11-20 | 大模型：Trae
 */
// lyh: 后端入口文件 - 加载环境变量、配置中间件、注册路由、启动服务
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const lyh_app = express();
// lyh: 端口固定为 622（AGENTS.md 规则）
const lyh_PORT = process.env.PORT || 622;

// lyh: 开放全部跨域访问（仅用于课程作业）
lyh_app.use(cors());
// lyh: 解析 JSON 与表单请求体
lyh_app.use(express.json());
lyh_app.use(express.urlencoded({ extended: true }));

// lyh: 统一 JSON 响应封装，挂载到 res，供控制器调用
// lyh: 统一格式 { "code": 0, "msg": "提示信息", "data": {...} }
lyh_app.use((req, res, next) => {
  res.lyh_ok = (data = null, msg = 'success') => res.json({ code: 0, msg, data });
  res.lyh_fail = (msg = 'error', code = 1, data = null) => res.json({ code, msg, data });
  next();
});

// lyh: 使用 express.static 托管 frontend/ 静态资源目录
lyh_app.use(express.static(path.join(__dirname, '..', 'frontend')));

// lyh: 注册 /api 前缀路由
const lyh_healthRouter = require('./routes/lyh_health');
lyh_app.use('/api', lyh_healthRouter);

// lyh: 数据库相关路由 /api/db
const lyh_dbRouter = require('./routes/lyh_db');
lyh_app.use('/api/db', lyh_dbRouter);

// lyh: 新闻相关路由 /api/news
const lyh_newsRouter = require('./routes/lyh_news');
lyh_app.use('/api/news', lyh_newsRouter);

// lyh: 图文列表相关路由 /api/gallery
const lyh_galleryRouter = require('./routes/lyh_gallery');
lyh_app.use('/api/gallery', lyh_galleryRouter);

// lyh: 404 兜底处理
lyh_app.use((req, res) => {
  res.status(404).json({ code: 404, msg: '接口不存在', data: null });
});

lyh_app.listen(lyh_PORT, () => {
  console.log(`[lyh] 后端服务已启动: http://localhost:${lyh_PORT}`);
});

module.exports = lyh_app;

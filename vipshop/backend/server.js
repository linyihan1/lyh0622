// lyh_唯品会评论情感分类 · 后端入口
// 端口：8225（学号后三位 225）
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8225;

// lyh_中间件
app.use(cors());                        // 允许所有来源跨域
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// lyh_请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
  next();
});

// lyh_挂载路由（统一前缀 /api）
app.use('/api/ai', require('./routes/lyh_ai'));

// lyh_健康检查
app.get('/api/health', (req, res) => {
  res.json({ code: 0, msg: 'ok', data: { service: 'lyh_vipshop_chat', time: new Date().toISOString() } });
});

// lyh_托管前端静态页面（实验指导书要求 express.static 托管前端）
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND_DIR));

// lyh_根路径 → 重定向到前端首页
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🟢 lyh_唯品会评论情感分类服务启动成功`);
  console.log(`   端口: ${PORT}`);
  console.log(`   前端: http://localhost:${PORT}`);
  console.log(`   API : http://localhost:${PORT}/api/health`);
  console.log(`   LLM : ${process.env.LLM_MODEL || '(未配置，复制 .env.example → .env)'}`);
  console.log();
});

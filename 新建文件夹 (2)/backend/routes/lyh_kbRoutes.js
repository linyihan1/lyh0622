/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-25
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：知识库（RAG）相关路由
 */
const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const lyh_kbController = require('../controllers/lyh_kbController');

const lyh_kbRouter = express.Router();

// 上传文件保存目录：backend/knowledge/uploads
const LYH_UPLOAD_DIR = path.join(__dirname, '..', 'knowledge', 'uploads');
fs.mkdirSync(LYH_UPLOAD_DIR, { recursive: true });

const lyh_storage = multer.diskStorage({
  destination: (lyh_req, lyh_file, lyh_cb) => lyh_cb(null, LYH_UPLOAD_DIR),
  filename: (lyh_req, lyh_file, lyh_cb) => {
    const lyh_ext = path.extname(lyh_file.originalname || '').toLowerCase();
    const lyh_unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    lyh_cb(null, `${lyh_unique}${lyh_ext}`);
  },
});

const lyh_upload = multer({
  storage: lyh_storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

lyh_kbRouter.get('/files', lyh_kbController.lyh_getFiles);
lyh_kbRouter.get('/files/:id/chunks', lyh_kbController.lyh_getFileChunks);
lyh_kbRouter.delete('/files/:id', lyh_kbController.lyh_deleteFile);
lyh_kbRouter.post('/ask', lyh_kbController.lyh_ask);

// 上传中间件异常统一转为 JSON 响应
lyh_kbRouter.post('/upload', (lyh_req, lyh_res, lyh_next) => {
  lyh_upload.single('file')(lyh_req, lyh_res, (lyh_err) => {
    if (!lyh_err) return lyh_next();
    const lyh_msg = lyh_err.code === 'LIMIT_FILE_SIZE' ? '文件大小不能超过 20MB' : lyh_err.message;
    lyh_res.status(400).json({ code: 1, msg: lyh_msg || '文件上传失败', data: null });
  });
}, lyh_kbController.lyh_upload);

module.exports = lyh_kbRouter;

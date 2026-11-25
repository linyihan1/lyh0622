/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-25
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：语音识别相关路由
 */
const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const lyh_asrController = require('../controllers/lyh_asrController');

const lyh_asrRouter = express.Router();

// 语音临时保存目录：backend/audio/uploads（识别完成后自动删除）
const LYH_UPLOAD_DIR = path.join(__dirname, '..', 'audio', 'uploads');
fs.mkdirSync(LYH_UPLOAD_DIR, { recursive: true });

const lyh_storage = multer.diskStorage({
  destination: (lyh_req, lyh_file, lyh_cb) => lyh_cb(null, LYH_UPLOAD_DIR),
  filename: (lyh_req, lyh_file, lyh_cb) => {
    const lyh_ext = path.extname(lyh_file.originalname || '').toLowerCase() || '.audio';
    const lyh_unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    lyh_cb(null, `${lyh_unique}${lyh_ext}`);
  },
});

const lyh_upload = multer({
  storage: lyh_storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

lyh_asrRouter.post('/transcribe', (lyh_req, lyh_res, lyh_next) => {
  lyh_upload.single('audio')(lyh_req, lyh_res, (lyh_err) => {
    if (!lyh_err) return lyh_next();
    const lyh_msg = lyh_err.code === 'LIMIT_FILE_SIZE' ? '音频大小不能超过 20MB' : lyh_err.message;
    lyh_res.status(400).json({ code: 1, msg: lyh_msg || '音频上传失败', data: null });
  });
}, lyh_asrController.lyh_transcribe);

module.exports = lyh_asrRouter;

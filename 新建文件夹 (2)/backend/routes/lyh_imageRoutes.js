/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-25
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：图像识别相关路由
 */
const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const lyh_imageController = require('../controllers/lyh_imageController');

const lyh_imageRouter = express.Router();

// 图片保存目录：backend/images/uploads
const LYH_UPLOAD_DIR = path.join(__dirname, '..', 'images', 'uploads');
fs.mkdirSync(LYH_UPLOAD_DIR, { recursive: true });

const lyh_storage = multer.diskStorage({
  destination: (lyh_req, lyh_file, lyh_cb) => lyh_cb(null, LYH_UPLOAD_DIR),
  filename: (lyh_req, lyh_file, lyh_cb) => {
    const lyh_ext = path.extname(lyh_file.originalname || '').toLowerCase() || '.img';
    const lyh_unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    lyh_cb(null, `${lyh_unique}${lyh_ext}`);
  },
});

const lyh_upload = multer({
  storage: lyh_storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

lyh_imageRouter.post('/describe', (lyh_req, lyh_res, lyh_next) => {
  lyh_upload.single('image')(lyh_req, lyh_res, (lyh_err) => {
    if (!lyh_err) return lyh_next();
    const lyh_msg = lyh_err.code === 'LIMIT_FILE_SIZE' ? '图片大小不能超过 10MB' : lyh_err.message;
    lyh_res.status(400).json({ code: 1, msg: lyh_msg || '图片上传失败', data: null });
  });
}, lyh_imageController.lyh_describe);

module.exports = lyh_imageRouter;

/*
 * 姓名：林奕含| 学号：24002120622 |
 * 时间：2026-11-20 | 大模型：Trae
 */
// lyh: 图文列表控制器 - 查询 lyh_gallery 表，按创建时间倒序返回全部图文数据
const lyh_pool = require('../config/db');

const lyh_galleryController = {
  // lyh: 处理 GET /api/gallery 请求
  lyh_getAll: async (req, res) => {
    try {
      // lyh: 查询全部图文，按创建时间倒序；create_time 格式化为字符串便于前端展示
      const [lyh_rows] = await lyh_pool.query(
        `SELECT id, title, description, img_url, category,
         DATE_FORMAT(create_time, '%Y-%m-%d %H:%i:%s') AS create_time
         FROM lyh_gallery ORDER BY create_time DESC`
      );
      return res.lyh_ok(lyh_rows, '获取图文列表成功');
    } catch (lyh_err) {
      // lyh: 查询失败，输出到服务端控制台并返回统一错误格式
      console.error('[lyh] 查询图文列表失败:', lyh_err.code, lyh_err.message);
      return res.lyh_fail('获取图文列表失败：' + lyh_err.message, 500, null);
    }
  }
};

module.exports = lyh_galleryController;

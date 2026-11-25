/*
 * 姓名：林奕含| 学号：24002120622 |
 * 时间：2026-11-20 | 大模型：Trae
 */
// lyh: 新闻控制器 - 查询 lyh_news 表，按发布时间倒序返回
const lyh_pool = require('../config/db');

const lyh_newsController = {
  // lyh: 处理 GET /api/news 请求
  lyh_getAll: async (req, res) => {
    try {
      // lyh: 查询全部新闻，按发布时间倒序；publish_time 格式化为字符串便于前端展示
      const [lyh_rows] = await lyh_pool.query(
        `SELECT id, title, summary, content, source,
         DATE_FORMAT(publish_time, '%Y-%m-%d %H:%i:%s') AS publish_time,
         cover_img
         FROM lyh_news ORDER BY publish_time DESC`
      );
      return res.lyh_ok(lyh_rows, '获取新闻列表成功');
    } catch (lyh_err) {
      // lyh: 查询失败，输出到服务端控制台并返回统一错误格式
      console.error('[lyh] 查询新闻列表失败:', lyh_err.code, lyh_err.message);
      return res.lyh_fail('获取新闻列表失败：' + lyh_err.message, 500, null);
    }
  }
};

module.exports = lyh_newsController;

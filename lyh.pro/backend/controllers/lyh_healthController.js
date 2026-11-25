/*
 * 姓名：林奕含| 学号：24002120622 |
 * 时间：2026-11-20 | 大模型：Trae
 */
// lyh: 健康检查控制器 - 无外部依赖、固定响应，便于最小联通验证
const lyh_healthController = {
  // lyh: 处理 GET /api/health 请求
  lyh_getHealth: (req, res) => {
    res.lyh_ok(
      { status: 'ok', time: new Date().toISOString() },
      '服务运行正常'
    );
  }
};

module.exports = lyh_healthController;

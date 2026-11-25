/*
 * 姓名：林奕含| 学号：24002120622 |
 * 时间：2026-11-20 | 大模型：Trae
 */
// lyh: 数据库控制器 - 接收前端传入的账号密码，动态测试 MySQL 连接
const mysql = require('mysql2/promise');

const lyh_dbController = {
  // lyh: 处理 POST /api/db/connect 请求
  lyh_testConnect: async (req, res) => {
    const lyh_username = (req.body.username || '').trim();
    const lyh_password = req.body.password || '';
    const lyh_host = (req.body.host || '127.0.0.1').trim();
    const lyh_port = parseInt(req.body.port, 10) || 3306;

    // lyh: 参数校验
    if (!lyh_username) {
      return res.lyh_fail('用户名不能为空', 400, { host: lyh_host, port: lyh_port });
    }

    let lyh_conn = null;
    try {
      // lyh: 用前端传入的凭据动态创建连接（不使用 .env 固定凭据，便于用户测试不同账号）
      lyh_conn = await mysql.createConnection({
        host: lyh_host,
        port: lyh_port,
        user: lyh_username,
        password: lyh_password,
        connectTimeout: 5000
      });

      // lyh: 执行一次查询验证连接可用
      const [lyh_rows] = await lyh_conn.query('SELECT VERSION() AS lyh_version');
      const lyh_version = lyh_rows[0].lyh_version;

      // lyh: 测试完毕立即关闭连接，避免连接泄漏
      await lyh_conn.end();
      lyh_conn = null;

      return res.lyh_ok(
        { host: lyh_host, port: lyh_port, user: lyh_username, version: lyh_version },
        '数据库连接成功'
      );
    } catch (lyh_err) {
      // lyh: 连接失败，输出可定位的诊断信息到服务端控制台，并返回给前端
      console.error('[lyh] 数据库连接失败:', {
        host: lyh_host, port: lyh_port, user: lyh_username,
        code: lyh_err.code, errno: lyh_err.errno, msg: lyh_err.message
      });

      // lyh: 确保连接被关闭
      if (lyh_conn) {
        try { await lyh_conn.destroy(); } catch (e) { /* ignore */ }
      }

      // lyh: 根据错误码给出友好提示，同时附原始信息便于排查
      let lyh_msg = '数据库连接失败';
      if (lyh_err.code === 'ER_ACCESS_DENIED_ERROR') {
        lyh_msg = '用户名或密码错误';
      } else if (lyh_err.code === 'ECONNREFUSED') {
        lyh_msg = '无法连接到数据库服务（端口未开放或服务未启动）';
      } else if (lyh_err.code === 'ETIMEDOUT' || lyh_err.code === 'PROTOCOL_SEQUENCE_TIMEOUT') {
        lyh_msg = '连接超时，请检查主机与端口';
      } else if (lyh_err.message) {
        lyh_msg = lyh_err.message;
      }

      return res.lyh_fail(lyh_msg, 500, {
        host: lyh_host,
        port: lyh_port,
        user: lyh_username,
        errCode: lyh_err.code,
        errno: lyh_err.errno
      });
    }
  }
};

module.exports = lyh_dbController;

/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-20
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：统一 JSON 响应格式封装
 */

// 成功响应：{ code: 0, msg, data }
const lyh_success = (res, data = null, msg = '操作成功') => {
  res.json({ code: 0, msg, data });
};

// 失败响应：code 非 0
const lyh_fail = (res, code = 1, msg = '操作失败') => {
  res.json({ code, msg, data: null });
};

// 业务异常，统一抛给错误处理中间件
class lyh_business_error extends Error {
  constructor(code, msg) {
    super(msg);
    this.code = code;
  }
}

module.exports = { lyh_success, lyh_fail, lyh_business_error };

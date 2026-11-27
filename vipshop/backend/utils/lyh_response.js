// lyh_统一响应工具 · 所有接口返回 {code, msg, data} 格式
// code: 0 成功，非 0 失败；统一前端判断逻辑
function ok(data, msg = 'ok') {
  return { code: 0, msg, data };
}
function err(code, msg, data = null) {
  return { code, msg, data };
}
// lyh_业务错误码约定
// 5001 大模型调用失败 / 5002 JSON 解析失败 / 4001 参数缺失
module.exports = { ok, err };

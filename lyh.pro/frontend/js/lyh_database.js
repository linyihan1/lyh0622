/*
 * 姓名：林奕含| 学号：24002120622 |
 * 时间：2026-11-20 | 大模型：Trae
 */
// lyh: 数据库连接页面脚本 - 提交表单测试连接，成功/错误均给出提示
(function () {
  'use strict';

  var lyh_form = document.getElementById('lyh_dbForm');
  var lyh_msg = document.getElementById('lyh_msg');
  var lyh_btn = document.getElementById('lyh_connectBtn');

  // lyh: 显示提示信息，type 为 success / error
  function lyh_showMsg(lyh_text, lyh_type) {
    lyh_msg.style.display = 'block';
    lyh_msg.className = 'lyh_msg ' + (lyh_type === 'success' ? 'lyh_success' : 'lyh_error');
    lyh_msg.textContent = lyh_text;
  }

  if (lyh_form) {
    lyh_form.addEventListener('submit', function (e) {
      e.preventDefault();

      var lyh_data = {
        username: document.getElementById('lyh_username').value.trim(),
        password: document.getElementById('lyh_password').value,
        host: document.getElementById('lyh_host').value.trim() || '127.0.0.1',
        port: document.getElementById('lyh_port').value || '3306'
      };

      // lyh: 简单前端校验
      if (!lyh_data.username) {
        lyh_showMsg('✗ 用户名不能为空', 'error');
        return;
      }

      lyh_btn.disabled = true;
      lyh_btn.textContent = '连接中…';
      lyh_showMsg('正在连接数据库…', 'success');

      // lyh: 调用后端接口测试连接
      fetch('/api/db/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lyh_data)
      })
        .then(function (lyh_res) { return lyh_res.json(); })
        .then(function (lyh_resData) {
          // lyh: 服务器返回的数据输出到浏览器控制台
          console.log('[lyh] /api/db/connect 响应数据：', lyh_resData);
          if (lyh_resData.code === 0) {
            var lyh_d = lyh_resData.data || {};
            lyh_showMsg(
              '✓ ' + lyh_resData.msg +
              '（MySQL ' + lyh_d.version +
              '，用户 ' + lyh_d.user + '@' + lyh_d.host + ':' + lyh_d.port + '）',
              'success'
            );
          } else {
            lyh_showMsg('✗ ' + lyh_resData.msg, 'error');
          }
        })
        .catch(function (lyh_err) {
          // lyh: 错误信息输出到浏览器控制台
          console.error('[lyh] /api/db/connect 请求失败：', lyh_err);
          lyh_showMsg('✗ 请求失败：' + lyh_err.message, 'error');
        })
        .finally(function () {
          lyh_btn.disabled = false;
          lyh_btn.textContent = '连接数据库';
        });
    });
  }
})();

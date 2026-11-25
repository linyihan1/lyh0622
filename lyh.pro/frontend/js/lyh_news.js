/*
 * 姓名：林奕含| 学号：24002120622 |
 * 时间：2026-11-20 | 大模型：Trae
 */
// lyh: 科技新闻列表页面脚本 - fetch 调用 /api/news，控制台输出返回数据，渲染列表
(function () {
  'use strict';

  var lyh_apiUrl = window.location.origin + '/api/news';
  var lyh_apiUrlEl = document.getElementById('lyh_apiUrl');
  var lyh_listEl = document.getElementById('lyh_newsList');
  var lyh_tipEl = document.getElementById('lyh_tip');

  // lyh: 页面顶部显示当前调用的接口地址
  if (lyh_apiUrlEl) {
    lyh_apiUrlEl.textContent = lyh_apiUrl;
  }

  // lyh: 渲染单条新闻卡片
  function lyh_renderItem(lyh_item) {
    var lyh_card = document.createElement('article');
    lyh_card.className = 'lyh_news-card';

    var lyh_title = document.createElement('h2');
    lyh_title.className = 'lyh_news-card-title';
    lyh_title.textContent = lyh_item.title;
    lyh_card.appendChild(lyh_title);

    var lyh_summary = document.createElement('p');
    lyh_summary.className = 'lyh_news-card-summary';
    lyh_summary.textContent = lyh_item.summary;
    lyh_card.appendChild(lyh_summary);

    var lyh_meta = document.createElement('div');
    lyh_meta.className = 'lyh_news-card-meta';

    var lyh_source = document.createElement('span');
    lyh_source.className = 'lyh_meta-source';
    lyh_source.textContent = '来源：' + (lyh_item.source || '未知');
    lyh_meta.appendChild(lyh_source);

    var lyh_time = document.createElement('span');
    lyh_time.className = 'lyh_meta-time';
    lyh_time.textContent = '发布时间：' + (lyh_item.publish_time || '');
    lyh_meta.appendChild(lyh_time);

    lyh_card.appendChild(lyh_meta);
    return lyh_card;
  }

  // lyh: 显示提示信息（加载/错误/空）
  function lyh_showTip(lyh_text, lyh_isError) {
    if (lyh_tipEl) {
      lyh_tipEl.style.display = 'block';
      lyh_tipEl.textContent = lyh_text;
      lyh_tipEl.className = 'lyh_tip' + (lyh_isError ? ' lyh_error' : '');
    }
  }

  // lyh: 获取并渲染新闻列表
  function lyh_loadNews() {
    lyh_showTip('正在加载新闻数据…', false);

    fetch(lyh_apiUrl)
      .then(function (lyh_res) { return lyh_res.json(); })
      .then(function (lyh_resData) {
        // lyh: 服务器返回的数据输出到浏览器控制台
        console.log('[lyh] /api/news 返回数据：', lyh_resData);

        if (lyh_resData.code !== 0) {
          lyh_showTip('加载失败：' + (lyh_resData.msg || '未知错误'), true);
          return;
        }

        var lyh_list = lyh_resData.data || [];
        if (lyh_list.length === 0) {
          lyh_showTip('暂无新闻数据', false);
          return;
        }

        // lyh: 清空容器并渲染列表
        lyh_listEl.innerHTML = '';
        lyh_list.forEach(function (lyh_item) {
          lyh_listEl.appendChild(lyh_renderItem(lyh_item));
        });
      })
      .catch(function (lyh_err) {
        // lyh: 错误信息输出到浏览器控制台
        console.error('[lyh] /api/news 请求失败：', lyh_err);
        lyh_showTip('请求失败：' + lyh_err.message, true);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', lyh_loadNews);
  } else {
    lyh_loadNews();
  }
})();

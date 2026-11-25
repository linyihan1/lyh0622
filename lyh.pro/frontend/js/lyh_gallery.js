/*
 * 姓名：林奕含| 学号：24002120622 |
 * 时间：2026-11-20 | 大模型：Trae
 */
// lyh: 图文列表页面脚本 - fetch 调用 /api/gallery，控制台输出返回数据，渲染上图下文网格卡片
(function () {
  'use strict';

  var lyh_apiUrl = window.location.origin + '/api/gallery';
  var lyh_apiUrlEl = document.getElementById('lyh_apiUrl');
  var lyh_gridEl = document.getElementById('lyh_galleryGrid');
  var lyh_tipEl = document.getElementById('lyh_tip');

  // lyh: 页面顶部显示当前调用的接口地址
  if (lyh_apiUrlEl) {
    lyh_apiUrlEl.textContent = lyh_apiUrl;
  }

  // lyh: 渲染单张图文卡片（上图下文）
  function lyh_renderCard(lyh_item) {
    var lyh_card = document.createElement('article');
    lyh_card.className = 'lyh_gallery-card';

    // lyh: 图片区域：容器自带占位底色，图片失败时隐藏 img 露出占位色块（无破图图标）
    var lyh_wrap = document.createElement('div');
    lyh_wrap.className = 'lyh_card-imgwrap';

    var lyh_ph = document.createElement('div');
    lyh_ph.className = 'lyh_card-placeholder';
    lyh_ph.innerHTML = '<span class="lyh_ph-icon">▦</span><span class="lyh_ph-text">加载中…</span>';

    var lyh_img = document.createElement('img');
    lyh_img.className = 'lyh_card-img';
    lyh_img.alt = lyh_item.title || '';
    // lyh: 图片加载成功 -> 渐显覆盖占位；失败 -> 隐藏 img（不出现破图图标）并更新占位文案
    lyh_img.onload = function () { lyh_img.classList.add('lyh_loaded'); };
    lyh_img.onerror = function () {
      lyh_img.style.display = 'none';
      var lyh_phText = lyh_ph.querySelector('.lyh_ph-text');
      if (lyh_phText) { lyh_phText.textContent = '图片加载失败'; }
      // lyh: 错误信息输出到浏览器控制台
      console.error('[lyh] 图片加载失败:', lyh_item.img_url);
    };
    lyh_img.src = lyh_item.img_url || '';

    lyh_wrap.appendChild(lyh_ph);
    lyh_wrap.appendChild(lyh_img);
    lyh_card.appendChild(lyh_wrap);

    // lyh: 下方文字区域：分类、标题、描述、时间
    var lyh_body = document.createElement('div');
    lyh_body.className = 'lyh_card-body';

    var lyh_cat = document.createElement('span');
    lyh_cat.className = 'lyh_card-category';
    lyh_cat.textContent = lyh_item.category || '未分类';
    lyh_body.appendChild(lyh_cat);

    var lyh_title = document.createElement('h3');
    lyh_title.className = 'lyh_card-title';
    lyh_title.textContent = lyh_item.title || '';
    lyh_body.appendChild(lyh_title);

    var lyh_desc = document.createElement('p');
    lyh_desc.className = 'lyh_card-desc';
    lyh_desc.textContent = lyh_item.description || '';
    lyh_body.appendChild(lyh_desc);

    var lyh_time = document.createElement('div');
    lyh_time.className = 'lyh_card-time';
    lyh_time.textContent = lyh_item.create_time || '';
    lyh_body.appendChild(lyh_time);

    lyh_card.appendChild(lyh_body);
    return lyh_card;
  }

  // lyh: 显示提示信息（加载/错误/空）
  function lyh_showTip(lyh_text, lyh_isError) {
    if (!lyh_tipEl) return;
    lyh_tipEl.style.display = 'block';
    lyh_tipEl.textContent = lyh_text;
    lyh_tipEl.className = 'lyh_tip' + (lyh_isError ? ' lyh_error' : '');
    // lyh: 提示需独占整行
    lyh_gridEl.innerHTML = '';
    lyh_gridEl.appendChild(lyh_tipEl);
  }

  // lyh: 获取并渲染图文列表
  function lyh_loadGallery() {
    lyh_showTip('正在加载图文数据…', false);

    fetch(lyh_apiUrl)
      .then(function (lyh_res) { return lyh_res.json(); })
      .then(function (lyh_resData) {
        // lyh: 服务器返回的数据输出到浏览器控制台
        console.log('[lyh] /api/gallery 返回数据：', lyh_resData);

        if (lyh_resData.code !== 0) {
          lyh_showTip('加载失败：' + (lyh_resData.msg || '未知错误'), true);
          return;
        }

        var lyh_list = lyh_resData.data || [];
        if (lyh_list.length === 0) {
          lyh_showTip('暂无图文数据', false);
          return;
        }

        // lyh: 清空容器并渲染网格卡片
        lyh_gridEl.innerHTML = '';
        lyh_list.forEach(function (lyh_item) {
          lyh_gridEl.appendChild(lyh_renderCard(lyh_item));
        });
      })
      .catch(function (lyh_err) {
        // lyh: 错误信息输出到浏览器控制台
        console.error('[lyh] /api/gallery 请求失败：', lyh_err);
        lyh_showTip('请求失败：' + lyh_err.message, true);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', lyh_loadGallery);
  } else {
    lyh_loadGallery();
  }
})();

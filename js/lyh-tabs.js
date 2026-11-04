/**
 * lyh-tabs.js — 可复用 Tab 选项卡模块
 * 使用方式：在 HTML 中给容器加 .lyh_tabs，tab 按钮加 data-tab="xxx"，
 *          对应内容面板加 data-panel="xxx"，并给默认按钮加 data-default-tab。
 *          页面底部 <script src="js/lyh-tabs.js" defer></script> 即可。
 */

(function () {
  'use strict';

  // 清除指定 tab 容器内所有按钮和面板的选中态（移除 .lyh_tab_active）
  function lyh_clear_all_tabs(container) {
    container.querySelectorAll('[data-tab]').forEach(function (btn) {
      btn.classList.remove('lyh_tab_active');
    });
    container.querySelectorAll('[data-panel]').forEach(function (panel) {
      panel.classList.remove('lyh_tab_active');
    });
  }

  // 给触发按钮和对应的内容面板设置选中态
  function lyh_set_active(container, tabKey) {
    var btn = container.querySelector('[data-tab="' + tabKey + '"]');
    var panel = container.querySelector('[data-panel="' + tabKey + '"]');
    if (btn) btn.classList.add('lyh_tab_active');
    if (panel) panel.classList.add('lyh_tab_active');
  }

  // lyh_init_one_tabs —— 为单个 .lyh_tabs 初始化
  // 入参 container 是 .lyh_tabs 按钮容器，但 data-panel 面板是它的兄弟节点，
  // 所以第一步要把 container 提升到同时包含按钮和面板的公共父元素上。
  function lyh_init_one_tabs(container) {
    // lyh 关键修复：提升 container 到包含 [data-panel] 的父级
    // .lyh_tabs 里只有按钮，[data-panel] 在外面，必须在父级才能同时命中
    var lyh_parent = container.parentElement;
    if (lyh_parent && lyh_parent.querySelector('[data-panel]')) {
      container = lyh_parent;
    }

    // 绑定事件监听
    container.addEventListener('click', function (e) {
      var target = e.target.closest('[data-tab]');
      if (!target) return;
      var key = target.getAttribute('data-tab');
      lyh_clear_all_tabs(container);
      lyh_set_active(container, key);
    });

    // 初始化默认选中项
    var defaultBtn = container.querySelector('[data-default-tab]');
    if (defaultBtn) {
      lyh_clear_all_tabs(container);
      lyh_set_active(container, defaultBtn.getAttribute('data-tab'));
    }
  }

  // 扫描页面上所有 .lyh_tabs 容器，逐个初始化
  function lyh_init_all_tabs() {
    document.querySelectorAll('.lyh_tabs').forEach(lyh_init_one_tabs);
  }

  // DOM 就绪后启动（兼容 defer 与传统 onload）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', lyh_init_all_tabs);
  } else {
    lyh_init_all_tabs();
  }
})();

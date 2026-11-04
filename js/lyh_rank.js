/**
 * lyh_rank.js —— 点击排行选项卡组件（实时点击 / 24小时排行）
 * 作者：邵玉紫檬（lyh 命名规范）
 * 建立时间：2026-11-04
 * 使用大模型：DeepSeek-V4.1-Flash
 * 功能名称：点击排行榜单切换
 * 用法：容器加 data-lyh-rank；选项卡按钮用 .lyh_tab + data-lyh-tab="k"；
 *       内容面板用 .lyh_panel + data-lyh-panel="k"。
 */
(function (lyh_window, lyh_document) {
  'use strict';

  // lyh：分组、选项卡、面板选择器与选中态类名
  var lyh_GROUP_SELECTOR = '[data-lyh-rank]';
  var lyh_TAB_SELECTOR = '.lyh_tab';
  var lyh_PANEL_SELECTOR = '.lyh_panel';
  var lyh_ON_CLASS = 'lyh_on';

  // lyh：解析选项卡对应的面板，优先取 aria-controls 指向的 id，其次取分组内同键面板
  function lyh_findPanel(lyh_group, lyh_tab) {
    var lyh_panelId = lyh_tab.getAttribute('aria-controls');
    var lyh_panel = lyh_panelId ? lyh_document.getElementById(lyh_panelId) : null;

    if (!lyh_panel) {
      var lyh_key = lyh_tab.getAttribute('data-lyh-tab');
      lyh_panel = lyh_group.querySelector(
        lyh_PANEL_SELECTOR + '[data-lyh-panel="' + lyh_key + '"]'
      );
    }
    return lyh_panel;
  }

  // lyh：第一步——清除分组内所有选项卡与面板的选中状态
  function lyh_clearAll(lyh_group) {
    var lyh_tabs = lyh_group.querySelectorAll(lyh_TAB_SELECTOR);
    var lyh_i;

    for (lyh_i = 0; lyh_i < lyh_tabs.length; lyh_i++) {
      var lyh_panel = lyh_findPanel(lyh_group, lyh_tabs[lyh_i]);

      lyh_tabs[lyh_i].classList.remove(lyh_ON_CLASS);
      lyh_tabs[lyh_i].setAttribute('aria-selected', 'false');
      lyh_tabs[lyh_i].setAttribute('tabindex', '-1');

      if (lyh_panel) {
        lyh_panel.classList.remove(lyh_ON_CLASS);
        lyh_panel.hidden = true;
      }
    }
  }

  // lyh：第二步——先清除全部选中状态，再设置当前选项卡与面板的选中状态
  function lyh_activate(lyh_group, lyh_tab) {
    var lyh_panel = lyh_findPanel(lyh_group, lyh_tab);

    lyh_clearAll(lyh_group);

    lyh_tab.classList.add(lyh_ON_CLASS);
    lyh_tab.setAttribute('aria-selected', 'true');
    lyh_tab.setAttribute('tabindex', '0');

    if (lyh_panel) {
      lyh_panel.classList.add(lyh_ON_CLASS);
      lyh_panel.hidden = false;
    }
  }

  // lyh：为排行分组绑定点击监听事件（事件委托），并初始化默认选中项
  function lyh_bindGroup(lyh_group) {
    var lyh_tabs = lyh_group.querySelectorAll(lyh_TAB_SELECTOR);
    var lyh_defaultTab = null;
    var lyh_i;

    for (lyh_i = 0; lyh_i < lyh_tabs.length; lyh_i++) {
      if (lyh_tabs[lyh_i].classList.contains(lyh_ON_CLASS)) {
        lyh_defaultTab = lyh_tabs[lyh_i];
        break;
      }
    }
    if (!lyh_defaultTab && lyh_tabs.length) {
      lyh_defaultTab = lyh_tabs[0];
    }
    if (lyh_defaultTab) {
      lyh_activate(lyh_group, lyh_defaultTab);
    }

    // lyh：监听点击，命中 .lyh_tab 时切换
    lyh_group.addEventListener('click', function (lyh_event) {
      var lyh_tab = lyh_event.target.closest(lyh_TAB_SELECTOR);
      if (!lyh_tab || !lyh_group.contains(lyh_tab)) {
        return;
      }
      lyh_activate(lyh_group, lyh_tab);
    });

    // lyh：监听左右方向键，支持键盘切换选项卡
    lyh_group.addEventListener('keydown', function (lyh_event) {
      if (lyh_event.key !== 'ArrowLeft' && lyh_event.key !== 'ArrowRight') {
        return;
      }
      var lyh_tab = lyh_event.target.closest(lyh_TAB_SELECTOR);
      if (!lyh_tab) {
        return;
      }
      var lyh_list = Array.prototype.slice.call(
        lyh_group.querySelectorAll(lyh_TAB_SELECTOR)
      );
      var lyh_next =
        lyh_list.indexOf(lyh_tab) + (lyh_event.key === 'ArrowRight' ? 1 : -1);
      lyh_next = (lyh_next + lyh_list.length) % lyh_list.length;

      lyh_activate(lyh_group, lyh_list[lyh_next]);
      lyh_list[lyh_next].focus();
      lyh_event.preventDefault();
    });

    lyh_group.setAttribute('data-lyh-rank-bound', 'true');
  }

  // lyh：初始化页面内所有排行分组，重复调用不会重复绑定
  function lyh_init(lyh_scope) {
    var lyh_groups = (lyh_scope || lyh_document).querySelectorAll(lyh_GROUP_SELECTOR);
    var lyh_i;

    for (lyh_i = 0; lyh_i < lyh_groups.length; lyh_i++) {
      if (lyh_groups[lyh_i].getAttribute('data-lyh-rank-bound') === 'true') {
        continue;
      }
      lyh_bindGroup(lyh_groups[lyh_i]);
    }
  }

  // lyh：对外暴露初始化方法，便于动态追加分组后手动初始化
  lyh_window.lyh_Rank = { init: lyh_init };

  // lyh：DOM 解析完成后自动初始化
  if (lyh_document.readyState === 'loading') {
    lyh_document.addEventListener('DOMContentLoaded', function () {
      lyh_init(lyh_document);
    });
  } else {
    lyh_init(lyh_document);
  }
})(window, document);

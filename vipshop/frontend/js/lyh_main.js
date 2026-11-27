// lyh_唯品会评论情感分类 · 前端主逻辑
// 职责：评论输入 → fetch /api/ai/chat → 渲染结构化结果卡片 → 历史记录
// 约定：所有 DOM id / 函数 / 常量 / 事件处理 均以 lyh_ 开头

'use strict';

// ══════════════════════════════════════════════════════════
// lyh_常量 & 状态
// ══════════════════════════════════════════════════════════
const LYH_API_BASE = '';  // lyh_空表示同域，由 express.static 托管前端时走同源
const LYH_API_CHAT = LYH_API_BASE + '/api/ai/chat';
const LYH_API_HIST = LYH_API_BASE + '/api/ai/history';
const LYH_API_HEAL = LYH_API_BASE + '/api/health';

const LYH_SENTIMENT_MAP = {
  positive: { label: '😊 正面', cls: 'pos' },
  neutral:  { label: '😐 中性', cls: 'neu' },
  negative: { label: '😠 负面', cls: 'neg' }
};

// lyh_快速示例（四个典型场景）
const LYH_SAMPLES = {
  positive: '物流很快第二天就到了，包装也很精美，衣服面料摸着很舒服，就是领口有点大不太满意。',
  neutral:  '唯品会买的欧莱雅复颜玻尿酸精华，用了一周感觉皮肤没什么变化，价格倒是挺便宜的。',
  negative: '鞋子刚穿第一天就开胶了，客服态度还特别差，再也不在唯品会买鞋了！',
  unknown:  '真的假的？这个价格能买到正品吗？'
};

// lyh_状态
let lyh_historyCache = [];

// ══════════════════════════════════════════════════════════
// lyh_DOM 引用
// ══════════════════════════════════════════════════════════
const $ = (id) => document.getElementById(id);
const lyhComment = $('lyh_comment');
const lyhCount = $('lyh_count');
const lyhBtnSubmit = $('lyh_btn_submit');
const lyhBtnText = $('lyh_btn_text');
const lyhBtnClear = $('lyh_btn_clear');
const lyhLoading = $('lyh_loading');
const lyhEmpty = $('lyh_empty');
const lyhResult = $('lyh_result');
const lyhError = $('lyh_error');
const lyhStatusDot = $('lyh_status_dot');
const lyhStatusText = $('lyh_status_text');

// ══════════════════════════════════════════════════════════
// lyh_初始化
// ══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  console.log('[lyh_init] 唯品会评论情感分类前端启动');

  // lyh_字数计数
  lyhComment.addEventListener('input', () => {
    lyhCount.textContent = lyhComment.value.length;
  });

  // lyh_提交按钮
  lyhBtnSubmit.addEventListener('click', lyhHandleSubmit);

  // lyh_清空
  lyhBtnClear.addEventListener('click', () => {
    lyhComment.value = '';
    lyhCount.textContent = '0';
    lyhHideResult();
    lyhComment.focus();
  });

  // lyh_Enter 发送 / Shift+Enter 换行
  lyhComment.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      lyhHandleSubmit();
    }
  });

  // lyh_示例按钮
  document.querySelectorAll('.lyh-sample').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.sample;
      if (LYH_SAMPLES[key]) {
        lyhComment.value = LYH_SAMPLES[key];
        lyhCount.textContent = lyhComment.value.length;
        lyhComment.focus();
        lyhComment.setSelectionRange(lyhComment.value.length, lyhComment.value.length);
      }
    });
  });

  // lyh_启动健康检查
  lyhCheckHealth();

  // lyh_加载历史
  lyhLoadHistory();
});

// ══════════════════════════════════════════════════════════
// lyh_核心：提交分析
// ══════════════════════════════════════════════════════════
async function lyhHandleSubmit() {
  const text = lyhComment.value.trim();
  if (!text) {
    lyhShowError('请先输入一条唯品会商品评论');
    lyhComment.focus();
    return;
  }

  // lyh_切换到加载态
  lyhSetLoading(true);
  lyhHideError();
  lyhHideResult();

  try {
    console.log('[lyh_request] POST', LYH_API_CHAT, { comment: text });

    const resp = await fetch(LYH_API_CHAT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment: text })
    });

    const body = await resp.json();
    console.log('[lyh_response]', body);

    if (!resp.ok || body.code !== 0) {
      throw new Error(body.msg || `HTTP ${resp.status}`);
    }

    // lyh_渲染结果
    lyhRenderResult(text, body.data);

    // lyh_刷新历史
    lyhLoadHistory();

  } catch (e) {
    console.error('[lyh_error]', e);
    lyhShowError('分析失败：' + e.message);
    lyhSetLoading(false);
  }
}

// ══════════════════════════════════════════════════════════
// lyh_渲染：结果卡片
// ══════════════════════════════════════════════════════════
function lyhRenderResult(comment, data) {
  console.log('[lyh_render] data =', data);
  lyhSetLoading(false);
  lyhEmpty.classList.add('hidden');
  lyhResult.classList.remove('hidden');

  // lyh_原文
  $('lyh_original_comment').textContent = comment;

  // lyh_sentiment
  const card = $('lyh_sentiment_card');
  card.classList.remove('lyh-pos', 'lyh-neu', 'lyh-neg');
  const sentInfo = LYH_SENTIMENT_MAP[data.sentiment] || LYH_SENTIMENT_MAP.neutral;
  card.classList.add('lyh-' + sentInfo.cls);
  $('lyh_sentiment_icon').textContent = sentInfo.label.split(' ')[0];
  $('lyh_sentiment_label').textContent = sentInfo.label.split(' ')[1];

  // lyh_置信度进度条
  const conf = Math.max(0, Math.min(1, data.confidence || 0));
  $('lyh_sentiment_fill').style.width = (conf * 100).toFixed(0) + '%';
  $('lyh_confidence_val').textContent = (conf * 100).toFixed(1) + '%';

  // lyh_复核标记
  const rev = $('lyh_rev_badge');
  if (data.need_review) rev.classList.remove('hidden');
  else rev.classList.add('hidden');

  // lyh_aspects 标签
  const aspectsBox = $('lyh_aspects');
  aspectsBox.innerHTML = '';
  (data.aspects || []).forEach(a => {
    const tag = document.createElement('span');
    tag.className = 'lyh-tag';
    tag.textContent = '#' + a;
    aspectsBox.appendChild(tag);
  });
  if (!data.aspects || data.aspects.length === 0) {
    aspectsBox.innerHTML = '<span style="color:var(--lyh-text-mute);font-size:12px;">（未识别到明确维度）</span>';
  }

  // lyh_entities 实体
  const entBox = $('lyh_entities');
  entBox.innerHTML = '';
  (data.entities || []).forEach(e => {
    const ent = document.createElement('span');
    ent.className = 'lyh-entity';
    ent.innerHTML = `<span>${lyhEscapeHtml(e.name)}</span><span class="lyh-entity-type">· ${e.type || ''}</span>`;
    entBox.appendChild(ent);
  });
  if (!data.entities || data.entities.length === 0) {
    entBox.innerHTML = '<span style="color:var(--lyh-text-mute);font-size:12px;">（未识别到命名实体）</span>';
  }

  // lyh_summary
  $('lyh_summary').textContent = data.summary || '(模型未返回摘要)';

  // lyh_原始 JSON（调试用）
  $('lyh_raw_json').textContent = JSON.stringify(data, null, 2);
}

function lyhHideResult() {
  lyhResult.classList.add('hidden');
  lyhEmpty.classList.remove('hidden');
}

function lyhSetLoading(isLoading) {
  if (isLoading) {
    lyhLoading.classList.remove('hidden');
    lyhResult.classList.add('hidden');
    lyhEmpty.classList.add('hidden');
    lyhBtnSubmit.disabled = true;
    lyhBtnText.textContent = '分析中...';
  } else {
    lyhLoading.classList.add('hidden');
    lyhBtnSubmit.disabled = false;
    lyhBtnText.textContent = '🔍 一键分析';
  }
}

function lyhShowError(msg) {
  lyhError.classList.remove('hidden');
  lyhError.textContent = msg;
  lyhEmpty.classList.add('hidden');
  lyhResult.classList.add('hidden');
}
function lyhHideError() { lyhError.classList.add('hidden'); }

function lyhEscapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// ══════════════════════════════════════════════════════════
// lyh_健康检查
// ══════════════════════════════════════════════════════════
async function lyhCheckHealth() {
  try {
    const resp = await fetch(LYH_API_HEAL);
    if (resp.ok) {
      lyhStatusDot.className = 'lyh-dot lyh-dot-ok';
      lyhStatusText.textContent = '后端已连接 · deepseek-ai/DeepSeek-V4-Flash';
    } else throw new Error('bad status');
  } catch (e) {
    lyhStatusDot.className = 'lyh-dot lyh-dot-bad';
    lyhStatusText.textContent = '⚠️ 后端未启动（node server.js）';
  }
}

// ══════════════════════════════════════════════════════════
// lyh_历史记录
// ══════════════════════════════════════════════════════════
async function lyhLoadHistory() {
  try {
    const resp = await fetch(LYH_API_HIST);
    const body = await resp.json();
    if (body.code === 0) {
      lyh_historyCache = body.data || [];
      lyhRenderHistory();
    }
  } catch (e) {
    console.warn('[lyh_history] 加载失败', e.message);
  }
}

function lyhRenderHistory() {
  const list = $('lyh_history_list');
  const count = $('lyh_history_count');
  count.textContent = '(' + lyh_historyCache.length + ')';

  if (lyh_historyCache.length === 0) {
    list.innerHTML = '<p class="lyh-empty-small">暂无历史记录</p>';
    return;
  }

  list.innerHTML = '';
  lyh_historyCache.forEach(item => {
    const sentCls = LYH_SENTIMENT_MAP[item.result.sentiment]?.cls || 'neu';
    const sentLabel = LYH_SENTIMENT_MAP[item.result.sentiment]?.label?.split(' ')[1] || '中性';

    const row = document.createElement('div');
    row.className = 'lyh-history-item';
    row.innerHTML = `
      <div class="lyh-hist-sentiment ${sentCls}">${sentLabel}</div>
      <div class="lyh-hist-comment">${lyhEscapeHtml(item.comment)}</div>
      <div class="lyh-hist-conf">${((item.result.confidence || 0) * 100).toFixed(0)}%</div>
    `;
    // lyh_点历史行 → 回填评论 + 显示结果
    row.addEventListener('click', () => {
      lyhComment.value = item.comment;
      lyhCount.textContent = item.comment.length;
      lyhRenderResult(item.comment, item.result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    list.appendChild(row);
  });
}

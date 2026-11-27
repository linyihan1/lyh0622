// lyh: Supabase REST 接口封装（公开只读，使用 publishable key）

const lyh_supabase = {
  restUrl: 'https://kuigdxqudsggfpfyoqgr.supabase.co/rest/v1',
  publishableKey: 'sb_publishable_ym2kAMM71z8MgejSrR_dNg_aqv4xgja',
};

// lyh: 商品卡片与详情复用的查询字段
const lyh_productFields = [
  'id',
  'name',
  'subtitle',
  'category',
  'original_price',
  'sale_price',
  'discount',
  'stock',
  'sales_count',
  'cover_image',
  'brands(name,english_name,country)',
].join(',');

// lyh: 统一 GET 请求
async function lyh_request(lyh_path) {
  const lyh_res = await fetch(`${lyh_supabase.restUrl}${lyh_path}`, {
    headers: {
      apikey: lyh_supabase.publishableKey,
      Authorization: `Bearer ${lyh_supabase.publishableKey}`,
    },
  });

  if (!lyh_res.ok) {
    const lyh_text = await lyh_res.text();
    throw new Error(`接口请求失败（${lyh_res.status}）${lyh_text}`);
  }

  return lyh_res.json();
}

// lyh: 金额格式化
function lyh_money(lyh_value) {
  return Number(lyh_value || 0).toFixed(2);
}

// lyh: 折扣率转“X折”
function lyh_discountText(lyh_rate) {
  const lyh_num = Number(lyh_rate);
  if (!lyh_num || lyh_num >= 1) return '';
  return `${(lyh_num * 10).toFixed(1).replace(/\.0$/, '')}折`;
}

// lyh: 销量展示（万为单位）
function lyh_salesText(lyh_count) {
  const lyh_num = Number(lyh_count) || 0;
  return lyh_num >= 10000 ? `${(lyh_num / 10000).toFixed(1)}万` : String(lyh_num);
}

// lyh: 转义，防止数据中的特殊字符破坏结构
function lyh_escape(lyh_value) {
  return String(lyh_value == null ? '' : lyh_value).replace(/[&<>"']/g, (lyh_char) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[lyh_char];
  });
}

// lyh: 读取地址栏参数
function lyh_query(lyh_key) {
  return new URLSearchParams(window.location.search).get(lyh_key) || '';
}

// lyh: 统一错误/空状态渲染
function lyh_stateHtml(lyh_message, lyh_isError) {
  return `<div class="lyh_state${lyh_isError ? ' lyh_state--error' : ''}">${lyh_escape(lyh_message)}</div>`;
}

// lyh: 骨架屏占位
function lyh_skeletonHtml(lyh_count) {
  return Array.from({ length: lyh_count }, () => '<div class="lyh_skeleton"></div>').join('');
}

// lyh: 倒计时文本，返回 { text, ended, started }
function lyh_countdown(lyh_startIso, lyh_endIso) {
  const lyh_now = Date.now();
  const lyh_start = new Date(lyh_startIso).getTime();
  const lyh_end = new Date(lyh_endIso).getTime();

  if (lyh_now >= lyh_end) return { text: '已结束', ended: true, started: true };
  if (lyh_now < lyh_start) {
    return { text: `距开始 ${lyh_formatGap(lyh_start - lyh_now)}`, ended: false, started: false };
  }
  return { text: `距结束 ${lyh_formatGap(lyh_end - lyh_now)}`, ended: false, started: true };
}

// lyh: 剩余毫秒转 天/时:分:秒
function lyh_formatGap(lyh_gap) {
  const lyh_total = Math.max(0, Math.floor(lyh_gap / 1000));
  const lyh_day = Math.floor(lyh_total / 86400);
  const lyh_hour = String(Math.floor((lyh_total % 86400) / 3600)).padStart(2, '0');
  const lyh_min = String(Math.floor((lyh_total % 3600) / 60)).padStart(2, '0');
  const lyh_sec = String(lyh_total % 60).padStart(2, '0');
  return `${lyh_day > 0 ? `${lyh_day}天 ` : ''}${lyh_hour}:${lyh_min}:${lyh_sec}`;
}

// lyh: 商品卡片模板
function lyh_productCardHtml(lyh_item) {
  const lyh_brand = lyh_item.brands || {};
  const lyh_discount = lyh_discountText(lyh_item.discount);
  return `
    <a class="lyh_card" href="detail.html?id=${encodeURIComponent(lyh_item.id)}">
      <div class="lyh_card__media">
        <img class="lyh_card__img" src="${lyh_escape(lyh_item.cover_image)}" alt="${lyh_escape(lyh_item.name)}" loading="lazy">
        ${lyh_discount ? `<span class="lyh_card__badge">${lyh_escape(lyh_discount)}</span>` : ''}
      </div>
      <div class="lyh_card__body">
        <p class="lyh_card__name">${lyh_escape(lyh_item.name)}</p>
        <p class="lyh_card__sub">${lyh_escape(lyh_item.subtitle || '正品特卖 顺丰包邮')}</p>
        <p class="lyh_card__brand">${lyh_escape(lyh_brand.name || '')} · ${lyh_escape(lyh_item.category)}</p>
        <div class="lyh_card__price-row">
          <span class="lyh_price">${lyh_money(lyh_item.sale_price)}</span>
          <span class="lyh_price__origin">${lyh_money(lyh_item.original_price)}</span>
        </div>
        <div class="lyh_card__foot">
          <span>已售 ${lyh_salesText(lyh_item.sales_count)} 件</span>
          <span>库存 ${lyh_item.stock}</span>
        </div>
      </div>
    </a>`;
}

// lyh: 限时专场卡片模板
function lyh_flashCardHtml(lyh_sale) {
  const lyh_product = lyh_sale.products || {};
  const lyh_brand = lyh_product.brands || {};
  const lyh_percent = lyh_sale.quota > 0 ? Math.min(100, Math.round((lyh_sale.sold_count / lyh_sale.quota) * 100)) : 0;
  const lyh_clock = lyh_countdown(lyh_sale.starts_at, lyh_sale.ends_at);
  const lyh_statusText = lyh_sale.status === 'ongoing' ? '进行中' : lyh_sale.status === 'upcoming' ? '即将开始' : '已结束';
  return `
    <article class="lyh_flash" data-lyh-flash-id="${lyh_escape(lyh_sale.id)}">
      <div class="lyh_flash__head">
        <span class="lyh_flash__status">${lyh_statusText}</span>
        <span class="lyh_flash__timer" data-lyh-start="${lyh_escape(lyh_sale.starts_at)}" data-lyh-end="${lyh_escape(lyh_sale.ends_at)}">${lyh_clock.text}</span>
      </div>
      <a class="lyh_flash__media" href="detail.html?id=${encodeURIComponent(lyh_product.id || '')}">
        <img src="${lyh_escape(lyh_product.cover_image)}" alt="${lyh_escape(lyh_product.name)}" loading="lazy">
      </a>
      <div class="lyh_flash__body">
        <p class="lyh_flash__title">${lyh_escape(lyh_sale.title)}</p>
        <p class="lyh_card__sub">${lyh_escape(lyh_brand.name || '')} ${lyh_escape(lyh_product.name || '')}</p>
        <div class="lyh_card__price-row">
          <span class="lyh_price">${lyh_money(lyh_sale.flash_price)}</span>
          <span class="lyh_price__origin">${lyh_money(lyh_product.sale_price)}</span>
        </div>
        <div class="lyh_progress"><div class="lyh_progress__bar" style="width:${lyh_percent}%"></div></div>
        <p class="lyh_progress__text">已抢 ${lyh_sale.sold_count} / ${lyh_sale.quota} 件</p>
      </div>
    </article>`;
}

// lyh: 启动页面内所有倒计时，每秒刷新
function lyh_startTimers() {
  const lyh_nodes = document.querySelectorAll('[data-lyh-start][data-lyh-end]');
  if (!lyh_nodes.length) return;

  const lyh_tick = () => {
    lyh_nodes.forEach((lyh_node) => {
      const lyh_clock = lyh_countdown(lyh_node.dataset.lyhStart, lyh_node.dataset.lyhEnd);
      lyh_node.textContent = lyh_clock.text;
      lyh_node.classList.toggle('lyh_flash__timer--ended', lyh_clock.ended);
    });
  };

  lyh_tick();
  window.setInterval(lyh_tick, 1000);
}

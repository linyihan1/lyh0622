// lyh: 商品详情页

const lyh_id = lyh_query('id');
const lyh_detailBox = document.getElementById('lyh_detail');
const lyh_relatedGrid = document.getElementById('lyh_relatedGrid');

// lyh: 搜索跳转
document.getElementById('lyh_searchForm').addEventListener('submit', (lyh_event) => {
  lyh_event.preventDefault();
  const lyh_keyword = document.getElementById('lyh_searchInput').value.trim();
  window.location.href = lyh_keyword ? `list.html?q=${encodeURIComponent(lyh_keyword)}` : 'list.html';
});

// lyh: 轻提示
function lyh_toast(lyh_text) {
  let lyh_node = document.getElementById('lyh_toast');
  if (!lyh_node) {
    lyh_node = document.createElement('div');
    lyh_node.id = 'lyh_toast';
    lyh_node.className = 'lyh_toast';
    document.body.appendChild(lyh_node);
  }
  lyh_node.textContent = lyh_text;
  lyh_node.classList.add('lyh_toast--show');
  window.clearTimeout(lyh_node.lyh_timer);
  lyh_node.lyh_timer = window.setTimeout(() => {
    lyh_node.classList.remove('lyh_toast--show');
  }, 1800);
}

// lyh: 数量步进
function lyh_bindQty(lyh_max) {
  const lyh_input = document.getElementById('lyh_qtyInput');
  const lyh_maxQty = Math.max(1, Number(lyh_max) || 1);

  const lyh_setValue = (lyh_value) => {
    const lyh_num = Math.min(lyh_maxQty, Math.max(1, Number(lyh_value) || 1));
    lyh_input.value = lyh_num;
  };

  document.getElementById('lyh_qtyMinus').addEventListener('click', () => {
    lyh_setValue(Number(lyh_input.value) - 1);
  });
  document.getElementById('lyh_qtyPlus').addEventListener('click', () => {
    lyh_setValue(Number(lyh_input.value) + 1);
  });
  lyh_input.addEventListener('change', () => {
    lyh_setValue(lyh_input.value);
  });
}

// lyh: 参数表
function lyh_paramRows(lyh_product) {
  const lyh_brand = lyh_product.brands || {};
  const lyh_rows = [
    ['品牌', lyh_brand.name || '-'],
    ['英文名', lyh_brand.english_name || '-'],
    ['品牌国别', lyh_brand.country || '-'],
    ['所属品类', lyh_product.category],
    ['吊牌价', `¥${lyh_money(lyh_product.original_price)}`],
    ['特卖价', `¥${lyh_money(lyh_product.sale_price)}`],
    ['折扣', lyh_discountText(lyh_product.discount) || '无折扣'],
    ['库存', `${lyh_product.stock} 件`],
    ['累计销量', `${lyh_product.sales_count} 件`],
    ['上架状态', lyh_product.is_active ? '在售' : '已下架'],
    ['品牌介绍', lyh_brand.description || '-'],
  ];
  return lyh_rows
    .map(([lyh_key, lyh_value]) => `<tr><th>${lyh_escape(lyh_key)}</th><td>${lyh_escape(lyh_value)}</td></tr>`)
    .join('');
}

// lyh: 限时专场信息
async function lyh_loadFlash(lyh_productId) {
  const lyh_rows = await lyh_request(
    `/flash_sales?select=id,title,starts_at,ends_at,flash_price,quota,sold_count,status&product_id=eq.${encodeURIComponent(lyh_productId)}&status=in.(ongoing,upcoming)&order=ends_at.asc&limit=1`
  );
  if (!lyh_rows.length) return;

  const lyh_sale = lyh_rows[0];
  const lyh_note = document.getElementById('lyh_flashNote');
  const lyh_timer = document.getElementById('lyh_flashTimer');

  document.getElementById('lyh_flashPrice').textContent = lyh_money(lyh_sale.flash_price);
  document.getElementById('lyh_flashTitle').textContent =
    `${lyh_sale.title} · 已抢 ${lyh_sale.sold_count}/${lyh_sale.quota}`;
  lyh_timer.dataset.lyhStart = lyh_sale.starts_at;
  lyh_timer.dataset.lyhEnd = lyh_sale.ends_at;
  lyh_note.hidden = false;

  lyh_startTimers();
}

// lyh: 相关推荐（同类不足 4 件时用热销商品补齐）
async function lyh_loadRelated(lyh_product) {
  try {
    const lyh_same = await lyh_request(
      `/products?select=${lyh_productFields}&is_active=eq.true&category=eq.${encodeURIComponent(lyh_product.category)}&id=neq.${encodeURIComponent(lyh_product.id)}&order=sales_count.desc&limit=4`
    );

    let lyh_rows = lyh_same;

    if (lyh_same.length < 4) {
      const lyh_exclude = [lyh_product.id, ...lyh_same.map((lyh_row) => lyh_row.id)];
      const lyh_fill = await lyh_request(
        `/products?select=${lyh_productFields}&is_active=eq.true&id=not.in.(${lyh_exclude.join(',')})&order=sales_count.desc&limit=${4 - lyh_same.length}`
      );
      lyh_rows = lyh_same.concat(lyh_fill);
    }

    lyh_relatedGrid.innerHTML = lyh_rows.length
      ? lyh_rows.map(lyh_productCardHtml).join('')
      : lyh_stateHtml('暂无同类推荐');
  } catch (lyh_error) {
    lyh_relatedGrid.innerHTML = lyh_stateHtml(`推荐加载失败：${lyh_error.message}`, true);
  }
}

// lyh: 主流程
async function lyh_loadDetail() {
  if (!lyh_id) {
    lyh_detailBox.innerHTML = lyh_stateHtml('缺少商品 ID，请从列表页进入商品详情', true);
    lyh_relatedGrid.innerHTML = '';
    return;
  }

  const lyh_rows = await lyh_request(
    `/products?select=*,brands(name,english_name,country,description)&id=eq.${encodeURIComponent(lyh_id)}&limit=1`
  );

  if (!lyh_rows.length) {
    lyh_detailBox.innerHTML = lyh_stateHtml('商品不存在或已下架', true);
    lyh_relatedGrid.innerHTML = '';
    return;
  }

  const lyh_product = lyh_rows[0];
  const lyh_brand = lyh_product.brands || {};

  document.title = `${lyh_product.name} · 唯品会`;
  document.getElementById('lyh_crumb').innerHTML = `
    <a href="index.html">首页</a> /
    <a href="list.html">品牌特卖</a> /
    <a href="list.html?category=${encodeURIComponent(lyh_product.category)}">${lyh_escape(lyh_product.category)}</a> /
    <span>${lyh_escape(lyh_product.name)}</span>`;

  const lyh_img = document.getElementById('lyh_detailImg');
  lyh_img.src = lyh_product.cover_image;
  lyh_img.alt = lyh_product.name;

  document.getElementById('lyh_detailBrand').textContent =
    `${lyh_brand.name || ''}${lyh_brand.english_name ? ` · ${lyh_brand.english_name}` : ''}`;
  document.getElementById('lyh_detailTitle').textContent = lyh_product.name;
  document.getElementById('lyh_detailSub').textContent = lyh_product.subtitle || '正品特卖 · 顺丰包邮';
  document.getElementById('lyh_detailPrice').textContent = lyh_money(lyh_product.sale_price);
  document.getElementById('lyh_detailOrigin').textContent = lyh_money(lyh_product.original_price);

  const lyh_discountNode = document.getElementById('lyh_detailDiscount');
  const lyh_discount = lyh_discountText(lyh_product.discount);
  lyh_discountNode.textContent = lyh_discount ? `${lyh_discount} 特卖` : '正品特卖';
  lyh_discountNode.hidden = false;

  document.getElementById('lyh_detailSales').textContent = lyh_salesText(lyh_product.sales_count);
  document.getElementById('lyh_detailStock').textContent = lyh_product.stock;
  document.getElementById('lyh_detailCategory').textContent = lyh_product.category;
  document.getElementById('lyh_paramTable').innerHTML = `<tbody>${lyh_paramRows(lyh_product)}</tbody>`;

  lyh_bindQty(lyh_product.stock);

  document.getElementById('lyh_buyBtn').addEventListener('click', () => {
    lyh_toast(`演示站点：${lyh_product.name} × ${document.getElementById('lyh_qtyInput').value}，暂未接入下单`);
  });
  document.getElementById('lyh_cartBtn').addEventListener('click', () => {
    lyh_toast(`已加入购物车（演示）：${lyh_product.name} × ${document.getElementById('lyh_qtyInput').value}`);
  });

  await Promise.allSettled([lyh_loadFlash(lyh_product.id), lyh_loadRelated(lyh_product)]);
}

lyh_loadDetail().catch((lyh_error) => {
  lyh_detailBox.innerHTML = lyh_stateHtml(`加载失败：${lyh_error.message}`, true);
  lyh_relatedGrid.innerHTML = '';
});

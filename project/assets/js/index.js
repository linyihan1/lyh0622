// lyh: 首页数据加载

const lyh_brandGrid = document.getElementById('lyh_brandGrid');
const lyh_flashGrid = document.getElementById('lyh_flashGrid');
const lyh_productGrid = document.getElementById('lyh_productGrid');

// lyh: 搜索跳转到列表页
document.getElementById('lyh_searchForm').addEventListener('submit', (lyh_event) => {
  lyh_event.preventDefault();
  const lyh_keyword = document.getElementById('lyh_searchInput').value.trim();
  window.location.href = lyh_keyword ? `list.html?q=${encodeURIComponent(lyh_keyword)}` : 'list.html';
});

// lyh: 品牌卡片
function lyh_brandHtml(lyh_brand) {
  return `
    <a class="lyh_brand" href="list.html?q=${encodeURIComponent(lyh_brand.name)}">
      <span class="lyh_brand__avatar">${lyh_escape(lyh_brand.name.slice(0, 1))}</span>
      <div>
        <div class="lyh_brand__name">${lyh_escape(lyh_brand.name)}</div>
        <div class="lyh_brand__en">${lyh_escape(lyh_brand.english_name || '')}</div>
        <div class="lyh_brand__meta">
          <span class="lyh_tag lyh_tag--pink">${lyh_escape(lyh_brand.category)}</span>
          <span class="lyh_tag">${lyh_escape(lyh_brand.country || '进口')}</span>
        </div>
      </div>
    </a>`;
}

// lyh: 限时专场
async function lyh_loadFlashes() {
  try {
    const lyh_rows = await lyh_request(
      '/flash_sales?select=id,title,starts_at,ends_at,flash_price,quota,sold_count,status,products(id,name,sale_price,cover_image,brands(name))&status=in.(ongoing,upcoming)&order=ends_at.asc&limit=4'
    );

    if (!lyh_rows.length) {
      lyh_flashGrid.innerHTML = lyh_stateHtml('暂无进行中的专场，稍后再来看看');
      return;
    }

    lyh_flashGrid.innerHTML = lyh_rows.map(lyh_flashCardHtml).join('');
    lyh_startTimers();
  } catch (lyh_error) {
    lyh_flashGrid.innerHTML = lyh_stateHtml(`专场加载失败：${lyh_error.message}`, true);
  }
}

// lyh: 人气商品
async function lyh_loadProducts() {
  try {
    const lyh_rows = await lyh_request(
      `/products?select=${lyh_productFields}&is_active=eq.true&order=sales_count.desc&limit=8`
    );

    lyh_productGrid.innerHTML = lyh_rows.length
      ? lyh_rows.map(lyh_productCardHtml).join('')
      : lyh_stateHtml('暂无在售商品');
  } catch (lyh_error) {
    lyh_productGrid.innerHTML = lyh_stateHtml(`商品加载失败：${lyh_error.message}`, true);
  }
}

// lyh: 品牌墙
async function lyh_loadBrands() {
  try {
    const lyh_rows = await lyh_request(
      '/brands?select=name,english_name,country,category&order=created_at.asc'
    );

    lyh_brandGrid.innerHTML = lyh_rows.length
      ? lyh_rows.map(lyh_brandHtml).join('')
      : lyh_stateHtml('暂无品牌');

    document.getElementById('lyh_statBrands').textContent = lyh_rows.length;
  } catch (lyh_error) {
    lyh_brandGrid.innerHTML = lyh_stateHtml(`品牌加载失败：${lyh_error.message}`, true);
  }
}

// lyh: 顶部统计数字
async function lyh_loadStats() {
  try {
    const [lyh_products, lyh_flashes] = await Promise.all([
      lyh_request('/products?select=id&is_active=eq.true'),
      lyh_request('/flash_sales?select=id&status=in.(ongoing,upcoming)'),
    ]);
    document.getElementById('lyh_statProducts').textContent = lyh_products.length;
    document.getElementById('lyh_statFlashes').textContent = lyh_flashes.length;
  } catch (lyh_error) {
    document.getElementById('lyh_statProducts').textContent = '-';
    document.getElementById('lyh_statFlashes').textContent = '-';
  }
}

lyh_loadBrands();
lyh_loadFlashes();
lyh_loadProducts();
lyh_loadStats();

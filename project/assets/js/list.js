// lyh: 列表页筛选、搜索、排序

const lyh_listState = {
  category: lyh_query('category'),
  keyword: lyh_query('q'),
  sort: lyh_query('sort') || 'sales_count.desc',
};

const lyh_grid = document.getElementById('lyh_productGrid');
const lyh_summary = document.getElementById('lyh_listSummary');

// lyh: 搜索框回填与跳转
const lyh_searchInput = document.getElementById('lyh_searchInput');
lyh_searchInput.value = lyh_listState.keyword;
document.getElementById('lyh_searchForm').addEventListener('submit', (lyh_event) => {
  lyh_event.preventDefault();
  lyh_updateQuery({ q: lyh_searchInput.value.trim(), category: '' });
});

// lyh: 更新地址栏参数并重新查询
function lyh_updateQuery(lyh_patch) {
  const lyh_params = new URLSearchParams();
  const lyh_next = { ...lyh_listState, ...lyh_patch };
  if (lyh_next.keyword) lyh_params.set('q', lyh_next.keyword);
  if (lyh_next.category) lyh_params.set('category', lyh_next.category);
  if (lyh_next.sort && lyh_next.sort !== 'sales_count.desc') lyh_params.set('sort', lyh_next.sort);
  window.location.href = lyh_params.toString() ? `list.html?${lyh_params.toString()}` : 'list.html';
}

// lyh: 品类与排序选中态
function lyh_markActive() {
  document.querySelectorAll('[data-lyh-category]').forEach((lyh_node) => {
    lyh_node.classList.toggle('lyh_chip--active', lyh_node.dataset.lyhCategory === lyh_listState.category);
  });
  document.querySelectorAll('[data-lyh-sort]').forEach((lyh_node) => {
    lyh_node.classList.toggle('lyh_chip--active', lyh_node.dataset.lyhSort === lyh_listState.sort);
  });
}

document.getElementById('lyh_categoryRow').addEventListener('click', (lyh_event) => {
  const lyh_btn = lyh_event.target.closest('[data-lyh-category]');
  if (!lyh_btn) return;
  lyh_updateQuery({ category: lyh_btn.dataset.lyhCategory });
});

document.getElementById('lyh_sortRow').addEventListener('click', (lyh_event) => {
  const lyh_btn = lyh_event.target.closest('[data-lyh-sort]');
  if (!lyh_btn) return;
  lyh_updateQuery({ sort: lyh_btn.dataset.lyhSort });
});

// lyh: 关键词同时匹配品牌名，转成 brand_id 条件
async function lyh_brandIdsByKeyword(lyh_keyword) {
  if (!lyh_keyword) return [];
  const lyh_rows = await lyh_request(
    `/brands?select=id&or=(name.ilike.*${encodeURIComponent(lyh_keyword)}*,english_name.ilike.*${encodeURIComponent(lyh_keyword)}*)`
  );
  return lyh_rows.map((lyh_row) => lyh_row.id);
}

// lyh: 加载商品
async function lyh_loadList() {
  const lyh_filters = ['is_active=eq.true'];

  if (lyh_listState.category) {
    lyh_filters.push(`category=eq.${encodeURIComponent(lyh_listState.category)}`);
  }

  if (lyh_listState.keyword) {
    const lyh_ids = await lyh_brandIdsByKeyword(lyh_listState.keyword);
    const lyh_kw = encodeURIComponent(lyh_listState.keyword);
    const lyh_conditions = [`name.ilike.*${lyh_kw}*`, `subtitle.ilike.*${lyh_kw}*`];
    if (lyh_ids.length) lyh_conditions.push(`brand_id.in.(${lyh_ids.join(',')})`);
    lyh_filters.push(`or=(${lyh_conditions.join(',')})`);
  }

  lyh_filters.push(`order=${lyh_listState.sort}`);

  const lyh_rows = await lyh_request(
    `/products?select=${lyh_productFields}&${lyh_filters.join('&')}&limit=60`
  );

  if (!lyh_rows.length) {
    lyh_summary.textContent = '没有符合条件的商品';
    lyh_grid.innerHTML = lyh_stateHtml('换个筛选条件试试，或返回首页看看限时抢购');
    return;
  }

  const lyh_label = [];
  if (lyh_listState.keyword) lyh_label.push(`“${lyh_listState.keyword}”`);
  if (lyh_listState.category) lyh_label.push(lyh_listState.category);
  lyh_summary.innerHTML = `${lyh_label.length ? `${lyh_label.join(' · ')} 共` : '全部商品 共'} <b>${lyh_rows.length}</b> 件`;
  lyh_grid.innerHTML = lyh_rows.map(lyh_productCardHtml).join('');
}

lyh_markActive();
lyh_loadList().catch((lyh_error) => {
  lyh_summary.textContent = '商品加载失败';
  lyh_grid.innerHTML = lyh_stateHtml(`加载失败：${lyh_error.message}`, true);
});

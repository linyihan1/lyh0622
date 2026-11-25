/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-25
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：图像识别页面逻辑（选择图片、调用识别接口、展示描述）
 */

const LYH_IMG_MAX_SIZE = 10 * 1024 * 1024;
const LYH_IMG_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];

const lyh_img_dom = {
  drop: document.getElementById('lyh_img_drop'),
  fileInput: document.getElementById('lyh_img_file'),
  preview: document.getElementById('lyh_img_preview'),
  meta: document.getElementById('lyh_img_meta'),
  submit: document.getElementById('lyh_img_submit'),
  reset: document.getElementById('lyh_img_reset'),
  result: document.getElementById('lyh_img_result'),
  model: document.getElementById('lyh_img_model'),
};

const lyh_img_state = {
  file: null,
  previewUrl: '',
  busy: false,
};

// 文件大小格式化
function lyh_img_formatSize(lyh_bytes) {
  const lyh_size = Number(lyh_bytes) || 0;
  if (lyh_size < 1024) return lyh_size + ' B';
  if (lyh_size < 1024 * 1024) return (lyh_size / 1024).toFixed(1) + ' KB';
  return (lyh_size / 1024 / 1024).toFixed(2) + ' MB';
}

// 结果区展示错误
function lyh_img_showError(lyh_message) {
  lyh_img_dom.result.innerHTML = '';
  const lyh_box = document.createElement('div');
  lyh_box.className = 'lyh_img_error';
  lyh_box.textContent = lyh_message;
  lyh_img_dom.result.appendChild(lyh_box);
}

// 结果区展示加载状态
function lyh_img_showLoading() {
  lyh_img_dom.result.innerHTML = '';
  const lyh_box = document.createElement('div');
  lyh_box.className = 'lyh_img_loading';

  const lyh_spinner = document.createElement('span');
  lyh_spinner.className = 'lyh_img_spinner';

  const lyh_text = document.createElement('span');
  lyh_text.textContent = '正在识别图片，请稍候…';

  lyh_box.appendChild(lyh_spinner);
  lyh_box.appendChild(lyh_text);
  lyh_img_dom.result.appendChild(lyh_box);
}

// 结果区展示识别描述
function lyh_img_showResult(lyh_data) {
  lyh_img_dom.result.innerHTML = '';

  const lyh_body = document.createElement('div');
  lyh_body.className = 'lyh_img_result_body';

  const lyh_text = document.createElement('p');
  lyh_text.className = 'lyh_img_result_text';
  lyh_text.textContent = lyh_data.description;

  const lyh_meta = document.createElement('div');
  lyh_meta.className = 'lyh_img_result_meta';

  [
    '模型：' + lyh_data.model,
    '大小：' + lyh_img_formatSize(lyh_data.fileSize),
    '格式：' + String(lyh_data.mimeType || '').replace('image/', '').toUpperCase(),
  ].forEach(function (lyh_label) {
    const lyh_item = document.createElement('span');
    lyh_item.className = 'lyh_img_meta_item';
    lyh_item.textContent = lyh_label;
    lyh_meta.appendChild(lyh_item);
  });

  lyh_body.appendChild(lyh_text);
  lyh_body.appendChild(lyh_meta);
  lyh_img_dom.result.appendChild(lyh_body);

  lyh_img_dom.model.textContent = lyh_data.model;
}

// 选择图片
function lyh_img_selectFile(lyh_file) {
  if (!lyh_file) return;

  if (!LYH_IMG_TYPES.includes(lyh_file.type)) {
    lyh_img_showError('仅支持 jpg / png / gif / webp / bmp 格式的图片');
    return;
  }
  if (lyh_file.size > LYH_IMG_MAX_SIZE) {
    lyh_img_showError('图片大小不能超过 10MB，当前为 ' + lyh_img_formatSize(lyh_file.size));
    return;
  }

  if (lyh_img_state.previewUrl) {
    URL.revokeObjectURL(lyh_img_state.previewUrl);
  }

  lyh_img_state.file = lyh_file;
  lyh_img_state.previewUrl = URL.createObjectURL(lyh_file);

  lyh_img_dom.preview.src = lyh_img_state.previewUrl;
  lyh_img_dom.drop.classList.add('lyh_img_has_image');
  lyh_img_dom.meta.textContent = lyh_file.name + ' · ' + lyh_img_formatSize(lyh_file.size);
  lyh_img_dom.submit.disabled = false;

  lyh_img_dom.result.innerHTML =
    '<div class="lyh_img_result_empty">'
    + '<div class="lyh_img_result_badge">AI</div>'
    + '<p class="lyh_img_result_empty_title">图片已就绪</p>'
    + '<p class="lyh_img_result_empty_desc">点击左侧“开始识别”，即可生成图片描述。</p>'
    + '</div>';
}

// 调用识别接口
async function lyh_img_submit() {
  if (lyh_img_state.busy || !lyh_img_state.file) return;

  lyh_img_state.busy = true;
  lyh_img_dom.submit.disabled = true;
  lyh_img_dom.submit.textContent = '识别中…';
  lyh_img_showLoading();

  try {
    const lyh_form = new FormData();
    lyh_form.append('image', lyh_img_state.file);

    const lyh_res = await fetch('/api/image/describe', { method: 'POST', body: lyh_form });
    const lyh_json = await lyh_res.json();
    console.log('[lyh_image] 服务器返回：', lyh_json);

    if (lyh_json.code !== 0) throw new Error(lyh_json.msg || '图片识别失败');

    lyh_img_showResult(lyh_json.data);
  } catch (lyh_err) {
    console.error('[lyh_image] 图片识别失败：', lyh_err);
    lyh_img_showError('识别失败：' + (lyh_err.message || '请稍后重试'));
  } finally {
    lyh_img_state.busy = false;
    lyh_img_dom.submit.disabled = !lyh_img_state.file;
    lyh_img_dom.submit.textContent = '开始识别';
  }
}

// 重置选择
function lyh_img_reset() {
  if (lyh_img_state.busy) return;

  if (lyh_img_state.previewUrl) {
    URL.revokeObjectURL(lyh_img_state.previewUrl);
  }

  lyh_img_state.file = null;
  lyh_img_state.previewUrl = '';
  lyh_img_dom.preview.src = '';
  lyh_img_dom.drop.classList.remove('lyh_img_has_image');
  lyh_img_dom.meta.textContent = '尚未选择图片';
  lyh_img_dom.submit.disabled = true;
  lyh_img_dom.fileInput.value = '';
  lyh_img_dom.result.innerHTML =
    '<div class="lyh_img_result_empty">'
    + '<div class="lyh_img_result_badge">AI</div>'
    + '<p class="lyh_img_result_empty_title">图片描述将显示在这里</p>'
    + '<p class="lyh_img_result_empty_desc">上传图片并点击“开始识别”，即可获得图片主题、画面元素和文字内容的中文描述。</p>'
    + '</div>';
}

// 事件绑定
function lyh_img_bindEvents() {
  lyh_img_dom.drop.addEventListener('click', function () {
    if (!lyh_img_state.busy) lyh_img_dom.fileInput.click();
  });

  lyh_img_dom.fileInput.addEventListener('change', function (lyh_event) {
    lyh_img_selectFile(lyh_event.target.files && lyh_event.target.files[0]);
  });

  ['dragenter', 'dragover'].forEach(function (lyh_name) {
    lyh_img_dom.drop.addEventListener(lyh_name, function (lyh_event) {
      lyh_event.preventDefault();
      lyh_img_dom.drop.classList.add('lyh_img_drop_hover');
    });
  });

  ['dragleave', 'drop'].forEach(function (lyh_name) {
    lyh_img_dom.drop.addEventListener(lyh_name, function (lyh_event) {
      lyh_event.preventDefault();
      lyh_img_dom.drop.classList.remove('lyh_img_drop_hover');
    });
  });

  lyh_img_dom.drop.addEventListener('drop', function (lyh_event) {
    const lyh_file = lyh_event.dataTransfer.files && lyh_event.dataTransfer.files[0];
    lyh_img_selectFile(lyh_file);
  });

  lyh_img_dom.submit.addEventListener('click', lyh_img_submit);
  lyh_img_dom.reset.addEventListener('click', lyh_img_reset);
}

lyh_img_bindEvents();

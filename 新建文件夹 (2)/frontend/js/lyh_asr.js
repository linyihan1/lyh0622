/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-25
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：语音识别页面逻辑（上传/录制语音，调用接口返回文字）
 */

const LYH_ASR_MAX_SIZE = 20 * 1024 * 1024;
const LYH_ASR_EXT = ['.wav', '.mp3', '.m4a', '.webm', '.ogg', '.flac', '.aac', '.amr'];

const lyh_asr_dom = {
  drop: document.getElementById('lyh_asr_drop'),
  fileInput: document.getElementById('lyh_asr_file'),
  player: document.getElementById('lyh_asr_player'),
  meta: document.getElementById('lyh_asr_meta'),
  submit: document.getElementById('lyh_asr_submit'),
  reset: document.getElementById('lyh_asr_reset'),
  result: document.getElementById('lyh_asr_result'),
  model: document.getElementById('lyh_asr_model'),
  record: document.getElementById('lyh_asr_record'),
  recordText: document.getElementById('lyh_asr_record_text'),
  timer: document.getElementById('lyh_asr_timer'),
};

const lyh_asr_state = {
  file: null,
  fileUrl: '',
  busy: false,
  recorder: null,
  chunks: [],
  timerId: null,
  seconds: 0,
};

function lyh_asr_formatSize(lyh_bytes) {
  const lyh_size = Number(lyh_bytes) || 0;
  if (lyh_size < 1024) return lyh_size + ' B';
  if (lyh_size < 1024 * 1024) return (lyh_size / 1024).toFixed(1) + ' KB';
  return (lyh_size / 1024 / 1024).toFixed(2) + ' MB';
}

function lyh_asr_emptyHtml() {
  return '<div class="lyh_asr_result_empty">'
    + '<div class="lyh_asr_result_badge">AI</div>'
    + '<p class="lyh_asr_result_empty_title">识别文字将显示在这里</p>'
    + '<p class="lyh_asr_result_empty_desc">上传音频或录制语音后点击“开始识别”，即可把语音内容转写为文字。</p>'
    + '</div>';
}

function lyh_asr_showError(lyh_message) {
  lyh_asr_dom.result.innerHTML = '';
  const lyh_box = document.createElement('div');
  lyh_box.className = 'lyh_asr_error';
  lyh_box.textContent = lyh_message;
  lyh_asr_dom.result.appendChild(lyh_box);
}

function lyh_asr_showLoading() {
  lyh_asr_dom.result.innerHTML = '';
  const lyh_box = document.createElement('div');
  lyh_box.className = 'lyh_asr_loading';

  const lyh_spinner = document.createElement('span');
  lyh_spinner.className = 'lyh_asr_spinner';

  const lyh_text = document.createElement('span');
  lyh_text.textContent = '正在识别语音，请稍候…';

  lyh_box.appendChild(lyh_spinner);
  lyh_box.appendChild(lyh_text);
  lyh_asr_dom.result.appendChild(lyh_box);
}

// 展示识别文字
function lyh_asr_showResult(lyh_data) {
  lyh_asr_dom.result.innerHTML = '';

  const lyh_body = document.createElement('div');
  lyh_body.className = 'lyh_asr_result_body';

  const lyh_text = document.createElement('p');
  lyh_text.className = 'lyh_asr_result_text';
  lyh_text.textContent = lyh_data.text;

  const lyh_meta = document.createElement('div');
  lyh_meta.className = 'lyh_asr_result_meta';
  [
    '模型：' + lyh_data.model,
    lyh_data.provider ? '来源：' + lyh_data.provider : '',
    '语言：' + (lyh_data.language || 'Chinese'),
    lyh_data.duration ? '时长：' + lyh_data.duration + ' 秒' : '大小：' + lyh_asr_formatSize(lyh_data.fileSize),
  ].filter(Boolean).forEach(function (lyh_label) {
    const lyh_item = document.createElement('span');
    lyh_item.className = 'lyh_asr_meta_item';
    lyh_item.textContent = lyh_label;
    lyh_meta.appendChild(lyh_item);
  });

  const lyh_copy = document.createElement('button');
  lyh_copy.className = 'lyh_asr_copy';
  lyh_copy.type = 'button';
  lyh_copy.textContent = '复制文字';
  lyh_copy.addEventListener('click', function () {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(lyh_data.text).then(function () {
        lyh_copy.textContent = '已复制';
      }).catch(function () {
        lyh_copy.textContent = '复制失败';
      });
    }
  });

  lyh_body.appendChild(lyh_text);
  lyh_body.appendChild(lyh_meta);
  lyh_body.appendChild(lyh_copy);
  lyh_asr_dom.result.appendChild(lyh_body);

  lyh_asr_dom.model.textContent = lyh_data.model;
}

// 选择音频文件
function lyh_asr_selectAudio(lyh_file) {
  if (!lyh_file) return;

  const lyh_ext = '.' + String(lyh_file.name).split('.').pop().toLowerCase();
  const lyh_isAudio = (lyh_file.type && lyh_file.type.indexOf('audio/') === 0) || LYH_ASR_EXT.includes(lyh_ext);

  if (!lyh_isAudio) {
    lyh_asr_showError('仅支持 wav / mp3 / m4a / webm / ogg / flac / aac / amr 音频文件');
    return;
  }
  if (lyh_file.size > LYH_ASR_MAX_SIZE) {
    lyh_asr_showError('音频大小不能超过 20MB，当前为 ' + lyh_asr_formatSize(lyh_file.size));
    return;
  }

  if (lyh_asr_state.fileUrl) URL.revokeObjectURL(lyh_asr_state.fileUrl);

  lyh_asr_state.file = lyh_file;
  lyh_asr_state.fileUrl = URL.createObjectURL(lyh_file);

  lyh_asr_dom.player.src = lyh_asr_state.fileUrl;
  lyh_asr_dom.player.hidden = false;
  lyh_asr_dom.meta.textContent = lyh_file.name + ' · ' + lyh_asr_formatSize(lyh_file.size);
  lyh_asr_dom.submit.disabled = false;

  lyh_asr_dom.result.innerHTML = '<div class="lyh_asr_result_empty">'
    + '<div class="lyh_asr_result_badge">AI</div>'
    + '<p class="lyh_asr_result_empty_title">音频已就绪</p>'
    + '<p class="lyh_asr_result_empty_desc">点击左侧“开始识别”，即可把语音转写成文字。</p>'
    + '</div>';
}

// 录音计时
function lyh_asr_tick() {
  lyh_asr_state.seconds += 1;
  const lyh_m = String(Math.floor(lyh_asr_state.seconds / 60)).padStart(2, '0');
  const lyh_s = String(lyh_asr_state.seconds % 60).padStart(2, '0');
  lyh_asr_dom.timer.textContent = lyh_m + ':' + lyh_s;
}

// 开始/停止录音
async function lyh_asr_toggleRecord() {
  if (lyh_asr_state.busy) return;

  if (lyh_asr_state.recorder && lyh_asr_state.recorder.state === 'recording') {
    lyh_asr_state.recorder.stop();
    return;
  }

  if (!navigator.mediaDevices || !window.MediaRecorder) {
    lyh_asr_showError('当前浏览器不支持录音，请改用上传音频文件');
    return;
  }

  try {
    const lyh_stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const lyh_mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '');

    const lyh_recorder = new MediaRecorder(lyh_stream, lyh_mime ? { mimeType: lyh_mime } : undefined);
    lyh_asr_state.recorder = lyh_recorder;
    lyh_asr_state.chunks = [];
    lyh_asr_state.seconds = 0;
    lyh_asr_dom.timer.textContent = '00:00';

    lyh_recorder.ondataavailable = function (lyh_event) {
      if (lyh_event.data && lyh_event.data.size) lyh_asr_state.chunks.push(lyh_event.data);
    };

    lyh_recorder.onstop = function () {
      lyh_stream.getTracks().forEach(function (lyh_track) {
        lyh_track.stop();
      });
      clearInterval(lyh_asr_state.timerId);

      lyh_asr_dom.record.classList.remove('lyh_asr_recording');
      lyh_asr_dom.recordText.textContent = '开始录音';
      lyh_asr_state.recorder = null;

      const lyh_type = lyh_recorder.mimeType || 'audio/webm';
      const lyh_ext = lyh_type.indexOf('mp4') !== -1 ? 'm4a' : (lyh_type.indexOf('ogg') !== -1 ? 'ogg' : 'webm');
      const lyh_blob = new Blob(lyh_asr_state.chunks, { type: lyh_type });
      if (!lyh_blob.size) {
        lyh_asr_showError('没有录到声音，请检查麦克风权限后重试');
        return;
      }

      const lyh_file = new File([lyh_blob], '录音-' + Date.now() + '.' + lyh_ext, { type: lyh_type });
      lyh_asr_selectAudio(lyh_file);
    };

    lyh_recorder.start();
    lyh_asr_state.timerId = setInterval(lyh_asr_tick, 1000);
    lyh_asr_dom.record.classList.add('lyh_asr_recording');
    lyh_asr_dom.recordText.textContent = '停止录音';
  } catch (lyh_err) {
    console.error('[lyh_asr] 录音启动失败：', lyh_err);
    lyh_asr_showError('无法使用麦克风：' + (lyh_err.message || '请检查浏览器权限'));
  }
}

// 调用语音识别接口
async function lyh_asr_submit() {
  if (lyh_asr_state.busy || !lyh_asr_state.file) return;

  lyh_asr_state.busy = true;
  lyh_asr_dom.submit.disabled = true;
  lyh_asr_dom.submit.textContent = '识别中…';
  lyh_asr_showLoading();

  try {
    const lyh_form = new FormData();
    lyh_form.append('audio', lyh_asr_state.file);

    const lyh_res = await fetch('/api/asr/transcribe', { method: 'POST', body: lyh_form });
    const lyh_json = await lyh_res.json();
    console.log('[lyh_asr] 服务器返回：', lyh_json);

    if (lyh_json.code !== 0) throw new Error(lyh_json.msg || '语音识别失败');

    lyh_asr_showResult(lyh_json.data);
  } catch (lyh_err) {
    console.error('[lyh_asr] 语音识别失败：', lyh_err);
    lyh_asr_showError('识别失败：' + (lyh_err.message || '请稍后重试'));
  } finally {
    lyh_asr_state.busy = false;
    lyh_asr_dom.submit.disabled = !lyh_asr_state.file;
    lyh_asr_dom.submit.textContent = '开始识别';
  }
}

// 重置
function lyh_asr_reset() {
  if (lyh_asr_state.busy) return;
  if (lyh_asr_state.recorder && lyh_asr_state.recorder.state === 'recording') return;

  if (lyh_asr_state.fileUrl) URL.revokeObjectURL(lyh_asr_state.fileUrl);

  lyh_asr_state.file = null;
  lyh_asr_state.fileUrl = '';
  lyh_asr_dom.player.pause();
  lyh_asr_dom.player.removeAttribute('src');
  lyh_asr_dom.player.hidden = true;
  lyh_asr_dom.meta.textContent = '尚未选择音频';
  lyh_asr_dom.submit.disabled = true;
  lyh_asr_dom.fileInput.value = '';
  lyh_asr_dom.result.innerHTML = lyh_asr_emptyHtml();
}

function lyh_asr_bindEvents() {
  lyh_asr_dom.drop.addEventListener('click', function () {
    if (!lyh_asr_state.busy) lyh_asr_dom.fileInput.click();
  });

  lyh_asr_dom.fileInput.addEventListener('change', function (lyh_event) {
    lyh_asr_selectAudio(lyh_event.target.files && lyh_event.target.files[0]);
  });

  ['dragenter', 'dragover'].forEach(function (lyh_name) {
    lyh_asr_dom.drop.addEventListener(lyh_name, function (lyh_event) {
      lyh_event.preventDefault();
      lyh_asr_dom.drop.classList.add('lyh_asr_drop_hover');
    });
  });

  ['dragleave', 'drop'].forEach(function (lyh_name) {
    lyh_asr_dom.drop.addEventListener(lyh_name, function (lyh_event) {
      lyh_event.preventDefault();
      lyh_asr_dom.drop.classList.remove('lyh_asr_drop_hover');
    });
  });

  lyh_asr_dom.drop.addEventListener('drop', function (lyh_event) {
    lyh_asr_selectAudio(lyh_event.dataTransfer.files && lyh_event.dataTransfer.files[0]);
  });

  lyh_asr_dom.record.addEventListener('click', lyh_asr_toggleRecord);
  lyh_asr_dom.submit.addEventListener('click', lyh_asr_submit);
  lyh_asr_dom.reset.addEventListener('click', lyh_asr_reset);
}

lyh_asr_bindEvents();

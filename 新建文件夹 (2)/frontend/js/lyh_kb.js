/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-25
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：知识库（RAG）页面逻辑（上传解析、文件管理、检索问答）
 */

// 与服务端保持一致的可上传格式
const LYH_KB_ALLOWED_EXT = ['.txt', '.md', '.csv', '.pdf', '.doc', '.docx', '.ppt', '.pptx'];

const lyh_kb_dom = {
  drop: document.getElementById('lyh_kb_drop'),
  fileInput: document.getElementById('lyh_kb_file'),
  status: document.getElementById('lyh_kb_status'),
  meta: document.getElementById('lyh_kb_meta'),
  files: document.getElementById('lyh_kb_files'),
  messages: document.getElementById('lyh_kb_messages'),
  input: document.getElementById('lyh_kb_input'),
  send: document.getElementById('lyh_kb_send'),
};

const lyh_kb_state = {
  history: [],
  sending: false,
  uploading: false,
};

// 滚动到最新消息
function lyh_kb_scrollBottom() {
  lyh_kb_dom.messages.scrollTop = lyh_kb_dom.messages.scrollHeight;
}

// 上传/操作状态提示
function lyh_kb_setStatus(lyh_text, lyh_type) {
  lyh_kb_dom.status.textContent = lyh_text || '';
  lyh_kb_dom.status.className = 'lyh_kb_upload_status';
  if (lyh_type === 'ok') lyh_kb_dom.status.classList.add('lyh_kb_ok');
  if (lyh_type === 'err') lyh_kb_dom.status.classList.add('lyh_kb_err');
}

// 文件大小格式化
function lyh_kb_formatSize(lyh_bytes) {
  const lyh_size = Number(lyh_bytes) || 0;
  if (lyh_size < 1024) return lyh_size + ' B';
  if (lyh_size < 1024 * 1024) return (lyh_size / 1024).toFixed(1) + ' KB';
  return (lyh_size / 1024 / 1024).toFixed(1) + ' MB';
}

// 渲染知识库文件列表
function lyh_kb_renderFiles(lyh_files, lyh_totalChunks) {
  lyh_kb_dom.files.innerHTML = '';
  lyh_kb_dom.meta.textContent = lyh_files.length + ' 个文件 · ' + (lyh_totalChunks || 0) + ' 个分片';

  if (!lyh_files.length) {
    const lyh_empty = document.createElement('li');
    lyh_empty.className = 'lyh_kb_file_empty';
    lyh_empty.textContent = '知识库还是空的，先上传一个文件试试吧。';
    lyh_kb_dom.files.appendChild(lyh_empty);
    return;
  }

  lyh_files.forEach(function (lyh_file) {
    const lyh_li = document.createElement('li');
    lyh_li.className = 'lyh_kb_file_item';

    const lyh_ext = document.createElement('span');
    lyh_ext.className = 'lyh_kb_file_ext';
    lyh_ext.textContent = String(lyh_file.file_ext || '').replace('.', '').slice(0, 4);

    const lyh_body = document.createElement('div');
    lyh_body.className = 'lyh_kb_file_body';

    const lyh_name = document.createElement('p');
    lyh_name.className = 'lyh_kb_file_name';
    lyh_name.textContent = lyh_file.name;
    lyh_name.title = lyh_file.file_name;

    const lyh_info = document.createElement('p');
    lyh_info.className = 'lyh_kb_file_info';
    lyh_info.textContent =
      lyh_kb_formatSize(lyh_file.file_size) + ' · ' + lyh_file.chunk_count + ' 个分片 · ' + lyh_file.char_count + ' 字符';

    lyh_body.appendChild(lyh_name);
    lyh_body.appendChild(lyh_info);

    const lyh_del = document.createElement('button');
    lyh_del.className = 'lyh_kb_file_del';
    lyh_del.type = 'button';
    lyh_del.textContent = '删除';
    lyh_del.addEventListener('click', function () {
      lyh_kb_deleteFile(lyh_file);
    });

    lyh_li.appendChild(lyh_ext);
    lyh_li.appendChild(lyh_body);
    lyh_li.appendChild(lyh_del);
    lyh_kb_dom.files.appendChild(lyh_li);
  });
}

// 加载知识库文件列表
async function lyh_kb_loadFiles() {
  try {
    const lyh_res = await fetch('/api/kb/files');
    const lyh_json = await lyh_res.json();
    console.log('[lyh_kb] 知识库文件列表：', lyh_json);

    if (lyh_json.code !== 0) throw new Error(lyh_json.msg);
    lyh_kb_renderFiles(lyh_json.data.files || [], lyh_json.data.totalChunks);
  } catch (lyh_err) {
    console.error('[lyh_kb] 文件列表加载失败：', lyh_err);
    lyh_kb_setStatus('知识库文件加载失败：' + lyh_err.message, 'err');
  }
}

// 上传一个或多个文件
async function lyh_kb_uploadFiles(lyh_fileList) {
  if (lyh_kb_state.uploading) return;

  const lyh_files = Array.from(lyh_fileList || []);
  if (!lyh_files.length) return;

  lyh_kb_state.uploading = true;
  lyh_kb_setStatus('正在上传并解析，请稍候…');

  let lyh_success = 0;
  let lyh_failed = 0;

  for (const lyh_file of lyh_files) {
    const lyh_ext = '.' + String(lyh_file.name).split('.').pop().toLowerCase();

    if (!LYH_KB_ALLOWED_EXT.includes(lyh_ext)) {
      lyh_failed += 1;
      lyh_kb_setStatus('不支持的文件格式：' + lyh_file.name, 'err');
      continue;
    }

    try {
      const lyh_form = new FormData();
      lyh_form.append('file', lyh_file);

      const lyh_res = await fetch('/api/kb/upload', { method: 'POST', body: lyh_form });
      const lyh_json = await lyh_res.json();
      console.log('[lyh_kb] 上传结果：', lyh_json);

      if (lyh_json.code === 0) {
        lyh_success += 1;
        lyh_kb_setStatus('《' + lyh_json.data.name + '》解析完成，共 ' + lyh_json.data.chunk_count + ' 个分片', 'ok');
      } else {
        lyh_failed += 1;
        lyh_kb_setStatus('《' + lyh_file.name + '》上传失败：' + lyh_json.msg, 'err');
      }
    } catch (lyh_err) {
      lyh_failed += 1;
      console.error('[lyh_kb] 上传失败：', lyh_err);
      lyh_kb_setStatus('《' + lyh_file.name + '》上传失败：' + lyh_err.message, 'err');
    }
  }

  lyh_kb_state.uploading = false;
  if (lyh_success && !lyh_failed) {
    lyh_kb_setStatus('已成功上传 ' + lyh_success + ' 个文件', 'ok');
  }
  await lyh_kb_loadFiles();
}

// 删除知识库文件
async function lyh_kb_deleteFile(lyh_file) {
  if (!window.confirm('确定删除知识库文件《' + lyh_file.name + '》吗？该文件的所有文本分片将一并删除。')) {
    return;
  }

  try {
    const lyh_res = await fetch('/api/kb/files/' + lyh_file.id, { method: 'DELETE' });
    const lyh_json = await lyh_res.json();
    console.log('[lyh_kb] 删除结果：', lyh_json);

    if (lyh_json.code !== 0) throw new Error(lyh_json.msg);
    lyh_kb_setStatus('《' + lyh_file.name + '》已删除', 'ok');
    await lyh_kb_loadFiles();
  } catch (lyh_err) {
    console.error('[lyh_kb] 删除失败：', lyh_err);
    lyh_kb_setStatus('删除失败：' + lyh_err.message, 'err');
  }
}

// 追加一条消息，返回气泡与内容容器
function lyh_kb_appendMessage(lyh_role, lyh_content) {
  const lyh_welcome = lyh_kb_dom.messages.querySelector('.lyh_kb_welcome');
  if (lyh_welcome) lyh_welcome.remove();

  const lyh_isUser = lyh_role === 'user';
  const lyh_row = document.createElement('div');
  lyh_row.className = 'lyh_kb_row' + (lyh_isUser ? ' lyh_kb_row_user' : '');

  const lyh_avatar = document.createElement('div');
  lyh_avatar.className = 'lyh_kb_avatar';
  lyh_avatar.textContent = lyh_isUser ? '我' : 'KB';

  const lyh_contentBox = document.createElement('div');
  lyh_contentBox.className = 'lyh_kb_content';

  const lyh_bubble = document.createElement('div');
  lyh_bubble.className = 'lyh_kb_bubble';
  lyh_bubble.textContent = lyh_content;

  lyh_contentBox.appendChild(lyh_bubble);
  lyh_row.appendChild(lyh_avatar);
  lyh_row.appendChild(lyh_contentBox);
  lyh_kb_dom.messages.appendChild(lyh_row);
  lyh_kb_scrollBottom();

  return { row: lyh_row, bubble: lyh_bubble, content: lyh_contentBox };
}

// 渲染回答底部的参考来源
function lyh_kb_renderRefs(lyh_container, lyh_refs) {
  if (!lyh_refs || !lyh_refs.length) return;

  const lyh_box = document.createElement('div');
  lyh_box.className = 'lyh_kb_refs';

  const lyh_title = document.createElement('span');
  lyh_title.className = 'lyh_kb_refs_title';
  lyh_title.textContent = '参考来源';
  lyh_box.appendChild(lyh_title);

  lyh_refs.forEach(function (lyh_ref) {
    const lyh_tag = document.createElement('span');
    lyh_tag.className = 'lyh_kb_ref';
    lyh_tag.textContent = '【资料' + lyh_ref.no + '】' + lyh_ref.fileName + ' · 第 ' + (lyh_ref.chunkIndex + 1) + ' 段';
    lyh_tag.title = lyh_ref.snippet;
    lyh_box.appendChild(lyh_tag);
  });

  lyh_container.appendChild(lyh_box);
}

// 发送问题并接收流式回答
async function lyh_kb_sendQuestion() {
  if (lyh_kb_state.sending) return;

  const lyh_question = lyh_kb_dom.input.value.trim();
  if (!lyh_question) {
    lyh_kb_dom.input.focus();
    return;
  }

  lyh_kb_state.sending = true;
  lyh_kb_dom.send.disabled = true;
  lyh_kb_dom.input.value = '';
  lyh_kb_dom.input.style.height = 'auto';

  lyh_kb_appendMessage('user', lyh_question);
  const lyh_target = lyh_kb_appendMessage('assistant', '');
  lyh_target.bubble.classList.add('lyh_kb_cursor');

  let lyh_fullText = '';
  let lyh_refs = [];

  try {
    const lyh_res = await fetch('/api/kb/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: lyh_question, history: lyh_kb_state.history.slice(-6) }),
    });

    if (!lyh_res.ok || !lyh_res.body) {
      throw new Error('服务返回异常状态：' + lyh_res.status);
    }

    const lyh_reader = lyh_res.body.getReader();
    const lyh_decoder = new TextDecoder('utf-8');
    let lyh_buffer = '';

    while (true) {
      const lyh_read = await lyh_reader.read();
      if (lyh_read.done) break;
      lyh_buffer += lyh_decoder.decode(lyh_read.value, { stream: true });

      let lyh_index = lyh_buffer.indexOf('\n\n');
      while (lyh_index !== -1) {
        const lyh_raw = lyh_buffer.slice(0, lyh_index);
        lyh_buffer = lyh_buffer.slice(lyh_index + 2);
        lyh_index = lyh_buffer.indexOf('\n\n');

        const lyh_line = lyh_raw.split('\n').find(function (lyh_item) {
          return lyh_item.startsWith('data:');
        });
        if (!lyh_line) continue;

        let lyh_event;
        try {
          lyh_event = JSON.parse(lyh_line.slice(5).trim());
        } catch (lyh_parseErr) {
          continue;
        }

        if (lyh_event.type === 'meta') {
          lyh_refs = lyh_event.refs || [];
          console.log('[lyh_kb] 检索到的资料片段：', lyh_refs);
        } else if (lyh_event.type === 'delta') {
          lyh_fullText += lyh_event.content;
          lyh_target.bubble.textContent = lyh_fullText;
          lyh_kb_scrollBottom();
        } else if (lyh_event.type === 'done') {
          console.log('[lyh_kb] 回答完成：', lyh_event);
          lyh_refs = lyh_event.refs || lyh_refs;
        } else if (lyh_event.type === 'error') {
          throw new Error(lyh_event.msg || '知识库问答失败');
        }
      }
    }

    if (!lyh_fullText) {
      lyh_fullText = '知识库暂时没有返回内容，请稍后重试。';
      lyh_target.bubble.textContent = lyh_fullText;
    }

    lyh_kb_renderRefs(lyh_target.content, lyh_refs);
    lyh_kb_state.history.push({ role: 'user', content: lyh_question });
    lyh_kb_state.history.push({ role: 'assistant', content: lyh_fullText });
  } catch (lyh_err) {
    console.error('[lyh_kb] 知识库问答失败：', lyh_err);
    lyh_target.bubble.classList.add('lyh_kb_error');
    lyh_target.bubble.textContent = '抱歉，回答失败：' + (lyh_err.message || '请稍后重试');
  } finally {
    lyh_target.bubble.classList.remove('lyh_kb_cursor');
    lyh_kb_state.sending = false;
    lyh_kb_dom.send.disabled = false;
    lyh_kb_dom.input.focus();
    lyh_kb_scrollBottom();
  }
}

// 输入框高度自适应
function lyh_kb_resizeInput() {
  lyh_kb_dom.input.style.height = 'auto';
  lyh_kb_dom.input.style.height = Math.min(lyh_kb_dom.input.scrollHeight, 140) + 'px';
}

// 事件绑定
function lyh_kb_bindEvents() {
  lyh_kb_dom.drop.addEventListener('click', function () {
    lyh_kb_dom.fileInput.click();
  });

  lyh_kb_dom.fileInput.addEventListener('change', function (lyh_event) {
    lyh_kb_uploadFiles(lyh_event.target.files);
    lyh_kb_dom.fileInput.value = '';
  });

  ['dragenter', 'dragover'].forEach(function (lyh_name) {
    lyh_kb_dom.drop.addEventListener(lyh_name, function (lyh_event) {
      lyh_event.preventDefault();
      lyh_kb_dom.drop.classList.add('lyh_kb_drop_hover');
    });
  });

  ['dragleave', 'drop'].forEach(function (lyh_name) {
    lyh_kb_dom.drop.addEventListener(lyh_name, function (lyh_event) {
      lyh_event.preventDefault();
      lyh_kb_dom.drop.classList.remove('lyh_kb_drop_hover');
    });
  });

  lyh_kb_dom.drop.addEventListener('drop', function (lyh_event) {
    lyh_kb_uploadFiles(lyh_event.dataTransfer.files);
  });

  lyh_kb_dom.send.addEventListener('click', lyh_kb_sendQuestion);

  lyh_kb_dom.messages.addEventListener('click', function (lyh_event) {
    const lyh_chip = lyh_event.target.closest('.lyh_kb_chip');
    if (!lyh_chip || lyh_kb_state.sending) return;
    lyh_kb_dom.input.value = lyh_chip.dataset.lyhQuestion;
    lyh_kb_sendQuestion();
  });

  lyh_kb_dom.input.addEventListener('input', lyh_kb_resizeInput);
  lyh_kb_dom.input.addEventListener('keydown', function (lyh_event) {
    if (lyh_event.key === 'Enter' && !lyh_event.shiftKey && !lyh_event.isComposing) {
      lyh_event.preventDefault();
      lyh_kb_sendQuestion();
    }
  });
}

// 初始化
function lyh_kb_init() {
  lyh_kb_bindEvents();
  lyh_kb_loadFiles();
  lyh_kb_dom.input.focus();
}

lyh_kb_init();

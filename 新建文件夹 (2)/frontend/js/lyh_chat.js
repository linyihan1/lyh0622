/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-25
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：AI 聊天应用前端逻辑（会话管理 + 流式输出）
 */

const lyh_dom = {
  sessionList: document.getElementById('lyh_sessionList'),
  newChat: document.getElementById('lyh_newChat'),
  messages: document.getElementById('lyh_messages'),
  welcome: document.getElementById('lyh_welcome'),
  input: document.getElementById('lyh_input'),
  send: document.getElementById('lyh_send'),
  title: document.getElementById('lyh_chatTitle'),
  model: document.getElementById('lyh_chatModel'),
  inputWrap: document.querySelector('.lyh_input_wrap'),
};

const lyh_state = {
  sessions: [],
  sessionId: 0,
  sending: false,
};

// 转义 HTML，防止内容注入
function lyh_escapeHtml(lyh_text) {
  return String(lyh_text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 轻量 Markdown 渲染：代码块、行内代码、加粗、标题
function lyh_formatContent(lyh_text) {
  const lyh_codeBlocks = [];
  let lyh_html = lyh_escapeHtml(lyh_text);

  lyh_html = lyh_html.replace(/```[a-zA-Z]*\n?([\s\S]*?)```/g, function (lyh_match, lyh_code) {
    lyh_codeBlocks.push('<pre class="lyh_code"><code>' + lyh_code.replace(/\n$/, '') + '</code></pre>');
    return '\u0000' + (lyh_codeBlocks.length - 1) + '\u0000';
  });

  lyh_html = lyh_html
    .replace(/`([^`\n]+)`/g, '<code class="lyh_inline_code">$1</code>')
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/^#{1,3}\s+(.+)$/gm, '<h4 class="lyh_md_h">$1</h4>');

  return lyh_html.replace(/\u0000(\d+)\u0000/g, function (lyh_match, lyh_index) {
    return lyh_codeBlocks[Number(lyh_index)];
  });
}

// 滚动到底部
function lyh_scrollBottom() {
  lyh_dom.messages.scrollTop = lyh_dom.messages.scrollHeight;
}

// 渲染左侧会话列表
function lyh_renderSessions() {
  lyh_dom.sessionList.innerHTML = '';

  if (!lyh_state.sessions.length) {
    const lyh_empty = document.createElement('li');
    lyh_empty.className = 'lyh_session_empty';
    lyh_empty.textContent = '暂无历史会话，发送第一条消息后会自动创建。';
    lyh_dom.sessionList.appendChild(lyh_empty);
    return;
  }

  lyh_state.sessions.forEach(function (lyh_item) {
    const lyh_li = document.createElement('li');
    lyh_li.className = 'lyh_session_item' + (Number(lyh_item.id) === lyh_state.sessionId ? ' lyh_active' : '');
    lyh_li.dataset.lyhId = lyh_item.id;

    const lyh_title = document.createElement('span');
    lyh_title.className = 'lyh_session_title';
    lyh_title.textContent = lyh_item.title;

    const lyh_del = document.createElement('button');
    lyh_del.className = 'lyh_session_del';
    lyh_del.type = 'button';
    lyh_del.textContent = '×';
    lyh_del.title = '删除会话';

    lyh_li.appendChild(lyh_title);
    lyh_li.appendChild(lyh_del);
    lyh_dom.sessionList.appendChild(lyh_li);
  });
}

// 拉取会话列表
async function lyh_loadSessions() {
  try {
    const lyh_res = await fetch('/api/chat/sessions');
    const lyh_json = await lyh_res.json();
    console.log('[lyh_chat] 会话列表：', lyh_json);
    if (lyh_json.code !== 0) throw new Error(lyh_json.msg);
    lyh_state.sessions = lyh_json.data || [];
    lyh_renderSessions();
  } catch (lyh_err) {
    console.error('[lyh_chat] 会话列表加载失败：', lyh_err);
  }
}

// 切换会话
async function lyh_openSession(lyh_id) {
  if (lyh_state.sending) return;
  lyh_state.sessionId = Number(lyh_id);
  lyh_renderSessions();

  try {
    const lyh_res = await fetch('/api/chat/sessions/' + lyh_id + '/messages');
    const lyh_json = await lyh_res.json();
    console.log('[lyh_chat] 会话消息：', lyh_json);
    if (lyh_json.code !== 0) throw new Error(lyh_json.msg);

    lyh_dom.messages.innerHTML = '';
    lyh_dom.title.textContent = lyh_json.data.session.title;
    lyh_dom.model.textContent = lyh_json.data.session.model;

    if (!lyh_json.data.messages.length) {
      lyh_dom.messages.appendChild(lyh_dom.welcome);
    } else {
      lyh_json.data.messages.forEach(function (lyh_msg) {
        lyh_appendMessage(lyh_msg.role, lyh_msg.content);
      });
      lyh_scrollBottom();
    }
  } catch (lyh_err) {
    console.error('[lyh_chat] 会话消息加载失败：', lyh_err);
  }
}

// 新建对话
function lyh_newChat() {
  if (lyh_state.sending) return;
  lyh_state.sessionId = 0;
  lyh_dom.messages.innerHTML = '';
  lyh_dom.messages.appendChild(lyh_dom.welcome);
  lyh_dom.title.textContent = '新的对话';
  lyh_dom.model.textContent = 'deepseek-ai/DeepSeek-V4.1-Flash';
  lyh_renderSessions();
  lyh_dom.input.value = '';
  lyh_dom.input.focus();
}

// 追加一条消息，返回内容节点
function lyh_appendMessage(lyh_role, lyh_content) {
  const lyh_row = document.createElement('div');
  lyh_row.className = 'lyh_row ' + (lyh_role === 'user' ? 'lyh_user' : 'lyh_assistant');

  const lyh_avatar = document.createElement('div');
  lyh_avatar.className = 'lyh_avatar';
  lyh_avatar.textContent = lyh_role === 'user' ? '我' : 'AI';

  const lyh_bubble = document.createElement('div');
  lyh_bubble.className = 'lyh_bubble';
  if (lyh_role === 'user') {
    lyh_bubble.textContent = lyh_content;
  } else {
    lyh_bubble.innerHTML = lyh_formatContent(lyh_content);
  }

  lyh_row.appendChild(lyh_avatar);
  lyh_row.appendChild(lyh_bubble);
  lyh_dom.messages.appendChild(lyh_row);
  lyh_scrollBottom();
  return lyh_bubble;
}

// 删除会话
async function lyh_removeSession(lyh_id) {
  if (!window.confirm('确定删除该会话及其全部消息吗？')) return;
  try {
    const lyh_res = await fetch('/api/chat/sessions/' + lyh_id, { method: 'DELETE' });
    const lyh_json = await lyh_res.json();
    console.log('[lyh_chat] 删除会话：', lyh_json);
    if (lyh_json.code !== 0) throw new Error(lyh_json.msg);

    if (Number(lyh_id) === lyh_state.sessionId) lyh_newChat();
    await lyh_loadSessions();
  } catch (lyh_err) {
    console.error('[lyh_chat] 删除会话失败：', lyh_err);
  }
}

// 发送消息并接收流式回复
async function lyh_sendMessage() {
  if (lyh_state.sending) return;

  const lyh_content = lyh_dom.input.value.trim();
  if (!lyh_content) {
    lyh_dom.input.focus();
    return;
  }

  lyh_state.sending = true;
  lyh_dom.send.disabled = true;
  lyh_dom.input.value = '';
  lyh_dom.input.style.height = 'auto';

  const lyh_isNewSession = !lyh_state.sessionId;

  if (lyh_dom.welcome.parentNode) lyh_dom.welcome.parentNode.removeChild(lyh_dom.welcome);

  lyh_appendMessage('user', lyh_content);
  const lyh_bubble = lyh_appendMessage('assistant', '');
  lyh_bubble.classList.add('lyh_cursor');

  let lyh_fullText = '';

  try {
    const lyh_res = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: lyh_state.sessionId, content: lyh_content }),
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
          lyh_state.sessionId = Number(lyh_event.sessionId);
          lyh_dom.model.textContent = lyh_event.model;
          if (lyh_isNewSession) lyh_dom.title.textContent = lyh_content.slice(0, 20);
          console.log('[lyh_chat] 会话开始：', lyh_event);
        } else if (lyh_event.type === 'delta') {
          lyh_fullText += lyh_event.content;
          lyh_bubble.textContent = lyh_fullText;
          lyh_scrollBottom();
        } else if (lyh_event.type === 'done') {
          console.log('[lyh_chat] 回复完成：', lyh_event);
        } else if (lyh_event.type === 'error') {
          throw new Error(lyh_event.msg || '对话失败');
        }
      }
    }

    lyh_bubble.innerHTML = lyh_formatContent(lyh_fullText);
    await lyh_loadSessions();
  } catch (lyh_err) {
    console.error('[lyh_chat] 对话失败：', lyh_err);
    lyh_bubble.classList.add('lyh_error');
    lyh_bubble.textContent = '请求失败：' + (lyh_err.message || '请稍后重试');
  } finally {
    lyh_bubble.classList.remove('lyh_cursor');
    lyh_state.sending = false;
    lyh_dom.send.disabled = false;
    lyh_dom.input.focus();
    lyh_scrollBottom();
  }
}

// 输入框高度自适应
function lyh_resizeInput() {
  lyh_dom.input.style.height = 'auto';
  lyh_dom.input.style.height = Math.min(lyh_dom.input.scrollHeight, 148) + 'px';
}

// 事件绑定
function lyh_bindEvents() {
  lyh_dom.newChat.addEventListener('click', lyh_newChat);
  lyh_dom.send.addEventListener('click', lyh_sendMessage);

  lyh_dom.sessionList.addEventListener('click', function (lyh_event) {
    const lyh_item = lyh_event.target.closest('.lyh_session_item');
    if (!lyh_item) return;
    if (lyh_event.target.classList.contains('lyh_session_del')) {
      lyh_removeSession(lyh_item.dataset.lyhId);
      return;
    }
    lyh_openSession(lyh_item.dataset.lyhId);
  });

  lyh_dom.welcome.addEventListener('click', function (lyh_event) {
    const lyh_chip = lyh_event.target.closest('.lyh_chip');
    if (!lyh_chip) return;
    lyh_dom.input.value = lyh_chip.dataset.lyhPrompt;
    lyh_sendMessage();
  });

  lyh_dom.input.addEventListener('input', lyh_resizeInput);
  lyh_dom.input.addEventListener('focus', function () {
    lyh_dom.inputWrap.classList.add('lyh_focus');
  });
  lyh_dom.input.addEventListener('blur', function () {
    lyh_dom.inputWrap.classList.remove('lyh_focus');
  });

  lyh_dom.input.addEventListener('keydown', function (lyh_event) {
    if (lyh_event.key === 'Enter' && !lyh_event.shiftKey && !lyh_event.isComposing) {
      lyh_event.preventDefault();
      lyh_sendMessage();
    }
  });
}

// 初始化
function lyh_init() {
  lyh_bindEvents();
  lyh_loadSessions();
  lyh_dom.input.focus();
}

lyh_init();

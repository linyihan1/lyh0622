/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-25
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：在线客服页面逻辑（常见问题、流式应答、会话恢复）
 */

const LYH_CS_STORAGE_KEY = 'lyh_service_session_id';

const lyh_cs_dom = {
  faqList: document.getElementById('lyh_cs_faqList'),
  messages: document.getElementById('lyh_cs_messages'),
  quick: document.getElementById('lyh_cs_quick'),
  input: document.getElementById('lyh_cs_input'),
  send: document.getElementById('lyh_cs_send'),
  endBtn: document.getElementById('lyh_cs_endBtn'),
  composer: document.querySelector('.lyh_cs_composer'),
};

const lyh_cs_state = {
  sessionId: Number(localStorage.getItem(LYH_CS_STORAGE_KEY)) || 0,
  sending: false,
};

// 滚动到底部
function lyh_cs_scrollBottom() {
  lyh_cs_dom.messages.scrollTop = lyh_cs_dom.messages.scrollHeight;
}

// 追加一条消息
function lyh_cs_appendMessage(lyh_role, lyh_content) {
  const lyh_isUser = lyh_role === 'user';

  const lyh_row = document.createElement('div');
  lyh_row.className = 'lyh_cs_row' + (lyh_isUser ? ' lyh_cs_user_row' : ' lyh_cs_agent_row');

  const lyh_avatar = document.createElement('div');
  lyh_avatar.className = 'lyh_cs_bubble_avatar';
  lyh_avatar.textContent = lyh_isUser ? '我' : '云';

  const lyh_bubble = document.createElement('div');
  lyh_bubble.className = 'lyh_cs_bubble';
  lyh_bubble.textContent = lyh_content;

  lyh_row.appendChild(lyh_avatar);
  lyh_row.appendChild(lyh_bubble);
  lyh_cs_dom.messages.appendChild(lyh_row);
  lyh_cs_scrollBottom();
  return lyh_bubble;
}

// 渲染常见问题
function lyh_cs_renderFaqs(lyh_faqs) {
  lyh_cs_dom.faqList.innerHTML = '';

  if (!lyh_faqs.length) {
    const lyh_empty = document.createElement('li');
    lyh_empty.className = 'lyh_cs_faq_empty';
    lyh_empty.textContent = '暂无常见问题，请直接在对话框咨询。';
    lyh_cs_dom.faqList.appendChild(lyh_empty);
    return;
  }

  lyh_faqs.forEach(function (lyh_faq) {
    const lyh_li = document.createElement('li');
    lyh_li.className = 'lyh_cs_faq_item';
    lyh_li.dataset.lyhQuestion = lyh_faq.question;
    lyh_li.title = lyh_faq.answer;
    lyh_li.textContent = lyh_faq.question;
    lyh_cs_dom.faqList.appendChild(lyh_li);
  });
}

// 加载常见问题
async function lyh_cs_loadFaqs() {
  try {
    const lyh_res = await fetch('/api/service/faqs');
    const lyh_json = await lyh_res.json();
    console.log('[lyh_service] 常见问题：', lyh_json);
    if (lyh_json.code !== 0) throw new Error(lyh_json.msg);
    lyh_cs_renderFaqs(lyh_json.data || []);
  } catch (lyh_err) {
    console.error('[lyh_service] 常见问题加载失败：', lyh_err);
    lyh_cs_renderFaqs([]);
  }
}

// 恢复历史会话
async function lyh_cs_restoreSession() {
  if (!lyh_cs_state.sessionId) return;

  try {
    const lyh_res = await fetch('/api/service/sessions/' + lyh_cs_state.sessionId + '/messages');
    const lyh_json = await lyh_res.json();
    console.log('[lyh_service] 历史会话：', lyh_json);

    if (lyh_json.code !== 0 || !lyh_json.data.messages.length) {
      lyh_cs_state.sessionId = 0;
      localStorage.removeItem(LYH_CS_STORAGE_KEY);
      return;
    }

    lyh_cs_dom.messages.innerHTML = '';
    lyh_json.data.messages.forEach(function (lyh_msg) {
      lyh_cs_appendMessage(lyh_msg.role, lyh_msg.content);
    });
    lyh_cs_scrollBottom();
  } catch (lyh_err) {
    console.error('[lyh_service] 历史会话加载失败：', lyh_err);
  }
}

// 发送咨询并接收流式应答
async function lyh_cs_sendMessage() {
  if (lyh_cs_state.sending) return;

  const lyh_content = lyh_cs_dom.input.value.trim();
  if (!lyh_content) {
    lyh_cs_dom.input.focus();
    return;
  }

  lyh_cs_state.sending = true;
  lyh_cs_dom.send.disabled = true;
  lyh_cs_dom.input.value = '';
  lyh_cs_dom.input.style.height = 'auto';

  lyh_cs_appendMessage('user', lyh_content);
  const lyh_bubble = lyh_cs_appendMessage('assistant', '');
  lyh_bubble.classList.add('lyh_cs_cursor');

  let lyh_fullText = '';

  try {
    const lyh_res = await fetch('/api/service/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: lyh_cs_state.sessionId, content: lyh_content }),
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
          lyh_cs_state.sessionId = Number(lyh_event.sessionId);
          localStorage.setItem(LYH_CS_STORAGE_KEY, String(lyh_cs_state.sessionId));
          console.log('[lyh_service] 会话开始：', lyh_event);
        } else if (lyh_event.type === 'delta') {
          lyh_fullText += lyh_event.content;
          lyh_bubble.textContent = lyh_fullText;
          lyh_cs_scrollBottom();
        } else if (lyh_event.type === 'done') {
          console.log('[lyh_service] 应答完成：', lyh_event);
        } else if (lyh_event.type === 'error') {
          throw new Error(lyh_event.msg || '客服应答失败');
        }
      }
    }
  } catch (lyh_err) {
    console.error('[lyh_service] 客服应答失败：', lyh_err);
    lyh_bubble.classList.add('lyh_cs_error');
    lyh_bubble.textContent =
      '抱歉，智能客服暂时无法回复（' + (lyh_err.message || '请稍后重试') + '）。您也可以拨打 400-808-6688 联系人工客服。';
  } finally {
    lyh_bubble.classList.remove('lyh_cs_cursor');
    lyh_cs_state.sending = false;
    lyh_cs_dom.send.disabled = false;
    lyh_cs_dom.input.focus();
    lyh_cs_scrollBottom();
  }
}

// 结束会话
async function lyh_cs_endSession() {
  if (lyh_cs_state.sending) return;
  if (!window.confirm('确定结束本次咨询吗？')) return;

  try {
    if (lyh_cs_state.sessionId) {
      const lyh_res = await fetch('/api/service/sessions/' + lyh_cs_state.sessionId + '/close', {
        method: 'POST',
      });
      const lyh_json = await lyh_res.json();
      console.log('[lyh_service] 结束会话：', lyh_json);
    }
  } catch (lyh_err) {
    console.error('[lyh_service] 结束会话失败：', lyh_err);
  }

  localStorage.removeItem(LYH_CS_STORAGE_KEY);
  lyh_cs_state.sessionId = 0;
  window.location.reload();
}

// 输入框高度自适应
function lyh_cs_resizeInput() {
  lyh_cs_dom.input.style.height = 'auto';
  lyh_cs_dom.input.style.height = Math.min(lyh_cs_dom.input.scrollHeight, 120) + 'px';
}

// 立即发送指定问题
function lyh_cs_askQuestion(lyh_question) {
  if (lyh_cs_state.sending) return;
  lyh_cs_dom.input.value = lyh_question;
  lyh_cs_sendMessage();
}

// 事件绑定
function lyh_cs_bindEvents() {
  lyh_cs_dom.send.addEventListener('click', lyh_cs_sendMessage);
  lyh_cs_dom.endBtn.addEventListener('click', lyh_cs_endSession);

  lyh_cs_dom.faqList.addEventListener('click', function (lyh_event) {
    const lyh_item = lyh_event.target.closest('.lyh_cs_faq_item');
    if (!lyh_item) return;
    lyh_cs_askQuestion(lyh_item.dataset.lyhQuestion);
  });

  lyh_cs_dom.quick.addEventListener('click', function (lyh_event) {
    const lyh_item = lyh_event.target.closest('.lyh_cs_quick_item');
    if (!lyh_item) return;
    lyh_cs_askQuestion(lyh_item.dataset.lyhQ);
  });

  lyh_cs_dom.input.addEventListener('input', lyh_cs_resizeInput);
  lyh_cs_dom.input.addEventListener('focus', function () {
    lyh_cs_dom.composer.classList.add('lyh_cs_focus');
  });
  lyh_cs_dom.input.addEventListener('blur', function () {
    lyh_cs_dom.composer.classList.remove('lyh_cs_focus');
  });
  lyh_cs_dom.input.addEventListener('keydown', function (lyh_event) {
    if (lyh_event.key === 'Enter' && !lyh_event.shiftKey && !lyh_event.isComposing) {
      lyh_event.preventDefault();
      lyh_cs_sendMessage();
    }
  });
}

// 初始化
function lyh_cs_init() {
  lyh_cs_bindEvents();
  lyh_cs_loadFaqs();
  lyh_cs_restoreSession();
  lyh_cs_dom.input.focus();
}

lyh_cs_init();

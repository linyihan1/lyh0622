/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-25
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：在线客服流式对话服务（硅基流动大模型）
 */
const lyh_apiUrl = process.env.SILICONFLOW_API_URL || 'https://api.siliconflow.cn/v1/chat/completions';

/**
 * 调用对话接口（stream=true），逐段回调文本
 * @param {Array} lyh_messages 对话上下文 [{ role, content }]
 * @param {Function} lyh_onDelta 收到增量文本时回调
 * @returns {Promise<string>} 完整回复内容
 */
async function lyh_streamServiceChat(lyh_messages, lyh_onDelta) {
  const lyh_apiKey = process.env.SILICONFLOW_API_KEY;
  if (!lyh_apiKey) {
    throw new Error('缺少 SILICONFLOW_API_KEY 配置');
  }

  const lyh_response = await fetch(lyh_apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${lyh_apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V4.1-Flash',
      messages: lyh_messages,
      stream: true,
      max_tokens: 1024,
      temperature: 0.6,
    }),
  });

  if (!lyh_response.ok) {
    const lyh_text = await lyh_response.text();
    let lyh_msg = lyh_text.slice(0, 200);
    try {
      const lyh_json = JSON.parse(lyh_text);
      if (lyh_json.error && lyh_json.error.message) lyh_msg = lyh_json.error.message;
    } catch (lyh_parseErr) {
      // 保留原始文本
    }
    throw new Error(`客服模型接口返回 ${lyh_response.status}：${lyh_msg}`);
  }

  const lyh_decoder = new TextDecoder('utf-8');
  let lyh_buffer = '';
  let lyh_fullText = '';

  for await (const lyh_chunk of lyh_response.body) {
    lyh_buffer += lyh_decoder.decode(lyh_chunk, { stream: true });

    let lyh_index = lyh_buffer.indexOf('\n\n');
    while (lyh_index !== -1) {
      const lyh_event = lyh_buffer.slice(0, lyh_index);
      lyh_buffer = lyh_buffer.slice(lyh_index + 2);
      lyh_index = lyh_buffer.indexOf('\n\n');

      const lyh_line = lyh_event.split('\n').find((lyh_item) => lyh_item.startsWith('data:'));
      if (!lyh_line) continue;

      const lyh_payload = lyh_line.replace(/^data:\s*/, '').trim();
      if (!lyh_payload || lyh_payload === '[DONE]') continue;

      let lyh_json;
      try {
        lyh_json = JSON.parse(lyh_payload);
      } catch (lyh_parseErr) {
        continue;
      }

      const lyh_delta = lyh_json.choices && lyh_json.choices[0] && lyh_json.choices[0].delta;
      const lyh_content = lyh_delta && lyh_delta.content ? lyh_delta.content : '';
      if (lyh_content) {
        lyh_fullText += lyh_content;
        lyh_onDelta(lyh_content);
      }
    }
  }

  if (!lyh_fullText) {
    throw new Error('客服模型未返回任何内容');
  }
  return lyh_fullText;
}

module.exports = { lyh_streamServiceChat };

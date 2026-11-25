/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-25
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：硅基流动（SiliconFlow）大模型流式对话服务
 */
const lyh_apiUrl = process.env.SILICONFLOW_API_URL || 'https://api.siliconflow.cn/v1/chat/completions';

/**
 * 调用硅基流动对话接口（stream=true），逐段回调文本
 * @param {Array} lyh_messages 对话上下文 [{ role, content }]
 * @param {Function} lyh_onDelta 收到增量文本时回调
 * @param {Object} lyh_options 可选配置，lyh_log=true 时在控制台输出请求与响应数据
 * @returns {Promise<string>} 完整回复内容
 */
async function lyh_streamChat(lyh_messages, lyh_onDelta, lyh_options = {}) {
  const lyh_apiKey = process.env.SILICONFLOW_API_KEY;
  if (!lyh_apiKey) {
    throw new Error('缺少 SILICONFLOW_API_KEY 配置');
  }

  const lyh_body = {
    model: process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V4.1-Flash',
    messages: lyh_messages,
    stream: true,
    max_tokens: 2048,
    temperature: 0.7,
  };

  if (lyh_options.lyh_log) {
    console.log('\n[lyh_siliconflow] ===== 发送给大模型的数据 =====');
    console.log(JSON.stringify(lyh_body, null, 2));
  }

  const lyh_response = await fetch(lyh_apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${lyh_apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(lyh_body),
  });

  if (!lyh_response.ok) {
    const lyh_text = await lyh_response.text();
    throw new Error(`硅基流动接口返回 ${lyh_response.status}：${lyh_text.slice(0, 300)}`);
  }

  const lyh_decoder = new TextDecoder('utf-8');
  let lyh_buffer = '';
  let lyh_fullText = '';

  for await (const lyh_chunk of lyh_response.body) {
    lyh_buffer += lyh_decoder.decode(lyh_chunk, { stream: true });

    // SSE 以空行分隔事件，逐个取出处理
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
    throw new Error('模型未返回任何内容');
  }

  if (lyh_options.lyh_log) {
    console.log('\n[lyh_siliconflow] ===== 接收自大模型的数据 =====');
    console.log(lyh_fullText);
    console.log('[lyh_siliconflow] ===== 输出结束 =====\n');
  }

  return lyh_fullText;
}

module.exports = { lyh_streamChat };

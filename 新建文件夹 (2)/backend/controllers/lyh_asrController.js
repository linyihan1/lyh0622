/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-25
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：语音识别控制器（优先七牛 Qwen-Audio-3.0-ASR-Flash，不可用时切换硅基流动 ASR）
 */
const fs = require('fs');
const path = require('path');

const LYH_ASR_URL = process.env.QINIU_ASR_URL || 'https://api.qnaigc.com/v1/audio/transcriptions';
const LYH_ASR_MODEL = process.env.QINIU_ASR_MODEL || 'Qwen-Audio-3.0-ASR-Flash';
const LYH_SF_ASR_URL = process.env.SILICONFLOW_ASR_URL || 'https://api.siliconflow.cn/v1/audio/transcriptions';
const LYH_SF_ASR_MODEL = process.env.SILICONFLOW_ASR_MODEL || 'FunAudioLLM/SenseVoiceSmall';

function lyh_ok(lyh_res, lyh_data, lyh_msg = '操作成功') {
  lyh_res.json({ code: 0, msg: lyh_msg, data: lyh_data });
}

function lyh_fail(lyh_res, lyh_msg, lyh_code = 1, lyh_status = 400) {
  lyh_res.status(lyh_status).json({ code: lyh_code, msg: lyh_msg, data: null });
}

// 根据文件头识别常见音频格式
function lyh_detectAudioType(lyh_buffer, lyh_originalName) {
  if (!lyh_buffer || !lyh_buffer.length) return null;
  const lyh_head = lyh_buffer.slice(0, 12).toString('ascii');

  if (lyh_head.startsWith('RIFF') && lyh_buffer.slice(8, 12).toString('ascii') === 'WAVE') {
    return { ext: '.wav', mime: 'audio/wav' };
  }
  if (lyh_head.startsWith('ID3') || (lyh_buffer[0] === 0xff && (lyh_buffer[1] & 0xe0) === 0xe0)) {
    return { ext: '.mp3', mime: 'audio/mpeg' };
  }
  if (lyh_head.startsWith('OggS')) {
    return { ext: '.ogg', mime: 'audio/ogg' };
  }
  if (lyh_head.startsWith('fLaC')) {
    return { ext: '.flac', mime: 'audio/flac' };
  }
  if (lyh_buffer.slice(4, 8).toString('ascii') === 'ftyp') {
    return { ext: '.m4a', mime: 'audio/mp4' };
  }
  if (lyh_buffer.slice(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) {
    return { ext: '.webm', mime: 'audio/webm' };
  }

  const lyh_ext = path.extname(String(lyh_originalName || '')).toLowerCase();
  const lyh_map = {
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.m4a': 'audio/mp4',
    '.webm': 'audio/webm',
    '.ogg': 'audio/ogg',
    '.flac': 'audio/flac',
    '.aac': 'audio/aac',
    '.amr': 'audio/amr',
  };
  if (lyh_map[lyh_ext]) return { ext: lyh_ext, mime: lyh_map[lyh_ext] };
  return null;
}

// 解析转写结果中的文字
function lyh_pickText(lyh_json) {
  if (!lyh_json) return '';
  if (lyh_json.text) return String(lyh_json.text).trim();
  if (lyh_json.data && lyh_json.data.text) return String(lyh_json.data.text).trim();
  return '';
}

// 向某个语音识别服务发起请求
async function lyh_requestAsr(lyh_config, lyh_buffer, lyh_mime, lyh_ext) {
  const lyh_form = new FormData();
  lyh_form.append('model', lyh_config.model);
  lyh_form.append('file', new Blob([lyh_buffer], { type: lyh_mime }), `audio${lyh_ext}`);

  const lyh_response = await fetch(lyh_config.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${lyh_config.key}` },
    body: lyh_form,
  });

  const lyh_text = await lyh_response.text();
  let lyh_json = null;
  try {
    lyh_json = JSON.parse(lyh_text);
  } catch (lyh_parseErr) {
    lyh_json = null;
  }

  const lyh_errorMsg = !lyh_response.ok
    ? ((lyh_json && lyh_json.error && lyh_json.error.message)
      || `接口返回 ${lyh_response.status}：${lyh_text.slice(0, 200)}`)
    : '';

  return {
    ok: lyh_response.ok,
    status: lyh_response.status,
    json: lyh_json,
    text: lyh_text,
    errorMsg: lyh_errorMsg,
  };
}

// POST /api/asr/transcribe 上传语音并返回识别文字
async function lyh_transcribe(lyh_req, lyh_res) {
  const lyh_uploaded = lyh_req.file;
  if (!lyh_uploaded) return lyh_fail(lyh_res, '请选择要识别的语音文件');

  const lyh_storedPath = lyh_uploaded.path;

  try {
    const lyh_buffer = await fs.promises.readFile(lyh_storedPath);
    const lyh_type = lyh_detectAudioType(lyh_buffer, lyh_uploaded.originalname);
    if (!lyh_type) {
      return lyh_fail(lyh_res, '仅支持 wav / mp3 / m4a / webm / ogg / flac / aac / amr 音频');
    }

    // 主用七牛 Qwen-Audio-3.0-ASR-Flash；七牛不可用时切换硅基流动 SenseVoiceSmall
    const lyh_attempts = [
      {
        label: '七牛云',
        url: LYH_ASR_URL,
        key: process.env.QINIU_API_KEY,
        model: LYH_ASR_MODEL,
      },
      {
        label: '硅基流动',
        url: LYH_SF_ASR_URL,
        key: process.env.SILICONFLOW_API_KEY,
        model: LYH_SF_ASR_MODEL,
      },
    ];

    let lyh_lastError = '';

    for (const lyh_config of lyh_attempts) {
      if (!lyh_config.key) {
        lyh_lastError = `缺少 ${lyh_config.label} 的 API Key 配置`;
        continue;
      }

      console.log('\n[lyh_asr] ===== 发送给语音模型的数据 =====');
      console.log(JSON.stringify({
        provider: lyh_config.label,
        url: lyh_config.url,
        model: lyh_config.model,
        fileName: lyh_uploaded.originalname,
        mimeType: lyh_type.mime,
        size: lyh_buffer.length,
      }, null, 2));

      try {
        const lyh_result = await lyh_requestAsr(lyh_config, lyh_buffer, lyh_type.mime, lyh_type.ext);

        console.log('\n[lyh_asr] ===== 接收自语音模型的数据 =====');
        console.log(lyh_result.text.slice(0, 1000));
        console.log('[lyh_asr] ===== 输出结束 =====\n');

        if (!lyh_result.ok) {
          lyh_lastError = `${lyh_config.label}：${lyh_result.errorMsg}`;
          console.warn(`[lyh_asr] ${lyh_config.label} 识别失败，尝试下一个服务：${lyh_result.errorMsg}`);
          continue;
        }

        const lyh_resultText = lyh_pickText(lyh_result.json);
        if (!lyh_resultText) {
          lyh_lastError = `${lyh_config.label}未识别出语音内容`;
          continue;
        }

        lyh_ok(
          lyh_res,
          {
            text: lyh_resultText,
            language: (lyh_result.json && lyh_result.json.language) || 'Chinese',
            duration: (lyh_result.json && lyh_result.json.duration)
              || (lyh_result.json && lyh_result.json.usage && lyh_result.json.usage.seconds)
              || null,
            model: lyh_config.model,
            provider: lyh_config.label,
            fileName: lyh_uploaded.originalname,
            fileSize: lyh_buffer.length,
            mimeType: lyh_type.mime,
          },
          '语音识别成功'
        );
        return;
      } catch (lyh_err) {
        lyh_lastError = `${lyh_config.label}：${lyh_err.message}`;
        console.error(`[lyh_asr] ${lyh_config.label} 调用异常：`, lyh_err.message);
      }
    }

    throw new Error(lyh_lastError || '语音识别失败，请稍后重试');
  } catch (lyh_err) {
    console.error('[lyh_asr] 语音识别失败：', lyh_err.message);
    lyh_fail(lyh_res, lyh_err.message || '语音识别失败，请稍后重试', 1, 500);
  } finally {
    fs.promises.unlink(lyh_storedPath).catch(() => {});
  }
}

module.exports = {
  lyh_transcribe,
  lyh_detectAudioType,
};

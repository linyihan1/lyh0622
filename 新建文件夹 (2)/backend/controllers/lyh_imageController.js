/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-25
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：图像识别控制器（上传图片，调用硅基流动多模态模型返回图片描述）
 */
const fs = require('fs');
const lyh_siliconflowApiUrl = process.env.SILICONFLOW_API_URL
  || 'https://api.siliconflow.cn/v1/chat/completions';
const LYH_IMAGE_MODEL = process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V4.1-Flash';

const LYH_IMAGE_PROMPT = [
  '你是一个图像识别助手。请用中文描述这张图片：',
  '1. 先用一句话概括图片的主题；',
  '2. 再分点描述主要画面元素、文字内容、颜色与排版布局；',
  '3. 如果图片中包含文字，请尽量准确转述。',
  '回答控制在 300 字以内，不要编造图片中不存在的内容。',
].join('\n');

function lyh_ok(lyh_res, lyh_data, lyh_msg = '操作成功') {
  lyh_res.json({ code: 0, msg: lyh_msg, data: lyh_data });
}

function lyh_fail(lyh_res, lyh_msg, lyh_code = 1, lyh_status = 400) {
  lyh_res.status(lyh_status).json({ code: lyh_code, msg: lyh_msg, data: null });
}

// 根据文件头字节识别真实图片类型
function lyh_detectImageType(lyh_buffer) {
  if (!lyh_buffer || lyh_buffer.length < 12) return null;

  if (lyh_buffer[0] === 0xff && lyh_buffer[1] === 0xd8 && lyh_buffer[2] === 0xff) {
    return { ext: '.jpg', mime: 'image/jpeg' };
  }
  if (lyh_buffer[0] === 0x89 && lyh_buffer[1] === 0x50 && lyh_buffer[2] === 0x4e && lyh_buffer[3] === 0x47) {
    return { ext: '.png', mime: 'image/png' };
  }
  if (lyh_buffer.slice(0, 6).toString('ascii') === 'GIF87a' || lyh_buffer.slice(0, 6).toString('ascii') === 'GIF89a') {
    return { ext: '.gif', mime: 'image/gif' };
  }
  if (
    lyh_buffer.slice(0, 4).toString('ascii') === 'RIFF'
    && lyh_buffer.slice(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { ext: '.webp', mime: 'image/webp' };
  }
  if (lyh_buffer[0] === 0x42 && lyh_buffer[1] === 0x4d) {
    return { ext: '.bmp', mime: 'image/bmp' };
  }
  return null;
}

// 安全删除磁盘文件
function lyh_removeLocalFile(lyh_filePath) {
  if (!lyh_filePath) return;
  fs.promises.unlink(lyh_filePath).catch(() => {});
}

// POST /api/image/describe 上传图片并返回描述
async function lyh_describe(lyh_req, lyh_res, lyh_next) {
  const lyh_uploaded = lyh_req.file;
  if (!lyh_uploaded) return lyh_fail(lyh_res, '请选择要识别的图片');

  let lyh_storedPath = lyh_uploaded.path;

  try {
    const lyh_buffer = await fs.promises.readFile(lyh_uploaded.path);
    const lyh_type = lyh_detectImageType(lyh_buffer);

    if (!lyh_type) {
      lyh_removeLocalFile(lyh_uploaded.path);
      return lyh_fail(lyh_res, '仅支持 jpg / png / gif / webp / bmp 格式的图片');
    }

    // 按真实图片类型统一磁盘文件扩展名，保证静态托管时 MIME 正确
    lyh_storedPath = `${lyh_uploaded.path.replace(/\.[^./\\]+$/, '')}${lyh_type.ext}`;
    if (lyh_storedPath !== lyh_uploaded.path) {
      await fs.promises.rename(lyh_uploaded.path, lyh_storedPath);
    }

    const lyh_apiKey = process.env.SILICONFLOW_API_KEY;
    if (!lyh_apiKey) throw new Error('缺少 SILICONFLOW_API_KEY 配置');

    const lyh_dataUrl = `data:${lyh_type.mime};base64,${lyh_buffer.toString('base64')}`;
    const lyh_body = {
      model: LYH_IMAGE_MODEL,
      messages: [
        {
          role: 'system',
          content: '你是专业的图像识别与描述助手，只描述图片中真实存在的内容。',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: LYH_IMAGE_PROMPT },
            { type: 'image_url', image_url: { url: lyh_dataUrl } },
          ],
        },
      ],
      stream: false,
      max_tokens: 800,
      temperature: 0.5,
    };

    // 控制台输出发送给大模型的数据（base64 过长，仅截断展示）
    const lyh_logBody = JSON.parse(JSON.stringify(lyh_body));
    lyh_logBody.messages[1].content[1].image_url.url = `${lyh_type.mime};base64,<省略 ${
      lyh_buffer.length
    } 字节图片数据>`;
    console.log('\n[lyh_image] ===== 发送给大模型的数据 =====');
    console.log(JSON.stringify(lyh_logBody, null, 2));

    const lyh_response = await fetch(lyh_siliconflowApiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${lyh_apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lyh_body),
    });

    const lyh_text = await lyh_response.text();
    if (!lyh_response.ok) {
      throw new Error(`硅基流动接口返回 ${lyh_response.status}：${lyh_text.slice(0, 300)}`);
    }

    let lyh_json;
    try {
      lyh_json = JSON.parse(lyh_text);
    } catch (lyh_parseErr) {
      throw new Error('大模型返回内容解析失败');
    }

    const lyh_message = lyh_json.choices && lyh_json.choices[0] && lyh_json.choices[0].message;
    const lyh_description = lyh_message && lyh_message.content ? String(lyh_message.content).trim() : '';

    // 控制台输出接收自大模型的数据
    console.log('\n[lyh_image] ===== 接收自大模型的数据 =====');
    console.log(lyh_description || lyh_text.slice(0, 500));
    console.log('[lyh_image] ===== 输出结束 =====\n');

    if (!lyh_description) throw new Error('模型未返回图片描述');

    const lyh_storedName = require('path').basename(lyh_storedPath);
    lyh_ok(
      lyh_res,
      {
        description: lyh_description,
        model: lyh_json.model || LYH_IMAGE_MODEL,
        fileName: lyh_uploaded.originalname,
        fileSize: lyh_buffer.length,
        mimeType: lyh_type.mime,
        imageUrl: `/uploads/${lyh_storedName}`,
      },
      '图片识别成功'
    );
  } catch (lyh_err) {
    console.error('[lyh_image] 图片识别失败：', lyh_err.message);
    lyh_fail(lyh_res, lyh_err.message || '图片识别失败，请稍后重试', 1, 500);
  }
}

module.exports = {
  lyh_describe,
  lyh_detectImageType,
};

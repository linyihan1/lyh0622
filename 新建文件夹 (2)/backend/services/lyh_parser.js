/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-25
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：知识库文件文本解析（支持 txt / md / csv / pdf / doc / docx / ppt / pptx）
 */
const mammoth = require('mammoth');
const { PDFParse } = require('pdf-parse');
const WordExtractor = require('word-extractor');
const JSZip = require('jszip');

// 允许上传的知识库文件格式
const LYH_ALLOWED_EXT = ['.txt', '.md', '.csv', '.pdf', '.doc', '.docx', '.ppt', '.pptx'];

// 纯文本文件解码：兼容 UTF-16LE BOM 与 UTF-8 BOM
function lyh_decodeTextBuffer(lyh_buffer) {
  if (lyh_buffer[0] === 0xff && lyh_buffer[1] === 0xfe) {
    return lyh_buffer.slice(2).toString('utf16le');
  }
  if (lyh_buffer[0] === 0xef && lyh_buffer[1] === 0xbb && lyh_buffer[2] === 0xbf) {
    return lyh_buffer.slice(3).toString('utf8');
  }
  return lyh_buffer.toString('utf8');
}

// 还原 OOXML 中的 XML 实体
function lyh_decodeXml(lyh_text) {
  return lyh_text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

// docx：使用 mammoth 提取纯文本
async function lyh_extractDocx(lyh_buffer) {
  const lyh_result = await mammoth.extractRawText({ buffer: lyh_buffer });
  return lyh_result.value || '';
}

// pdf：使用 pdf-parse v2 提取文本
async function lyh_extractPdf(lyh_buffer) {
  const lyh_parser = new PDFParse({ data: lyh_buffer });
  try {
    const lyh_result = await lyh_parser.getText();
    return lyh_result.text || '';
  } finally {
    if (typeof lyh_parser.destroy === 'function') {
      await lyh_parser.destroy().catch(() => {});
    }
  }
}

// doc：使用 word-extractor 读取 Word 二进制文档
async function lyh_extractDoc(lyh_buffer) {
  const lyh_extractor = new WordExtractor();
  const lyh_doc = await lyh_extractor.extract(lyh_buffer);
  return lyh_doc.getBody() || '';
}

// pptx：直接读取压缩包内各页幻灯片 XML 的 <a:t> 文本节点
async function lyh_extractPptx(lyh_buffer) {
  const lyh_zip = await JSZip.loadAsync(lyh_buffer);
  const lyh_slideNames = Object.keys(lyh_zip.files)
    .filter((lyh_name) => /^ppt\/slides\/slide\d+\.xml$/.test(lyh_name))
    .sort((lyh_a, lyh_b) => {
      const lyh_na = Number((lyh_a.match(/slide(\d+)\.xml$/) || [])[1] || 0);
      const lyh_nb = Number((lyh_b.match(/slide(\d+)\.xml$/) || [])[1] || 0);
      return lyh_na - lyh_nb;
    });

  const lyh_parts = [];
  for (let lyh_i = 0; lyh_i < lyh_slideNames.length; lyh_i += 1) {
    const lyh_xml = await lyh_zip.files[lyh_slideNames[lyh_i]].async('string');
    const lyh_texts = [...lyh_xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)]
      .map((lyh_match) => lyh_decodeXml(lyh_match[1]).trim())
      .filter(Boolean);

    if (lyh_texts.length) {
      lyh_parts.push(`第 ${lyh_i + 1} 页\n${lyh_texts.join('\n')}`);
    }
  }
  return lyh_parts.join('\n\n');
}

// ppt（97-2003 二进制格式）：按 UTF-16LE 可打印文本片段启发式提取
function lyh_extractPpt(lyh_buffer) {
  const lyh_text = lyh_buffer.toString('utf16le');
  const lyh_matches =
    lyh_text.match(/[\u4e00-\u9fa5A-Za-z0-9][\u4e00-\u9fa5A-Za-z0-9\s，。、；：！？（）《》“”‘’·,.;:!?()\-]{3,}/g) || [];

  const lyh_lines = lyh_matches
    .map((lyh_item) => lyh_item.replace(/\s+/g, ' ').trim())
    .filter((lyh_item) => lyh_item.length >= 4 && /[\u4e00-\u9fa5A-Za-z]/.test(lyh_item));

  return [...new Set(lyh_lines)].join('\n');
}

// 统一文本清洗
function lyh_cleanText(lyh_text) {
  return String(lyh_text || '')
    .replace(/\r\n?/g, '\n')
    .replace(/\u0000/g, '')
    .replace(/[ \t\u3000]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * 根据扩展名解析文件文本
 * @param {Buffer} lyh_buffer 文件内容
 * @param {string} lyh_ext 扩展名（含点，小写）
 * @returns {Promise<string>} 清洗后的纯文本
 */
async function lyh_extractText(lyh_buffer, lyh_ext) {
  let lyh_text = '';

  switch (lyh_ext) {
    case '.txt':
    case '.md':
    case '.csv':
      lyh_text = lyh_decodeTextBuffer(lyh_buffer);
      break;
    case '.docx':
      lyh_text = await lyh_extractDocx(lyh_buffer);
      break;
    case '.pdf':
      lyh_text = await lyh_extractPdf(lyh_buffer);
      break;
    case '.doc':
      lyh_text = await lyh_extractDoc(lyh_buffer);
      break;
    case '.pptx':
      lyh_text = await lyh_extractPptx(lyh_buffer);
      break;
    case '.ppt':
      lyh_text = lyh_extractPpt(lyh_buffer);
      break;
    default:
      throw new Error('暂不支持的文件格式：' + lyh_ext);
  }

  return lyh_cleanText(lyh_text);
}

module.exports = {
  LYH_ALLOWED_EXT,
  lyh_extractText,
};

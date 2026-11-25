/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-25
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：知识库文本分片与关键词检索（轻量 RAG 检索层）
 */

// 中文问答中的高频无意义词，不参与检索打分
const LYH_STOP_TERMS = new Set([
  '什么', '怎么', '如何', '请问', '可以', '是否', '我的', '我们', '你们', '一下',
  '哪些', '哪个', '这个', '那个', '以及', '或者', '但是', '然后', '应该', '需要',
  '告诉', '知道', '知识', '文件', '资料', '问题', '内容', '关于', '相关', '介绍',
  '为什', '么样', '有没', '没有', '能否', '是不', '不是', '的话', '一个', '现在',
]);

/**
 * 将长文本切分为若干语义分片
 * @param {string} lyh_text 清洗后的全文
 * @param {number} lyh_maxLen 单个分片最大字符数
 * @returns {Array<{content: string, keywords: string}>}
 */
function lyh_splitText(lyh_text, lyh_maxLen = 420) {
  const lyh_clean = String(lyh_text || '')
    .replace(/\r\n?/g, '\n')
    .replace(/\u0000/g, '')
    .replace(/[ \t\u3000]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!lyh_clean) return [];

  const lyh_paras = lyh_clean
    .split(/\n+/)
    .map((lyh_item) => lyh_item.trim())
    .filter(Boolean);

  const lyh_chunks = [];
  let lyh_buf = '';

  const lyh_pushBuf = () => {
    const lyh_value = lyh_buf.trim();
    if (lyh_value.length >= 10) lyh_chunks.push(lyh_value);
    lyh_buf = '';
  };

  lyh_paras.forEach((lyh_para) => {
    if (lyh_para.length <= lyh_maxLen) {
      if ((lyh_buf + '\n' + lyh_para).length > lyh_maxLen) lyh_pushBuf();
      lyh_buf = lyh_buf ? lyh_buf + '\n' + lyh_para : lyh_para;
      return;
    }

    // 超长段落按中英文句末标点二次切分
    const lyh_sentences = lyh_para.match(/[^。！？!?；;]+[。！？!?；;]?/g) || [lyh_para];
    lyh_sentences.forEach((lyh_sentence) => {
      let lyh_rest = lyh_sentence.trim();

      while (lyh_rest.length > lyh_maxLen) {
        if (lyh_buf) lyh_pushBuf();
        lyh_chunks.push(lyh_rest.slice(0, lyh_maxLen).trim());
        lyh_rest = lyh_rest.slice(lyh_maxLen);
      }

      if (!lyh_rest) return;
      if ((lyh_buf + lyh_rest).length > lyh_maxLen) lyh_pushBuf();
      lyh_buf = lyh_buf ? lyh_buf + lyh_rest : lyh_rest;
    });
  });

  lyh_pushBuf();

  return lyh_chunks.map((lyh_content) => ({
    content: lyh_content,
    keywords: lyh_buildKeywords(lyh_content),
  }));
}

/**
 * 提取分片关键词（中文二元组 + 英文单词，取高频前 12 个）
 */
function lyh_buildKeywords(lyh_content) {
  const lyh_tokens = lyh_analyze(lyh_content);
  const lyh_count = new Map();

  lyh_tokens.forEach((lyh_token) => {
    lyh_count.set(lyh_token, (lyh_count.get(lyh_token) || 0) + 1);
  });

  return [...lyh_count.entries()]
    .sort((lyh_a, lyh_b) => lyh_b[1] - lyh_a[1])
    .slice(0, 12)
    .map((lyh_item) => lyh_item[0])
    .join(',');
}

/**
 * 文本分词：英文/数字按词，中文按二元组
 */
function lyh_analyze(lyh_text) {
  const lyh_lower = String(lyh_text || '').toLowerCase();
  const lyh_latin = lyh_lower.match(/[a-z0-9]{2,}/g) || [];
  const lyh_runs = lyh_lower.match(/[\u4e00-\u9fa5]+/g) || [];
  const lyh_grams = new Set();

  lyh_runs.forEach((lyh_run) => {
    if (lyh_run.length === 1) {
      lyh_grams.add(lyh_run);
      return;
    }
    for (let lyh_i = 0; lyh_i < lyh_run.length - 1; lyh_i += 1) {
      lyh_grams.add(lyh_run.slice(lyh_i, lyh_i + 2));
    }
  });

  return [...new Set([...lyh_latin, ...lyh_grams])];
}

/**
 * 根据用户问题检索最相关的知识库分片
 * @param {Array} lyh_chunks 全部分片（含 file_name / file_ext）
 * @param {string} lyh_question 用户问题
 * @param {number} lyh_topN 返回条数
 * @returns {Array} 带 score 的分片
 */
function lyh_retrieve(lyh_chunks, lyh_question, lyh_topN = 4) {
  const lyh_terms = lyh_analyze(lyh_question).filter(
    (lyh_term) => !LYH_STOP_TERMS.has(lyh_term) && lyh_term.length >= 2
  );
  const lyh_questionLower = String(lyh_question || '').trim().toLowerCase();

  const lyh_scored = lyh_chunks.map((lyh_chunk) => {
    const lyh_content = String(lyh_chunk.content || '').toLowerCase();
    const lyh_fileName = String(lyh_chunk.file_name || '').toLowerCase();
    const lyh_keywords = String(lyh_chunk.keywords || '').toLowerCase();
    let lyh_score = 0;

    lyh_terms.forEach((lyh_term) => {
      const lyh_hits = lyh_content.split(lyh_term).length - 1;
      if (lyh_hits > 0) {
        lyh_score += Math.min(lyh_hits, 3) * (lyh_term.length >= 3 ? 2 : 1);
      }
      if (lyh_fileName.includes(lyh_term)) lyh_score += 2;
      if (lyh_keywords.includes(lyh_term)) lyh_score += 1;
    });

    // 问题原句命中时给予额外权重
    if (lyh_questionLower.length >= 4 && lyh_content.includes(lyh_questionLower)) {
      lyh_score += 8;
    }

    return Object.assign({}, lyh_chunk, { score: lyh_score });
  });

  return lyh_scored
    .filter((lyh_chunk) => lyh_chunk.score > 0)
    .sort((lyh_a, lyh_b) => lyh_b.score - lyh_a.score)
    .slice(0, lyh_topN);
}

module.exports = {
  lyh_splitText,
  lyh_retrieve,
  lyh_analyze,
};

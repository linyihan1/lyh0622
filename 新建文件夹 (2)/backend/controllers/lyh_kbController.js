/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-25
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：知识库控制器（文件上传解析、文件管理、RAG 检索问答）
 */
const fs = require('fs');
const lyh_kbModel = require('../models/lyh_kbModel');
const lyh_parser = require('../services/lyh_parser');
const lyh_retriever = require('../services/lyh_kbRetriever');
const lyh_siliconflow = require('../services/lyh_siliconflow');

const LYH_KB_MODEL = process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V4.1-Flash';
const LYH_HISTORY_LIMIT = 6;
const LYH_TOP_N = 4;

// 知识库问答人设：要求严格依据检索到的资料作答
const LYH_KB_SYSTEM_PROMPT = [
  '你是「云书商城」的知识库智能客服，只能依据给定的知识库资料回答用户问题。',
  '回答要求：',
  '1. 优先使用资料中的原文信息，必要时用简洁的语言归纳；',
  '2. 每条结论后用【资料N】标注来源，N 为资料编号；',
  '3. 资料中没有的信息，直接回答“知识库中暂未收录该信息”，不要编造；',
  '4. 使用中文回答，条理清晰，控制在 300 字以内。',
].join('\n');

function lyh_ok(lyh_res, lyh_data, lyh_msg = '操作成功') {
  lyh_res.json({ code: 0, msg: lyh_msg, data: lyh_data });
}

function lyh_fail(lyh_res, lyh_msg, lyh_code = 1, lyh_status = 400) {
  lyh_res.status(lyh_status).json({ code: lyh_code, msg: lyh_msg, data: null });
}

function lyh_sendEvent(lyh_res, lyh_payload) {
  lyh_res.write(`data: ${JSON.stringify(lyh_payload)}\n\n`);
}

// 修复 multipart 中文文件名乱码
function lyh_decodeFileName(lyh_name) {
  const lyh_raw = String(lyh_name || '');
  if (/^[\x20-\x7e]+$/.test(lyh_raw)) return lyh_raw;

  const lyh_decoded = Buffer.from(lyh_raw, 'latin1').toString('utf8');
  if (lyh_decoded.includes('\uFFFD')) return lyh_raw;
  return lyh_decoded;
}

// 安全删除磁盘文件
function lyh_removeLocalFile(lyh_filePath) {
  if (!lyh_filePath) return;
  fs.promises.unlink(lyh_filePath).catch(() => {});
}

// GET /api/kb/files 知识库文件列表
async function lyh_getFiles(lyh_req, lyh_res, lyh_next) {
  try {
    const lyh_files = await lyh_kbModel.lyh_findFiles();
    const lyh_totalChunks = lyh_files.reduce((lyh_sum, lyh_item) => lyh_sum + lyh_item.chunk_count, 0);
    lyh_ok(lyh_res, { files: lyh_files, totalChunks: lyh_totalChunks });
  } catch (lyh_err) {
    lyh_next(lyh_err);
  }
}

// GET /api/kb/files/:id/chunks 查看文件分片
async function lyh_getFileChunks(lyh_req, lyh_res, lyh_next) {
  try {
    const lyh_fileId = Number(lyh_req.params.id);
    if (!lyh_fileId) return lyh_fail(lyh_res, '文件 ID 不合法');

    const lyh_file = await lyh_kbModel.lyh_findFileById(lyh_fileId);
    if (!lyh_file) return lyh_fail(lyh_res, '知识库文件不存在', 404, 404);

    const lyh_chunks = await lyh_kbModel.lyh_findChunksByFileId(lyh_fileId);
    lyh_ok(lyh_res, { file: lyh_file, chunks: lyh_chunks });
  } catch (lyh_err) {
    lyh_next(lyh_err);
  }
}

// POST /api/kb/upload 上传并解析知识库文件
async function lyh_upload(lyh_req, lyh_res, lyh_next) {
  const lyh_uploaded = lyh_req.file;
  if (!lyh_uploaded) return lyh_fail(lyh_res, '请选择要上传的文件');

  const lyh_storePath = lyh_uploaded.path;
  const lyh_fileName = lyh_decodeFileName(lyh_uploaded.originalname);
  const lyh_ext = require('path').extname(lyh_fileName).toLowerCase();
  try {
    if (!lyh_parser.LYH_ALLOWED_EXT.includes(lyh_ext)) {
      lyh_removeLocalFile(lyh_storePath);
      return lyh_fail(lyh_res, '暂不支持该格式，请上传 txt / md / csv / pdf / doc / docx / ppt / pptx 文件');
    }

    const lyh_buffer = await fs.promises.readFile(lyh_storePath);
    const lyh_text = await lyh_parser.lyh_extractText(lyh_buffer, lyh_ext);

    if (!lyh_text || lyh_text.length < 10) {
      lyh_removeLocalFile(lyh_storePath);
      return lyh_fail(lyh_res, '未能从文件中解析出有效文本，请检查文件内容');
    }

    const lyh_chunks = lyh_retriever.lyh_splitText(lyh_text);
    if (!lyh_chunks.length) {
      lyh_removeLocalFile(lyh_storePath);
      return lyh_fail(lyh_res, '文件内容过短，无法构建知识库分片');
    }

    const lyh_displayName = String(lyh_req.body.name || '').trim().slice(0, 100)
      || lyh_fileName.replace(/\.[^.]+$/, '');

    const lyh_fileId = await lyh_kbModel.lyh_insertFile({
      name: lyh_displayName,
      fileName: lyh_fileName,
      fileExt: lyh_ext.replace('.', ''),
      fileSize: lyh_uploaded.size,
      charCount: lyh_text.length,
      storePath: lyh_storePath,
    });

    await lyh_kbModel.lyh_insertChunks(lyh_fileId, lyh_chunks);
    await lyh_kbModel.lyh_updateChunkCount(lyh_fileId, lyh_chunks.length);

    const lyh_file = await lyh_kbModel.lyh_findFileById(lyh_fileId);
    delete lyh_file.store_path;

    console.log(
      `[lyh_kbUpload] 已解析文件《${lyh_fileName}》(${lyh_ext})，字符数 ${lyh_text.length}，分片数 ${lyh_chunks.length}`
    );
    lyh_ok(lyh_res, lyh_file, '知识库文件上传成功');
  } catch (lyh_err) {
    lyh_removeLocalFile(lyh_storePath);
    console.error('[lyh_kbUpload] 解析失败：', lyh_err.message);
    lyh_fail(lyh_res, '文件解析失败：' + lyh_err.message, 1, 400);
  }
}

// DELETE /api/kb/files/:id 删除知识库文件
async function lyh_deleteFile(lyh_req, lyh_res, lyh_next) {
  try {
    const lyh_fileId = Number(lyh_req.params.id);
    if (!lyh_fileId) return lyh_fail(lyh_res, '文件 ID 不合法');

    const lyh_file = await lyh_kbModel.lyh_findFileById(lyh_fileId);
    if (!lyh_file) return lyh_fail(lyh_res, '知识库文件不存在', 404, 404);

    await lyh_kbModel.lyh_deleteFile(lyh_fileId);
    lyh_removeLocalFile(lyh_file.store_path);

    lyh_ok(lyh_res, { id: lyh_fileId }, '知识库文件已删除');
  } catch (lyh_err) {
    lyh_next(lyh_err);
  }
}

// POST /api/kb/ask 基于知识库的流式问答（SSE）
async function lyh_ask(lyh_req, lyh_res, lyh_next) {
  try {
    const lyh_question = String(lyh_req.body.question || '').trim();
    if (!lyh_question) return lyh_fail(lyh_res, '问题不能为空');
    if (lyh_question.length > 500) return lyh_fail(lyh_res, '问题不能超过 500 字');

    const lyh_history = (Array.isArray(lyh_req.body.history) ? lyh_req.body.history : [])
      .filter((lyh_item) => lyh_item && ['user', 'assistant'].includes(lyh_item.role))
      .slice(-LYH_HISTORY_LIMIT)
      .map((lyh_item) => ({
        role: lyh_item.role,
        content: String(lyh_item.content || '').slice(0, 1200),
      }));

    // 检索：从全部分片中选出最相关的若干片段
    const lyh_chunks = await lyh_kbModel.lyh_findAllChunks();
    const lyh_hits = lyh_retriever.lyh_retrieve(lyh_chunks, lyh_question, LYH_TOP_N);

    const lyh_refs = lyh_hits.map((lyh_hit, lyh_index) => ({
      no: lyh_index + 1,
      fileId: lyh_hit.file_id,
      fileName: lyh_hit.file_name,
      fileExt: lyh_hit.file_ext,
      chunkIndex: lyh_hit.chunk_index,
      score: lyh_hit.score,
      snippet: String(lyh_hit.content || '').slice(0, 160),
    }));

    lyh_res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    lyh_res.flushHeaders && lyh_res.flushHeaders();

    lyh_sendEvent(lyh_res, { type: 'meta', model: LYH_KB_MODEL, refs: lyh_refs });

    // 没有检索到任何相关资料时，不调用大模型
    if (!lyh_hits.length) {
      const lyh_tip = '知识库中暂未收录与该问题相关的信息，请先上传对应的知识库文件，或换一种问法再试。';
      lyh_sendEvent(lyh_res, { type: 'delta', content: lyh_tip });
      lyh_sendEvent(lyh_res, { type: 'done', refs: [] });
      lyh_res.end();
      return;
    }

    console.log(
      '[lyh_kbAsk] 命中分片：',
      lyh_refs.map((lyh_ref) => `《${lyh_ref.fileName}》第${lyh_ref.chunkIndex + 1}段(score=${lyh_ref.score})`).join('；')
    );

    // 组装发送给大模型的数据（系统提示 + 历史对话 + 资料与问题）
    const lyh_context = lyh_hits
      .map((lyh_hit, lyh_index) =>
        `[资料${lyh_index + 1}] 来源：《${lyh_hit.file_name}》第 ${lyh_hit.chunk_index + 1} 段\n${lyh_hit.content}`
      )
      .join('\n\n');

    const lyh_userPrompt = `【知识库资料】\n${lyh_context}\n\n【用户问题】\n${lyh_question}`;
    const lyh_messages = [{ role: 'system', content: LYH_KB_SYSTEM_PROMPT }]
      .concat(lyh_history)
      .concat([{ role: 'user', content: lyh_userPrompt }]);

    // lyh_log：在控制台输出发送给大模型与接收自大模型的完整数据
    const lyh_fullText = await lyh_siliconflow.lyh_streamChat(
      lyh_messages,
      (lyh_delta) => lyh_sendEvent(lyh_res, { type: 'delta', content: lyh_delta }),
      { lyh_log: true }
    );

    lyh_sendEvent(lyh_res, { type: 'done', refs: lyh_refs, length: lyh_fullText.length });
    lyh_res.end();
  } catch (lyh_err) {
    console.error('[lyh_kbAsk] 知识库问答失败：', lyh_err.message);
    if (lyh_res.headersSent) {
      lyh_sendEvent(lyh_res, { type: 'error', msg: lyh_err.message || '知识库问答失败，请稍后重试' });
      lyh_res.end();
    } else {
      lyh_fail(lyh_res, lyh_err.message || '知识库问答失败，请稍后重试', 1, 500);
    }
  }
}

module.exports = {
  lyh_getFiles,
  lyh_getFileChunks,
  lyh_upload,
  lyh_deleteFile,
  lyh_ask,
};

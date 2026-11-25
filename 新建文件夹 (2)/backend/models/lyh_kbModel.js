/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-25
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：知识库文件与文本分片的数据访问层
 */
const lyh_pool = require('../config/lyh_db');

// 知识库文件列表（按上传时间倒序）
async function lyh_findFiles() {
  const [lyh_rows] = await lyh_pool.query(
    `SELECT id, name, file_name, file_ext, file_size, char_count, chunk_count, status, created_at
       FROM lyh_kb_file
      ORDER BY id DESC`
  );
  return lyh_rows;
}

// 按 ID 查询知识库文件
async function lyh_findFileById(lyh_id) {
  const [lyh_rows] = await lyh_pool.query(
    `SELECT id, name, file_name, file_ext, file_size, char_count, chunk_count, store_path, status, created_at
       FROM lyh_kb_file
      WHERE id = ?`,
    [lyh_id]
  );
  return lyh_rows[0] || null;
}

// 查询某个文件的全部分片
async function lyh_findChunksByFileId(lyh_fileId) {
  const [lyh_rows] = await lyh_pool.query(
    `SELECT id, file_id, chunk_index, content, keywords, created_at
       FROM lyh_kb_chunk
      WHERE file_id = ?
      ORDER BY chunk_index ASC, id ASC`,
    [lyh_fileId]
  );
  return lyh_rows;
}

// 查询全部分片（带所属文件名称，供检索使用）
async function lyh_findAllChunks() {
  const [lyh_rows] = await lyh_pool.query(
    `SELECT c.id, c.file_id, c.chunk_index, c.content, c.keywords,
            f.name AS file_name, f.file_ext
       FROM lyh_kb_chunk c
       JOIN lyh_kb_file f ON f.id = c.file_id
      WHERE f.status = 1
      ORDER BY c.file_id ASC, c.chunk_index ASC`
  );
  return lyh_rows;
}

// 新增知识库文件
async function lyh_insertFile(lyh_file) {
  const [lyh_result] = await lyh_pool.query(
    `INSERT INTO lyh_kb_file (name, file_name, file_ext, file_size, char_count, chunk_count, store_path)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      lyh_file.name,
      lyh_file.fileName,
      lyh_file.fileExt,
      lyh_file.fileSize,
      lyh_file.charCount,
      0,
      lyh_file.storePath,
    ]
  );
  return lyh_result.insertId;
}

// 批量新增分片
async function lyh_insertChunks(lyh_fileId, lyh_chunks) {
  if (!lyh_chunks.length) return 0;

  const lyh_rows = lyh_chunks.map((lyh_item, lyh_index) => [
    lyh_fileId,
    lyh_index,
    lyh_item.content,
    lyh_item.keywords,
  ]);

  const [lyh_result] = await lyh_pool.query(
    'INSERT INTO lyh_kb_chunk (file_id, chunk_index, content, keywords) VALUES ?',
    [lyh_rows]
  );
  return lyh_result.affectedRows;
}

// 更新分片数量
async function lyh_updateChunkCount(lyh_fileId, lyh_count) {
  await lyh_pool.query('UPDATE lyh_kb_file SET chunk_count = ? WHERE id = ?', [lyh_count, lyh_fileId]);
}

// 删除知识库文件（同时删除其分片）
async function lyh_deleteFile(lyh_fileId) {
  await lyh_pool.query('DELETE FROM lyh_kb_chunk WHERE file_id = ?', [lyh_fileId]);
  const [lyh_result] = await lyh_pool.query('DELETE FROM lyh_kb_file WHERE id = ?', [lyh_fileId]);
  return lyh_result.affectedRows;
}

module.exports = {
  lyh_findFiles,
  lyh_findFileById,
  lyh_findChunksByFileId,
  lyh_findAllChunks,
  lyh_insertFile,
  lyh_insertChunks,
  lyh_updateChunkCount,
  lyh_deleteFile,
};

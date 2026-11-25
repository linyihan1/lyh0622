/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-20
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：图书与分类数据访问层
 */
const lyh_pool = require('../config/lyh_db');

// 查询全部分类
async function lyh_findCategories() {
  const [rows] = await lyh_pool.query(
    'SELECT id, name, sort FROM lyh_category ORDER BY sort ASC, id ASC'
  );
  return rows;
}

// 分页查询图书列表（支持关键字与分类筛选）
async function lyh_findBooks({ keyword = '', categoryId = 0, page = 1, pageSize = 8 }) {
  const lyh_where = ['b.status = 1'];
  const lyh_params = [];

  if (keyword) {
    lyh_where.push('(b.title LIKE ? OR b.author LIKE ?)');
    lyh_params.push(`%${keyword}%`, `%${keyword}%`);
  }
  if (categoryId) {
    lyh_where.push('b.category_id = ?');
    lyh_params.push(categoryId);
  }

  const lyh_whereSql = `WHERE ${lyh_where.join(' AND ')}`;
  const [lyh_countRows] = await lyh_pool.query(
    `SELECT COUNT(*) AS lyh_total FROM lyh_book b ${lyh_whereSql}`,
    lyh_params
  );

  const lyh_offset = (page - 1) * pageSize;
  const [lyh_rows] = await lyh_pool.query(
    `SELECT b.*, c.name AS lyh_category_name
     FROM lyh_book b
     LEFT JOIN lyh_category c ON b.category_id = c.id
     ${lyh_whereSql}
     ORDER BY b.id ASC
     LIMIT ? OFFSET ?`,
    [...lyh_params, Number(pageSize), Number(lyh_offset)]
  );

  return { list: lyh_rows, total: lyh_countRows[0].lyh_total };
}

// 查询图书详情
async function lyh_findBookById(id) {
  const [rows] = await lyh_pool.query(
    `SELECT b.*, c.name AS lyh_category_name
     FROM lyh_book b
     LEFT JOIN lyh_category c ON b.category_id = c.id
     WHERE b.id = ?`,
    [id]
  );
  return rows[0] || null;
}

module.exports = { lyh_findCategories, lyh_findBooks, lyh_findBookById };

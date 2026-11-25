/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-20
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：借阅记录数据访问层（借书/还书使用事务保证库存一致）
 */
const lyh_pool = require('../config/lyh_db');

// 查询某用户的借阅记录，status 为 null 时查全部
async function lyh_findBorrowsByUser(userId, status) {
  const lyh_params = [userId];
  let lyh_sql = `SELECT r.id, r.user_id, r.book_id, r.borrow_time, r.due_time,
                        r.return_time, r.status, r.remark,
                        b.title AS lyh_book_title, b.author AS lyh_book_author
                 FROM lyh_borrow r
                 LEFT JOIN lyh_book b ON r.book_id = b.id
                 WHERE r.user_id = ?`;
  if (status === 0 || status === 1) {
    lyh_sql += ' AND r.status = ?';
    lyh_params.push(status);
  }
  lyh_sql += ' ORDER BY r.borrow_time DESC';
  const [rows] = await lyh_pool.query(lyh_sql, lyh_params);
  return rows;
}

// 借书：校验库存与重复借阅，库存 -1
async function lyh_createBorrow(userId, bookId) {
  const lyh_conn = await lyh_pool.getConnection();
  try {
    await lyh_conn.beginTransaction();

    const [lyh_books] = await lyh_conn.query(
      'SELECT id, title, stock, status FROM lyh_book WHERE id = ? FOR UPDATE',
      [bookId]
    );
    if (!lyh_books.length) {
      throw { code: 1002, msg: '图书不存在' };
    }
    if (lyh_books[0].status !== 1) {
      throw { code: 1002, msg: '该图书已下架' };
    }
    if (lyh_books[0].stock <= 0) {
      throw { code: 1003, msg: '该图书暂无库存' };
    }

    const [lyh_active] = await lyh_conn.query(
      'SELECT id FROM lyh_borrow WHERE user_id = ? AND book_id = ? AND status = 0 LIMIT 1',
      [userId, bookId]
    );
    if (lyh_active.length) {
      throw { code: 1003, msg: '你已借阅该图书且尚未归还' };
    }

    const [lyh_result] = await lyh_conn.query(
      `INSERT INTO lyh_borrow (user_id, book_id, borrow_time, due_time, status, remark)
       VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 0, '正常借阅')`,
      [userId, bookId]
    );
    await lyh_conn.query('UPDATE lyh_book SET stock = stock - 1 WHERE id = ?', [bookId]);

    await lyh_conn.commit();
    return lyh_result.insertId;
  } catch (lyh_error) {
    await lyh_conn.rollback();
    throw lyh_error;
  } finally {
    lyh_conn.release();
  }
}

// 还书：更新记录为已归还，库存 +1
async function lyh_returnBorrow(borrowId, userId) {
  const lyh_conn = await lyh_pool.getConnection();
  try {
    await lyh_conn.beginTransaction();

    const [lyh_rows] = await lyh_conn.query(
      'SELECT id, user_id, book_id, status FROM lyh_borrow WHERE id = ? FOR UPDATE',
      [borrowId]
    );
    if (!lyh_rows.length) {
      throw { code: 1006, msg: '借阅记录不存在' };
    }
    if (lyh_rows[0].user_id !== Number(userId)) {
      throw { code: 1006, msg: '无权操作他人的借阅记录' };
    }
    if (lyh_rows[0].status === 1) {
      throw { code: 1006, msg: '该图书已归还' };
    }

    await lyh_conn.query(
      'UPDATE lyh_borrow SET status = 1, return_time = NOW() WHERE id = ?',
      [borrowId]
    );
    await lyh_conn.query('UPDATE lyh_book SET stock = stock + 1 WHERE id = ?', [
      lyh_rows[0].book_id
    ]);

    await lyh_conn.commit();
    return true;
  } catch (lyh_error) {
    await lyh_conn.rollback();
    throw lyh_error;
  } finally {
    lyh_conn.release();
  }
}

// 首页统计：图书总数、分类总数、在借数量
async function lyh_findSummary() {
  const [[lyh_bookCount]] = await lyh_pool.query(
    'SELECT COUNT(*) AS lyh_total FROM lyh_book WHERE status = 1'
  );
  const [[lyh_categoryCount]] = await lyh_pool.query(
    'SELECT COUNT(*) AS lyh_total FROM lyh_category'
  );
  const [[lyh_borrowing]] = await lyh_pool.query(
    'SELECT COUNT(*) AS lyh_total FROM lyh_borrow WHERE status = 0'
  );
  return {
    lyh_bookTotal: lyh_bookCount.lyh_total,
    lyh_categoryTotal: lyh_categoryCount.lyh_total,
    lyh_borrowingTotal: lyh_borrowing.lyh_total
  };
}

module.exports = {
  lyh_findBorrowsByUser,
  lyh_createBorrow,
  lyh_returnBorrow,
  lyh_findSummary
};

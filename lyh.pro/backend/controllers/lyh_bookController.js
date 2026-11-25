/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-20
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：图书与分类接口控制器
 */
const { lyh_success, lyh_fail } = require('../utils/lyh_response');
const lyh_bookModel = require('../models/lyh_bookModel');

// GET /api/categories 分类列表
async function lyh_getCategories(req, res, next) {
  try {
    const lyh_list = await lyh_bookModel.lyh_findCategories();
    lyh_success(res, lyh_list, '查询成功');
  } catch (lyh_error) {
    next(lyh_error);
  }
}

// GET /api/books 图书列表（关键字、分类、分页）
async function lyh_getBooks(req, res, next) {
  try {
    const lyh_keyword = (req.query.keyword || '').trim();
    const lyh_categoryId = Number(req.query.categoryId) || 0;
    let lyh_page = Number(req.query.page) || 1;
    let lyh_pageSize = Number(req.query.pageSize) || 8;

    if (lyh_page < 1) lyh_page = 1;
    if (lyh_pageSize < 1 || lyh_pageSize > 50) lyh_pageSize = 8;

    const lyh_result = await lyh_bookModel.lyh_findBooks({
      keyword: lyh_keyword,
      categoryId: lyh_categoryId,
      page: lyh_page,
      pageSize: lyh_pageSize
    });

    lyh_success(
      res,
      { list: lyh_result.list, total: lyh_result.total, page: lyh_page, pageSize: lyh_pageSize },
      '查询成功'
    );
  } catch (lyh_error) {
    next(lyh_error);
  }
}

// GET /api/books/:id 图书详情
async function lyh_getBookDetail(req, res, next) {
  try {
    const lyh_id = Number(req.params.id);
    if (!lyh_id) {
      return lyh_fail(res, 1001, '图书 ID 不合法');
    }
    const lyh_book = await lyh_bookModel.lyh_findBookById(lyh_id);
    if (!lyh_book) {
      return lyh_fail(res, 1002, '图书不存在');
    }
    lyh_success(res, lyh_book, '查询成功');
  } catch (lyh_error) {
    next(lyh_error);
  }
}

module.exports = { lyh_getCategories, lyh_getBooks, lyh_getBookDetail };

/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-20
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：用户登录接口控制器
 */
const { lyh_success, lyh_fail } = require('../utils/lyh_response');
const lyh_userModel = require('../models/lyh_userModel');

// POST /api/users/login 登录
async function lyh_login(req, res, next) {
  try {
    const lyh_username = (req.body.username || '').trim();
    const lyh_password = req.body.password || '';

    if (!lyh_username || !lyh_password) {
      return lyh_fail(res, 1001, '账号和密码不能为空');
    }

    const lyh_user = await lyh_userModel.lyh_findUserByUsername(lyh_username);
    if (!lyh_user || lyh_user.password !== lyh_password) {
      return lyh_fail(res, 1005, '账号或密码错误');
    }
    if (lyh_user.status !== 1) {
      return lyh_fail(res, 1005, '账号已被禁用');
    }

    lyh_success(
      res,
      {
        id: lyh_user.id,
        username: lyh_user.username,
        realName: lyh_user.real_name,
        studentNo: lyh_user.student_no,
        phone: lyh_user.phone,
        role: lyh_user.role
      },
      '登录成功'
    );
  } catch (lyh_error) {
    next(lyh_error);
  }
}

// GET /api/users/:id 用户信息
async function lyh_getUser(req, res, next) {
  try {
    const lyh_id = Number(req.params.id);
    if (!lyh_id) {
      return lyh_fail(res, 1001, '用户 ID 不合法');
    }
    const lyh_user = await lyh_userModel.lyh_findUserById(lyh_id);
    if (!lyh_user) {
      return lyh_fail(res, 1004, '用户不存在');
    }
    lyh_success(res, lyh_user, '查询成功');
  } catch (lyh_error) {
    next(lyh_error);
  }
}

module.exports = { lyh_login, lyh_getUser };

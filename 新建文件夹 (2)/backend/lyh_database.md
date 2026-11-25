# 数据库变更记录（按执行顺序追加，禁止覆盖）

数据库：MySQL 9.0，字符集 utf8mb4。仅凭本文件即可在新机器上重建完整数据库。

---

## 2026-11-20 14:00 初始化数据库与四张业务表

```sql
CREATE DATABASE IF NOT EXISTS lyh_pro DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE lyh_pro;

-- 图书分类表
CREATE TABLE IF NOT EXISTS lyh_category (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  name VARCHAR(30) NOT NULL COMMENT '分类名称',
  sort INT NOT NULL DEFAULT 0 COMMENT '排序值',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图书分类表';

-- 图书表
CREATE TABLE IF NOT EXISTS lyh_book (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '图书ID',
  title VARCHAR(100) NOT NULL COMMENT '书名',
  author VARCHAR(60) NOT NULL COMMENT '作者',
  publisher VARCHAR(80) DEFAULT NULL COMMENT '出版社',
  isbn VARCHAR(20) DEFAULT NULL COMMENT 'ISBN',
  category_id INT UNSIGNED NOT NULL COMMENT '分类ID',
  price DECIMAL(8,2) NOT NULL DEFAULT 0.00 COMMENT '定价',
  publish_year INT DEFAULT NULL COMMENT '出版年份',
  stock INT NOT NULL DEFAULT 0 COMMENT '可借库存',
  intro VARCHAR(600) DEFAULT NULL COMMENT '简介',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1上架 0下架',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id),
  KEY idx_lyh_book_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图书表';

-- 用户表
CREATE TABLE IF NOT EXISTS lyh_user (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  username VARCHAR(30) NOT NULL COMMENT '登录账号',
  password VARCHAR(64) NOT NULL COMMENT '密码',
  real_name VARCHAR(30) NOT NULL COMMENT '姓名',
  student_no VARCHAR(20) DEFAULT NULL COMMENT '学号',
  phone VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  role TINYINT NOT NULL DEFAULT 0 COMMENT '0学生 1管理员',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1正常 0禁用',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_lyh_user_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 借阅记录表
CREATE TABLE IF NOT EXISTS lyh_borrow (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '借阅ID',
  user_id INT UNSIGNED NOT NULL COMMENT '用户ID',
  book_id INT UNSIGNED NOT NULL COMMENT '图书ID',
  borrow_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '借出时间',
  due_time DATETIME NOT NULL COMMENT '应还时间',
  return_time DATETIME DEFAULT NULL COMMENT '归还时间',
  status TINYINT NOT NULL DEFAULT 0 COMMENT '0借阅中 1已归还',
  remark VARCHAR(100) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (id),
  KEY idx_lyh_borrow_user (user_id),
  KEY idx_lyh_borrow_book (book_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='借阅记录表';
```

## 2026-11-20 14:00 插入测试数据

```sql
USE lyh_pro;

INSERT INTO lyh_category (name, sort) VALUES
('文学', 1),
('计算机', 2),
('历史', 3),
('经济管理', 4),
('艺术', 5),
('哲学', 6),
('科普', 7),
('外语', 8);

INSERT INTO lyh_book (title, author, publisher, isbn, category_id, price, publish_year, stock, intro, status) VALUES
('活着', '余华', '作家出版社', '9787506365437', 1, 45.00, 2012, 5, '讲述农村人福贵一生的苦难与坚韧，余华代表作。', 1),
('白夜行', '东野圭吾', '南海出版公司', '9787544258609', 1, 39.50, 2013, 4, '日本推理小说经典，围绕一桩命案展开的漫长追查。', 1),
('三体', '刘慈欣', '重庆出版社', '9787536692930', 1, 58.00, 2008, 8, '科幻史诗“地球往事”三部曲第一部，雨果奖获奖作品。', 1),
('深入理解计算机系统', '兰德尔·E·布莱恩特', '机械工业出版社', '9787111544937', 2, 139.00, 2016, 3, '从程序员视角系统讲解计算机底层原理，CSAPP 经典教材。', 1),
('JavaScript高级程序设计', '马特·弗里斯比', '人民邮电出版社', '9787115545381', 2, 129.00, 2020, 6, '前端开发权威指南，覆盖 ES6+ 与浏览器编程实践。', 1),
('算法导论', '托马斯·科尔曼', '机械工业出版社', '9787111407010', 2, 128.00, 2013, 2, '算法领域经典教材，系统讲解算法设计与复杂度分析。', 1),
('人类简史', '尤瓦尔·赫拉利', '中信出版社', '9787508647357', 3, 68.00, 2014, 5, '从认知革命到科学革命，重新梳理人类文明发展脉络。', 1),
('万历十五年', '黄仁宇', '中华书局', '9787101114600', 3, 32.00, 2016, 4, '以 1587 年为切口，剖析明代政治与制度困境。', 1),
('经济学原理', 'N.格里高利·曼昆', '北京大学出版社', '9787301256909', 4, 88.00, 2015, 5, '微观与宏观经济学入门经典教材。', 1),
('穷查理宝典', '彼得·考夫曼', '中信出版社', '9787508640778', 4, 128.00, 2016, 3, '查理·芒格的演讲与思想合集，多元思维模型指南。', 1),
('艺术的故事', '贡布里希', '广西美术出版社', '9787549416776', 5, 280.00, 2015, 2, '西方艺术史通识经典，图文并茂讲述艺术发展。', 1),
('苏菲的世界', '乔斯坦·贾德', '作家出版社', '9787506394671', 6, 42.00, 2017, 6, '以小说形式讲述西方哲学史，哲学启蒙读物。', 1),
('时间简史', '史蒂芬·霍金', '湖南科学技术出版社', '9787535732309', 7, 45.00, 2010, 5, '面向大众讲解宇宙起源、黑洞与时间本质。', 1),
('新概念英语2', 'L.G.亚历山大', '外语教学与研究出版社', '9787560086326', 8, 39.90, 2009, 10, '经典英语学习教材第二册，实践与进步。', 1);

INSERT INTO lyh_user (username, password, real_name, student_no, phone, role, status) VALUES
('admin', '123456', '管理员', '24002120000', '13800000000', 1, 1),
('linyihan', '123456', '林奕含', '24002120622', '13800000001', 0, 1),
('zhangsan', '123456', '张三', '24002120623', '13800000002', 0, 1),
('lisi', '123456', '李四', '24002120624', '13800000003', 0, 1),
('wangwu', '123456', '王五', '24002120625', '13800000004', 0, 1),
('zhaoliu', '123456', '赵六', '24002120626', '13800000005', 0, 1),
('sunqi', '123456', '孙七', '24002120627', '13800000006', 0, 1),
('zhouba', '123456', '周八', '24002120628', '13800000007', 0, 1);

INSERT INTO lyh_borrow (user_id, book_id, borrow_time, due_time, return_time, status, remark) VALUES
(2, 1, '2026-11-01 09:20:00', '2026-12-01 09:20:00', NULL, 0, '正常借阅'),
(2, 5, '2026-10-20 14:00:00', '2026-11-20 14:00:00', '2026-11-15 10:30:00', 1, '已按时归还'),
(3, 3, '2026-11-05 10:10:00', '2026-12-05 10:10:00', NULL, 0, '正常借阅'),
(3, 9, '2026-10-12 16:40:00', '2026-11-12 16:40:00', '2026-11-18 09:00:00', 1, '逾期 6 天归还'),
(4, 7, '2026-11-08 11:00:00', '2026-12-08 11:00:00', NULL, 0, '正常借阅'),
(5, 4, '2026-10-30 15:25:00', '2026-11-30 15:25:00', NULL, 0, '正常借阅'),
(5, 11, '2026-09-28 09:05:00', '2026-10-28 09:05:00', '2026-10-27 17:10:00', 1, '已按时归还'),
(6, 12, '2026-11-10 13:15:00', '2026-12-10 13:15:00', NULL, 0, '正常借阅'),
(7, 13, '2026-10-05 08:50:00', '2026-11-05 08:50:00', '2026-11-02 09:30:00', 1, '已按时归还'),
(8, 2, '2026-11-16 10:00:00', '2026-12-16 10:00:00', NULL, 0, '正常借阅'),
(4, 14, '2026-09-15 14:20:00', '2026-10-15 14:20:00', '2026-10-14 10:00:00', 1, '已按时归还'),
(6, 6, '2026-11-18 16:00:00', '2026-12-18 16:00:00', NULL, 0, '正常借阅');
```

## 2026-11-25 13:50 新增 AI 聊天会话表与消息表

```sql
USE lyh_pro;

-- 聊天会话表
CREATE TABLE IF NOT EXISTS lyh_chat_session (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '会话ID',
  title VARCHAR(50) NOT NULL COMMENT '会话标题',
  model VARCHAR(60) NOT NULL COMMENT '使用的模型',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最近消息时间',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI聊天会话表';

-- 聊天消息表
CREATE TABLE IF NOT EXISTS lyh_chat_message (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '消息ID',
  session_id INT UNSIGNED NOT NULL COMMENT '会话ID',
  role VARCHAR(12) NOT NULL COMMENT '角色：user/assistant',
  content TEXT NOT NULL COMMENT '消息内容',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
  PRIMARY KEY (id),
  KEY idx_lyh_chat_message_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI聊天消息表';
```

## 2026-11-25 13:50 插入聊天测试数据

```sql
USE lyh_pro;

INSERT INTO lyh_chat_session (title, model, created_at, updated_at) VALUES
('MySQL 索引优化思路', 'deepseek-ai/DeepSeek-V4.1-Flash', '2026-11-21 09:10:00', '2026-11-21 09:18:00'),
('Express 中间件执行顺序', 'deepseek-ai/DeepSeek-V4.1-Flash', '2026-11-22 14:30:00', '2026-11-22 14:36:00'),
('毕业设计选题建议', 'deepseek-ai/DeepSeek-V4.1-Flash', '2026-11-24 20:05:00', '2026-11-24 20:12:00');

INSERT INTO lyh_chat_message (session_id, role, content, created_at) VALUES
(1, 'user', 'MySQL 中给经常作为查询条件的字段建索引，需要注意什么？', '2026-11-21 09:10:00'),
(1, 'assistant', '优先给高频出现在 WHERE、JOIN、ORDER BY 中的字段建索引，并注意：1）区分度低的字段（如性别）收益很小；2）联合索引遵循最左前缀原则；3）索引会拖慢写入并占用磁盘；4）避免在索引列上使用函数或隐式类型转换，否则会失效。', '2026-11-21 09:11:00'),
(1, 'user', '联合索引 (a, b, c) 能命中 where b = 1 吗？', '2026-11-21 09:16:00'),
(1, 'assistant', '不能。联合索引 (a, b, c) 必须从最左列 a 开始匹配，只查 b 或 c 无法使用该索引。若 b 的查询也很频繁，建议单独建 (b) 或在业务上调整查询条件。', '2026-11-21 09:18:00'),
(2, 'user', 'Express 的中间件是按什么顺序执行的？', '2026-11-22 14:30:00'),
(2, 'assistant', '按注册顺序依次执行。每个中间件接收 (req, res, next)，调用 next() 才会进入下一个；注册在路由之前的中间件会先执行，错误处理中间件有四个参数且放在最后。', '2026-11-22 14:31:00'),
(2, 'user', '那 express.json() 应该放在路由前面还是后面？', '2026-11-22 14:35:00'),
(2, 'assistant', '必须放在路由前面，否则路由处理函数里拿不到 req.body。同时建议再前面放 cors()，让跨域预检请求也能被统一处理。', '2026-11-22 14:36:00'),
(3, 'user', '我在做一个图书借阅管理系统，毕业设计还能加什么亮点？', '2026-11-24 20:05:00'),
(3, 'assistant', '可以在现有借还功能上增加：1）借阅数据分析图表，如月度借阅趋势、热门分类；2）基于借阅记录的简单图书推荐；3）逾期提醒与信用分；4）接入大模型做图书摘要和智能问答。', '2026-11-24 20:06:00'),
(3, 'user', '接入大模型的话，用哪个模型比较合适？', '2026-11-24 20:11:00'),
(3, 'assistant', '课程作业建议使用硅基流动平台的 DeepSeek 系列模型，接口兼容 OpenAI 规范，按量计费成本低，支持流式输出，适合做图书摘要、借阅咨询这类场景。', '2026-11-24 20:12:00');
```

## 2026-11-25 14:05 补充聊天测试数据（会话补足 8 条）

```sql
USE lyh_pro;

INSERT INTO lyh_chat_session (title, model, created_at, updated_at) VALUES
('CSS Flex 布局常见问题', 'deepseek-ai/DeepSeek-V4.1-Flash', '2026-11-23 09:20:00', '2026-11-23 09:22:00'),
('JavaScript 数组去重方法', 'deepseek-ai/DeepSeek-V4.1-Flash', '2026-11-23 10:05:00', '2026-11-23 10:07:00'),
('Node.js 文件上传处理', 'deepseek-ai/DeepSeek-V4.1-Flash', '2026-11-23 15:40:00', '2026-11-23 15:43:00'),
('Git 分支合并冲突处理', 'deepseek-ai/DeepSeek-V4.1-Flash', '2026-11-23 19:10:00', '2026-11-23 19:12:00'),
('毕业答辩 PPT 结构建议', 'deepseek-ai/DeepSeek-V4.1-Flash', '2026-11-24 21:30:00', '2026-11-24 21:33:00');

INSERT INTO lyh_chat_message (session_id, role, content, created_at) VALUES
((SELECT id FROM lyh_chat_session WHERE title = 'CSS Flex 布局常见问题' LIMIT 1), 'user', 'flex 布局里子元素设置 width 不生效，是什么原因？', '2026-11-23 09:20:00'),
((SELECT id FROM lyh_chat_session WHERE title = 'CSS Flex 布局常见问题' LIMIT 1), 'assistant', '常见原因是父容器设置了 flex-shrink，子元素空间不足时会被压缩。可给子元素加 flex-shrink: 0，或者改用 flex-basis 控制基准宽度。', '2026-11-23 09:22:00'),
((SELECT id FROM lyh_chat_session WHERE title = 'JavaScript 数组去重方法' LIMIT 1), 'user', 'JS 里给数组去重有哪几种写法？', '2026-11-23 10:05:00'),
((SELECT id FROM lyh_chat_session WHERE title = 'JavaScript 数组去重方法' LIMIT 1), 'assistant', '最常用的是 [...new Set(arr)]；需要兼容旧环境可以用 filter 加 indexOf；对象数组去重则建议用 Map 按唯一字段记录。', '2026-11-23 10:07:00'),
((SELECT id FROM lyh_chat_session WHERE title = 'Node.js 文件上传处理' LIMIT 1), 'user', 'Express 里上传文件用哪个中间件比较合适？', '2026-11-23 15:40:00'),
((SELECT id FROM lyh_chat_session WHERE title = 'Node.js 文件上传处理' LIMIT 1), 'assistant', '一般用 multer：支持磁盘和内存存储，可以限制文件大小与类型。表单需要设置 enctype 为 multipart/form-data，后端再把文件路径保存到数据库。', '2026-11-23 15:43:00'),
((SELECT id FROM lyh_chat_session WHERE title = 'Git 分支合并冲突处理' LIMIT 1), 'user', '合并分支出现冲突时应该怎么处理？', '2026-11-23 19:10:00'),
((SELECT id FROM lyh_chat_session WHERE title = 'Git 分支合并冲突处理' LIMIT 1), 'assistant', '先手动编辑冲突文件中的 <<<<<<< 标记区，保留正确内容并删除标记；然后 git add 标记为已解决，最后 git commit 完成合并。', '2026-11-23 19:12:00'),
((SELECT id FROM lyh_chat_session WHERE title = '毕业答辩 PPT 结构建议' LIMIT 1), 'user', '毕业答辩 PPT 一般分几部分比较合适？', '2026-11-24 21:30:00'),
((SELECT id FROM lyh_chat_session WHERE title = '毕业答辩 PPT 结构建议' LIMIT 1), 'assistant', '建议 5 部分：选题背景与意义、需求分析、系统设计与数据库、功能演示、总结与展望，控制在 12 到 15 页，重点放在设计与演示上。', '2026-11-24 21:33:00');
```

## 2026-11-25 14:15 新增在线客服三张表并插入测试数据

```sql
USE lyh_pro;

-- 客服常见问题表
CREATE TABLE IF NOT EXISTS lyh_service_faq (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '问题ID',
  question VARCHAR(200) NOT NULL COMMENT '常见问题',
  answer VARCHAR(600) NOT NULL COMMENT '标准答复',
  category VARCHAR(20) NOT NULL COMMENT '问题分类',
  sort INT NOT NULL DEFAULT 0 COMMENT '排序值',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客服常见问题表';

-- 在线客服会话表
CREATE TABLE IF NOT EXISTS lyh_service_session (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '会话ID',
  visitor_name VARCHAR(30) NOT NULL COMMENT '访客名称',
  status TINYINT NOT NULL DEFAULT 0 COMMENT '0进行中 1已结束',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后消息时间',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='在线客服会话表';

-- 在线客服消息表
CREATE TABLE IF NOT EXISTS lyh_service_message (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '消息ID',
  session_id INT UNSIGNED NOT NULL COMMENT '会话ID',
  role VARCHAR(12) NOT NULL COMMENT '角色：user/assistant',
  content TEXT NOT NULL COMMENT '消息内容',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
  PRIMARY KEY (id),
  KEY idx_lyh_service_message_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='在线客服消息表';

INSERT INTO lyh_service_faq (question, answer, category, sort) VALUES
('下单后多久发货？', '现货图书在付款后 24 小时内发出，预售图书以商品页标注的发货时间为准，节假日顺延。', '订单', 1),
('怎么查询物流信息？', '进入“我的订单”，点击对应订单的“查看物流”即可看到快递公司与运单跟踪信息。', '物流', 2),
('图书支持七天无理由退换吗？', '支持。签收后 7 天内、商品不影响二次销售可申请退换，运费规则以页面提示为准。', '售后', 3),
('优惠券可以叠加使用吗？', '同一订单仅可使用一张优惠券，优惠券不可与限时秒杀折扣叠加。', '优惠', 4),
('如何开具发票？', '下单时可选择开具电子发票，填写抬头与税号，订单完成后 1 个工作日内发送到预留邮箱。', '发票', 5),
('会员积分怎么获得和使用？', '每消费 1 元累计 1 积分，积分可在会员中心兑换优惠券，积分有效期为获得后 12 个月。', '会员', 6),
('支持哪些支付方式？', '支持微信支付、支付宝、银联卡支付，企业采购可选择对公转账。', '支付', 7),
('偏远地区配送吗？', '全国范围内均可配送，新疆、西藏、内蒙古部分地区运费另计，下单时页面会提示具体金额。', '物流', 8);

INSERT INTO lyh_service_session (visitor_name, status, created_at, updated_at) VALUES
('访客1024', 1, '2026-11-20 10:12:00', '2026-11-20 10:15:00'),
('访客2048', 1, '2026-11-20 15:40:00', '2026-11-20 15:44:00'),
('访客3301', 1, '2026-11-21 09:05:00', '2026-11-21 09:08:00'),
('访客4512', 1, '2026-11-22 14:22:00', '2026-11-22 14:26:00'),
('访客5127', 1, '2026-11-22 19:31:00', '2026-11-22 19:33:00'),
('访客6608', 1, '2026-11-23 11:18:00', '2026-11-23 11:21:00'),
('访客7309', 1, '2026-11-24 16:02:00', '2026-11-24 16:05:00'),
('访客8806', 0, '2026-11-25 13:20:00', '2026-11-25 13:22:00');

INSERT INTO lyh_service_message (session_id, role, content, created_at) VALUES
(1, 'user', '我昨天买的书什么时候能发货？', '2026-11-20 10:12:00'),
(1, 'assistant', '您好，现货图书一般在付款后 24 小时内发出。您可以在“我的订单”中查看发货状态，发货后会同步物流单号。', '2026-11-20 10:15:00'),
(2, 'user', '收到的书封面有折损，可以换货吗？', '2026-11-20 15:40:00'),
(2, 'assistant', '非常抱歉给您带来不好的体验。签收后 7 天内可申请换货，请在订单页提交售后申请并上传商品照片，我们会尽快为您处理。', '2026-11-20 15:44:00'),
(3, 'user', '优惠券和满减活动能一起用吗？', '2026-11-21 09:05:00'),
(3, 'assistant', '同一订单只能使用一张优惠券，且不与限时秒杀折扣叠加。若商品页标注可叠加，则以商品页说明为准。', '2026-11-21 09:08:00'),
(4, 'user', '订单支付成功但显示待付款，怎么处理？', '2026-11-22 14:22:00'),
(4, 'assistant', '这可能是支付渠道回调延迟，一般 5 分钟内会自动更新。若超过 10 分钟仍未更新，请提供订单号，我帮您转人工核实。', '2026-11-22 14:26:00'),
(5, 'user', '可以开公司抬头的发票吗？', '2026-11-22 19:31:00'),
(5, 'assistant', '可以。下单时选择电子发票并填写公司名称与税号，订单完成后 1 个工作日内会发送到您预留的邮箱。', '2026-11-22 19:33:00'),
(6, 'user', '会员积分多久过期？', '2026-11-23 11:18:00'),
(6, 'assistant', '积分自获得之日起 12 个月内有效，过期后自动清零。您可以在会员中心查看每笔积分的到期时间。', '2026-11-23 11:21:00'),
(7, 'user', '我在西藏，配送需要额外运费吗？', '2026-11-24 16:02:00'),
(7, 'assistant', '西藏地区部分区域需要额外运费，具体金额会在结算页根据收货地址自动计算。若显示无法配送，可联系人工客服协助下单。', '2026-11-24 16:05:00'),
(8, 'user', '有什么适合大学生读的计算机入门书推荐？', '2026-11-25 13:20:00'),
(8, 'assistant', '可以看看《深入理解计算机系统》和《JavaScript 高级程序设计》，前者打基础，后者适合做前端。您也可以告诉我具体方向，我帮您筛选。', '2026-11-25 13:22:00');
```

---

## 2026-11-25 14:15 新增知识库（RAG）两张表

```sql
-- 知识库文件表
CREATE TABLE IF NOT EXISTS lyh_kb_file (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '文件ID',
  name VARCHAR(200) NOT NULL COMMENT '知识库文件展示名',
  file_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
  file_ext VARCHAR(20) NOT NULL COMMENT '扩展名',
  file_size INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '文件大小（字节）',
  char_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '解析字符数',
  chunk_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '分片数量',
  store_path VARCHAR(300) DEFAULT NULL COMMENT '服务器存储路径',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1可用 0不可用',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  PRIMARY KEY (id),
  KEY idx_lyh_kb_file_ext (file_ext)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库文件表';

-- 知识库文本分片表
CREATE TABLE IF NOT EXISTS lyh_kb_chunk (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分片ID',
  file_id INT UNSIGNED NOT NULL COMMENT '所属文件ID',
  chunk_index INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '分片序号（从0开始）',
  content TEXT NOT NULL COMMENT '分片文本',
  keywords VARCHAR(500) NOT NULL DEFAULT '' COMMENT '关键字（逗号分隔）',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id),
  KEY idx_lyh_kb_chunk_file (file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库文本分片表';
```

### 测试数据：lyh_kb_file（8 条）

```sql
INSERT INTO lyh_kb_file (id, name, file_name, file_ext, file_size, char_count, chunk_count, store_path, created_at) VALUES
(1, '新员工入职指引', '新员工入职指引.pdf', 'pdf', 245760, 18600, 42, NULL, '2026-11-18 09:20:00'),
(2, '图书采购与入库流程', '图书采购与入库流程.docx', 'docx', 98304, 7200, 18, NULL, '2026-11-18 14:05:00'),
(3, '门店收银操作规范', '门店收银操作规范.doc', 'doc', 154624, 12400, 30, NULL, '2026-11-19 10:12:00'),
(4, '客服话术标准手册', '客服话术标准手册.txt', 'txt', 20480, 9800, 22, NULL, '2026-11-19 16:40:00'),
(5, '会员积分规则说明', '会员积分规则说明.md', 'md', 12288, 4300, 10, NULL, '2026-11-20 09:05:00'),
(6, '2026年度促销活动方案', '2026年度促销活动方案.pptx', 'pptx', 327680, 15600, 35, NULL, '2026-11-20 15:30:00'),
(7, '图书破损赔付标准', '图书破损赔付标准.pdf', 'pdf', 81920, 5400, 14, NULL, '2026-11-21 11:18:00'),
(8, '线上订单发货时效说明', '线上订单发货时效说明.txt', 'txt', 6144, 2100, 6, NULL, '2026-11-21 17:02:00');
```

### 测试数据：lyh_kb_chunk（8 条）

```sql
INSERT INTO lyh_kb_chunk (file_id, chunk_index, content, keywords) VALUES
(1, 0, '新员工入职当天需携带身份证、学历证明和一寸照片，到人力资源部办理入职登记并领取工牌；试用期为三个月，转正需提交转正申请与工作总结。', '入职,试用期,工牌'),
(2, 0, '图书采购由采购部根据库存与销量制定月度采购计划，供应商到货后需在 24 小时内完成验收，核对书名、ISBN、数量和品相后录入库存系统。', '采购,验收入库,库存'),
(3, 0, '门店收银需遵循“唱收唱付”原则，收款后当面点清并打印小票；出现长短款时须当班登记，超过 50 元需店长签字确认。', '收银,长短款,小票'),
(4, 0, '客服接起电话应使用标准问候语“您好，云书商城很高兴为您服务”，倾听客户问题时不打断，结束通话前需复述处理结果并致谢。', '客服话术,问候语'),
(5, 0, '会员每消费 1 元累计 1 积分，积分可在结算时按 100 积分抵 1 元使用；积分自产生之日起两年内有效，逾期自动清零。', '积分,抵扣,有效期'),
(6, 0, '2026 年度促销分为开学季、世界读书日和双十一三档，主推满 200 减 30、指定童书五折以及会员专享券三类活动。', '促销,满减,读书日'),
(7, 0, '图书在运输过程中出现破损，签收时应当场拍照并拒收；已签收的破损件需在 48 小时内提交赔付申请，按图书定价的 80% 进行赔付。', '破损,赔付,拒收'),
(8, 0, '线上订单在每日 15:00 前付款当日发出，15:00 后付款次日发出；偏远地区默认顺丰陆运，预计 3 至 5 天送达。', '发货时效,物流,顺丰');
```

### 示例知识库文件

两个示例文件由 `backend/knowledge/lyh_buildSamples.js` 生成，保存在 `backend/knowledge/`：

- `云书商城售后服务手册.docx`
- `云书商城会员与借阅制度.pptx`

重建数据库后，可通过知识库页面或 `POST /api/kb/upload` 上传这两个文件，系统会自动解析、切分并写入 `lyh_kb_file` 与 `lyh_kb_chunk`。

修改时间：2026-11-25 14:25

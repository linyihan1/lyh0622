<!--
  姓名：林奕含| 学号：24002120622 |
  时间：2026-11-20 | 大模型：Trae
-->

# lyh_database.md

> 每次建表、改表或插入数据后，按执行顺序追加对应 SQL 语句（含测试数据的 INSERT）。
> 一律追加写入，禁止覆盖已有内容。要求仅凭此文件即可在新机器上完整重建数据库。
> 数据库连接：host=127.0.0.1，port=3306，user=root，password=Lin787806@（凭据见 backend/.env）

---

## 1. 创建数据库 lyh_db

```sql
CREATE DATABASE IF NOT EXISTS lyh_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lyh_db;
```

## 2. 创建科技新闻表 lyh_news

```sql
DROP TABLE IF EXISTS lyh_news;
CREATE TABLE lyh_news (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  title VARCHAR(200) NOT NULL COMMENT '新闻标题',
  summary VARCHAR(500) NOT NULL DEFAULT '' COMMENT '新闻摘要',
  content TEXT COMMENT '新闻正文',
  source VARCHAR(100) NOT NULL DEFAULT '' COMMENT '来源',
  publish_time DATETIME NOT NULL COMMENT '发布时间',
  cover_img VARCHAR(500) NOT NULL DEFAULT '' COMMENT '封面图片URL',
  PRIMARY KEY (id),
  KEY idx_publish_time (publish_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='科技新闻表';
```

## 3. 插入 8 条科技新闻测试数据

```sql
INSERT INTO lyh_news (title, summary, content, source, publish_time, cover_img) VALUES
('英伟达发布 Blackwell 架构 RTX 50 系列显卡', '英伟达在 CES 2025 上正式发布基于 Blackwell 架构的 GeForce RTX 50 系列显卡，性能与能效大幅提升。', '英伟达于 2025 年 1 月在 CES 展会发布 GeForce RTX 5090、5080 等新一代显卡，采用 Blackwell 架构，集成 Tensor Core 与 RT Core，AI 绘图与光追性能显著提升，功耗控制更为出色。', '英伟达官网', '2025-01-06 10:00:00', '/images/news-cover-1.jpg'),
('谷歌发布 Gemini 2.0 多模态大模型', '谷歌 DeepMind 推出 Gemini 2.0，支持原生多模态理解，在推理与代码生成 benchmarks 上取得领先表现。', '2024 年 12 月，谷歌发布 Gemini 2.0 系列模型，包含 Flash 与 Pro 版本，原生支持视频、音频与图像理解，上下文窗口扩展，并在 MMLU、HumanEval 等评测中刷新纪录。', 'Google Blog', '2024-12-11 09:00:00', '/images/news-cover-2.jpg'),
('微软推出 Copilot+ PC 与 Recall 功能', '微软发布 Copilot+ PC 计划，结合 NPU 硬件实现 Recall 语义搜索与实时 AI 辅助功能。', '微软在 2024 年 5 月推出 Copilot+ PC，要求设备配备 40 TOPS 以上 NPU，带来 Recall 可记忆搜索、Cocreator 实时绘图、语音翻译等本地 AI 功能，首批设备由戴尔、联想、惠普等厂商推出。', 'Microsoft', '2024-05-20 11:00:00', '/images/news-cover-3.jpg'),
('OpenAI 发布多模态大模型 GPT-4o', 'OpenAI 推出 GPT-4o，可实时处理语音、图像与文本，交互延迟降至毫秒级。', 'OpenAI 在 2024 年 5 月发布 GPT-4o（omni），原生支持文本、语音、图像输入与语音输出，实时语音对话延迟降至 300ms 级别，视觉理解能力增强，免费用户也可体验。', 'OpenAI', '2024-05-14 10:00:00', '/images/news-cover-4.jpg'),
('DeepMind 发布 AlphaFold 3 预测生命分子结构', 'AlphaFold 3 可预测蛋白质、DNA、RNA 及配体的复合体结构，助力药物研发。', '谷歌 DeepMind 于 2024 年 5 月在《Nature》发表 AlphaFold 3，能够预测包含蛋白质、核酸、小分子配体的生物分子复合体结构，准确率大幅提升，为新药设计与疾病机理研究提供强力工具。', 'Nature', '2024-05-08 16:00:00', '/images/news-cover-5.jpg'),
('苹果 Vision Pro 头显正式开售', '苹果首款空间计算设备 Vision Pro 在美国正式发售，开启空间计算时代。', '2024 年 2 月，苹果 Vision Pro 正式在美国市场开售，搭载 M2 与 R1 双芯片，支持眼动与手势交互，通过 micro-OLED 显示屏提供沉浸式空间体验，售价 3499 美元起。', 'Apple Newsroom', '2024-02-02 08:00:00', '/images/news-cover-6.jpg'),
('Neuralink 完成首例人类脑机接口植入', '马斯克旗下 Neuralink 为首位患者植入脑机接口芯片，患者可用意念控制光标。', '2024 年 1 月，Neuralink 宣布完成首例人类脑机接口植入手术，患者为四肢瘫痪者，术后可通过意念控制电脑光标与下棋，展示了侵入式脑机接口在医疗康复领域的应用前景。', 'Reuters', '2024-01-29 14:00:00', '/images/news-cover-7.jpg'),
('华为发布 Mate 60 Pro 麒麟芯片回归', '华为 Mate 60 Pro 搭载麒麟 9000S 芯片，支持卫星通话，标志国产高端芯片突破封锁。', '2023 年 8 月，华为突然上架 Mate 60 Pro，搭载自研麒麟 9000S 芯片，支持双向北斗卫星消息与天通卫星通话，在高端芯片受限背景下实现关键突破，引发广泛关注。', '华为', '2023-08-29 10:00:00', '/images/news-cover-8.jpg');
```

## 4. 创建图文列表表 lyh_gallery

```sql
DROP TABLE IF EXISTS lyh_gallery;
CREATE TABLE lyh_gallery (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  title VARCHAR(200) NOT NULL COMMENT '标题',
  description VARCHAR(500) NOT NULL DEFAULT '' COMMENT '描述',
  img_url VARCHAR(500) NOT NULL DEFAULT '' COMMENT '图片地址',
  category VARCHAR(50) NOT NULL DEFAULT '' COMMENT '分类',
  create_time DATETIME NOT NULL COMMENT '创建时间',
  PRIMARY KEY (id),
  KEY idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图文列表表';
```

## 5. 插入 8 条图文列表测试数据

> 说明：前 7 条使用本地有效 SVG 图片（`/images/gallery-1.svg` ~ `gallery-7.svg`），第 8 条使用失效路径 `/images/gallery-missing.svg`，用于演示前端图片加载失败时显示占位色块、不出现破图图标。

```sql
INSERT INTO lyh_gallery (title, description, img_url, category, create_time) VALUES
('探索未来科技', '人工智能与量子计算正在重塑我们的世界，前沿技术不断突破想象的边界。', '/images/gallery-1.svg', '科技', '2025-03-12 09:30:00'),
('静谧自然之美', '山川湖海，四季更迭，大自然用最纯粹的笔触描绘出令人心醉的画卷。', '/images/gallery-2.svg', '自然', '2025-04-05 14:20:00'),
('城市建筑光影', '钢筋水泥构筑的都市森林，在晨昏光影中展现出现代建筑的力量与诗意。', '/images/gallery-3.svg', '建筑', '2025-02-18 18:05:00'),
('舌尖上的美食', '一道好菜承载着地域的记忆与匠人的温度，治愈每一个平凡的日子。', '/images/gallery-4.svg', '美食', '2025-05-21 12:00:00'),
('远方的旅行日记', '背上行囊，去看未曾见过的风景，在陌生的街角遇见更好的自己。', '/images/gallery-5.svg', '旅行', '2025-06-10 08:45:00'),
('艺术与灵感碰撞', '色彩、线条与情感的交织，每一件作品都是创作者内心世界的独白。', '/images/gallery-6.svg', '艺术', '2025-01-28 16:30:00'),
('可爱动物萌宠', '毛茸茸的伙伴们用纯真的眼神治愈人心，是生活里最柔软的陪伴。', '/images/gallery-7.svg', '动物', '2025-03-30 10:15:00'),
('图片加载失败示例', '本条记录的图片路径无效，用于演示前端图片加载失败时显示占位色块、不出现破图图标。', '/images/gallery-missing.svg', '其他', '2025-06-15 11:00:00');
```

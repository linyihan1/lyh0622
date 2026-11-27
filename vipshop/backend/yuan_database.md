# lyh_唯品会评论情感分类 · 数据库设计

## 说明
本项目使用 **JSON 文件持久化**（`backend/data/lyh_history.json`），避免引入 MySQL 依赖让实验快速可跑。
以下是等价的 MySQL 8.0 建表 SQL，按此可完整迁移。

---

## 建表 SQL

```sql
CREATE DATABASE IF NOT EXISTS lyh_vipshop DEFAULT CHARSET utf8mb4;
USE lyh_vipshop;

-- lyh_评论分析历史表
CREATE TABLE IF NOT EXISTS lyh_comment_analysis (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  comment_text  VARCHAR(500)  NOT NULL COMMENT '用户输入的唯品会评论原文',
  sentiment     VARCHAR(16)   NOT NULL COMMENT '情感极性：positive/neutral/negative',
  confidence    DECIMAL(3,2)  NOT NULL COMMENT '置信度 0.00~1.00',
  aspects       JSON          NULL     COMMENT '评论维度标签数组',
  entities      JSON          NULL     COMMENT '命名实体数组 [{name,type}]',
  summary       VARCHAR(120)  NULL     COMMENT '一句话摘要',
  need_review   TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '是否需要人工复核',
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sentiment (sentiment),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB COMMENT='唯品会评论情感分析历史';

-- lyh_系统提示词版本表
CREATE TABLE IF NOT EXISTS lyh_prompt_version (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  version     VARCHAR(16)  NOT NULL UNIQUE COMMENT '版本号 v1/v2...',
  system_prompt TEXT         NOT NULL COMMENT '完整 system prompt',
  model       VARCHAR(64)  NOT NULL COMMENT '使用的大模型',
  temperature DECIMAL(3,2) NOT NULL DEFAULT 0.30,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='提示词版本管理';
```

---

## 测试数据（≥ 8 条）

```sql
INSERT INTO lyh_comment_analysis
  (comment_text, sentiment, confidence, aspects, entities, summary, need_review)
VALUES
  ('物流很快第二天就到了，包装也很精美，衣服面料摸着很舒服，就是领口有点大不太满意。',
   'positive', 0.88, '["物流","包装","质量","尺码"]',
   '[{"name":"衣服","type":"category"}]',
   '整体满意，物流包装质量都好，但领口偏大略有不足。', 0),

  ('唯品会买的欧莱雅复颜玻尿酸精华，用了一周感觉皮肤没什么变化，价格倒是挺便宜的。',
   'neutral', 0.72, '["价格","效果"]',
   '[{"name":"欧莱雅","type":"brand"},{"name":"复颜玻尿酸精华","type":"product"},{"name":"唯品会","type":"platform"}]',
   '价格便宜但使用一周未见明显效果，评价偏中性。', 0),

  ('鞋子刚穿第一天就开胶了，客服态度还特别差，再也不在唯品会买鞋了！',
   'negative', 0.95, '["质量","客服"]',
   '[{"name":"鞋","type":"category"},{"name":"唯品会","type":"platform"}]',
   '鞋子质量差开胶且客服态度恶劣，极度不满。', 0),

  ('性价比很高，一百多块钱能买到这个质量真的没想到，尺码也刚好。',
   'positive', 0.91, '["性价比","尺码","质量"]',
   '[]',
   '性价比高质量好尺码合适，非常满意。', 0),

  ('颜色跟图片不太一样，实物偏暗，不过整体还行吧。',
   'neutral', 0.65, '["外观"]',
   '[]',
   '实物颜色偏暗与图片不符，但整体尚可。', 0),

  ('包装破损严重，快递盒子都压扁了，里面的衣服还好没脏。',
   'negative', 0.87, '["包装","物流"]',
   '[{"name":"衣服","type":"category"}]',
   '包装严重破损，虽衣服未脏但购物体验差。', 0),

  ('真的假的？这个价格能买到正品吗？',
   'neutral', 0.55, '["价格"]',
   '[]',
   '对价格与正品存疑，需人工复核。', 1),

  ('客服小姐姐特别耐心，帮我换了三次货都没不耐烦，点赞！',
   'positive', 0.93, '["客服"]',
   '[]',
   '客服耐心热情，多次换货仍态度友好，非常满意。', 0);
```

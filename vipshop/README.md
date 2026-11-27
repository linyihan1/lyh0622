# lyh_唯品会评论情感分类 · LLM 应用设计

## 项目概述
- **选题**：Harness Engineering（结构化输出）
- **业务场景**：唯品会（VIPshop）商品评论多维度情感分析
- **核心能力**：将自然语言评论 → 稳定 JSON 结构化数据（情感/置信度/维度/实体/摘要/复核标记）

## 技术栈
| 层 | 技术 |
|---|---|
| 前端 | 原生 HTML5 / CSS3 / JavaScript（无框架无 CDN） |
| 后端 | Node.js 24 / Express / dotenv / cors |
| 模型 | 硅基流动 SiliconFlow → deepseek-ai/DeepSeek-V4-Flash |
| 端口 | 8225（学号后三位 225） |
| 持久化 | JSON 文件（`backend/data/lyh_history.json`） |

## 目录结构
```
vipshop/
├── backend/
│   ├── server.js                 入口，端口 8225
│   ├── routes/lyh_ai.js          /api/ai/chat + /api/ai/history
│   ├── config/lyh_prompt.js      System Prompt + JSON Schema
│   ├── utils/lyh_response.js     统一响应 {code, msg, data}
│   ├── data/lyh_history.json     历史记录（自动生成）
│   ├── yuan_interface.md         接口文档
│   ├── yuan_database.md          MySQL 建表 + 测试数据
│   └── package.json
├── frontend/
│   ├── index.html                单页应用：输入 + 结果 + 历史
│   ├── css/lyh_style.css         深色主题 · 唯品会风格
│   └── js/lyh_main.js            fetch 调用 + DOM 渲染
├── .env.example                  环境变量模板
├── .gitignore                    排除 node_modules / .env
├── AGENTS.md                     开发规则
└── README.md                     ← 本文件
```

## 快速启动
```bash
# 1. 安装后端依赖
cd vipshop/backend
npm install

# 2. 配置密钥
cp .env.example .env
# 编辑 .env，填入 LLM_API_KEY（从硅基流动申请）

# 3. 启动服务（前端由 express.static 一起托管）
node server.js

# 4. 打开浏览器
# 前端页面 → http://localhost:8225
# 健康检查 → http://localhost:8225/api/health
```

## 核心功能演示
| 功能 | 操作 | 前端 → 后端 → LLM 链路 |
|---|---|---|
| 评论情感分析 | 粘一条唯品会评论 → 点"分析" | POST /api/ai/chat → 组装 messages → 转发硅基流动 → 解析 JSON → 渲染卡片 |
| 历史记录 | 下拉到底看历史 | GET /api/ai/history → 读 lyh_history.json → 渲染列表 |
| 低置信度标记 | 模糊评论 need_review 自动变 true | confidence < 0.6 强制 need_review = true |

## JSON 结构化输出字段
| 字段 | 说明 |
|---|---|
| sentiment | positive / neutral / negative |
| confidence | 0~1 置信度，< 0.6 自动 need_review |
| aspects | 评论涉及的维度（物流/包装/质量/价格...） |
| entities | 命名实体（品牌/商品/品类/平台） |
| summary | 一句话摘要（≤ 40 字） |
| need_review | 建议人工复核 |

## AI 工具使用
| 工具 | 场景 |
|---|---|
| Trae（AI 辅助编程） | 项目骨架搭建、代码生成、调试 |
| 硅基流动 SiliconFlow | deepseek-ai/DeepSeek-V4-Flash 推理 |

## 项目截图
（运行后截图填入 yuanlei_prompt.md）

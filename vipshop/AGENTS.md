# lyh_唯品会评论情感分类项目 · AGENTS.md

## 基本规则
- 作者：林奕含 / 学号：24002120622
- 所有 CSS 类名 / HTML id / JS 变量 / 函数 / 常量 **必须以 `lyh_` 下划线开头**
- 所有代码注释 **必须包含 `lyh` 标记**（如 `// lyh_功能说明`）
- 新建 HTML 必须加标准头部注释（作者 / 学号 / 时间 / 模型 / 功能）

## 项目结构
```
vipshop/
├── backend/                # lyh_后端 Node.js + Express
│   ├── server.js          #   入口，端口 8225
│   ├── routes/            #   路由
│   │   └── lyh_ai.js      #     /api/ai/chat 代理大模型
│   ├── config/
│   │   └── lyh_prompt.js  #     system prompt + JSON schema
│   ├── utils/
│   │   └── lyh_response.js#     统一响应 {code, msg, data}
│   ├── data/              #   JSON 文件持久化
│   ├── yuan_interface.md  #   接口文档
│   ├── yuan_database.md   #   数据库设计
│   ├── package.json
│   └── .env               #   密钥（不提交）
├── frontend/              # lyh_前端 原生 HTML/CSS/JS
│   ├── index.html         #   首页（评论输入 + 结果展示）
│   ├── css/lyh_style.css
│   └── js/lyh_main.js
├── .env.example
├── .gitignore
├── AGENTS.md
├── yuanlei_prompt.md      # lyh_提示词记录（追加写入）
└── README.md
```

## 技术栈
- 后端：Node.js 24+ / Express / dotenv / cors / node-fetch
- 前端：原生 HTML5 / CSS3 / JavaScript（**不引入任何第三方框架或 CDN**）
- 大模型：硅基流动 SiliconFlow → deepseek-ai/DeepSeek-V4-Flash
- 端口：8225（学号后三位 225）

## 统一响应格式
```json
{ "code": 0, "msg": "ok", "data": { } }
```
- `code: 0` 成功，非 0 失败
- `msg` 提示信息
- `data` 业务数据

## 启动
```bash
cd vipshop/backend
npm install
# 复制 .env.example 为 .env 并填写 API Key
node server.js
# 浏览器打开 http://localhost:8225
```

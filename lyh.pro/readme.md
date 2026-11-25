<!--
  姓名：林奕含| 学号：24002120622 |
  时间：2026-11-20 | 大模型：Trae
-->

# 奕采 · 课程作品集

> 林奕含 · 学号：24002120622 · 课程作业项目

## 项目信息

- **姓名**：林奕含
- **学号**：24002120622
- **项目名称**：奕采 · 课程作品集
- **项目类别**：自选

## 技术栈

- 前端：原生 HTML / CSS / JavaScript（无任何第三方库、框架、CDN）
- 后端：Node.js + Express（RESTful + MVC）
- 数据库：MySQL
- 后端端口：`622`，接口统一前缀 `/api/`

## 目录结构

```
lyh.pro/
├── AGENTS.md                 # 项目开发规则（AI 协作约定）
├── readme.md                 # 项目说明
├── linyihan_prompt.md        # AI 指令记录（追加）
├── .gitignore
├── frontend/                 # 前端静态资源（express.static 托管）
│   ├── index.html            # 首页（canvas 背景动画 + 页面导航）
│   ├── css/
│   │   └── lyh_style.css
│   ├── js/
│   │   └── lyh_main.js
│   ├── fonts/                # iconfont 图标文件
│   └── images/
└── backend/                  # 后端服务
    ├── app.js                # 入口（端口 622）
    ├── package.json
    ├── .env                  # 数据库凭据（已忽略，不提交）
    ├── lyh_interface.md      # 接口记录（追加）
    ├── lyh_database.md       # 数据库 SQL 记录（追加）
    ├── config/
    │   └── db.js             # MySQL 连接池
    ├── routes/               # 路由层
    ├── controllers/          # 控制器层
    └── models/               # 模型层
```

## 启动方式

### 1. 安装后端依赖

```bash
cd backend
npm config set registry https://registry.npmmirror.com
npm install
```

### 2. 配置数据库凭据

在 `backend/.env` 中填写（已提供默认值，按需修改）：

```
DB_USER=root
DB_PASSWORD=你的密码
DB_HOST=127.0.0.1
DB_NAME=lyh_db
PORT=622
```

### 3. 启动服务

```bash
cd backend
npm start
```

启动后访问：

- 前端首页：http://localhost:622/
- 健康检查：http://localhost:622/api/health

## 开发约定

详见 [AGENTS.md](./AGENTS.md)。要点：

- 所有命名（CSS 类名、JS 变量/函数、数据库表名字段）一律以 `lyh_` 开头
- 统一 JSON 响应：`{ "code": 0, "msg": "提示信息", "data": {...} }`
- 前端服务器返回数据与错误均输出到浏览器控制台
- 新建 HTML 页面后需在 `frontend/index.html` 追加超链接入口（`detail` 页面除外）

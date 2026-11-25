# 提示词记录（追加写入，禁止覆盖）

## 2026-11-20 13:50:00 | DeepSeek-V4.1-Flash

提示词全文：

在当前项目根目录创建 AGENTS.md，写入以下规则。

## 项目结构与技术栈
- 前端：frontend/ 目录
  - 原生 HTML、CSS、JavaScript，禁止使用任何第三方库、框架、CDN 链接
  - 目录结构：frontend/ 下建 css/、js/、fonts/、images/ 子目录；
    fonts/ 存放 iconfont 图标文件（如果有）
- 后端：backend/ 目录，Node.js + Express，RESTful+MVC 风格，
  所有接口以 /api/ 为前缀，端口固定为 622。
- 使用 express.static 托管 frontend/ 静态资源目录。
- 后端通过 cors 中间件开放全部跨域访问，本配置仅用于课程作业。
- 后端依赖安装：预先将 npm 源切换为国内镜像：
  npm config set registry `https://registry.npmmirror.com`
- 后端依赖安装： npm i 包名
- 数据库：MySQL（用户名 root、密码：Lin787806@）
- 数据库凭据写入 backend/.env（变量名：DB_USER、DB_PASSWORD、DB_HOST、DB_NAME），
  不得出现在代码或 AGENTS.md 中；.env 同时加入 .gitignore
- 根据后端的要求自行建立和修改数据库表，每张表建立后，插入至少 8 条有真实业务意义的测试数据

## 命名与注释
- CSS 类名、JS 变量名、JS 函数名、数据库表名（及字段相关命名）
  一律以 lyh_ 开头
- 每个文件头部包含注释块：
  姓名：林奕含| 学号：24002120622 |
  时间：yyyy-mm-dd | 大模型：{本次使用的大模型名称}

## 记录文件（一律追加写入，禁止覆盖已有内容）
- linyihan_prompt.md（项目根目录）：每次向 AI 发出开发指令后，
  追加记录：时间 | 提示词全文 | 大模型名称
- backend/lyh_interface.md：每次创建或修改接口后，追加：
  接口路径 | HTTP 方法 | 请求参数（含示例）|
  响应格式（含 JSON 示例）| 修改时间
- backend/lyh_database.md：每次建表、改表或插入数据后，
  按执行顺序追加对应 SQL 语句（含测试数据的 INSERT），
  要求仅凭此文件即可在新机器上完整重建数据库
- 统一 JSON 响应格式：{ "code": 0, "msg": "提示信息", "data": {...} }，
  code=0 表示成功，非 0 表示失败

## 前端约定
- 服务器返回的数据和错误信息输出到浏览器控制台（console.log / console.error）；
- 新建 HTML 页面后，在 frontend/index.html 中追加超链接入口；
  文件名包含 detail 的页面除外

## 2026-11-20 13:53:44 | DeepSeek-V4.1-Flash

提示词全文：

按这个方案来

## 2026-11-25 13:50:00 | DeepSeek-V4.1-Flash

提示词全文：

使用硅基流动API key创建基本AI应用:AI聊天
Api-key：sk-****（密钥已写入 backend/.env，此处脱敏记录）

## 2026-11-25 14:15:00 | DeepSeek-V4.1-Flash

提示词全文：

使用七牛的 api key 完成在线客服页面：
Model ID：qiniu/conatus-free
Api-key：sk-****（密钥已写入 backend/.env，此处脱敏记录）
OpenAI BaseURL：`https://api.qnaigc.com/v1`

## 2026-11-25 14:25:00 | DeepSeek-V4.1-Flash

提示词全文：

完成知识库文件上传功能，构建2个知识库文件，完成基于知识库的问答，支持doc和docx，ppt，完成知识库管理（RAG）：基于本地文件（如 PDF/TXT）上传、解析，构建专属自动客服或问答系统，包括知识库文件上传模块。在控制台输出发送给大模型的数据和接受自大模型的数据。

## 2026-11-25 14:55:00 | DeepSeek-V4.1-Flash

提示词全文：

完成图像识别功能，上传图片，返回该图片的描述，使用已有的api-key和模型。

## 2026-11-25 14:35:00 | DeepSeek-V4.1-Flash

提示词全文：

实现一个语音识别的功能，使用七牛的Qwen-Audio-3.0-ASR-Flash模型，输入语音，输出文字。

## 2026-11-25 14:45:00 | DeepSeek-V4.1-Flash

提示词全文：

回复不了
（附截图：在线客服页面发送消息后提示「抱歉，智能客服暂时无法回复（七牛云接口返回 401：Invalid API key）」）

## 2026-11-25 15:05:00 | DeepSeek-V4.1-Flash

提示词全文：

识别不出来
（附截图：语音识别页面提示「识别失败：Invalid API key」）

## 2026-11-25 15:10:00 | DeepSeek-V4.1-Flash

提示词全文：

点击不了
（附截图：知识库问答页面，点击常见问题按钮与「发送」均无反应）

## 2026-11-25 15:25:00 | DeepSeek-V4.1-Flash

提示词全文：

帮我把五张图片放到一个链接里，并提交到github
（附五张截图：图像识别、在线客服、语音识别、AI 聊天、知识库问答）

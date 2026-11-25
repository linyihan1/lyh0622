# 接口文档（追加写入，禁止覆盖已有内容）

服务地址：`http://localhost:622`，所有接口以 `/api/` 为前缀。
统一响应格式：`{ "code": 0, "msg": "提示信息", "data": {...} }`，`code = 0` 表示成功，非 0 表示失败。

---

## 2026-11-25 13:50 AI 聊天模块接口

### 1. 获取会话列表

- 接口路径：`/api/chat/sessions`
- HTTP 方法：`GET`
- 请求参数：无
- 响应格式：

```json
{
  "code": 0,
  "msg": "操作成功",
  "data": [
    {
      "id": 3,
      "title": "毕业设计选题建议",
      "model": "deepseek-ai/DeepSeek-V4.1-Flash",
      "created_at": "2026-11-24 20:05:00",
      "updated_at": "2026-11-24 20:12:00"
    }
  ]
}
```

### 2. 新建会话

- 接口路径：`/api/chat/sessions`
- HTTP 方法：`POST`
- 请求参数：

```json
{ "title": "新的对话" }
```

- 响应格式：

```json
{
  "code": 0,
  "msg": "会话创建成功",
  "data": {
    "id": 4,
    "title": "新的对话",
    "model": "deepseek-ai/DeepSeek-V4.1-Flash",
    "created_at": "2026-11-25 13:57:50",
    "updated_at": "2026-11-25 13:57:50"
  }
}
```

### 3. 获取会话消息列表

- 接口路径：`/api/chat/sessions/:id/messages`
- HTTP 方法：`GET`
- 请求参数：

```
路径参数 id：会话 ID，示例 /api/chat/sessions/4/messages
```

- 响应格式：

```json
{
  "code": 0,
  "msg": "操作成功",
  "data": {
    "session": { "id": 4, "title": "用一句话介绍你自己", "model": "deepseek-ai/DeepSeek-V4.1-Flash" },
    "messages": [
      { "id": 13, "session_id": 4, "role": "user", "content": "用一句话介绍你自己", "created_at": "2026-11-25 13:57:50" },
      { "id": 14, "session_id": 4, "role": "assistant", "content": "我是由深度求索公司开发的AI助手……", "created_at": "2026-11-25 13:57:51" }
    ]
  }
}
```

- 失败示例（会话不存在）：

```json
{ "code": 404, "msg": "会话不存在", "data": null }
```

### 4. 删除会话

- 接口路径：`/api/chat/sessions/:id`
- HTTP 方法：`DELETE`
- 请求参数：

```
路径参数 id：会话 ID，示例 /api/chat/sessions/4
```

- 响应格式：

```json
{ "code": 0, "msg": "会话已删除", "data": { "id": 4 } }
```

### 5. 流式对话（SSE）

- 接口路径：`/api/chat/stream`
- HTTP 方法：`POST`
- 请求参数（`sessionId` 传 0 或不传表示新建会话）：

```json
{
  "sessionId": 0,
  "content": "用一句话介绍你自己"
}
```

- 响应格式：`Content-Type: text/event-stream`，事件以 `data: {JSON}` 逐条返回。

```text
data: {"type":"meta","sessionId":4,"model":"deepseek-ai/DeepSeek-V4.1-Flash"}

data: {"type":"delta","content":"我是"}

data: {"type":"delta","content":"由"}

data: {"type":"done","sessionId":4,"messageId":14}
```

- 事件说明：
  - `meta`：会话开始，返回会话 ID 与模型名
  - `delta`：增量文本
  - `done`：回复结束，返回落库后的消息 ID
  - `error`：对话失败，返回 `msg`

- 失败示例（消息为空，普通 JSON 响应）：

```json
{ "code": 1, "msg": "消息内容不能为空", "data": null }
```

修改时间：2026-11-25 13:50

---

## 2026-11-25 14:15 在线客服模块接口（七牛云 AI）

### 1. 获取常见问题

- 接口路径：`/api/service/faqs`
- HTTP 方法：`GET`
- 请求参数：无
- 响应格式：

```json
{
  "code": 0,
  "msg": "操作成功",
  "data": [
    {
      "id": 1,
      "question": "下单后多久发货？",
      "answer": "现货图书在付款后 24 小时内发出，预售图书以商品页标注的发货时间为准，节假日顺延。",
      "category": "订单",
      "sort": 1
    }
  ]
}
```

### 2. 获取客服会话消息

- 接口路径：`/api/service/sessions/:id/messages`
- HTTP 方法：`GET`
- 请求参数：

```
路径参数 id：会话 ID，示例 /api/service/sessions/8/messages
```

- 响应格式：

```json
{
  "code": 0,
  "msg": "操作成功",
  "data": {
    "session": { "id": 8, "visitor_name": "访客8806", "status": 0, "created_at": "2026-11-25 13:20:00", "updated_at": "2026-11-25 13:22:00" },
    "messages": [
      { "id": 15, "session_id": 8, "role": "user", "content": "有什么适合大学生读的计算机入门书推荐？", "created_at": "2026-11-25 13:20:00" },
      { "id": 16, "session_id": 8, "role": "assistant", "content": "可以看看《深入理解计算机系统》……", "created_at": "2026-11-25 13:22:00" }
    ]
  }
}
```

- 失败示例（会话不存在）：

```json
{ "code": 404, "msg": "会话不存在", "data": null }
```

### 3. 结束客服会话

- 接口路径：`/api/service/sessions/:id/close`
- HTTP 方法：`POST`
- 请求参数：无（仅路径参数 id）
- 响应格式：

```json
{ "code": 0, "msg": "会话已结束", "data": { "id": 8 } }
```

### 4. 客服流式应答（SSE）

- 接口路径：`/api/service/stream`
- HTTP 方法：`POST`
- 请求参数（`sessionId` 传 0 或不传表示新建会话）：

```json
{
  "sessionId": 0,
  "content": "我的订单什么时候发货？",
  "visitorName": "网页访客"
}
```

- 响应格式：`Content-Type: text/event-stream`，事件以 `data: {JSON}` 逐条返回。

```text
data: {"type":"meta","sessionId":9,"model":"qiniu/conatus-free"}

data: {"type":"delta","content":"您好"}

data: {"type":"done","sessionId":9,"messageId":18}
```

- 事件说明：
  - `meta`：会话开始，返回会话 ID 与模型名
  - `delta`：增量文本
  - `done`：应答结束，返回落库后的消息 ID
  - `error`：应答失败，返回 `msg`（示例：`{"type":"error","msg":"七牛云接口返回 401：Invalid API key"}`）

修改时间：2026-11-25 14:15

---

## 2026-11-25 14:25 知识库（RAG）模块接口

知识库文件保存于 `backend/knowledge/uploads/`，接口前缀为 `/api/kb`。

### 1. 上传并解析知识库文件

- 接口路径：`/api/kb/upload`
- HTTP 方法：`POST`
- 请求参数（`multipart/form-data`，单文件，最大 20MB）：

```text
file: 知识库文件（支持 .txt .md .csv .pdf .doc .docx .ppt .pptx）
name: 可选，知识库展示名称（不传则取文件名去掉扩展名）
```

- 响应格式：

```json
{
  "code": 0,
  "msg": "知识库文件上传成功",
  "data": {
    "id": 10,
    "name": "云书商城售后服务手册",
    "file_name": "云书商城售后服务手册.docx",
    "file_ext": "docx",
    "file_size": 10995,
    "char_count": 840,
    "chunk_count": 3,
    "status": 1,
    "created_at": "2026-11-25 14:20:45"
  }
}
```

### 2. 获取知识库文件列表

- 接口路径：`/api/kb/files`
- HTTP 方法：`GET`
- 请求参数：无
- 响应格式：

```json
{
  "code": 0,
  "msg": "操作成功",
  "data": {
    "totalChunks": 183,
    "files": [
      {
        "id": 10,
        "name": "云书商城售后服务手册",
        "file_name": "云书商城售后服务手册.docx",
        "file_ext": "docx",
        "file_size": 10995,
        "char_count": 840,
        "chunk_count": 3,
        "status": 1,
        "created_at": "2026-11-25 14:20:45"
      }
    ]
  }
}
```

### 3. 查看某个文件的文本分片

- 接口路径：`/api/kb/files/:id/chunks`
- HTTP 方法：`GET`
- 请求参数：路径参数 `id`（文件 ID）
- 响应格式：

```json
{
  "code": 0,
  "msg": "操作成功",
  "data": {
    "file": { "id": 10, "name": "云书商城售后服务手册", "chunk_count": 3 },
    "chunks": [
      {
        "id": 21,
        "file_id": 10,
        "chunk_index": 0,
        "content": "云书商城售后服务手册\n一、退换货政策 ……",
        "keywords": "售后,退换,图书",
        "created_at": "2026-11-25 14:20:45"
      }
    ]
  }
}
```

### 4. 删除知识库文件

- 接口路径：`/api/kb/files/:id`
- HTTP 方法：`DELETE`
- 请求参数：路径参数 `id`（文件 ID）
- 响应格式：

```json
{ "code": 0, "msg": "知识库文件已删除", "data": { "id": 10 } }
```

### 5. 基于知识库的流式问答

- 接口路径：`/api/kb/ask`
- HTTP 方法：`POST`
- 请求参数：

```json
{
  "question": "退货退款需要几天到账？",
  "history": [
    { "role": "user", "content": "上一轮问题" },
    { "role": "assistant", "content": "上一轮回答" }
  ]
}
```

- 响应格式：`Content-Type: text/event-stream`，事件以 `data: {JSON}` 逐条返回。

```text
data: {"type":"meta","model":"deepseek-ai/DeepSeek-V4.1-Flash","refs":[{"no":1,"fileId":10,"fileName":"云书商城售后服务手册","fileExt":"docx","chunkIndex":1,"score":3,"snippet":"…"}]}

data: {"type":"delta","content":"退货"}

data: {"type":"done","refs":[{"no":1,"fileId":10,"fileName":"云书商城售后服务手册","fileExt":"docx","chunkIndex":1,"score":3,"snippet":"…"}],"length":107}
```

- 事件说明：
  - `meta`：返回模型名与检索命中的资料片段（`refs`），未命中时为空数组
  - `delta`：增量文本
  - `done`：回答结束，返回参考来源与回答长度
  - `error`：回答失败，返回 `msg`

修改时间：2026-11-25 14:25

---

## 2026-11-25 14:55 图像识别模块接口

图片保存于 `backend/images/uploads/`，并通过 `/uploads/` 静态托管；接口前缀为 `/api/image`。
使用已有 `SILICONFLOW_API_KEY` 与 `SILICONFLOW_MODEL`（deepseek-ai/DeepSeek-V4.1-Flash）多模态能力。

### 1. 上传图片并返回描述

- 接口路径：`/api/image/describe`
- HTTP 方法：`POST`
- 请求参数（`multipart/form-data`，单图，最大 10MB）：

```text
image: 图片文件（支持 jpg / jpeg / png / gif / webp / bmp，按文件头识别真实格式）
```

- 响应格式：

```json
{
  "code": 0,
  "msg": "图片识别成功",
  "data": {
    "description": "这是一张知识库问答系统的前端交互界面截图。\n\n**画面元素、文字与排版**：\n1. …",
    "model": "deepseek-ai/DeepSeek-V4.1-Flash",
    "fileName": "shot-20261125-062637-484236100-6fe5c897-977f-46ff-ac1d-3c9c970815af.jpg",
    "fileSize": 55040,
    "mimeType": "image/png",
    "imageUrl": "/uploads/1795588272042-lu65yh.png"
  }
}
```

- 失败响应示例：

```json
{ "code": 1, "msg": "仅支持 jpg / png / gif / webp / bmp 格式的图片", "data": null }
```

- 说明：
  - 服务端按图片文件头识别真实 MIME 类型，并将磁盘文件扩展名统一为真实格式；
  - 控制台会输出「发送给大模型的数据」（图片 base64 截断显示）与「接收自大模型的数据」（完整描述）。

修改时间：2026-11-25 14:55

---

## 2026-11-25 14:35 语音识别（ASR）模块接口

使用七牛云 `Qwen-Audio-3.0-ASR-Flash` 模型，接口前缀为 `/api/asr`。
音频先暂存于 `backend/audio/uploads/`，识别完成后自动删除。

### 1. 上传语音并返回文字

- 接口路径：`/api/asr/transcribe`
- HTTP 方法：`POST`
- 请求参数（`multipart/form-data`，单个音频，最大 20MB）：

```text
audio: 音频文件（支持 wav / mp3 / m4a / webm / ogg / flac / aac / amr）
```

- 成功响应格式：

```json
{
  "code": 0,
  "msg": "语音识别成功",
  "data": {
    "text": "你好，欢迎使用语音识别功能。今天天气不错。",
    "language": "Chinese",
    "duration": 7,
    "model": "Qwen-Audio-3.0-ASR-Flash",
    "fileName": "sample.wav",
    "fileSize": 279624,
    "mimeType": "audio/wav"
  }
}
```

- 失败响应示例（当前七牛 Key 无效时）：

```json
{ "code": 1, "msg": "Invalid API key", "data": null }
```

- 说明：
  - 服务端按七牛 OpenAI 兼容接口 `https://api.qnaigc.com/v1/audio/transcriptions` 提交 `model` 与 `file`；
  - 支持浏览器录音（MediaRecorder）生成的 webm/m4a 音频；
  - 控制台输出「发送给语音模型的数据」（接口、模型、文件名、大小）与「接收自语音模型的数据」（原始响应）；
  - 当前 `.env` 中的 `QINIU_API_KEY` 经七牛 `/v1/models` 与 `/v1/audio/transcriptions` 验证返回 401，需替换为有效 Key 后才能识别成功。

修改时间：2026-11-25 14:35

---

## 2026-11-25 14:45 在线客服接口调整

问题：`QINIU_API_KEY` 无效，客服接口 `POST /api/service/stream` 返回 401（Invalid API key），页面无法回复。

调整：在线客服对话模型由七牛 `qiniu/conatus-free` 切换为硅基流动 `SILICONFLOW_MODEL`（deepseek-ai/DeepSeek-V4.1-Flash），请求/响应格式与接口路径均保持不变：

- 接口路径：`/api/service/stream`（POST，SSE）
- 返回事件：`meta`（sessionId、model）、`delta`（增量文本）、`done`（sessionId、messageId）、`error`（msg）

```text
data: {"type":"meta","sessionId":12,"model":"deepseek-ai/DeepSeek-V4.1-Flash"}

data: {"type":"delta","content":"您好"}

data: {"type":"done","sessionId":12,"messageId":23}
```

说明：`backend/services/lyh_qiniu.js` 已删除，改为 `backend/services/lyh_serviceChat.js`（硅基流动流式对话）；七牛 `QINIU_API_KEY` 仅保留给语音识别接口使用。

修改时间：2026-11-25 14:45

---

## 2026-11-25 15:05 语音识别接口调整（七牛优先 + 硅基流动兜底）

问题：`QINIU_API_KEY` 无效，`POST /api/asr/transcribe` 直接返回 401（Invalid API key），页面提示「识别失败：Invalid API key」。

调整：`backend/controllers/lyh_asrController.js` 改为多通道依次尝试，任一通道成功即返回：

1. 七牛云：`POST https://api.qnaigc.com/v1/audio/transcriptions`，模型 `Qwen-Audio-3.0-ASR-Flash`（`QINIU_API_KEY`）
2. 硅基流动：`POST https://api.siliconflow.cn/v1/audio/transcriptions`，模型 `FunAudioLLM/SenseVoiceSmall`（`SILICONFLOW_API_KEY`）

接口路径与方法保持不变：

- 接口路径：`/api/asr/transcribe`
- HTTP 方法：`POST`
- 请求类型：`multipart/form-data`
- 请求参数：
  - `audio`：音频文件（必填），支持 wav / mp3 / ogg / flac / m4a / webm，大小上限 20MB

- 成功响应示例（实测，七牛失败后由硅基流动返回）：

```json
{
  "code": 0,
  "msg": "语音识别成功",
  "data": {
    "text": "你好，欢迎使用语音识别功能。今天天气不错。",
    "language": "Chinese",
    "duration": 7,
    "model": "FunAudioLLM/SenseVoiceSmall",
    "provider": "硅基流动",
    "fileName": "lyh_asr_sample.wav",
    "fileSize": 279760,
    "mimeType": "audio/wav"
  }
}
```

- 失败响应示例（所有通道均失败时，`msg` 为最后一次错误）：

```json
{ "code": 1, "msg": "硅基流动：接口返回 500：...", "data": null }
```

- 说明：
  - 新增响应字段 `provider`，标识本次识别实际使用的服务商（`七牛云` / `硅基流动`），前端结果区展示为「来源」；
  - 音频真实类型按文件头识别（WAV/MP3/OGG/FLAC/M4A/WEBM），识别不出时按扩展名兜底；
  - `.env` 新增 `QINIU_ASR_URL`、`QINIU_ASR_MODEL`、`SILICONFLOW_ASR_URL`、`SILICONFLOW_ASR_MODEL` 四个变量；
  - 现存问题：`QINIU_API_KEY` 仍为无效 Key，七牛通道不可用，识别结果实际由硅基流动 `FunAudioLLM/SenseVoiceSmall` 提供；若要严格使用七牛 `Qwen-Audio-3.0-ASR-Flash`，替换 `backend/.env` 中的 `QINIU_API_KEY` 即可，无需改代码。

修改时间：2026-11-25 15:05

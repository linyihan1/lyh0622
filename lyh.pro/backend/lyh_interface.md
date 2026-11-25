<!--
  姓名：林奕含| 学号：24002120622 |
  时间：2026-11-20 | 大模型：Trae
-->

# lyh_interface.md

> 每次创建或修改接口后，追加记录：接口路径 | HTTP 方法 | 请求参数（含示例）| 响应格式（含 JSON 示例）| 修改时间
> 一律追加写入，禁止覆盖已有内容。

---

## 接口记录

### 1. 健康检查

- 接口路径：`/api/health`
- HTTP 方法：`GET`
- 控制器：`lyh_healthController.lyh_getHealth`
- 路由文件：`backend/routes/lyh_health.js`
- 请求参数：无
- 请求示例：

  ```
  GET http://localhost:622/api/health
  ```

- 响应格式：`{ "code": 0, "msg": "提示信息", "data": {...} }`（code=0 成功，非 0 失败）
- 响应示例：

  ```json
  {
    "code": 0,
    "msg": "服务运行正常",
    "data": {
      "status": "ok",
      "time": "2026-11-20T00:00:00.000Z"
    }
  }
  ```

- 修改时间：2026-11-20

---

### 2. 测试数据库连接

- 接口路径：`/api/db/connect`
- HTTP 方法：`POST`
- 控制器：`lyh_dbController.lyh_testConnect`
- 路由文件：`backend/routes/lyh_db.js`
- 说明：接收前端传入的账号密码，动态创建 MySQL 连接并执行 `SELECT VERSION()` 验证，成功后立即关闭连接（不使用 .env 固定凭据，便于测试不同账号）
- 请求参数（JSON Body）：

  | 参数 | 类型 | 必填 | 默认值 | 说明 |
  | --- | --- | --- | --- | --- |
  | username | string | 是 | - | 数据库用户名 |
  | password | string | 否 | - | 数据库密码 |
  | host | string | 否 | 127.0.0.1 | 数据库主机 |
  | port | number | 否 | 3306 | 数据库端口 |

- 请求示例：

  ```
  POST http://localhost:622/api/db/connect
  Content-Type: application/json

  {
    "username": "root",
    "password": "Lin787806@",
    "host": "127.0.0.1",
    "port": 3306
  }
  ```

- 响应格式：`{ "code": 0, "msg": "提示信息", "data": {...} }`（code=0 成功，非 0 失败）
- 成功响应示例：

  ```json
  {
    "code": 0,
    "msg": "数据库连接成功",
    "data": {
      "host": "127.0.0.1",
      "port": 3306,
      "user": "root",
      "version": "9.0.1"
    }
  }
  ```

- 失败响应示例（用户名或密码错误）：

  ```json
  {
    "code": 500,
    "msg": "用户名或密码错误",
    "data": {
      "host": "127.0.0.1",
      "port": 3306,
      "user": "root",
      "errCode": "ER_ACCESS_DENIED_ERROR",
      "errno": 1045
    }
  }
  ```

- 修改时间：2026-11-20

---

### 3. 获取科技新闻列表

- 接口路径：`/api/news`
- HTTP 方法：`GET`
- 控制器：`lyh_newsController.lyh_getAll`
- 路由文件：`backend/routes/lyh_news.js`
- 说明：查询 `lyh_news` 表全部新闻，按 `publish_time` 倒序返回；`publish_time` 经 `DATE_FORMAT` 格式化为字符串
- 请求参数：无
- 请求示例：

  ```
  GET http://localhost:622/api/news
  ```

- 响应格式：`{ "code": 0, "msg": "提示信息", "data": [...] }`（code=0 成功，非 0 失败；data 为新闻数组）
- 成功响应示例：

  ```json
  {
    "code": 0,
    "msg": "获取新闻列表成功",
    "data": [
      {
        "id": 1,
        "title": "英伟达发布 Blackwell 架构 RTX 50 系列显卡",
        "summary": "英伟达在 CES 2025 上正式发布基于 Blackwell 架构的 GeForce RTX 50 系列显卡，性能与能效大幅提升。",
        "content": "英伟达于 2025 年 1 月在 CES 展会发布 GeForce RTX 5090、5080 等新一代显卡……",
        "source": "英伟达官网",
        "publish_time": "2025-01-06 10:00:00",
        "cover_img": "/images/news-cover-1.jpg"
      }
    ]
  }
  ```

- 失败响应示例：

  ```json
  {
    "code": 500,
    "msg": "获取新闻列表失败：...",
    "data": null
  }
  ```

- 修改时间：2026-11-20

---

### 4. 获取图文列表

- 接口路径：`/api/gallery`
- HTTP 方法：`GET`
- 控制器：`lyh_galleryController.lyh_getAll`
- 路由文件：`backend/routes/lyh_gallery.js`
- 说明：查询 `lyh_gallery` 表全部图文数据，按 `create_time` 倒序返回；`create_time` 经 `DATE_FORMAT` 格式化为字符串。前端页面 `frontend/gallery.html` 网格展示上图下文卡片，图片加载失败时显示占位色块。
- 请求参数：无
- 请求示例：

  ```
  GET http://localhost:622/api/gallery
  ```

- 响应格式：`{ "code": 0, "msg": "提示信息", "data": [...] }`（code=0 成功，非 0 失败；data 为图文数组）
- 成功响应示例：

  ```json
  {
    "code": 0,
    "msg": "获取图文列表成功",
    "data": [
      {
        "id": 5,
        "title": "远方的旅行日记",
        "description": "背上行囊，去看未曾见过的风景，在陌生的街角遇见更好的自己。",
        "img_url": "/images/gallery-5.svg",
        "category": "旅行",
        "create_time": "2025-06-10 08:45:00"
      },
      {
        "id": 8,
        "title": "图片加载失败示例",
        "description": "本条记录的图片路径无效，用于演示前端图片加载失败时显示占位色块、不出现破图图标。",
        "img_url": "/images/gallery-missing.svg",
        "category": "其他",
        "create_time": "2025-06-15 11:00:00"
      }
    ]
  }
  ```

- 失败响应示例：

  ```json
  {
    "code": 500,
    "msg": "获取图文列表失败：...",
    "data": null
  }
  ```

- 修改时间：2026-11-20

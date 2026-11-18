// lyh_server.js — 支持 Range 请求的本地服务器（解决 Python http.server 不能播视频的问题）
// 用法：node lyh_server.js
// 作者：林奕含  学号：24002120622
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8090;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
  '.ico':  'image/x-icon',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(ROOT, urlPath);

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404); res.end('Not Found'); return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    const fileSize = stat.size;
    const range = req.headers['range'];

    if (range) {
      // lyh_支持 Range 请求 → 浏览器播视频必需！
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': type,
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': type,
        'Accept-Ranges': 'bytes',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
});

// lyh_绑定 0.0.0.0 让手机也能访问
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ lyh_server 已启动：`);
  console.log(`   本机：   http://localhost:${PORT}/mobile-home.html`);
  console.log(`   局域网： http://172.20.10.2:${PORT}/mobile-home.html`);
  console.log(`   支持 Range 请求 ✔️ 视频能播 ✔️`);
});

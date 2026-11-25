/*
 * 姓名：林奕含| 学号：24002120622 |
 * 时间：2026-11-20 | 大模型：Trae
 */
// lyh: 首页脚本 - canvas 粒子背景动画、导航渲染、后端健康检测

(function () {
  'use strict';

  // ===== lyh: 已完成页面导航数据（新增页面在此追加，前端约定：detail 页面不加入口）=====
  var lyh_pages = [
    { title: '首页', desc: '作品导航与项目介绍', href: 'index.html', icon: '⌂', done: true },
    { title: '数据库连接', desc: '输入账号密码连接 MySQL', href: 'database.html', icon: '◈', done: true },
    { title: '科技新闻', desc: '科技新闻列表，接口数据展示', href: 'news.html', icon: '▤', done: true },
    { title: '图文列表', desc: '上图下文网格卡片，接口数据展示', href: 'gallery.html', icon: '▦', done: true },
    { title: '功能页面 A', desc: '规划中，敬请期待', href: '#', icon: '✦', done: false },
    { title: '功能页面 B', desc: '规划中，敬请期待', href: '#', icon: '◆', done: false },
    { title: '功能页面 C', desc: '规划中，敬请期待', href: '#', icon: '●', done: false }
  ];

  // ===== lyh: canvas 粒子网络背景动画 =====
  var lyh_canvas = document.getElementById('lyh_bgCanvas');
  var lyh_ctx = lyh_canvas.getContext('2d');
  var lyh_particles = [];
  var lyh_particleCount = 80;
  var lyh_mouse = { x: null, y: null, radius: 140 };

  // lyh: 适配高分屏与窗口尺寸
  function lyh_resizeCanvas() {
    lyh_canvas.width = window.innerWidth * window.devicePixelRatio;
    lyh_canvas.height = window.innerHeight * window.devicePixelRatio;
    lyh_canvas.style.width = window.innerWidth + 'px';
    lyh_canvas.style.height = window.innerHeight + 'px';
    lyh_ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  // lyh: 粒子类
  function lyh_createParticle() {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 1
    };
  }

  // lyh: 初始化粒子
  function lyh_initParticles() {
    lyh_particles = [];
    var lyh_count = Math.min(lyh_particleCount, Math.floor(window.innerWidth / 16));
    for (var lyh_i = 0; lyh_i < lyh_count; lyh_i++) {
      lyh_particles.push(lyh_createParticle());
    }
  }

  // lyh: 绘制一帧
  function lyh_drawFrame() {
    lyh_ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    var lyh_len = lyh_particles.length;
    for (var lyh_i = 0; lyh_i < lyh_len; lyh_i++) {
      var lyh_p = lyh_particles[lyh_i];
      lyh_p.x += lyh_p.vx;
      lyh_p.y += lyh_p.vy;

      // lyh: 边界反弹
      if (lyh_p.x < 0 || lyh_p.x > window.innerWidth) lyh_p.vx *= -1;
      if (lyh_p.y < 0 || lyh_p.y > window.innerHeight) lyh_p.vy *= -1;

      // lyh: 鼠标吸引
      if (lyh_mouse.x !== null) {
        var lyh_dx = lyh_mouse.x - lyh_p.x;
        var lyh_dy = lyh_mouse.y - lyh_p.y;
        var lyh_dist = Math.sqrt(lyh_dx * lyh_dx + lyh_dy * lyh_dy);
        if (lyh_dist < lyh_mouse.radius) {
          lyh_p.x += lyh_dx * 0.01;
          lyh_p.y += lyh_dy * 0.01;
        }
      }

      // lyh: 画粒子
      lyh_ctx.beginPath();
      lyh_ctx.arc(lyh_p.x, lyh_p.y, lyh_p.r, 0, Math.PI * 2);
      lyh_ctx.fillStyle = 'rgba(0, 224, 255, 0.8)';
      lyh_ctx.fill();
    }

    // lyh: 画粒子间连线
    for (var lyh_a = 0; lyh_a < lyh_len; lyh_a++) {
      for (var lyh_b = lyh_a + 1; lyh_b < lyh_len; lyh_b++) {
        var lyh_p1 = lyh_particles[lyh_a];
        var lyh_p2 = lyh_particles[lyh_b];
        var lyh_dx2 = lyh_p1.x - lyh_p2.x;
        var lyh_dy2 = lyh_p1.y - lyh_p2.y;
        var lyh_d2 = Math.sqrt(lyh_dx2 * lyh_dx2 + lyh_dy2 * lyh_dy2);
        if (lyh_d2 < 120) {
          lyh_ctx.beginPath();
          lyh_ctx.moveTo(lyh_p1.x, lyh_p1.y);
          lyh_ctx.lineTo(lyh_p2.x, lyh_p2.y);
          lyh_ctx.strokeStyle = 'rgba(106, 92, 255,' + (1 - lyh_d2 / 120) * 0.5 + ')';
          lyh_ctx.lineWidth = 1;
          lyh_ctx.stroke();
        }
      }
    }

    requestAnimationFrame(lyh_drawFrame);
  }

  // ===== lyh: 渲染页面导航卡片 =====
  function lyh_renderNav() {
    var lyh_grid = document.getElementById('lyh_navGrid');
    if (!lyh_grid) return;
    lyh_grid.innerHTML = '';

    lyh_pages.forEach(function (lyh_page) {
      var lyh_card = document.createElement('a');
      lyh_card.className = 'lyh_nav-card' + (lyh_page.done ? '' : ' lyh_disabled');
      lyh_card.href = lyh_page.done ? lyh_page.href : 'javascript:void(0)';

      var lyh_tag = document.createElement('span');
      lyh_tag.className = 'lyh_card-tag';
      lyh_tag.textContent = lyh_page.done ? '已完成' : '开发中';
      lyh_card.appendChild(lyh_tag);

      var lyh_icon = document.createElement('div');
      lyh_icon.className = 'lyh_card-icon';
      lyh_icon.textContent = lyh_page.icon;
      lyh_card.appendChild(lyh_icon);

      var lyh_title = document.createElement('div');
      lyh_title.className = 'lyh_card-title';
      lyh_title.textContent = lyh_page.title;
      lyh_card.appendChild(lyh_title);

      var lyh_desc = document.createElement('div');
      lyh_desc.className = 'lyh_card-desc';
      lyh_desc.textContent = lyh_page.desc;
      lyh_card.appendChild(lyh_desc);

      if (lyh_page.done) {
        var lyh_link = document.createElement('div');
        lyh_link.className = 'lyh_card-link';
        lyh_link.textContent = '进入页面 →';
        lyh_card.appendChild(lyh_link);
      }

      // lyh: 未完成卡片点击提示
      if (!lyh_page.done) {
        lyh_card.addEventListener('click', function (e) {
          e.preventDefault();
          console.log('[lyh] 该页面尚未开发：' + lyh_page.title);
          alert('该页面尚未开发，敬请期待');
        });
      }

      lyh_grid.appendChild(lyh_card);
    });
  }

  // ===== lyh: 检测后端健康状态（前端约定：数据与错误输出到控制台）=====
  function lyh_checkHealth() {
    var lyh_statusEl = document.getElementById('lyh_status');
    fetch('/api/health')
      .then(function (lyh_res) { return lyh_res.json(); })
      .then(function (lyh_data) {
        // lyh: 服务器返回的数据输出到浏览器控制台
        console.log('[lyh] /api/health 响应数据：', lyh_data);
        if (lyh_statusEl) {
          lyh_statusEl.textContent = '服务状态：在线';
          lyh_statusEl.className = 'lyh_status lyh_online';
        }
      })
      .catch(function (lyh_err) {
        // lyh: 错误信息输出到浏览器控制台
        console.error('[lyh] /api/health 请求失败：', lyh_err);
        if (lyh_statusEl) {
          lyh_statusEl.textContent = '服务状态：离线';
          lyh_statusEl.className = 'lyh_status lyh_offline';
        }
      });
  }

  // ===== lyh: 初始化 =====
  function lyh_init() {
    lyh_resizeCanvas();
    lyh_initParticles();
    lyh_drawFrame();
    lyh_renderNav();
    lyh_checkHealth();

    window.addEventListener('resize', function () {
      lyh_resizeCanvas();
      lyh_initParticles();
    });
    window.addEventListener('mousemove', function (e) {
      lyh_mouse.x = e.clientX;
      lyh_mouse.y = e.clientY;
    });
    window.addEventListener('mouseout', function () {
      lyh_mouse.x = null;
      lyh_mouse.y = null;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', lyh_init);
  } else {
    lyh_init();
  }
})();

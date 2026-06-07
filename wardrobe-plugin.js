(function() {
  'use strict';
  if (window.__wdp_loaded) return;
  window.__wdp_loaded = true;
  console.log('[衣橱] 插件已加载');

  // ========== CSS 注入 ==========
  var css = [
    '.wdp-trigger{position:fixed;bottom:24px;right:24px;width:48px;height:48px;',
    'border-radius:50%;background:#6366f1;color:#fff;border:none;font-size:24px;',
    'cursor:pointer;z-index:99998;box-shadow:0 4px 16px rgba(99,102,241,.4);',
    'display:flex;align-items:center;justify-content:center;transition:transform .2s;}',
    '.wdp-trigger:hover{transform:scale(1.1);}',
    '.wdp-panel{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);',
    'width:780px;height:560px;background:#1e1e2e;border-radius:16px;',
    'box-shadow:0 8px 40px rgba(0,0,0,.5);z-index:99999;display:none;',
    'flex-direction:column;color:#e0e0e0;font-family:"Microsoft YaHei",sans-serif;}',
    '.wdp-panel--visible{display:flex;}',
    '.wdp-header{display:flex;align-items:center;justify-content:space-between;',
    'padding:12px 16px;background:#2a2a3e;border-radius:16px 16px 0 0;cursor:move;',
    'user-select:none;}',
    '.wdp-header h3{margin:0;font-size:16px;}',
    '.wdp-close{background:none;border:none;color:#aaa;font-size:20px;cursor:pointer;}',
    '.wdp-close:hover{color:#fff;}',
    '.wdp-body{display:flex;flex:1;overflow:hidden;}',
    '.wdp-sidebar{width:160px;padding:12px;border-right:1px solid #3a3a4e;',
    'overflow-y:auto;flex-shrink:0;}',
    '.wdp-sidebar h4{font-size:13px;margin:0 0 6px;color:#aaa;}',
    '.wdp-cat-item{padding:6px 10px;border-radius:6px;cursor:pointer;font-size:13px;',
    'margin-bottom:2px;transition:background .15s;}',
    '.wdp-cat-item:hover{background:#2a2a3e;}',
    '.wdp-cat-item--active{background:#6366f1;color:#fff;}',
    '.wdp-cat-add{background:none;border:1px dashed #555;color:#888;width:100%;',
    'padding:4px;border-radius:6px;cursor:pointer;font-size:12px;margin-top:8px;}',
    '.wdp-cat-add:hover{border-color:#888;color:#ccc;}',
    '.wdp-cat-del{float:right;opacity:0;color:#f66;background:none;border:none;',
    'cursor:pointer;font-size:12px;}',
    '.wdp-cat-item:hover .wdp-cat-del{opacity:1;}',
    '.wdp-main{flex:1;padding:12px;overflow-y:auto;}',
    '.wdp-main-header{display:flex;justify-content:space-between;align-items:center;',
    'margin-bottom:12px;}',
    '.wdp-main-header h4{margin:0;font-size:14px;}',
    '.wdp-add-btn{background:#6366f1;color:#fff;border:none;padding:6px 14px;',
    'border-radius:8px;cursor:pointer;font-size:13px;}',
    '.wdp-add-btn:hover{background:#5558e6;}',
    '.wdp-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;}',
    '.wdp-card{border:2px solid #3a3a4e;border-radius:10px;padding:8px;',
    'text-align:center;cursor:pointer;transition:border .15s,background .15s;',
    'position:relative;}',
    '.wdp-card:hover{border-color:#555;}',
    '.wdp-card--selected{border-color:#6366f1;background:rgba(99,102,241,.1);}',
    '.wdp-card img{width:100%;height:90px;object-fit:cover;border-radius:6px;',
    'background:#2a2a3e;}',
    '.wdp-card .wdp-card-name{font-size:13px;font-weight:bold;margin:6px 0 2px;}',
    '.wdp-card .wdp-card-desc{font-size:11px;color:#999;overflow:hidden;',
    'text-overflow:ellipsis;white-space:nowrap;}',
    '.wdp-card .wdp-card-badge{position:absolute;top:6px;right:6px;',
    'background:#6366f1;color:#fff;font-size:10px;padding:2px 6px;',
    'border-radius:4px;display:none;}',
    '.wdp-card--selected .wdp-card-badge{display:block;}',
    '.wdp-card-actions{display:flex;justify-content:center;gap:6px;margin-top:4px;}',
    '.wdp-card-actions button{background:none;border:none;cursor:pointer;',
    'font-size:12px;color:#aaa;padding:2px 6px;}',
    '.wdp-card-actions button:hover{color:#fff;}',
    '.wdp-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);',
    'z-index:100000;display:none;align-items:center;justify-content:center;}',
    '.wdp-modal-overlay--visible{display:flex;}',
    '.wdp-modal{background:#1e1e2e;border-radius:12px;padding:20px;width:420px;',
    'max-height:80vh;overflow-y:auto;}',
    '.wdp-modal h4{margin:0 0 16px;font-size:15px;}',
    '.wdp-modal label{display:block;font-size:12px;color:#aaa;margin-bottom:4px;',
    'margin-top:12px;}',
    '.wdp-modal input,.wdp-modal select,.wdp-modal textarea{width:100%;',
    'padding:8px;border:1px solid #3a3a4e;border-radius:6px;background:#2a2a3e;',
    'color:#e0e0e0;font-size:13px;box-sizing:border-box;}',
    '.wdp-modal textarea{height:60px;resize:vertical;}',
    '.wdp-modal-btns{display:flex;justify-content:flex-end;gap:8px;margin-top:16px;}',
    '.wdp-modal-btns button{padding:8px 20px;border-radius:8px;cursor:pointer;',
    'font-size:13px;}',
    '.wdp-btn-primary{background:#6366f1;color:#fff;border:none;}',
    '.wdp-btn-secondary{background:transparent;color:#aaa;border:1px solid #555;}',
    '.wdp-img-error{background:#2a2a3e;height:90px;display:flex;align-items:center;',
    'justify-content:center;font-size:32px;border-radius:6px;color:#666;}',
    '.wdp-empty{padding:40px;text-align:center;color:#666;font-size:14px;}',
    '.wdp-toolbar{display:flex;gap:6px;}'
  ].join('');

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ========== DOM 构建 ==========
  function buildUI() {
    // 触发按钮
    var trigger = document.createElement('button');
    trigger.className = 'wdp-trigger';
    trigger.innerHTML = '👗';
    trigger.title = '衣橱管理';
    document.body.appendChild(trigger);

    // 浮窗面板
    var panel = document.createElement('div');
    panel.className = 'wdp-panel';
    panel.innerHTML =
      '<div class="wdp-header">' +
        '<h3>👗 衣橱管理</h3>' +
        '<button class="wdp-close">&times;</button>' +
      '</div>' +
      '<div class="wdp-body">' +
        '<div class="wdp-sidebar">' +
          '<h4>👘 衣服</h4>' +
          '<div id="wdp-cats-clothes"></div>' +
          '<h4 style="margin-top:16px;">💇 发型</h4>' +
          '<div id="wdp-cats-hairstyles"></div>' +
        '</div>' +
        '<div class="wdp-main">' +
          '<div class="wdp-main-header">' +
            '<h4 id="wdp-main-title">全部衣服</h4>' +
            '<div class="wdp-toolbar">' +
              '<button class="wdp-add-btn" id="wdp-btn-add">+ 添加</button>' +
            '</div>' +
          '</div>' +
          '<div class="wdp-grid" id="wdp-grid"></div>' +
          '<div class="wdp-empty" id="wdp-empty" style="display:none;">暂无物品，点击"+ 添加"创建</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(panel);

    // 弹窗遮罩
    var overlay = document.createElement('div');
    overlay.className = 'wdp-modal-overlay';
    overlay.id = 'wdp-overlay';
    document.body.appendChild(overlay);

    return {
      trigger: trigger,
      panel: panel,
      header: panel.querySelector('.wdp-header'),
      catsClothes: panel.querySelector('#wdp-cats-clothes'),
      catsHairstyles: panel.querySelector('#wdp-cats-hairstyles'),
      mainTitle: panel.querySelector('#wdp-main-title'),
      grid: panel.querySelector('#wdp-grid'),
      empty: panel.querySelector('#wdp-empty'),
      overlay: overlay
    };
  }

  var dom = buildUI();

  // 显示/隐藏
  dom.trigger.addEventListener('click', function() {
    dom.panel.classList.toggle('wdp-panel--visible');
  });
  dom.panel.querySelector('.wdp-close').addEventListener('click', function() {
    dom.panel.classList.remove('wdp-panel--visible');
  });

  // ========== 拖拽 ==========
  (function() {
    var isDragging = false, startX, startY, startLeft, startTop;
    dom.header.addEventListener('mousedown', function(e) {
      if (e.target.tagName === 'BUTTON') return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      var rect = dom.panel.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      dom.panel.style.transition = 'none';
      e.preventDefault();
    });
    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      var left = startLeft + dx;
      var top = startTop + dy;
      var maxLeft = window.innerWidth - dom.panel.offsetWidth;
      var maxTop = window.innerHeight - dom.panel.offsetHeight;
      left = Math.max(0, Math.min(left, maxLeft));
      top = Math.max(0, Math.min(top, maxTop));
      dom.panel.style.left = left + 'px';
      dom.panel.style.top = top + 'px';
      dom.panel.style.transform = 'none';
    });
    document.addEventListener('mouseup', function() {
      if (isDragging) {
        isDragging = false;
        dom.panel.style.transition = '';
      }
    });
  })();
})();

(function() {
  'use strict';
  if (window.__wdp_loaded) return;
  window.__wdp_loaded = true;
  console.log('[衣橱] 插件已加载');

  // ========== 顶层窗口定位 ==========
  // 酒馆助手在 sandbox 中执行脚本，viewport 为 0×0，需要跳到 top window
  var topWin, topDoc;
  try {
    topWin = window.top;
    topDoc = topWin.document;
    console.log('[衣橱] top window accessible:', topWin !== window);
  } catch(e) {
    console.log('[衣橱] top window blocked, using current');
    topWin = window;
    topDoc = document;
  }

  // DOM 就绪后初始化
  function init() {
    var body = topDoc.body;
    if (!body) { console.log('[衣橱] 等待 body...'); setTimeout(init, 100); return; }
    console.log('[衣橱] 开始构建 UI...');
    console.log('[衣橱] body visible:', body.getBoundingClientRect().width > 0);
    console.log('[衣橱] viewport:', topWin.innerWidth + 'x' + topWin.innerHeight);
    try {

  // ========== CSS 注入 ==========
  var css = [
    '.wdp-trigger{position:fixed;bottom:24px;right:24px;width:48px;height:48px;',
    'border-radius:50%;background:#6366f1;color:#fff;border:none;font-size:24px;',
    'cursor:pointer;z-index:2147483647;box-shadow:0 4px 16px rgba(99,102,241,.4);',
    'display:flex;align-items:center;justify-content:center;transition:transform .2s;}',
    '.wdp-trigger:hover{transform:scale(1.1);}',
    '.wdp-panel{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);',
    'width:780px;height:560px;background:#1e1e2e;border-radius:16px;',
    'box-shadow:0 8px 40px rgba(0,0,0,.5);z-index:2147483646;display:none;',
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
    '.wdp-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;}',
    '.wdp-card{border:2px solid #3a3a4e;border-radius:6px;padding:4px;',
    'text-align:center;cursor:pointer;transition:border .15s,background .15s;',
    'position:relative;}',
    '.wdp-card:hover{border-color:#555;}',
    '.wdp-card--selected{border-color:#6366f1;background:rgba(99,102,241,.1);}',
    '.wdp-card img{width:100%;height:auto;max-height:140px;object-fit:contain;border-radius:4px;',
    'background:#2a2a3e;}',
    '.wdp-card .wdp-card-name{font-size:11px;font-weight:bold;margin:2px 0 0;}',
    '.wdp-card .wdp-card-desc{font-size:9px;color:#999;overflow:hidden;',
    'text-overflow:ellipsis;white-space:nowrap;}',
    '.wdp-card .wdp-card-badge{position:absolute;top:4px;right:4px;',
    'background:#6366f1;color:#fff;font-size:8px;padding:1px 4px;',
    'border-radius:3px;display:none;}',
    '.wdp-card--selected .wdp-card-badge{display:block;}',
    '.wdp-card-actions{display:flex;justify-content:center;gap:3px;margin-top:2px;}',
    '.wdp-card-actions button{background:#2a2a3e;border:1px solid #555;cursor:pointer;',
    'font-size:10px;color:#ccc;padding:1px 6px;border-radius:3px;margin:0;}',
    '.wdp-card-actions button:hover{background:#6366f1;border-color:#6366f1;color:#fff;}',
    '.wdp-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);',
    'z-index:2147483647;display:none;align-items:center;justify-content:center;}',
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
    '.wdp-img-error{background:#2a2a3e;height:140px;display:flex;align-items:center;',
    'justify-content:center;font-size:32px;border-radius:6px;color:#666;}',
    '.wdp-empty{padding:40px;text-align:center;color:#666;font-size:14px;}',
    '.wdp-toolbar{display:flex;gap:6px;}'
  ].join('');

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  topDoc.head.appendChild(styleEl);

  // ========== 查找酒馆可见容器 ==========
  var containerSelectors = [
    '#app', '#root', '#chat', '#main', '#sheld',
    '#send_textarea', '#send_but',
    '.main-container', '.app-container', '.chat-container',
    '[id*="send"]', 'textarea'
  ];
  containerSelectors.forEach(function(sel) {
    var el = topDoc.querySelector(sel);
    if (el) {
      var r = el.getBoundingClientRect();
      console.log('[衣橱] found:', sel, 'visible:', r.width > 0 && r.height > 0, 'size:', r.width + 'x' + r.height);
    }
  });
  console.log('[衣橱] document.body children:', document.body.children.length);
  console.log('[衣橱] document.body visible:', document.body.getBoundingClientRect().width > 0);

  // ========== 数据管理 ==========
  var STORAGE_KEY = 'wardrobe_plugin_data';

  function defaultState() {
    return {
      categories: {
        clothes: ['默认'],
        hairstyles: ['默认']
      },
      items: [],
      selected: { clothes: null, hairstyle: null }
    };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch(e) {
      console.warn('[衣橱] 数据读取失败，使用默认数据', e);
    }
    return defaultState();
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch(e) {
      if (e.name === 'QuotaExceededError') {
        alert('[衣橱] 存储空间不足！请导出备份后清理旧数据。');
      } else {
        console.error('[衣橱] 保存失败', e);
      }
    }
  }

  function genId() {
    return crypto.randomUUID ? crypto.randomUUID() :
      'xxxx-xxxx-4xxx-yxxx-xxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c==='x'?r:(r&0x3|0x8);
        return v.toString(16);
      });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  var state = loadState();

  // ========== DOM 构建 ==========
  function buildUI() {
    // 触发按钮
    var trigger = document.createElement('button');
    trigger.className = 'wdp-trigger';
    trigger.innerHTML = '👗';
    trigger.title = '衣橱管理';
    topDoc.body.appendChild(trigger);
    console.log('[衣橱] trigger appended, in DOM:', document.body.contains(trigger));

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
    topDoc.body.appendChild(panel);
    console.log('[衣橱] panel appended, in DOM:', document.body.contains(panel));
    var overlay = document.createElement('div');
    overlay.className = 'wdp-modal-overlay';
    overlay.id = 'wdp-overlay';
    topDoc.body.appendChild(overlay);

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
    topDoc.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      var left = startLeft + dx;
      var top = startTop + dy;
      var maxLeft = topWin.innerWidth - dom.panel.offsetWidth;
      var maxTop = topWin.innerHeight - dom.panel.offsetHeight;
      left = Math.max(0, Math.min(left, maxLeft));
      top = Math.max(0, Math.min(top, maxTop));
      dom.panel.style.left = left + 'px';
      dom.panel.style.top = top + 'px';
      dom.panel.style.transform = 'none';
    });
    topDoc.addEventListener('mouseup', function() {
      if (isDragging) {
        isDragging = false;
        dom.panel.style.transition = '';
      }
    });
  })();

  // ========== 分类渲染 ==========
  var currentFilter = { type: 'clothes', category: null };

  function renderCategories() {
    ['clothes','hairstyles'].forEach(function(type) {
      var container = type === 'clothes' ? dom.catsClothes : dom.catsHairstyles;
      container.innerHTML = '';

      // "全部"选项
      var allEl = document.createElement('div');
      allEl.className = 'wdp-cat-item';
      if (currentFilter.type === type && currentFilter.category === null) {
        allEl.classList.add('wdp-cat-item--active');
      }
      allEl.textContent = '全部';
      allEl.addEventListener('click', function() {
        currentFilter.type = type;
        currentFilter.category = null;
        renderCategories();
        renderItems();
      });
      container.appendChild(allEl);

      // 各子分类
      (state.categories[type] || []).forEach(function(cat) {
        var el = document.createElement('div');
        el.className = 'wdp-cat-item';
        if (currentFilter.type === type && currentFilter.category === cat) {
          el.classList.add('wdp-cat-item--active');
        }
        el.innerHTML = '<span>' + escapeHtml(cat) + '</span>';
        el.querySelector('span').addEventListener('click', function() {
          currentFilter.type = type;
          currentFilter.category = cat;
          renderCategories();
          renderItems();
        });

        // 删除分类按钮
        var delBtn = document.createElement('button');
        delBtn.className = 'wdp-cat-del';
        delBtn.textContent = '×';
        delBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (!confirm('删除分类 "' + cat + '"？分类下的物品将移至"默认"。')) return;
          state.items.forEach(function(item) {
            if (item.type === type && item.category === cat) {
              item.category = '默认';
            }
          });
          state.categories[type] = state.categories[type].filter(function(c) { return c !== cat; });
          if (currentFilter.category === cat) currentFilter.category = null;
          saveState(state);
          renderCategories();
          renderItems();
        });
        el.appendChild(delBtn);
        container.appendChild(el);
      });

      // "+"添加分类
      var addBtn = document.createElement('button');
      addBtn.className = 'wdp-cat-add';
      addBtn.textContent = '+ 新分类';
      addBtn.addEventListener('click', function() {
        var name = prompt('新分类名称：');
        if (!name || !name.trim()) return;
        name = name.trim();
        if (state.categories[type].indexOf(name) !== -1) {
          alert('分类 "' + name + '" 已存在');
          return;
        }
        state.categories[type].push(name);
        saveState(state);
        renderCategories();
      });
      container.appendChild(addBtn);
    });
  }

  // ========== 物品渲染 ==========
  function renderItems() {
    var filtered = state.items.filter(function(item) {
      if (item.type !== currentFilter.type) return false;
      if (currentFilter.category !== null && item.category !== currentFilter.category) return false;
      return true;
    });

    dom.mainTitle.textContent =
      (currentFilter.type === 'clothes' ? '👘 ' : '💇 ') +
      (currentFilter.category || '全部' + (currentFilter.type === 'clothes' ? '衣服' : '发型')) +
      '（' + filtered.length + '）';

    dom.grid.innerHTML = '';

    if (filtered.length === 0) {
      dom.empty.style.display = 'block';
      return;
    }
    dom.empty.style.display = 'none';

    filtered.forEach(function(item) {
      var card = document.createElement('div');
      card.className = 'wdp-card';
      var selectedId = currentFilter.type === 'clothes'
        ? state.selected.clothes
        : state.selected.hairstyle;
      if (item.id === selectedId) {
        card.classList.add('wdp-card--selected');
      }

      // 图片
      var imgHtml;
      if (item.imageUrl) {
        imgHtml = '<img src="' + escapeHtml(item.imageUrl) + '" alt="' + escapeHtml(item.name) + '" ' +
          'onerror="this.replaceWith((function(){var e=document.createElement(\'div\');e.className=\'wdp-img-error\';e.textContent=\'🖼️\';return e;})())">';
      } else {
        imgHtml = '<div class="wdp-img-error">🖼️</div>';
      }

      card.innerHTML =
        imgHtml +
        '<div class="wdp-card-name">' + escapeHtml(item.name) + '</div>' +
        '<div class="wdp-card-desc">' + escapeHtml(item.promptText || '(无描述)') + '</div>' +
        '<div class="wdp-card-badge">✓ 已选</div>' +
        '<div class="wdp-card-actions">' +
          '<button class="wdp-edit-btn">✏️</button>' +
          '<button class="wdp-del-btn">🗑️</button>' +
        '</div>';

      // 点击卡片选中
      card.addEventListener('click', function(e) {
        if (e.target.closest('button')) return;
        var key = currentFilter.type === 'clothes' ? 'clothes' : 'hairstyle';
        if (state.selected[key] === item.id) {
          state.selected[key] = null;
        } else {
          state.selected[key] = item.id;
        }
        saveState(state);
        renderItems();
      });

      // 编辑按钮
      card.querySelector('.wdp-edit-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        openForm(item);
      });

      // 删除按钮
      card.querySelector('.wdp-del-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        if (!confirm('确定删除 "' + item.name + '"？')) return;
        if (state.selected.clothes === item.id) state.selected.clothes = null;
        if (state.selected.hairstyle === item.id) state.selected.hairstyle = null;
        state.items = state.items.filter(function(i) { return i.id !== item.id; });
        saveState(state);
        renderItems();
      });

      dom.grid.appendChild(card);
    });
  }

  function buildImgError() {
    var el = document.createElement('div');
    el.className = 'wdp-img-error';
    el.textContent = '🖼️';
    return el;
  }

  // ========== 物品表单弹窗 ==========
  function openForm(editItem) {
    var isEdit = !!editItem;
    var item = editItem || {
      id: '', type: currentFilter.type, name: '', imageUrl: '',
      promptText: '', category: (state.categories[currentFilter.type] || ['默认'])[0]
    };

    var cats = state.categories[currentFilter.type] || [];
    var catOptions = cats.map(function(c) {
      return '<option value="' + escapeHtml(c) + '"' +
        (c === item.category ? ' selected' : '') + '>' + escapeHtml(c) + '</option>';
    }).join('');

    dom.overlay.innerHTML =
      '<div class="wdp-modal">' +
        '<h4>' + (isEdit ? '编辑' : '添加') + (currentFilter.type === 'clothes' ? '衣服' : '发型') + '</h4>' +
        '<label>名称 *</label>' +
        '<input id="wdp-form-name" value="' + escapeHtml(item.name) + '" placeholder="例如：黑色晚礼服">' +
        '<label>图片 URL</label>' +
        '<input id="wdp-form-url" value="' + escapeHtml(item.imageUrl) + '" placeholder="https://...">' +
        '<label>提示词描述</label>' +
        '<textarea id="wdp-form-text" placeholder="例如：穿着黑色丝质晚礼服，裙摆曳地">' + escapeHtml(item.promptText) + '</textarea>' +
        '<label>分类</label>' +
        '<select id="wdp-form-cat">' + catOptions + '</select>' +
        '<div class="wdp-modal-btns">' +
          '<button class="wdp-btn-secondary" id="wdp-form-cancel">取消</button>' +
          '<button class="wdp-btn-primary" id="wdp-form-save">保存</button>' +
        '</div>' +
      '</div>';
    dom.overlay.classList.add('wdp-modal-overlay--visible');

    topDoc.getElementById('wdp-form-cancel').addEventListener('click', closeForm);
    dom.overlay.addEventListener('click', function(e) {
      if (e.target === dom.overlay) closeForm();
    });
    topDoc.getElementById('wdp-form-save').addEventListener('click', function() {
      var name = topDoc.getElementById('wdp-form-name').value.trim();
      if (!name) { alert('名称不能为空'); return; }
      var imageUrl = topDoc.getElementById('wdp-form-url').value.trim();
      var promptText = topDoc.getElementById('wdp-form-text').value.trim();
      var category = topDoc.getElementById('wdp-form-cat').value;

      if (isEdit) {
        var idx = state.items.findIndex(function(i) { return i.id === item.id; });
        if (idx !== -1) {
          state.items[idx].name = name;
          state.items[idx].imageUrl = imageUrl;
          state.items[idx].promptText = promptText;
          state.items[idx].category = category;
        }
      } else {
        state.items.push({
          id: genId(),
          type: currentFilter.type,
          name: name,
          imageUrl: imageUrl,
          promptText: promptText,
          category: category
        });
      }
      saveState(state);
      closeForm();
      renderItems();
    });
  }

  function closeForm() {
    dom.overlay.classList.remove('wdp-modal-overlay--visible');
    dom.overlay.innerHTML = '';
  }

  // 绑定添加按钮
  topDoc.getElementById('wdp-btn-add').addEventListener('click', function() {
    if (state.categories[currentFilter.type].length === 0) {
      state.categories[currentFilter.type].push('默认');
      saveState(state);
      renderCategories();
    }
    openForm(null);
  });

  // ========== 初始化渲染 ==========
  renderCategories();
  renderItems();

  // ========== 提示词注入 ==========
  var CONFIG = {
    inputSelector: '#send_textarea, textarea[id*="send"], textarea[id*="message"]',
    retryDelay: 2000,
    injectionPrefix: '\n\n（外表描写：',
    injectionSuffix: '）',
    injectionSeparator: '，'
  };

  function getInjectionText() {
    var parts = [];
    var hairId = state.selected.hairstyle;
    var clothesId = state.selected.clothes;
    if (hairId) {
      var hair = state.items.find(function(i) { return i.id === hairId; });
      if (hair) parts.push(hair.promptText || hair.name);
    }
    if (clothesId) {
      var clothes = state.items.find(function(i) { return i.id === clothesId; });
      if (clothes) parts.push(clothes.promptText || clothes.name);
    }
    if (parts.length === 0) return '';
    return CONFIG.injectionPrefix + parts.join(CONFIG.injectionSeparator) + CONFIG.injectionSuffix;
  }

  function setupInjection() {
    var textarea = topDoc.querySelector(CONFIG.inputSelector);
    if (!textarea) {
      setTimeout(setupInjection, CONFIG.retryDelay);
      return;
    }

    textarea.addEventListener('keydown', function(e) {
      if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.metaKey) return;
      var injection = getInjectionText();
      if (!injection) return;
      setTimeout(function() {
        if (textarea.value.indexOf(injection) === -1) {
          textarea.value += injection;
        }
      }, 0);
    }, true);
  }

  if (topDoc.readyState === 'loading') {
    topDoc.addEventListener('DOMContentLoaded', function() { setTimeout(setupInjection, 1000); });
  } else {
    setTimeout(setupInjection, 1000);
  }

  // ========== 导入导出 ==========
  function exportData() {
    var blob = new Blob([JSON.stringify(state, null, 2)], {type: 'application/json'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'wardrobe-backup-' + new Date().toISOString().slice(0,10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', function() {
      var file = input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.addEventListener('load', function() {
        try {
          var data = JSON.parse(reader.result);
          if (!data.categories || !data.items || !data.selected) {
            throw new Error('数据格式不正确：缺少 categories/items/selected 字段');
          }
          if (!confirm('导入将覆盖当前数据，确定继续？')) return;
          state = data;
          saveState(state);
          renderCategories();
          renderItems();
          alert('导入成功！共 ' + state.items.length + ' 个物品。');
        } catch(e) {
          alert('导入失败：' + e.message);
        }
      });
      reader.readAsText(file);
    });
    input.click();
  }

  // 绑定导入导出按钮
  (function() {
    var expBtn = document.createElement('button');
    expBtn.className = 'wdp-close';
    expBtn.title = '导出数据';
    expBtn.textContent = '📥';
    expBtn.style.cssText = 'margin-right:8px;font-size:14px;';
    expBtn.addEventListener('click', exportData);

    var impBtn = document.createElement('button');
    impBtn.className = 'wdp-close';
    impBtn.title = '导入数据';
    impBtn.textContent = '📤';
    impBtn.style.cssText = 'margin-right:8px;font-size:14px;';
    impBtn.addEventListener('click', importData);

    var closeBtn = dom.header.querySelector('.wdp-close');
    closeBtn.parentNode.insertBefore(impBtn, closeBtn);
    closeBtn.parentNode.insertBefore(expBtn, impBtn);
  })();

  // ========== 键盘快捷键 ==========
  topDoc.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (dom.overlay.classList.contains('wdp-modal-overlay--visible')) {
        closeForm();
      } else {
        dom.panel.classList.remove('wdp-panel--visible');
      }
    }
  });
    console.log('[衣橱] UI 构建完成');
    } catch(e) { console.error('[衣橱] 初始化失败:', e.message, e.stack); }
  } // init()

  if (topDoc.readyState === 'loading') {
    topDoc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

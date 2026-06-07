# 酒馆衣橱插件 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个酒馆助手插件，提供图形化浮窗管理角色衣服和发型，选中物品后自动将描述注入 AI 提示词

**Architecture:** 单文件内联 JS，注入到云酒馆页面。IIFE 模块模式，纯原生 JS + CSS，localStorage 持久化。三层结构：浮窗 UI → 数据管理 → 提示词注入

**Tech Stack:** 原生 JavaScript (ES6+)、CSS3、localStorage、crypto.randomUUID()

**Source spec:** `docs/superpowers/specs/2026-06-07-wardrobe-plugin-design.md`

---

## 文件结构

```
wardrobe-plugin/
├── wardrobe-plugin.js            # 开发文件：纯净 JS 代码
├── wardrobe-plugin.json          # 产物：酒馆助手配置（内联 JS，由 build 脚本生成）
├── build.js                      # 构建脚本：将 JS 嵌入 JSON 的 content 字段
├── README.md                     # 使用说明
└── docs/
    └── superpowers/
        ├── specs/
        │   └── 2026-06-07-wardrobe-plugin-design.md
        └── plans/
            └── 2026-06-07-wardrobe-plugin-plan.md
```

**开发模式：** 在 `wardrobe-plugin.js` 中编写纯净 JS 代码，测试通过后运行 `node build.js` 生成 `wardrobe-plugin.json`。

**每个 Task 的开发步骤：**
1. 编辑 `wardrobe-plugin.js` 添加/修改代码
2. 运行 `node build.js` 生成 `wardrobe-plugin.json`
3. 在酒馆中重新加载插件测试（酒馆助手 → 重新导入 JSON）
4. 测试通过后提交（同时提交 `.js` 和 `.json`）

`wardrobe-plugin.js` 内部 JS 架构（IIFE）：

```
IIFE
├── 1. 防重复加载守卫
├── 2. CSS 注入（<style> 标签，.wdp-* 命名空间）
├── 3. 状态管理（load/save/import/export）
├── 4. DOM 构建（浮窗、分类列表、物品网格、表单弹窗、触发按钮）
├── 5. 渲染函数（renderCategories、renderItems、renderForm）
├── 6. 交互处理（拖拽、选择、CRUD 操作、分类切换）
├── 7. 提示词注入（拦截发送事件）
└── 8. 初始化入口
```

---

### Task 1: 创建项目骨架和构建脚本

**Files:**
- Create: `wardrobe-plugin.js` — 开发中的纯净 JS
- Create: `build.js` — 构建脚本：读取 JS → 嵌入 JSON → 输出 `wardrobe-plugin.json`
- Create: `wardrobe-plugin.json` — 产物（由 build.js 生成）

构建脚本将 JS 文件内容作为字符串写入 JSON 的 `content` 字段，自动处理转义。

- [ ] **Step 1: 编写构建脚本**

```javascript
// build.js
const fs = require('fs');
const path = require('path');

const js = fs.readFileSync('wardrobe-plugin.js', 'utf-8');

const config = {
  type: "script",
  enabled: true,
  name: "衣橱管理",
  id: "c1a2b3d4-e5f6-7890-abcd-ef1234567890",
  content: js,
  info: "管理角色衣服和发型，选中后在生成时自动注入外表描写。右下角👗打开面板。",
  button: { enabled: false, buttons: [] },
  data: {}
};

fs.writeFileSync('wardrobe-plugin.json', JSON.stringify(config, null, 2), 'utf-8');
console.log('✅ wardrobe-plugin.json 已生成');
```

- [ ] **Step 2: 编写插件 JS 骨架**

```javascript
// wardrobe-plugin.js
(function() {
  'use strict';
  if (window.__wdp_loaded) return;
  window.__wdp_loaded = true;
  console.log('[衣橱] 插件已加载');
})();
```

- [ ] **Step 3: 构建并验证 JSON**

```bash
node build.js
python -c "import json; d=json.load(open('wardrobe-plugin.json',encoding='utf-8')); print('✅ JSON 合法，content 长度:', len(d['content']))"
```

- [ ] **Step 4: 在酒馆助手加载测试**

1. 打开云酒馆 https://e.chr1.com/
2. 打开酒馆助手面板 → 导入 `wardrobe-plugin.json`
3. 开启插件 → 打开 Chrome DevTools Console
4. 预期输出：`[衣橱] 插件已加载`

- [ ] **Step 5: 提交**

```bash
git add wardrobe-plugin.js build.js wardrobe-plugin.json
git commit -m "feat: add project skeleton with build script"
```

---

### Task 2: 注入 CSS 样式

**Files:**
- Modify: `wardrobe-plugin.js` — 在 content 字段的 JS 中添加 CSS 注入

在 IIFE 内部，防重复守卫之后，添加 `<style>` 标签注入。所有 class 使用 `wdp-` 前缀防止冲突。

- [ ] **Step 1: 添加 CSS 注入代码**

替换 content 字段中的 JS 为（保留守卫 + 添加 CSS）：

```javascript
(function(){
  'use strict';
  if(window.__wdp_loaded) return;
  window.__wdp_loaded = true;
  console.log('[衣橱] 插件已加载');

  // ========== CSS 注入 ==========
  var css = '\
    .wdp-trigger{position:fixed;bottom:24px;right:24px;width:48px;height:48px;\
      border-radius:50%;background:#6366f1;color:#fff;border:none;font-size:24px;\
      cursor:pointer;z-index:99998;box-shadow:0 4px 16px rgba(99,102,241,.4);\
      display:flex;align-items:center;justify-content:center;transition:transform .2s;}\
    .wdp-trigger:hover{transform:scale(1.1);}\
    .wdp-panel{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);\
      width:780px;height:560px;background:#1e1e2e;border-radius:16px;\
      box-shadow:0 8px 40px rgba(0,0,0,.5);z-index:99999;display:none;\
      flex-direction:column;color:#e0e0e0;font-family:"Microsoft YaHei",sans-serif;}\
    .wdp-panel--visible{display:flex;}\
    .wdp-header{display:flex;align-items:center;justify-content:space-between;\
      padding:12px 16px;background:#2a2a3e;border-radius:16px 16px 0 0;cursor:move;\
      user-select:none;}\
    .wdp-header h3{margin:0;font-size:16px;}\
    .wdp-close{background:none;border:none;color:#aaa;font-size:20px;cursor:pointer;}\
    .wdp-close:hover{color:#fff;}\
    .wdp-body{display:flex;flex:1;overflow:hidden;}\
    .wdp-sidebar{width:160px;padding:12px;border-right:1px solid #3a3a4e;\
      overflow-y:auto;flex-shrink:0;}\
    .wdp-sidebar h4{font-size:13px;margin:0 0 6px;color:#aaa;}\
    .wdp-cat-item{padding:6px 10px;border-radius:6px;cursor:pointer;font-size:13px;\
      margin-bottom:2px;transition:background .15s;}\
    .wdp-cat-item:hover{background:#2a2a3e;}\
    .wdp-cat-item--active{background:#6366f1;color:#fff;}\
    .wdp-cat-add{background:none;border:1px dashed #555;color:#888;width:100%;\
      padding:4px;border-radius:6px;cursor:pointer;font-size:12px;margin-top:8px;}\
    .wdp-cat-add:hover{border-color:#888;color:#ccc;}\
    .wdp-cat-del{float:right;opacity:0;color:#f66;background:none;border:none;\
      cursor:pointer;font-size:12px;}\
    .wdp-cat-item:hover .wdp-cat-del{opacity:1;}\
    .wdp-main{flex:1;padding:12px;overflow-y:auto;}\
    .wdp-main-header{display:flex;justify-content:space-between;align-items:center;\
      margin-bottom:12px;}\
    .wdp-main-header h4{margin:0;font-size:14px;}\
    .wdp-add-btn{background:#6366f1;color:#fff;border:none;padding:6px 14px;\
      border-radius:8px;cursor:pointer;font-size:13px;}\
    .wdp-add-btn:hover{background:#5558e6;}\
    .wdp-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;}\
    .wdp-card{border:2px solid #3a3a4e;border-radius:10px;padding:8px;\
      text-align:center;cursor:pointer;transition:border .15s,background .15s;\
      position:relative;}\
    .wdp-card:hover{border-color:#555;}\
    .wdp-card--selected{border-color:#6366f1;background:rgba(99,102,241,.1);}\
    .wdp-card img{width:100%;height:90px;object-fit:cover;border-radius:6px;\
      background:#2a2a3e;}\
    .wdp-card .wdp-card-name{font-size:13px;font-weight:bold;margin:6px 0 2px;}\
    .wdp-card .wdp-card-desc{font-size:11px;color:#999;overflow:hidden;\
      text-overflow:ellipsis;white-space:nowrap;}\
    .wdp-card .wdp-card-badge{position:absolute;top:6px;right:6px;\
      background:#6366f1;color:#fff;font-size:10px;padding:2px 6px;\
      border-radius:4px;display:none;}\
    .wdp-card--selected .wdp-card-badge{display:block;}\
    .wdp-card-actions{display:flex;justify-content:center;gap:6px;margin-top:4px;}\
    .wdp-card-actions button{background:none;border:none;cursor:pointer;\
      font-size:12px;color:#aaa;padding:2px 6px;}\
    .wdp-card-actions button:hover{color:#fff;}\
    .wdp-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);\
      z-index:100000;display:none;align-items:center;justify-content:center;}\
    .wdp-modal-overlay--visible{display:flex;}\
    .wdp-modal{background:#1e1e2e;border-radius:12px;padding:20px;width:420px;\
      max-height:80vh;overflow-y:auto;}\
    .wdp-modal h4{margin:0 0 16px;font-size:15px;}\
    .wdp-modal label{display:block;font-size:12px;color:#aaa;margin-bottom:4px;\
      margin-top:12px;}\
    .wdp-modal input,.wdp-modal select,.wdp-modal textarea{width:100%;\
      padding:8px;border:1px solid #3a3a4e;border-radius:6px;background:#2a2a3e;\
      color:#e0e0e0;font-size:13px;box-sizing:border-box;}\
    .wdp-modal textarea{height:60px;resize:vertical;}\
    .wdp-modal-btns{display:flex;justify-content:flex-end;gap:8px;margin-top:16px;}\
    .wdp-modal-btns button{padding:8px 20px;border-radius:8px;cursor:pointer;\
      font-size:13px;}\
    .wdp-btn-primary{background:#6366f1;color:#fff;border:none;}\
    .wdp-btn-secondary{background:transparent;color:#aaa;border:1px solid #555;}\
    .wdp-img-error{background:#2a2a3e;height:90px;display:flex;align-items:center;\
      justify-content:center;font-size:32px;border-radius:6px;color:#666;}\
    .wdp-empty{padding:40px;text-align:center;color:#666;font-size:14px;}\
    .wdp-toolbar{display:flex;gap:6px;}\
  '.replace(/\s+/g,' '); // 压缩 CSS，注意不会破坏引号内空格

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);
})();
```

> **注意：** content 字段在 JSON 中必须转义换行和引号。上方的 JS 代码会被包裹在 JSON 字符串中，为保持可读性，实际写入时使用 `\n` 换行并转义双引号。上面的 CSS 使用 `.replace(/\s+/g,' ')` 压缩以简化转义。

- [ ] **Step 2: 在酒馆中加载测试**

1. 更新酒馆助手中的插件 JSON
2. 打开 DevTools Elements 面板
3. 确认 `<style>` 标签已注入到 `<head>`

- [ ] **Step 3: 提交**

```bash
git add wardrobe-plugin.js wardrobe-plugin.json
git commit -m "feat: inject CSS styles with wdp- namespace"
```

---

### Task 3: 构建浮窗 DOM 结构

**Files:**
- Modify: `wardrobe-plugin.js` — 在 JS 中添加 DOM 构建函数

在 CSS 注入之后，添加创建浮窗面板 HTML 的代码。

- [ ] **Step 1: 添加 DOM 构建代码**

在 CSS 注入代码之后追加：

```javascript
  // ========== DOM 构建 ==========
  function buildUI() {
    // 触发按钮
    var trigger = document.createElement('button');
    trigger.className = 'wdp-trigger';
    trigger.innerHTML = '👗';
    trigger.title = '衣橱管理';
    document.body.appendChild(trigger);

    // 浮窗
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

    // 弹窗遮罩（共用）
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
})();
```

- [ ] **Step 2: 添加显示/隐藏逻辑**

在 `buildUI()` 返回之后、IIFE 结束之前添加：

```javascript
  // 显示/隐藏
  dom.trigger.addEventListener('click', function() {
    dom.panel.classList.toggle('wdp-panel--visible');
  });
  dom.panel.querySelector('.wdp-close').addEventListener('click', function() {
    dom.panel.classList.remove('wdp-panel--visible');
  });
```

- [ ] **Step 3: 在酒馆中测试**

1. 刷新页面，确认右下角出现 👗 按钮
2. 点击按钮，确认浮窗弹出
3. 点击 ×，确认浮窗关闭

- [ ] **Step 4: 提交**

```bash
git add wardrobe-plugin.js wardrobe-plugin.json
git commit -m "feat: build floating panel DOM with show/hide"
```

---

### Task 4: 实现拖拽功能

**Files:**
- Modify: `wardrobe-plugin.js` — 添加拖拽逻辑

- [ ] **Step 1: 添加拖拽代码**

在显示/隐藏逻辑之后添加：

```javascript
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
      // 限制在可视区域内
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
```

> **注意：** 拖拽时需要清除 `transform: translate(-50%, -50%)`，改用 `left/top` 定位；初始位置用 CSS 居中，首次拖拽后切换为绝对坐标。

- [ ] **Step 2: 在酒馆测试拖拽**

1. 打开浮窗
2. 拖拽标题栏，确认面板跟随移动
3. 确认不能拖出屏幕边界

- [ ] **Step 3: 提交**

```bash
git add wardrobe-plugin.js wardrobe-plugin.json
git commit -m "feat: add drag-to-move for floating panel"
```

---

### Task 5: 实现数据管理层

**Files:**
- Modify: `wardrobe-plugin.js` — 添加状态管理代码

- [ ] **Step 1: 添加数据层代码**

在 DOM 构建之前（CSS 注入之后）添加状态管理：

```javascript
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

  var state = loadState();
```

- [ ] **Step 2: 提交**

```bash
git add wardrobe-plugin.js wardrobe-plugin.json
git commit -m "feat: add data management layer with localStorage"
```

---

### Task 6: 实现分类列表渲染和交互

**Files:**
- Modify: `wardrobe-plugin.js` — 添加分类渲染和增删逻辑

- [ ] **Step 1: 添加分类渲染和交互代码**

在数据管理代码之后、DOM 构建之后添加：

```javascript
  // ========== 分类渲染 ==========
  var currentFilter = { type: 'clothes', category: null }; // null = 全部

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
          // 迁移物品
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

      // "+"添加分类按钮
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

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
```

- [ ] **Step 2: 在酒馆测试**

1. 打开浮窗，确认左侧分类列表显示
2. 点击不同分类，确认高亮切换
3. 点"+新分类"，输入名称，确认添加
4. 悬停分类，点 ×，确认删除

- [ ] **Step 3: 提交**

```bash
git add wardrobe-plugin.js wardrobe-plugin.json
git commit -m "feat: implement category list with add/delete"
```

---

### Task 7: 实现物品网格渲染和选择

**Files:**
- Modify: `wardrobe-plugin.js` — 添加物品渲染和选择交互

- [ ] **Step 1: 添加物品渲染代码**

在分类渲染代码之后添加：

```javascript
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
      if (item.imageUrl) {
        var img = document.createElement('img');
        img.src = item.imageUrl;
        img.alt = item.name;
        img.addEventListener('error', function() {
          img.replaceWith(buildImgError());
        });
        card.appendChild(img);
      } else {
        card.appendChild(buildImgError());
      }

      card.innerHTML +=
        '<div class="wdp-card-name">' + escapeHtml(item.name) + '</div>' +
        '<div class="wdp-card-desc">' + escapeHtml(item.promptText || '(无描述)') + '</div>' +
        '<div class="wdp-card-badge">✓ 已选</div>' +
        '<div class="wdp-card-actions">' +
          '<button class="wdp-edit-btn">✏️</button>' +
          '<button class="wdp-del-btn">🗑️</button>' +
        '</div>';

      // 点击卡片选中
      card.addEventListener('click', function(e) {
        if (e.target.closest('button')) return; // 不拦截按钮点击
        var key = currentFilter.type === 'clothes' ? 'clothes' : 'hairstyle';
        if (state.selected[key] === item.id) {
          state.selected[key] = null; // 取消选中
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
        // 清理选中状态
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
```

- [ ] **Step 2: 添加初始化调用**

在 renderItems 函数定义之后（IIFE 结束之前）添加：

```javascript
  // ========== 初始化渲染 ==========
  renderCategories();
  renderItems();
```

- [ ] **Step 3: 在酒馆测试**

（目前没有数据，网格为空是预期的——显示"暂无物品"文字）

- [ ] **Step 4: 提交**

```bash
git add wardrobe-plugin.js wardrobe-plugin.json
git commit -m "feat: implement item grid rendering with select/edit/delete"
```

---

### Task 8: 实现添加/编辑物品表单弹窗

**Files:**
- Modify: `wardrobe-plugin.js` — 添加表单弹窗代码

- [ ] **Step 1: 添加表单弹窗代码**

在物品渲染代码之后添加：

```javascript
  // ========== 物品表单弹窗 ==========
  function openForm(editItem) {
    var isEdit = !!editItem;
    var item = editItem || { id: '', type: currentFilter.type, name: '', imageUrl: '', promptText: '', category: state.categories[currentFilter.type][0] || '默认' };

    var cats = state.categories[currentFilter.type] || [];
    var catOptions = cats.map(function(c) {
      return '<option value="' + escapeHtml(c) + '"' + (c === item.category ? ' selected' : '') + '>' + escapeHtml(c) + '</option>';
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

    // 事件绑定
    document.getElementById('wdp-form-cancel').addEventListener('click', closeForm);
    dom.overlay.addEventListener('click', function(e) {
      if (e.target === dom.overlay) closeForm();
    });
    document.getElementById('wdp-form-save').addEventListener('click', function() {
      var name = document.getElementById('wdp-form-name').value.trim();
      if (!name) { alert('名称不能为空'); return; }
      var imageUrl = document.getElementById('wdp-form-url').value.trim();
      var promptText = document.getElementById('wdp-form-text').value.trim();
      var category = document.getElementById('wdp-form-cat').value;

      if (isEdit) {
        // 更新已有物品
        var idx = state.items.findIndex(function(i) { return i.id === item.id; });
        if (idx !== -1) {
          state.items[idx].name = name;
          state.items[idx].imageUrl = imageUrl;
          state.items[idx].promptText = promptText;
          state.items[idx].category = category;
        }
      } else {
        // 创建新物品
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
  document.getElementById('wdp-btn-add').addEventListener('click', function() {
    // 确保有至少一个分类
    if (state.categories[currentFilter.type].length === 0) {
      state.categories[currentFilter.type].push('默认');
      saveState(state);
      renderCategories();
    }
    openForm(null);
  });
```

- [ ] **Step 2: 在酒馆测试**

1. 打开浮窗，点"+ 添加"
2. 填写名称、图片 URL、描述
3. 保存，确认卡片出现在网格中
4. 点编辑按钮，修改后保存
5. 点删除按钮，确认删除

- [ ] **Step 4: 提交**

```bash
git add wardrobe-plugin.js wardrobe-plugin.json
git commit -m "feat: implement add/edit item modal form"
```

---

### Task 9: 实现提示词注入

**Files:**
- Modify: `wardrobe-plugin.js` — 添加注入逻辑

这是最核心的功能——拦截酒馆发送事件，在提示词末尾追加描述。

- [ ] **Step 1: 研究酒馆 DOM 选择器**

在酒馆页面 DevTools Console 中执行以下脚本，确认发送按钮和输入框的选择器：

```javascript
// 常见的酒馆 DOM 结构（可能因版本不同而变化）
(function() {
  // 发送按钮候选选择器
  var btnSelectors = [
    '#send_but', '#send-but', '#send_button', '#send',
    'button[title*="送"]', 'button[title*="Send"]',
    '.fa-paper-plane', '[id*="send"]',
    'button:has(.fa-paper-plane)'
  ];
  // 输入框候选选择器
  var inputSelectors = [
    '#send_textarea', '#send-textarea', '#message', '#prompt',
    'textarea[id*="send"]', 'textarea[id*="message"]',
    'textarea[placeholder*="输入"]', 'textarea[placeholder*="message"]',
    '.textarea_bottom_align textarea'
  ];

  btnSelectors.forEach(function(s) {
    var el = document.querySelector(s);
    if (el) console.log('发送按钮:', s, el);
  });
  inputSelectors.forEach(function(s) {
    var el = document.querySelector(s);
    if (el) console.log('输入框:', s, el);
  });
})();
```

- [ ] **Step 2: 根据实际选择器添加注入代码**

基于常见酒馆结构（假设发送按钮 `#send_but`，输入框 `#send_textarea`），添加：

```javascript
  // ========== 提示词注入 ==========
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
    return '\n\n（外表描写：' + parts.join('，') + '）';
  }

  function setupInjection() {
    // 输入框选择器（云酒馆常见值，可在此调整）
    var INPUT_SELECTOR = '#send_textarea, textarea[id*="send"], textarea[id*="message"]';
    var textarea = document.querySelector(INPUT_SELECTOR);
    if (!textarea) {
      // 延迟重试——酒馆可能是 SPA，DOM 后加载
      setTimeout(setupInjection, 2000);
      return;
    }

    // Enter 键拦截
    textarea.addEventListener('keydown', function(e) {
      if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.metaKey) return;
      var injection = getInjectionText();
      if (!injection) return;
      // 等酒馆自身处理 Enter 之前追加文本
      setTimeout(function() {
        if (textarea.value.indexOf(injection) === -1) {
          textarea.value += injection;
        }
      }, 0);
    }, true); // 捕获阶段
  }

  // DOM 就绪后启动注入监听
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(setupInjection, 1000); });
  } else {
    setTimeout(setupInjection, 1000);
  }
```

- [ ] **Step 3: 创建选择器配置项**

在 JS 开头添加可配置变量：

```javascript
  // ========== 可配置项 ==========
  var CONFIG = {
    inputSelector: '#send_textarea, textarea[id*="send"], textarea[id*="message"]',
    retryDelay: 2000,          // 找不到输入框时重试间隔(ms)
    injectionPrefix: '\n\n（外表描写：',
    injectionSuffix: '）',
    injectionSeparator: '，'
  };
```

然后修改 `getInjectionText` 使用 `CONFIG` 变量。

- [ ] **Step 4: 在酒馆测试注入**

1. 添加至少一件衣服和发型，并选中
2. 在输入框输入测试文本
3. 按 Enter 发送
4. 检查实际发送的提示词是否包含注入文本

- [ ] **Step 5: 提交**

```bash
git add wardrobe-plugin.js wardrobe-plugin.json
git commit -m "feat: implement prompt injection on send"
```

---

### Task 10: 实现数据导入导出

**Files:**
- Modify: `wardrobe-plugin.js` — 添加导入导出按钮和逻辑

- [ ] **Step 1: 添加导出功能**

在初始化之前添加：

```javascript
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
```

- [ ] **Step 2: 在浮窗标题栏添加导入导出按钮**

修改 `buildUI` 中 header 的 innerHTML，在 × 按钮前添加：

```javascript
'<div>' +
  '<button class="wdp-close" title="导出" style="margin-right:8px;font-size:14px;">📥</button>' +
  '<button class="wdp-close" title="导入" style="margin-right:8px;font-size:14px;">📤</button>' +
  '<button class="wdp-close">&times;</button>' +
'</div>'
```

然后在 `buildUI` 返回之前绑定事件：

```javascript
  panel.querySelector('[title="导出"]').addEventListener('click', exportData);
  panel.querySelector('[title="导入"]').addEventListener('click', importData);
```

- [ ] **Step 3: 测试导入导出**

1. 添加几个物品
2. 点 📥 导出，确认下载 JSON 文件
3. 删除所有物品
4. 点 📤 导入刚才的文件
5. 确认数据恢复

- [ ] **Step 4: 提交**

```bash
git add wardrobe-plugin.js wardrobe-plugin.json
git commit -m "feat: add data import/export"
```

---

### Task 11: 完善错误处理、边界情况和优化

**Files:**
- Modify: `wardrobe-plugin.js` — 添加各种边界处理

- [ ] **Step 1: 分类重名检查**

在分类添加的 `prompt` 回调中已包含。确认代码存在。

- [ ] **Step 2: 图片加载失败优雅降级**

Task 7 中已包含 `img.onerror` 处理。确认代码存在。

- [ ] **Step 3: 存储空间满处理**

Task 5 的 `saveState` 中已包含 `QuotaExceededError` 检查。确认代码存在。

- [ ] **Step 4: 浮窗层级（z-index）管理**

确认 CSS 中的 z-index 值：
- trigger: 99998
- panel: 99999
- modal overlay: 100000

- [ ] **Step 5: 键盘 ESC 关闭浮窗和弹窗**

在初始化前添加：

```javascript
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (dom.overlay.classList.contains('wdp-modal-overlay--visible')) {
        closeForm();
      } else {
        dom.panel.classList.remove('wdp-panel--visible');
      }
    }
  });
```

- [ ] **Step 6: 空分类不崩溃**

在 `openForm` 函数开始处已处理（自动创建"默认"分类）。确认代码存在。

- [ ] **Step 7: 提交**

```bash
git add wardrobe-plugin.js wardrobe-plugin.json
git commit -m "fix: edge case handling and polish"
```

---

### Task 12: 编写 README

**Files:**
- Create: `README.md`

- [ ] **Step 1: 编写 README**

```markdown
# 酒馆衣橱插件

酒馆助手的独立插件，用于管理角色衣服和发型。图形化浮窗面板，每个物品配图，勾选后自动将外表描写注入 AI 提示词。

## 安装

1. 打开云酒馆 → 酒馆助手面板
2. 导入 `wardrobe-plugin.json`
3. 确保插件开关处于开启状态
4. 刷新页面

## 使用

1. 点击右下角 👗 按钮打开衣橱面板
2. 左侧分类树切换查看不同分类，支持添加/删除分类
3. 点击"+ 添加"创建新物品——填写名称、图片 URL、提示词描述、分类
4. 点击物品卡片选中（紫色边框 + ✓ 标记），同一类型只能选一个
5. 关闭面板，正常聊天——发送时自动在提示词末尾追加外表描写
6. 面板可拖拽移动，ESC 关闭

## 数据备份

- 导出：标题栏 📥 按钮 → 下载 JSON 备份文件
- 导入：标题栏 📤 按钮 → 选择 JSON 文件恢复数据

## 提示词注入格式

```
[原有提示词]

（外表描写：梳着利落的高马尾，穿着黑色丝质晚礼服，裙摆曳地）
```

## 选择器配置

如果云酒馆更新导致提示注入失效，编辑 JSON 中 `content` 字段开头的 `CONFIG` 对象：

\`\`\`javascript
var CONFIG = {
  inputSelector: '#send_textarea, ...',  // 输入框 CSS 选择器
  retryDelay: 2000,                       // DOM 未就绪时重试间隔
  injectionPrefix: '\n\n（外表描写：',
  injectionSuffix: '）',
  injectionSeparator: '，'
};
\`\`\`

## 兼容性

- 云酒馆 (e.chr1.com)
- Chrome 浏览器
- 酒馆助手 v2+
```

- [ ] **Step 2: 提交**

```bash
git add README.md
git commit -m "docs: add README with install and usage instructions"
```

---

### Task 13: 最终集成测试和 JSON 格式验证

**Files:**
- Modify: `wardrobe-plugin.js` — 验证 JSON 合法性

- [ ] **Step 1: JSON 格式验证**

```bash
python -c "import json; json.load(open('wardrobe-plugin.json', encoding='utf-8')); print('JSON valid')"
```

- [ ] **Step 2: JS 语法验证（提取 content 并用 Node 检查）**

```bash
python -c "
import json
data = json.load(open('wardrobe-plugin.json', encoding='utf-8'))
js = data['content']
# 基本检查：括号匹配
print('content 长度:', len(js), '字符')
print('开头:', js[:50])
print('结尾:', js[-50:])
"
```

- [ ] **Step 3: 完整功能测试清单**

在酒馆中逐一验证：

- [ ] 插件成功加载（Console 输出）
- [ ] 👗 按钮显示在右下角
- [ ] 点击打开浮窗
- [ ] 拖拽标题栏移动面板
- [ ] ESC 关闭面板
- [ ] 添加新分类
- [ ] 添加衣服物品（含图片 URL）
- [ ] 添加发型物品
- [ ] 切换分类筛选
- [ ] 选中/取消选中物品
- [ ] 编辑物品
- [ ] 删除物品
- [ ] 发送消息时提示词注入
- [ ] 导出 JSON
- [ ] 导入 JSON
- [ ] 只有发型没衣服 → 只追加发型描述
- [ ] 什么都没选 → 不追加

- [ ] **Step 4: 最终提交**

```bash
git add wardrobe-plugin.js wardrobe-plugin.json
git commit -m "chore: final integration validation"
```

---

## 实施顺序依赖

```
Task 1 (骨架)
  └─ Task 2 (CSS)
      └─ Task 3 (DOM)
          ├─ Task 4 (拖拽)
          ├─ Task 5 (数据层) ─────────────────┐
          │   └─ Task 6 (分类渲染) ──────────┤
          │       └─ Task 7 (物品网格) ──────┤
          │           └─ Task 8 (表单弹窗) ──┤
          │               └─ Task 9 (注入) ──┤
          │                   └─ Task 10 (导入导出)
          ├─ Task 11 (边界处理) ← 可随时并行
          └─ Task 12 (README) ← 可随时并行
Task 13 (集成测试) ← 最后
```

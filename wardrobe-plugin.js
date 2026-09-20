(function () {
  'use strict';
  if (window.__nai_wardrobe_v2_loaded) return;
  window.__nai_wardrobe_v2_loaded = true;

  var topWin;
  var topDoc;
  try {
    topWin = window.top;
    topDoc = topWin.document;
  } catch (error) {
    topWin = window;
    topDoc = document;
  }

  var STORAGE_KEY = 'nai_wardrobe_library_v2';
  var LEGACY_STORAGE_KEY = 'wardrobe_plugin_data';
  var library = null;
  var activeFilters = {};
  var dom = {};

  function text(value) { return typeof value === 'string' ? value.trim() : ''; }

  function normaliseItem(item, place, filters) {
    var name = text(item && item.name);
    var prompt = text(item && item.prompt);
    var displayName = text(item && item.display_name) || name;
    if (!name) throw new Error(place + ' 缺少 name。');
    if (!prompt) throw new Error(place + ' 的“' + displayName + '”缺少 prompt。');
    return { name: name, prompt: prompt, displayName: displayName, filters: filters };
  }

  function normaliseV2(data) {
    var ids = {};
    var groups = data.filter_groups.map(function (group, groupIndex) {
      var id = text(group && group.id);
      var label = text(group && group.label);
      var rawOptions = Array.isArray(group && group.options) ? group.options : [];
      var options = rawOptions.map(text).filter(Boolean).filter(function (value, index, values) { return values.indexOf(value) === index; });
      if (!/^[a-z][a-z0-9_-]*$/i.test(id)) throw new Error('第 ' + (groupIndex + 1) + ' 个筛选组的 id 必须为英文、数字、下划线或连字符。');
      if (ids[id]) throw new Error('筛选组 id “' + id + '”重复。');
      if (!label || !options.length) throw new Error('筛选组“' + id + '”缺少 label 或 options。');
      ids[id] = true;
      return { id: id, label: label, options: options };
    });
    if (!groups.length || !data.items.length) throw new Error('filter_groups 和 items 不能为空。');
    var items = data.items.map(function (item, itemIndex) {
      var filters = {};
      groups.forEach(function (group) {
        var raw = item && item.filters ? item.filters[group.id] : [];
        var values = Array.isArray(raw) ? raw : (raw ? [raw] : []);
        var clean = values.map(text).filter(Boolean).filter(function (value, index, all) { return all.indexOf(value) === index; });
        var invalid = clean.filter(function (value) { return group.options.indexOf(value) === -1; })[0];
        if (invalid) throw new Error('第 ' + (itemIndex + 1) + ' 套衣服的“' + group.label + '”含有未定义标签“' + invalid + '”。');
        filters[group.id] = clean;
      });
      return normaliseItem(item, '第 ' + (itemIndex + 1) + ' 套衣服', filters);
    });
    return { filterGroups: groups, items: items };
  }

  function normaliseLegacy(data) {
    if (!Array.isArray(data && data.categories) || !data.categories.length) throw new Error('根节点必须包含 filter_groups + items。');
    var categoryNames = [];
    var items = [];
    data.categories.forEach(function (category, categoryIndex) {
      var categoryName = text(category && category.name);
      if (!categoryName || !Array.isArray(category.items)) throw new Error('旧格式第 ' + (categoryIndex + 1) + ' 个分类不正确。');
      categoryNames.push(categoryName);
      category.items.forEach(function (item, itemIndex) {
        items.push(normaliseItem(item, '分类“' + categoryName + '”的第 ' + (itemIndex + 1) + ' 套衣服', { category: [categoryName] }));
      });
    });
    return { filterGroups: [{ id: 'category', label: '分类', options: categoryNames.filter(function (value, index, all) { return all.indexOf(value) === index; }) }], items: items };
  }

  function normaliseLibrary(data) {
    if (!data || typeof data !== 'object') throw new Error('JSON 根节点必须是对象。');
    return Array.isArray(data.filter_groups) && Array.isArray(data.items) ? normaliseV2(data) : normaliseLegacy(data);
  }

  function loadLibrary() {
    try {
      var raw = topWin.localStorage.getItem(STORAGE_KEY);
      return raw ? normaliseLibrary(JSON.parse(raw)) : null;
    } catch (error) {
      console.warn('[衣橱] 本地衣服库读取失败', error);
      return null;
    }
  }

  function saveLibrary(data) { topWin.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
  function countItems(data) { return data.items.length; }

  function injectStyle() {
    if (topDoc.getElementById('nai-wardrobe-v2-style')) return;
    var style = topDoc.createElement('style');
    style.id = 'nai-wardrobe-v2-style';
    style.textContent = [
      '.naw-fab{position:fixed;right:14px;bottom:84px;z-index:2147483646;display:flex;align-items:center;gap:6px;min-height:42px;padding:0 14px;border:1px solid #667085;border-radius:999px;background:#3730a3;color:#fff;font:700 14px/1 Arial,"Microsoft YaHei",sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.28);cursor:pointer}',
      '.naw-mask{position:fixed;inset:0;z-index:2147483647;display:none;align-items:flex-end;justify-content:center;padding:16px;background:rgba(0,0,0,.55);font-family:Arial,"Microsoft YaHei",sans-serif}.naw-mask.open{display:flex}',
      '.naw-panel{box-sizing:border-box;width:min(680px,100%);max-height:min(78vh,700px);overflow:auto;padding:18px;border:1px solid #5a6070;border-radius:18px;background:#22242d;color:#f4f5f7;box-shadow:0 18px 48px rgba(0,0,0,.45)}',
      '.naw-header{display:flex;justify-content:space-between;gap:12px}.naw-header h3{margin:0;font-size:18px}.naw-status{margin:4px 0 0;color:#aeb6c5;font-size:12px}.naw-close{width:32px;height:32px;border:0;border-radius:50%;background:transparent;color:#fff;font-size:27px;cursor:pointer}',
      '.naw-tools{display:flex;align-items:center;gap:10px;margin-top:16px}.naw-import,.naw-clear{box-sizing:border-box;min-height:36px;padding:8px 12px;border:1px solid #667085;border-radius:9px;background:#4f46e5;color:#fff;font-size:13px;font-weight:700;cursor:pointer}.naw-clear{background:transparent}.naw-message{min-height:18px;margin:10px 0 0;color:#aeb6c5;font-size:13px}.naw-message.error{color:#ff9b9b}.naw-message.success{color:#92dd9b}',
      '.naw-filters{display:grid;gap:12px;margin-top:12px}.naw-filter-group{display:grid;gap:7px}.naw-filter-group h4{margin:0;color:#b8c0cf;font-size:12px}.naw-filter-options{display:flex;gap:8px;overflow-x:auto;padding-bottom:2px}.naw-filter{flex:0 0 auto;min-height:34px;padding:6px 12px;border:1px solid #5f6878;border-radius:999px;background:transparent;color:#f4f5f7;font-size:13px;cursor:pointer}.naw-filter.active{border-color:transparent;background:#4f46e5;color:#fff}',
      '.naw-items{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}.naw-item{display:grid;gap:6px;min-width:0;padding:13px;border:1px solid #5b6575;border-radius:12px;background:#2b2e38;color:#f4f5f7;text-align:left;cursor:pointer}.naw-item:hover{border-color:#8c92ff}.naw-item strong{overflow:hidden;font-size:14px;text-overflow:ellipsis;white-space:nowrap}.naw-item span{display:-webkit-box;overflow:hidden;color:#b8c0cf;font-size:12px;line-height:1.4;-webkit-box-orient:vertical;-webkit-line-clamp:2}.naw-empty{padding:28px 12px;border:1px dashed #667085;border-radius:12px;color:#b8c0cf;text-align:center}',
      '@media(max-width:540px){.naw-fab{right:12px;bottom:72px;min-height:38px;padding:0 12px}.naw-mask{padding:0}.naw-panel{width:100%;max-height:82vh;padding:16px;border-right:0;border-bottom:0;border-left:0;border-radius:18px 18px 0 0}.naw-items{grid-template-columns:1fr}}'
    ].join('');
    topDoc.head.appendChild(style);
  }

  function makeButton(className, label) {
    var button = topDoc.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    return button;
  }

  function setMessage(message, type) {
    dom.message.textContent = message || '';
    dom.message.className = 'naw-message' + (type ? ' ' + type : '');
  }

  function closePanel() { dom.mask.classList.remove('open'); }

  function toggleFilter(groupId, option) {
    var selected = activeFilters[groupId] || [];
    activeFilters[groupId] = selected.indexOf(option) >= 0 ? selected.filter(function (value) { return value !== option; }) : selected.concat([option]);
    if (!activeFilters[groupId].length) delete activeFilters[groupId];
    render();
  }

  function appendOutfit(item) {
    var textarea = topDoc.querySelector('#send_textarea, textarea[id*="send"], textarea[id*="message"]');
    if (!textarea) { setMessage('未找到酒馆输入框，请先打开一个聊天。', 'error'); return; }
    var previous = textarea.value || '';
    textarea.value = previous + (previous.trim() ? '\n' : '') + item.name + ', ' + item.prompt;
    textarea.dispatchEvent(new topWin.Event('input', { bubbles: true }));
    textarea.dispatchEvent(new topWin.Event('change', { bubbles: true }));
    textarea.focus();
    if (textarea.setSelectionRange) textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    closePanel();
  }

  function render() {
    dom.filters.innerHTML = '';
    dom.items.innerHTML = '';
    setMessage('');
    if (!library) {
      dom.status.textContent = '尚未导入衣服库';
      dom.clear.hidden = true;
      var empty = topDoc.createElement('div'); empty.className = 'naw-empty'; empty.textContent = '请先导入符合格式的 JSON 衣服库。'; dom.items.appendChild(empty);
      return;
    }
    dom.status.textContent = '已保存 ' + library.filterGroups.length + ' 组筛选，' + countItems(library) + ' 套衣服';
    dom.clear.hidden = false;
    library.filterGroups.forEach(function (group) {
      var section = topDoc.createElement('section'); section.className = 'naw-filter-group';
      var heading = topDoc.createElement('h4'); heading.textContent = group.label;
      var options = topDoc.createElement('div'); options.className = 'naw-filter-options';
      var all = makeButton('naw-filter' + (!(activeFilters[group.id] || []).length ? ' active' : ''), '全部');
      all.addEventListener('click', function () { delete activeFilters[group.id]; render(); }); options.appendChild(all);
      group.options.forEach(function (option) {
        var button = makeButton('naw-filter' + ((activeFilters[group.id] || []).indexOf(option) >= 0 ? ' active' : ''), option);
        button.addEventListener('click', function () { toggleFilter(group.id, option); }); options.appendChild(button);
      });
      section.appendChild(heading); section.appendChild(options); dom.filters.appendChild(section);
    });
    var visible = library.items.filter(function (item) {
      return library.filterGroups.every(function (group) {
        var selected = activeFilters[group.id] || [];
        return !selected.length || selected.some(function (value) { return (item.filters[group.id] || []).indexOf(value) >= 0; });
      });
    });
    if (!visible.length) { var noResult = topDoc.createElement('div'); noResult.className = 'naw-empty'; noResult.textContent = '没有符合当前筛选条件的衣服。'; dom.items.appendChild(noResult); }
    visible.forEach(function (item) {
      var card = makeButton('naw-item', '');
      var title = topDoc.createElement('strong'); title.textContent = item.displayName;
      var tags = topDoc.createElement('span'); tags.textContent = item.name + ', ' + item.prompt;
      card.appendChild(title); card.appendChild(tags); card.addEventListener('click', function () { appendOutfit(item); }); dom.items.appendChild(card);
    });
  }

  function importLibrary(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) return;
    var reader = new topWin.FileReader();
    reader.onload = function () {
      try {
        var imported = normaliseLibrary(JSON.parse(reader.result));
        if (library && !topWin.confirm('导入新衣服库会替换当前已保存的衣服库，继续吗？')) return;
        library = imported; activeFilters = {}; saveLibrary(imported); render(); setMessage('导入成功：' + imported.filterGroups.length + ' 组筛选，' + countItems(imported) + ' 套衣服。', 'success');
      } catch (error) { setMessage('导入失败：' + (error.message || '请检查 JSON 文件。'), 'error'); }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  function build() {
    injectStyle();
    var trigger = makeButton('naw-fab', '👗 衣服');
    var mask = topDoc.createElement('div'); mask.className = 'naw-mask';
    var panel = topDoc.createElement('section'); panel.className = 'naw-panel';
    panel.innerHTML = '<header class="naw-header"><div><h3>NovelAI 衣服库</h3><p class="naw-status"></p></div><button class="naw-close" type="button" aria-label="关闭">×</button></header><div class="naw-tools"><label class="naw-import">导入 JSON<input type="file" accept="application/json,.json" hidden></label><button class="naw-clear" type="button" hidden>清除衣服库</button></div><p class="naw-message"></p><div class="naw-filters"></div><div class="naw-items"></div>';
    mask.appendChild(panel); topDoc.body.appendChild(trigger); topDoc.body.appendChild(mask);
    dom = { mask: mask, status: panel.querySelector('.naw-status'), clear: panel.querySelector('.naw-clear'), message: panel.querySelector('.naw-message'), filters: panel.querySelector('.naw-filters'), items: panel.querySelector('.naw-items') };
    trigger.addEventListener('click', function () { mask.classList.add('open'); render(); });
    panel.querySelector('.naw-close').addEventListener('click', closePanel);
    mask.addEventListener('click', function (event) { if (event.target === mask) closePanel(); });
    panel.querySelector('input[type="file"]').addEventListener('change', importLibrary);
    dom.clear.addEventListener('click', function () {
      if (!library || !topWin.confirm('确定清除已保存的衣服库吗？不会删除原始 JSON 文件。')) return;
      topWin.localStorage.removeItem(STORAGE_KEY); library = null; activeFilters = {}; render(); setMessage('已清除本地保存的衣服库。', 'success');
    });
    topDoc.addEventListener('keydown', function (event) { if (event.key === 'Escape') closePanel(); });
  }

  function init() {
    if (!topDoc.body || topDoc.getElementById('nai-wardrobe-v2-style')) return topWin.setTimeout(init, 100);
    library = loadLibrary();
    build();
    console.log('[衣橱] NovelAI 多维衣服库已加载');
  }

  if (topDoc.readyState === 'loading') topDoc.addEventListener('DOMContentLoaded', init); else init();
}());

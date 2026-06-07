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

如果云酒馆更新导致提示注入失效，编辑 `wardrobe-plugin.js` 开头的 `CONFIG` 对象后重新构建：

```javascript
var CONFIG = {
  inputSelector: '#send_textarea, textarea[id*="send"], textarea[id*="message"]',
  retryDelay: 2000,                       // DOM 未就绪时重试间隔(ms)
  injectionPrefix: '\n\n（外表描写：',
  injectionSuffix: '）',
  injectionSeparator: '，'
};
```

修改后运行 `node build.js` 重新生成 JSON。

## 开发

```bash
# 编辑 wardrobe-plugin.js 后重新构建
node build.js
```

## 兼容性

- 云酒馆 (e.chr1.com)
- Chrome 浏览器
- 酒馆助手 v2+

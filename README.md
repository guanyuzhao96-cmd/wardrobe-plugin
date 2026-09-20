# NovelAI 衣服库（酒馆助手插件）

右下角“👗 衣服”按钮会打开多维衣服选择浮窗。导入本地 JSON 后，点击衣服会把 `name, prompt` 的 NovelAI 英文标签追加到当前聊天输入框末尾；不会自动发送，也不会覆盖已有内容。

## 安装

1. 打开云酒馆的酒馆助手面板。
2. 导入仓库中的 `wardrobe-plugin.json`。
3. 确保插件已启用，刷新页面。
4. 点击右下角“👗 衣服”，导入 `novelai-clothes-library-template.json` 后即可使用。

## 筛选方式

默认模板包含四组可叠加筛选：角色阶段（少女、大学生、研究生、职场新人、白领、轻熟女、熟女）；风格（清纯、甜美、温柔、学院、休闲、知性、优雅、复古、辣妹、性感、火辣、御姐、酷飒）；场景（日常、校园、通勤、约会、旅行、运动、居家、派对、晚宴、海边、正装、制服）；特殊类型（泳装、内衣、情趣、角色扮演、SM、睡衣）。同一组多选是“或”，不同组同时筛选是“且”。

## JSON 格式

```json
{
  "filter_groups": [
    { "id": "persona", "label": "角色阶段", "options": ["少女", "大学生", "熟女"] },
    { "id": "style", "label": "风格", "options": ["清纯", "性感", "火辣"] }
  ],
  "items": [
    {
      "display_name": "大学生水手制服",
      "name": "sailor uniform",
      "prompt": "white short sleeves, navy blue sailor collar, navy blue pleated skirt, knee socks, brown loafers",
      "filters": { "persona": ["大学生"], "style": ["清纯"] }
    }
  ]
}
```

- `display_name`：只用于面板显示，可以中文。
- `name`：核心 NovelAI 英文标签。
- `prompt`：补充 NovelAI 标签，以英文逗号分隔。
- `filters`：衣服所属筛选标签，键名必须对应 `filter_groups` 的 `id`。

不要把中文说明、Markdown 或自然语言句子写入 `name`、`prompt`。权重可直接使用 NovelAI 形式，例如 `(sailor collar:1.15)`。

## 本地保存

导入后的衣服库会保存在当前浏览器本地；刷新页面仍可用。导入新 JSON 时会要求确认，清除操作只会删除本地缓存，不会删除原始 JSON 文件。

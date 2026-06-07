const fs = require('fs');
const path = require('path');

const js = fs.readFileSync('wardrobe-plugin.js', 'utf-8');
// Base64 编码 → 一行 eval 搞定，避免 content 中任何转义/换行问题
const b64 = Buffer.from(js, 'utf-8').toString('base64');
const content = 'eval(atob(\'' + b64 + '\'))';

const config = {
  type: "script",
  enabled: true,
  name: "衣橱管理",
  id: "c1a2b3d4-e5f6-7890-abcd-ef1234567890",
  content: content,
  info: "管理角色衣服和发型，选中后在生成时自动注入外表描写。右下角👗打开面板。",
  button: { enabled: false, buttons: [] },
  data: {}
};

fs.writeFileSync('wardrobe-plugin.json', JSON.stringify(config, null, 2), 'utf-8');
console.log('✅ wardrobe-plugin.json 已生成');
console.log('原始 JS:', js.length, 'chars');
console.log('Base64 长度:', b64.length, 'chars');
console.log('Content 长度:', content.length, 'chars');

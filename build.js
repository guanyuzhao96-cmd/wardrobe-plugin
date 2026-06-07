const fs = require('fs');
const path = require('path');

// jsDelivr CDN 地址
const CDN_URL = 'https://gcore.jsdelivr.net/gh/guanyuzhao96-cmd/wardrobe-plugin@master/wardrobe-plugin.js';
const content = "import '" + CDN_URL + "'";

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
console.log('CDN:', CDN_URL);
console.log('Content:', content);

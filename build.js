const fs = require('fs');

const CDN_REF = process.env.CDN_REF || 'de16fd5562d3c1814802d4deea4832a5f2768edb';
const CDN_URL = `https://gcore.jsdelivr.net/gh/guanyuzhao96-cmd/wardrobe-plugin@${CDN_REF}/wardrobe-plugin.js`;

const config = {
  type: 'script',
  enabled: true,
  name: 'NovelAI 衣服库',
  id: 'c1a2b3d4-e5f6-7890-abcd-ef1234567890',
  content: `import '${CDN_URL}'`,
  info: '导入 JSON 衣服库，按多维标签筛选，并将 NovelAI 标签追加到聊天输入框。',
  button: { enabled: false, buttons: [] },
  data: {}
};

fs.writeFileSync('wardrobe-plugin.json', JSON.stringify(config, null, 2), 'utf-8');
console.log('Generated wardrobe-plugin.json for', CDN_REF);

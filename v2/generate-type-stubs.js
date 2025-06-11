const fs = require('fs');
const path = require('path');

// 💡 カテゴリのルール設定（拡張自由！）
const CATEGORY_RULES = {
  economy: [/market/i, /economic/i, /resource/i],
  technology: [/technology/i, /innovation/i, /infrastructure/i],
  religion: [/religion/i, /clergy/i, /afterlife/i, /myth/i],
  culture: [/tradition/i, /cultural/i, /festival/i, /symbol/i],
  language: [/language/i, /vocabulary/i, /grammar/i, /dialect/i],
  climate: [/climate/i, /temperature/i, /weather/i, /humidity/i],
  infrastructure: [/infrastructure/i, /education/i, /security/i, /healthcare/i],
  resource: [/abundance/i, /depletion/i],
  shared: [] // fallback
};

const OUTPUT_DIR = path.join(__dirname, 'src/types');
const INPUT_FILE = path.join(__dirname, 'types_error.txt');

// 📥 ファイル読み込み
const raw = fs.readFileSync(INPUT_FILE, 'utf-8');
const matches = raw.matchAll(/Cannot find name '([^']+)'/g);
const typeNames = Array.from(matches, m => m[1]);

// 分類マップ
const categorized = {};

typeNames.forEach((typeName) => {
  let category = 'shared';
  for (const [cat, patterns] of Object.entries(CATEGORY_RULES)) {
    if (patterns.some((p) => p.test(typeName))) {
      category = cat;
      break;
    }
  }
  if (!categorized[category]) categorized[category] = [];
  categorized[category].push(typeName);
});

// 📁 出力フォルダ作成
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// 📦 ファイル書き出し
for (const [category, names] of Object.entries(categorized)) {
  const filePath = path.join(OUTPUT_DIR, `${category}.ts`);
  const stubLines = names.map((name) => `export type ${name} = any;`);
  fs.writeFileSync(filePath, stubLines.join('\n') + '\n', 'utf-8');
  console.log(`✅ ${filePath} に ${names.length} 型を出力しました`);
}

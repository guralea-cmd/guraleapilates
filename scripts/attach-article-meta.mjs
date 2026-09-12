// One-off helper: gives every article JSON its topic (categorySlug) and its library image.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content', 'articles');
const meta = {
  'low-back-pain': { categorySlug: 'back-pain' },
  'herniated-disc': { categorySlug: 'herniated-disc', image: 'article-herniated-disc.jpg', imageAlt: 'עמוד שדרה' },
  'fibromyalgia': { categorySlug: 'fibromyalgia', image: 'article-fibromyalgia.jpg', imageAlt: 'יום המודעות לפיברומיאלגיה' },
  'arthritis': { categorySlug: 'arthritis', image: 'article-arthritis.jpg', imageAlt: 'מנצחים את הכאבים' },
  'joint-replacement': { categorySlug: 'joint-replacement', image: 'article-joint-replacement.jpg', imageAlt: 'ממריצים את תהליך השיקום' },
  'osteoporosis': { categorySlug: 'osteoporosis', image: 'article-osteoporosis.jpg', imageAlt: 'התעמלות בונה עצם' },
  'urinary-incontinence': { categorySlug: 'urinary-incontinence', image: 'article-urinary-incontinence.jpg', imageAlt: 'שרירי רצפת האגן' },
  'balance': { categorySlug: 'balance', image: 'article-balance.jpg', imageAlt: 'בשביל שיווי משקל' },
  'frozen-shoulder': { categorySlug: 'frozen-shoulder', image: 'article-frozen-shoulder.jpg', imageAlt: 'לטפל בכתף' },
  'neck-pain': { categorySlug: 'neck-pain', image: 'article-neck-pain.jpg', imageAlt: 'אימוני פילאטיס מפחיתים כאבים' }
};

for (const [slug, m] of Object.entries(meta)) {
  const file = join(dir, `${slug}.json`);
  if (!existsSync(file)) { console.log(`missing (not written yet): ${slug}`); continue; }
  const a = JSON.parse(readFileSync(file, 'utf8'));
  Object.assign(a, m);
  const label = { 'back-pain': 'כאבי גב', 'herniated-disc': 'בקע דיסק', 'fibromyalgia': 'פיברומיאלגיה', 'arthritis': 'דלקות מפרקים', 'joint-replacement': 'אחרי ניתוחי החלפת מפרק', 'osteoporosis': 'אוסטאופורוזיס', 'urinary-incontinence': 'בריחת שתן', 'balance': 'קושי בשיווי משקל', 'frozen-shoulder': 'כתף קפואה', 'neck-pain': 'כאבי צוואר' }[a.categorySlug];
  if (label) a.category = label;
  writeFileSync(file, JSON.stringify(a, null, 2) + '\n', 'utf8');
  console.log(`ok: ${slug} -> ${a.categorySlug} | ${a.image || '(image unchanged)'} | "${a.title}"`);
}

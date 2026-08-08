#!/usr/bin/env bash
# Mede as Core Web Vitals de uma URL com Lighthouse local, salvando o JSON
# para comparar antes/depois. Uso: ./medir.sh https://sua-url
set -euo pipefail

URL="${1:?Uso: ./medir.sh <url>}"
NOME="${2:-relatorio}"

npx --yes lighthouse "$URL" \
  --quiet \
  --chrome-flags="--headless --no-sandbox" \
  --output=json \
  --output-path=".lighthouse/$NOME.json"

node -e "
const r = require('./.lighthouse/$NOME.json');
const a = r.audits;
console.log('=== $NOME ===');
console.log('Performance :', Math.round(r.categories.performance.score * 100));
console.log('LCP         :', (a['largest-contentful-paint'].numericValue / 1000).toFixed(2) + 's  (alvo <= 2.5s)');
console.log('INP         :', (a['interaction-to-next-paint'].numericValue).toFixed(0) + 'ms  (alvo <= 200ms)');
console.log('CLS         :', a['cumulative-layout-shift'].numericValue.toFixed(3) + '  (alvo <= 0.1)');
console.log('TBT         :', a['total-blocking-time'].numericValue.toFixed(0) + 'ms');
console.log('JS total    :', (a['resource-summary-javascript'].details.items[0].size / 1024).toFixed(0) + ' kB');
"

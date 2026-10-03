const fs = require('fs');

async function test() {
  const ghRes = await fetch('https://github.com/users/sk200005/contributions');
  const ghHtml = await ghRes.text();
  const map = {};
  const regex = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="([^"]+)"[^>]*>[\s\S]*?<tool-tip[^>]*for="\2"[^>]*>([^<]+)<\/tool-tip>/g;
  let match;
  while ((match = regex.exec(ghHtml)) !== null) {
    const date = match[1];
    const text = match[3];
    let num = 0;
    if (text.toLowerCase().includes('no contributions')) {
      num = 0;
    } else {
      const numMatch = text.match(/^([\d,]+)/);
      if (numMatch) {
        num = parseInt(numMatch[1].replace(/,/g, ''), 10);
      }
    }
    map[date] = num;
  }

  const svgRes = await fetch('https://ghchart.rshah.org/sk200005');
  const svgText = await svgRes.text();
  const svgRegex = /data-date="([^"]+)"[^>]*data-score="([^"]+)"/g;
  let svgMatch;
  let diffs = 0;
  while ((svgMatch = svgRegex.exec(svgText)) !== null) {
    const date = svgMatch[1];
    const score = parseInt(svgMatch[2], 10);
    const actual = map[date];
    if (score !== actual) {
      console.log(`Mismatch on ${date}: rshah=${score}, actual=${actual}`);
      diffs++;
    }
  }
  console.log(`Total mismatches: ${diffs}`);
}

test();

const fs = require('fs');

fetch('https://github.com/users/sk200005/contributions')
  .then(res => res.text())
  .then(html => {
    const map = {};
    const regex = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="([^"]+)"[^>]*>[\s\S]*?<tool-tip[^>]*for="\2"[^>]*>([^<]+)<\/tool-tip>/g;
    let match;
    let count = 0;
    while ((match = regex.exec(html)) !== null) {
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
      count++;
    }
    console.log(`Matched ${count} days.`);
    console.log(map['2026-09-17']);
    console.log(map['2026-09-24']);
  });

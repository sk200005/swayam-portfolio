export async function GET() {
  try {
    const [svgRes, htmlRes] = await Promise.all([
      fetch('https://ghchart.rshah.org/sk200005', {
        next: { revalidate: 21600 } // cache for 6 hours
      }),
      fetch('https://github.com/users/sk200005/contributions', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 21600 }
      })
    ]);
    
    let svg = await svgRes.text();
    let html = await htmlRes.text();
    
    let total = '';
    const matchTotal = html.match(/([\d,]+)\s+contributions\s+in the last year/i) || html.match(/([\d,]+)\s+contributions/i);
    if (matchTotal) {
      total = matchTotal[1];
    }
    
    // Extract width and height to create viewBox for proper scaling
    let width = 722;
    let height = 112;
    const match = svg.match(/<svg[^>]*width="(\d+)"[^>]*height="(\d+)"/);
    if (match) {
      width = match[1];
      height = match[2];
    }
    svg = svg.replace(/<svg/, `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet"`);
    
    // Remove shape-rendering="crispedges" to allow border-radius
    svg = svg.replace(/shape-rendering:crispedges;/g, '');
    
    // Convert light theme colors to exact GitHub Dark theme colors
    svg = svg.replace(/#eeeeee/g, '#161b22'); // 0 contributions
    svg = svg.replace(/#c6e48b/g, '#0e4429'); // level 1
    svg = svg.replace(/#7bc96f/g, '#006d32'); // level 2
    svg = svg.replace(/#239a3b/g, '#26a641'); // level 3
    svg = svg.replace(/#196127/g, '#39d353'); // level 4
    
    // Extract exact counts per day from HTML
    const countMap = {};
    const regex = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="([^"]+)"[^>]*>[\s\S]*?<tool-tip[^>]*for="\2"[^>]*>([^<]+)<\/tool-tip>/g;
    let tooltipMatch;
    while ((tooltipMatch = regex.exec(html)) !== null) {
      const date = tooltipMatch[1];
      const text = tooltipMatch[3];
      let num = 0;
      if (text.toLowerCase().includes('no contributions')) {
        num = 0;
      } else {
        const numMatch = text.match(/^([\d,]+)/);
        if (numMatch) {
          num = parseInt(numMatch[1].replace(/,/g, ''), 10);
        }
      }
      countMap[date] = num;
    }

    // Convert self-closing rects, add rx/ry, and inject data-count
    svg = svg.replace(
      /<rect([^>]*?data-score="([^"]+)"\s+data-date="([^"]+)"[^>]*?)\/>/g, 
      (m, attrs, score, date) => {
        const count = countMap[date] !== undefined ? countMap[date] : score;
        return `<rect rx="2" ry="2" data-count="${count}" ${attrs}></rect>`;
      }
    );
    
    return Response.json({ svg, total }, {
      headers: {
        'Cache-Control': 'public, max-age=21600, stale-while-revalidate=21600'
      }
    });
  } catch (err) {
    return Response.json({ error: 'Error loading heatmap' }, { status: 500 });
  }
}

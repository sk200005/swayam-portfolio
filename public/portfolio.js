(function(){
  var EMAIL = 'swayamkorde2005@gmail.com';
  var toastEl = document.getElementById('toast'), tt;
  function toast(msg){
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(tt); tt = setTimeout(function(){ toastEl.classList.remove('show'); }, 2200);
  }

  /* copy email */
  document.querySelectorAll('[data-copy]').forEach(function(b){
    b.addEventListener('click', function(){
      var done = function(){ toast('Email copied'); };
      if (navigator.clipboard && window.isSecureContext){
        navigator.clipboard.writeText(EMAIL).then(done, fallback);
      } else fallback();
      function fallback(){
        var t = document.createElement('textarea'); t.value = EMAIL; t.style.position='fixed'; t.style.opacity='0';
        document.body.appendChild(t); t.select();
        try { document.execCommand('copy'); done(); } catch(e){ toast('Copy failed. The email is ' + EMAIL); }
        document.body.removeChild(t);
      }
    });
  });

  /* send note */
  var note = document.getElementById('note'), hint = document.getElementById('hint');
  var fromEmail = document.getElementById('from-email');
  document.getElementById('send').addEventListener('click', function(){
    var body = note.value.trim();
    var email = (fromEmail && fromEmail.value || '').trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      hint.style.color = '#B3245F'; hint.textContent = 'Add a valid email so Swayam can reply.';
      if (fromEmail) fromEmail.focus(); return;
    }
    if (!body){ hint.style.color = '#B3245F'; hint.textContent = 'Write a note first, then send it.'; note.focus(); return; }
    hint.style.color = '#5B4A70';
    hint.textContent = 'Sending your note…';
    var sendBtn = document.getElementById('send');
    sendBtn.disabled = true;
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: body, email: email })
    }).then(function(r){ return r.json().then(function(d){ return { ok: r.ok, d: d }; }); })
      .then(function(res){
        sendBtn.disabled = false;
        if (res.ok){ note.value = ''; if (fromEmail) fromEmail.value = ''; hint.textContent = ''; toast('Sent! Your note landed in the inbox.'); }
        else { 
          var subject = encodeURIComponent("Portfolio Contact");
          var encodedBody = encodeURIComponent(body + "\n\n(My email is: " + email + ")");
          window.location.href = "mailto:swayamkorde2005@gmail.com?subject=" + subject + "&body=" + encodedBody;
          note.value = ''; if (fromEmail) fromEmail.value = ''; hint.textContent = ''; toast('Opening your email client...');
        }
      })
      .catch(function(){ 
        sendBtn.disabled = false; 
        var subject = encodeURIComponent("Portfolio Contact");
        var encodedBody = encodeURIComponent(body + "\n\n(My email is: " + email + ")");
        window.location.href = "mailto:swayamkorde2005@gmail.com?subject=" + subject + "&body=" + encodedBody;
        note.value = ''; if (fromEmail) fromEmail.value = ''; hint.textContent = ''; toast('Opening your email client...');
      });
  });
  note.addEventListener('input', function(){ if (note.value.trim()) hint.textContent = ''; });
  if (fromEmail) fromEmail.addEventListener('input', function(){ if (fromEmail.value.trim()) hint.textContent = ''; });

  /* playful visitor cursor label — follows across the entire page */
  var you = document.querySelector('.you');
  if (you && window.matchMedia('(pointer: fine)').matches){
    window.addEventListener('pointermove', function(e){
      you.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
      you.classList.add('on');
    }, {passive:true});
    document.addEventListener('mouseleave', function(){ you.classList.remove('on'); });
    window.addEventListener('blur', function(){ you.classList.remove('on'); });
  }

  /* keep stacked project cards the same height so tabs line up cleanly */
  var bodies = document.querySelectorAll('.proj-body');
  function equalize(){
    bodies.forEach(function(b){ b.style.minHeight = ''; });
    if (window.innerWidth <= 760) return;
    var bar = 64;
    var avail = window.innerHeight - bar - 40;   /* room a sticky card can occupy */
    var h = 0; bodies.forEach(function(b){ h = Math.max(h, b.offsetHeight); });
    if (avail > 260) h = Math.min(h, avail);     /* never taller than the viewport */
    bodies.forEach(function(b){ b.style.minHeight = h + 'px'; });
  }
  equalize(); window.addEventListener('resize', equalize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(equalize);

  /* draggable stickers */
  var board = document.getElementById('board'), z = 5;
  var stickers = board.querySelectorAll('.sticker');
  stickers.forEach(function(el){
    var ox = 0, oy = 0, sx, sy, base, bRect, on = false;
    el.addEventListener('pointerdown', function(e){
      on = true; el.setPointerCapture(e.pointerId); el.classList.remove('tidy'); el.classList.add('drag');
      el.style.zIndex = ++z;
      ox = parseFloat(el.style.getPropertyValue('--dx')) || 0;
      oy = parseFloat(el.style.getPropertyValue('--dy')) || 0;
      sx = e.clientX - ox; sy = e.clientY - oy;
      var r = el.getBoundingClientRect(); bRect = board.getBoundingClientRect();
      base = { l: r.left - ox, t: r.top - oy, r: r.right - ox, b: r.bottom - oy };
    });
    el.addEventListener('pointermove', function(e){
      if (!on) return;
      var nx = e.clientX - sx, ny = e.clientY - sy, pad = 8;
      nx = Math.max(bRect.left - base.l + pad, Math.min(bRect.right - base.r - pad, nx));
      ny = Math.max(bRect.top - base.t + pad, Math.min(bRect.bottom - base.b - pad, ny));
      el.style.setProperty('--dx', nx + 'px'); el.style.setProperty('--dy', ny + 'px');
    });
    function end(){ on = false; el.classList.remove('drag'); }
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  });
  document.getElementById('tidy').addEventListener('click', function(){
    stickers.forEach(function(el){ el.classList.add('tidy'); el.style.setProperty('--dx','0px'); el.style.setProperty('--dy','0px'); });
    toast('All tidy');
  });
  /* mobile: slide-up reveal for project cards */
  if (window.innerWidth <= 760) {
    var projCards = document.querySelectorAll('.proj');
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    projCards.forEach(function(card) { io.observe(card); });
  }
})();

/* animated background: faint dot grid, blinking pixels, and small falling pixel blocks */
(function(){
  var cv = document.getElementById('bgfx');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var STEP = 22, SIZE = 4;
  var COLORS = ['63,162,255','139,143,255','69,211,156','255,212,71'];
  var SHAPES = [[[0,0],[1,0],[2,0],[1,1]],[[0,0],[0,1],[1,1],[2,1]],[[0,0],[1,0],[0,1],[1,1]],
                [[0,0],[1,0],[2,0],[3,0]],[[0,0],[1,0],[1,1],[2,1]],[[0,0],[0,1],[0,2],[1,2]]];
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W, H, dpr, cols, rows, dots, raf = 0, last = 0, nextFall = 0;
  var blinks = [], falls = [];

  function rnd(a, b){ return a + Math.random() * (b - a); }
  function pick(a){ return a[(Math.random() * a.length) | 0]; }
  function tint(){ return Math.random() < 0.18 ? { rgb: pick(COLORS), peak: rnd(.45,.7) } : { rgb: '255,255,255', peak: rnd(.18,.38) }; }

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cols = Math.ceil(W / STEP) + 1; rows = Math.ceil(H / STEP) + 1;
    dots = document.createElement('canvas'); dots.width = cv.width; dots.height = cv.height;
    var d = dots.getContext('2d'); d.scale(dpr, dpr); d.fillStyle = 'rgba(255,255,255,.075)';
    for (var x = 0; x < cols; x++) for (var y = 0; y < rows; y++){
      d.beginPath(); d.arc(x * STEP + 11, y * STEP + 11, 1.15, 0, 6.2832); d.fill();
    }
    blinks = blinks.filter(function(b){ return b.x < cols && b.y < rows; });
    if (reduce) drawStill();
  }

  function cell(x, y, rgb, a){
    if (a <= 0) return;
    ctx.fillStyle = 'rgba(' + rgb + ',' + a.toFixed(3) + ')';
    ctx.fillRect(x * STEP + 9, y * STEP + 9, SIZE, SIZE);
  }

  function base(){
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(dots, 0, 0, W, H);
  }

  function drawStill(){
    base();
    var n = Math.round(cols * rows / 90);
    for (var i = 0; i < n; i++){ var c = tint(); cell((Math.random()*cols)|0, (Math.random()*rows)|0, c.rgb, c.peak * .8); }
  }

  function frame(t){
    raf = requestAnimationFrame(frame);
    if (t - last < 33) return;
    last = t;
    base();

    var target = Math.round(cols * rows / 65);
    for (var s = 0; s < 3 && blinks.length < target; s++){
      var c = tint();
      blinks.push({ x: (Math.random()*cols)|0, y: (Math.random()*rows)|0, rgb: c.rgb, peak: c.peak, t0: t, dur: rnd(900, 2800) });
    }
    blinks = blinks.filter(function(b){
      var p = (t - b.t0) / b.dur;
      if (p >= 1) return false;
      cell(b.x, b.y, b.rgb, b.peak * Math.sin(Math.PI * p));
      return true;
    });

    if (t > nextFall && falls.length < 4){
      var c2 = Math.random() < 0.45 ? { rgb: pick(COLORS), peak: .6 } : { rgb: '255,255,255', peak: .42 };
      falls.push({ x: (Math.random() * (cols - 4)) | 0, y: (Math.random() * rows * .6) | 0, shape: pick(SHAPES),
                   rgb: c2.rgb, peak: c2.peak, t0: t, step: rnd(200, 320), steps: 5 + ((Math.random() * 5) | 0) });
      nextFall = t + rnd(1400, 3200);
    }
    falls = falls.filter(function(f){
      var e = (t - f.t0) / f.step, k = Math.floor(e);
      if (k >= f.steps) return false;
      var a = f.peak * Math.min(1, e) * Math.min(1, (f.steps - e) / 2);
      f.shape.forEach(function(p){
        cell(f.x + p[0], f.y + p[1] + k, f.rgb, a);
        cell(f.x + p[0], f.y + p[1] + k - 1, f.rgb, a * .28);
      });
      return true;
    });
  }

  resize();
  window.addEventListener('resize', resize);
  if (!reduce){
    raf = requestAnimationFrame(frame);
    document.addEventListener('visibilitychange', function(){
      if (document.hidden){ cancelAnimationFrame(raf); raf = 0; }
      else if (!raf){ last = 0; raf = requestAnimationFrame(frame); }
    });
  }

  // Fetch and inject GitHub heatmap SVG dynamically so tooltips work
  var heatmapContainer = document.getElementById('github-heatmap-container');
  if (heatmapContainer) {
    fetch('/api/github-heatmap?v=2')
      .then(function(res) {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then(function(data) {
        heatmapContainer.innerHTML = data.svg;
        var svgEl = heatmapContainer.querySelector('svg');
        if (svgEl) {
          svgEl.style.width = '100%';
          svgEl.style.height = 'auto';
        }
        var totalEl = document.getElementById('gh-total-contributions');
        if (totalEl && data.total) {
          totalEl.textContent = data.total + ' Total';
          totalEl.style.display = 'inline-block';
        }

        // Custom tooltip on hover for GitHub heatmap
        var tooltip = document.createElement('div');
        tooltip.className = 'gh-tooltip';
        tooltip.style.cssText = 'position:fixed;pointer-events:none;opacity:0;z-index:100;background:rgba(18,16,23,0.95);color:#f4f0fa;border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:6px 12px;font-size:13px;font-weight:500;white-space:nowrap;transition:opacity 0.12s ease;backdrop-filter:blur(8px);box-shadow:0 8px 24px rgba(0,0,0,0.5);';
        document.body.appendChild(tooltip);

        var cells = heatmapContainer.querySelectorAll('rect[data-score]');
        cells.forEach(function(cell) {
          cell.style.cursor = 'pointer';
          cell.style.transition = 'opacity 0.12s ease';
          
          cell.addEventListener('mouseenter', function(e) {
            cell.style.opacity = '0.7';
            var count = parseInt(cell.getAttribute('data-count'));
            var date = cell.getAttribute('data-date');
            var d = new Date(date + 'T00:00:00');
            var formatted = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
            var text = count === 0 ? 'No contributions' : (count + ' contribution' + (count !== 1 ? 's' : ''));
            tooltip.textContent = text + ' on ' + formatted;
            tooltip.style.opacity = '1';
          });
          cell.addEventListener('mousemove', function(e) {
            tooltip.style.left = (e.clientX + 12) + 'px';
            tooltip.style.top = (e.clientY - 36) + 'px';
          });
          cell.addEventListener('mouseleave', function() {
            cell.style.opacity = '1';
            tooltip.style.opacity = '0';
          });
        });
      })
      .catch(function(err) {
        heatmapContainer.innerHTML = '<span style="color: var(--slate); font-size: 14px;">Heatmap unavailable</span>';
      });
  }
})();

/* ---------- LeetCode Heatmap ---------- */
(function(){
  var container = document.getElementById('lc-heatmap-container');
  var badgesEl = document.getElementById('lc-solved-badges');
  var statsLine = document.getElementById('lc-stats-line');
  if (!container) return;

  var CELL = 10, GAP = 2, TOTAL = CELL + GAP;
  var ROWS = 7; // days of week
  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // Red shades matching portfolio dark theme
  var LEVELS = [
    'rgba(255,255,255,0.04)',  // 0 — empty
    '#5c1a1a',                 // 1-2
    '#8b2020',                 // 3-4
    '#c43030',                 // 5-7
    '#ef4444',                 // 8+
  ];

  function getLevel(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    if (count <= 7) return 3;
    return 4;
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function dateKey(d) {
    return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
  }

  fetch('/api/leetcode')
    .then(function(res) {
      if (!res.ok) throw new Error('API error');
      return res.json();
    })
    .then(function(data) {
      var calendar = data.calendar || {};
      var solved = data.solved || {};

      // Update stats line
      if (solved.total) {
        statsLine.textContent = solved.total + ' problems solved';
      }

      // Render solved badges
      if (badgesEl && solved.total) {
        badgesEl.style.display = 'flex';
        badgesEl.innerHTML =
          '<span class="lc-badge lc-badge-total">' + solved.total + ' Total</span>' +
          '<span class="lc-badge lc-badge-easy">' + solved.easy + ' Easy</span>' +
          '<span class="lc-badge lc-badge-medium">' + solved.medium + ' Medium</span>' +
          '<span class="lc-badge lc-badge-hard">' + solved.hard + ' Hard</span>';
      }

      // Build the heatmap grid
      // Go back ~52 weeks from today, start on Sunday
      var today = new Date();
      today.setHours(0,0,0,0);

      var start = new Date(today);
      start.setDate(start.getDate() - 364);
      // Roll back to Sunday
      start.setDate(start.getDate() - start.getDay());

      var weeks = [];
      var cursor = new Date(start);
      var week = [];
      while (cursor <= today) {
        week.push({ date: new Date(cursor), count: calendar[dateKey(cursor)] || 0 });
        if (week.length === 7) { weeks.push(week); week = []; }
        cursor.setDate(cursor.getDate() + 1);
      }
      if (week.length) weeks.push(week);

      var numWeeks = weeks.length;

      // Build SVG
      var LEFT_PAD = 30;
      var TOP_PAD = 20;
      var svgW = LEFT_PAD + numWeeks * TOTAL + GAP;
      var svgH = TOP_PAD + ROWS * TOTAL + GAP;

      var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + svgW + '" height="' + svgH + '" ' +
        'viewBox="0 0 ' + svgW + ' ' + svgH + '" preserveAspectRatio="xMidYMid meet" ' +
        'style="width:100%;height:auto;display:block;">';

      // Day labels (Mon, Wed, Fri)
      var dayLabels = [1, 3, 5]; // Mon, Wed, Fri
      for (var di = 0; di < dayLabels.length; di++) {
        var dIdx = dayLabels[di];
        var dy = TOP_PAD + dIdx * TOTAL + CELL / 2 + 4;
        svg += '<text x="0" y="' + dy + '" fill="rgba(184,174,201,0.7)" font-size="10" font-family="\'Instrument Sans\', sans-serif">' + DAYS[dIdx].charAt(0) + '</text>';
      }

      // Month labels
      var lastMonth = -1;
      for (var wi = 0; wi < weeks.length; wi++) {
        var firstDay = weeks[wi][0];
        if (firstDay && firstDay.date.getMonth() !== lastMonth) {
          lastMonth = firstDay.date.getMonth();
          var mx = LEFT_PAD + wi * TOTAL;
          svg += '<text x="' + mx + '" y="12" fill="rgba(184,174,201,0.7)" font-size="10" font-family="\'Instrument Sans\', sans-serif">' + MONTHS[lastMonth] + '</text>';
        }
      }

      // Cells
      for (var wi2 = 0; wi2 < weeks.length; wi2++) {
        for (var di2 = 0; di2 < weeks[wi2].length; di2++) {
          var cell = weeks[wi2][di2];
          var cx = LEFT_PAD + wi2 * TOTAL;
          var cy = TOP_PAD + di2 * TOTAL;
          var lv = getLevel(cell.count);
          var color = LEVELS[lv];
          var isFuture = cell.date > today;
          if (isFuture) color = 'rgba(255,255,255,0.02)';

          svg += '<rect x="' + cx + '" y="' + cy + '" width="' + CELL + '" height="' + CELL + '" ' +
            'rx="2" ry="2" fill="' + color + '" ' +
            'data-date="' + dateKey(cell.date) + '" data-count="' + cell.count + '" ' +
            'class="lc-cell"' +
            '><title>' + cell.count + ' submission' + (cell.count !== 1 ? 's' : '') + ' on ' + dateKey(cell.date) + '</title></rect>';
        }
      }


      svg += '</svg>';

      container.innerHTML = svg;

      // Custom tooltip on hover (beyond native <title>)
      var tooltip = document.createElement('div');
      tooltip.className = 'lc-tooltip';
      tooltip.style.cssText = 'position:fixed;pointer-events:none;opacity:0;z-index:100;background:rgba(18,16,23,0.95);color:#f4f0fa;border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:6px 12px;font-size:13px;font-weight:500;white-space:nowrap;transition:opacity 0.12s ease;backdrop-filter:blur(8px);box-shadow:0 8px 24px rgba(0,0,0,0.5);';
      document.body.appendChild(tooltip);

      var cells = container.querySelectorAll('.lc-cell');
      cells.forEach(function(cell) {
        cell.addEventListener('mouseenter', function(e) {
          var count = parseInt(cell.getAttribute('data-count'));
          var date = cell.getAttribute('data-date');
          var d = new Date(date + 'T00:00:00');
          var formatted = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
          tooltip.textContent = count + ' submission' + (count !== 1 ? 's' : '') + ' on ' + formatted;
          tooltip.style.opacity = '1';
        });
        cell.addEventListener('mousemove', function(e) {
          tooltip.style.left = (e.clientX + 12) + 'px';
          tooltip.style.top = (e.clientY - 36) + 'px';
        });
        cell.addEventListener('mouseleave', function() {
          tooltip.style.opacity = '0';
        });
      });
    })
    .catch(function(err) {
      container.innerHTML = '<span style="color: var(--fg-soft); font-size: 14px;">LeetCode heatmap unavailable</span>';
    });
})();
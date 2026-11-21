// Admin dashboard: period selector, KPIs, sales chart (SVG), previous-year comparison, mobile menu.
// All numbers are fictional demo data.
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const yen = (n) => `¥${n.toLocaleString('ja-JP')}`;

  // ---- Demo data ----
  // Chart values are stored as fractions (0-1) of the y-axis maximum.
  const fractions = (heights, max) => heights.map((h) => h / max);

  const daily30 = fractions([140, 173, 181, 158, 122, 138, 147, 141, 174, 181, 157, 121, 138, 147, 141, 174, 181, 157, 120, 138, 148, 159, 191, 197, 173, 137, 155, 165, 160, 191], 292);
  const daily30Prev = fractions([45, 17.9, 32.6, 58.2, 72.9, 45.4, 43.2, 65.2, 46.1, 22, 27.5, 67.7, 69.6, 63.4, 51.3, 12.8, 21.2, 57.9, 81.3, 51.3, 36.6, 42.5, 34.8, 20.9, 18.7, 48, 49.4, 53.5, 46.1, 0].map((v) => 168 - v), 292);
  const daily7 = fractions([197, 173, 137, 155, 165, 160, 191], 292);
  const daily7Prev = fractions([150, 140, 155, 120, 170, 125, 160], 292);
  const hourly = fractions([300, 150, 100, 50, 0, 100, 300, 900, 1800, 2600, 3200, 3600, 4100, 3800, 3200, 3000, 3400, 3800, 4600, 5200, 4400, 3000, 1500, 600], 8000);
  const hourlyPrev = fractions([200, 100, 80, 40, 0, 120, 260, 700, 1500, 2200, 2900, 3300, 3700, 3500, 3000, 2700, 3100, 3500, 4100, 4700, 4000, 2600, 1300, 500], 8000);
  const monthly = fractions([980, 1050, 1120, 960, 1080, 1210, 1180, 1250, 1160, 1300, 1410, 1285], 1600);
  const monthlyPrev = fractions([860, 930, 990, 880, 960, 1070, 1040, 1110, 1030, 1150, 1240, 1140], 1600);

  const dayLabels = (month, day, count) => {
    const date = new Date(2026, month - 1, day);
    return Array.from({ length: count }, () => {
      const label = `${date.getMonth() + 1}/${date.getDate()}`;
      date.setDate(date.getDate() + 1);
      return label;
    });
  };
  const monthLabels = ['2025/12', '2026/1', '2026/2', '2026/3', '2026/4', '2026/5', '2026/6', '2026/7', '2026/8', '2026/9', '2026/10', '2026/11'];
  const hourLabels = Array.from({ length: 24 }, (_, h) => `${h}時`);
  const manYen = (v) => (v === 0 ? '¥0' : `¥${v / 10000}万`);

  // `ticks` = which x-axis labels are shown. `delta` = [text, 'up' | 'down'] for sales, orders, average order value.
  const PERIODS = {
    d1: {
      label: '昨日', range: '2026/11/19', prevRange: '2025/11/19', compareWith: '前日と比べて', unit: '1時間ごとの売上（税込）',
      kpi: ['¥53,700', '6件', '¥8,950'], delta: [['▲ 4.4%', 'up'], ['▼ 14.3%', 'down'], ['▲ 21.8%', 'up']],
      now: hourly, prev: hourlyPrev, labels: hourLabels, ticks: [0, 6, 12, 18], max: 8000, formatY: yen,
    },
    d7: {
      label: '過去7日', range: '2026/11/13〜11/19', prevRange: '2025/11/13〜11/19', compareWith: '前の7日と比べて', unit: '1日ごとの売上（税込）',
      kpi: ['¥321,500', '36件', '¥8,931'], delta: [['▲ 7.7%', 'up'], ['▲ 9.1%', 'up'], ['▼ 1.3%', 'down']],
      now: daily7, prev: daily7Prev, labels: dayLabels(11, 13, 7), ticks: [0, 1, 2, 3, 4, 5, 6], max: 80000, formatY: yen,
    },
    d30: {
      label: '過去30日', range: '2026/10/21〜11/19', prevRange: '2025/10/21〜11/19', compareWith: '前の30日と比べて', unit: '1日ごとの売上（税込）',
      kpi: ['¥1,284,600', '142件', '¥9,046'], delta: [['▲ 8.2%', 'up'], ['▲ 5.2%', 'up'], ['▲ 2.9%', 'up']],
      now: daily30, prev: daily30Prev, labels: dayLabels(10, 21, 30), ticks: [0, 7, 14, 21, 28], max: 80000, formatY: yen,
    },
    m12: {
      label: '過去12か月', range: '2025/12〜2026/11', prevRange: '2024/12〜2025/11', compareWith: '前の12か月と比べて', unit: '1か月ごとの売上（税込）',
      kpi: ['¥13,985,000', '1,540件', '¥9,081'], delta: [['▲ 12.4%', 'up'], ['▲ 8.9%', 'up'], ['▲ 3.2%', 'up']],
      now: monthly, prev: monthlyPrev, labels: monthLabels, ticks: [0, 3, 6, 9, 11], max: 1600000, formatY: manYen,
    },
  };
  const PERIOD_ORDER = ['d1', 'd7', 'd30', 'm12'];
  const state = { key: 'd30', compare: false };

  // ---- Chart (SVG, drawn at the current width so bars stay crisp) ----
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const svgEl = (name, attrs = {}) => {
    const node = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  };

  const renderChart = () => {
    const period = PERIODS[state.key];
    const plot = $('plot');
    const width = plot.clientWidth;
    const height = plot.clientHeight;
    if (!width) return;

    const axisY = height - 1;
    const count = period.now.length;
    const step = width / count;
    const barWidth = Math.min(48, Math.round(step * 0.58));
    const centerX = (i) => (i + 0.5) * step;

    const svg = svgEl('svg', { width, height, viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': `売上の推移（${period.label}）` });

    // Grid lines (the bottom one is the axis)
    for (let i = 0; i < 5; i++) {
      const y = Math.round((axisY * i) / 4);
      svg.append(svgEl('rect', { x: 0, y: Math.min(y, axisY), width, height: 1, fill: '#252a26', 'fill-opacity': i === 4 ? 0.3 : 0.1 }));
    }

    // Bars (hover shows the date and amount)
    period.now.forEach((fraction, i) => {
      const barHeight = Math.round(fraction * axisY);
      const bar = svgEl('rect', { x: Math.round(centerX(i) - barWidth / 2), y: axisY - barHeight, width: barWidth, height: barHeight, fill: '#46513d' });
      const tip = svgEl('title');
      tip.textContent = `${period.labels[i]}　${yen(Math.round(fraction * period.max))}`;
      bar.append(tip);
      svg.append(bar);
    });

    // Previous-year line: a white outline under a dashed grey line
    if (state.compare) {
      const d = 'M ' + period.prev.map((f, i) => `${centerX(i).toFixed(1)} ${(axisY - f * axisY).toFixed(1)}`).join(' L ');
      const line = { d, fill: 'none', 'stroke-dasharray': '6 4', 'stroke-linejoin': 'round' };
      svg.append(svgEl('path', { ...line, stroke: '#fff', 'stroke-width': 4.5 }));
      svg.append(svgEl('path', { ...line, stroke: '#5b5f58', 'stroke-width': 2 }));
    }
    plot.replaceChildren(svg);

    // Y axis labels: centered on the grid lines, kept inside the plot at both ends
    const yAxis = $('yaxis');
    yAxis.replaceChildren(...Array.from({ length: 5 }, (_, i) => {
      const label = document.createElement('span');
      label.textContent = period.formatY((period.max * i) / 4);
      const lineY = Math.round((axisY * (4 - i)) / 4);
      label.style.top = `${Math.max(0, Math.min(lineY - 8, height - 15))}px`;
      return label;
    }));

    // X axis labels: centered under their bar, kept inside the plot
    const xAxis = $('xaxis');
    xAxis.replaceChildren();
    period.ticks.forEach((index) => {
      const label = document.createElement('span');
      label.textContent = period.labels[index];
      xAxis.append(label);
      const w = label.offsetWidth;
      label.style.left = `${Math.max(0, Math.min(width - w, centerX(index) - w / 2))}px`;
    });
  };

  // ---- Period menu ----
  const menu = $('period-menu');
  const menuButton = $('period-btn');

  const renderMenu = () => {
    const options = PERIOD_ORDER.map((key) => {
      const { label, range } = PERIODS[key];
      const selected = key === state.key;
      const option = document.createElement('button');
      option.type = 'button';
      option.className = `opt${selected ? ' is-on' : ''}`;
      option.dataset.key = key;
      option.setAttribute('role', 'menuitemradio');
      option.setAttribute('aria-checked', String(selected));
      option.innerHTML = `<span class="opt__left"><i>${selected ? '✓' : ''}</i><span>${label}</span></span><span class="opt__range">${range}</span>`;
      return option;
    });

    const separator = document.createElement('div');
    separator.className = 'period__sep';

    // Custom ranges are not part of the demo
    const custom = document.createElement('button');
    custom.type = 'button';
    custom.className = 'opt';
    custom.title = 'デモでは未対応です';
    custom.setAttribute('aria-disabled', 'true');
    custom.innerHTML = '<span class="opt__left"><i></i><span>期間を指定</span></span><span class="opt__range">開始日と終了日を選ぶ</span>';

    menu.replaceChildren(...options, separator, custom);
  };

  const setMenuOpen = (open) => {
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
  };

  menuButton.addEventListener('click', (e) => {
    e.stopPropagation();
    setMenuOpen(menu.hidden);
  });
  menu.addEventListener('click', (e) => {
    const key = e.target.closest('.opt')?.dataset.key;
    if (!key) return;
    const changed = key !== state.key;
    state.key = key;
    setMenuOpen(false);
    renderAll();
    if (changed) fadeIn();
  });
  document.addEventListener('click', (e) => {
    if (!menu.hidden && !e.target.closest('#period')) setMenuOpen(false);
  });

  // Fade the numbers and the chart in when the period changes
  const FADE_TARGETS = '.kpi__value, .delta, #chart-sub, #plot, #yaxis, #xaxis';
  const fadeIn = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll(FADE_TARGETS).forEach((el) => {
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, easing: 'ease-out' });
    });
  };

  // ---- Render everything for the current state ----
  const renderAll = () => {
    const period = PERIODS[state.key];
    $('period-label').textContent = period.label;
    $('period-range').textContent = period.range;
    document.querySelectorAll('[data-kpi]').forEach((el) => { el.textContent = period.kpi[Number(el.dataset.kpi)]; });
    document.querySelectorAll('[data-delta]').forEach((el) => {
      const [text, direction] = period.delta[Number(el.dataset.delta)];
      el.textContent = text;
      el.className = direction;
    });
    document.querySelectorAll('.delta__label').forEach((el) => { el.textContent = period.compareWith; });
    $('chart-sub').textContent = period.unit;
    $('legend').classList.toggle('is-open', state.compare);
    $('legend').setAttribute('aria-hidden', String(!state.compare));
    $('legend-now').textContent = `選択期間（${period.range}）`;
    $('legend-prev').textContent = `前年同期（${period.prevRange}）`;
    $('compare').setAttribute('aria-checked', String(state.compare));
    renderMenu();
    renderChart();
  };

  $('compare').addEventListener('click', () => {
    state.compare = !state.compare;
    renderAll();
  });

  // ---- Mobile menu ----
  const spMenu = $('spmenu');
  const openButton = $('menu-open');

  const openNav = () => {
    spMenu.hidden = false;
    openButton.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const closeNav = () => {
    if (spMenu.hidden) return;
    spMenu.hidden = true;
    openButton.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  openButton.addEventListener('click', openNav);
  $('menu-close').addEventListener('click', closeNav);
  window.matchMedia('(min-width: 900px)').addEventListener('change', (m) => { if (m.matches) closeNav(); });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    setMenuOpen(false);
    closeNav();
  });

  // Redraw when the chart width changes (window resize, sidebar layout switch)
  new ResizeObserver(renderChart).observe($('plot'));
  renderAll();
  document.fonts?.ready.then(renderChart);
})();

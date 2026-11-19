// Widgets of the outreach talk on superconductivity. All of them are cartoons (no data),
// except 'tc', which plots the record critical temperatures of each family.
//
//   rt          resistance of mercury against temperature (1911)
//   rings       a metal ring with a battery (collisions, heat) and a superconducting one without
//   meissner    field lines through a sample, expelled below Tc (buttons + steps)
//   scatter     electrons crossing a vibrating lattice: collisions heat the metal (cold, then hot)
//   glue        an electron leaves a positive wake that attracts another; the pair travels
//   dance       normal metal (each on its own) vs superconductor (one choreography)
//   tc          the race for the critical temperature, 1911–2019
//   vortex      type II: field lines through pinned vortices hold the magnet in place

// ---------------------------------------------------------------------------- helpers
const SC = {
  // requestAnimationFrame loop with start/stop; f(dt in s, t in s)
  loop(f) {
    let id = null, last = 0, t = 0;
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now; t += dt;
      f(dt, t);
      id = requestAnimationFrame(tick);
    };
    return {
      start() { if (id === null) { last = performance.now(); id = requestAnimationFrame(tick); } },
      stop() { if (id !== null) cancelAnimationFrame(id); id = null; },
    };
  },
  printing: () => (window.Reveal && Reveal.isPrintView && Reveal.isPrintView()) || /print-pdf/i.test(location.search),
  // HiDPI canvas covering a box
  canvas(parent, x, y, w, h) {
    const c = document.createElement('canvas');
    const r = 2;
    c.width = w * r; c.height = h * r;
    Object.assign(c.style, { position: 'absolute', left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
    parent.appendChild(c);
    const ctx = c.getContext('2d');
    ctx.scale(r, r);
    return ctx;
  },
  // text label (HTML) inside a widget
  text(parent, x, y, html, { ax = 0, ay = 0, cls = '', color, size, weight } = {}) {
    const d = document.createElement('div');
    d.className = 'sc-text ' + cls;
    d.innerHTML = html;
    Object.assign(d.style, { left: x + 'px', top: y + 'px', transform: `translate(${-100 * ax}%, ${-100 * ay}%)` });
    if (color) d.style.color = color;
    if (size) d.style.fontSize = size + 'px';
    if (weight) d.style.fontWeight = weight;
    parent.appendChild(d);
    return d;
  },
  ion(ctx, x, y, r, C, fill) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fillStyle = fill || C.navy; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = r * 0.2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - r * 0.45, y); ctx.lineTo(x + r * 0.45, y);
    ctx.moveTo(x, y - r * 0.45); ctx.lineTo(x, y + r * 0.45); ctx.stroke();
  },
  electron(ctx, x, y, r, C, minus = true) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fillStyle = C.red; ctx.fill();
    if (minus) {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x - r * 0.45, y); ctx.lineTo(x + r * 0.45, y); ctx.stroke();
    }
  },
  rng(seed) {   // small deterministic PRNG, so the cartoons look the same every time
    let s = seed >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  },
};

// ---------------------------------------------------------------------------- rt
// Steps: 0 = what was expected (dashed), 1 = what Onnes measured (drop to zero at Tc)
QM.register('rt', (el, opts) => {
  const C = QM.c;
  const W = +opts.w || 820, H = +opts.h || 520;
  const P = QM.panel(el, { x: 0, y: 0, w: W, h: H, m: { l: 70, r: 30, t: 24, b: 96 } });
  const X = d3.scaleLinear([0, 8], [0, P.iw]);
  const Y = d3.scaleLinear([0, 1.12], [P.ih, 0]);
  QM.axis(P, 'bottom', X, { ticks: [0, 2, 4, 6, 8] });
  QM.axis(P, 'left', Y, { ticks: [], labels: false, tickSize: 0 });
  P.label(P.iw / 2, P.ih + 58, 'Temperatura (K) &nbsp;<span class="sc-muted">· 0 K = −273 °C</span>', { math: false, cls: 'text sc-axis' });
  P.label(-30, P.ih / 2, 'Resistencia', { math: false, cls: 'text sc-axis' }).style.transform = 'translate(-50%,-50%) rotate(-90deg)';

  const Tc = 4.2, R = (T) => 0.12 + 0.11 * T;
  const line = d3.line().x((d) => X(d[0])).y((d) => Y(d[1]));
  P.g.append('path').attr('d', line([[8, R(8)], [0, R(0)]]))
    .attr('fill', 'none').attr('stroke', C.faint).attr('stroke-width', 3).attr('stroke-dasharray', '10 8');
  const exp = P.label(X(0.2), Y(0.5), 'Lo que se esperaba', { math: false, cls: 'text', ax: 0, ay: 1, color: C.muted });

  const meas = P.g.append('path')
    .attr('d', line([[8, R(8)], [Tc, R(Tc)], [Tc, 0], [0, 0]]))
    .attr('fill', 'none').attr('stroke', C.red).attr('stroke-width', 5)
    .attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round');
  const len = meas.node().getTotalLength ? meas.node().getTotalLength() : 2000;
  meas.attr('stroke-dasharray', `${len} ${len}`);
  const dot = P.g.append('circle').attr('cx', X(Tc)).attr('cy', Y(R(Tc))).attr('r', 7).attr('fill', C.red);
  const labs = [
    P.label(X(6.2), Y(0.52), 'Lo que midió Onnes', { math: false, cls: 'text', ax: 0.5, ay: 0.5, color: C.red }),
    P.label(X(1.6), Y(0) - 14, 'R = 0', { math: false, cls: 'big sc-bold', ax: 0.5, ay: 1, color: C.red }),
    P.label(X(Tc) + 16, Y(0.2), 'Temperatura crítica<br><b>T<sub>c</sub> = 4,2 K</b> (−269 °C)', { math: false, cls: 'text', ax: 0, ay: 0.5, color: C.ink }),
  ];
  let stop = null;
  const show = (k, animate) => {
    if (stop) stop();
    const on = k >= 1;
    labs.forEach((l) => { l.classList.add('qm-fade'); l.style.opacity = on ? 1 : 0; });
    dot.attr('opacity', on ? 1 : 0);
    exp.style.opacity = 1;
    if (!animate) { meas.attr('stroke-dashoffset', on ? 0 : len); return; }
    const a = +meas.attr('stroke-dashoffset'), b = on ? 0 : len;
    stop = QM.tween(900, (t) => meas.attr('stroke-dashoffset', QM.lerp(a, b, t)), null, (t) => t);
  };
  return { go: show, leave() { if (stop) stop(); } };
});

// ---------------------------------------------------------------------------- rings
// Two rings side by side. Left: a normal metal with a battery; electrons go round in fits
// and starts, colliding (orange flashes: heat). Right (from step opts.b on): a
// superconductor with no battery; pairs go round smoothly, for ever.
QM.register('rings', (el, opts) => {
  const C = QM.c;
  const W = +opts.w || 640, H = +opts.h || 330, showB = +(opts.b || 1);
  const R = 118, band = 32, cy = 142;
  const mk = (x) => {
    const b = QM.box(el, x, 0, W / 2, H);
    b.classList.add('qm-fade');
    return { box: b, ctx: SC.canvas(b, 0, 0, W / 2, H), cx: W / 4 };
  };
  const A = mk(0), B = mk(W / 2);
  const cap = (P, html) => SC.text(P.box, P.cx, cy + R + band / 2 + 22, html, { ax: 0.5, ay: 0, cls: 'sc-cap' });
  cap(A, '<b>Metal, con pila</b><br>choca y se calienta');
  cap(B, '<b>Superconductor, sin pila</b><br>gira sin pérdidas');
  const rnd = SC.rng(11);
  const gapA = 0.42;                                     // half-angle taken by the battery
  const bat = Math.PI / 2;                               // battery at the bottom
  const elsA = d3.range(10).map((k) => ({ th: (2 * Math.PI * k) / 10 + 0.2 * rnd(), v: 0.8 }));
  const sparks = [];
  const ringPath = (ctx, cx, a0, a1, color, edge) => {
    ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.arc(cx, cy, R, a0, a1); ctx.strokeStyle = color; ctx.lineWidth = band; ctx.stroke();
    ctx.strokeStyle = edge; ctx.lineWidth = 2;
    for (const r of [R + band / 2, R - band / 2]) { ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1); ctx.stroke(); }
  };
  const arrow = (ctx, cx, a0, a1, color) => {           // current direction, inside the ring
    const r = R - band * 1.2;
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1, true); ctx.stroke();
    const ex = cx + r * Math.cos(a1), ey = cy + r * Math.sin(a1);
    const tx = Math.sin(a1), ty = -Math.cos(a1);         // tangent, counterclockwise
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 11 * tx + 6 * Math.cos(a1), ey - 11 * ty + 6 * Math.sin(a1));
    ctx.moveTo(ex, ey); ctx.lineTo(ex - 11 * tx - 6 * Math.cos(a1), ey - 11 * ty - 6 * Math.sin(a1)); ctx.stroke();
  };
  const drawA = (dt) => {
    const { ctx, cx } = A;
    ctx.clearRect(0, 0, W / 2, H);
    ringPath(ctx, cx, bat + gapA, bat - gapA + 2 * Math.PI, '#ECE7E4', C.ink_2);
    for (const e of elsA) {
      e.v += (0.8 - e.v) * 2.5 * dt;                   // the battery pushes them on
      if (rnd() < 0.5 * dt) {                          // a collision: it bounces and heats the metal
        e.v = -0.25;
        sparks.push({ th: e.th, age: 0 });
      }
      e.th -= e.v * dt;
    }
    for (const sp of sparks) sp.age += dt;
    while (sparks.length && sparks[0].age > 0.6) sparks.shift();
    for (const sp of sparks) {
      const k = sp.age / 0.6;
      ctx.beginPath(); ctx.arc(cx + R * Math.cos(sp.th), cy + R * Math.sin(sp.th), 5 + 18 * k, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(217,130,43,${0.6 * (1 - k)})`; ctx.fill();
    }
    for (const e of elsA) SC.electron(ctx, cx + R * Math.cos(e.th), cy + R * Math.sin(e.th), 8, C, false);
    // the battery
    const bw = 2 * R * Math.sin(gapA) + 6, bh = 40, by = cy + R;
    ctx.fillStyle = C.ink_2; ctx.fillRect(cx - bw / 2, by - bh / 2, bw, bh);
    ctx.fillRect(cx + bw / 2, by - 8, 7, 16);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx + bw / 2 - 26, by); ctx.lineTo(cx + bw / 2 - 12, by);
    ctx.moveTo(cx + bw / 2 - 19, by - 7); ctx.lineTo(cx + bw / 2 - 19, by + 7);
    ctx.moveTo(cx - bw / 2 + 12, by); ctx.lineTo(cx - bw / 2 + 26, by); ctx.stroke();
    arrow(ctx, cx, -0.6, -2.2, C.red);
  };
  const drawB = (t) => {
    const { ctx, cx } = B;
    ctx.clearRect(0, 0, W / 2, H);
    ringPath(ctx, cx, 0, 2 * Math.PI, C.navy_tint, C.navy);
    const N = 8, ph = 2.4 * t;
    for (let i = 0; i < N; i++) {
      const th = -0.8 * t + (2 * Math.PI * i) / N;
      for (const sg of [-1, 1]) {
        const a = th + sg * 0.08 * Math.cos(ph), rr = R + sg * 0.28 * band * Math.sin(ph);
        SC.electron(ctx, cx + rr * Math.cos(a), cy + rr * Math.sin(a), 8, C, false);
      }
    }
    arrow(ctx, cx, -0.6, -2.2, C.red);
  };
  const L = SC.loop((dt, t) => { drawA(dt); drawB(t); });
  for (let k = 0; k < 40; k++) drawA(1 / 60);
  drawB(0.5);
  return {
    go(step) { B.box.style.opacity = step >= showB ? 1 : 0; },
    enter() { if (!SC.printing()) L.start(); },
    leave() { L.stop(); },
  };
});

// ---------------------------------------------------------------------------- meissner
// Field lines of a uniform field around a long cylinder (2D cartoon of a sample).
// Steps: up to opts.cold − 1 = hot (lines go through), from opts.cold on = cold (expelled).
QM.register('meissner', (el, opts) => {
  const C = QM.c;
  const W = +opts.w || 640, H = +opts.h || 320;
  const coldAt = +(opts.cold || 1);
  const top = 50;                                   // room for the buttons
  const svg = d3.select(el).append('svg').attr('class', 'qm-svg').attr('width', W).attr('height', H)
    .style('top', '0px');
  const u = 78;                                     // px per unit
  const cx = W / 2, cy = top + (H - top) / 2, a = 1.12;
  const ymax = (H - top) / 2 / u;
  const x0s = [-3.6, -2.95, -2.3, -1.7, -1.15, -0.62, 0.62, 1.15, 1.7, 2.3, 2.95, 3.6];   // none at the centre: room for the label
  const ys = d3.range(-ymax, ymax + 1e-9, (2 * ymax) / 120);
  // streamline of B around a perfect diamagnet (cylinder of radius a): x (1 − a²/r²) = x0
  const bent = (x0, y) => {
    const s = Math.sign(x0) || 1, X0 = Math.abs(x0);
    let lo = Math.sqrt(Math.max(a * a - y * y, 0)) + 1e-9, hi = X0 + 3;
    for (let k = 0; k < 60; k++) {
      const m = (lo + hi) / 2;
      const f = m * (1 - (a * a) / (m * m + y * y));
      if (f < X0) lo = m; else hi = m;
    }
    return s * (lo + hi) / 2;
  };
  const paths = x0s.map((x0) => ({ x0, b: ys.map((y) => bent(x0, y)) }));
  const g = svg.append('g');
  const clip = 'mc' + Math.random().toString(36).slice(2);
  svg.append('defs').append('clipPath').attr('id', clip).append('rect').attr('x', 0).attr('y', top).attr('width', W).attr('height', H - top);
  g.attr('clip-path', `url(#${clip})`);
  const disc = g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', a * u).attr('stroke-width', 2.5);
  const lines = g.selectAll('path.fl').data(paths).join('path').attr('class', 'fl')
    .attr('fill', 'none').attr('stroke', C.navy).attr('stroke-width', 2.4).attr('stroke-linecap', 'round');
  // arrows (direction of B) on each line
  const arrows = g.selectAll('path.ar').data(paths).join('path').attr('class', 'ar').attr('fill', C.navy);
  const name = SC.text(el, cx, cy, '', { ax: 0.5, ay: 0.5, cls: 'sc-small sc-bold' });
  name.style.textAlign = 'center';
  let t = 0;
  const draw = (tt) => {
    t = tt;
    const hot = d3.interpolateRgb(C.ins, C.navy_tint)(t);
    disc.attr('fill', hot).attr('stroke', d3.interpolateRgb(C.muted, C.navy)(t));
    lines.attr('d', (p) => d3.line()(ys.map((y, i) => [cx + u * QM.lerp(p.x0, p.b[i], t), cy - u * y])))
      .attr('opacity', (p) => (Math.abs(p.x0) < a && t < 0.5 ? 0.85 : 1));
    arrows.attr('d', (p) => {
      const i = Math.round(ys.length * 0.86);
      const x = cx + u * QM.lerp(p.x0, p.b[i], t), y = cy - u * ys[i];
      return `M${x - 7},${y + 6} L${x},${y - 8} L${x + 7},${y + 6} z`;
    });
    name.innerHTML = t < 0.5 ? 'normal' : 'super-<br>conductor';
    name.style.color = t < 0.5 ? C.ink_2 : C.navy;
  };
  let stop = null, state = 0;
  const to = (s, animate) => {
    if (stop) stop();
    state = s;
    btn.set(s);
    if (!animate) { draw(s); return; }
    const t0 = t;
    stop = QM.tween(800, (k) => draw(QM.lerp(t0, s, k)));
  };
  const btn = QM.buttons(el, {
    x: 0, y: 0, active: 0,
    items: [{ html: 'Caliente: T &gt; T<sub>c</sub>' }, { html: 'Frío: T &lt; T<sub>c</sub>' }],
    onpick: (i) => to(i, true),
  });
  btn.el.style.left = '50%'; btn.el.style.transform = 'translateX(-50%)';
  draw(0);
  return { go(step, animate) { to(step >= coldAt ? 1 : 0, animate); }, leave() { if (stop) stop(); } };
});

// ---------------------------------------------------------------------------- scatter
// Electrons drift to the right through a lattice whose ions vibrate with temperature.
// Each collision leaves a small flash: energy lost as heat (Joule).
QM.register('scatter', (el, opts) => {
  const C = QM.c;
  const W = +opts.w || 780, H = +opts.h || 430;
  const box = QM.box(el, 0, 0, W, H);
  box.classList.add('sc-frame');
  const ctx = SC.canvas(box, 0, 0, W, H);
  const rnd = SC.rng(7);
  const nx = 8, ny = 4, dx = W / nx, dy = H / ny, Ri = 17;
  const ions = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    ions.push({ x: dx * (i + 0.5), y: dy * (j + 0.5), p1: rnd() * 6.3, p2: rnd() * 6.3, w1: 9 + 4 * rnd(), w2: 9 + 4 * rnd(), imp: false });
  }
  ions[nx * 1 + 5].imp = true;           // an impurity (a foreign atom)
  ions[nx * 2 + 2].imp = true;
  const Ne = 12, v = 150;
  const els = d3.range(Ne).map(() => {
    const a = (rnd() - 0.5) * 1.2;
    return { x: rnd() * W, y: rnd() * H, vx: v * Math.cos(a), vy: v * Math.sin(a) };
  });
  const sparks = [];
  let temp = 0.1;
  const pos = (o, t) => {
    const A = o.imp ? 0 : 2 + 9 * temp;
    return [o.x + A * Math.sin(o.w1 * t + o.p1), o.y + A * Math.sin(o.w2 * t + o.p2)];
  };
  const step = (dt, t) => {
    for (const e of els) {
      e.vx += 60 * dt;                                    // the battery pushes them to the right
      const s = Math.hypot(e.vx, e.vy); e.vx *= v / s; e.vy *= v / s;
      e.x += e.vx * dt; e.y += e.vy * dt;
      if (e.y < 8) { e.y = 8; e.vy = Math.abs(e.vy); }
      if (e.y > H - 8) { e.y = H - 8; e.vy = -Math.abs(e.vy); }
      if (e.x > W + 10) { e.x = -10; e.y = 10 + rnd() * (H - 20); }
      if (e.x < -12) e.x = -10;
      for (const o of ions) {
        const [ox, oy] = pos(o, t);
        const rr = (o.imp ? Ri + 6 : Ri + 2 + 8 * temp) + 7;
        const ddx = e.x - ox, ddy = e.y - oy, d = Math.hypot(ddx, ddy);
        if (d < rr) {
          const nx_ = ddx / d, ny_ = ddy / d;
          const dot = e.vx * nx_ + e.vy * ny_;
          if (dot < 0) {
            e.vx -= 2 * dot * nx_; e.vy -= 2 * dot * ny_;
            const a = (rnd() - 0.5) * 1.6, c = Math.cos(a), sn = Math.sin(a);
            [e.vx, e.vy] = [e.vx * c - e.vy * sn, e.vx * sn + e.vy * c];
            sparks.push({ x: ox + nx_ * rr * 0.8, y: oy + ny_ * rr * 0.8, age: 0 });
          }
          e.x = ox + nx_ * rr; e.y = oy + ny_ * rr;
        }
      }
    }
    for (const s of sparks) s.age += dt;
    while (sparks.length && sparks[0].age > 0.6) sparks.shift();
  };
  const draw = (t) => {
    ctx.clearRect(0, 0, W, H);
    for (const s of sparks) {
      const k = s.age / 0.6;
      ctx.beginPath(); ctx.arc(s.x, s.y, 6 + 22 * k, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(217,130,43,${0.55 * (1 - k)})`; ctx.fill();
    }
    for (const o of ions) {
      const [x, y] = pos(o, t);
      if (o.imp) {
        ctx.beginPath(); ctx.arc(x, y, Ri + 5, 0, 2 * Math.PI); ctx.fillStyle = C.ink_2; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x - 7, y - 7); ctx.lineTo(x + 7, y + 7); ctx.moveTo(x + 7, y - 7); ctx.lineTo(x - 7, y + 7); ctx.stroke();
      } else SC.ion(ctx, x, y, Ri, C);
    }
    for (const e of els) SC.electron(ctx, e.x, e.y, 9, C);
  };
  const L = SC.loop((dt, t) => { step(dt, t); draw(t); });
  for (let k = 0; k < 90; k++) step(1 / 60, k / 60);
  draw(1.5);
  const names = ['baja', 'media', 'alta'];
  let stop = null;
  const slider = QM.slider(el, {
    x: W / 2 - 230, y: H + 18, w: 460, min: 0, max: 1, step: 0.01, value: temp, tex: '\\text{Temperatura}',
    fmt: (x) => names[Math.min(2, Math.floor(x * 3))],
    oninput: (x) => { if (stop) stop(); temp = x; draw(1.5); },
  });
  slider.el.querySelector('.qm-slider-label').textContent = 'Temperatura';
  // step 0: cold metal; from step 1 on: hot (the slider moves by itself, and stays live)
  const temps = [0.1, 0.93];
  return {
    go(step, animate) {
      const T = temps[QM.clamp(step, 0, 1)];
      if (stop) stop();
      if (!animate) { temp = T; slider.set(T); draw(1.5); return; }
      const T0 = temp;
      stop = QM.tween(900, (k) => { temp = QM.lerp(T0, T, k); slider.set(temp); });
    },
    enter() { if (!SC.printing()) L.start(); },
    leave() { L.stop(); if (stop) stop(); },
  };
});

// ---------------------------------------------------------------------------- glue
// Steps: 0 = an electron enters, 1 = it attracts the ions next to it, 2 = it moves on and
// leaves a positive wake, 3 = a second electron is pulled into the wake, 4 = the two travel
// together as a Cooper pair (looped). The lattice is periodic, so the pair can wrap round.
QM.register('glue', (el, opts) => {
  const C = QM.c;
  const W = +opts.w || 1440, H = +opts.h || 330;
  const box = QM.box(el, 0, 0, W, H);
  box.classList.add('sc-frame');
  const ctx = SC.canvas(box, 0, 0, W, H);
  const yc = H / 2, gap = 0.32 * H, n = 12, sp = W / n, Ri = 22, Re = 24, D = 0.11 * H;
  const ions = [];
  for (let i = 0; i < n; i++) for (const s of [-1, 1]) ions.push({ x: sp * (i + 0.5), s });
  const mod = (x) => ((x % W) + W) % W;
  // displacement of an ion at distance s behind the electron (periodic): slow to react,
  // slow to relax
  let wrap = false;                                      // periodic only while the pair loops
  const wake = (x) => {
    const s = wrap ? mod(e1 - x) : e1 - x;
    if (s <= 0) return 0;
    return Math.min(1, (1 - Math.exp(-s / 80)) * Math.exp(-s / 330) / 0.7);
  };
  let e1 = 0, e2 = -1e4, link = 0, pull = 0, pair = 0;
  const arrowR = (x0, len, w, head) => {
    ctx.beginPath(); ctx.moveTo(x0, yc); ctx.lineTo(x0 + len, yc);
    ctx.moveTo(x0 + len - head, yc - 0.8 * head); ctx.lineTo(x0 + len, yc); ctx.lineTo(x0 + len - head, yc + 0.8 * head);
    ctx.lineWidth = w; ctx.stroke();
  };
  const tagWake = SC.text(box, 0, yc, 'estela de carga +', { ax: 0.5, ay: 0.5, cls: 'sc-tag qm-fade', color: '#fff' });
  tagWake.style.background = C.orange;
  const tagPair = SC.text(box, 0, yc, 'par de Cooper', { ax: 0.5, ay: 0.5, cls: 'sc-tag qm-fade', color: '#fff' });
  tagPair.style.background = C.red;
  let showWake = 0;
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    // wake: positive charge left behind (orange glow)
    const g = ctx.createLinearGradient(0, 0, W, 0);
    for (let k = 0; k <= 160; k++) g.addColorStop(k / 160, `rgba(217,130,43,${0.34 * wake((W * k) / 160)})`);
    ctx.fillStyle = g;
    for (let k = 1; k <= 6; k++) {                       // soft top and bottom edges
      const h = gap * (0.35 + 0.09 * k);
      ctx.globalAlpha = 1 / 3.2;
      ctx.fillRect(0, yc - h, W, 2 * h);
    }
    ctx.globalAlpha = 1;
    // ions
    for (const o of ions) SC.ion(ctx, o.x, yc + o.s * (gap - D * wake(o.x)), Ri, C);
    // everything that moves is drawn at x, x − W and x + W (the canvas clips the copies)
    for (const off of [-W, 0, W]) {
      const x1 = mod(e1) + off, x2 = x1 - (e1 - e2);
      // attraction lines of the first electron (step 1)
      if (link > 0.01) {
        ctx.save(); ctx.globalAlpha = link; ctx.strokeStyle = C.orange; ctx.lineWidth = 2.5; ctx.setLineDash([6, 7]);
        for (const o of ions) {
          if (Math.abs(o.x - x1) > sp * 1.6) continue;
          const y = yc + o.s * (gap - D * wake(o.x));
          ctx.beginPath(); ctx.moveTo(x1, yc); ctx.lineTo(o.x, y - o.s * Ri); ctx.stroke();
        }
        ctx.restore();
      }
      const second = e2 > -5e3;
      // the bond of the pair: a wavy dashed line through the wake (step 4)
      if (pair > 0.01 && second) {
        ctx.save(); ctx.globalAlpha = pair; ctx.strokeStyle = C.red; ctx.lineWidth = 3.5;
        ctx.setLineDash([2, 10]); ctx.lineCap = 'round';
        ctx.beginPath();
        for (let k = 0; k <= 60; k++) {
          const x = x2 + Re + ((x1 - x2 - 2 * Re) * k) / 60;
          const y = yc + 14 * Math.sin((2 * Math.PI * 1.5 * k) / 60);
          if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        }
        ctx.stroke(); ctx.restore();
      }
      // pull of the second electron towards the wake (step 3)
      if (pull > 0.01 && second) {
        ctx.save(); ctx.globalAlpha = pull; ctx.strokeStyle = C.red; ctx.lineCap = 'round';
        arrowR(x2 + Re + 12, 110, 4, 14); ctx.restore();
      }
      SC.electron(ctx, x1, yc, Re, C);
      ctx.strokeStyle = C.red; ctx.lineCap = 'round';
      arrowR(x1 + Re + 12, 60, 4, 12);
      if (second) SC.electron(ctx, x2, yc, Re, C);
    }
    // labels follow the electrons
    tagWake.style.left = mod(e1) - 250 + 'px';
    tagWake.style.opacity = showWake;
    tagPair.style.left = mod(e1 - (e1 - e2) / 2) + 'px';
    tagPair.style.opacity = pair > 0.75 ? 1 : 0;      // after the wake tag has faded
  };
  const states = [
    { e1: 0.06 * W, e2: -1e4, link: 0, pull: 0, pair: 0 },
    { e1: 0.36 * W, e2: -1e4, link: 1, pull: 0, pair: 0 },
    { e1: 0.68 * W, e2: -1e4, link: 0, pull: 0, pair: 0 },
    { e1: 0.68 * W, e2: 0.2 * W, link: 0, pull: 1, pair: 0 },
    { e1: 0.88 * W, e2: 0.6 * W, link: 0, pull: 0, pair: 1 },
  ];
  // step 4: the pair keeps travelling (looped)
  const L = SC.loop((dt) => { e1 += 150 * dt; e2 += 150 * dt; draw(); });
  let stop = null, cur = 0;
  const go = (step, animate) => {
    const s = QM.clamp(step, 0, 4);
    if (stop) stop();
    L.stop();
    wrap = false;
    showWake = s === 2 || s === 3 ? 1 : 0;
    if (cur === 4 && s !== 4) animate = false;           // leaving the loop: jump
    const B = states[s];
    if (s === 4 && cur === 4) { draw(); }
    const A = { e1, e2, link, pull, pair };
    if (s >= 3 && e2 < -5e3) A.e2 = -Re;                 // the second electron enters from the left
    cur = s;
    const set = (k) => {
      e1 = QM.lerp(A.e1, B.e1, k);
      e2 = B.e2 < -5e3 ? -1e4 : QM.lerp(A.e2, B.e2, k);
      link = QM.lerp(A.link, B.link, k); pull = QM.lerp(A.pull, B.pull, k); pair = QM.lerp(A.pair, B.pair, k);
      draw();
    };
    const loop = () => { if (s === 4 && !SC.printing()) { wrap = true; L.start(); } };
    if (!animate) { set(1); loop(); return; }
    stop = QM.tween(900, set, loop);
  };
  return { go, leave() { if (stop) stop(); L.stop(); } };
});

// ---------------------------------------------------------------------------- dance
// Left: a normal metal, every electron on its own. Right: a superconductor, every pair
// doing the same move at the same time (one quantum state).
QM.register('dance', (el, opts) => {
  const C = QM.c;
  const W = +opts.w || 1440, H = +opts.h || 300, gapx = 40, pw = (W - gapx) / 2;
  const mk = (x, cls, title, color) => {
    const b = QM.box(el, x, 0, pw, H);
    b.classList.add('sc-panel', cls);
    SC.text(b, 22, 16, title, { cls: 'sc-ptitle', color });
    return SC.canvas(b, 0, 0, pw, H);
  };
  const L = mk(0, 'normal', 'Metal normal: cada uno a su aire', C.navy);
  const R = mk(pw + gapx, 'super', 'Superconductor: todos a una', C.red);
  const rnd = SC.rng(3);
  const free = d3.range(18).map(() => ({ x: 30 + rnd() * (pw - 60), y: 70 + rnd() * (H - 100), a: rnd() * 6.3, v: 70 + 60 * rnd() }));
  const rows = 3, cols = 5;
  const pairs = [];
  for (let j = 0; j < rows; j++) for (let i = -1; i < cols; i++) pairs.push({ x: (pw / cols) * (i + 0.5) + (j % 2) * 30, y: 95 + j * ((H - 120) / (rows - 1)) * 0.92 });
  const draw = (t, dt) => {
    L.clearRect(0, 0, pw, H);
    for (const e of free) {
      e.a += (rnd() - 0.5) * 6 * dt;
      e.x += e.v * Math.cos(e.a) * dt; e.y += e.v * Math.sin(e.a) * dt;
      if (e.x < 14 || e.x > pw - 14) { e.a = Math.PI - e.a; e.x = QM.clamp(e.x, 14, pw - 14); }
      if (e.y < 66 || e.y > H - 14) { e.a = -e.a; e.y = QM.clamp(e.y, 66, H - 14); }
      SC.electron(L, e.x, e.y, 9, C);
      L.strokeStyle = C.red; L.lineWidth = 2;
      L.beginPath(); L.moveTo(e.x + 13 * Math.cos(e.a), e.y + 13 * Math.sin(e.a));
      L.lineTo(e.x + 26 * Math.cos(e.a), e.y + 26 * Math.sin(e.a)); L.stroke();
    }
    R.clearRect(0, 0, pw, H);
    const shift = (45 * t) % (pw / cols), ph = 3.2 * t;
    for (const p of pairs) {
      const x = p.x + shift;
      const y = p.y + 9 * Math.sin(0.02 * x - 2.2 * t);
      const ox = 15 * Math.cos(ph), oy = 9 * Math.sin(ph);
      R.strokeStyle = 'rgba(176,18,32,0.35)'; R.lineWidth = 2;
      R.beginPath(); R.moveTo(x - ox, y - oy); R.lineTo(x + ox, y + oy); R.stroke();
      SC.electron(R, x - ox, y - oy, 9, C);
      SC.electron(R, x + ox, y + oy, 9, C);
    }
  };
  // the lattice slides by one spacing and repeats (one extra column waits off the left edge)
  const loop = SC.loop((dt, t) => draw(t, dt));
  draw(0.8, 0);
  return { enter() { if (!SC.printing()) loop.start(); }, leave() { loop.stop(); } };
});

// ---------------------------------------------------------------------------- tc
// Record critical temperature of each family against the year of discovery (°C).
// Steps: 0 = how we cool (He, N2, room temperature), 1 = conventional, 2 = cuprates
// (with the YBCO of the demonstration), 3 = iron-based and twisted graphene,
// 4 = hydrides (at more than a million atmospheres).
QM.register('tc', (el, opts) => {
  const C = QM.c;
  const W = +opts.w || 980, H = +opts.h || 600;
  const P = QM.panel(el, { x: 0, y: 0, w: W, h: H, m: { l: 92, r: 24, t: 20, b: 64 } });
  const X = d3.scaleLinear([1905, 2025], [0, P.iw]);
  const Y = d3.scaleLinear([-300, 45], [P.ih, 0]);
  QM.axis(P, 'bottom', X, { ticks: [1910, 1930, 1950, 1970, 1990, 2010], fmt: (v) => String(v) });
  QM.axis(P, 'left', Y, { ticks: [-250, -200, -150, -100, -50, 0], fmt: (v) => QM.fmt(v) + ' °C' });
  P.label(P.iw / 2, P.ih + 50, 'Año del descubrimiento', { math: false, cls: 'text sc-axis' });
  const K = (k) => k - 273.15;
  const fam = {
    conv: { c: C.navy, name: 'Convencionales', pts: [[1911, 4.2, 'Mercurio'], [1913, 7.2], [1930, 9.2], [1941, 16], [1954, 18.3], [1973, 23.2], [2001, 39, 'MgB₂']] },
    cup: { c: C.red, name: 'Cupratos', pts: [[1986, 35], [1987, 93, 'YBCO'], [1988, 110], [1988.6, 125], [1993, 133]] },
    fe: { c: C.green, name: 'De hierro', pts: [[2008, 26], [2008.5, 55]] },
    gr: { c: '#7B4FA0', name: 'Grafeno rotado', pts: [[2018, 1.7]] },
    hyd: { c: C.orange, name: 'Hidruros', pts: [[2015, 203], [2019, 250]], hollow: true },
  };
  // cooling references
  const ref = (T, name, color, dash, opt = {}) => {
    const g = P.g.append('g').attr('class', 'qm-fade');
    g.append('line').attr('x1', 0).attr('x2', P.iw).attr('y1', Y(T)).attr('y2', Y(T))
      .attr('stroke', color).attr('stroke-width', opt.w || 2.4).attr('stroke-dasharray', dash);
    const l = P.label(opt.x ?? 10, Y(T) + (opt.dy ?? -8), name, { math: false, cls: 'text', ax: 0, ay: 1, color });
    return [g, l];
  };
  ref(20, 'Temperatura ambiente (20 °C)', C.orange, '10 7');
  ref(-196, 'Nitrógeno líquido: −196 °C (barato)', '#1F8AA6', '10 7', { w: 3 });
  ref(-269, 'Helio líquido: −269 °C (caro)', C.muted, '4 6', { dy: 16 });
  // the helium label hangs below its line (the first superconductors sit on it)
  P.labels.lastChild.style.transform = 'translate(0,0)';

  const grp = {};
  for (const [k, f] of Object.entries(fam)) {
    const g = P.g.append('g').style('transition', 'opacity 0.5s');
    if (k === 'conv' || k === 'cup') {
      g.append('path').attr('d', d3.line().x((d) => X(d[0])).y((d) => Y(K(d[1]))).curve(d3.curveMonotoneX)(f.pts))
        .attr('fill', 'none').attr('stroke', f.c).attr('stroke-width', 2).attr('opacity', 0.45);
    }
    g.selectAll('circle').data(f.pts).join('circle')
      .attr('cx', (d) => X(d[0])).attr('cy', (d) => Y(K(d[1]))).attr('r', 9)
      .attr('fill', f.hollow ? '#fff' : f.c).attr('stroke', f.c).attr('stroke-width', f.hollow ? 3.5 : 1.5);
    grp[k] = { g, labels: [] };
  }
  const tag = (k, html, x, y, o = {}) => {
    const l = P.label(x, y, html, { math: false, cls: o.cls || 'text', ax: o.ax ?? 0, ay: o.ay ?? 0.5, color: o.color || fam[k].c });
    l.classList.add('qm-fade');
    grp[k].labels.push(l);
    return l;
  };
  tag('conv', '<b>Convencionales</b>', X(1960), Y(-230), { ax: 0.5 });
  tag('conv', 'Mercurio, 1911', X(1910), Y(-247), { ax: 0, ay: 1, cls: 'small' });
  tag('cup', '<b>Cupratos</b> (1986)', X(1985), Y(-108), { ax: 1 });
  // YBCO: the superconductor of the demonstration
  const yb = grp.cup.g.append('circle').attr('cx', X(1987)).attr('cy', Y(K(93))).attr('r', 17)
    .attr('fill', 'none').attr('stroke', C.red).attr('stroke-width', 3);
  tag('cup', '<b>YBCO</b>: −181 °C<br><span class="sc-muted">¡el de la demostración!</span>', X(1985), Y(-152), { ax: 1, ay: 0.5 });
  tag('fe', '<b>De hierro</b>', X(2010.5), Y(-172), { ax: 0 });
  tag('gr', 'Grafeno rotado', X(2016), Y(-285), { ax: 1 });
  tag('hyd', '<b>Hidruros</b> (a presión)', X(2016), Y(K(250)), { ax: 1 });

  const vis = { conv: 1, cup: 2, fe: 3, gr: 3, hyd: 4 };
  return {
    go(step) {
      for (const [k, s] of Object.entries(vis)) {
        const on = step >= s ? 1 : 0;
        grp[k].g.style('opacity', on);
        grp[k].labels.forEach((l) => { l.style.opacity = on; });
      }
    },
  };
});

// ---------------------------------------------------------------------------- vortex
// Side view: a magnet above a type II superconductor. Steps: 0 = field lines go round the
// sample (Meissner), 1 = some lines cross it through vortices pinned at defects.
QM.register('vortex', (el, opts) => {
  const C = QM.c;
  const W = +opts.w || 760, H = +opts.h || 560;
  const svg = d3.select(el).append('svg').attr('class', 'qm-svg').attr('width', W).attr('height', H);
  const cx = W / 2;
  const slab = { x: 70, y: 380, w: W - 140, h: 90 };
  const mag = { w: 170, h: 90, y: 170 };
  // superconductor
  svg.append('rect').attr('x', slab.x).attr('y', slab.y).attr('width', slab.w).attr('height', slab.h).attr('rx', 10)
    .attr('fill', C.navy_tint).attr('stroke', C.navy).attr('stroke-width', 2.5);
  // field lines: out of the N face, round, and back into the S face, squeezed above the
  // sample (always shown; the Meissner part of the story)
  const fl = svg.append('g').attr('fill', 'none').attr('stroke', C.navy).attr('stroke-width', 2.2).attr('opacity', 0.8);
  // nested loops: lines leaving near the axis go farthest out
  for (const s of [-1, 1]) for (const k of [0, 1, 2]) {
    const j = 2 - k;
    const xa = cx + s * (20 + 26 * k), top = mag.y, bot = mag.y + mag.h;
    const xo = cx + s * (150 + 70 * j), ym = mag.y + mag.h / 2 + 20 + 10 * j;
    const yb = slab.y - 22 - 12 * k;
    fl.append('path').attr('d',
      `M${xa},${top} C${xa + s * 6},${top - 50 - 45 * j} ${xo},${top - 60 - 40 * j} ${xo},${ym}` +
      ` C${xo},${yb} ${cx + s * (70 + 40 * k)},${yb} ${xa},${bot}`);
  }
  // vortices: lines that cross the sample through thin tubes of normal metal
  const vg = svg.append('g').style('transition', 'opacity 0.6s').style('opacity', 0);
  const vx = [-55, 0, 55].map((d) => cx + d);
  for (const x of vx) {
    vg.append('rect').attr('x', x - 9).attr('y', slab.y - 2).attr('width', 18).attr('height', slab.h + 4).attr('rx', 9)
      .attr('fill', '#fff').attr('stroke', C.navy).attr('stroke-width', 1.5).attr('stroke-dasharray', '3 3');
    vg.append('line').attr('x1', x).attr('x2', x).attr('y1', mag.y + mag.h).attr('y2', slab.y + slab.h + 40)
      .attr('stroke', C.navy).attr('stroke-width', 2.6);
    // supercurrent whirling around the vortex
    vg.append('ellipse').attr('cx', x).attr('cy', slab.y + 24).attr('rx', 21).attr('ry', 7)
      .attr('fill', 'none').attr('stroke', C.red).attr('stroke-width', 2.6);
    vg.append('path').attr('d', `M${x + 4},${slab.y + 31 - 5} L${x - 4},${slab.y + 31} L${x + 4},${slab.y + 31 + 5}`)
      .attr('fill', 'none').attr('stroke', C.red).attr('stroke-width', 2.6).attr('stroke-linecap', 'round');
    // the defect that pins it
    vg.append('circle').attr('cx', x).attr('cy', slab.y + slab.h - 22).attr('r', 7).attr('fill', C.orange);
  }
  // magnet
  const mg = svg.append('g');
  mg.append('rect').attr('x', cx - mag.w / 2).attr('y', mag.y).attr('width', mag.w).attr('height', mag.h / 2).attr('fill', C.red).attr('rx', 6);
  mg.append('rect').attr('x', cx - mag.w / 2).attr('y', mag.y + mag.h / 2).attr('width', mag.w).attr('height', mag.h / 2).attr('fill', C.navy).attr('rx', 6);
  mg.append('rect').attr('x', cx - mag.w / 2).attr('y', mag.y + mag.h / 2 - 8).attr('width', mag.w).attr('height', 16).attr('fill', C.navy);
  mg.append('rect').attr('x', cx - mag.w / 2).attr('y', mag.y + mag.h / 2 - 8).attr('width', mag.w).attr('height', 8).attr('fill', C.red);
  SC.text(el, cx, mag.y + mag.h / 4, 'N', { ax: 0.5, ay: 0.5, cls: 'sc-bold', color: '#fff' });
  SC.text(el, cx, mag.y + (3 * mag.h) / 4, 'S', { ax: 0.5, ay: 0.5, cls: 'sc-bold', color: '#fff' });
  SC.text(el, slab.x + 20, slab.y + slab.h / 2, 'superconductor', { ax: 0, ay: 0.5, cls: 'sc-small sc-bold', color: C.navy });
  const l1 = SC.text(el, cx + 85, slab.y + slab.h + 42, 'vórtice anclado<br>en un defecto', { ax: 0, ay: 0, cls: 'sc-small qm-fade', color: C.ink });
  const l2 = SC.text(el, cx - 85, slab.y + slab.h + 42, 'corriente que gira<br>alrededor', { ax: 1, ay: 0, cls: 'sc-small qm-fade', color: C.red });
  const at = +(opts.at || 1);
  return {
    go(step) {
      const on = step >= at ? 1 : 0;
      vg.style('opacity', on); l1.style.opacity = on; l2.style.opacity = on;
    },
  };
});

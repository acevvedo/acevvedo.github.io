/* © 2026 Nicolás Acevedo (@acevvedoo). Diseño y código originales, escritos desde cero (no es una plantilla ni una web prefabricada). Todos los derechos reservados. */
/* lux.js — efectos SOLO del pack Luxury. Va encima de fx.js (fx.css + fx.js + lux.css + lux.js).
   En el <body>:
     data-lux-intro="OMBRE"   → intro de entrada: nombre letra a letra, contador 0-100 y telón que se abre.
     data-lux-smooth          → scroll suave con inercia (Lenis, solo en ordenador).
     data-lux-cursor          → cursor propio (anillo + punto); data-cursor="Ver" en un elemento muestra esa palabra.
   En secciones / elementos:
     data-lux="expand"        → <section data-lux="expand"><div class="lux-x-sticky"><div class="lux-x-media"><img></div>…</div></section>
                                la foto empieza como una tarjeta y crece hasta llenar la pantalla al bajar.
     data-lux="horizontal"    → <section data-lux="horizontal"><div class="lux-h-sticky"><div class="lux-h-track">…</div></div></section>
                                al bajar, el contenido se mueve en horizontal (también en móvil).
     data-lux="hoverlist"     → <ul data-lux="hoverlist"><li data-img="foto.jpg">…</li></ul> una foto flota y sigue al ratón.
     data-lux="scramble"      → el texto se "descifra" letra a letra al aparecer (y al pasar el ratón).
     data-lux="spotlight"     → los hijos .lux-spot llevan un borde de luz que sigue al ratón.
     data-lux="velocity"      → el elemento se inclina según la velocidad del scroll (para cintas de texto).
     data-lux-bg="#hex" data-lux-fg="#hex" → al llegar a esa sección, la página entera cambia de color.
     data-lux="zoom"          → la foto se aleja (escala 1.35 → 1) mientras pasa por la pantalla. */
(() => {
  const B = document.body, H = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const tasks = [];
  let vel = 0, lastY = scrollY;
  const tick = () => { const y = scrollY; vel += ((y - lastY) - vel) * 0.18; lastY = y; tasks.forEach(f => f()); requestAnimationFrame(tick); };

  /* ---------- intro ---------- */
  function intro() {
    const nom = B.dataset.luxIntro; if (!nom) return;
    if (reduced) { B.classList.add('lux-done'); return; }
    const el = document.createElement('div'); el.className = 'lux-intro'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<div class="lux-i-top"></div><div class="lux-i-bot"></div><div class="lux-i-in"><div class="lux-i-nom">${[...nom].map((c, i) => `<span style="--i:${i}">${c === ' ' ? '&nbsp;' : c}</span>`).join('')}</div><div class="lux-i-bar"><i></i></div><div class="lux-i-num">000</div></div>`;
    B.prepend(el); H.classList.add('lux-loading'); B.style.overflow = 'hidden';
    const num = el.querySelector('.lux-i-num'), bar = el.querySelector('.lux-i-bar i'), dur = 1500, t0 = performance.now();
    const step = t => {
      const p = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3);
      num.textContent = String(Math.round(e * 100)).padStart(3, '0'); bar.style.transform = `scaleX(${e})`;
      if (p < 1) return requestAnimationFrame(step);
      el.classList.add('out'); B.classList.add('lux-done'); B.style.overflow = '';
      setTimeout(() => H.classList.remove('lux-loading'), 300);
      setTimeout(() => el.remove(), 1400);
    };
    requestAnimationFrame(step);
  }

  /* ---------- scroll suave (Lenis) ---------- */
  function smooth() {
    if (!B.hasAttribute('data-lux-smooth') || reduced || !fine) return;
    const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js';
    s.onload = () => {
      const lenis = new window.Lenis({ lerp: 0.085, wheelMultiplier: 0.95 });
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
      $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
        const id = a.getAttribute('href'); if (id.length < 2) return; const t = document.querySelector(id); if (!t) return;
        e.preventDefault(); lenis.scrollTo(t, { offset: -10, duration: 1.6 });
      }));
      window.LUX.lenis = lenis;
    };
    document.head.append(s);
  }

  /* ---------- cursor ---------- */
  function cursor() {
    if (!B.hasAttribute('data-lux-cursor') || !fine || reduced) return;
    const c = document.createElement('div'); c.className = 'lux-cur'; c.innerHTML = '<span></span>';
    const d = document.createElement('div'); d.className = 'lux-dot';
    B.append(c, d); H.classList.add('lux-has-cur');
    const lbl = c.querySelector('span');
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
    addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY; d.style.translate = `${tx}px ${ty}px`;
      const t = e.target.closest('[data-cursor]'), link = e.target.closest('a,button,input,label,[role=button]');
      lbl.textContent = t ? t.dataset.cursor : '';
      c.classList.toggle('lbl', !!t); c.classList.toggle('hov', !t && !!link);
    });
    addEventListener('pointerdown', () => c.classList.add('down')); addEventListener('pointerup', () => c.classList.remove('down'));
    document.addEventListener('pointerleave', () => c.style.opacity = 0); document.addEventListener('pointerenter', () => c.style.opacity = '');
    tasks.push(() => { x += (tx - x) * .16; y += (ty - y) * .16; c.style.translate = `${x}px ${y}px`; });
  }

  /* progreso de una sección alta con parte fija: 0 al entrar arriba, 1 al terminar */
  const prog = sec => { const r = sec.getBoundingClientRect(), tot = r.height - innerHeight; return tot > 0 ? clamp(-r.top / tot, 0, 1) : 0; };

  /* ---------- expand ---------- */
  function expand() {
    $$('[data-lux~="expand"]').forEach(sec => {
      sec.classList.add('lux-x'); if (!sec.style.height) sec.style.height = sec.dataset.height || '260vh';
      const m = sec.querySelector('.lux-x-media'), layers = $$('[data-from]', sec);
      tasks.push(() => {
        const p = prog(sec), e = 1 - Math.pow(1 - clamp(p / .7, 0, 1), 3);
        const mob = innerWidth < 700, ix = (mob ? 8 : 28) * (1 - e), iy = (mob ? 22 : 16) * (1 - e);
        m.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${Math.round(28 * (1 - e))}px)`;
        m.style.setProperty('--s', (1.25 - .25 * e).toFixed(4)); sec.style.setProperty('--p', p.toFixed(4));
        layers.forEach(l => l.classList.toggle('is-in', p >= +l.dataset.from && p <= +l.dataset.to));
      });
    });
  }

  /* ---------- horizontal ---------- */
  function horizontal() {
    $$('[data-lux~="horizontal"]').forEach(sec => {
      sec.classList.add('lux-h');
      const tr = sec.querySelector('.lux-h-track'), bar = sec.querySelector('.lux-h-bar i');
      let dist = 0;
      const size = () => { dist = Math.max(0, tr.scrollWidth - innerWidth); sec.style.height = `calc(100vh + ${dist}px)`; sec.style.height = `calc(100svh + ${dist}px)`; };
      new ResizeObserver(size).observe(tr); size(); addEventListener('resize', size);
      tasks.push(() => { const p = prog(sec); tr.style.transform = `translate3d(${(-dist * p).toFixed(1)}px,0,0)`; if (bar) bar.style.transform = `scaleX(${p})`; sec.style.setProperty('--p', p.toFixed(4)); });
    });
  }

  /* ---------- hover list con foto flotante ---------- */
  function hoverlist() {
    $$('[data-lux~="hoverlist"]').forEach(ul => {
      ul.classList.add('lux-hl');
      $$('[data-img]', ul).forEach(li => { const im = document.createElement('img'); im.src = li.dataset.img; im.alt = ''; im.loading = 'lazy'; im.className = 'lux-hl-th'; li.append(im); });
      if (!fine) return;
      const f = document.createElement('div'); f.className = 'lux-hl-float'; f.innerHTML = '<img alt="">'; B.append(f);
      const im = f.querySelector('img');
      let x = 0, y = 0, tx = 0, ty = 0, on = false, px = 0;
      ul.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; const li = e.target.closest('[data-img]'); if (li && im.getAttribute('src') !== li.dataset.img) { im.src = li.dataset.img; f.classList.remove('sw'); void f.offsetWidth; f.classList.add('sw'); } });
      ul.addEventListener('pointerenter', e => { on = true; x = tx = e.clientX; y = ty = e.clientY; f.classList.add('on'); });
      ul.addEventListener('pointerleave', () => { on = false; f.classList.remove('on'); });
      tasks.push(() => { if (!on && !f.classList.contains('on')) return; x += (tx - x) * .12; y += (ty - y) * .12; const r = clamp((x - px) * .9, -14, 14); px = x; f.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) rotate(${r}deg)`; });
    });
  }

  /* ---------- scramble ---------- */
  const GL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+/<>';
  function scrambleText(el) {
    const fin = el.dataset.luxText || (el.dataset.luxText = el.textContent);
    if (reduced) { el.textContent = fin; return; }
    let f = 0; const tot = fin.length * 1.6 + 14; cancelAnimationFrame(el._raf);
    const run = () => {
      el.textContent = [...fin].map((c, i) => c === ' ' ? ' ' : f > i * 1.6 + 10 ? c : f > i * 1.6 ? GL[(Math.random() * GL.length) | 0] : (el.dataset.luxHide ? ' ' : c)).join('');
      if (++f < tot) el._raf = requestAnimationFrame(run); else el.textContent = fin;
    };
    run();
  }
  function scramble() {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); setTimeout(() => scrambleText(e.target), H.classList.contains('lux-loading') ? 1700 : 0); } }), { threshold: .4 });
    $$('[data-lux~="scramble"]').forEach(el => {
      el.setAttribute('aria-label', el.textContent); el.dataset.luxHide = 1; el.dataset.luxText = el.textContent;
      io.observe(el); if (fine) el.addEventListener('pointerenter', () => { delete el.dataset.luxHide; scrambleText(el); });
    });
  }

  /* ---------- spotlight ---------- */
  function spotlight() {
    if (!fine) return;
    $$('[data-lux~="spotlight"]').forEach(g => g.addEventListener('pointermove', e => {
      $$('.lux-spot', g).forEach(c => { const r = c.getBoundingClientRect(); c.style.setProperty('--x', (e.clientX - r.left) + 'px'); c.style.setProperty('--y', (e.clientY - r.top) + 'px'); });
    }));
  }

  /* ---------- velocity ---------- */
  function velocity() {
    if (reduced) return;
    const els = $$('[data-lux~="velocity"]'); if (!els.length) return;
    tasks.push(() => { const k = clamp(vel * -.35, -12, 12); els.forEach(el => el.style.transform = `skewX(${k.toFixed(2)}deg)`); });
  }

  /* ---------- zoom ---------- */
  function zoom() {
    if (reduced) return;
    const els = $$('[data-lux~="zoom"]');
    tasks.push(() => els.forEach(el => { const r = el.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; const p = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1); el.style.scale = (1.35 - .35 * p).toFixed(4); }));
  }

  /* ---------- cambio de color de la página ---------- */
  function bgshift() {
    const secs = $$('[data-lux-bg]'); if (!secs.length) return;
    const cs = getComputedStyle(B), base = { bg: cs.backgroundColor, fg: cs.color };
    H.classList.add('lux-bgs');
    tasks.push(() => {
      let hit = null; const mid = innerHeight * .5;
      secs.forEach(s => { const r = s.getBoundingClientRect(); if (r.top < mid && r.bottom > mid) hit = s; });
      const bg = hit ? hit.dataset.luxBg : base.bg, fg = hit ? (hit.dataset.luxFg || base.fg) : base.fg;
      if (B.style.backgroundColor !== bg) { B.style.backgroundColor = bg; H.style.backgroundColor = bg; B.style.color = fg; }
    });
  }

  function init() {
    intro(); smooth(); cursor(); expand(); horizontal(); hoverlist(); scramble(); spotlight(); velocity(); zoom(); bgshift();
    requestAnimationFrame(tick);
  }
  window.LUX = { scrambleText };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

/* fx.js — librería de "toques top" para webs de clientes. Vanilla, sin dependencias, ~10 KB.
   Uso: <link rel="stylesheet" href="fx.css"> + <script src="fx.js" defer></script>
   Se activa sola leyendo atributos data-fx (pueden combinarse: data-fx="reveal tilt").
   API: window.FX.init(root) para contenido añadido después; FX.reduced = true si el usuario pidió menos movimiento. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  document.documentElement.classList.add('fx-js');
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const has = (el, k) => (el.dataset.fx || '').split(/\s+/).includes(k);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const onScroll = []; // tareas que dependen del scroll, un solo rAF
  let ticking = false;
  const runScroll = () => { ticking = false; onScroll.forEach(f => f()); };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(runScroll); } }, { passive: true });
  addEventListener('resize', () => requestAnimationFrame(runScroll));

  // Un observer para todo lo que "entra en pantalla"
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); if (!e.target.hasAttribute('data-repeat')) io.unobserve(e.target); }
    else if (e.target.hasAttribute('data-repeat')) e.target.classList.remove('is-in');
  }), { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  /* ---------- reveal (+ stagger: data-stagger="0.08" en el padre) ---------- */
  function reveal(root) {
    $$('[data-stagger]', root).forEach(p => {
      const step = parseFloat(p.dataset.stagger) || 0.08;
      [...p.children].forEach((c, i) => {
        if (!has(c, 'reveal')) c.dataset.fx = ((c.dataset.fx || '') + ' reveal').trim();
        c.style.setProperty('--fx-delay', (i * step).toFixed(2) + 's');
      });
    });
    $$('[data-fx~="reveal"]', root).forEach(el => {
      if (el.dataset.delay) el.style.setProperty('--fx-delay', el.dataset.delay + 's');
      io.observe(el);
    });
  }

  /* ---------- split / kinetic type: data-fx="split" data-by="chars|words" data-style="rise|blur|fade" ---------- */
  function splitText(el, cls = "fx-split") {
    if (el.dataset.splitDone) return; el.dataset.splitDone = 1;
    const by = el.dataset.by || 'chars', step = parseFloat(el.dataset.step) || (by === 'chars' ? 0.025 : 0.06);
    const base = parseFloat(el.dataset.delay) || 0;
    el.setAttribute('aria-label', el.textContent.trim().replace(/\s+/g, ' '));
    let n = 0;
    const walk = node => [...node.childNodes].forEach(ch => {
      if (ch.nodeType === 3) {
        const frag = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach(tok => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { frag.append(' '); return; }
          const w = document.createElement('span'); w.className = 'fx-w'; w.setAttribute('aria-hidden', 'true');
          if (by === 'words') {
            const s = document.createElement('span'); s.className = 'fx-wi'; s.textContent = tok;
            s.style.setProperty('--d', (base + n++ * step).toFixed(3) + 's'); w.append(s);
          } else {
            [...tok].forEach(c => { const s = document.createElement('span'); s.className = 'fx-c'; s.textContent = c;
              s.style.setProperty('--d', (base + n++ * step).toFixed(3) + 's'); w.append(s); });
          }
          frag.append(w);
        });
        ch.replaceWith(frag);
      } else if (ch.nodeType === 1) walk(ch); // respeta <em>, <br>, <span class>...
    });
    walk(el);
    // Degradados con background-clip:text: al partir el texto se pierden (cada trozo es su propia caja).
    // Copiamos el degradado del antepasado a cada trozo.
    el.querySelectorAll(".fx-c,.fx-wi").forEach(s => {
      for (let p = s.parentElement; p && p !== el.parentElement; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if ((cs.webkitBackgroundClip || cs.backgroundClip) === "text" && cs.backgroundImage !== "none") {
          s.style.backgroundImage = cs.backgroundImage; s.style.backgroundSize = cs.backgroundSize; s.classList.add("fx-gt"); break;
        }
      }
    });
    el.classList.add(cls);
  }
  function split(root) { $$('[data-fx~="split"]', root).forEach(el => { splitText(el); io.observe(el); }); }

  /* ---------- fill: el texto se "enciende" palabra a palabra con el scroll ---------- */
  function fill(root) {
    $$('[data-fx~="fill"]', root).forEach(el => {
      el.dataset.by = 'words'; splitText(el, 'fx-fill');
      const ws = $$('.fx-wi', el);
      onScroll.push(() => {
        const r = el.getBoundingClientRect(), vh = innerHeight;
        const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
        const k = Math.round(p * ws.length);
        ws.forEach((w, i) => w.classList.toggle('on', i < k));
      });
    });
  }

  /* ---------- parallax: data-fx="parallax" data-speed="-0.2" ---------- */
  function parallax(root) {
    if (reduced) return;
    $$('[data-fx~="parallax"]', root).forEach(el => {
      const sp = parseFloat(el.dataset.speed) || -0.15;
      onScroll.push(() => {
        const r = el.getBoundingClientRect(); if (r.bottom < -200 || r.top > innerHeight + 200) return;
        const c = r.top + r.height / 2 - innerHeight / 2;
        el.style.translate = `0 ${(c * sp).toFixed(1)}px`;
      });
    });
  }

  /* ---------- magnetic: data-fx="magnetic" data-strength="0.35" ---------- */
  function magnetic(root) {
    if (!fine || reduced) return;
    $$('[data-fx~="magnetic"]', root).forEach(el => {
      const k = parseFloat(el.dataset.strength) || 0.35;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * k}px,${y * k}px)`;
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- tilt 3D: data-fx="tilt" data-max="10" ---------- */
  function tilt(root) {
    if (!fine || reduced) return;
    $$('[data-fx~="tilt"]', root).forEach(el => {
      const max = parseFloat(el.dataset.max) || 10;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) scale(1.02)`;
        el.style.setProperty('--gx', px * 100 + '%'); el.style.setProperty('--gy', py * 100 + '%'); el.style.setProperty('--go', 1);
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; el.style.setProperty('--go', 0); });
    });
  }

  /* ---------- counter: data-fx="counter" data-to="1200" data-suffix="+" ---------- */
  function counter(root) {
    const cio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; cio.unobserve(e.target);
      const el = e.target, to = parseFloat(el.dataset.to), dec = (el.dataset.to.split('.')[1] || '').length;
      const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '', dur = reduced ? 0 : (parseFloat(el.dataset.dur) || 1.6) * 1000;
      const t0 = performance.now(), fmt = v => pre + v.toLocaleString('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
      const step = t => { const p = dur ? clamp((t - t0) / dur, 0, 1) : 1; el.textContent = fmt(to * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }), { threshold: 0.6 });
    $$('[data-fx~="counter"]', root).forEach(el => cio.observe(el));
  }

  /* ---------- marquee: data-fx="marquee" (duplica el contenido para el bucle) ---------- */
  function marquee(root) {
    $$('[data-fx~="marquee"]', root).forEach(el => {
      if (el.querySelector('.fx-marquee-track')) return;
      el.classList.add('fx-marquee');
      const t = document.createElement('div'); t.className = 'fx-marquee-track';
      t.innerHTML = el.innerHTML + el.innerHTML;
      [...t.children].slice(t.children.length / 2).forEach(c => c.setAttribute('aria-hidden', 'true'));
      if (el.dataset.speed) t.style.setProperty('--speed', el.dataset.speed + 's');
      if (el.dataset.reverse != null) t.style.animationDirection = 'reverse';
      el.innerHTML = ''; el.append(t);
    });
  }

  /* ---------- particles: <canvas data-fx="particles" data-color="#a9c7f5" data-count="70" data-links> ---------- */
  function particles(root) {
    $$('canvas[data-fx~="particles"]', root).forEach(cv => {
      const ctx = cv.getContext('2d'), color = cv.dataset.color || '#ffffff';
      const links = cv.hasAttribute('data-links'), dpr = Math.min(devicePixelRatio || 1, 2);
      let W, H, P = [], mouse = { x: -9e3, y: -9e3 }, visible = true;
      const resize = () => {
        W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const n = Math.round((parseInt(cv.dataset.count) || 70) * Math.min(1, W / 1200 + 0.35));
        P = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.8 + .6 }));
      };
      new ResizeObserver(resize).observe(cv); resize();
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(cv);
      cv.parentElement.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
      cv.parentElement.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9e3; });
      const frame = () => {
        requestAnimationFrame(frame); if (!visible) return;
        ctx.clearRect(0, 0, W, H); ctx.fillStyle = color; ctx.strokeStyle = color;
        for (const p of P) {
          if (!reduced) {
            const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
            if (d2 < 14400) { const f = (14400 - d2) / 14400 * .8; p.vx += dx / 120 * f; p.vy += dy / 120 * f; }
            p.vx *= .97; p.vy *= .97; p.vx += (Math.random() - .5) * .03; p.vy += (Math.random() - .5) * .03;
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x += W; if (p.x > W) p.x -= W; if (p.y < 0) p.y += H; if (p.y > H) p.y -= H;
          }
          ctx.globalAlpha = .75; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        }
        if (links) for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
          const a = P[i], b = P[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 110) { ctx.globalAlpha = (1 - d / 110) * .35; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
      };
      frame();
    });
  }

  /* ---------- liquid morph: <svg data-fx="blob" data-points="7" data-wobble="0.18"><path/></svg> ---------- */
  function blob(root) {
    $$('svg[data-fx~="blob"]', root).forEach(svg => {
      const path = svg.querySelector('path'); if (!path) return;
      svg.setAttribute('viewBox', '-100 -100 200 200');
      const N = parseInt(svg.dataset.points) || 7, wob = parseFloat(svg.dataset.wobble) || 0.18, sp = parseFloat(svg.dataset.speed) || 1;
      const seeds = Array.from({ length: N }, () => [Math.random() * 6.28, 0.4 + Math.random() * 0.8]);
      const draw = t => {
        const pts = seeds.map(([ph, f], i) => {
          const a = i / N * Math.PI * 2, r = 78 * (1 + wob * Math.sin(t * f * sp + ph));
          return [Math.cos(a) * r, Math.sin(a) * r];
        });
        // curva Catmull-Rom cerrada -> Bézier: bordes líquidos sin picos
        let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
        for (let i = 0; i < N; i++) {
          const p0 = pts[(i - 1 + N) % N], p1 = pts[i], p2 = pts[(i + 1) % N], p3 = pts[(i + 2) % N];
          d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(2)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(2)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(2)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
        }
        path.setAttribute('d', d + 'Z');
      };
      if (reduced) return draw(0);
      let vis = true; new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(svg);
      const loop = ms => { requestAnimationFrame(loop); if (vis) draw(ms / 1000); };
      requestAnimationFrame(loop);
    });
  }

  /* ---------- scrub: vídeo/secuencia controlada por el scroll (estilo Apple / Scroll World) ----------
     <section data-fx="scrub" data-frames="frames/f_####.webp" data-count="120" data-height="400vh"
              data-frames-mobile="frames-m/f_####.webp">  (opcional, para móvil vertical)
       <div class="fx-scrub-sticky"><canvas></canvas> ...capas de texto con data-from / data-to (0..1)...</div>
     </section> */
  function scrub(root) {
    $$('[data-fx~="scrub"]', root).forEach(sec => {
      const cv = sec.querySelector('canvas'), ctx = cv.getContext('2d');
      const mob = innerWidth < 768 && sec.dataset.framesMobile;
      const pat = mob ? sec.dataset.framesMobile : sec.dataset.frames;
      const count = parseInt(mob && sec.dataset.countMobile || sec.dataset.count);
      sec.classList.add('fx-scrub'); sec.style.height = sec.dataset.height || '400vh';
      const src = i => pat.replace(/#+/, m => String(i + 1).padStart(m.length, '0'));
      const imgs = new Array(count); let cur = -1, last = 0;
      const load = i => { if (imgs[i]) return imgs[i]; const im = new Image(); im.decoding = 'async'; im.src = src(i); im.onload = () => { if (i === last) paint(i); }; return (imgs[i] = im); };
      // carga progresiva: 1º fotograma, luego cada 8º, luego el resto (se ve fluido antes de cargar todo)
      load(0); const order = []; for (let s = 8; s >= 1; s = s >> 1) for (let i = 0; i < count; i += s) order.push(i);
      let q = 0; const feed = () => { for (let k = 0; k < 6 && q < order.length; k++) load(order[q++]); if (q < order.length) setTimeout(feed, 60); };
      setTimeout(feed, 100);
      const size = () => { const d = Math.min(devicePixelRatio || 1, 2); cv.width = cv.clientWidth * d; cv.height = cv.clientHeight * d; cur = -1; paint(last); };
      const nearest = i => { for (let k = 0; k < count; k++) { if (imgs[i - k]?.complete && imgs[i - k].naturalWidth) return imgs[i - k]; if (imgs[i + k]?.complete && imgs[i + k].naturalWidth) return imgs[i + k]; } };
      function paint(i) {
        const im = imgs[i]?.complete && imgs[i].naturalWidth ? imgs[i] : nearest(i); if (!im) return;
        const s = Math.max(cv.width / im.naturalWidth, cv.height / im.naturalHeight); // object-fit: cover
        const w = im.naturalWidth * s, h = im.naturalHeight * s;
        ctx.drawImage(im, (cv.width - w) / 2, (cv.height - h) / 2, w, h); cur = i;
      }
      const layers = $$('[data-from]', sec);
      new ResizeObserver(size).observe(cv);
      onScroll.push(() => {
        const r = sec.getBoundingClientRect(), total = r.height - innerHeight;
        const p = clamp(-r.top / total, 0, 1);
        sec.style.setProperty('--p', p.toFixed(4));
        const i = Math.round(p * (count - 1)); last = i; if (i !== cur) { load(i); paint(i); }
        layers.forEach(l => { const a = +l.dataset.from, b = +l.dataset.to; l.classList.toggle('is-in', p >= a && p <= b); });
      });
    });
  }

  /* ---------- barra de progreso: <div class="fx-progress"></div> ---------- */
  function progress() {
    const b = document.querySelector('.fx-progress'); if (!b) return;
    onScroll.push(() => b.style.setProperty('--p', (scrollY / (document.documentElement.scrollHeight - innerHeight)).toFixed(4)));
  }

  /* ---------- cursor: <body data-fx-cursor>; agranda sobre a, button, [data-cursor] ---------- */
  function cursor() {
    if (!fine || reduced || !document.body.hasAttribute('data-fx-cursor') || document.querySelector('.fx-cursor')) return;
    const c = document.createElement('div'); c.className = 'fx-cursor'; document.body.append(c);
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; c.classList.toggle('big', !!e.target.closest('a,button,[data-cursor]')); });
    (function loop() { x += (tx - x) * .2; y += (ty - y) * .2; c.style.translate = `${x}px ${y}px`; requestAnimationFrame(loop); })();
  }

  function init(root = document) {
    reveal(root); split(root); fill(root); parallax(root); magnetic(root); tilt(root);
    counter(root); marquee(root); particles(root); blob(root); scrub(root);
    if (root === document) { progress(); cursor(); }
    runScroll();
  }
  window.FX = { init, reduced, splitText };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init()); else init();
})();

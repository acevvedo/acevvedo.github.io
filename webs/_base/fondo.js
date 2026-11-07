/* fondo.js — genera el fondo vivo de <body data-fondo>: manchas, rejilla y formas 3D repartidas por toda la página.
   Las formas van por los márgenes (no tapan contenido), suben más lento que el scroll (profundidad) y se inclinan con el ratón. */
(() => {
  const body = document.body;
  if (!body || !body.hasAttribute('data-fondo')) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const P = { azul: ['#cfe0fb', '#a9c7f5', '#6f8fc9'], lila: ['#e4daf9', '#c9b6f2', '#8f78c4'], burdeos: ['#d9a3ad', '#a8495b', '#5e1f2c'], beige: ['#f6efe4', '#e9dfcf', '#bfae94'] };
  const tipos = ['esfera', 'anillo', 'capsula', 'cristal', 'esfera', 'cubo'];
  const colores = ['azul', 'lila', 'burdeos', 'azul', 'beige', 'lila'];
  let capa, piezas = [];

  function montar() {
    capa?.remove(); piezas = [];
    capa = document.createElement('div'); capa.className = 'fondo'; capa.setAttribute('aria-hidden', 'true');
    const alto = document.documentElement.scrollHeight; capa.style.height = alto + 'px';
    capa.innerHTML = '<div class="rejilla"></div>';
    // manchas de color: una cada ~900px, alternando lados
    const manchas = ['azul', 'lila', 'burdeos', 'azul', 'lila'];
    for (let y = -200, i = 0; y < alto; y += 900, i++) {
      const c = P[manchas[i % manchas.length]][1], m = document.createElement('div');
      m.className = 'mancha';
      m.style.cssText = `top:${y}px;${i % 2 ? 'right' : 'left'}:-220px;--d:${22 + i * 3}s;--tx:${i % 2 ? -70 : 70}px;--ty:${40 - i * 10}px;opacity:${manchas[i % 5] === 'burdeos' ? .22 : .45}`;
      m.innerHTML = `<svg viewBox="-100 -100 200 200"><path d="M70,0C70,40 40,75 0,72C-45,70 -75,40 -72,0C-70,-45 -40,-72 0,-70C45,-72 70,-40 70,0Z" fill="${c}"/></svg>`;
      capa.append(m);
    }
    // formas 3D por los márgenes: una cada ~650px
    const ancho = innerWidth;
    for (let y = 120, i = 0; y < alto - 200; y += 560 + (i % 3) * 120, i++) {
      const lado = i % 2 ? 'right' : 'left', t = (ancho < 760 ? 54 : 110) + (i * 37 % 80);
      const prof = 0.15 + (i * 0.13 % 0.45); // cuánto más lento que el scroll
      const [c1, c2, c3] = P[colores[i % colores.length]];
      const tipo = tipos[i % tipos.length];
      const pieza = document.createElement('div');
      pieza.className = 'pieza' + (i % 3 === 2 ? ' lejos' : '');
      const off = ancho < 760 ? -t * .45 : (ancho > 1400 ? 40 + (i * 53 % 90) : -t * .25 + (i * 29 % 40));
      pieza.style.cssText = `top:${y}px;${lado}:${off}px;opacity:${i % 3 === 2 ? .55 : .9};filter:blur(${i % 3 === 2 ? 2 : 0}px)`;
      pieza.innerHTML = `<div class="raton"><div class="forma ${tipo}" style="--t:${t}px;--c1:${c1};--c2:${c2};--c3:${c3};--d:${7 + i % 4 * 1.7}s;--dl:-${i * 1.3}s;--r0:${-10 + i * 7 % 20}deg;--r1:${6 + i * 11 % 24}deg"></div><div class="sombra"></div></div>`;
      capa.append(pieza);
      piezas.push({ el: pieza, raton: pieza.firstChild, y, prof, k: (i % 3 + 1) * 6 });
    }
    body.prepend(capa);
    mover();
  }

  function mover() {
    if (reduced) return;
    const sy = scrollY;
    for (const p of piezas) {
      const rel = p.y - sy - innerHeight / 2; // 0 cuando está en el centro de la pantalla
      p.el.style.translate = `0 ${(-rel * p.prof).toFixed(1)}px`;
    }
  }
  let tick = false;
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; mover(); }); } }, { passive: true });
  if (fine && !reduced) addEventListener('pointermove', e => {
    const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    for (const p of piezas) p.raton.style.transform = `translate(${(-x * p.k).toFixed(1)}px,${(-y * p.k).toFixed(1)}px) rotate(${(x * p.k * .6).toFixed(1)}deg)`;
  });
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(montar, 250); });
  if (document.readyState === 'complete') montar(); else addEventListener('load', montar);
  // si la página cambia de alto (contenido generado, imágenes), se vuelve a repartir
  new ResizeObserver(() => { if (capa && Math.abs(parseFloat(capa.style.height) - document.documentElement.scrollHeight) > 200) { clearTimeout(rt); rt = setTimeout(montar, 250); } }).observe(document.documentElement);
})();

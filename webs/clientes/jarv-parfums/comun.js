// © 2026 Nicolás Acevedo (@acevvedoo). Partes comunes de todas las páginas de JARV: menú, menú del móvil, pie, botón de WhatsApp y utilidades.
(() => {
  const aqui = location.pathname.split('/').pop() || 'index.html';
  const act = f => (f === aqui || (f === 'coleccion.html' && aqui === 'perfume.html')) ? ' class="act"' : '';
  const WA = 'https://api.whatsapp.com/send?text=';
  const nav = document.getElementById('nav');
  if (nav) nav.innerHTML = `<div class="wrap">
    <div class="links cap"><a href="coleccion.html"${act('coleccion.html')}>Colección</a><a href="test.html"${act('test.html')}>Tu perfume</a><a href="casa.html"${act('casa.html')}>La Casa</a></div>
    <a href="index.html" class="logo" aria-label="JARV Parfums, inicio"><b>JARV</b><small>DUBAI · EST 2026</small></a>
    <div class="right cap"><a href="envios.html"${act('envios.html')}>Envíos</a><a class="contacto" href="contacto.html"${act('contacto.html')}>Contacto</a><button class="menu-b" aria-expanded="false" aria-controls="menu">Menú</button></div>
  </div>`;
  const menu = document.createElement('div');
  menu.className = 'menu'; menu.id = 'menu';
  menu.innerHTML = `<button class="x">Cerrar ×</button>` +
    [['index.html', 'Inicio'], ['coleccion.html', 'La <em>colección</em>'], ['test.html', 'Encuentra tu <em>perfume</em>'], ['casa.html', 'La <em>Casa</em>'], ['envios.html', 'Compra y <em>envíos</em>'], ['contacto.html', '<em>Contacto</em>']]
      .map(([f, t], i) => `<a href="${f}"${act(f)} style="transition-delay:${.25 + i * .06}s">${t}</a>`).join('') +
    `<p class="pie-m">jarvclub@outlook.com · Bizum · Envío 24/48 h</p>`;
  document.body.append(menu);
  const bt = nav?.querySelector('.menu-b');
  const abre = on => { menu.classList.toggle('on', on); bt?.setAttribute('aria-expanded', on); document.body.style.overflow = on ? 'hidden' : ''; };
  bt?.addEventListener('click', () => abre(true));
  menu.querySelector('.x').onclick = () => abre(false);
  addEventListener('keydown', e => e.key === 'Escape' && menu.classList.contains('on') && abre(false));

  const pie = document.getElementById('pie');
  if (pie) pie.innerHTML = `<div class="wrap">
    <div><span class="ar">جارف بارفان</span><b class="l">JARV PARFUMS</b><p style="color:var(--mut);font-size:14px;max-width:34ch">Jarv Dubai · Colección 2026 · Fragancias orientales puras.</p><p style="margin-top:12px;font-size:14px"><a href="mailto:jarvclub@outlook.com" class="oro">jarvclub@outlook.com</a></p></div>
    <div><span class="cap">Colección</span><ul><li><a href="coleccion.html">Todos los perfumes</a></li><li><a href="test.html">Encuentra tu perfume</a></li><li><a href="index.html#vitrina">La vitrina</a></li></ul></div>
    <div><span class="cap">La Casa</span><ul><li><a href="casa.html">Savoir-faire oriental</a></li><li><a href="envios.html">Compra y envíos</a></li><li><a href="envios.html#preguntas">Preguntas frecuentes</a></li></ul></div>
    <div><span class="cap">Garantías</span><ul><li>Bizum · Apple Pay · Google Pay</li><li>Envío express 24/48 h</li><li>100% originales de los Emiratos</li><li><a href="contacto.html">Contacto</a></li></ul></div>
    <div class="legal cap"><span>© 2026 JARV Parfums · Jarv Dubai</span><span>Todos los derechos reservados</span></div>
  </div>`;

  if (!document.querySelector('.flota')) {
    const f = document.createElement('a');
    f.className = 'flota'; f.target = '_blank'; f.rel = 'noopener'; f.setAttribute('aria-label', 'Escribir por WhatsApp');
    f.href = WA + encodeURIComponent('Hola JARV, quiero información sobre vuestros perfumes');
    f.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/></svg>';
    document.body.append(f);
  }

  // utilidades para las páginas
  const J = window.JARV = {};
  J.eur = n => n.toFixed(2).replace('.', ',') + ' €';
  J.titulo = s => s.toLowerCase().replace(/(^|\s|\()\S/g, m => m.toUpperCase()).replace(/ De /g, ' de ').replace(/ \(.*\)/, '');
  J.luz = p => { const m = p.glowColor.match(/\d+/g); return `rgb(${m[0]},${m[1]},${m[2]})`; };
  J.FAM = { gourmand: 'Gourmand', oriental: 'Oriental', 'alta-gama': 'Alta perfumería', firma: 'Perfume firma' };
  J.nicho = (p, vt) => `<div class="hueco" style="--c:${J.luz(p)}"><i class="luz"></i><div class="frasco3d"><i class="sombra"></i><div class="refl" aria-hidden="true"><img src="${p.img}" alt="" loading="lazy"></div><div class="bot" style="--img:url(${p.img})"><img src="${p.img}" alt="${J.titulo(p.nombre)}" loading="lazy"${vt ? ` style="view-transition-name:f-${p.id}"` : ''}></div></div></div>`;
  J.tarjeta = (p, vt) => `<a class="tarj" href="perfume.html?p=${p.id}" style="--c:${J.luz(p)}" data-cursor="Ver" data-fam="${p.categoria}">${J.nicho(p, vt)}
    <span><b>${J.titulo(p.nombre)}</b><span class="ins">${p.inspiracion}</span><span class="pr">${p.precioAnterior ? `<s>${J.eur(p.precioAnterior)}</s>` : ''}${J.eur(p.precio)}${p.stockReal === 0 ? ' · Agotado' : ''}</span></span></a>`;
  J.pedir = p => {
    const msg = p.stockReal === 0
      ? `Hola JARV, quiero reservar *${J.titulo(p.nombre)}* (${p.marca}, ${p.volumen}). ¿Cuándo llega la próxima remesa?`
      : `Hola JARV, me interesa *${J.titulo(p.nombre)}* (${p.marca}, ${p.volumen}) — ${J.eur(p.precio)}. ¿Está disponible?`;
    window.open(WA + encodeURIComponent(msg), '_blank');
  };
})();

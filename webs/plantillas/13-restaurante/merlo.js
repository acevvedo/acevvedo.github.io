// © 2026 Nicolás Acevedo (@acevvedoo). Casa Merlo · partes comunes: menú, pie, carta, horario y reservas por WhatsApp.
(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const aqui = location.pathname.split('/').pop() || 'index.html';
  const PAGS = [['index.html', 'Inicio'], ['carta.html', 'La carta'], ['casa.html', 'La casa'], ['eventos.html', 'Grupos y eventos'], ['reservas.html', 'Reservas']];
  const act = f => f === aqui ? ' class="act"' : '';

  // ——— Menú ———
  const nav = $('#nav');
  if (nav) {
    nav.innerHTML = `<div class="wrap">
      <a class="logo" href="index.html">Casa <em>Merlo</em></a>
      <ul>${PAGS.slice(1, 4).map(([f, t]) => `<li><a href="${f}"${act(f)}>${t}</a></li>`).join('')}</ul>
      <a class="btn vino fx-btn-fill" href="reservas.html">Reservar mesa</a>
      <button class="menu-b" aria-expanded="false">Menú</button>
    </div>`;
    const m = document.createElement('div');
    m.className = 'menu-m';
    m.innerHTML = `<button class="menu-b x" style="display:inline-flex">Cerrar ×</button>${PAGS.map(([f, t]) => `<a href="${f}"${act(f)}>${t}</a>`).join('')}<a class="btn vino" href="reservas.html">Reservar mesa →</a>`;
    document.body.append(m);
    const abre = on => { m.classList.toggle('on', on); document.body.style.overflow = on ? 'hidden' : ''; };
    nav.querySelector('.menu-b').onclick = () => abre(true);
    m.querySelector('.x').onclick = () => abre(false);
    const solida = () => nav.classList.toggle('solida', scrollY > 40 || document.body.dataset.nav === 'solida');
    addEventListener('scroll', solida, { passive: true }); solida();
  }

  // ——— Pie ———
  const pie = $('#pie');
  if (pie) pie.innerHTML = `<div class="wrap"><div class="g">
      <div><span class="logo">Casa <em>Merlo</em></span><p style="margin-top:14px;max-width:30ch">Cocina de mercado a la brasa de encina en el centro de Madrid desde 2014.</p></div>
      <div><b>La casa</b><ul>${PAGS.map(([f, t]) => `<li><a href="${f}">${t}</a></li>`).join('')}</ul></div>
      <div><b>Dónde</b><ul><li>Calle del Olivo 12</li><li>28012 Madrid</li><li><a href="https://www.google.com/maps/search/?api=1&query=Madrid" target="_blank" rel="noopener">Cómo llegar →</a></li></ul></div>
      <div><b>Horario</b><ul><li>Mar – jue · 13:00–16:30 · 20:30–23:30</li><li>Vie – sáb · hasta las 00:30</li><li>Domingo · 13:00–17:00</li><li>Lunes cerrado</li></ul></div>
    </div><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px"><span>Casa Merlo · Plantilla 13 · Restaurante (negocio de ejemplo)</span><span>Aviso legal · Privacidad · Cookies</span></div></div>`;
  if (!$('.flota')) document.body.insertAdjacentHTML('beforeend', '<a class="flota" href="reservas.html">Reservar mesa</a>');

  // ——— Carta (la misma en la portada y en la página de la carta) ———
  const CARTA = window.CARTA = {
    compartir: ['Para compartir', [
      ['Croquetas de jamón ibérico', '9,50 €', '6 unidades, cremosas por dentro.', ''],
      ['Calamares de potera', '14 €', 'Con alioli de limón.', 'SG'],
      ['Tomate de huerta con ventresca', '12 €', 'Aceite de arbequina y cebolleta.', 'SG'],
      ['Pimientos de Padrón', '8 €', 'Unos pican y otros no.', 'V SG'],
      ['Tabla de quesos de la sierra', '15 €', 'Con membrillo casero y nueces.', 'V'],
      ['Alcachofas a la brasa', '11 €', 'Con lascas de jamón y sal en escamas.', 'SG'],
    ]],
    principales: ['Principales', [
      ['Arroz meloso de setas y foie', '19 €', 'Mínimo 2 personas.', ''],
      ['Pescado del día a la brasa', 'S/M', 'Con verduras de temporada.', 'SG'],
      ['Lomo alto de vaca madurada', '26 €', '400 g, con patatas y pimientos.', 'SG'],
      ['Pollo de corral a la brasa', '17 €', 'Medio pollo con su jugo.', 'SG'],
      ['Canelones de verduras asadas', '15 €', 'Con bechamel de trufa.', 'V'],
      ['Presa ibérica', '21 €', 'Al punto, con puré de manzana asada.', 'SG'],
    ]],
    postres: ['Postres', [
      ['Tarta de queso de la casa', '7 €', 'Cremosa, recién horneada.', 'V'],
      ['Torrija caramelizada', '7 €', 'Con helado de vainilla.', 'V'],
      ['Coulant de chocolate', '7,50 €', 'Necesita 12 minutos.', 'V'],
      ['Fruta de temporada', '5 €', 'La que llegue esa semana.', 'V SG'],
    ]],
    vinos: ['Vinos', [
      ['Tinto de Madrid · Garnacha', '24 €', 'Copa 4,50 €. Fresco y frutal.', ''],
      ['Ribera del Duero · Crianza', '32 €', 'Copa 5,50 €.', ''],
      ['Albariño · Rías Baixas', '28 €', 'Copa 5 €. Para el pescado.', ''],
      ['Verdejo · Rueda', '22 €', 'Copa 4 €.', ''],
      ['Cava brut nature', '26 €', 'Para celebrar.', ''],
    ]],
  };
  const fila = ([n, p, d, t]) => `<li><div class="l1"><h4>${n}${t.split(' ').filter(Boolean).map(x => `<span class="ic" title="${x === 'V' ? 'Vegetariano' : 'Sin gluten'}">${x}</span>`).join('')}</h4><span class="pts"></span><span class="pr">${p}</span></div><p>${d}</p></li>`;
  window.CARTA_FILA = fila;
  const listas = $('#listas');
  if (listas) {
    listas.innerHTML = Object.entries(CARTA).map(([k, [, v]], i) => `<ul class="lista ${i ? '' : 'on'}" data-l="${k}" role="tabpanel">${v.slice(0, 5).map(fila).join('')}</ul>`).join('');
    $('#tabs').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      $$('#tabs button').forEach(x => x.setAttribute('aria-selected', x === b));
      $$('.lista').forEach(l => l.classList.toggle('on', l.dataset.l === b.dataset.t));
    });
  }

  // ——— Abierto / cerrado ahora ———
  const HORARIO = { 0: [[13, 17]], 1: [], 2: [[13, 16.5], [20.5, 23.5]], 3: [[13, 16.5], [20.5, 23.5]], 4: [[13, 16.5], [20.5, 23.5]], 5: [[13, 16.5], [20.5, 24.5]], 6: [[13, 16.5], [20.5, 24.5]] };
  $$('.estado').forEach(el => {
    const d = new Date(), h = d.getHours() + d.getMinutes() / 60, hoy = HORARIO[d.getDay()];
    const fmt = x => `${String(Math.floor(x) % 24).padStart(2, '0')}:${x % 1 ? '30' : '00'}`;
    const t = el.querySelector('span'), ahora = hoy.find(([a, b]) => h >= a && h < b);
    if (ahora) t.textContent = `Abierto ahora · hasta las ${fmt(ahora[1])}`;
    else { el.classList.add('cerrado'); const sig = hoy.find(([a]) => a > h); t.textContent = sig ? `Cerrado ahora · abrimos a las ${fmt(sig[0])}` : 'Cerrado ahora · mira el horario'; }
  });

  // ——— Reserva → WhatsApp ———
  const form = $('#form');
  if (form) {
    const pers = $('#pers'); let n = 2;
    pers.innerHTML = [1, 2, 3, 4, 5, 6, '7+'].map(x => `<button type="button" aria-pressed="${x === 2}" data-n="${x}">${x}</button>`).join('');
    pers.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; n = b.dataset.n; pers.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); });
    const dia = $('#dia'), hoyISO = new Date().toISOString().slice(0, 10); dia.min = hoyISO; dia.value = hoyISO;
    $('#hora').innerHTML = ['13:00', '13:30', '14:00', '14:30', '15:00', '20:30', '21:00', '21:30', '22:00', '22:30'].map(h => `<option${h === '21:00' ? ' selected' : ''}>${h}</option>`).join('');
    form.addEventListener('submit', e => {
      e.preventDefault(); const f = new FormData(form);
      const fecha = new Date(f.get('dia') + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
      const msg = `Hola, Casa Merlo. Quiero reservar mesa:\n· Nombre: ${f.get('nombre')}\n· Personas: ${n}\n· Día: ${fecha}\n· Hora: ${f.get('hora')}` + (f.get('nota') ? `\n· Nota: ${f.get('nota')}` : '');
      window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(msg), '_blank');
    });
  }
})();

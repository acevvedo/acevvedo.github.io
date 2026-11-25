/* © 2026 Nicolás Acevedo (@acevvedoo). Diseño y código originales, escritos desde cero (no es una plantilla ni una web prefabricada). Todos los derechos reservados. */
/* firma.js — firma de @acevvedoo en las plantillas y propuestas publicadas.
   Uso: <script src="../../_base/firma.js" data-modo="plantilla" defer></script>
   data-modo="plantilla" → pastilla "← Catálogo · @acevvedoo" abajo a la izquierda.
   data-modo="propuesta" → pastilla "Propuesta de diseño · @acevvedoo" (maqueta para un cliente).
   data-modo="credito"   → solo la línea de crédito del pie, sin pastilla (webs ya entregadas).
   En todos los modos se añade al final de la página una línea discreta: "Diseño y desarrollo web · @acevvedoo".
   Al entregar una web, mejor escribir esa línea directamente en el footer del cliente (ver README) y quitar este script. */
(() => {
  const s = document.currentScript, modo = s?.dataset.modo || 'plantilla';
  const base = s.src.replace(/firma\.js.*$/, '');           // carpeta _base/
  const cat = base.replace(/_base\/$/, 'index.html');       // catálogo
  const css = `
  .acv-firma{position:fixed;left:14px;bottom:14px;z-index:2147483000;display:flex;align-items:center;gap:10px;padding:6px 14px 6px 6px;border-radius:99px;
    background:rgba(20,18,24,.78);color:#fff;font:600 13px/1.1 "Inter Tight",system-ui,sans-serif;letter-spacing:-.01em;text-decoration:none;
    -webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.14);box-shadow:0 12px 30px -10px rgba(0,0,0,.45);
    transition:transform .4s cubic-bezier(.22,1,.36,1),padding .4s;animation:acv-in .8s cubic-bezier(.22,1,.36,1) 1.2s both}
  .acv-firma:hover{transform:translateY(-3px)}
  .acv-firma .av{width:32px;height:32px;border-radius:50%;padding:2px;background:conic-gradient(from 210deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5,#feda75);flex:none}
  .acv-firma .av img{width:100%;height:100%;border-radius:50%;object-fit:cover;border:2px solid #141218;display:block}
  .acv-firma small{display:block;font-weight:500;font-size:11px;opacity:.7;margin-bottom:2px}
  .acv-firma .vuelta{opacity:.75;margin-right:2px}
  @keyframes acv-in{from{opacity:0;transform:translateY(16px)}}
  @media (max-width:600px){.acv-firma{left:10px;bottom:10px;font-size:12px}.acv-firma small{font-size:10px}}
  @media print{.acv-firma{display:none}}
  .acv-credito{display:flex;justify-content:center;align-items:center;gap:8px;flex-wrap:wrap;padding:18px 16px 22px;font:500 12px/1.4 "Inter Tight",system-ui,sans-serif;letter-spacing:.02em;color:inherit;background:inherit;text-align:center}
  .acv-credito span{opacity:.55}
  .acv-credito a{color:inherit;font-weight:700;text-decoration:none;border-bottom:1px solid currentColor;padding-bottom:1px;opacity:.85}
  .acv-credito a:hover{opacity:1}
  @media (max-width:600px){.acv-credito{padding-bottom:84px}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.append(st);
  const cr = document.createElement('div'); cr.className = 'acv-credito';
  cr.innerHTML = '<span>Diseño y desarrollo web</span><a href="https://www.instagram.com/acevvedoo/" target="_blank" rel="noopener">@acevvedoo</a>';
  const a = document.createElement('a'); a.className = 'acv-firma';
  if (modo === 'propuesta') {
    a.href = 'https://www.instagram.com/acevvedoo/'; a.target = '_blank'; a.rel = 'noopener';
    a.innerHTML = `<span class="av"><img src="${base}yo.jpg" alt=""></span><span><small>Propuesta de diseño · maqueta</small>por @acevvedoo</span>`;
  } else {
    a.href = cat;
    a.innerHTML = `<span class="av"><img src="${base}yo.jpg" alt=""></span><span><small>Diseño original de @acevvedoo</small><span class="vuelta">←</span> Ver catálogo</span>`;
  }
  a.setAttribute('aria-label', modo === 'propuesta' ? 'Propuesta de diseño de @acevvedoo' : 'Volver al catálogo de @acevvedoo');
  const poner = () => { document.body.append(cr); if (modo !== 'credito') document.body.append(a); };
  document.body ? poner() : addEventListener('DOMContentLoaded', poner);
})();

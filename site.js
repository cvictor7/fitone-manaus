/* Lógica do site (não precisa mexer aqui). Os dados ficam em config.js */
(() => {
  const $ = id => document.getElementById(id);
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const waUrl = msg => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
  const base = "Oi! Vim pelo site da Fit One e quero conhecer a academia.";
  document.querySelectorAll('.wa-link').forEach(a => { if (a.id !== 'talk-btn') a.href = waUrl(a.dataset.msg || base); });

  // montador de mensagem
  const bubble = $('bubble'), talk = $('talk-btn'), opts = [...document.querySelectorAll('#opts button')];
  if (bubble && talk && opts.length) {
    const pick = btn => {
      opts.forEach(b => b.setAttribute('aria-pressed', b === btn));
      const msg = `Oi! Vim pelo site da Fit One e ${btn.dataset.msg}`;
      bubble.textContent = msg; talk.href = waUrl(msg);
    };
    opts.forEach(b => b.addEventListener('click', () => pick(b)));
    pick(opts[0]);
  }

  // botao flutuante: so aparece quando nenhum outro botao de WhatsApp esta na tela
  const fl = document.querySelector('.float'), here = new Set();
  if (fl) {
    const setFl = on => { fl.classList.toggle('show', on); fl.inert = !on; };
    if ('IntersectionObserver' in window) {
      setFl(false);
      const io = new IntersectionObserver(es => {
        es.forEach(e => e.isIntersecting ? here.add(e.target) : here.delete(e.target));
        setFl(here.size === 0);
      }, {threshold: .6});
      document.querySelectorAll('[data-wa-here]').forEach(x => io.observe(x));
    } else setFl(true);
  }

  // instagram
  const ig = $('ig-link');
  if (ig) { if (CONFIG.instagram) ig.href = CONFIG.instagram; else ig.hidden = true; }

  // fotos reais
  const gal = $('fotos');
  if (gal) {
    const slots = document.querySelectorAll('#gallery .ph');
    if (!CONFIG.fotos.length) gal.hidden = true;
    CONFIG.fotos.slice(0, slots.length).forEach((src, i) => {
      const img = new Image(); img.src = src; img.alt = slots[i].textContent.trim(); img.loading = 'lazy';
      slots[i].prepend(img); slots[i].querySelector('span').hidden = true;
    });
  }

  // hora de Manaus (UTC-4)
  const now = new Date(Date.now() - 4 * 3600e3);
  const d = now.getUTCDay(), h = now.getUTCHours() + now.getUTCMinutes() / 60;

  // aberto agora
  const st = $('status'), txt = $('status-text');
  if (st && txt) {
    const [o, c] = CONFIG.horarios[d];
    if (h >= o && h < c) { st.classList.add('open'); txt.textContent = `Aberto agora, fecha às ${c}h`; }
    else {
      const nd = h < o ? d : (d + 1) % 7;
      txt.textContent = `Fechado agora. Abre ${nd === d ? 'hoje' : 'amanhã'} às ${CONFIG.horarios[nd][0]}h`;
    }
  }
  const row = document.querySelector(`#hours tr[data-d="${d}"]`);
  if (row) { row.classList.add('today'); const t = el('span', 'tag', 'hoje'); row.cells[0].append(t); }

  // avisos com validade (data de Manaus)
  const hojeStr = now.toISOString().slice(0, 10);
  const ativos = (CONFIG.avisos || []).filter(a => (!a.de || hojeStr >= a.de) && (!a.ate || hojeStr <= a.ate));
  if (ativos.length && $('avisos')) {
    const box = $('avisos-list');
    ativos.forEach(a => {
      const p = el('p');
      if (a.titulo) p.append(el('b', '', a.titulo + '.'));
      p.append(document.createTextNode(a.texto || ''));
      box.append(p);
    });
    $('avisos').hidden = false;
  }

  // grade de aulas: tabela no computador, abas por dia no celular
  const secAulas = $('aulas'), G = CONFIG.grade;
  if (secAulas) {
    if (!G || !Object.keys(G).length) { secAulas.hidden = true; document.querySelector('nav a[href="#aulas"]')?.remove(); }
    else {
      const DIAS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
      const CURTO = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
      const ORDEM = [1,2,3,4,5,6,0];
      const quebra = t => t.replace(/\//g, '/​');

      const tabela = $('grade-table');
      const horas = [...new Set(ORDEM.flatMap(k => (G[k] || []).map(x => x[0])))].sort();
      const thead = el('thead'), hr = el('tr');
      hr.append(el('th', '', 'Hora'));
      ORDEM.forEach(k => hr.append(el('th', k === d ? 'hoje' : '', DIAS[k])));
      thead.append(hr); tabela.append(thead);
      const tb = el('tbody');
      horas.forEach(hh => {
        const tr = el('tr'); tr.append(el('th', '', hh));
        ORDEM.forEach(k => {
          const item = (G[k] || []).find(x => x[0] === hh);
          tr.append(el('td', k === d ? 'hoje' : '', item ? quebra(item[1]) : ''));
        });
        tb.append(tr);
      });
      tabela.append(tb);

      const days = $('days'), lista = $('dia-lista'), nome = $('dia-nome');
      const botoes = ORDEM.map(k => {
        const b = el('button', k === d ? 'hoje' : '', CURTO[k]); b.type = 'button';
        b.addEventListener('click', () => mostra(k)); days.append(b); return b;
      });
      const mostra = k => {
        botoes.forEach((b, i) => b.setAttribute('aria-pressed', ORDEM[i] === k));
        nome.textContent = DIAS[k] + (k === d ? ' (hoje)' : '');
        lista.replaceChildren(...(G[k] || []).map(([hh, aula]) => { const li = el('li'); li.append(el('time', '', hh), el('span', '', aula.replace(/\//g, ' / '))); return li; }));
      };
      mostra(d);
    }
  }

  // copiar telefone
  const cp = $('copy-phone');
  if (cp) cp.addEventListener('click', e => {
    const t = $('phone').textContent;
    navigator.clipboard?.writeText(t).then(() => { e.target.textContent = 'Número copiado'; },
      () => { const r = document.createRange(); r.selectNodeContents($('phone')); getSelection().removeAllRanges(); getSelection().addRange(r); });
  });
})();

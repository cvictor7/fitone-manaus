/* Lógica do site (não precisa mexer aqui). Os dados ficam em config.js */
(() => {
  const $ = id => document.getElementById(id);
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const waUrl = msg => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
  const base = "Oi! Vim pelo site da Fit One e quero conhecer a academia.";
  document.querySelectorAll('.wa-link').forEach(a => { if (a.id !== 'talk-btn') a.href = waUrl(a.dataset.msg || base); });

  // medição sem cookie (Umami). Os cliques saem dos atributos data-umami-event do HTML.
  if (CONFIG.umamiId) {
    const s = document.createElement('script');
    s.defer = true;
    s.src = CONFIG.umamiScript || 'https://cloud.umami.is/script.js';
    s.dataset.websiteId = CONFIG.umamiId;
    if (CONFIG.dominio) s.dataset.domains = CONFIG.dominio + ',www.' + CONFIG.dominio;
    document.head.append(s);
    const priv = $('priv'); if (priv) priv.hidden = false;
  }

  // montador de mensagem
  const bubble = $('bubble'), talk = $('talk-btn'), opts = [...document.querySelectorAll('#opts button')];
  if (bubble && talk && opts.length) {
    const pick = btn => {
      opts.forEach(b => b.setAttribute('aria-pressed', b === btn));
      const msg = `Oi! Vim pelo site da Fit One e ${btn.dataset.msg}`;
      bubble.textContent = msg; talk.href = waUrl(msg);
      talk.dataset.umamiEventAssunto = btn.textContent.trim();
    };
    opts.forEach(b => b.addEventListener('click', () => pick(b)));
    pick(opts[0]);
  }

  // instagram
  document.querySelectorAll('.ig-link').forEach(a => { if (CONFIG.instagram) a.href = CONFIG.instagram; else a.hidden = true; });

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
  const hojeStr = now.toISOString().slice(0, 10);
  const amanhaStr = new Date(now.getTime() + 864e5).toISOString().slice(0, 10);
  const fmtDia = s => s.slice(8, 10) + '/' + s.slice(5, 7);

  // feriados e dias com horário diferente (config.js > excecoes)
  const EX = CONFIG.excecoes || [];
  const exHoje = EX.find(x => x.data === hojeStr);
  const horasDo = (dataStr, dow) => {
    const e = EX.find(x => x.data === dataStr);
    return e ? (e.abre == null ? [0, 0] : [e.abre, e.fecha]) : CONFIG.horarios[dow];
  };

  // aberto agora
  const st = $('status'), txt = $('status-text');
  if (st && txt) {
    const [o, c] = horasDo(hojeStr, d);
    if (h >= o && h < c) { st.classList.add('open'); txt.textContent = `Aberto agora, fecha às ${c}h`; }
    else {
      const hoje = h < o;
      const nd = hoje ? d : (d + 1) % 7;
      const [no, nc] = hoje ? [o, c] : horasDo(amanhaStr, nd);
      txt.textContent = no === nc ? 'Fechado agora' : `Fechado agora. Abre ${hoje ? 'hoje' : 'amanhã'} às ${no}h`;
    }
  }
  const row = document.querySelector(`#hours tr[data-d="${d}"]`);
  if (row) {
    row.classList.add('today'); const t = el('span', 'tag', 'hoje'); row.cells[0].append(t);
    if (exHoje) row.cells[1].textContent = (exHoje.nome ? exHoje.nome + ': ' : '') + (exHoje.abre == null ? 'fechado' : `${exHoje.abre}h às ${exHoje.fecha}h`);
  }

  // avisos com validade (data de Manaus) + aviso automático dos dias especiais
  const doConfig = (CONFIG.avisos || []).filter(a => (!a.de || hojeStr >= a.de) && (!a.ate || hojeStr <= a.ate));
  const doDia = EX.filter(e => {
    const de = e.avisoDe || new Date(Date.parse(e.data + 'T12:00:00Z') - 5 * 864e5).toISOString().slice(0, 10);
    return hojeStr >= de && hojeStr <= e.data;
  }).map(e => ({
    titulo: 'Horário especial', cor: e.cor,
    texto: (e.nome ? e.nome + ', ' : '') + fmtDia(e.data) + ': ' + (e.abre == null ? 'a academia não abre.' : `funcionamos das ${e.abre}h às ${e.fecha}h.`)
  }));
  const ativos = [...doConfig, ...doDia];
  const caixa = $('avisos');
  if (ativos.length && caixa) {
    ativos.forEach(a => {
      const av = el('div', 'av' + (a.cor ? ' ' + a.cor : '')), w = el('div', 'wrap'), p = el('p');
      if (a.titulo) p.append(el('b', '', a.titulo + '.'));
      p.append(document.createTextNode(a.texto || ''));
      w.append(p); av.append(w); caixa.append(av);
    });
    caixa.hidden = false;
  }

  // grade de aulas: tabela no computador, abas por dia no celular.
  // A tabela já vem escrita no HTML (para o Google e as IAs); aqui ela é refeita a partir do config.js.
  const secAulas = $('aulas'), G = CONFIG.grade;
  if (secAulas) {
    if (!G || !Object.keys(G).length) { secAulas.hidden = true; document.querySelector('nav a[href="#aulas"]')?.remove(); }
    else {
      const DIAS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
      const CURTO = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
      const ORDEM = [1,2,3,4,5,6,0];
      const quebra = t => t.replace(/\//g, '/​');

      const tabela = $('grade-table');
      tabela.querySelectorAll('thead, tbody').forEach(x => x.remove());
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

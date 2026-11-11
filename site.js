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

  // faixa das palavras do mural: no celular vira uma faixa que corre (copia escondida do texto para emendar)
  const pil = document.querySelector('.pilares');
  if (pil && matchMedia('(max-width:760px)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
    const tr = pil.querySelector('.track'), ul = tr.querySelector('ul'), cp = ul.cloneNode(true);
    cp.setAttribute('aria-hidden', 'true'); tr.append(cp); pil.classList.add('run');
  }

  // instagram
  document.querySelectorAll('.ig-link').forEach(a => { if (CONFIG.instagram) a.href = CONFIG.instagram; else a.hidden = true; });

  // fotos reais
  const gal = $('fotos');
  if (gal) {
    const slots = document.querySelectorAll('#gallery .ph');
    gal.hidden = !CONFIG.fotos.length;
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
  const BFc = CONFIG.blackFriday;
  const bfOn = !!(BFc && (!BFc.de || hojeStr >= BFc.de) && (!BFc.ate || hojeStr <= BFc.ate));
  document.querySelectorAll('.bf').forEach(x => x.hidden = !bfOn);
  if (bfOn && BFc.ate) {
    const dias = Math.round((Date.parse(BFc.ate + 'T12:00:00Z') - Date.parse(hojeStr + 'T12:00:00Z')) / 864e5);
    const dd = BFc.ate.slice(8, 10) + '/' + BFc.ate.slice(5, 7);
    const txt = dias <= 0 ? 'Último dia: a oferta vale só até hoje.' : dias === 1 ? `Falta 1 dia. A oferta vale até ${dd}.` : `Faltam ${dias} dias. A oferta vale até ${dd}.`;
    document.querySelectorAll('[data-bf-count]').forEach(p => p.textContent = txt);
  }
  const doConfig = (CONFIG.avisos || []).filter(a => (!a.de || hojeStr >= a.de) && (!a.ate || hojeStr <= a.ate));
  const doDia = EX.filter(e => {
    const de = e.avisoDe || new Date(Date.parse(e.data + 'T12:00:00Z') - 5 * 864e5).toISOString().slice(0, 10);
    return hojeStr >= de && hojeStr <= e.data;
  }).map(e => ({
    titulo: e.titulo || (e.abre == null ? 'Feriado' : 'Horário especial'), cor: e.cor,
    texto: (e.abre == null ? 'Dia ' + fmtDia(e.data) + (e.motivo || e.nome ? ', ' + (e.motivo || e.nome) : '') + ': a academia estará fechada. Voltamos no dia seguinte.' : fmtDia(e.data) + (e.motivo || e.nome ? ', ' + (e.motivo || e.nome) : '') + ': funcionamos das ' + e.abre + 'h às ' + e.fecha + 'h.'),
    curto: e.abre == null ? fmtDia(e.data) + (e.nome ? ', ' + e.nome : '') + ': academia fechada' : fmtDia(e.data) + ', ' + e.abre + 'h às ' + e.fecha + 'h'
  }));
  const ativos = [...doConfig, ...doDia];
  const caixa = $('avisos');
  if (ativos.length && caixa) {
    ativos.forEach(a => {
      const av = el('div', 'av' + (a.cor ? ' ' + a.cor : '')), w = el('div', 'wrap'), p = el('p');
      if (a.titulo) p.append(el('b', '', a.titulo + '.'));
      // no celular o aviso cabe numa linha só: mostra "curto" e abre o texto inteiro no toque
      p.append(el('span', 'l', a.texto || ''));
      w.append(p);
      if (a.curto) {
        p.append(el('span', 'c', a.curto));
        const bt = el('button', 'mais', '+'); bt.type = 'button';
        bt.setAttribute('aria-label', 'Ver o aviso completo'); bt.setAttribute('aria-expanded', 'false');
        bt.addEventListener('click', () => { const on = av.classList.toggle('aberto'); bt.textContent = on ? '−' : '+'; bt.setAttribute('aria-expanded', on); });
        w.append(bt);
      } else av.classList.add('sem-curto');
      av.append(w); caixa.append(av);
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


// vídeos: só carregam e tocam quando aparecem na tela; sem movimento para quem pediu menos animação ou economia de dados
(() => {
  const vids = [...document.querySelectorAll('video[data-src]')];
  if (!vids.length) return;
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches || (navigator.connection && navigator.connection.saveData);
  const carrega = v => { if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.load(); } };
  const toca = v => { carrega(v); const p = v.play(); if (p && p.catch) p.catch(() => {}); };
  if (calmo || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (v.closest('[hidden]')) return;
    if (e.isIntersecting) toca(v); else v.pause();
  }), {threshold: 0.35});
  vids.forEach(v => io.observe(v));
})();


// "Qual plano combina com você?" (planos.html)
(() => {
  const box = document.getElementById('quiz-box');
  if (!box || !CONFIG.quiz) return;
  const Q = CONFIG.quiz;
  const WA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.8 14.1c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.8-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .7.5l.9 2.2c.1.2.1.4 0 .6l-.4.6-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.6 2.1 1.1 1 2.1 1.3 2.4 1.4.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l2.1 1c.3.2.5.2.6.4.1.1.1.7-.1 1.4Z"/></svg>';
  const url = msg => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
  const steps = [
    { k: 'foco', t: 'O que você quer treinar?', o: [
      ['musc', 'Musculação', 'No meu ritmo, com ficha individual'],
      ['mh', 'Musculação e aula de Híbrido', 'Ficha individual e força com cardio em aula'],
      ['hc', 'Só aulas: Híbrido e Cross', 'Treino em turma, com o professor guiando'],
      ['gold', 'Tudo, sem limite', 'Musculação, Híbrido e Cross'],
      ['kids', 'É pro meu filho', 'Crianças de 6 a 12 anos'] ] },
    { k: 'per', t: 'Por quanto tempo quer assinar?', o: [
      ['mensal', 'Mensal', 'Pra começar sem compromisso longo'],
      ['trimestral', '3 meses', 'Mensalidade menor que a do mensal'],
      ['semestral', '6 meses', 'A menor mensalidade da maioria dos planos'],
      ['anual', '12 meses', 'Plano anual do Gold'] ] },
    { k: 'obj', t: 'Qual é o seu objetivo?', o: [
      ['emagrecer', 'Emagrecer', ''],
      ['ganhar massa muscular', 'Ganhar massa muscular', ''],
      ['ganhar força e condicionamento', 'Força e condicionamento', ''],
      ['voltar à rotina de treino', 'Voltar a treinar', 'Depois de um tempo parado'],
      ['', 'Ainda não sei', 'A equipe te ajuda a definir'] ] }
  ];
  const ans = {}; let i = 0;
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const seq = () => ans.foco === 'kids' ? [steps[0]] : steps;

  function render() {
    box.replaceChildren();
    const list = seq();
    if (i >= list.length) return result();
    const s = list[i];
    const prog = el('div', 'q-prog');
    list.forEach((_, n) => prog.append(el('i', n <= i ? 'on' : '')));
    box.append(prog, el('p', 'q-n', `Pergunta ${i + 1} de ${steps.length}`), el('h3', 'q-t', s.t));
    const wrap = el('div', 'q-opts');
    s.o.forEach(([v, label, sub]) => {
      if (s.k === 'per' && v === 'anual' && ans.foco !== 'gold') return;
      const b = el('button', 'q-opt'); b.type = 'button';
      b.append(el('span', '', label)); if (sub) b.append(el('small', '', sub));
      b.addEventListener('click', () => { ans[s.k] = v; i++; render(); focusTop(); });
      wrap.append(b);
    });
    box.append(wrap);
    if (i > 0) { const bk = el('button', 'q-back', '← Voltar'); bk.type = 'button'; bk.addEventListener('click', () => { i--; render(); }); box.append(bk); }
  }
  const focusTop = () => { const r = box.getBoundingClientRect(); if (r.top < 0 || r.top > innerHeight * .5) box.scrollIntoView({ block: 'start' }); };

  function result() {
    const card = el('div', 'q-res');
    let msg, titulo, linha, detalhe, alvo;
    if (ans.foco === 'kids') {
      titulo = 'Kids'; linha = 'R$ 150 por mês';
      detalhe = 'Crianças de 6 a 12 anos, terça e quinta, às 17h e 18h, com treino hybrid.';
      msg = 'Oi! Vim pelo site da Fit One e queria saber como matricular meu filho no Kids.'; alvo = '#plan-kids';
    } else {
      const p = Q[ans.foco]; const per = p.per[ans.per] || p.per.semestral;
      const nomePer = p.per[ans.per] ? ans.per : 'semestral';
      titulo = p.nome; linha = per[0]; detalhe = per[1] ? `${per[1]}. ${p.inclui}` : p.inclui;
      msg = `Oi! Vim pelo site da Fit One e quero o plano ${p.nome}, ${nomePer}.` + (ans.obj ? ` Meu objetivo é ${ans.obj}.` : '') + ' Pode me ajudar a começar?';
      alvo = '#plan-' + ans.foco;
    }
    card.append(el('p', 'q-k', 'O plano que mais combina com você'), el('h3', 'q-rt', titulo), el('p', 'q-price', linha), el('p', 'q-d', detalhe));
    if (ans.foco !== 'kids' && !Q[ans.foco].per[ans.per]) card.append(el('p', 'q-note', 'Esse plano não tem a opção que você escolheu. Mostrei a de 6 meses.'));
    const act = el('div', 'q-act');
    const w = el('a', 'btn wa-link'); w.href = url(msg); w.target = '_blank'; w.rel = 'noopener';
    w.dataset.umamiEvent = 'whatsapp_click'; w.dataset.umamiEventLocal = 'quiz-plano';
    w.insertAdjacentHTML('beforeend', WA); w.append(document.createTextNode('Quero esse plano'));
    const d = el('a', 'btn btn-ghost', 'Ver detalhes do plano'); d.href = alvo;
    const r = el('button', 'q-back', 'Refazer'); r.type = 'button'; r.addEventListener('click', () => { for (const k in ans) delete ans[k]; i = 0; render(); });
    act.append(w, d); card.append(act, r); box.append(card);
  }
  render();
})();

/* InovaJur Cortex — comportamento do site
   Sem dependências. Tudo roda no navegador; nada é gravado nem enviado a servidor próprio. */

// ---- ajuste aqui: contato e links -------------------------------------------------
const CONTATO = {
  whatsapp: '5598984003949',            // só dígitos, com 55
  whatsappTexto: '(98) 98400-3949',
  email: 'contato@inovajur.com',
  cadastro: 'https://inovajurcortex.com/?modo=cadastro',
  planos: 'https://inovajurcortex.com/web/plans',   // lista pública de planos do Cortex
};

// Valores conferidos em inovajurcortex.com em 18/11/2026. Se o site estiver no mesmo
// domínio do Cortex, a lista ao vivo substitui estes números sozinha.
let PLANOS = [
  { id: 'free', nome: 'Gratuito', cortices: 1, sources: 3, projects_per_source: 2, memories: 130, price_brl: 0, trial_days: 5 },
  { id: 'aprendiz', nome: 'Mente Aprendiz', cortices: 2, sources: 5, projects_per_source: 5, memories: 5000, price_brl: 54.77, annual_price_brl: 578.37, annual_monthly_brl: 48.2 },
  { id: 'focada', nome: 'Mente Focada', cortices: 3, sources: 7, projects_per_source: 10, memories: 5000, price_brl: 78.29, annual_price_brl: 826.74, annual_monthly_brl: 68.9 },
  { id: 'brilhante', nome: 'Mente Brilhante', cortices: 4, sources: 10, projects_per_source: 20, memories: 5000, price_brl: 108.42, annual_price_brl: 1144.92, annual_monthly_brl: 95.41 },
];
const PARA_QUEM = {
  free: 'Para sentir o córtex funcionando.',
  aprendiz: 'Para quem já vive de notas: dois córtex, trabalho e vida separados.',
  focada: 'Para quem toca várias frentes: três córtex, cada um no seu assunto.',
  brilhante: 'Para muitos projetos, ou uma equipe pequena: quatro córtex.',
};
const RECOMENDADO = 'focada';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reais = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const inteiro = n => n.toLocaleString('pt-BR');
const semMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
// a lista de planos vem de fora: todo texto dela passa por aqui antes de virar HTML
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = v => Number.isFinite(Number(v)) ? Number(v) : 0;
const zap = texto => `https://wa.me/${CONTATO.whatsapp}?text=${encodeURIComponent(texto)}`;

document.documentElement.classList.add('js');

/* quando um elemento entra na tela, roda a função uma vez */
function aoVer(alvo, fn, margem = '0px 0px -12% 0px') {
  if (!alvo) return;
  const o = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { o.unobserve(e.target); fn(e.target); } }), { rootMargin: margem, threshold: .12 });
  [].concat(alvo).forEach(a => o.observe(a));
}

/* ---------- topo, progresso e seção ativa ---------- */
(function topo() {
  const topo = $('#topo'), barra = $('#barra');
  const rola = () => {
    topo.classList.toggle('topo--solida', scrollY > 24);
    const total = document.documentElement.scrollHeight - innerHeight;
    barra.style.transform = `scaleX(${total > 0 ? Math.min(1, scrollY / total) : 0})`;
  };
  addEventListener('scroll', rola, { passive: true }); rola();

  const links = new Map($$('.menu a').map(a => [a.getAttribute('href').slice(1), a]));
  const o = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.classList.remove('ativa'));
    links.get(e.target.id)?.classList.add('ativa');
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => o.observe(s));
})();

/* ---------- entrada ao rolar, com pequeno escalonamento entre irmãos ---------- */
(function entradas() {
  $$('.rola').forEach(el => {
    const irmaos = [...el.parentElement.children].filter(c => c.classList.contains('rola'));
    el.style.setProperty('--i', Math.min(irmaos.indexOf(el), 6));
  });
  aoVer($$('.rola'), el => el.classList.add('visto'));
})();

/* ---------- abertura: o cérebro acompanha o ponteiro ---------- */
(function paralaxe() {
  const cena = $('#inicio'), img = $('.prancha__img img');
  if (!cena || !img || semMovimento || matchMedia('(pointer: coarse)').matches) return;
  cena.addEventListener('pointermove', e => {
    const r = cena.getBoundingClientRect();
    img.style.setProperty('--px', (((e.clientX - r.left) / r.width) - .5) * -22);
    img.style.setProperty('--py', (((e.clientY - r.top) / r.height) - .5) * -16);
  });
  cena.addEventListener('pointerleave', () => { img.style.setProperty('--px', 0); img.style.setProperty('--py', 0); });
})();

/* ---------- § 02: a URL se escreve sozinha ---------- */
(function url() {
  const alvo = $('#url-texto'), estado = $('#url-estado');
  if (!alvo) return;
  const texto = alvo.dataset.texto;
  aoVer($('#url'), () => {
    if (semMovimento) { alvo.textContent = texto; estado.textContent = 'Conectado. Nada para instalar, nada para sincronizar.'; return; }
    let i = 0;
    const t = setInterval(() => {
      alvo.textContent = texto.slice(0, ++i);
      if (i >= texto.length) { clearInterval(t); setTimeout(() => { estado.textContent = 'Conectado. Nada para instalar, nada para sincronizar.'; }, 450); }
    }, 34);
  });
})();

/* ---------- § 03: marcos sobre a tela do painel ---------- */
(function tela() {
  const LEGENDAS = [
    ['Fontes de conhecimento', 'À esquerda ficam as fontes, as hashtags, os backlinks e a busca. O Upload leva arquivos para dentro do córtex.'],
    ['Áreas de especialidade', 'Cada chave liga ou desliga uma área. Com uma ligada, a IA busca só no que está nela.'],
    ['O cérebro', 'As memórias aparecem como pontos de luz, e cada região tem a sua cor.'],
    ['Córtex ou Mapa', 'No rodapé você alterna entre a visão do cérebro e a do mapa, e troca de um córtex para outro.'],
  ];
  const marcos = $$('.marco'), caixa = $('#tela-legenda');
  if (!marcos.length) return;
  let atual = -1, giro = null;
  const mostra = i => {
    atual = i;
    marcos.forEach((m, k) => m.setAttribute('aria-pressed', String(k === i)));
    $('#tela-n').textContent = `${i + 1} / ${LEGENDAS.length}`;
    $('#tela-titulo').textContent = LEGENDAS[i][0];
    $('#tela-texto').textContent = LEGENDAS[i][1];
    caixa.classList.remove('troca'); void caixa.offsetWidth; caixa.classList.add('troca');
  };
  const para = () => { clearInterval(giro); giro = null; };
  marcos.forEach((m, i) => m.addEventListener('click', () => { para(); mostra(i); }));
  mostra(0);
  // passeia sozinho pelos marcos até a pessoa tocar em um
  aoVer($('#tela'), () => { if (!semMovimento) giro = setInterval(() => mostra((atual + 1) % LEGENDAS.length), 4200); });
})();

/* ---------- § 04: números que contam ---------- */
(function contas() {
  aoVer($$('[data-conta]'), el => {
    const fim = Number(el.dataset.conta);
    if (semMovimento || fim === 0) { el.textContent = inteiro(fim); return; }
    const dur = 1300, t0 = performance.now();
    const passo = t => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = inteiro(Math.round(fim * e));
      if (p < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }, '0px 0px -8% 0px');
})();

/* ---------- § 04: JSON × TOON ---------- */
(function toon() {
  const CODIGO = {
    json: `[
  {
    "n": 1,
    "id": "7f3a91c2",
    "titulo": "Orçamento do lançamento",
    "caminho": "Marketing / Lançamento",
    "tokens": 1240
  },
  {
    "n": 2,
    "id": "b84e07d1",
    "titulo": "Reunião com o fornecedor",
    "caminho": "Marketing / Lançamento / Atas",
    "tokens": 860
  },
  {
    "n": 3,
    "id": "2c9d5e40",
    "titulo": "Custos da campanha",
    "caminho": "Financeiro / 2026",
    "tokens": 610
  }
]`,
    toon: `#memoria
n(int) id(str) titulo(str) caminho(str) tokens(int)
1 | 7f3a91c2 | Orçamento do lançamento | Marketing / Lançamento | 1240
2 | b84e07d1 | Reunião com o fornecedor | Marketing / Lançamento / Atas | 860
3 | 2c9d5e40 | Custos da campanha | Financeiro / 2026 | 610`,
  };
  const caixa = $('#codigo'), abas = $$('#toon [role="tab"]');
  if (!caixa) return;
  const mostra = f => {
    abas.forEach(a => a.setAttribute('aria-selected', String(a.dataset.formato === f)));
    caixa.textContent = CODIGO[f];
    if (f === 'toon') {   // realça o cabeçalho, que é onde está a economia
      const [l1, l2, ...resto] = CODIGO.toon.split('\n');
      caixa.innerHTML = `<span class="c">${l1}</span>\n<span class="k">${l2}</span>\n${resto.join('\n')}`;
    }
    caixa.classList.remove('troca'); void caixa.offsetWidth; caixa.classList.add('troca');
  };
  abas.forEach(a => a.addEventListener('click', () => mostra(a.dataset.formato)));
  mostra('toon');
})();

/* ---------- § 05: áreas que ligam e desligam ---------- */
(function areas() {
  const svg = $('#pontos'), chips = $('#chips');
  if (!svg) return;
  // córtex de exemplo de um escritório: 412 memórias em seis áreas
  const AREAS = [
    { id: 'civel', nome: 'Cível', n: 132, c: [180, 140], r: 92, cor: '#F2B35E' },
    { id: 'trabalhista', nome: 'Trabalhista', n: 96, c: [352, 108], r: 78, cor: '#7FB0FF' },
    { id: 'tributario', nome: 'Tributário', n: 54, c: [500, 150], r: 60, cor: '#C792EA' },
    { id: 'administrativo', nome: 'Administrativo', n: 38, c: [228, 290], r: 52, cor: '#7BE0B5' },
    { id: 'clientes', nome: 'Clientes', n: 47, c: [372, 268], r: 58, cor: '#FF9A85' },
    { id: 'modelos', nome: 'Modelos de peças', n: 45, c: [512, 286], r: 56, cor: '#9FD8F2' },
  ];
  const TOTAL = AREAS.reduce((s, a) => s + a.n, 0);
  const ligadas = new Set();
  let tocou = false;

  // sorteio com semente fixa: o desenho é o mesmo a cada visita
  let semente = 20261118;
  const sorteia = () => { semente |= 0; semente = semente + 0x6D2B79F5 | 0; let t = Math.imul(semente ^ semente >>> 15, 1 | semente); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const NS = 'http://www.w3.org/2000/svg';
  AREAS.forEach(a => {
    const g = document.createElementNS(NS, 'g'); g.dataset.area = a.id;
    for (let i = 0; i < a.n; i++) {
      const ang = sorteia() * Math.PI * 2, raio = a.r * Math.sqrt(sorteia());
      const p = document.createElementNS(NS, 'circle');
      p.setAttribute('cx', (a.c[0] + Math.cos(ang) * raio * 1.12).toFixed(1));
      p.setAttribute('cy', (a.c[1] + Math.sin(ang) * raio * .86).toFixed(1));
      p.setAttribute('r', (1.6 + sorteia() * 2.4).toFixed(1));
      g.appendChild(p);
    }
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', a.c[0]); t.setAttribute('y', a.c[1] + 6); t.setAttribute('text-anchor', 'middle'); t.textContent = a.nome;
    g.appendChild(t); svg.appendChild(g);

    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.dataset.area = a.id; b.style.setProperty('--cor', a.cor);
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = `<i></i>${a.nome} <small>${a.n}</small>`;
    b.addEventListener('click', () => { tocou = true; alterna(a.id); });
    chips.appendChild(b);
  });

  const lista = nomes => nomes.length < 2 ? nomes.join('') : nomes.slice(0, -1).join(', ') + ' e ' + nomes.at(-1);
  function pinta() {
    const alguma = ligadas.size > 0;
    AREAS.forEach(a => {
      const on = ligadas.has(a.id), g = $(`g[data-area="${a.id}"]`, svg);
      $$('circle', g).forEach(c => { c.style.fill = alguma ? (on ? a.cor : '#3A435C') : '#B8C2D8'; c.style.opacity = alguma ? (on ? 1 : .32) : .72; });
      $('text', g).style.opacity = alguma ? (on ? 1 : .28) : .8;
      $(`.chip[data-area="${a.id}"]`).setAttribute('aria-pressed', String(on));
    });
    const dentro = AREAS.filter(a => ligadas.has(a.id));
    const soma = dentro.reduce((s, a) => s + a.n, 0);
    $('#leitura').innerHTML = alguma
      ? `A IA busca só em ${lista(dentro.map(a => a.nome))}: <b>${soma} de ${TOTAL}</b> memórias. O resto não entra no contexto.`
      : `Nenhuma área ligada: a IA enxerga o córtex inteiro, <b>${TOTAL}</b> memórias.`;
    $('#fracao').style.transform = `scaleX(${alguma ? soma / TOTAL : 1})`;
  }
  function alterna(id) { ligadas.has(id) ? ligadas.delete(id) : ligadas.add(id); pinta(); }
  pinta();
  // demonstra sozinho uma vez, se a pessoa ainda não mexeu
  aoVer($('#areas .campo'), () => { if (!semMovimento) setTimeout(() => { if (!tocou) alterna('civel'); }, 900); });
})();

/* ---------- § 08: planos e simulador ---------- */
(function planos() {
  const lista = $('#lista-planos');
  if (!lista) return;
  let ciclo = 'anual';   // o anual é o plano em destaque
  const curto = p => String(p.nome).replace(/^Mente /, '');

  function cartao(p) {
    const pago = num(p.price_brl) > 0, anual = ciclo === 'anual' && num(p.annual_price_brl) > 0;
    // no anual, o número grande é o total do ano; o equivalente mensal vem embaixo
    const preco = !pago ? 'Grátis' : reais(num(anual ? p.annual_price_brl : p.price_brl));
    const sufixo = !pago ? `por ${num(p.trial_days) || 5} dias` : (anual ? 'por ano' : 'por mês');
    const extra = !pago ? 'sem cartão' : (anual ? `equivale a ${reais(num(p.annual_monthly_brl))} por mês` : (num(p.annual_price_brl) ? `ou ${reais(num(p.annual_price_brl))} por ano` : ''));
    const cerebros = num(p.cortices), porCerebro = num(p.memories);
    const destaque = p.id === RECOMENDADO;
    return `<article class="plano${destaque ? ' plano--destaque' : ''}">
      ${destaque ? '<span class="plano__selo">Mais escolhido</span>' : ''}
      <p class="plano__nome">${esc(p.nome)}</p>
      <p class="plano__preco">${preco}<small>${sufixo}</small></p>
      <p class="plano__extra">${extra}</p>
      <p class="plano__para">${PARA_QUEM[p.id] || ''}</p>
      <ul class="plano__itens">
        <li><span>Cérebros (córtex)</span><b>${inteiro(cerebros)}</b></li>
        <li><span>Fontes de conhecimento</span><b>${inteiro(num(p.sources))}</b></li>
        <li><span>Projetos por fonte</span><b>${inteiro(num(p.projects_per_source))}</b></li>
        <li><span>Memórias por cérebro</span><b>${inteiro(porCerebro)}</b></li>
        <li class="plano__total"><span>Total de memórias</span><b>${inteiro(cerebros * porCerebro)}</b></li>
      </ul>
      <a class="plano__acao" href="${CONTATO.cadastro}" rel="noopener">${pago ? 'Assinar ' + esc(curto(p)) : 'Começar grátis'} <span aria-hidden="true">→</span></a>
    </article>`;
  }
  const desenha = () => { lista.innerHTML = PLANOS.map(cartao).join(''); };

  $$('.ciclo button').forEach(b => b.addEventListener('click', () => {
    ciclo = b.dataset.ciclo;
    $$('.ciclo button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    desenha();
  }));

  // ----- simulador -----
  const campo = $('#pessoas'), caixaPlano = $('#sim-plano');
  const pagos = () => PLANOS.filter(p => num(p.price_brl) > 0);
  function opcoes() {
    const marcado = $('input[name="sim-plano"]:checked')?.value || RECOMENDADO;
    $$('label', caixaPlano).forEach(l => l.remove());
    pagos().forEach(p => {
      const l = document.createElement('label');
      l.innerHTML = `<input type="radio" name="sim-plano" value="${esc(p.id)}"${p.id === marcado ? ' checked' : ''}><span>${esc(curto(p))}</span>`;
      caixaPlano.appendChild(l);
    });
  }
  let resumo = '';
  function calcula() {
    const n = Math.min(500, Math.max(1, parseInt(campo.value, 10) || 1));
    const p = PLANOS.find(x => x.id === ($('input[name="sim-plano"]:checked')?.value || RECOMENDADO)) || pagos()[0];
    const anual = $('input[name="sim-ciclo"]:checked').value === 'anual' && num(p.annual_price_brl) > 0;
    const gente = `${n} ${n === 1 ? 'pessoa' : 'pessoas'}`;
    const economia = num(p.annual_price_brl) ? n * (num(p.price_brl) * 12 - num(p.annual_price_brl)) : 0;
    const total = anual ? n * num(p.annual_price_brl) : n * num(p.price_brl);
    $('#sim-total').textContent = reais(total);
    $('#sim-sub').textContent = `${anual ? 'por ano' : 'por mês'}, para ${gente} no ${p.nome}`;
    const linhas = anual
      ? [['Por pessoa, por ano', reais(num(p.annual_price_brl))], ['Equivale por pessoa, por mês', reais(num(p.annual_monthly_brl))], ['Memórias por pessoa', `${inteiro(num(p.cortices))} × ${inteiro(num(p.memories))} = ${inteiro(num(p.cortices) * num(p.memories))}`], ['Economia sobre o mensal, por ano', reais(economia)]]
      : [['Por pessoa, por mês', reais(num(p.price_brl))], ['Memórias por pessoa', `${inteiro(num(p.cortices))} × ${inteiro(num(p.memories))} = ${inteiro(num(p.cortices) * num(p.memories))}`], ['Em doze meses', reais(total * 12)], ['No anual, você economiza por ano', reais(economia)]];
    $('#sim-linhas').innerHTML = linhas.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('');
    resumo = `Olá! Quero uma proposta do InovaJur Cortex.\n• ${gente}\n• Plano: ${p.nome}\n• Pagamento: ${anual ? 'anual' : 'mensal'}\n• Total estimado: ${reais(total)} por ${anual ? 'ano' : 'mês'}`;
    $('#sim-whats').href = zap(resumo);
  }
  campo.addEventListener('input', calcula);
  campo.addEventListener('blur', () => { campo.value = Math.min(500, Math.max(1, parseInt(campo.value, 10) || 1)); calcula(); });
  $$('.passo-n button').forEach(b => b.addEventListener('click', () => { campo.value = Math.min(500, Math.max(1, (parseInt(campo.value, 10) || 1) + Number(b.dataset.passo))); calcula(); }));
  $('#simulador').addEventListener('change', calcula);
  $('#sim-copiar').addEventListener('click', async e => {
    const b = e.currentTarget, antes = b.textContent;
    try { await navigator.clipboard.writeText(resumo); b.textContent = 'Resumo copiado'; }
    catch { b.textContent = 'Não deu para copiar'; }
    setTimeout(() => { b.textContent = antes; }, 1800);
  });

  desenha(); opcoes(); calcula();

  // lista ao vivo do Cortex: o servidor só responde a páginas do próprio domínio,
  // então fora dele ficam os valores acima, sem tentativa (e sem erro no console)
  const origem = $('#origem-planos');
  if (!/(^|\.)inovajurcortex\.com$/.test(location.hostname)) { origem.innerHTML = '<b>Valores</b> de inovajurcortex.com, conferidos em 18/11/2026.'; return; }
  fetch(CONTATO.planos, { signal: AbortSignal.timeout(4000) })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(d => {
      const vivos = (d?.plans || []).filter(p => !p.enterprise && p.nome);
      if (vivos.length < 2) return;
      PLANOS = vivos; desenha(); opcoes(); calcula();
      $('#origem-planos').innerHTML = '<b>Valores ao vivo</b> de inovajurcortex.com.';
    })
    .catch(() => { $('#origem-planos').innerHTML = '<b>Valores</b> de inovajurcortex.com, conferidos em 18/11/2026.'; });
})();

/* ---------- § 09: pedido de proposta vira mensagem pronta ---------- */
(function pedido() {
  const f = $('#pedido');
  if (!f) return;
  const erro = $('#pedido-erro');
  function monta() {
    const d = new FormData(f), nome = (d.get('nome') || '').trim(), perg = (d.get('perguntas') || '').trim();
    if (!nome || !perg) { erro.textContent = 'Informe o seu nome e pelo menos uma pergunta.'; erro.hidden = false; (!nome ? f.nome : f.perguntas).focus(); return null; }
    erro.hidden = true;
    const org = (d.get('org') || '').trim(), dados = d.getAll('dados');
    return `Olá! Sou ${nome}${org ? ', de ' + org : ''}. Quero uma proposta do Córtex para Empresas.\n\nO que queremos perguntar:\n${perg}${dados.length ? '\n\nOnde estão os dados: ' + dados.join(', ') + '.' : ''}`;
  }
  f.addEventListener('submit', e => { e.preventDefault(); const m = monta(); if (m) window.open(zap(m), '_blank', 'noopener'); });
  $('#pedido-email').addEventListener('click', () => { const m = monta(); if (m) location.href = `mailto:${CONTATO.email}?subject=${encodeURIComponent('Proposta do Córtex para Empresas')}&body=${encodeURIComponent(m)}`; });
})();

/* ---------- contatos e miudezas ---------- */
(function miudezas() {
  $$('[data-cadastro]').forEach(a => { a.href = CONTATO.cadastro; });
  const oi = zap('Olá! Quero saber mais sobre o InovaJur Cortex.');
  $('#fecho-whats').href = oi;
  const w = $('#rodape-whats'); w.href = oi; w.textContent = `WhatsApp ${CONTATO.whatsappTexto}`;
  const m = $('#rodape-email'); m.href = `mailto:${CONTATO.email}`; m.textContent = CONTATO.email;
  $('#ano').textContent = new Date().getFullYear();
})();

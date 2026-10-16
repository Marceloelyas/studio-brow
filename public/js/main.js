/* =========================================================
   Site público · Studio Brow
   ========================================================= */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const fmtBRL = (v) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/* ---------- Ano dinâmico ---------- */
$('#year').textContent = new Date().getFullYear();

/* ---------- Menu mobile ---------- */
const navToggle = $('#navToggle');
const navLinks  = $('#navLinks');

navToggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(open));
});

$$('#navLinks a').forEach((a) =>
  a.addEventListener('click', () => navLinks.classList.remove('is-open'))
);

/* ---------- Reveal on scroll ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);

$$('.reveal').forEach((el) => revealObserver.observe(el));

/* ---------- Contadores animados ---------- */
function animarContador(el) {
  const alvo = Number(el.dataset.count) || 0;
  const duracao = 1400;
  const inicio = performance.now();

  function passo(now) {
    const p = Math.min((now - inicio) / duracao, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(alvo * eased).toLocaleString('pt-BR');
    if (p < 1) requestAnimationFrame(passo);
  }
  requestAnimationFrame(passo);
}

const contadorObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animarContador(e.target);
        contadorObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.4 }
);

$$('[data-count]').forEach((el) => contadorObserver.observe(el));

/* ---------- Carrega serviços da API ---------- */
async function carregarServicos() {
  const grid = $('#servicesGrid');
  if (!grid) return;

  try {
    const servicos = await API.get('/services');
    if (!servicos.length) {
      grid.innerHTML = `<p class="muted">Nenhum serviço cadastrado ainda.</p>`;
      return;
    }

    grid.innerHTML = servicos.map((s) => `
      <article class="card reveal">
        <div class="card__icon">✂️</div>
        <h3>${s.name}</h3>
        <p class="muted">${s.description || ''}</p>
        <p class="card__price">${fmtBRL(s.price)}</p>
        <small class="muted">${s.duration_minutes} min</small>
      </article>
    `).join('');

    $$('.reveal', grid).forEach((el) => revealObserver.observe(el));
  } catch (err) {
    grid.innerHTML = `<p class="muted">Erro ao carregar serviços.</p>`;
    console.error(err);
  }
}

/* ---------- Portfólio (placeholder local) ---------- */
const portfolioMock = [
  { id: 1, title: 'Design natural',     categoria: 'Design',    img: 'https://picsum.photos/seed/brow1/600/450' },
  { id: 2, title: 'Henna suave',        categoria: 'Henna',     img: 'https://picsum.photos/seed/brow2/600/450' },
  { id: 3, title: 'Lamination',         categoria: 'Lamination',img: 'https://picsum.photos/seed/brow3/600/450' },
  { id: 4, title: 'Design + Henna',     categoria: 'Design',    img: 'https://picsum.photos/seed/brow4/600/450' },
  { id: 5, title: 'Design marcado',     categoria: 'Design',    img: 'https://picsum.photos/seed/brow5/600/450' },
  { id: 6, title: 'Lamination suave',   categoria: 'Lamination',img: 'https://picsum.photos/seed/brow6/600/450' },
];

let filtroAtual = 'Todos';

function renderizarPortfolio() {
  const grid = $('#portfolioGrid');
  if (!grid) return;

  const lista = filtroAtual === 'Todos'
    ? portfolioMock
    : portfolioMock.filter((p) => p.categoria === filtroAtual);

  grid.innerHTML = lista.map((p) => `
    <figure class="portfolio__item" data-id="${p.id}">
      <img src="${p.img}" alt="${p.title}" loading="lazy">
      <figcaption>
        <strong>${p.title}</strong><br>
        <small class="muted">${p.categoria}</small>
      </figcaption>
    </figure>
  `).join('');
}

function renderizarFiltros() {
  const wrap = $('#filters');
  if (!wrap) return;

  const categorias = ['Todos', ...new Set(portfolioMock.map((p) => p.categoria))];

  wrap.innerHTML = categorias.map((c) => `
    <button class="${c === filtroAtual ? 'is-active' : ''}" data-cat="${c}">${c}</button>
  `).join('');

  wrap.querySelectorAll('button').forEach((b) =>
    b.addEventListener('click', () => {
      filtroAtual = b.dataset.cat;
      renderizarFiltros();
      renderizarPortfolio();
    })
  );
}

/* ---------- Formulário de contato ---------- */
const form = $('#contactForm');
const statusEl = $('#formStatus');
const submitBtn = $('#submitBtn');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = '';
  statusEl.className = 'form__status';

  $$('.error').forEach((el) => (el.textContent = ''));

  const dados = {
    name:    form.name.value.trim(),
    email:   form.email.value.trim(),
    phone:   form.phone.value.trim(),
    subject: form.subject.value,
    message: form.message.value.trim(),
  };

  let valido = true;
  if (!dados.name) { $('[data-error-for="name"]').textContent = 'Informe seu nome'; valido = false; }
  if (!/^\S+@\S+\.\S+$/.test(dados.email)) { $('[data-error-for="email"]').textContent = 'E-mail inválido'; valido = false; }
  if (!dados.phone) { $('[data-error-for="phone"]').textContent = 'Informe um telefone'; valido = false; }
  if (dados.message.length < 10) { $('[data-error-for="message"]').textContent = 'Mensagem muito curta'; valido = false; }
  if (!valido) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando…';

  try {
    await API.post('/contact-messages', dados);
    statusEl.textContent = 'Mensagem enviada! Entraremos em contato em breve.';
    statusEl.classList.add('is-success');
    form.reset();
  } catch (err) {
    statusEl.textContent = err.message || 'Erro ao enviar. Tente novamente.';
    statusEl.classList.add('is-error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Solicitar agendamento';
  }
});

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  carregarServicos();
  renderizarFiltros();
  renderizarPortfolio();
});

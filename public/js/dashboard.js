/* =========================================================
   Dashboard · Studio Brow
   ========================================================= */

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const state = { view: 'overview' };

/* ---------- Formatadores ---------- */
const fmtBRL = (v) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtDateTime = (iso) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR') : '—';

/* =========================================================
   NAVEGAÇÃO ENTRE VIEWS
   ========================================================= */
const viewTitles = {
  overview:    'Visão geral',
  agenda:      'Agenda',
  clientes:    'Clientes',
  servicos:    'Serviços',
  faturamento: 'Faturamento',
  mensagens:   'Mensagens',
};

function setView(view) {
  state.view = view;

  $$('.sidebar__link').forEach((el) =>
    el.classList.toggle('is-active', el.dataset.view === view)
  );

  $$('.view').forEach((el) =>
    el.classList.toggle('is-active', el.dataset.view === view)
  );

  $('#viewTitle').textContent = viewTitles[view] || 'Dashboard';
  $('#sidebar')?.classList.remove('is-open');

  loadView(view);
}

async function loadView(view) {
  try {
    switch (view) {
      case 'overview':    return await loadOverview();
      case 'agenda':      return await loadAgenda();
      case 'clientes':    return await loadClientes();
      case 'servicos':    return await loadServicos();
      case 'faturamento': return await loadFaturamento();
      case 'mensagens':   return await loadMensagens();
    }
  } catch (err) {
    console.error(err);
  }
}

/* =========================================================
   VISÃO GERAL
   ========================================================= */
async function loadOverview() {
  const [resumo, agendaHoje, ranking] = await Promise.all([
    API.get('/dashboard'),
    API.get('/dashboard/agenda-hoje'),
    API.get('/dashboard/servicos-mais-vendidos'),
  ]);

  $('#kpiHoje').textContent        = resumo.agendamentos_hoje ?? 0;
  $('#kpiPendentes').textContent   = resumo.agendamentos_pendentes ?? 0;
  $('#kpiFaturamento').textContent = fmtBRL(resumo.faturamento_mes);
  $('#kpiClientes').textContent    = resumo.total_clientes ?? 0;

  $('#hojeData').textContent =
    new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

  const tb = $('#tblAgendaHoje');
  if (!agendaHoje.length) {
    tb.innerHTML = `<tr><td colspan="4" class="muted">Nenhum agendamento para hoje.</td></tr>`;
  } else {
    tb.innerHTML = agendaHoje.map((a) => `
      <tr>
        <td>${new Date(a.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
        <td>${a.cliente}</td>
        <td>${a.servico}</td>
        <td><span class="status status--${a.status}">${a.status}</span></td>
      </tr>
    `).join('');
  }

  const rank = $('#rankServicos');
  rank.innerHTML = ranking.length
    ? ranking.map((s) => `<li><span>${s.name}</span><strong>${s.total}</strong></li>`).join('')
    : `<li class="muted">Sem dados ainda.</li>`;

  await renderizarGraficos();
}

/* =========================================================
   AGENDA
   ========================================================= */
async function loadAgenda() {
  const status = $('#filtroStatus')?.value || '';
  const lista = await API.get(`/appointments${status ? `?status=${status}` : ''}`);
  const tb = $('#tblAgenda');

  if (!lista.length) {
    tb.innerHTML = `<tr><td colspan="6" class="muted">Nenhum agendamento encontrado.</td></tr>`;
    return;
  }

  tb.innerHTML = lista.map((a) => `
    <tr>
      <td>${fmtDateTime(a.scheduled_at)}</td>
      <td>${a.client_name}</td>
      <td>${a.client_phone || '—'}</td>
      <td>${a.service_name}</td>
      <td><span class="status status--${a.status}">${a.status}</span></td>
      <td>
        <button class="btn btn--ghost btn--xs" data-action="status"  data-id="${a.id}">Status</button>
        <button class="btn btn--ghost btn--xs" data-action="editar"  data-id="${a.id}">Editar</button>
        <button class="btn btn--ghost btn--xs" data-action="excluir" data-id="${a.id}">Excluir</button>
      </td>
    </tr>
  `).join('');

  tb.querySelectorAll('[data-action="status"]').forEach((b) =>
    b.addEventListener('click', () => abrirModalStatus(b.dataset.id))
  );
  tb.querySelectorAll('[data-action="editar"]').forEach((b) =>
    b.addEventListener('click', () => abrirModalAgendamento(b.dataset.id))
  );
  tb.querySelectorAll('[data-action="excluir"]').forEach((b) =>
    b.addEventListener('click', async () => {
      if (confirm('Excluir este agendamento?')) {
        await API.delete(`/appointments/${b.dataset.id}`);
        loadAgenda();
        loadOverview();
      }
    })
  );
}

/* =========================================================
   CLIENTES
   ========================================================= */
async function loadClientes(busca = '') {
  const lista = await API.get(`/clients${busca ? `?q=${encodeURIComponent(busca)}` : ''}`);
  const tb = $('#tblClientes');

  if (!lista.length) {
    tb.innerHTML = `<tr><td colspan="5" class="muted">Nenhuma cliente cadastrada.</td></tr>`;
    return;
  }

  tb.innerHTML = lista.map((c) => `
    <tr>
      <td>${c.name}</td>
      <td>${c.phone}</td>
      <td>${c.email || '—'}</td>
      <td>${fmtDate(c.created_at)}</td>
      <td>
        <button class="btn btn--ghost btn--xs" data-action="editar"    data-id="${c.id}">Editar</button>
        <button class="btn btn--ghost btn--xs" data-action="historico" data-id="${c.id}">Histórico</button>
        <button class="btn btn--ghost btn--xs" data-action="excluir"   data-id="${c.id}">Excluir</button>
      </td>
    </tr>
  `).join('');

  tb.querySelectorAll('[data-action="editar"]').forEach((b) =>
    b.addEventListener('click', () => abrirModalCliente(b.dataset.id))
  );
  tb.querySelectorAll('[data-action="historico"]').forEach((b) =>
    b.addEventListener('click', () => abrirHistoricoCliente(b.dataset.id))
  );
  tb.querySelectorAll('[data-action="excluir"]').forEach((b) =>
    b.addEventListener('click', async () => {
      if (confirm('Excluir esta cliente? Essa ação não pode ser desfeita.')) {
        await API.delete(`/clients/${b.dataset.id}`);
        loadClientes();
      }
    })
  );
}

/* =========================================================
   SERVIÇOS
   ========================================================= */
async function loadServicos() {
  const lista = await API.get('/services?all=1');
  const grid = $('#cardsServicos');

  grid.innerHTML = lista.map((s) => `
    <article class="service-card">
      <h3>${s.name}</h3>
      <p>${s.description || ''}</p>
      <div class="price">${fmtBRL(s.price)}</div>
      <small class="muted">${s.duration_minutes} min</small>
      <div style="margin-top:12px;display:flex;gap:6px">
        <button class="btn btn--ghost btn--xs" data-action="editar"  data-id="${s.id}">Editar</button>
        <button class="btn btn--ghost btn--xs" data-action="excluir" data-id="${s.id}">Desativar</button>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('[data-action="editar"]').forEach((b) =>
    b.addEventListener('click', () => abrirModalServico(b.dataset.id))
  );
  grid.querySelectorAll('[data-action="excluir"]').forEach((b) =>
    b.addEventListener('click', async () => {
      if (confirm('Desativar este serviço?')) {
        await API.delete(`/services/${b.dataset.id}`);
        loadServicos();
      }
    })
  );
}

/* =========================================================
   FATURAMENTO
   ========================================================= */
async function loadFaturamento() {
  const [mensal, recentes] = await Promise.all([
    API.get('/dashboard/faturamento-mensal'),
    API.get('/payments?limit=20'),
  ]);

  const lista = $('#listaFaturamento');
  lista.innerHTML = mensal.length
    ? mensal.map((m) => `
        <li>
          <span>${new Date(m.mes).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
          <strong>${fmtBRL(m.total)}</strong>
        </li>
      `).join('')
    : `<li class="muted">Sem dados.</li>`;

  const tb = $('#tblPagamentos');
  tb.innerHTML = recentes.length
    ? recentes.map((p) => `
        <tr>
          <td>${p.paid_at ? fmtDate(p.paid_at) : '—'}</td>
          <td>${p.client_name || '—'}</td>
          <td>${fmtBRL(p.amount)}</td>
          <td>${p.method}</td>
          <td><span class="status status--${p.status}">${p.status}</span></td>
        </tr>
      `).join('')
    : `<tr><td colspan="5" class="muted">Nenhum pagamento registrado.</td></tr>`;
}

/* =========================================================
   MENSAGENS
   ========================================================= */
async function loadMensagens() {
  const lista = await API.get('/contact-messages');
  const ul = $('#listaMensagens');

  const naoLidas = lista.filter((m) => !m.read).length;
  const badge = $('#badgeMsgs');
  if (naoLidas > 0) {
    badge.hidden = false;
    badge.textContent = naoLidas;
  } else {
    badge.hidden = true;
  }

  ul.innerHTML = lista.length
    ? lista.map((m) => `
        <li class="message-item ${m.read ? '' : 'is-unread'}">
          <header>
            <strong>${m.name}</strong>
            <small>${fmtDateTime(m.created_at)}</small>
          </header>
          <p><strong>Assunto:</strong> ${m.subject || '—'}</p>
          <p>${m.message}</p>
          <p class="muted small">${m.email} · ${m.phone || 'sem telefone'}</p>
        </li>
      `).join('')
    : `<li class="muted">Nenhuma mensagem recebida.</li>`;
}

/* =========================================================
   GRÁFICOS
   ========================================================= */
let chartFaturamento, chartServicos;

const CHART_COLORS = {
  roxo:    'rgba(139,92,246,.85)',
  ciano:   'rgba(34,211,238,.85)',
  verde:   'rgba(34,197,94,.85)',
  amarelo: 'rgba(250,204,21,.85)',
  rosa:    'rgba(236,72,153,.85)',
};

async function renderizarGraficos() {
  const [mensal, ranking] = await Promise.all([
    API.get('/dashboard/faturamento-mensal'),
    API.get('/dashboard/servicos-mais-vendidos'),
  ]);

  const ultimos = mensal.slice(0, 6).reverse();

  if (chartFaturamento) chartFaturamento.destroy();
  chartFaturamento = new Chart(document.getElementById('chartFaturamento'), {
    type: 'line',
    data: {
      labels: ultimos.map((m) =>
        new Date(m.mes).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      ),
      datasets: [{
        label: 'Faturamento (R$)',
        data: ultimos.map((m) => Number(m.total)),
        borderColor: CHART_COLORS.roxo,
        backgroundColor: 'rgba(139,92,246,.15)',
        fill: true,
        tension: .35,
        pointBackgroundColor: CHART_COLORS.ciano,
        pointRadius: 4,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#c4c4cc' } } },
      scales: {
        x: { ticks: { color: '#9a9aa8' }, grid: { color: 'rgba(255,255,255,.05)' } },
        y: {
          ticks: {
            color: '#9a9aa8',
            callback: (v) => 'R$ ' + v.toLocaleString('pt-BR'),
          },
          grid: { color: 'rgba(255,255,255,.05)' },
        },
      },
    },
  });

  if (chartServicos) chartServicos.destroy();
  chartServicos = new Chart(document.getElementById('chartServicos'), {
    type: 'doughnut',
    data: {
      labels: ranking.map((s) => s.name),
      datasets: [{
        data: ranking.map((s) => Number(s.total)),
        backgroundColor: [
          CHART_COLORS.roxo, CHART_COLORS.ciano, CHART_COLORS.verde,
          CHART_COLORS.amarelo, CHART_COLORS.rosa,
        ],
        borderColor: 'rgba(0,0,0,.2)',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#c4c4cc', padding: 14 } },
      },
    },
  });
}

/* =========================================================
   MODAIS
   ========================================================= */
function abrirModal(html) {
  $('#dashModalBody').innerHTML = html;
  $('#dashModal').hidden = false;
}

function fecharModal() {
  $('#dashModal').hidden = true;
  $('#dashModalBody').innerHTML = '';
}

/* ---------- Alterar status ---------- */
async function abrirModalStatus(id) {
  abrirModal(`
    <h3>Alterar status</h3>
    <p class="muted">Selecione o novo status do agendamento.</p>
    <select id="novoStatus" class="input" style="width:100%;margin:12px 0">
      <option value="agendado">Agendado</option>
      <option value="confirmado">Confirmado</option>
      <option value="concluido">Concluído</option>
      <option value="cancelado">Cancelado</option>
      <option value="faltou">Faltou</option>
    </select>
    <button class="btn btn--primary btn--block" id="confirmarStatus">Salvar</button>
  `);

  $('#confirmarStatus').addEventListener('click', async () => {
    const status = $('#novoStatus').value;
    await API.patch(`/appointments/${id}/status`, { status });
    fecharModal();
    loadAgenda();
    loadOverview();
  });
}

/* ---------- Histórico cliente ---------- */
async function abrirHistoricoCliente(id) {
  const dados = await API.get(`/clients/${id}/appointments`);
  abrirModal(`
    <h3>Histórico da cliente</h3>
    <div class="table-wrap" style="margin-top:12px">
      <table class="table">
        <thead><tr><th>Data</th><th>Serviço</th><th>Status</th></tr></thead>
        <tbody>
          ${dados.map((a) => `
            <tr>
              <td>${fmtDateTime(a.scheduled_at)}</td>
              <td>${a.service_name}</td>
              <td><span class="status status--${a.status}">${a.status}</span></td>
            </tr>
          `).join('') || `<tr><td colspan="3" class="muted">Sem agendamentos.</td></tr>`}
        </tbody>
      </table>
    </div>
  `);
}

/* ---------- Cliente: novo / editar ---------- */
async function abrirModalCliente(id = null) {
  let c = { name: '', email: '', phone: '', birth_date: '', notes: '' };
  if (id) c = await API.get(`/clients/${id}`);

  abrirModal(`
    <h3>${id ? 'Editar cliente' : 'Nova cliente'}</h3>
    <form id="formCliente" class="form" style="margin-top:12px">
      <div class="field">
        <label>Nome *</label>
        <input class="input" name="name" required value="${c.name || ''}">
      </div>
      <div class="field-row">
        <div class="field">
          <label>Telefone *</label>
          <input class="input" name="phone" required value="${c.phone || ''}">
        </div>
        <div class="field">
          <label>E-mail</label>
          <input class="input" type="email" name="email" value="${c.email || ''}">
        </div>
      </div>
      <div class="field">
        <label>Data de nascimento</label>
        <input class="input" type="date" name="birth_date" value="${c.birth_date?.slice(0,10) || ''}">
      </div>
      <div class="field">
        <label>Observações</label>
        <textarea class="input" name="notes" rows="3">${c.notes || ''}</textarea>
      </div>
      <button class="btn btn--primary btn--block" type="submit">Salvar</button>
    </form>
  `);

  $('#formCliente').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    if (id) await API.put(`/clients/${id}`, data);
    else    await API.post('/clients', data);
    fecharModal();
    loadClientes();
  });
}

/* ---------- Agendamento: novo / editar ---------- */
async function abrirModalAgendamento(id = null) {
  const [clientes, servicos, profissionais] = await Promise.all([
    API.get('/clients'),
    API.get('/services'),
    API.get('/professionals'),
  ]);

  let ag = { client_id: '', service_id: '', professional_id: '', scheduled_at: '', notes: '', status: 'agendado' };
  if (id) ag = await API.get(`/appointments/${id}`);

  abrirModal(`
    <h3>${id ? 'Editar agendamento' : 'Novo agendamento'}</h3>
    <form id="formAgendamento" class="form" style="margin-top:12px">
      <div class="field">
        <label>Cliente *</label>
        <select class="input" name="client_id" required>
          <option value="">Selecione…</option>
          ${clientes.map((c) => `<option value="${c.id}" ${c.id===ag.client_id?'selected':''}>${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Serviço *</label>
        <select class="input" name="service_id" required>
          <option value="">Selecione…</option>
          ${servicos.map((s) => `<option value="${s.id}" ${s.id===ag.service_id?'selected':''}>${s.name} — ${fmtBRL(s.price)}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Profissional</label>
        <select class="input" name="professional_id">
          <option value="">—</option>
          ${profissionais.map((p) => `<option value="${p.id}" ${p.id===ag.professional_id?'selected':''}>${p.name}</option>`).join('')}
        </select>
      </div>
      <div class="field-row">
        <div class="field">
          <label>Data/Hora *</label>
          <input class="input" type="datetime-local" name="scheduled_at" required
                 value="${ag.scheduled_at ? new Date(ag.scheduled_at).toISOString().slice(0,16) : ''}">
        </div>
        <div class="field">
          <label>Status</label>
          <select class="input" name="status">
            ${['agendado','confirmado','concluido','cancelado','faltou']
              .map((s) => `<option value="${s}" ${s===ag.status?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="field">
        <label>Observações</label>
        <textarea class="input" name="notes" rows="3">${ag.notes || ''}</textarea>
      </div>
      <button class="btn btn--primary btn--block" type="submit">Salvar</button>
    </form>
  `);

  $('#formAgendamento').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    data.professional_id = data.professional_id || null;
    if (id) await API.put(`/appointments/${id}`, data);
    else    await API.post('/appointments', data);
    fecharModal();
    loadAgenda();
    loadOverview();
  });
}

/* ---------- Serviço: novo / editar ---------- */
async function abrirModalServico(id = null) {
  let s = { name: '', description: '', price: '', duration_minutes: '' };
  if (id) s = await API.get(`/services/${id}`);

  abrirModal(`
    <h3>${id ? 'Editar serviço' : 'Novo serviço'}</h3>
    <form id="formServico" class="form" style="margin-top:12px">
      <div class="field">
        <label>Nome *</label>
        <input class="input" name="name" required value="${s.name || ''}">
      </div>
      <div class="field">
        <label>Descrição</label>
        <textarea class="input" name="description" rows="2">${s.description || ''}</textarea>
      </div>
      <div class="field-row">
        <div class="field">
          <label>Preço (R$) *</label>
          <input class="input" type="number" step="0.01" name="price" required value="${s.price || ''}">
        </div>
        <div class="field">
          <label>Duração (min) *</label>
          <input class="input" type="number" name="duration_minutes" required value="${s.duration_minutes || ''}">
        </div>
      </div>
      <button class="btn btn--primary btn--block" type="submit">Salvar</button>
    </form>
  `);

  $('#formServico').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    if (id) await API.put(`/services/${id}`, data);
    else    await API.post('/services', data);
    fecharModal();
    loadServicos();
  });
}

/* ---------- Registrar pagamento ---------- */
async function abrirModalPagamento(appointmentId, valorSugerido) {
  abrirModal(`
    <h3>Registrar pagamento</h3>
    <p class="muted">Informe o valor e o método utilizado.</p>
    <form id="formPagamento" class="form" style="margin-top:12px">
      <div class="field">
        <label>Valor (R$) *</label>
        <input class="input" type="number" step="0.01" min="0"
               name="amount" required value="${valorSugerido.toFixed(2)}">
      </div>
      <div class="field">
        <label>Método *</label>
        <select class="input" name="method" required>
          <option value="pix">Pix</option>
          <option value="dinheiro">Dinheiro</option>
          <option value="credito">Cartão de crédito</option>
          <option value="debito">Cartão de débito</option>
          <option value="transferencia">Transferência</option>
        </select>
      </div>
      <div class="field">
        <label>Status</label>
        <select class="input" name="status">
          <option value="pago" selected>Pago</option>
          <option value="pendente">Pendente</option>
        </select>
      </div>
      <button class="btn btn--primary btn--block" type="submit">Salvar pagamento</button>
    </form>
  `);

  $('#formPagamento').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    data.appointment_id = appointmentId;
    data.amount = Number(data.amount);

    try {
      await API.post('/payments', data);
      fecharModal();
      alert('Pagamento registrado com sucesso!');
      // Se estiver na tela de faturamento, atualiza. Senão, não faz nada.
      if (state.view === 'faturamento') loadFaturamento();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  });
}
/* =========================================================
   EVENTOS
   ========================================================= */
function initEventos() {
  $$('.sidebar__link').forEach((el) =>
    el.addEventListener('click', (e) => {
      e.preventDefault();
      setView(el.dataset.view);
    })
  );

  $('#sidebarToggle')?.addEventListener('click', () =>
    $('#sidebar').classList.toggle('is-open')
  );

  document.addEventListener('click', (e) => {
    if (e.target.matches('[data-close-modal]')) fecharModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharModal();
  });

  $('#filtroStatus')?.addEventListener('change', loadAgenda);

  let debounce;
  $('#buscaCliente')?.addEventListener('input', (e) => {
    clearTimeout(debounce);
    debounce = setTimeout(() => loadClientes(e.target.value), 300);
  });

  $('#btnNovoCliente')?.addEventListener('click', () => abrirModalCliente());
  $('#btnNovoAgendamento')?.addEventListener('click', () => abrirModalAgendamento());
  $('#btnNovoServico')?.addEventListener('click', () => abrirModalServico());

  $('#btnMarcarLidas')?.addEventListener('click', async () => {
    await API.patch('/contact-messages/read-all');
    loadMensagens();
  });

  $('#logoutBtn')?.addEventListener('click', async () => {
    try {
      await API.post('/auth/logout');
    } finally {
      window.location.href = '/login.html';
    }
  });
}

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */
async function init() {
  try {
    const me = await API.get('/auth/me');
    $('#userName').textContent = me.name;
    $('#userRole').textContent = me.role === 'admin' ? 'Administrador' : 'Profissional';
    $('#userInitials').textContent = me.name.charAt(0).toUpperCase();
  } catch {
    window.location.href = '/login.html';
    return;
  }

  initEventos();
  setView('overview');
}

document.addEventListener('DOMContentLoaded', init);

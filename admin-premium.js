if (sessionStorage.getItem('mk_admin_auth') !== 'ok') location.href = 'admin-login.html';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const money = (v) => MKStore.BRL.format(Number(v || 0));
const pages = {
  dashboard: 'Dashboard',
  produtos: 'Produtos',
  promocoes: 'Promocoes',
  pedidos: 'Pedidos',
  mesas: 'Mesas / QR Code',
  config: 'Configuracoes'
};

function orderType(order) {
  return order?.tipoPedido || order?.tipo || 'retirada';
}

function typeLabel(order) {
  return {
    delivery: 'Delivery',
    mesa: 'Mesa',
    retirada: 'Retirada'
  }[orderType(order)] || 'Retirada';
}

function orderInfo(order) {
  return order?.dadosPedido || {};
}

function orderPhone(order) {
  return order.telefone || orderInfo(order).telefone || '';
}

function orderTable(order) {
  return order.mesa || orderInfo(order).numeroMesa || '';
}

function orderPickupTime(order) {
  return orderInfo(order).horarioRetirada || order.horarioRetirada || '';
}

function orderNotes(order) {
  return orderInfo(order).observacaoPedido || orderInfo(order).observacao || order.observacao || '';
}

function formatAddress(order) {
  const info = orderInfo(order);
  const endereco = info.endereco;
  if (endereco) {
    const linha = [endereco.rua, endereco.numero, endereco.bairro].filter(Boolean).join(', ');
    const extra = [endereco.complemento, endereco.pontoReferencia].filter(Boolean).join(' | ');
    if (linha && extra) return `${linha} | ${extra}`;
    if (linha) return linha;
    if (extra) return extra;
  }
  return order.endereco || '';
}

function orderDetailsHtml(order) {
  const detalhes = [];
  const phone = orderPhone(order);
  const tipo = orderType(order);

  if (phone) detalhes.push(`<small>Telefone: ${phone}</small>`);

  if (tipo === 'delivery') {
    const endereco = formatAddress(order);
    if (endereco) detalhes.push(`<small>Endereco: ${endereco}</small>`);
  }

  if (tipo === 'retirada') {
    const retirada = orderPickupTime(order);
    if (retirada) detalhes.push(`<small>Retirada: ${retirada}</small>`);
  }

  const obs = orderNotes(order);
  if (obs) detalhes.push(`<small>Obs: ${obs}</small>`);

  return detalhes.join('<br>');
}

function buildOrderPrintText(order) {
  const tipo = orderType(order);
  const mesa = orderTable(order);
  const phone = orderPhone(order);
  const endereco = formatAddress(order);
  const retirada = orderPickupTime(order);
  const obs = orderNotes(order);

  const lines = [
    '========================',
    `Pedido #${order.codigo || order.id}`,
    `Tipo: ${typeLabel(order)}${mesa ? ` | Mesa ${mesa}` : ''}`,
    `Cliente: ${order.cliente || 'Cliente'}`
  ];

  if (phone) lines.push(`Telefone: ${phone}`);
  if (tipo === 'delivery' && endereco) lines.push(`Endereco: ${endereco}`);
  if (tipo === 'retirada' && retirada) lines.push(`Retirada: ${retirada}`);
  if (obs) lines.push(`Obs: ${obs}`);

  lines.push('------------------------');
  lines.push(...(order.itens || []));
  lines.push('------------------------');
  lines.push(`Total: ${money(order.total)}`);
  lines.push('========================');

  return lines.join('\n');
}

$('#logout').onclick = () => {
  sessionStorage.removeItem('mk_admin_auth');
  location.href = 'admin-login.html';
};

$('#menu-toggle').onclick = () => $('#sidebar').classList.toggle('open');

$$('.nav-btn').forEach((btn) => {
  btn.onclick = () => {
    $$('.nav-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    $$('.page').forEach((p) => p.classList.remove('active'));
    $('#'+btn.dataset.page).classList.add('active');
    $('#page-title').textContent = pages[btn.dataset.page];
    $('#sidebar').classList.remove('open');
    renderAll();
  };
});

function renderDashboard() {
  const m = MKStore.metrics();
  $('#fat-hoje').textContent = money(m.faturamentoHoje);
  $('#fat-semana').textContent = money(m.faturamentoSemana);
  $('#fat-mes').textContent = money(m.faturamentoMes);
  $('#ticket-medio').textContent = money(m.ticketMedio);
  $('#pedidos-hoje-mini').textContent = `${m.pedidosHoje} pedidos`;

  const values = [
    { n: 'Hoje', v: m.faturamentoHoje },
    { n: 'Semana', v: m.faturamentoSemana },
    { n: 'Mes', v: m.faturamentoMes }
  ];
  const max = Math.max(...values.map((x) => x.v), 1);

  $('#sales-bars').innerHTML = values
    .map((x) => `<div class="bar-row"><strong>${x.n}</strong><div class="bar"><span style="width:${Math.max(4, (x.v / max) * 100)}%"></span></div><span>${money(x.v)}</span></div>`)
    .join('');

  $('#top-products').innerHTML = m.top.length
    ? m.top.map(([n, q]) => `<div class="top-item"><strong>${n}</strong><span class="badge">${q} vendidos</span></div>`).join('')
    : '<p class="muted">Ainda nao ha vendas suficientes.</p>';
}

function renderProducts() {
  const products = MKStore.products();
  $('#products-table').innerHTML = products
    .map((p) => `
      <div class="row">
        <div>
          <strong>${p.nome}</strong><br>
          <small>${p.categoria || 'Sem categoria'} | ${p.disponivel !== false ? 'Disponivel' : 'Indisponivel'}</small>
        </div>
        <strong>${money(p.preco)}</strong>
        <span class="badge">${p.destaque ? 'Destaque' : 'Normal'}</span>
        <div class="row-actions">
          <button class="ghost" onclick="editProduct('${p.id}')">Editar</button>
          <button class="ghost" onclick="toggleProduct('${p.id}')">${p.disponivel !== false ? 'Desativar' : 'Ativar'}</button>
          <button class="danger" onclick="deleteProduct('${p.id}')">Excluir</button>
        </div>
      </div>
    `)
    .join('');
}

$('#new-product').onclick = () => {
  $('#product-form').classList.remove('hidden');
  $('#product-form').reset();
  $('#product-id').value = '';
  $('#product-active').checked = true;
};

$('#cancel-product').onclick = () => $('#product-form').classList.add('hidden');

$('#product-form').onsubmit = (e) => {
  e.preventDefault();
  const list = MKStore.products();
  const id = $('#product-id').value || MKStore.uid('P');
  const data = {
    id,
    nome: $('#product-name').value.trim(),
    categoria: $('#product-category').value.trim(),
    preco: Number($('#product-price').value),
    imagem: $('#product-image').value.trim() || 'img/hamb.gourmet.jpg',
    descricao: $('#product-desc').value.trim(),
    disponivel: $('#product-active').checked,
    destaque: $('#product-featured').checked
  };
  const i = list.findIndex((p) => p.id === id);
  if (i >= 0) list[i] = data;
  else list.push(data);
  MKStore.saveProducts(list);
  $('#product-form').classList.add('hidden');
  renderProducts();
  alert('Produto salvo. Ele aparecera no cardapio do cliente ao recarregar a pagina.');
};

window.editProduct = (id) => {
  const p = MKStore.products().find((x) => x.id === id);
  if (!p) return;
  $('#product-form').classList.remove('hidden');
  $('#product-id').value = p.id;
  $('#product-name').value = p.nome;
  $('#product-category').value = p.categoria || '';
  $('#product-price').value = p.preco;
  $('#product-image').value = p.imagem || '';
  $('#product-desc').value = p.descricao || '';
  $('#product-active').checked = p.disponivel !== false;
  $('#product-featured').checked = !!p.destaque;
};

window.toggleProduct = (id) => {
  const list = MKStore.products();
  const p = list.find((x) => x.id === id);
  p.disponivel = p.disponivel === false;
  MKStore.saveProducts(list);
  renderProducts();
};

window.deleteProduct = (id) => {
  if (!confirm('Excluir produto?')) return;
  MKStore.saveProducts(MKStore.products().filter((p) => p.id !== id));
  renderProducts();
};

function renderPromos() {
  const promos = MKStore.promos();
  $('#promos-table').innerHTML = promos
    .map((p) => `
      <div class="row">
        <div><strong>${p.titulo}</strong><br><small>${p.descricao || ''}</small></div>
        <strong>${p.desconto || 0}%</strong>
        <span class="badge">${p.ativo ? 'Ativa' : 'Pausada'}</span>
        <div class="row-actions">
          <button class="ghost" onclick="editPromo('${p.id}')">Editar</button>
          <button class="danger" onclick="deletePromo('${p.id}')">Excluir</button>
        </div>
      </div>
    `)
    .join('');
}

$('#new-promo').onclick = () => {
  $('#promo-form').classList.remove('hidden');
  $('#promo-form').reset();
  $('#promo-id').value = '';
  $('#promo-active').checked = true;
};

$('#cancel-promo').onclick = () => $('#promo-form').classList.add('hidden');

$('#promo-form').onsubmit = (e) => {
  e.preventDefault();
  const list = MKStore.promos();
  const id = $('#promo-id').value || MKStore.uid('PR');
  const data = {
    id,
    titulo: $('#promo-title').value.trim(),
    descricao: $('#promo-desc').value.trim(),
    desconto: Number($('#promo-discount').value || 0),
    ativo: $('#promo-active').checked
  };
  const i = list.findIndex((p) => p.id === id);
  if (i >= 0) list[i] = data;
  else list.push(data);
  MKStore.savePromos(list);
  $('#promo-form').classList.add('hidden');
  renderPromos();
};

window.editPromo = (id) => {
  const p = MKStore.promos().find((x) => x.id === id);
  if (!p) return;
  $('#promo-form').classList.remove('hidden');
  $('#promo-id').value = p.id;
  $('#promo-title').value = p.titulo;
  $('#promo-desc').value = p.descricao || '';
  $('#promo-discount').value = p.desconto || 0;
  $('#promo-active').checked = !!p.ativo;
};

window.deletePromo = (id) => {
  if (!confirm('Excluir promocao?')) return;
  MKStore.savePromos(MKStore.promos().filter((p) => p.id !== id));
  renderPromos();
};

function renderOrders() {
  const list = MKStore.orders().slice().reverse();
  $('#orders-table').innerHTML = list.length
    ? list
      .map((o) => {
        const mesa = orderTable(o);
        const details = orderDetailsHtml(o);
        return `
          <div class="row order">
            <div>
              <strong>Pedido #${o.codigo || o.id}</strong><br>
              <small>${typeLabel(o)} ${mesa ? `| Mesa ${mesa}` : ''} | ${new Date(o.criadoEm || o.id).toLocaleString('pt-BR')}</small>
              ${details ? `<br>${details}` : ''}
            </div>
            <strong>${money(o.total)}</strong>
            <span class="badge">${o.status}</span>
            <div class="row-actions">
              <button class="ghost" onclick="printOrder('${o.id}')">Imprimir</button>
              <button class="ghost" onclick="advanceOrder('${o.id}')">Avancar</button>
            </div>
          </div>
        `;
      })
      .join('')
    : '<p class="muted">Nenhum pedido ainda.</p>';
}

window.advanceOrder = (id) => {
  const list = MKStore.orders();
  const o = list.find((x) => String(x.id) === String(id));
  if (!o) return;

  const flow = ['recebidos', 'preparando', 'pronto', 'entrega', 'finalizado'];
  o.status = flow[Math.min(flow.indexOf(o.status) + 1, flow.length - 1)] || 'recebidos';
  o.atualizadoEm = new Date().toISOString();

  if (o.status === 'pronto') {
    MKStore.notifyClient(o, `Seu pedido #${o.codigo || o.id} esta pronto!`);
  }

  MKStore.saveOrders(list);
  renderAll();
};

window.printOrder = (id) => {
  const o = MKStore.orders().find((x) => String(x.id) === String(id));
  if (!o) return;
  const w = window.open('', '', 'width=360,height=600');
  if (!w) {
    alert('Nao foi possivel abrir a janela de impressao. Verifique se o bloqueador de pop-up esta ativo.');
    return;
  }
  w.document.write(`<pre style="font:16px monospace">${buildOrderPrintText(o)}</pre>`);
  w.print();
};

$('#clear-finalized').onclick = () => {
  if (confirm('Remover pedidos finalizados?')) {
    MKStore.saveOrders(MKStore.orders().filter((o) => o.status !== 'finalizado'));
    renderOrders();
    renderDashboard();
  }
};

function renderTables() {
  const cfg = MKStore.config();
  const base = location.href.replace(/admin\.html.*/, 'index.html');
  $('#tables-list').innerHTML = Array.from({ length: Number(cfg.mesas || 12) }, (_, i) => {
    const mesa = String(i + 1).padStart(2, '0');
    const link = `${base}?mesa=${mesa}`;
    return `<div class="qr-card"><strong>Mesa ${mesa}</strong><code>${link}</code><button class="ghost" onclick="navigator.clipboard.writeText('${link}')">Copiar link</button></div>`;
  }).join('');
}

function renderConfig() {
  const c = MKStore.config();
  $('#cfg-loja').value = c.loja || '';
  $('#cfg-user').value = c.usuario || 'admin';
  $('#cfg-pass').value = c.senha || '123456';
  $('#cfg-mesas').value = c.mesas || 12;
}

$('#config-form').onsubmit = (e) => {
  e.preventDefault();
  MKStore.saveConfig({
    loja: $('#cfg-loja').value,
    usuario: $('#cfg-user').value,
    senha: $('#cfg-pass').value,
    mesas: Number($('#cfg-mesas').value || 12)
  });
  alert('Configuracoes salvas.');
  renderTables();
};

function renderAll() {
  renderDashboard();
  renderProducts();
  renderPromos();
  renderOrders();
  renderTables();
  renderConfig();
}

renderAll();
setInterval(renderAll, 3000);



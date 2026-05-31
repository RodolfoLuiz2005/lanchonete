(() => {
    const statusFlow = ['recebidos', 'preparando', 'entrega', 'finalizado'];

    function readOrders() {
        try {
            return JSON.parse(localStorage.getItem('mk_pedidos') || '[]');
        } catch (error) {
            return [];
        }
    }

    function saveOrders(orders) {
        localStorage.setItem('mk_pedidos', JSON.stringify(orders));
    }

    function money(value) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
            .format(Number(value || 0));
    }

    function nextStatus(current) {
        const index = statusFlow.indexOf(current);
        if (index < 0) return statusFlow[0];
        return statusFlow[Math.min(index + 1, statusFlow.length - 1)];
    }

    function clearColumns() {
        ['recebidos', 'preparando', 'entrega', 'finalizado'].forEach((id) => {
            const col = document.getElementById(id);
            if (!col) return;

            const cards = col.querySelectorAll('.pedido-card');
            cards.forEach((card) => card.remove());
        });
    }

    function renderKpis(orders) {
        const now = new Date();
        const pedidosHoje = orders.filter((order) => {
            const date = new Date(order.criadoEm || order.id || Date.now());
            return date.getDate() === now.getDate() &&
                date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear();
        }).length;

        const entregas = orders.filter((order) => order.status === 'entrega' || order.status === 'finalizado').length;

        const pedidosHojeEl = document.getElementById('pedidos-hoje');
        const entregasEl = document.getElementById('entregas');
        if (pedidosHojeEl) pedidosHojeEl.textContent = String(pedidosHoje);
        if (entregasEl) entregasEl.textContent = String(entregas);
    }

    function renderOrders() {
        const orders = readOrders();
        clearColumns();
        renderKpis(orders);

        const sorted = orders.slice().sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
        sorted.forEach((order) => {
            const status = statusFlow.includes(order.status) ? order.status : 'recebidos';
            const col = document.getElementById(status);
            if (!col) return;

            const card = document.createElement('article');
            card.className = 'pedido-card';

            const items = (order.itens || []).map((item) => `<li>${item}</li>`).join('');
            card.innerHTML = `
                <strong>#${order.codigo || order.id}</strong>
                <p><strong>Cliente:</strong> ${order.cliente || 'Cliente'}</p>
                <p><strong>Total:</strong> ${money(order.total)}</p>
                <ul>${items}</ul>
                ${status !== 'finalizado' ? '<button type="button" class="btn-avancar">Avancar</button>' : ''}
            `;

            const advanceButton = card.querySelector('.btn-avancar');
            if (advanceButton) {
                advanceButton.addEventListener('click', () => {
                    const list = readOrders();
                    const target = list.find((item) => String(item.id) === String(order.id));
                    if (!target) return;
                    target.status = nextStatus(target.status);
                    target.atualizadoEm = new Date().toISOString();
                    saveOrders(list);
                    renderOrders();
                });
            }

            col.appendChild(card);
        });
    }

    const clearButton = document.getElementById('btn-limpar-finalizados');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            const filtered = readOrders().filter((order) => order.status !== 'finalizado');
            saveOrders(filtered);
            renderOrders();
        });
    }

    window.addEventListener('storage', (event) => {
        if (event.key === 'mk_pedidos') {
            renderOrders();
        }
    });

    renderOrders();
    setInterval(renderOrders, 3000);
})();

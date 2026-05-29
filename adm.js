let pedidos =
JSON.parse(
    localStorage.getItem('mk_pedidos')
) || [];

// Renderiza os pedidos
function renderPedidos() {

    document.getElementById('recebidos').innerHTML =
        '<h2>Recebidos</h2>';

    document.getElementById('preparando').innerHTML =
        '<h2>Preparando</h2>';

    document.getElementById('entrega').innerHTML =
        '<h2>Entrega</h2>';

    document.getElementById('finalizado').innerHTML = `
        <div class="column-header">
            <h2>Finalizado</h2>

            <button id="btn-limpar-finalizados">
                Limpar
            </button>
        </div>
    `;

    pedidos.forEach(pedido => {

        const card = document.createElement('div');

        card.classList.add('order-card');

        card.innerHTML = `
            <h3>Pedido #${pedido.id}</h3>

            <p>
                <strong>Cliente:</strong>
                ${pedido.cliente}
            </p>

            <p>
                <strong>Itens:</strong>
            </p>

            <ul>
                ${pedido.itens
                    .map(item => `<li>${item}</li>`)
                    .join('')}
            </ul>

            <strong>
                R$ ${pedido.total.toFixed(2)}
            </strong>

            ${
                pedido.status !== 'finalizado'
                ? `
                    <button
                        onclick="moverPedido(${pedido.id})">
                        Avançar
                    </button>
                `
                : ''
            }
        `;

        document
            .getElementById(pedido.status)
            .appendChild(card);
    });

    // Botão limpar finalizados
    const btnLimpar = document.getElementById(
        'btn-limpar-finalizados'
    );

    btnLimpar.addEventListener('click', () => {

        const confirmar = confirm(
            'Deseja remover todos os pedidos finalizados?'
        );

        if (!confirmar) return;

        for (
            let i = pedidos.length - 1;
            i >= 0;
            i--
        ) {

            if (
                pedidos[i].status === 'finalizado'
            ) {
                pedidos.splice(i, 1);
            }

        }

        localStorage.setItem(
            'mk_pedidos',
            JSON.stringify(pedidos)
        );

        renderPedidos();
    });

    atualizarDashboard();
}

// Move pedido entre colunas
function moverPedido(id) {

    const pedido = pedidos.find(
        p => p.id === id
    );

    if (!pedido) return;

    switch (pedido.status) {

        case "recebidos":
            pedido.status = "preparando";
            break;

        case "preparando":
            pedido.status = "entrega";
            break;

        case "entrega":
            pedido.status = "finalizado";
            break;
    }

    localStorage.setItem(
        'mk_pedidos',
        JSON.stringify(pedidos)
    );

    renderPedidos();
}

// Disponibiliza para o onclick
window.moverPedido = moverPedido;

// Atualiza dashboard
function atualizarDashboard() {

    document
        .getElementById('pedidos-hoje')
        .textContent = pedidos.length;

    const total = pedidos.reduce(
        (acc, p) => acc + p.total,
        0
    );

    document
        .getElementById('faturamento')
        .textContent =
        `R$ ${total.toFixed(2)}`;

    const entregas = pedidos.filter(
        p => p.status === "finalizado"
    ).length;

    document
        .getElementById('entregas')
        .textContent = entregas;
}

// Inicializa
renderPedidos();

// Atualiza automaticamente a cada 3 segundos
setInterval(() => {

    pedidos =
    JSON.parse(
        localStorage.getItem('mk_pedidos')
    ) || [];

    renderPedidos();

}, 3000);

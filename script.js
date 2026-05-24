const btnMenu = document.getElementById('btn-menu')
const menu = document.getElementById('menu')
const overlay = document.getElementById('overlay-menu')
const btnFechar = document.getElementById('btn-fechar')

btnMenu.addEventListener('click', () => {
    menu.classList.add('abrir-menu')
})

btnFechar.addEventListener('click', () => {
    menu.classList.remove('abrir-menu')
})

overlay.addEventListener('click', () => {
    menu.classList.remove('abrir-menu')
})




/* Delivery Button */
const btnDelivery = document.getElementById('btn-delivery')
const inputEndereco = document.getElementById('input-endereco')

    if(btnDelivery && inputEndereco){
    btnDelivery.addEventListener('click', () => {
        inputEndereco.classList.toggle('ativo')
    })
    }


    // Modal de produto
    const productCards = document.querySelectorAll('section.main-cards .interface > a');
    const modal = document.getElementById('product-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalPrice = document.getElementById('modal-price');
    const qtyDecrease = document.getElementById('qty-decrease');
    const qtyIncrease = document.getElementById('qty-increase');
    const qtyValue = document.getElementById('qty-value');
    const addToCartBtn = document.getElementById('add-to-cart');
    const cartCount = document.getElementById('cart-count');
    const cartButton = document.getElementById('btn-carrinho');
    const cartPanel = document.getElementById('cart-panel');
    const cartPanelOverlay = document.getElementById('cart-panel-overlay');
    const cartClose = document.getElementById('cart-close');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const finalizeButton = document.getElementById('btn-finalize');

    let currentQty = 1;
    let currentProduct = null;

    function formatPrice(value) {
        return 'R$ ' + value.toFixed(2).replace('.', ',');
    }

    function parsePrice(priceText) {
        if (!priceText) return 0;
        const cleaned = priceText.replace(/[^0-9,\.]/g, '').replace(/\./g, '').replace(/,/g, '.');
        return parseFloat(cleaned) || 0;
    }

    function getCart() {
        return JSON.parse(localStorage.getItem('mk_cart') || '[]');
    }

    function saveCart(cart) {
        localStorage.setItem('mk_cart', JSON.stringify(cart));
    }

    function updateCartCount() {
        if (!cartCount) return;
        const cart = getCart();
        const totalQty = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
        cartCount.textContent = totalQty;
    }

    function getProductFromCard(card) {
        const title = card.querySelector('.card-info h2')?.textContent.trim() || '';
        const desc = card.querySelector('.card-info p')?.textContent.trim() || '';
        const priceText = card.querySelector('.card-info h4')?.textContent.trim() || 'R$ 0,00';
        const price = parsePrice(priceText);
        const img = card.querySelector('img')?.src || '';
        return {title, desc, price, img};
    }

    function addToCart(product, qty = 1) {
        const cart = getCart();
        const existing = cart.find(item => item.title === product.title);
        if (existing) {
            existing.qty += qty;
        } else {
            cart.push({
                title: product.title,
                desc: product.desc,
                price: product.price,
                qty: qty
            });
        }
        saveCart(cart);
        updateCartCount();
    }

    function renderCart() {
        const cart = getCart();
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Carrinho vazio</p>';
            cartTotal.textContent = 'R$ 0,00';
            return;
        }

        let total = 0;
        cart.forEach((item, index) => {
            const subtotal = item.price * item.qty;
            total += subtotal;
            const card = document.createElement('div');
            card.className = 'cart-item';
            card.innerHTML = `
                <button class="cart-item-remove" type="button" aria-label="Remover item">×</button>
                <h3>${item.title}</h3>
                <span>Qtd: ${item.qty}</span>
                <span>Subtotal: ${formatPrice(subtotal)}</span>
            `;
            const removeButton = card.querySelector('.cart-item-remove');
            removeButton.addEventListener('click', () => {
                removeFromCart(index);
            });
            cartItemsContainer.appendChild(card);
        });
        cartTotal.textContent = formatPrice(total);
    }

    function removeFromCart(index) {
        const cart = getCart();
        cart.splice(index, 1);
        saveCart(cart);
        updateCartCount();
        renderCart();
    }

    function finalizeOrder() {
        const cart = getCart();
        if (cart.length === 0) {
            alert('Carrinho vazio. Adicione produtos antes de finalizar.');
            return;
        }
        saveCart([]);
        updateCartCount();
        renderCart();
        closeCartPanel();
        alert('Pedido finalizado! Obrigado pela compra.');
    }

    function openCart() {
        renderCart();
        cartPanel.classList.add('active');
        cartPanelOverlay.classList.add('active');
        cartPanel.removeAttribute('hidden');
        cartPanelOverlay.removeAttribute('hidden');
        cartPanel.setAttribute('aria-hidden', 'false');
    }

    function closeCartPanel() {
        cartPanel.classList.remove('active');
        cartPanelOverlay.classList.remove('active');
        cartPanel.setAttribute('hidden', '');
        cartPanelOverlay.setAttribute('hidden', '');
        cartPanel.setAttribute('aria-hidden', 'true');
    }

    function openModal(product) {
        currentProduct = product;
        currentQty = 1;
        modalImage.src = product.img;
        modalTitle.textContent = product.title;
        modalDesc.textContent = product.desc;
        modalPrice.textContent = formatPrice(product.price);
        qtyValue.textContent = currentQty;
        modal.classList.add('active');
        modalOverlay.classList.add('active');
        modal.removeAttribute('hidden');
        modalOverlay.removeAttribute('hidden');
        modal.setAttribute('aria-hidden', 'false');
    }

    function closeModal() {
        modal.classList.remove('active');
        modalOverlay.classList.remove('active');
        modal.setAttribute('hidden', '');
        modalOverlay.setAttribute('hidden', '');
        modal.setAttribute('aria-hidden', 'true');
        currentProduct = null;
    }

    productCards.forEach(card => {
        card.addEventListener('click', (event) => {
            event.preventDefault();
            openModal(getProductFromCard(card));
        });
    });

    updateCartCount();

    cartButton.addEventListener('click', () => {
        openCart();
    });
    cartClose.addEventListener('click', closeCartPanel);
    cartPanelOverlay.addEventListener('click', closeCartPanel);
    finalizeButton.addEventListener('click', finalizeOrder);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (cartPanel.classList.contains('active')) {
                closeCartPanel();
            }
            if (modal.classList.contains('active')) {
                closeModal();
            }
        }
    });

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    qtyDecrease.addEventListener('click', () => {
        if (currentQty > 1) {
            currentQty -= 1;
            qtyValue.textContent = currentQty;
        }
    });

    qtyIncrease.addEventListener('click', () => {
        currentQty += 1;
        qtyValue.textContent = currentQty;
    });

    addToCartBtn.addEventListener('click', () => {
        if (!currentProduct) return;

        addToCart(currentProduct, currentQty);
        closeModal();
        alert(`${currentQty} x ${currentProduct.title} adicionado ao carrinho`);
    });





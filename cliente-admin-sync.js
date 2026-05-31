(function(){
  function money(v){ return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v||0)); }
  function injectAdminProducts(){
    const wrap = document.querySelector('section.main-cards .interface');
    if(!wrap || !window.MKStore) return;
    const products = MKStore.products().filter(p=>p.disponivel !== false);
    if(!products.length) return;
    const title = document.createElement('h2');
    title.id = 'produtos-admin';
    title.textContent = 'Produtos cadastrados no painel:';
    wrap.appendChild(title);
    products.forEach(p=>{
      const a = document.createElement('a');
      a.href = '#';
      a.dataset.category = (p.categoria || '').toLowerCase();
      a.className = p.destaque ? 'produto-destaque-admin' : '';
      a.innerHTML = `<img src="${p.imagem || 'img/hamb.gourmet.jpg'}" alt="${p.nome}">
        <div class="card-info"><h2>${p.nome}</h2><p>${p.descricao || ''}</p><h4>${money(p.preco)}</h4></div>`;
      wrap.appendChild(a);
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectAdminProducts);
  else injectAdminProducts();
})();

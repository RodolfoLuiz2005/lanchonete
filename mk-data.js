(function(){
  const BRL = new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
  const todayISO = () => new Date().toISOString();
  const uid = (prefix='MK') => `${prefix}${Date.now().toString().slice(-6)}${Math.floor(Math.random()*90+10)}`;
  const read = (key, fallback=[]) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch(e){ return fallback; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const defaultProducts = [
    {id:'P001', nome:'X-Burger', descricao:'Pão, hambúrguer, queijo, salada e molho especial.', categoria:'Hambúrguer', preco:24.9, imagem:'img/hamb.gourmet.jpg', disponivel:true, destaque:true},
    {id:'P002', nome:'Batata Frita G', descricao:'Batata crocante grande para compartilhar.', categoria:'Acompanhamentos', preco:18.9, imagem:'img/hamb.gourmet.jpg', disponivel:true, destaque:false},
    {id:'P003', nome:'Coca-Cola 2L', descricao:'Refrigerante gelado.', categoria:'Bebidas', preco:12.0, imagem:'img/hamb.gourmet.jpg', disponivel:true, destaque:false}
  ];
  const defaultPromos = [
    {id:'PR001', titulo:'Combo Casal', descricao:'2 X-Burger + Batata + Refrigerante', desconto:10, ativo:true}
  ];
  function seed(){
    if(!localStorage.getItem('mk_produtos')) write('mk_produtos', defaultProducts);
    if(!localStorage.getItem('mk_promocoes')) write('mk_promocoes', defaultPromos);
    if(!localStorage.getItem('mk_config')) write('mk_config', {loja:'MK Lanchonete', usuario:'admin', senha:'123456', mesas:12});
  }
  seed();
  function products(){ return read('mk_produtos', defaultProducts); }
  function saveProducts(list){ write('mk_produtos', list); }
  function promos(){ return read('mk_promocoes', defaultPromos); }
  function savePromos(list){ write('mk_promocoes', list); }
  function orders(){ return read('mk_pedidos', []); }
  function saveOrders(list){ write('mk_pedidos', list); window.dispatchEvent(new Event('mk-orders-updated')); }
  function config(){ return read('mk_config', {loja:'MK Lanchonete', usuario:'admin', senha:'123456', mesas:12}); }
  function saveConfig(cfg){ write('mk_config', cfg); }
  function orderTotal(order){ return Number(order.total || 0); }
  function isSameDay(date, ref = new Date()){
    const d = new Date(date || Date.now());
    return d.getFullYear()===ref.getFullYear() && d.getMonth()===ref.getMonth() && d.getDate()===ref.getDate();
  }
  function sameWeek(date){
    const d = new Date(date || Date.now()); const now = new Date();
    const start = new Date(now); start.setDate(now.getDate()-now.getDay()); start.setHours(0,0,0,0);
    const end = new Date(start); end.setDate(start.getDate()+7);
    return d>=start && d<end;
  }
  function sameMonth(date){
    const d = new Date(date || Date.now()); const now = new Date();
    return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
  }
  function metrics(){
    const list = orders();
    const today = list.filter(o=>isSameDay(o.criadoEm || o.data || o.id));
    const week = list.filter(o=>sameWeek(o.criadoEm || o.data || o.id));
    const month = list.filter(o=>sameMonth(o.criadoEm || o.data || o.id));
    const sum = arr => arr.reduce((acc,o)=>acc+orderTotal(o),0);
    const topMap = {};
    list.forEach(o => (o.itensDetalhados || []).forEach(i => topMap[i.title || i.nome || i] = (topMap[i.title || i.nome || i] || 0) + Number(i.qty || 1)));
    const top = Object.entries(topMap).sort((a,b)=>b[1]-a[1]).slice(0,6);
    return {today,week,month, faturamentoHoje:sum(today), faturamentoSemana:sum(week), faturamentoMes:sum(month), pedidosHoje:today.length, ticketMedio: today.length ? sum(today)/today.length : 0, top};
  }
  function notifyClient(order, message){
    const notes = read('mk_notificacoes', []);
    notes.unshift({id:uid('N'), pedidoId:order.id, cliente:order.cliente || 'Cliente', message, createdAt:todayISO(), lida:false});
    write('mk_notificacoes', notes.slice(0,60));
  }
  window.MKStore = {BRL, uid, read, write, products, saveProducts, promos, savePromos, orders, saveOrders, config, saveConfig, metrics, notifyClient};
})();

let menus = [];
let categories = [];
let cart = {};
let qrTableNumber = null;
let currentCategory = '전체';
let currentMenuId = null;
let lastOrder = null;

const $ = id => document.getElementById(id);
const money = n => `₩${Number(n || 0).toLocaleString('ko-KR')}`;
const escapeHtml = s => String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

async function init() {
  try {
    const [menuRes, catRes, designRes] = await Promise.all([
      fetch('/api/menus'), fetch('/api/categories'), fetch('/api/design')
    ]);
    menus = await menuRes.json();
    categories = await catRes.json();
    const design = await designRes.json();
    applyQrTableNumber();
    applyDesign(design);
    renderCategories();
    renderHome();
    updateCartUI();
  } catch (e) {
    console.error(e);
    document.body.innerHTML = '<div class="fatal">메뉴를 불러오지 못했습니다.<br>서버가 실행 중인지 확인해주세요.</div>';
  }
}

function applyDesign(d) {
  if (!d) return;
  if (d.headerText) $('brandTitle').textContent = d.headerText.replace(/^🍺\s*/, '').replace(/^⭐\s*/, '');
  if (d.subText) $('brandSub').textContent = d.subText.replace('야장 QR 주문 시스템', '김포걸포점');
  if (d.accentColor) document.documentElement.style.setProperty('--accent', d.accentColor);
}

function applyQrTableNumber() {
  const table = Number(new URLSearchParams(location.search).get('table'));
  if (Number.isInteger(table) && table >= 1 && table <= 100) qrTableNumber = table;
  $('tableDisplay').textContent = qrTableNumber ? `${qrTableNumber}번` : '번호 미지정';
  $('checkoutTable').textContent = qrTableNumber ? `${qrTableNumber}번 테이블` : '테이블 번호를 확인해주세요';
  $('tableStatus').textContent = qrTableNumber ? 'QR 테이블' : '테이블 선택 필요';
}

function imageFor(menu) {
  if (menu.image) return menu.image;
  const map = {
    1:'IMG_3177.png',2:'IMG_3177.png',3:'IMG_3178.png',4:'IMG_3179.png',5:'IMG_3180.png',6:'IMG_3181.png',7:'IMG_3182.png',8:'IMG_3183.png',9:'IMG_3184.png',10:'IMG_3185.png',11:'IMG_3186.png',12:'IMG_3187.png',13:'IMG_3188.png',14:'IMG_3189.png',15:'IMG_3190.png',16:'IMG_3191.png',17:'IMG_3192.png',18:'IMG_3193.png',19:'IMG_3194.png',20:'IMG_3195.png',21:'IMG_3196.png',22:'IMG_3197.png',23:'IMG_3198.png',24:'IMG_3199.png',25:'IMG_3199.png',26:'IMG_3200.png',27:'IMG_3200.png',28:'IMG_3200.png',29:'IMG_3199.png',30:'IMG_3199.png',31:'IMG_3199.png',32:'IMG_3200.png',33:'IMG_3199.png',34:'IMG_3199.png',35:'IMG_3199.png',36:'IMG_3199.png',37:'IMG_3199.png',38:'IMG_3199.png',39:'IMG_3199.png',40:'IMG_3199.png',41:'IMG_3199.png',42:'IMG_3200.png',43:'IMG_3200.png',44:'IMG_3200.png',45:'IMG_3200.png',46:'IMG_3200.png',47:'IMG_3200.png',48:'IMG_3200.png',49:'IMG_3200.png',50:'IMG_3201.png',51:'IMG_3201.png',52:'IMG_3201.png',53:'IMG_3201.png',54:'IMG_3201.png',55:'IMG_3201.png',56:'IMG_3202.png',57:'IMG_3202.png',58:'IMG_3202.png',59:'IMG_3202.png',60:'IMG_3204.png',61:'IMG_3204.png',62:'IMG_3205.png',63:'IMG_3205.png'
  };
  return `/images/${map[menu.id] || 'IMG_3177.png'}`;
}

function renderCategories() {
  const all = ['전체', ...categories];
  $('categoryScroll').innerHTML = all.map(c => `<button class="chip ${c===currentCategory?'active':''}" onclick="showCategory('${escapeHtml(c)}')">${escapeHtml(c)}</button>`).join('');
}

function renderHome() {
  const recommended = menus.slice(0, 6);
  $('recommendGrid').innerHTML = recommended.map(menu => productCard(menu)).join('');
  renderCategories();
}

function productCard(menu) {
  const qty = cart[menu.id]?.qty || 0;
  return `<article class="product-card" onclick="openDetail(${menu.id})">
    <div class="product-image-wrap"><img src="${imageFor(menu)}" alt="${escapeHtml(menu.name)}" loading="lazy" onerror="this.style.display='none'"><span class="badge ${menu.id%3===0?'new':''}">${menu.id%3===0?'NEW':'BEST'}</span></div>
    <div class="product-name">${escapeHtml(menu.name)}</div>
    <div class="product-bottom"><strong>${money(menu.price)}</strong><button class="add-circle" onclick="event.stopPropagation();changeQty(${menu.id},1)">＋</button></div>
    ${qty ? `<div class="mini-qty">수량 ${qty}</div>` : ''}
  </article>`;
}

function menuRow(menu) {
  const qty = cart[menu.id]?.qty || 0;
  return `<article class="menu-row" onclick="openDetail(${menu.id})">
    <div class="row-image"><img src="${imageFor(menu)}" alt="${escapeHtml(menu.name)}" loading="lazy"></div>
    <div class="row-info"><div class="row-title">${escapeHtml(menu.name)}</div><p>${escapeHtml(menu.description || '')}</p><strong>${money(menu.price)}</strong></div>
    <button class="add-circle row-add" onclick="event.stopPropagation();changeQty(${menu.id},1)">＋</button>
    ${qty ? `<span class="row-qty">${qty}</span>` : ''}
  </article>`;
}

function showCategory(category) {
  currentCategory = category || '전체';
  $('categoryTitle').textContent = currentCategory === '전체' ? '메뉴' : currentCategory;
  const list = currentCategory === '전체' ? menus : menus.filter(m => m.category === currentCategory);
  $('subCategoryScroll').innerHTML = ['전체', ...categories].map(c => `<button class="sub-chip ${c===currentCategory?'active':''}" onclick="showCategory('${escapeHtml(c)}')">${escapeHtml(c)}</button>`).join('');
  $('menuList').innerHTML = list.length ? list.map(menuRow).join('') : '<div class="empty">등록된 메뉴가 없습니다.</div>';
  showView('categoryView');
  updateNav('navMenu');
}

function openDetail(id) {
  const menu = menus.find(m => m.id === id);
  if (!menu) return;
  currentMenuId = id;
  const qty = cart[id]?.qty || 0;
  $('detailContent').innerHTML = `<div class="detail-head"><button onclick="showCategory(currentCategory)">‹</button><button onclick="showCart()">🛒</button></div>
    <img class="detail-image" src="${imageFor(menu)}" alt="${escapeHtml(menu.name)}">
    <div class="detail-body"><span class="detail-badge">BEST</span><h1>${escapeHtml(menu.name)}</h1><div class="detail-price">${money(menu.price)}</div>
    <p>${escapeHtml(menu.description || '금별맥주의 인기 메뉴입니다. 맛있게 준비해드리겠습니다.')}</p>
    <h3>수량 선택</h3><div class="qty-control"><button onclick="changeQty(${id},-1);refreshDetail()">−</button><strong id="detailQty">${qty}</strong><button onclick="changeQty(${id},1);refreshDetail()">＋</button></div>
    <button class="primary-btn large" onclick="changeQty(${id},1);showCart()">🛒 장바구니 담기</button></div>`;
  showView('detailView');
}
function refreshDetail(){ if(currentMenuId) openDetail(currentMenuId); }

function changeQty(id, delta) {
  const menu = menus.find(m => m.id === id); if (!menu) return;
  const next = Math.max(0, (cart[id]?.qty || 0) + delta);
  if (next === 0) delete cart[id]; else cart[id] = {qty: next};
  updateCartUI();
  if (document.getElementById('categoryView').classList.contains('active')) showCategory(currentCategory);
  else if (document.getElementById('homeView').classList.contains('active')) renderHome();
  if (document.getElementById('cartView').classList.contains('active')) renderCart();
}

function cartItems() { return Object.entries(cart).map(([id,v]) => { const m=menus.find(x=>x.id===Number(id)); return m ? {...m, qty:v.qty, lineTotal:m.price*v.qty} : null; }).filter(Boolean); }
function cartTotal(){ return cartItems().reduce((s,m)=>s+m.lineTotal,0); }

function updateCartUI() {
  const count = cartItems().reduce((s,m)=>s+m.qty,0);
  $('cartBadge').textContent = count; $('navCartBadge').textContent = count; $('cartBadge').style.display = count ? 'flex':'none'; $('navCartBadge').style.display = count ? 'block':'none';
  if ($('cartView').classList.contains('active')) renderCart();
}

function renderCart() {
  const items = cartItems();
  if (!items.length) { $('cartContent').innerHTML = '<div class="empty-cart-box"><div>🛒</div><h2>장바구니가 비어있어요</h2><p>메뉴를 담아 주문해보세요.</p><button class="primary-btn" onclick="showHome()">메뉴 보러가기</button></div>'; return; }
  $('cartContent').innerHTML = `<div class="cart-list">${items.map(m=>`<div class="cart-item"><img src="${imageFor(m)}"><div class="cart-item-info"><h3>${escapeHtml(m.name)}</h3><div class="cart-qty"><button onclick="changeQty(${m.id},-1)">−</button><b>${m.qty}</b><button onclick="changeQty(${m.id},1)">＋</button></div></div><strong>${money(m.lineTotal)}</strong><button class="delete" onclick="changeQty(${m.id},-${m.qty})">×</button></div>`).join('')}</div><div class="cart-summary"><span>총 주문금액</span><strong>${money(cartTotal())}</strong></div><button class="primary-btn large" onclick="checkout()">주문하기 ›</button>`;
}

function checkout() {
  if (!cartItems().length) return showCart();
  if (!qrTableNumber) { alert('QR 테이블 번호가 없습니다. 테이블 QR로 접속해주세요.'); return; }
  $('checkoutTable').textContent = `${qrTableNumber}번 테이블`;
  $('checkoutItems').innerHTML = cartItems().map(m=>`<div class="checkout-item"><img src="${imageFor(m)}"><span>${escapeHtml(m.name)}</span><b>${m.qty}개</b><strong>${money(m.lineTotal)}</strong></div>`).join('');
  $('checkoutTotal').textContent = money(cartTotal());
  showView('checkoutView'); updateNav('navCart');
}

async function submitOrder() {
  const items = cartItems();
  if (!items.length || !qrTableNumber) return;
  const btn = $('submitOrderBtn'); btn.disabled = true; btn.textContent = '주문 접수 중...';
  try {
    const res = await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tableNumber:qrTableNumber,items:items.map(m=>({id:m.id,name:m.name,qty:m.qty,price:m.price})),total:cartTotal()})});
    const data = await res.json(); if(!res.ok) throw new Error(data.error||'주문 실패');
    lastOrder = {orderId:data.orderId,tableNumber:qrTableNumber,total:cartTotal(),timestamp:new Date().toLocaleString('ko-KR'),items};
    localStorage.setItem('lastOrder',JSON.stringify(lastOrder));
    $('successOrderId').textContent = data.orderId; $('successTable').textContent = `${qrTableNumber}번`; $('successTotal').textContent = money(lastOrder.total);
    cart = {}; updateCartUI(); showView('successView');
  } catch(e) { console.error(e); alert('주문 처리 중 오류가 발생했습니다. 서버 연결을 확인해주세요.'); }
  finally { btn.disabled=false; btn.innerHTML='주문 넣기 <span>›</span>'; }
}

function clearCart(){ if(confirm('장바구니를 모두 비울까요?')){cart={};updateCartUI();renderCart();} }
function showOrders(){
  const saved = JSON.parse(localStorage.getItem('lastOrder') || 'null');
  if(!saved){ alert('이 기기에서 확인할 주문내역이 없습니다.'); return; }
  $('modalBody').innerHTML = `<button class="modal-close" onclick="closeModal()">×</button><h2>최근 주문내역</h2><div class="order-history"><b>${saved.orderId}</b><span>${saved.timestamp}</span><span>${saved.tableNumber}번 테이블</span><hr>${saved.items.map(m=>`<div>${escapeHtml(m.name)} × ${m.qty}<strong>${money(m.lineTotal)}</strong></div>`).join('')}<hr><strong class="history-total">${money(saved.total)}</strong></div>`;
  $('modal').classList.add('open');
}
function closeModal(){ $('modal').classList.remove('open'); }
function showCart(){ showView('cartView'); renderCart(); updateNav('navCart'); }
function showHome(){ showView('homeView'); renderHome(); updateNav('navHome'); }
function showMenu(){ showCategory(currentCategory === '전체' ? '전체' : currentCategory); }
function showView(id){ document.querySelectorAll('.view').forEach(v=>v.classList.remove('active')); $(id).classList.add('active'); window.scrollTo({top:0,behavior:'instant'}); }
function updateNav(id){document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.remove('active')); if($(id)) $(id).classList.add('active');}

window.addEventListener('load',init);

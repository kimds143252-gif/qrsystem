let menus = [];
let currentEditingMenuId = null;
let currentEditingImage = null;
let adminPassword = localStorage.getItem('adminPassword') || '1234';
let categories = [];
let customerBaseUrl = null;

// 초기화
async function init() {
    // 비번 확인
    checkPassword();
    
    // 메뉴 로드 (서버에서 먼저, 없으면 localStorage)
    await loadMenus();
    await loadCategories();
    renderCategorySelects();
    
    // 디자인 로드: 서버에서 불러오기
async function loadDesign() {
    try {
        const response = await fetch('/api/design');
        if (!response.ok) throw new Error('디자인 조회 실패');
        const design = await response.json();

        if (design.headerColor) document.getElementById('headerColor').value = design.headerColor;
        if (design.accentColor) document.getElementById('accentColor').value = design.accentColor;
        if (design.textColor) document.getElementById('textColor').value = design.textColor;
        if (design.bgColor) document.getElementById('bgColor').value = design.bgColor;
        if (design.headerText) document.getElementById('headerText').value = design.headerText;
        if (design.subText) document.getElementById('subText').value = design.subText;
        renderDesignPreview(design);
    } catch (error) {
        console.error('디자인 로드 실패:', error);
        alert('디자인 설정을 불러오지 못했습니다.');
    }
}

function getDesignFromForm() {
    return {
        headerColor: document.getElementById('headerColor').value,
        accentColor: document.getElementById('accentColor').value,
        textColor: document.getElementById('textColor').value,
        bgColor: document.getElementById('bgColor').value,
        headerText: document.getElementById('headerText').value,
        subText: document.getElementById('subText').value
    };
}

function renderDesignPreview(design) {
    const previewHeader = document.getElementById('previewHeader');
    previewHeader.style.background = `linear-gradient(135deg, ${design.headerColor} 0%, ${design.accentColor} 100%)`;
    previewHeader.style.color = design.textColor;
    document.getElementById('previewTitle').textContent = design.headerText;
    document.getElementById('previewTitle').style.color = 'white';
    document.getElementById('previewSubtitle').textContent = design.subText;
    document.getElementById('previewSubtitle').style.color = 'white';
}

// 디자인 업데이트: 서버에 즉시 저장
async function updateDesign() {
    const design = getDesignFromForm();
    renderDesignPreview(design);

    try {
        const response = await fetch('/api/design', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(design)
        });
        if (!response.ok) throw new Error('디자인 설정 저장 실패');
    } catch (error) {
        console.error(error);
        alert('디자인 설정 저장에 실패했습니다.');
    }
}

// 디자인 초기화
async function resetDesign() {
    document.getElementById('headerColor').value = '#d32f2f';
    document.getElementById('accentColor').value = '#ff6f00';
    document.getElementById('textColor').value = '#333';
    document.getElementById('bgColor').value = '#f5f5f5';
    document.getElementById('headerText').value = '🍺 금별맥주';
    document.getElementById('subText').value = '야장 QR 주문 시스템';
    await updateDesign();
    alert('디자인이 초기화되었습니다!');
}

// 주문 로드
    loadOrders();
    
    // 메뉴 렌더링
    renderMenus();
    renderCategories();
}

// 비번 확인
function checkPassword() {
    const enteredPassword = prompt('관리자 비번을 입력하세요:');
    if (enteredPassword !== adminPassword) {
        alert('비번이 틀렸습니다!');
        window.location.href = '/';
    }
}

// 메뉴 로드: 서버의 영구 저장소만 사용
async function loadMenus() {
    try {
        const response = await fetch('/api/menus');
        if (!response.ok) throw new Error('메뉴 조회 실패');
        menus = await response.json();
    } catch (error) {
        console.error('서버에서 메뉴 로드 실패:', error);
        alert('메뉴를 불러올 수 없습니다. 서버가 실행 중인지 확인하세요.');
        menus = [];
    }
}

// ================================
// 카테고리 관리
// ================================
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('카테고리 조회 실패');
        categories = await response.json();
        if (!Array.isArray(categories)) categories = [];
    } catch (error) {
        console.error('카테고리 로드 실패:', error);
        categories = [...new Set(menus.map(m => m.category).filter(Boolean))];
    }
}

function renderCategorySelects() {
    ['newMenuCategory', 'editMenuCategory'].forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        const current = select.value;
        select.innerHTML = categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
        if (current && categories.includes(current)) select.value = current;
    });
}

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}

function renderCategories() {
    const el = document.getElementById('categoriesList');
    if (!el) return;
    el.innerHTML = categories.map((category, index) => {
        const count = menus.filter(m => m.category === category).length;
        return `<div class="category-row">
            <input id="category-${index}" class="form-input" value="${escapeHtml(category)}">
            <span class="category-count">메뉴 ${count}개</span>
            <button class="btn-primary" onclick="renameCategory(${index})">수정</button>
        </div>`;
    }).join('');
}

async function saveCategoriesToServer() {
    const response = await fetch('/api/categories', {
        method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(categories)
    });
    if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || '카테고리 저장에 실패했습니다.');
    }
    const result = await response.json();
    categories = result.categories;
}

async function renameCategory(index) {
    const input = document.getElementById(`category-${index}`);
    if (!input) return;
    const oldName = categories[index];
    const newName = input.value.trim();
    if (!newName) return alert('카테고리 이름을 입력하세요.');
    if (newName === oldName) return;
    if (categories.includes(newName)) return alert('이미 존재하는 카테고리 이름입니다.');

    const oldMenus = menus.map(m => ({...m}));
    categories[index] = newName;
    menus.forEach(m => { if (m.category === oldName) m.category = newName; });
    try {
        await saveCategoriesToServer();
        await saveMenusToServer();
        renderMenus();
        renderCategorySelects();
        renderCategories();
        alert(`카테고리 변경 완료: ${oldName} → ${newName}`);
    } catch (error) {
        menus = oldMenus;
        categories[index] = oldName;
        renderCategorySelects();
        renderCategories();
        alert(error.message);
    }
}

async function addCategory() {
    const input = document.getElementById('newCategoryName');
    const name = input.value.trim();
    if (!name) return alert('카테고리 이름을 입력하세요.');
    if (categories.includes(name)) return alert('이미 존재하는 카테고리입니다.');
    categories.push(name);
    try {
        await saveCategoriesToServer();
        input.value = '';
        renderCategorySelects();
        renderCategories();
    } catch (error) {
        categories.pop();
        alert(error.message);
    }
}

// 메뉴 전체를 서버에 저장
async function saveMenusToServer() {
    const response = await fetch('/api/menus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menus)
    });

    if (!response.ok) {
        let message = '메뉴 저장에 실패했습니다.';
        try {
            const result = await response.json();
            if (result.error) message = result.error;
        } catch (_) {}
        throw new Error(message);
    }

    const result = await response.json();
    menus = result.menus;
}

// 가격 포맷팅 (콤마 추가)
function formatPrice(price) {
    return price.toLocaleString('ko-KR');
}

// 메뉴 렌더링
function renderMenus() {
    const menusList = document.getElementById('menusList');
    menusList.innerHTML = menus.map(menu => {
        const badges = [];
        if (menu.recommended) badges.push('⭐ 추천');
        if (menu.popular) badges.push('🔥 인기');
        if (menu.new) badges.push('✨ new');
        if (menu.soldOut) badges.push('🚫 품절');
        
        const badgeHtml = badges.length > 0 ? `
            <div style="display: flex; gap: 5px; margin-bottom: 8px; flex-wrap: wrap;">
                ${badges.map(badge => `<span style="display: inline-block; background-color: #ff9800; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${badge}</span>`).join('')}
            </div>
        ` : '';
        
        return `
            <div class="menu-card" onclick="editMenu(${menu.id})" style="${menu.soldOut ? 'opacity: 0.6;' : ''}">
                ${menu.image ? `<img src="${menu.image}" alt="${menu.name}" class="menu-card-image">` : '<div class="menu-card-no-image">📷 이미지 없음</div>'}
                <div class="menu-card-info">
                    ${badgeHtml}
                    <h4>${menu.name}</h4>
                    <p>${menu.category}</p>
                    <p class="menu-price">₩ ${formatPrice(menu.price)}</p>
                    <small>클릭하여 수정</small>
                </div>
            </div>
        `;
    }).join('');
}

// 메뉴 추가
async function addMenu() {
    const name = document.getElementById('newMenuName').value;
    const price = parseInt(document.getElementById('newMenuPrice').value);
    const category = document.getElementById('newMenuCategory').value;

    if (!name || !price) {
        alert('메뉴명과 가격을 입력하세요!');
        return;
    }

    const newMenu = {
        id: Math.max(...menus.map(m => m.id), 0) + 1,
        name,
        price,
        category,
        image: null,
        icon: '🍽️',
        recommended: false,
        popular: false,
        new: false,
        soldOut: false
    };

    menus.push(newMenu);
    try {
        await saveMenusToServer();
    } catch (error) {
        menus = menus.filter(m => m.id !== newMenu.id);
        alert(error.message);
        return;
    }
    
    // 입력 초기화
    document.getElementById('newMenuName').value = '';
    document.getElementById('newMenuPrice').value = '';
    
    // 렌더링
    renderMenus();
    alert('메뉴가 추가되었습니다!');
}

// 메뉴 수정
function editMenu(menuId) {
    const menu = menus.find(m => m.id === menuId);
    if (!menu) return;

    currentEditingMenuId = menuId;
    currentEditingImage = menu.image;
    document.getElementById('editMenuName').value = menu.name;
    document.getElementById('editMenuPrice').value = menu.price;
    document.getElementById('editMenuCategory').value = menu.category;
    document.getElementById('editMenuImage').value = '';
    
    // 메뉴 상태 체크박스 설정
    document.getElementById('editMenuRecommended').checked = menu.recommended || false;
    document.getElementById('editMenuPopular').checked = menu.popular || false;
    document.getElementById('editMenuNew').checked = menu.new || false;
    document.getElementById('editMenuSoldOut').checked = menu.soldOut || false;
    
    // 이미지 미리보기
    const preview = document.getElementById('imagePreview');
    if (menu.image) {
        preview.innerHTML = `<img src="${menu.image}" alt="${menu.name}" style="max-width: 100%; max-height: 200px; border-radius: 8px;">`;
    } else {
        preview.innerHTML = '<p style="color: #999;">이미지가 없습니다</p>';
    }
    
    document.getElementById('editModal').classList.add('show');
}

// 이미지 미리보기
function previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        currentEditingImage = e.target.result;
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = `<img src="${e.target.result}" alt="preview" style="max-width: 100%; max-height: 200px; border-radius: 8px;">`;
    };
    reader.readAsDataURL(file);
}

// 메뉴 수정 저장
async function saveMenuEdit() {
    const name = document.getElementById('editMenuName').value;
    const price = parseInt(document.getElementById('editMenuPrice').value);
    const category = document.getElementById('editMenuCategory').value;

    if (!name || !price) {
        alert('메뉴명과 가격을 입력하세요!');
        return;
    }

    const menuIndex = menus.findIndex(m => m.id === currentEditingMenuId);
    menus[menuIndex] = {
        ...menus[menuIndex],
        name,
        price,
        category,
        image: currentEditingImage,
        recommended: document.getElementById('editMenuRecommended').checked,
        popular: document.getElementById('editMenuPopular').checked,
        new: document.getElementById('editMenuNew').checked,
        soldOut: document.getElementById('editMenuSoldOut').checked
    };

    try {
        await saveMenusToServer();
    } catch (error) {
        alert(error.message);
        return;
    }
    renderMenus();
    closeModal();
    alert('메뉴가 수정되었습니다!');
}

// 메뉴 삭제
async function deleteCurrentMenu() {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    menus = menus.filter(m => m.id !== currentEditingMenuId);
    try {
        await saveMenusToServer();
    } catch (error) {
        alert(error.message);
        return;
    }
    renderMenus();
    closeModal();
    alert('메뉴가 삭제되었습니다!');
}

// 모달 닫기
function closeModal() {
    document.getElementById('editModal').classList.remove('show');
    currentEditingMenuId = null;
    currentEditingImage = null;
}

// 탭 전환
function switchTab(tabName, button) {
    // 탭 콘텐츠 숨기기
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 네비게이션 버튼 업데이트
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
    });

    // 선택한 탭 표시
    document.getElementById(tabName).classList.add('active');
    (button || document.querySelector(`.nav-item[onclick*="'${tabName}'"]`))?.classList.add('active');
    
    // 주문 탭이면 새로 로드
    if (tabName === 'orders') {
        loadOrders();
    }
    if (tabName === 'categories') {
        renderCategories();
    }

    // 테이블 QR 탭에 들어오면 1~100번 QR을 자동으로 표시
    if (tabName === 'qrcodes') {
        generateAllQRCodes();
    }
}

// 디자인 로드
function loadDesign() {
    const design = JSON.parse(localStorage.getItem('design') || '{}');
    
    if (design.headerColor) document.getElementById('headerColor').value = design.headerColor;
    if (design.accentColor) document.getElementById('accentColor').value = design.accentColor;
    if (design.textColor) document.getElementById('textColor').value = design.textColor;
    if (design.bgColor) document.getElementById('bgColor').value = design.bgColor;
    if (design.headerText) document.getElementById('headerText').value = design.headerText;
    if (design.subText) document.getElementById('subText').value = design.subText;
}

// 디자인 업데이트
function updateDesign() {
    const design = {
        headerColor: document.getElementById('headerColor').value,
        accentColor: document.getElementById('accentColor').value,
        textColor: document.getElementById('textColor').value,
        bgColor: document.getElementById('bgColor').value,
        headerText: document.getElementById('headerText').value,
        subText: document.getElementById('subText').value
    };

    localStorage.setItem('design', JSON.stringify(design));
    
    // 미리보기 업데이트
    const previewHeader = document.getElementById('previewHeader');
    previewHeader.style.background = `linear-gradient(135deg, ${design.headerColor} 0%, ${design.accentColor} 100%)`;
    previewHeader.style.color = design.textColor;
    document.getElementById('previewTitle').textContent = design.headerText;
    document.getElementById('previewTitle').style.color = 'white';
    document.getElementById('previewSubtitle').textContent = design.subText;
    document.getElementById('previewSubtitle').style.color = 'white';
}

// 디자인 초기화
function resetDesign() {
    document.getElementById('headerColor').value = '#d32f2f';
    document.getElementById('accentColor').value = '#ff6f00';
    document.getElementById('textColor').value = '#333';
    document.getElementById('bgColor').value = '#f5f5f5';
    document.getElementById('headerText').value = '🍺 금별맥주';
    document.getElementById('subText').value = '야장 QR 주문 시스템';
    
    localStorage.removeItem('design');
    updateDesign();
    alert('디자인이 초기화되었습니다!');
}

// 주문 로드
async function loadOrders() {
    try {
        const response = await fetch('/api/orders');
        const orders = await response.json();
        
        const ordersList = document.getElementById('ordersList');
        if (orders.length === 0) {
            ordersList.innerHTML = '<p style="text-align: center; color: #999; padding: 30px;">주문 내역이 없습니다.</p>';
            return;
        }

        ordersList.innerHTML = orders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <strong>${order.tableNumber}번 테이블</strong>
                    <span class="order-time">${new Date(order.timestamp).toLocaleString('ko-KR')}</span>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div>• ${item.name} × ${item.qty} (₩${formatPrice(item.price * item.qty)})</div>
                    `).join('')}
                </div>
                <strong style="color: #d32f2f; margin-top: 8px; display: block;">합계: ₩${formatPrice(order.total)}</strong>
            </div>
        `).join('');
    } catch (error) {
        console.error('주문 로드 실패:', error);
    }
}

// 비번 변경
function changePassword() {
    const newPassword = document.getElementById('newPassword').value;
    if (!newPassword) {
        alert('새 비번을 입력하세요!');
        return;
    }

    adminPassword = newPassword;
    localStorage.setItem('adminPassword', newPassword);
    document.getElementById('newPassword').value = '';
    alert('비번이 변경되었습니다!');
}

// 데이터 백업
function backupData() {
    const backup = {
        menus,
        design: getDesignFromForm(),
        timestamp: new Date().toLocaleString('ko-KR')
    };

    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `금별맥주_백업_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    alert('백업이 완료되었습니다!');
}

// 데이터 복원
function restoreData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            if (!Array.isArray(backup.menus)) throw new Error('메뉴 데이터가 없습니다.');
            menus = backup.menus;
            await saveMenusToServer();

            if (backup.design) {
                const design = typeof backup.design === 'string' ? JSON.parse(backup.design) : backup.design;
                const response = await fetch('/api/design', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(design)
                });
                if (!response.ok) throw new Error('디자인 복원 실패');
            }

            renderMenus();
            await loadDesign();
            alert('데이터가 서버에 복원되었습니다!');
        } catch (error) {
            alert('백업 파일이 손상되었습니다.');
        }
    };
    reader.readAsText(file);
}

// 데이터 초기화
async function resetAllData() {
    if (!confirm('정말로 모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다!')) {
        return;
    }

    try {
        const response = await fetch('/api/menus', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([])
        });
        if (!response.ok) throw new Error('메뉴 초기화 실패');
        menus = [];
        renderMenus();
        alert('모든 메뉴 데이터가 서버에서 초기화되었습니다!');
    } catch (error) {
        alert(error.message);
    }
}

// 로그아웃
function logout() {
    if (confirm('정말 로그아웃 하시겠습니까?')) {
        window.location.href = '/';
    }
}

// 페이지 로드
window.addEventListener('load', init);


// ================================
// 테이블 QR 코드 (1~100번)
// ================================
async function loadCustomerAccessUrl() {
    try {
        const response = await fetch('/api/access-info');
        if (!response.ok) throw new Error('접속 주소 조회 실패');
        const info = await response.json();
        // 관리자 화면을 localhost로 열었더라도 QR에는 휴대폰이 접근 가능한 LAN IP를 사용합니다.
        customerBaseUrl = info.lanUrl || info.browserOrigin;
    } catch (error) {
        console.error('고객 접속 주소 조회 실패:', error);
        customerBaseUrl = window.location.origin;
    }
    return customerBaseUrl;
}

function getCustomerBaseUrl() {
    return customerBaseUrl || window.location.origin;
}

function tableQrUrl(tableNumber) {
    return `${getCustomerBaseUrl().replace(/\/$/, '')}/?table=${tableNumber}`;
}

async function generateAllQRCodes() {
    const grid = document.getElementById('qrGrid');
    const baseEl = document.getElementById('qrBaseUrl');
    if (!grid) return;
    await loadCustomerAccessUrl();
    const baseUrl = getCustomerBaseUrl();
    baseEl.textContent = `고객 접속 주소: ${baseUrl}/?table=테이블번호`;
    grid.innerHTML = '';

    for (let table = 1; table <= 100; table++) {
        const url = tableQrUrl(table);
        const card = document.createElement('div');
        card.className = 'qr-card';
        card.innerHTML = `<h3>${table}번 테이블</h3><div class="qr-image" id="qr-${table}"></div><div class="qr-url">${escapeHtml(url)}</div><button class="btn-secondary" onclick="printSingleQRCode(${table})">🖨️ 이 QR 인쇄</button>`;
        grid.appendChild(card);
        new QRCode(document.getElementById(`qr-${table}`), {text:url,width:160,height:160,colorDark:'#000000',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.H});
    }
}

async function printAllQRCodes() {
    if (!document.querySelector('.qr-card')) await generateAllQRCodes();
    setTimeout(() => window.print(), 300);
}

async function printSingleQRCode(tableNumber) {
    await loadCustomerAccessUrl();
    const url = tableQrUrl(tableNumber);
    const qr = document.createElement('div');
    qr.id = 'singleQrPrint';
    qr.style.position = 'fixed'; qr.style.left = '-10000px'; qr.style.top = '0'; qr.style.background = '#fff'; qr.style.padding = '30px'; qr.style.textAlign = 'center';
    qr.innerHTML = `<h1 style="margin:0 0 20px;">금별맥주 ${tableNumber}번 테이블</h1><div id="singleQrCanvas"></div><p>${escapeHtml(url)}</p>`;
    document.body.appendChild(qr);
    new QRCode(document.getElementById('singleQrCanvas'), {text:url,width:300,height:300,correctLevel:QRCode.CorrectLevel.H});
    const style = document.createElement('style'); style.id = 'singleQrPrintStyle';
    style.textContent = '@media print { body * { visibility:hidden !important; } #singleQrPrint, #singleQrPrint * { visibility:visible !important; } #singleQrPrint { position:absolute !important; left:50% !important; top:50% !important; transform:translate(-50%,-50%); } }';
    document.head.appendChild(style);
    setTimeout(() => { window.print(); setTimeout(() => { qr.remove(); style.remove(); }, 500); }, 200);
}

// ── 설정 및 상수 ──
const GAS_URL = "https://script.google.com/macros/s/AKfycbzMXh0amAwmWjK1ta2isjUMaApyT7P-ku8dW0GUn_uJuw4VYM2uEr3oNqccRjsc8YvQ6w/exec";

// ==========================================
// 6. 관리자 계정 메뉴 로직 (Admin)
// ==========================================

function renderAdminUsers() {
    const tbody = document.getElementById('adminUsersTableBody');
    if (!tbody) return;

    let html = '';
    for (const [id, info] of Object.entries(VALID_USERS)) {
        const deleteButtonHtml = id === 'admin'
            ? `<span style="color: var(--gray-400); font-size: 12px;">최고 관리자 고정</span>`
            : `<button onclick="adminDeleteUser('${id}')" class="btn btn-outline" style="padding: 6px 12px; color: var(--danger); border-color: var(--danger);"><i class="fas fa-trash-alt"></i> 삭제</button>`;

        html += `
            <tr>
                <td><strong>${id}</strong></td>
                <td><span style="font-family: monospace; background: var(--gray-100); padding: 2px 6px; border-radius: 4px;">${info.password}</span></td>
                <td>${info.name}</td>
                <td style="text-align: right;">${deleteButtonHtml}</td>
            </tr>
        `;
    }
    tbody.innerHTML = html;
}

window.adminAddUser = function () {
    const id = document.getElementById('newUserId').value.trim();
    const pw = document.getElementById('newUserPw').value;
    const name = document.getElementById('newUserName').value.trim();

    if (!id || !pw || !name) {
        alert("아이디, 비밀번호, 사용자 이름을 모두 입력해 주세요.");
        return;
    }

    // admin 예약어 보호
    if (id.toLowerCase() === 'admin' && VALID_USERS['admin']) {
        alert("admin 계정은 덮어쓰거나 임의로 조작할 수 없습니다.");
        return;
    }

    VALID_USERS[id] = { password: pw, name: name };
    localStorage.setItem('SCM_USERS', JSON.stringify(VALID_USERS));

    document.getElementById('newUserId').value = '';
    document.getElementById('newUserPw').value = '';
    document.getElementById('newUserName').value = '';

    alert(`계정 [${id}]이(가) 이 브라우저에 임시 생성되었습니다.\n다른 컴퓨터에서도 접속하려면 향후 파일 업데이트 배포가 필요합니다.`);
    renderAdminUsers();
}

window.adminDeleteUser = function (id) {
    if (id === 'admin') {
        alert("최고 관리자는 삭제할 수 없습니다.");
        return;
    }

    if (confirm(`정말 계정 [${id}]을(를) 삭제하시겠습니까?`)) {
        delete VALID_USERS[id];
        localStorage.setItem('SCM_USERS', JSON.stringify(VALID_USERS));
        renderAdminUsers();
    }
}

// ==========================================
// 7. 차트 렌더링 로직 (비활성화)
// ==========================================
function renderCharts(sales) {
    // 향후 구현
}

// ==========================================
// 1. 인증 및 환경 설정 (Authentication & Config)
// ==========================================

// --- 사용자 계정 설정 (관리자가 직접 수정하는 곳) ---
let VALID_USERS = {
    "admin": { password: "1", name: "관리자" },
    "sales1": { password: "1", name: "영업담당 1" },
    "sales2": { password: "1", name: "영업담당 2" },
    "demo": { password: "1", name: "데모 유저" }
};

// 로컬 저장소에서 계정 목록 동기화 (정적 웹을 위한 임시 저장소 DB)
try {
    const savedUsers = localStorage.getItem('SCM_USERS');
    if (savedUsers) {
        VALID_USERS = JSON.parse(savedUsers);
    }
} catch (e) {
    console.error("Failed to parse SCM_USERS from localStorage");
}

let currentUser = null;

async function loginWithCredentials() {
    const idInput = document.getElementById('loginId').value.trim();
    const pwInput = document.getElementById('loginPw').value;

    if (!idInput || !pwInput) {
        alert("아이디와 비밀번호를 모두 입력해주세요.");
        return;
    }

    const user = VALID_USERS[idInput];
    if (user && user.password === pwInput) {
        // 로그인 성공
        currentUser = {
            username: idInput,
            name: user.name
        };
        handleAuthSuccess(currentUser);
    } else {
        // 로그인 실패
        alert("아이디 또는 비밀번호가 일치하지 않습니다.");
    }
}

async function loginDemo() {
    console.log("Starting Demo mode login...");
    currentUser = {
        username: "demo@rawgaon.com",
        name: "데모 체험자"
    };
    handleAuthSuccess(currentUser);
}

function handleAuthSuccess(userObj) {
    document.getElementById("loginScreen").style.display = "none";
    document.querySelector(".user-name").textContent = userObj.name;
    document.querySelector(".user-avatar").textContent = userObj.name.substring(0, 2).toUpperCase();

    document.getElementById('sidebar-menu').innerHTML = `
        <div class="nav-item active" onclick="showScreen('dashboard', this)" id="menu-dashboard">
            <div class="icon"><i class="fas fa-chart-pie"></i></div>
            <span>대시보드</span>
        </div>
        <div class="nav-item" onclick="showScreen('sales', this)" id="menu-sales">
            <div class="icon"><i class="fas fa-won-sign"></i></div>
            <span>매출 관리</span>
            <div class="badge" style="margin-left:auto;">24</div>
        </div>
        <div class="nav-item" onclick="showScreen('profit', this)" id="menu-profit">
            <div class="icon"><i class="fas fa-calculator"></i></div>
            <span>정산 현황</span>
        </div>
        
        <div class="nav-item" onclick="toggleSubmenu('submenu-inventory', this)" id="menu-inventory-group">
            <div class="icon"><i class="fas fa-box-open"></i></div>
            <span>제품 관리</span>
            <i class="fas fa-chevron-down" style="margin-left:auto; font-size:12px; transition: transform 0.2s;"></i>
        </div>
        <div class="submenu" id="submenu-inventory" style="display:none;">
            <div class="nav-item sub-item" onclick="showScreen('stock', this)">
                재고 관리
            </div>
            <div class="nav-item sub-item" onclick="showScreen('productMaster', this)" id="menu-productMaster">
                제품 마스터
            </div>
        </div>
        <div class="nav-item" onclick="logout()" style="margin-top: auto; color: var(--danger); border-top: 1px solid var(--gray-100);">
            <div class="icon"><i class="fas fa-sign-out-alt"></i></div>
            <span>로그아웃</span>
        </div>
    `;

    // 관리자 전용 메뉴 노출
    if (userObj.username === 'admin') {
        const adminMenu = document.getElementById('menu-admin');
        if (adminMenu) adminMenu.style.display = 'flex';
        renderAdminUsers(); // 접속시 즉각 렌더
    }

    // 이전에 구현했던 화면 전환 로직 복원
    showScreen('dashboard');
    loadAllData();
}

function logout() {
    currentUser = null;
    document.getElementById('loginId').value = '';
    document.getElementById('loginPw').value = '';
    document.getElementById('app').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    // 관리자 메뉴 숨기기
    const adminMenu = document.getElementById('menu-admin');
    if (adminMenu) adminMenu.style.display = 'none';
    // 로그아웃 버튼 제거 (중복 추가 방지)
    const logoutButton = document.querySelector('.sidebar-menu .menu-item:last-child');
    if (logoutButton && logoutButton.textContent.includes('로그아웃')) {
        logoutButton.remove();
    }
}

window.showScreen = function (screenId, menuItemElement = null) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(el => el.style.display = 'none');

    // Remove active class from all menu items
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    // Show the target screen
    const targetScreen = document.getElementById(`screen-${screenId}`);
    if (targetScreen) targetScreen.style.display = 'block';

    // Add active class to clicked menu item
    if (menuItemElement) {
        menuItemElement.classList.add('active');
    }

    // Update Page Title based on screenId
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        if (screenId === 'dashboard') pageTitle.textContent = '대시보드';
        else if (screenId === 'sales') pageTitle.textContent = '매출 관리';
        else if (screenId === 'profit') pageTitle.textContent = '정산 현황';
        else if (screenId === 'inventory') pageTitle.textContent = '재고 현황';
        else if (screenId === 'stock') pageTitle.textContent = '재고 관리';
        else if (screenId === 'productMaster') pageTitle.textContent = '제품 마스터';
        else if (screenId === 'adminScreen') pageTitle.textContent = '계정 관리 (관리자)';
        else pageTitle.textContent = 'RAWGAON SCM';
    }

    // specific renders...
    const btnProductAdd = document.getElementById('btn-addProduct');
    if (btnProductAdd) btnProductAdd.style.display = 'none';

    if (screenId === 'productMaster') {
        renderProductMasterTable();
        if (btnProductAdd) btnProductAdd.style.display = 'inline-flex';
    } else if (screenId === 'adminScreen') {
        renderAdminUsers();
    }
};

window.toggleSubmenu = function (submenuId, element) {
    const submenu = document.getElementById(submenuId);
    if (!submenu) return;
    const icon = element.querySelector('.fa-chevron-down, .fa-chevron-up');

    if (submenu.style.display === 'none') {
        submenu.style.display = 'block';
        if (icon) {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            icon.style.transform = 'rotate(180deg)';
        }
    } else {
        submenu.style.display = 'none';
        if (icon) {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
            icon.style.transform = 'rotate(0deg)';
        }
    }
};

// ── 데이터 연동 (GAS) ──
async function fetchData(action) {
    try {
        const res = await fetch(`${GAS_URL}?action=${action}`);
        if (!res.ok) throw new Error("네트워크 응답 오류");
        const data = await res.json();

        // GAS 데이터 (headers, rows)를 JSON 객체 배열로 변환
        return data.rows.map(row => {
            const obj = {};
            data.headers.forEach((header, index) => {
                obj[header] = row[index];
            });
            return obj;
        });
    } catch (error) {
        console.error(`데이터 로드 실패 (${action}):`, error);
        return [];
    }
}

// ── 유틸리티 ──
const fmt = (num) => {
    if (num === undefined || num === null) return '0';
    return Math.round(Number(num)).toLocaleString('ko-KR');
};

const fmtOrderNo = (no) => {
    // 지시서: 통합 표시(YYYYMMDD + 6자리)
    if (!no) return '-';
    const s = String(no);
    if (s.length > 14) return s.substring(0, 14);
    return s;
};

// ── 핵심 로직: 데이터 로드 및 렌더링 ──
let cachedData = {
    sales: [],
    products: [],
    mapping: []
};

async function loadAllData() {
    showToast("데이터를 동기화 중입니다...");

    // 병렬 로드
    const [sales, products, mapping] = await Promise.all([
        fetchData("sales"),
        fetchData("products"),
        fetchData("mapping")
    ]);

    cachedData = { sales, products, mapping };

    renderDashboard();
    renderSalesTable();
    renderStockTable();
    renderProductMasterTable();
    renderCharts(sales); // 차트 렌더링 추가
    showToast("데이터 업데이트 완료!");
}

function renderDashboard() {
    const sales = cachedData.sales;
    const products = cachedData.products;

    // KPI 계산
    const totalSales = sales.reduce((sum, item) => sum + Number(item['VAT제외금액'] || item['총판매가'] || 0), 0);
    // 정산예정액 위치에 '총 공헌이익'을 보여주는 것으로 템플릿 상 로직이 변경되었음
    const totalMargin = sales.reduce((sum, item) => sum + Number(item['공헌이익'] || item['실정산금액'] || 0), 0);
    const totalOrders = sales.reduce((sum, item) => sum + Number(item['판매수량'] || 1), 0);

    // 재고 부족 SKU (기초재고 < 안전재고 기준)
    const lowStockCount = products.filter(p => {
        let base = Number(p['기초재고'] || 0);
        let safe = Number(p['안전재고'] || 0);
        return base > 0 && base < safe;
    }).length;

    document.getElementById('kpi-sales').textContent = fmt(totalSales);
    document.getElementById('kpi-settlement').textContent = fmt(totalMargin);
    document.getElementById('kpi-orders').textContent = fmt(totalOrders);
    document.getElementById('kpi-lowstock').textContent = lowStockCount;

    const marginPct = document.getElementById('kpi-margin-ratio');
    if (marginPct) {
        if (totalSales > 0) {
            let ratio = (totalMargin / totalSales * 100).toFixed(1);
            marginPct.textContent = `이익률 ${ratio}%`;
            marginPct.style.color = ratio >= 0 ? 'var(--success)' : 'var(--danger)';
        } else {
            marginPct.textContent = `정산 데이터 로드됨`;
        }
    }

    // 채널별 매출 비중 (카카오+리씽크 통합)
    updateChannelBars(sales);

    // 대시보드 내 재고 요약 (상위 5개)
    const stockSummary = document.getElementById('stockSummary');
    if (stockSummary) {
        stockSummary.innerHTML = products.slice(0, 5).map(p => {
            const isLow = Number(p['기초재고'] || 0) < Number(p['안전재고'] || 0);
            return `
        <tr>
          <td>${p['자사SKU']}</td>
          <td>${p['제품명']}</td>
          <td>${fmt(p['기초재고'])}</td>
          <td><span class="status-badge" style="background: ${isLow ? '#fee2e2' : '#dcfce7'}; color: ${isLow ? '#dc2626' : '#166534'};">${isLow ? '⚠️ 부족' : '✅ 정상'}</span></td>
        </tr>
      `;
        }).join('');
    }
}

function renderSalesTable() {
    const container = document.getElementById('salesTableBody');
    if (!container) return;

    container.innerHTML = cachedData.sales.slice(0, 100).map(s => `
    <tr>
      <td>${s['팀'] || '-'}</td>
      <td><span class="tag" style="background: var(--gray-100); color: var(--gray-700);">${s['판매채널'] || '-'}</span></td>
      <td>${fmt(s['총판매가'])}</td>
      <td>${fmt(s['실정산금액'])}</td>
      <td>${fmt(s['쿠폰비'])}</td>
      <td>${fmt(s['총원가'])}</td>
      <td>${fmt(s['물류비'])}</td>
      <td>${fmt(s['판관비'])}</td>
      <td><span style="color:var(--success); font-weight:600;">${fmt(s['공헌이익'])}</span></td>
      <td>${fmt(s['공헌이익률'])}%</td>
    </tr>
  `).join('');
}

function renderStockTable() {
    // 1. 대시보드 내 상위 5개 요약 테이블 업데이트
    const summaryContainer = document.getElementById('stockSummary');
    if (summaryContainer && cachedData.products.length > 0) {
        summaryContainer.innerHTML = cachedData.products.slice(0, 5).map(p => {
            const isLow = safeNum(p['기초재고']) < safeNum(p['안전재고']);
            return `
        <tr>
          <td>${p['자사SKU'] || p['자사 SKU']}</td>
          <td>${p['제품명']}</td>
          <td>${fmt(p['기초재고'])}</td>
          <td><span class="status-badge" style="background: ${isLow ? '#fee2e2' : '#dcfce7'}; color: ${isLow ? '#dc2626' : '#166534'};">${isLow ? '⚠️ 부족' : '✅ 정상'}</span></td>
        </tr>
      `;
        }).join('');
    }

    // 2. 전체 재고 메뉴의 상세 테이블 업데이트 (재고 차감 로직 적용)
    const fullContainer = document.getElementById('inventoryTableBody');
    if (!fullContainer) return;

    if (cachedData.products.length === 0) {
        fullContainer.innerHTML = `<tr><td colspan="15" style="text-align:center; padding: 40px; color: var(--gray-400);">제품 마스터 파일 또는 시트가 업로드되지 않았습니다.</td></tr>`;
        return;
    }

    // SKU별 총 판매량 집계 (정규화된 sales 바탕)
    const salesBySku = {};
    cachedData.sales.forEach(sale => {
        let sku = String(sale['자사SKU'] || '').toUpperCase().trim();
        if (sku && !sku.includes('미매핑')) {
            salesBySku[sku] = (salesBySku[sku] || 0) + safeNum(sale['판매수량']);
        }
    });

    fullContainer.innerHTML = cachedData.products.map(p => {
        let normRow = normalizeKeys(p);
        let sku = String(normRow['자사SKU'] || '-').toUpperCase().trim();

        let distSeller = normRow['유통전문판매원'] || '-';
        let warehouse = normRow['창고명'] || normRow['물류지'] || '-';
        let storageType = normRow['보관유형'] || normRow['보관온도'] || '-';
        let category = normRow['분류'] || normRow['카테고리'] || '-';
        let prodName = normRow['상품명'] || normRow['제품명'] || '-';
        let unit = normRow['단위'] || 'EA';

        let inputQty = safeNum(normRow['입고'] || normRow['기초재고']);
        let outputQty = salesBySku[sku] || 0;
        let currentStock = inputQty - outputQty;

        let expDate = normRow['유통기한'] || normRow['소비기한'] || '-';
        let note = normRow['비고'] || '-';
        let unitCost = safeNum(normRow['단가'] || normRow['매입원가'] || normRow['상품원가'] || normRow['매입가']);

        let stockAmt = currentStock * unitCost;
        let inAmt = inputQty * unitCost;
        let outAmt = outputQty * unitCost;

        return `
        <tr>
          <td>${distSeller}</td>
          <td>${warehouse}</td>
          <td>${storageType}</td>
          <td>${category}</td>
          <td style="cursor: pointer; color: var(--primary); text-decoration: underline;" onclick="openProductModal('${sku}')"><strong>${sku}</strong></td>
          <td style="cursor: pointer; color: var(--primary); text-decoration: underline;" onclick="openProductModal('${sku}')">${prodName}</td>
          <td>${unit}</td>
          <td>${fmt(inputQty)}</td>
          <td>${fmt(outputQty)}</td>
          <td><strong>${fmt(currentStock)}</strong></td>
          <td>${expDate}</td>
          <td>${note}</td>
          <td>${fmt(unitCost)}</td>
          <td>${fmt(stockAmt)}</td>
          <td>${fmt(inAmt)}</td>
          <td>${fmt(outAmt)}</td>
        </tr>
      `;
    }).join('');
}

function renderProductMasterTable() {
    const fullContainer = document.getElementById('productMasterTableBody');
    if (!fullContainer) return;

    if (!cachedData.products || cachedData.products.length === 0) {
        fullContainer.innerHTML = `<tr><td colspan="26" style="text-align:center; padding: 40px; color: var(--gray-400);">제품 마스터 파일 또는 시트가 업로드되지 않았습니다.</td></tr>`;
        return;
    }

    fullContainer.innerHTML = cachedData.products.map(p => {
        let normRow = normalizeKeys(p);

        const getV = (keys) => {
            for (let k of keys) {
                if (normRow[k] !== undefined && normRow[k] !== '') return normRow[k];
            }
            return '-';
        };

        const getNum = (keys) => {
            let v = getV(keys);
            return '-';
        };

        let rowSku = getV(['상품코드', '자사SKU']);

        return `
        <tr style="cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''" onclick="openProductModal('${rowSku}')">
            <td><strong>${rowSku}</strong></td>
            <td>${getV(['제품명', '상품명'])}</td>
            <td>${getV(['카테고리', '분류'])}</td>
            <td>${getNum(['매입원가', '단가'])}</td>
            <td>${getV(['물류사'])}</td>
            <td>${getV(['브랜드'])}</td>
            <td>${getV(['출시일'])}</td>
            <td>${getV(['중량'])}</td>
            <td>${getV(['보관온도', '보관유형'])}</td>
            <td>${getV(['소비기한', '유통기한'])}</td>
            <td>${getV(['식품유형'])}</td>
            <td>${getV(['면/과세', '과/면세'])}</td>
            <td>${getV(['품목바코드', '바코드'])}</td>
            <td>${getNum(['제조원가'])}</td>
            <td>${getNum(['로얄티'])}</td>
            <td>${getNum(['상품원가'])}</td>
            <td>${getV(['유통전문판매원'])}</td>
            <td>${getV(['제조사'])}</td>
            <td>${getV(['물류지', '창고명'])}</td>
            <td>${getV(['발주리드타임', '리드타임'])}</td>
            <td>${getNum(['입수', '박스입수'])}</td>
            <td>${getNum(['적재수/1PLT', '적재수'])}</td>
            <td>${getV(['제품규격_가로', '가로'])}</td>
            <td>${getV(['제품규격_세로', '세로'])}</td>
            <td>${getV(['제품규격_높이', '높이'])}</td>
            <td>${getNum(['MOQ'])}</td>
        </tr>
        `;
    }).join('');
}

let currentEditSku = null;
let isEditMode = false;

window.openProductModal = function (sku) {
    if (!cachedData.products) return;
    currentEditSku = sku;
    const product = cachedData.products.find(p => {
        let nRow = normalizeKeys(p);
        let pSku = String(nRow['자사SKU'] || '-').toUpperCase().trim();
        return pSku === sku;
    });

    if (!product) return;
    let normRow = normalizeKeys(product);

    const fields = [
        { label: '상품코드', key: ['상품코드', '자사SKU'] },
        { label: '제품명', key: ['제품명', '상품명'] },
        { label: '카테고리', key: ['카테고리', '분류'] },
        { label: '매입원가', key: ['매입원가', '단가'] },
        { label: '물류사', key: ['물류사'] },
        { label: '브랜드', key: ['브랜드'] },
        { label: '출시일', key: ['출시일'] },
        { label: '중량', key: ['중량'] },
        { label: '보관온도', key: ['보관온도', '보관유형'] },
        { label: '소비기한', key: ['소비기한', '유통기한'] },
        { label: '식품유형', key: ['식품유형'] },
        { label: '면/과세', key: ['면/과세', '과/면세'] },
        { label: '품목바코드', key: ['품목바코드', '바코드'] },
        { label: '제조원가', key: ['제조원가'] },
        { label: '로얄티', key: ['로얄티'] },
        { label: '상품원가', key: ['상품원가'] },
        { label: '유통전문판매원', key: ['유통전문판매원'] },
        { label: '제조사', key: ['제조사'] },
        { label: '물류지', key: ['물류지', '창고명'] },
        { label: '발주리드타임', key: ['발주리드타임', '리드타임'] },
        { label: '입수', key: ['입수', '박스입수'] },
        { label: '적재수/1PLT', key: ['적재수/1PLT', '적재수'] },
        { label: '제품규격_가로', key: ['제품규격_가로', '가로'] },
        { label: '제품규격_세로', key: ['제품규격_세로', '세로'] },
        { label: '제품규격_높이', key: ['제품규격_높이', '높이'] },
        { label: 'MOQ', key: ['MOQ'] }
    ];

    const contentDiv = document.getElementById('productDetailContent');
    contentDiv.innerHTML = fields.map(f => {
        let val = '-';
        for (let k of f.key) {
            if (normRow[k] !== undefined && normRow[k] !== '') {
                val = normRow[k];
                break;
            }
        }
        if (typeof val === 'number' || (!isNaN(parseFloat(val)) && isFinite(val) && (f.label.includes('원가') || f.label.includes('로얄티') || f.label.includes('MOQ')))) {
            val = fmt(safeNum(val));
        }
        return `
            <div style="padding: 12px; border-bottom: 1px solid var(--gray-200);">
                <div style="font-size: 12px; color: var(--gray-500); margin-bottom: 4px;">${f.label}</div>
                <div style="font-size: 14px; font-weight: 500; color: var(--gray-800);">${val}</div>
            </div>
        `;
    }).join('');

    document.getElementById('productDetailModal').style.display = 'flex';
};

window.closeProductModal = function () {
    document.getElementById('productDetailModal').style.display = 'none';
}

window.editProductDetail = function () {
    const productArrIndex = cachedData.products.findIndex(p => {
        let nRow = normalizeKeys(p);
        let pSku = String(nRow['자사SKU'] || '-').toUpperCase().trim();
        return pSku === currentEditSku;
    });

    if (productArrIndex === -1) return;

    closeProductModal();
    isEditMode = true;
    document.getElementById('productFormTitle').textContent = "제품 정보 수정";
    const form = document.forms['productAddForm'];

    // Populate existing values
    const p = cachedData.products[productArrIndex];
    let nRow = normalizeKeys(p);

    // We map the keys used in our 26 fields back to the form
    const inputs = form.elements;
    for (let input of inputs) {
        if (!input.name) continue; // skip buttons etc.
        let valKey = input.name;
        // Basic mapping attempt: if they change '제품명' the original might be under '상품명'
        // Just map standard names defined in our input forms directly to nRow if it exists
        // Wait, different files have different column headers. Since we normalize strings, we need a robust map logic here.
        let val = '';

        switch (input.name) {
            case '상품코드': val = nRow['자사SKU'] || nRow['상품코드'] || ''; break;
            case '제품명': val = nRow['상품명'] || nRow['제품명'] || ''; break;
            case '카테고리': val = nRow['분류'] || nRow['카테고리'] || ''; break;
            case '보관온도': val = nRow['보관유형'] || nRow['보관온도'] || ''; break;
            case '소비기한': val = nRow['유통기한'] || nRow['소비기한'] || ''; break;
            case '면/과세': val = nRow['과/면세'] || nRow['면/과세'] || ''; break;
            case '품목바코드': val = nRow['바코드'] || nRow['품목바코드'] || ''; break;
            case '물류지': val = nRow['창고명'] || nRow['물류지'] || ''; break;
            case '발주리드타임': val = nRow['리드타임'] || nRow['발주리드타임'] || ''; break;
            case '입수': val = nRow['박스입수'] || nRow['입수'] || ''; break;
            case '적재수': val = nRow['적재수/1PLT'] || nRow['적재수'] || ''; break;
            case '제품규격_가로': val = nRow['가로'] || nRow['제품규격_가로'] || ''; break;
            case '제품규격_세로': val = nRow['세로'] || nRow['제품규격_세로'] || ''; break;
            case '제품규격_높이': val = nRow['높이'] || nRow['제품규격_높이'] || ''; break;
            case '매입원가': val = nRow['단가'] || nRow['매입원가'] || ''; break;
            default: val = nRow[input.name] || ''; break;
        }

        input.value = val;
    }

    document.getElementById('productAddModal').style.display = 'flex';
}

window.openProductAddModal = function () {
    isEditMode = false;
    document.getElementById('productFormTitle').textContent = "제품 정보 입력";
    document.forms['productAddForm'].reset();
    document.getElementById('productAddModal').style.display = 'flex';
}

window.closeProductAddModal = function () {
    document.getElementById('productAddModal').style.display = 'none';
}

window.saveProduct = function (event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const updatedProduct = {};
    for (const [key, value] of formData.entries()) {
        // Map the inputs to standardized keys so logic treats them well
        let newKey = key;
        if (key === '상품코드') newKey = '자사SKU';
        if (key === '제품명') newKey = '품목명'; // Wait, let's keep consistency with the original data keys or stick to what form has. The other functions use normalizeKeys and check both. So adding them verbatim is fine.
        updatedProduct[key] = value;
    }

    if (isEditMode) {
        const productArrIndex = cachedData.products.findIndex(p => {
            let nRow = normalizeKeys(p);
            let pSku = String(nRow['자사SKU'] || '-').toUpperCase().trim();
            return pSku === currentEditSku;
        });

        if (productArrIndex !== -1) {
            // Keep original data but overwrite with new form fields
            cachedData.products[productArrIndex] = { ...cachedData.products[productArrIndex], ...updatedProduct };
            showToast("품목 정보가 안전하게 수정되었습니다.");
        }
    } else {
        cachedData.products.unshift(updatedProduct);
        showToast("새로운 품목이 로컬 환경에 임시 등록되었습니다.");
    }

    // Refresh tables
    renderProductMasterTable();
    renderStockTable();

    // Close modal & reset
    closeProductAddModal();
    event.target.reset();
}

// ── 테이블 정렬 로직 ──
function updateChannelBars(sales) {
    const container = document.getElementById('channelBars');
    if (!container) return;

    const channels = {};
    sales.forEach(item => {
        let channel = item['판매채널'];
        // 채널별 매출 비중 지표는 VAT제외 총매출액 기준으로 표시
        channels[channel] = (channels[channel] || 0) + Number(item['VAT제외금액'] || item['총판매가'] || 0);
    });

    const total = Object.values(channels).reduce((a, b) => a + b, 0);

    container.innerHTML = Object.entries(channels)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => {
            const pct = total > 0 ? (value / total * 100).toFixed(1) : 0;
            return `
        <div class="channel-bar-item">
          <div class="channel-name">${name}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${pct}%; background: var(--primary);"></div>
          </div>
          <div class="bar-value">${pct}%</div>
        </div>
      `;
        }).join('');
}

// ── 인증 로직 ──
// MSAL 관련 함수는 제거됨. loginWithCredentials 및 loginDemo 함수를 사용.

function safeNum(val) {
    if (val === undefined || val === null) return 0;
    let s = String(val).trim().replace(/,/g, '');
    if (s === '-' || s === '') return 0;
    return Number(s) || 0;
}

// ── 필수 유틸: 객체 키 공백 제거 매핑 ──
function normalizeKeys(obj) {
    const newObj = {};
    for (let key in obj) {
        let cleanKey = String(key).replace(/\s+/g, '').trim();
        newObj[cleanKey] = obj[key];
    }
    return newObj;
}

// ── P&L 자동 계산 및 정규화 엔진 (Javascript) ──
function processRawSalesData(rawSales, productsMaster, mappingMaster, fileName = "") {
    // 상품 마스터 딕셔너리 구성 (SKU -> 원가)
    const cogsDict = {};
    if (productsMaster) {
        productsMaster.forEach(p => {
            let row = normalizeKeys(p);
            const sku = row['자사SKU'];
            if (sku) {
                cogsDict[sku] = safeNum(row['매입원가'] || row['상품원가']);
            }
        });
    }

    // 매핑 딕셔너리 구성 (채널+채널상품코드 -> 자사SKU 및 세트수량)
    const mapDict = {};
    if (mappingMaster) {
        mappingMaster.forEach(m => {
            let row = normalizeKeys(m);
            const key = String(row['채널명'] || '기타').trim() + "_" + String(row['채널상품코드'] || '').trim();
            mapDict[key] = {
                sku: row['자사SKU'] || '미매핑',
                multiplier: safeNum(row['세트수량(1세트당SKU개수)'] || row['세트수량'] || 1)
            };
        });
    }

    const processed = [];
    rawSales.forEach(r => {
        let row = normalizeKeys(r);

        // 빈 행 무시 (주문에 필수적인 키가 모두 없는 경우만 무시)
        if (!row['판매채널'] && !row['Channel'] && !row['구분'] && !row['주문번호'] && !row['단품코드'] && !row['방송일자'] && !row['자사SKU']) return;

        let channel = String(row['판매채널'] || row['Channel'] || '기타').trim();

        // 파일명 및 고유 컬럼명을 통한 채널 자동 인식 (동적 매핑 보강)
        if (channel === '기타') {
            if (fileName.includes('SK') || row['단품코드'] || row['방송일자'] || row['상품명']?.includes('스토아')) {
                channel = 'SK스토아';
            } else if (fileName.includes('카카오') || row['카카오주문번호'] || row['주문번호(카카오)']) {
                channel = '카카오';
            } else if (fileName.includes('네이버') || row['스마트스토어'] || row['가맹점']) {
                channel = '네이버';
            } else if (fileName.includes('쿠팡') || row['발주서번호'] || row['로켓그로스']) {
                channel = '쿠팡';
            } else if (fileName.includes('리씽크') || row['리씽크']) {
                channel = '리씽크';
            }
        }

        let orderNo = String(row['주문번호'] || row['주문일련번호'] || row['순번'] || `MOCK-${Math.floor(Math.random() * 100000)}`);

        // 플랫폼별 고유 상품코드 컬럼 우선순위 로직 보강
        let channelItemCode = '';
        if (row['옵션ID'] && channel === '카카오') channelItemCode = String(row['옵션ID']).trim();
        else if (row['상품번호'] && channel === '네이버') channelItemCode = String(row['상품번호']).trim();
        else if (row['등록상품명'] || row['옵션아이디']) channelItemCode = String(row['등록상품명'] || row['옵션아이디']).trim();
        else channelItemCode = String(row['상품코드'] || row['단품코드'] || row['채널상품코드'] || '').trim();

        let mapKey = channel + "_" + channelItemCode;
        let mapped = mapDict[mapKey];

        // 만약 일반적인 코드로 조회 실패시, row 안의 값 중 하나라도 mapping master에 역으로 존재하는지 폴백 탐색
        if (!mapped && channel !== '기타') {
            for (let k in row) {
                let testVal = String(row[k]).trim();
                let fallbackKey = channel + "_" + testVal;
                if (mapDict[fallbackKey]) {
                    mapped = mapDict[fallbackKey];
                    break;
                }
            }
        }

        // 자동 매핑 추론 및 일자별 실적 하드코딩된 자사SKU 처리
        if (row['자사SKU'] && row['자사SKU'] !== '미매핑') {
            // 이미 자사SKU가 명시적으로 있는 경우 (일자별 실적)
            mapped = { sku: row['자사SKU'], multiplier: 1 };
        } else if (!mapped) {
            let itemName = row['상품명'] || row['방송구성'] || '';
            if (itemName.includes('양념 본갈비') || itemName.includes('양념갈비')) {
                let qtyMatch = itemName.match(/(\d+)팩|(\d+)개/);
                let fallbackMult = qtyMatch ? Number(qtyMatch[1] || qtyMatch[2]) : 1;
                mapped = { sku: 'SKU001', multiplier: fallbackMult };
            } else {
                mapped = { sku: '미매핑', multiplier: 1 };
            }
        }

        let nativeSku = mapped.sku;
        let multiplier = mapped.multiplier;

        // 원가 계산 (세트 적용) : 기본 7687원 (마스터 누락시 Fallback)
        let unitCost = cogsDict[nativeSku] || 7687;

        // 엑셀 내 숫자 값 안전하게 파싱
        let soldQty = safeNum(row['판매수량'] || row['순주문량'] || row['수량'] || row['매출수량'] || row['배송수량']);
        let totalSalesPrice = safeNum(row['총판매가'] || row['차감전매출'] || row['매출액'] || row['매출금액'] || row['판매가기준주문금액'] || row['고객결제금액']);
        let actualSettlement = safeNum(row['실정산금액'] || row['차감후매출'] || row['정산예정액'] || row['정산금액'] || row['지급대상금액'] || row['벤더사지급대금']);

        // 부가세 제외 정규화
        let vatExcluded = totalSalesPrice;
        let isTaxFree = (row['과/면세'] === '면세' || row['면/과세'] === '면세') ? true : false;
        if (!isTaxFree && totalSalesPrice > 0) {
            vatExcluded = Math.round(totalSalesPrice / 1.1);
        }

        let totalCogs = unitCost * multiplier * soldQty;

        let logisticCost = safeNum(row['물류비']);
        let salesExp = safeNum(row['판관비'] || row['판매비'] || row['수수료'] || row['수수료금액']);
        let couponFee = safeNum(row['쿠폰비']);

        // 공헌이익 계산: 엑셀에 공헌이익 열이 명확히 있다면 우선 채택, 아니면 차감 후 정산액에서 원가+비용 뺌
        let rawMargin = row['공헌이익'];
        let margin = 0;
        if (rawMargin !== undefined && rawMargin !== '') {
            margin = safeNum(rawMargin);
        } else {
            // 수동 계산: 실제 들어오는 돈 - 내보내야 할 원가 - 별도 물류비 - 별도 판매비
            let baseRevenue = actualSettlement !== 0 ? actualSettlement : totalSalesPrice;
            margin = baseRevenue - totalCogs - logisticCost - salesExp - couponFee;
        }

        // 공헌이익률 계산
        let marginRatio = safeNum(row['공헌이익률']);
        if (!row['공헌이익률'] && totalSalesPrice > 0) {
            marginRatio = ((margin / totalSalesPrice) * 100).toFixed(1);
        } else if (!row['공헌이익률']) {
            marginRatio = 0;
        }

        let dateStr = row['주문일'] || row['결제일'] || row['방송일자'] || row['매출일자'] || row['일자'] || row['완료일'];
        if (!dateStr && row['연']) {
            dateStr = `${row['연']}-${String(row['월'] || '1').padStart(2, '0')}-01`;
        } else if (!dateStr) {
            dateStr = '-';
        }

        processed.push({
            '팀': row['팀'] || 'E-Commerce',
            '판매채널': channel,
            '주문번호': orderNo,
            '주문일': dateStr,
            '자사SKU': nativeSku,
            '판매수량': soldQty,
            '총판매가': totalSalesPrice,
            '실정산금액': Math.max(actualSettlement, 0),
            'VAT제외금액': vatExcluded,
            '총원가': totalCogs,
            '물류비': logisticCost,
            '판관비': salesExp,
            '쿠폰비': couponFee,
            '공헌이익': margin,
            '공헌이익률': marginRatio
        });
    });

    return processed;
}

// ── 데이터 자동 탐색 및 헤더 스캐너 ──
function getSheetDataWithDynamicHeader(workbook, sheetName) {
    if (!sheetName || !workbook.Sheets[sheetName]) return [];

    // 1. 먼저 2차원 배열로 전체 시트를 읽어 헤더가 몇 번째 줄에 있는지 스캔
    const rawMatrix = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    let headerRowIndex = 0;

    for (let i = 0; i < Math.min(20, rawMatrix.length); i++) {
        let rowStr = (rawMatrix[i] || []).join('').replace(/\s/g, '');
        // 헤더로 짐작되는 주요 키워드들이 많이 포함되어 있는지 확인
        if (rowStr.includes('판매채널') || rowStr.includes('Channel') || rowStr.includes('순주문량') || rowStr.includes('주문번호') || rowStr.includes('자사SKU') || rowStr.includes('상품코드') || rowStr.includes('정산금액') || rowStr.includes('단품코드') || rowStr.includes('매출액') || rowStr.includes('매출수량')) {
            headerRowIndex = i;
            break;
        }
    }

    // 2. 찾은 헤더 스킵 인덱스(range)를 사용해 JSON 변환
    return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { range: headerRowIndex, defval: "" });
}

// ── 파일 업로드 및 동적 다중 시트 파싱 (SheetJS) ──
document.getElementById('fileUpload')?.addEventListener('click', function (e) {
    e.target.value = null; // 동일한 파일을 다시 선택해도 change 이벤트가 발생하도록 초기화
});

document.getElementById('fileUpload')?.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    console.log("=== EXCEL UPLOAD STARTED ===");
    console.log("File name:", file.name);

    const reader = new FileReader();
    reader.onload = function (e) {
        showToast("파일을 깊이 탐색하고 P&L을 연산하는 중입니다...");
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            console.log("Workbook Sheets found:", workbook.SheetNames);

            // 시트 이름 동적 탐색: '정규화'나 '통합' 시트를 최우선으로 찾고 없으면 'RAW'나 '원본' 탐색
            let salesSheetName = workbook.SheetNames.find(n => n.includes('정규화') || n.includes('통합'))
                || workbook.SheetNames.find(n => n.includes('RAW') || n.includes('원본') || n.includes('판매'));
            let productSheetName = workbook.SheetNames.find(n => n.includes('제품마스터'));
            let mappingSheetName = workbook.SheetNames.find(n => n.includes('채널매핑'));

            // 이름 매칭에 실패하면 무조건 첫번째 시트를 로우데이터로 간주
            if (!salesSheetName && workbook.SheetNames.length > 0) salesSheetName = workbook.SheetNames[0];

            console.log("Selected sales sheet:", salesSheetName);
            console.log("Selected product sheet:", productSheetName);
            console.log("Selected mapping sheet:", mappingSheetName);

            // 1. 기준 정보 갱신 (파일 내에 포함되어 있을 경우 동적 헤더 스캔 적용)
            if (productSheetName) {
                cachedData.products = getSheetDataWithDynamicHeader(workbook, productSheetName);
                console.log("Products parsed. Count:", cachedData.products.length);
            }
            if (mappingSheetName) {
                cachedData.mapping = getSheetDataWithDynamicHeader(workbook, mappingSheetName);
                console.log("Mapping parsed. Count:", cachedData.mapping.length);
            }

            // 2. 판매 데이터 갱신 및 AI 자동 계산 엔진 태우기
            if (salesSheetName) {
                const rawSales = getSheetDataWithDynamicHeader(workbook, salesSheetName);
                console.log("Raw Sales basic parse count:", rawSales.length);
                if (rawSales.length > 0) console.log("First row sample:", rawSales[0]);

                cachedData.sales = processRawSalesData(rawSales, cachedData.products, cachedData.mapping, file.name);
                console.log("Processed Sales count:", cachedData.sales.length);
                if (cachedData.sales.length > 0) console.log("Processed first row sample:", cachedData.sales[0]);
            }

            renderDashboard();
            renderSalesTable();
            renderStockTable();
            renderProductMasterTable();
            renderCharts(cachedData.sales); // 차트 렌더링 추가
            showToast("데이터 변환 및 이익률 반영이 완벽하게 완료되었습니다!");
            console.log("=== EXCEL UPLOAD SUCCESS ===");
        } catch (err) {
            console.error(err);
            console.log("=== EXCEL UPLOAD FAILED ===");
            alert("엑셀 파일 파싱 중 오류가 발생했습니다: " + err.message);
        }
    };
    reader.readAsArrayBuffer(file);
});

// 앱 초기화 로직
window.addEventListener('load', async () => {
    // 하드코딩된 로그인 시스템이므로 MSAL 초기화 불필요. 
    // 기본적으로 #screen-login이 표시되도록 index.html에 세팅되어 있음.
});

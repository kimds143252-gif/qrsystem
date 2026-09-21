const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
// 메뉴 이미지(base64)까지 포함될 수 있으므로 JSON 요청 용량을 넉넉하게 허용합니다.
app.use(express.json({ limit: '20mb' }));
app.use(express.static('public'));

// 주문 폴더 생성
const ordersDir = path.join(__dirname, 'orders');
if (!fs.existsSync(ordersDir)) {
    fs.mkdirSync(ordersDir, { recursive: true });
}

// 메뉴 데이터 - 금별맥주 완전 메뉴판
const menus = [
    // 일품요리
    {
        id: 1,
        name: '닭안심 유린기',
        category: '일품요리',
        price: 16900,
        icon: '🍗'
    },
    {
        id: 2,
        name: '반건조 감오징어 버터구이',
        category: '일품요리',
        price: 29000,
        icon: '🦑'
    },
    {
        id: 3,
        name: '롱징어 냉우동',
        category: '일품요리',
        price: 13900,
        icon: '🍜'
    },
    {
        id: 4,
        name: '쫑득 분모자 불소지',
        category: '일품요리',
        price: 22000,
        icon: '🥬'
    },
    {
        id: 5,
        name: '한우 육회와 감태',
        category: '일품요리',
        price: 21000,
        icon: '🥩'
    },
    
    // 경양식
    {
        id: 6,
        name: '토마토해장파스탕',
        category: '경양식',
        price: 24000,
        icon: '🍝'
    },
    {
        id: 7,
        name: '매콤명란크림새우파스타',
        category: '경양식',
        price: 16900,
        icon: '🍤'
    },
    {
        id: 8,
        name: '사모닉! 깜바스',
        category: '경양식',
        price: 16900,
        icon: '🦐'
    },
    {
        id: 9,
        name: '찹찹한 명란구이',
        category: '경양식',
        price: 14900,
        icon: '✨'
    },

    // 떠먹는안주
    {
        id: 10,
        name: '모둠 소시지 우대찌개',
        category: '떠먹는안주',
        price: 24000,
        icon: '🌶️'
    },
    {
        id: 11,
        name: '물덕 모둑찌 어묵탕',
        category: '떠먹는안주',
        price: 23000,
        icon: '🍢'
    },

    // 치킨/피자
    {
        id: 12,
        name: '핫크리스피치킨',
        category: '치킨/피자',
        price: 22000,
        icon: '🍗'
    },
    {
        id: 13,
        name: '핫 페퍼로니 피자',
        category: '치킨/피자',
        price: 13900,
        icon: '🍕'
    },
    {
        id: 14,
        name: '블로기피자',
        category: '치킨/피자',
        price: 13900,
        icon: '🍕'
    },

    // 튀김/뀨긴안주
    {
        id: 15,
        name: '바싸바싹떡테구이',
        category: '튀김/뀨긴안주',
        price: 18000,
        icon: '🍖'
    },
    {
        id: 16,
        name: '소시지와 감자',
        category: '튀김/뀨긴안주',
        price: 10900,
        icon: '🍟'
    },
    {
        id: 17,
        name: '모둠감자튀김',
        category: '튀김/뀨긴안주',
        price: 13900,
        icon: '🍟'
    },
    {
        id: 18,
        name: '오징어라라아께',
        category: '튀김/뀨긴안주',
        price: 9900,
        icon: '🦑'
    },
    {
        id: 19,
        name: '허니칠리 김가라아께',
        category: '튀김/뀨긴안주',
        price: 11900,
        icon: '🌶️'
    },
    {
        id: 20,
        name: '핫 칠리 버팔로윙',
        category: '튀김/뀨긴안주',
        price: 18000,
        icon: '🍗'
    },

    // 마른안주
    {
        id: 21,
        name: '부드러운 한치구이',
        category: '마른안주',
        price: 21000,
        icon: '🦑'
    },
    {
        id: 22,
        name: '참 쉬포구이',
        category: '마른안주',
        price: 9900,
        icon: '🐚'
    },
    {
        id: 23,
        name: '쫑쫑한 버터오징어',
        category: '마른안주',
        price: 14900,
        icon: '🦑'
    },

    // 생맥주/병맥주
    {
        id: 24,
        name: '테라 생맥주 380cc',
        category: '생맥주/병맥주',
        price: 4500,
        icon: '🍺'
    },
    {
        id: 25,
        name: '테라 생맥주 500cc',
        category: '생맥주/병맥주',
        price: 4900,
        icon: '🍺'
    },
    {
        id: 26,
        name: '칼스버그',
        category: '생맥주/병맥주',
        price: 7500,
        icon: '🍺'
    },
    {
        id: 27,
        name: '기네스',
        category: '생맥주/병맥주',
        price: 7500,
        icon: '🍺'
    },
    {
        id: 28,
        name: '아사히',
        category: '생맥주/병맥주',
        price: 7500,
        icon: '🍺'
    },
    {
        id: 29,
        name: '테라병맥주',
        category: '생맥주/병맥주',
        price: 5000,
        icon: '🍺'
    },
    {
        id: 30,
        name: '켈리병맥주',
        category: '생맥주/병맥주',
        price: 5000,
        icon: '🍺'
    },
    {
        id: 31,
        name: '카스병맥주',
        category: '생맥주/병맥주',
        price: 5500,
        icon: '🍺'
    },
    {
        id: 32,
        name: '기린이치반 생맥주',
        category: '생맥주/병맥주',
        price: 7900,
        icon: '🍺'
    },

    // 음료/에이드
    {
        id: 33,
        name: '자몽에이드',
        category: '음료/에이드',
        price: 5500,
        icon: '🥤'
    },
    {
        id: 34,
        name: '청포도에이드',
        category: '음료/에이드',
        price: 5500,
        icon: '🥤'
    },
    {
        id: 35,
        name: '토닉워터',
        category: '음료/에이드',
        price: 3000,
        icon: '💧'
    },
    {
        id: 36,
        name: '진저에일',
        category: '음료/에이드',
        price: 3000,
        icon: '💧'
    },
    {
        id: 37,
        name: '청금 맥주',
        category: '음료/에이드',
        price: 6000,
        icon: '🍺'
    },
    {
        id: 38,
        name: '자몽맥주',
        category: '음료/에이드',
        price: 6000,
        icon: '🍺'
    },
    {
        id: 39,
        name: '청포도맥주',
        category: '음료/에이드',
        price: 6000,
        icon: '🍺'
    },
    {
        id: 40,
        name: '달콤 벌꿀맥주',
        category: '음료/에이드',
        price: 5500,
        icon: '🍯'
    },
    {
        id: 41,
        name: '하이트제로 무알콜',
        category: '음료/에이드',
        price: 3500,
        icon: '🍺'
    },
    {
        id: 42,
        name: '카스병맥주 (논알콜)',
        category: '음료/에이드',
        price: 4000,
        icon: '🍺'
    },

    // 소주/프리미엄
    {
        id: 43,
        name: '진로',
        category: '소주/프리미엄',
        price: 5000,
        icon: '🥃'
    },
    {
        id: 44,
        name: '진로 골드',
        category: '소주/프리미엄',
        price: 5000,
        icon: '🥃'
    },
    {
        id: 45,
        name: '참이슬',
        category: '소주/프리미엄',
        price: 5000,
        icon: '🥃'
    },
    {
        id: 46,
        name: '새로',
        category: '소주/프리미엄',
        price: 5000,
        icon: '🥃'
    },
    {
        id: 47,
        name: '처음처럼',
        category: '소주/프리미엄',
        price: 5000,
        icon: '🥃'
    },
    {
        id: 48,
        name: '참이슬 오리지널',
        category: '소주/프리미엄',
        price: 5000,
        icon: '🥃'
    },
    {
        id: 49,
        name: '새로 삼굽',
        category: '소주/프리미엄',
        price: 5000,
        icon: '🥃'
    },
    {
        id: 50,
        name: '선양소주',
        category: '소주/프리미엄',
        price: 5000,
        icon: '🥃'
    },
    {
        id: 51,
        name: '선양오크',
        category: '소주/프리미엄',
        price: 6000,
        icon: '🥃'
    },
    {
        id: 52,
        name: '청하',
        category: '소주/프리미엄',
        price: 6000,
        icon: '🥃'
    },
    {
        id: 53,
        name: '별빛청하',
        category: '소주/프리미엄',
        price: 6000,
        icon: '🥃'
    },
    {
        id: 54,
        name: '국순당쌀막걸리',
        category: '소주/프리미엄',
        price: 5000,
        icon: '🥃'
    },
    {
        id: 55,
        name: '한라산',
        category: '소주/프리미엄',
        price: 6000,
        icon: '🥃'
    },
    {
        id: 56,
        name: '일품진로',
        category: '소주/프리미엄',
        price: 31000,
        icon: '🥃'
    },
    {
        id: 57,
        name: '화요 25도',
        category: '소주/프리미엄',
        price: 32000,
        icon: '🥃'
    },
    {
        id: 58,
        name: '일품진로SET',
        category: '소주/프리미엄',
        price: 36000,
        icon: '🥃'
    },
    {
        id: 59,
        name: '화요SET',
        category: '소주/프리미엄',
        price: 37000,
        icon: '🥃'
    },
    {
        id: 60,
        name: '제임슨 아이리슈 하이볼',
        category: '소주/프리미엄',
        price: 8500,
        icon: '🥃'
    },
    {
        id: 61,
        name: '피치 하이볼',
        category: '소주/프리미엄',
        price: 8500,
        icon: '🥃'
    },
    {
        id: 62,
        name: '발렌타인 하이볼',
        category: '소주/프리미엄',
        price: 8500,
        icon: '🥃'
    },
    {
        id: 63,
        name: '얼그레이 하이볼',
        category: '소주/프리미엄',
        price: 8500,
        icon: '🥃'
    }
];

// ================================
// 영구 데이터 저장소
// ================================
// 메뉴/디자인은 이제 브라우저 localStorage가 아니라 서버의 data 폴더에 저장됩니다.
const dataDir = path.join(__dirname, 'data');
const menusFile = path.join(dataDir, 'menus.json');
const designFile = path.join(dataDir, 'design.json');
const categoriesFile = path.join(dataDir, 'categories.json');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const seedMenus = JSON.parse(JSON.stringify(menus));
const defaultDesign = {
    headerColor: '#d32f2f',
    accentColor: '#ff6f00',
    textColor: '#333',
    bgColor: '#f5f5f5',
    headerText: '🍺 금별맥주',
    subText: '야장 QR 주문 시스템'
};

function saveJson(filePath, data) {
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
}

function loadJson(filePath, fallback) {
    try {
        if (!fs.existsSync(filePath)) return JSON.parse(JSON.stringify(fallback));
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (error) {
        console.error(`데이터 로드 실패: ${filePath}`, error);
        return JSON.parse(JSON.stringify(fallback));
    }
}

// 서버 시작 시 저장된 메뉴가 있으면 불러오고, 처음 실행이면 기본 메뉴를 저장합니다.
const savedMenus = loadJson(menusFile, seedMenus);
menus.length = 0;
menus.push(...savedMenus);
if (!fs.existsSync(menusFile)) saveJson(menusFile, menus);

// 카테고리도 서버에 영구 저장합니다. 기존 메뉴의 카테고리에서 초기 생성됩니다.
let categories = loadJson(categoriesFile, [...new Set(menus.map(m => m.category).filter(Boolean))]);
if (!Array.isArray(categories)) categories = [...new Set(menus.map(m => m.category).filter(Boolean))];
categories = categories.filter(Boolean).map(String);
for (const category of menus.map(m => m.category).filter(Boolean)) {
    if (!categories.includes(category)) categories.push(category);
}
saveJson(categoriesFile, categories);

// 디자인 설정도 서버에 저장합니다.
let designSettings = loadJson(designFile, defaultDesign);
if (!fs.existsSync(designFile)) saveJson(designFile, designSettings);

// 라우트: 메뉴 조회
app.get('/api/menus', (req, res) => {
    res.json(menus);
});

// 라우트: 메뉴 전체 저장 (관리자용)
app.put('/api/menus', (req, res) => {
    try {
        const newMenus = req.body;
        if (!Array.isArray(newMenus)) {
            return res.status(400).json({ error: '메뉴 데이터 형식이 올바르지 않습니다.' });
        }

        for (const menu of newMenus) {
            if (!menu || !Number.isInteger(Number(menu.id)) || !menu.name || !Number.isFinite(Number(menu.price)) || !menu.category) {
                return res.status(400).json({ error: '메뉴 데이터에 필수 항목이 없습니다.' });
            }
        }

        menus.length = 0;
        menus.push(...newMenus.map(menu => ({
            ...menu,
            id: Number(menu.id),
            price: Number(menu.price)
        })));
        saveJson(menusFile, menus);

        res.json({ success: true, menus });
    } catch (error) {
        console.error('메뉴 저장 오류:', error);
        res.status(500).json({ error: '메뉴 저장에 실패했습니다.' });
    }
});

// 라우트: 디자인 설정 조회
// 카테고리 조회
app.get('/api/categories', (req, res) => {
    res.json(categories);
});

// 카테고리 저장/이름 변경
app.put('/api/categories', (req, res) => {
    try {
        const incoming = req.body;
        if (!Array.isArray(incoming)) return res.status(400).json({ error: '카테고리 데이터가 올바르지 않습니다.' });
        const cleaned = incoming.map(c => String(c || '').trim()).filter(Boolean);
        if (new Set(cleaned).size !== cleaned.length) return res.status(400).json({ error: '중복된 카테고리가 있습니다.' });
        if (cleaned.length === 0) return res.status(400).json({ error: '카테고리는 최소 1개가 필요합니다.' });
        categories = cleaned;
        saveJson(categoriesFile, categories);
        res.json({ success: true, categories });
    } catch (error) {
        console.error('카테고리 저장 오류:', error);
        res.status(500).json({ error: '카테고리 저장에 실패했습니다.' });
    }
});

// 현재 서버에서 고객 휴대폰이 접근할 수 있는 LAN 주소를 알려줍니다.
function getLanIPv4() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const info of interfaces[name] || []) {
            if (info.family === 'IPv4' && !info.internal && !info.address.startsWith('169.254.')) return info.address;
        }
    }
    return null;
}

app.get('/api/access-info', (req, res) => {
    const lanIp = getLanIPv4();
    res.json({
        port: PORT,
        lanIp,
        lanUrl: lanIp ? `http://${lanIp}:${PORT}/?table=테이블번호` : null,
        onlineUrl: 'https://andone-order.com/?table=테이블번호',
        browserOrigin: `${req.protocol}://${req.get('host')}`
    });
});

app.get('/api/design', (req, res) => {
    res.json(designSettings);
});

// 라우트: 디자인 설정 저장
app.put('/api/design', (req, res) => {
    try {
        designSettings = { ...defaultDesign, ...(req.body || {}) };
        saveJson(designFile, designSettings);
        res.json({ success: true, design: designSettings });
    } catch (error) {
        console.error('디자인 저장 오류:', error);
        res.status(500).json({ error: '디자인 설정 저장에 실패했습니다.' });
    }
});

// 라우트: 주문 제출
app.post('/api/orders', (req, res) => {
    try {
        const { tableNumber, items, total } = req.body;

        if (!tableNumber || !items || items.length === 0) {
            return res.status(400).json({ error: '테이블 번호 또는 주문 정보가 없습니다' });
        }

        // 주문 ID 생성
        const orderId = `ORD-${Date.now()}`;
        const timestamp = new Date().toLocaleString('ko-KR');

        // 주문 데이터
        const order = {
            orderId,
            timestamp,
            tableNumber,
            items,
            total,
            status: 'received'
        };

        // 주문 파일로 저장
        const filePath = path.join(ordersDir, `${orderId}.json`);
        fs.writeFileSync(filePath, JSON.stringify(order, null, 2), 'utf-8');

        // 콘솔에 주문 정보 출력
        console.log('\n========================================');
        console.log('📦 새로운 주문이 들어왔습니다!');
        console.log('========================================');
        console.log(`주문번호: ${orderId}`);
        console.log(`테이블: ${tableNumber}번`);
        console.log(`시간: ${timestamp}`);
        console.log('----------------------------------------');
        items.forEach(item => {
            console.log(`${item.name} × ${item.qty}`);
        });
        console.log('----------------------------------------');
        console.log(`합계: ${total.toLocaleString()}원`);
        console.log('========================================\n');

        // 🌐 개인 PC로 프린터 요청 전송 (비동기 - 응답 기다리지 않음)
        const http = require('http');
        const https = require('https');
        
        const remoteData = JSON.stringify({
            orderId,
            timestamp,
            tableNumber,
            items,
            total
        });

        const options = {
            hostname: '192.168.0.5',
            port: 3000,
            path: '/api/print-order',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(remoteData)
            },
            timeout: 5000 // 5초 타임아웃
        };

        const request = http.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                console.log(`🖨️ 개인 PC 프린터 응답: ${response.statusCode}`);
            });
        });

        request.on('error', (error) => {
            console.log(`⚠️ 개인 PC로 전송 실패: ${error.message}`);
            console.log(`💡 개인 PC가 켜져있고 npm start가 실행 중인지 확인하세요.`);
        });

        request.on('timeout', () => {
            console.log(`⚠️ 개인 PC 연결 타임아웃 (5초)`);
            request.destroy();
        });

        request.write(remoteData);
        request.end();

        // 클라이언트에 즉시 응답
        res.json({ 
            success: true, 
            orderId,
            message: '주문이 접수되었습니다!'
        });

    } catch (error) {
        console.error('주문 처리 오류:', error);
        res.status(500).json({ error: '주문 처리 중 오류가 발생했습니다' });
    }
});

// 라우트: 주문 목록 조회 (관리자용)
app.get('/api/orders', (req, res) => {
    try {
        const files = fs.readdirSync(ordersDir);
        const orders = files.map(file => {
            const data = fs.readFileSync(path.join(ordersDir, file), 'utf-8');
            return JSON.parse(data);
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: '주문 조회 실패' });
    }
});

// 함수: 프린터로 출력
function printOrder(order) {
    const printContent = generatePrintContent(order);
    
    const { exec } = require('child_process');
    
    // 주문 파일 저장
    const ordersDir = path.join(__dirname, 'orders');
    if (!fs.existsSync(ordersDir)) {
        fs.mkdirSync(ordersDir, { recursive: true });
    }
    
    // .txt 확장자를 명시적으로 추가
    const printFile = path.join(ordersDir, `${order.orderId}_PRINT.txt`);
    fs.writeFileSync(printFile, printContent, 'utf-8');
    
    console.log(`📄 주문서 저장됨: ${printFile}`);
    
    // PowerShell로 출력 (확장자 .txt 명시)
    // 경로에 백슬래시를 정방향 슬래시로 변환
    const normalizedPath = printFile.replace(/\\/g, '/');
    const printCommand = `powershell -Command "Get-Content '${normalizedPath}' -Encoding UTF8 | Out-Printer -Name 'SEWOO SLK-TS100'"`;
    
    console.log(`🖨️ 프린터 명령어 실행: ${printCommand}`);
    
    exec(printCommand, (error, stdout, stderr) => {
        if (error) {
            console.log(`⚠️ 프린터 출력 오류: ${error.message}`);
            if (stderr) console.log(`오류 상세: ${stderr}`);
            console.log(`💡 해결방법: 수동 인쇄 - ${printFile}`);
        } else {
            console.log(`✅ SEWOO SLK-TS100으로 출력 완료: ${order.orderId}`);
        }
    });
}

// 함수: 프린터 출력 내용 생성
function generatePrintContent(order) {
    let content = '';
    content += '================================\n';
    content += '        금별맥주 야장 주문서\n';
    content += '================================\n';
    content += `테이블: ${order.tableNumber}번\n`;
    content += `시간: ${order.timestamp}\n`;
    content += '--------------------------------\n';

    order.items.forEach(item => {
        content += `${item.name} × ${item.qty}\n`;
        content += `  ${(item.price * item.qty).toLocaleString()}원\n`;
    });

    content += '--------------------------------\n';
    content += `합계: ${order.total.toLocaleString()}원\n`;
    content += '================================\n';

    return content;
}

// 라우트: 원격 프린터 요청 (Railway에서 호출)
app.post('/api/print-order', (req, res) => {
    try {
        const { tableNumber, items, total, orderId, timestamp } = req.body;

        if (!tableNumber || !items || items.length === 0) {
            return res.status(400).json({ error: '주문 정보가 없습니다' });
        }

        // 주문 데이터 생성
        const order = {
            orderId: orderId || `ORD-${Date.now()}`,
            timestamp: timestamp || new Date().toLocaleString('ko-KR'),
            tableNumber,
            items,
            total: total || 0,
            status: 'received',
            source: 'remote' // Railway에서 온 주문
        };

        console.log('\n========================================');
        console.log('🌐 원격 주문 받음 (andone-order.com)');
        console.log('========================================');
        console.log(`주문번호: ${order.orderId}`);
        console.log(`테이블: ${order.tableNumber}번`);
        console.log(`시간: ${order.timestamp}`);
        console.log('----------------------------------------');
        items.forEach(item => {
            console.log(`${item.name} × ${item.qty}`);
        });
        console.log('----------------------------------------');
        console.log(`합계: ${total.toLocaleString()}원`);
        console.log('========================================\n');

        // 주문 파일로 저장
        const ordersDir = path.join(__dirname, 'orders');
        if (!fs.existsSync(ordersDir)) {
            fs.mkdirSync(ordersDir, { recursive: true });
        }
        const filePath = path.join(ordersDir, `${order.orderId}.json`);
        fs.writeFileSync(filePath, JSON.stringify(order, null, 2), 'utf-8');

        // 프린터로 출력
        printOrder(order);

        res.json({ 
            success: true, 
            orderId: order.orderId,
            message: '주문이 프린터로 출력되었습니다!'
        });

    } catch (error) {
        console.error('원격 주문 처리 오류:', error);
        res.status(500).json({ error: '주문 처리 중 오류가 발생했습니다' });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`\n🚀 금별맥주 QR 주문 시스템 시작됨!`);
    console.log(`📱 고객 접속 주소: https://andone-order.com/?table=테이블번호`);
    console.log(`\n또는 로컬 WiFi: http://192.168.0.5:${PORT}/?table=테이블번호`);
    console.log(`또는 로컬호스트: http://localhost:${PORT}/?table=테이블번호\n`);
});

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;
const ordersDir = path.join(__dirname, 'orders');

app.use(express.json());
app.use(express.static('public'));
app.use(cors());

// 프린터 출력 함수
function printOrder(order) {
    let content = '';
    content += '\x1D\x21\x11';
    content += '\x1B\x61\x00';
    content += '금별맥주 야장 주문서\n\n';
    content += `테이블: ${order.tableNumber}번\n`;
    content += `시간: ${order.timestamp}\n\n`;
    content += '\x1D\x21\x00\n';

    order.items.forEach(item => {
        const padding = Math.max(0, 32 - item.name.length - item.qty.toString().length - 2);
        content += `${item.name}${' '.repeat(padding)}${item.qty}개\n`;
    });

    content += '\n감사합니다! 🍺\n';

    if (!fs.existsSync(ordersDir)) fs.mkdirSync(ordersDir, { recursive: true });
    
    const printFile = path.join(ordersDir, `${order.orderId}_PRINT.txt`);
    fs.writeFileSync(printFile, content, 'utf-8');
    console.log(`📄 주문서 저장: ${order.orderId}`);
    
    // Windows: PowerShell로 프린터 출력
    if (process.platform === 'win32') {
        const normalizedPath = printFile.replace(/\\/g, '/');
        const cmd = `powershell -Command "Get-Content '${normalizedPath}' -Encoding UTF8 | Out-Printer -Name 'SEWOO SLK-TS100'"`;
        exec(cmd, (error) => {
            if (error) {
                console.log(`⚠️ 프린터 오류: ${error.message}`);
            } else {
                console.log(`✅ 프린터 출력: ${order.orderId}`);
            }
        });
    }
}

// 로컬 주문
app.post('/api/orders', (req, res) => {
    try {
        const { tableNumber, items, total } = req.body;
        if (!tableNumber || !items || items.length === 0) {
            return res.status(400).json({ error: '주문 정보가 없습니다' });
        }

        const orderId = `ORD-${Date.now()}`;
        const timestamp = new Date().toLocaleString('ko-KR');
        const order = { orderId, timestamp, tableNumber, items, total, status: 'received' };

        const filePath = path.join(ordersDir, `${orderId}.json`);
        fs.writeFileSync(filePath, JSON.stringify(order, null, 2), 'utf-8');

        console.log('\n========================================');
        console.log('📦 새로운 주문이 들어왔습니다!');
        console.log('========================================');
        console.log(`주문번호: ${orderId}`);
        console.log(`테이블: ${tableNumber}번`);
        console.log(`시간: ${timestamp}`);
        console.log('----------------------------------------');
        items.forEach(item => console.log(`${item.name} × ${item.qty}`));
        console.log('----------------------------------------');
        console.log(`합계: ${total.toLocaleString()}원`);
        console.log('========================================\n');

        printOrder(order);

        // Railway로 전송
        if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
            const http = require('http');
            const remoteData = JSON.stringify({ orderId, timestamp, tableNumber, items, total });
            const options = {
                hostname: '192.168.0.4',
                port: 3000,
                path: '/api/print-order',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(remoteData)
                },
                timeout: 5000
            };
            const request = http.request(options);
            request.on('error', (e) => console.log(`⚠️ PC 전송 실패: ${e.message}`));
            request.write(remoteData);
            request.end();
        }

        res.json({ success: true, orderId, message: '주문이 접수되었습니다!' });
    } catch (error) {
        console.error('주문 오류:', error);
        res.status(500).json({ error: '주문 처리 중 오류가 발생했습니다' });
    }
});

// 원격 주문
app.post('/api/print-order', (req, res) => {
    try {
        const { tableNumber, items, total, orderId, timestamp } = req.body;
        if (!tableNumber || !items || items.length === 0) {
            return res.status(400).json({ error: '주문 정보가 없습니다' });
        }

        const order = {
            orderId: orderId || `ORD-${Date.now()}`,
            timestamp: timestamp || new Date().toLocaleString('ko-KR'),
            tableNumber,
            items,
            total: total || 0,
            status: 'received',
            source: 'remote'
        };

        const filePath = path.join(ordersDir, `${order.orderId}.json`);
        fs.writeFileSync(filePath, JSON.stringify(order, null, 2), 'utf-8');

        console.log('\n========================================');
        console.log('🌐 원격 주문 받음 (andone-order.com)');
        console.log('========================================');
        console.log(`주문번호: ${order.orderId}`);
        console.log(`테이블: ${order.tableNumber}번`);
        items.forEach(item => console.log(`${item.name} × ${item.qty}`));
        console.log('========================================\n');

        printOrder(order);

        res.json({ success: true, orderId: order.orderId, message: '주문이 프린터로 출력되었습니다!' });
    } catch (error) {
        console.error('원격 주문 오류:', error);
        res.status(500).json({ error: '주문 처리 중 오류가 발생했습니다' });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 금별맥주 QR 주문 시스템 시작됨!`);
    console.log(`📱 고객: https://andone-order.com/?table=테이블번호`);
    console.log(`로컬: http://192.168.0.4:${PORT}/?table=테이블번호\n`);
});

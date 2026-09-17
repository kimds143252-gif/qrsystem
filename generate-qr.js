const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// QR 코드 저장 폴더
const qrDir = path.join(__dirname, 'public', 'qr-codes');
if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir, { recursive: true });
}

// 24개 테이블 QR 코드 생성
async function generateQRCodes() {
  console.log('🚀 QR 코드 생성 시작...\n');
  
  for (let i = 1; i <= 24; i++) {
    // 올바른 외부 주소 사용!
    const url = `https://andone-order.com?table=${i}`;
    
    const filePath = path.join(qrDir, `table_${i}.png`);
    
    try {
      await QRCode.toFile(filePath, url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      console.log(`✅ 테이블 ${i} QR 코드 생성 완료: ${url}`);
    } catch (err) {
      console.error(`❌ 테이블 ${i} QR 코드 생성 실패:`, err);
    }
  }
  
  console.log('\n🎉 모든 QR 코드 생성 완료!');
  console.log('\n📁 저장 위치:');
  console.log(`   ${qrDir}`);
  console.log('\n📋 생성된 파일:');
  console.log('   table_1.png ~ table_24.png (총 24개)');
  console.log('\n🖨️  다음 단계:');
  console.log('   1. public/qr-codes 폴더의 이미지를 다운로드');
  console.log('   2. A4 용지에 배치하여 인쇄');
  console.log('   3. 각 테이블에 부착');
  console.log('   4. 스마트폰 카메라로 스캔하여 확인');
}

generateQRCodes();

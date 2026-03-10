/**
 * AWS S3에 저장된 WBS 데이터 조회/검증
 * 사용법: node scripts/verify-wbs-itsm.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
}

const API_BASE = process.env.VITE_API_BASE || 'https://dev.e-cloud.ai:8443';
const TOKEN = process.env.VITE_API_TOKEN || '';

if (!TOKEN) {
  console.error('오류: VITE_API_TOKEN이 설정되지 않았습니다.');
  process.exit(1);
}

const params = new URLSearchParams();
params.set('jsonFileName', 'wbs');
const body = params.toString();

const urlObj = new URL(API_BASE + '/common/app/itsm/jsonDownload');
const options = {
  hostname: urlObj.hostname,
  port: urlObj.port || 443,
  path: urlObj.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Bearer ${TOKEN}`,
    'Content-Length': Buffer.byteLength(body),
  },
  rejectUnauthorized: false,
};

const req = https.request(options, (res) => {
  let chunks = '';
  res.on('data', (ch) => { chunks += ch; });
  res.on('end', () => {
    try {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const result = JSON.parse(chunks);
        const data = result?.data ?? result;
        const arr = Array.isArray(data) ? data : [];
        console.log(`[검증] AWS S3에서 ${arr.length}건 조회됨`);
        if (arr.length > 0) {
          const sample = arr[0];
          console.log(`[샘플] 첫 건: id=${sample.id}, task=${(sample.task || '').slice(0, 20)}...`);
        }
        process.exit(0);
      } else {
        console.error('조회 실패:', res.statusCode, chunks.slice(0, 200));
        process.exit(1);
      }
    } catch (e) {
      console.error('파싱 오류:', e.message);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('조회 실패:', err.message);
  process.exit(1);
});

req.write(body);
req.end();

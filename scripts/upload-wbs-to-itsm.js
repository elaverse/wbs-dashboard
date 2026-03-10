/**
 * WBS JSON 데이터를 ITSM API를 통해 AWS S3에 업로드
 *
 * 사용법: node scripts/upload-wbs-to-itsm.js
 * (.env 파일의 VITE_API_BASE, VITE_API_TOKEN 사용)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// .env 로드
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
}

const API_BASE = process.env.VITE_API_BASE || 'https://dev.e-cloud.ai:8443';
const TOKEN = process.env.VITE_API_TOKEN || '';

const jsonPath = path.join(__dirname, '../public/wbs-data.json');

if (!TOKEN) {
  console.error('오류: VITE_API_TOKEN 환경변수를 설정해주세요.');
  console.error('.env 파일을 확인하거나 환경변수로 설정 후 실행하세요.');
  process.exit(1);
}

if (!fs.existsSync(jsonPath)) {
  console.error('오류: public/wbs-data.json 파일이 없습니다.');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const url = new URL(API_BASE + '/common/app/itsm/jsonUpload');
const params = new URLSearchParams();
params.set('jsonFileName', 'wbs');
params.set('data', JSON.stringify(data));
const body = params.toString();

const options = {
  hostname: url.hostname,
  port: url.port || 443,
  path: url.pathname,
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
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log(`업로드 완료: ${data.length}건이 S3에 저장되었습니다.`);
    } else {
      console.error('업로드 실패:', res.statusCode, chunks);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('업로드 실패:', err.message);
  process.exit(1);
});

req.write(body);
req.end();

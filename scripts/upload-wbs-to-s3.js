/**
 * WBS JSON 데이터를 AWS S3에 업로드하는 스크립트
 *
 * 사용법:
 *   node scripts/upload-wbs-to-s3.js
 *   또는
 *   BUCKET=my-bucket KEY=itsm/wbs.json node scripts/upload-wbs-to-s3.js
 *
 * 환경변수:
 *   AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY (또는 AWS 프로필 사용)
 *   BUCKET - S3 버킷명 (필수)
 *   KEY    - S3 객체 키 (기본: itsm/wbs.json)
 *   REGION - AWS 리전 (기본: ap-northeast-2)
 */

const fs = require('fs');
const path = require('path');

const bucket = process.env.BUCKET;
const key = process.env.KEY || 'itsm/wbs.json';
const region = process.env.AWS_REGION || process.env.REGION || 'ap-northeast-2';

if (!bucket) {
  console.error('오류: BUCKET 환경변수를 설정해주세요.');
  console.error('예: BUCKET=my-itsm-bucket node scripts/upload-wbs-to-s3.js');
  process.exit(1);
}

const jsonPath = path.join(__dirname, '../public/wbs-data.json');
if (!fs.existsSync(jsonPath)) {
  console.error('오류: public/wbs-data.json 파일이 없습니다.');
  process.exit(1);
}

const data = fs.readFileSync(jsonPath, 'utf8');

async function upload() {
  try {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const client = new S3Client({ region });
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: data,
      ContentType: 'application/json',
    }));
    console.log(`업로드 완료: s3://${bucket}/${key}`);
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      console.error('AWS SDK가 설치되지 않았습니다. 먼저 실행하세요:');
      console.error('  npm install @aws-sdk/client-s3');
      process.exit(1);
    }
    throw e;
  }
}

upload().catch((err) => {
  console.error('업로드 실패:', err.message);
  process.exit(1);
});

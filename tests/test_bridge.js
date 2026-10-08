const http = require('http');

async function runTests() {
  console.log('--- بدء اختبار الجسر المحلي لبرنامج موجّه ---');

  // Load compiled bridge module
  const { LocalBridgeServer } = require('../dist/main/bridge');
  const TEST_PORT = 5190;
  const bridge = new LocalBridgeServer(TEST_PORT);

  await bridge.start();
  console.log(`✔ تم بدء تشغيل الجسر المحلي للاختبار على 127.0.0.1:${TEST_PORT} بنجاح.`);

  // Test 1: GET /api/health
  const healthRes = await httpGet(`http://127.0.0.1:${TEST_PORT}/api/health`);
  const health = JSON.parse(healthRes);
  if (health.status === 'ok' && health.bridge === 'running' && health.port === TEST_PORT) {
    console.log('✔ فحص الصحة /api/health سليم:', health);
  } else {
    throw new Error('فشل فحص الصحة');
  }

  // Test 2: GET /api/status while offline
  const statusRes = await httpGet(`http://127.0.0.1:${TEST_PORT}/api/status`);
  const status = JSON.parse(statusRes);
  if (status.connected === false) {
    console.log('✔ فحص الحالة عند عدم الاتصال سليم (لا توجد بيانات قديمة أو وهمية):', status.message);
  } else {
    throw new Error('فحص الحالة عند عدم الاتصال غير متطابق');
  }

  // Test 3: Public IP rejection security test
  const postData = JSON.stringify({ routerIp: '8.8.8.8', password: 'test' });
  const connectRes = await httpPost(`http://127.0.0.1:${TEST_PORT}/api/connect`, postData);
  const connectJson = JSON.parse(connectRes);
  if (connectJson.success === false && connectJson.error && connectJson.error.includes('مسموح فقط بالعناوين المحلية')) {
    console.log('✔ اختبار الأمان نجح: تم رفض الاتصال بعنوان IP خارجي بنجاح:', connectJson.error);
  } else {
    throw new Error('فشل اختبار الأمان: لم يتم حظر العنوان الخارجي');
  }

  // Test 4: Stop bridge
  await bridge.stop();
  console.log('✔ تم إيقاف الجسر المحلي ومسح بيانات الجلسة بنجاح.');
  console.log('--- اكتملت جميع اختبارات الجسر المحلي بنجاح تام ---');
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function httpPost(url, data) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

runTests().catch(err => {
  console.error('❌ خطأ في الاختبار:', err);
  process.exit(1);
});

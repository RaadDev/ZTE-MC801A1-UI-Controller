// ============================================================================
// Mowajjih GitHub Release Publisher (v1.0.1)
// ============================================================================

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

function getGitToken() {
  try {
    const out = execSync('echo url=https://github.com/RaadDev/ZTE-MC801A1-UI-Controller.git | git credential fill', { encoding: 'utf-8' });
    const match = out.match(/password=(.+)/);
    if (match && match[1]) return match[1].trim();
  } catch {}
  return process.env.GITHUB_TOKEN || '';
}

const TOKEN = getGitToken();
const REPO = 'RaadDev/ZTE-MC801A1-UI-Controller';
const TAG = 'v1.0.1';
const TITLE = 'Mowajjih v1.0.1 - تحديث استقرار قفل الترددات ونظام السجلات';

const RELEASE_BODY = `## تحديث موجّه (Mowajjih) v1.0.1 🚀

يتضمن هذا الإصدار حلولاً جذرية واستقراراً عالياً في تثبيت الترددات ومراقبة الراوتر:

### ✨ الجديد والمُصحح في هذا الإصدار:
1. **حل مشكلة تثبيت الترددات المتعددة (Multi-Band Lock)**:
   - حل مشكلة اختفاء التردد الثاني (مثل B3 عند اختيار B1 + B3).
   - استمرار تفعيل كافة الترددات المختارة وتثبيت قناع الترددات بدقة في المودم.
   - دعم وتوضيح تجميع الترددات التلقائي (Carrier Aggregation - CA).
2. **نظام سجلات وتشخيص متقدم (Advanced Diagnostic Logs)**:
   - إضافة شاشة سجلات لحظية تفاعلية مع فلاتر وبحث.
   - إظهار تفاصيل الأوامر الخام وقناع الترددات (Hex Mask).
   - إمكانية نسخ تقرير تشخيصي فوري وإرساله للمساعد الذكي للتحليل وحل المشاكل.
   - إمكانية تصدير السجلات لملف نصي.
3. **خيارات التحديث التلقائي**:
   - إمكانية اختيار معدل التحديث بين (ثانية واحدة، 3 ثوانٍ، 5 ثوانٍ).
4. **تحسينات واجهة المستخدم (UI/UX)**:
   - تنظيف بطاقات النطاقات وإضافة شارات الحالة التفاعلية الحية.
   - تحسينات شاملة على الوضع المظلم والأداء.

---
### 📦 الملفات المرفقة:
- **\`mowajjih-setup.exe\`**: مثبت الإعداد الرسمي لنظام Windows.
- **\`mowajjih-portable.exe\`**: النسخة المحمولة (تعمل مباشرة بدون تثبيت).
`;

function apiRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`API Error ${res.statusCode}: ${data}`));
          }
        } catch {
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(data);
          else reject(new Error(`API Error ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function uploadAsset(uploadUrl, filePath, fileName) {
  const fileStats = fs.statSync(filePath);
  const fileSize = fileStats.size;
  const cleanUrl = uploadUrl.replace(/\{.*?\}$/, '') + `?name=${encodeURIComponent(fileName)}`;

  console.log(`جارٍ رفع ${fileName} (${(fileSize / (1024 * 1024)).toFixed(1)} MB)...`);

  const urlObj = new URL(cleanUrl);

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'User-Agent': 'Mowajjih-Publisher',
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileSize
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✔ تم رفع ${fileName} بنجاح!`);
          resolve();
        } else {
          reject(new Error(`فشل رفع ${fileName} (${res.statusCode}): ${data}`));
        }
      });
    });

    req.on('error', reject);

    const stream = fs.createReadStream(filePath);
    let uploadedBytes = 0;
    let lastPercent = 0;

    stream.on('data', chunk => {
      uploadedBytes += chunk.length;
      const percent = Math.floor((uploadedBytes / fileSize) * 100);
      if (percent - lastPercent >= 10 || percent === 100) {
        process.stdout.write(`  تقدم الرفع لـ ${fileName}: ${percent}%\r`);
        lastPercent = percent;
      }
    });

    stream.pipe(req);
  });
}

async function main() {
  console.log('--- نشر الإصدار على GitHub Releases ---');

  // 1. Check if release already exists
  let release;
  try {
    release = await apiRequest({
      hostname: 'api.github.com',
      path: `/repos/${REPO}/releases/tags/${TAG}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mowajjih-Publisher',
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    console.log(`تم العثور على إصدار موجود للوسم ${TAG} (ID: ${release.id})`);
  } catch {
    // Create new release
    console.log(`إنشاء إصدار جديد للوسم ${TAG}...`);
    release = await apiRequest({
      hostname: 'api.github.com',
      path: `/repos/${REPO}/releases`,
      method: 'POST',
      headers: {
        'User-Agent': 'Mowajjih-Publisher',
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    }, JSON.stringify({
      tag_name: TAG,
      name: TITLE,
      body: RELEASE_BODY,
      draft: false,
      prerelease: false
    }));
    console.log(`✔ تم إنشاء الإصدار بنجاح! (ID: ${release.id})`);
  }

  // 2. Upload assets
  const releaseDir = path.join(__dirname, '..', 'release');
  const filesToUpload = [
    { name: 'mowajjih-setup.exe', path: path.join(releaseDir, 'mowajjih-setup.exe') },
    { name: 'mowajjih-portable.exe', path: path.join(releaseDir, 'mowajjih-portable.exe') }
  ];

  for (const file of filesToUpload) {
    if (!fs.existsSync(file.path)) {
      console.error(`الملف غير موجود: ${file.path}`);
      continue;
    }

    // Check if asset already exists in release
    const existingAsset = (release.assets || []).find(a => a.name === file.name);
    if (existingAsset) {
      console.log(`حذف الملف القديم ${file.name} من الإصدار أولاً...`);
      await apiRequest({
        hostname: 'api.github.com',
        path: `/repos/${REPO}/releases/assets/${existingAsset.id}`,
        method: 'DELETE',
        headers: {
          'User-Agent': 'Mowajjih-Publisher',
          'Authorization': `Bearer ${TOKEN}`
        }
      });
    }

    await uploadAsset(release.upload_url, file.path, file.name);
  }

  console.log('\n🎉 اكتمل نشر وتحديث كافة ملفات الإصدار على GitHub Releases بنجاح!');
  console.log(`رابط الإصدار: ${release.html_url}`);
}

main().catch(err => {
  console.error('حدث خطأ:', err);
  process.exit(1);
});

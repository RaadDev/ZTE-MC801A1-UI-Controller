const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isMinify = process.argv.includes('--minify') || process.env.NODE_ENV === 'production';

async function build() {
  console.log(`--- بدء بناء مشروع موجّه (${isMinify ? 'Production Minified' : 'Development'}) ---`);

  // Ensure output directories exist
  fs.mkdirSync(path.join(__dirname, 'dist/main'), { recursive: true });
  fs.mkdirSync(path.join(__dirname, 'dist/renderer'), { recursive: true });
  fs.mkdirSync(path.join(__dirname, 'dist/assets'), { recursive: true });

  // 1. Build Main Process
  console.log('1. بناء المعالج الرئيسي (Main Process)...');
  await esbuild.build({
    entryPoints: [
      path.join(__dirname, 'src/main/index.ts'),
      path.join(__dirname, 'src/main/bridge.ts')
    ],
    bundle: true,
    platform: 'node',
    target: 'node22',
    outdir: path.join(__dirname, 'dist/main'),
    external: ['electron'],
    sourcemap: false,
    minify: isMinify
  });

  // 2. Build Preload Script
  console.log('2. بناء سكريبت الحماية والوساطة (Preload)...');
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'src/main/preload.ts')],
    bundle: true,
    platform: 'node',
    target: 'node22',
    outfile: path.join(__dirname, 'dist/main/preload.js'),
    external: ['electron'],
    sourcemap: false,
    minify: isMinify
  });

  // 3. Build Renderer Script
  console.log('3. بناء منطق الواجهة الأمامية (Renderer)...');
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'src/renderer/app.ts')],
    bundle: true,
    platform: 'browser',
    target: 'chrome120',
    outfile: path.join(__dirname, 'dist/renderer/app.js'),
    sourcemap: false,
    minify: isMinify
  });

  // 4. Copy Assets (HTML, CSS & Icons)
  console.log('4. نسخ ملفات العرض الثابتة والأيقونات (HTML, CSS & Icons)...');
  fs.copyFileSync(
    path.join(__dirname, 'src/renderer/index.html'),
    path.join(__dirname, 'dist/renderer/index.html')
  );
  fs.copyFileSync(
    path.join(__dirname, 'src/renderer/styles.css'),
    path.join(__dirname, 'dist/renderer/styles.css')
  );

  const iconPng = path.join(__dirname, 'assets/icon.png');
  const iconIco = path.join(__dirname, 'assets/icon.ico');
  if (fs.existsSync(iconPng)) {
    fs.copyFileSync(iconPng, path.join(__dirname, 'dist/assets/icon.png'));
  }
  if (fs.existsSync(iconIco)) {
    fs.copyFileSync(iconIco, path.join(__dirname, 'dist/assets/icon.ico'));
  }

  console.log('✔ اكتمل بناء مشروع «موجّه» بنجاح في مجلد dist!');
}

build().catch((err) => {
  console.error('❌ حدث خطأ أثناء البناء:', err);
  process.exit(1);
});

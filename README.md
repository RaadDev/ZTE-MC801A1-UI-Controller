# 📡 موجّه (Mowajjih)

تطبيق خفيف وسريع باللغة العربية لإدارة وتثبيت ترددات راوتر **ZTE MC801A** و **ZTE MC801A1 5G** على نظام Windows.

<div align="center">

[![الإصدار الأخير](https://img.shields.io/github/v/release/RaadDev/ZTE-MC801A1-UI-Controller?style=for-the-badge&color=0284c7&label=الإصدار)](https://github.com/RaadDev/ZTE-MC801A1-UI-Controller/releases/latest)
[![الترخيص](https://img.shields.io/badge/الترخيص-MIT-3b82f6?style=for-the-badge)](LICENSE)

<br>

<a href="https://github.com/RaadDev/ZTE-MC801A1-UI-Controller/releases/latest/download/mowajjih-portable.exe">
  <img src="https://img.shields.io/badge/تحميل_النسخة_المحمولة_(بدون_تثبيت)-Portable_(.exe)-10b981?style=for-the-badge&logo=windows&logoColor=white" height="42" alt="تحميل النسخة المحمولة">
</a>
&nbsp;&nbsp;
<a href="https://github.com/RaadDev/ZTE-MC801A1-UI-Controller/releases/latest/download/mowajjih-setup.exe">
  <img src="https://img.shields.io/badge/تحميل_مثبت_الإعداد-Setup_(.exe)-0284c7?style=for-the-badge&logo=windows&logoColor=white" height="42" alt="تحميل مثبت Setup">
</a>

</div>

---

## ⚡️ التحميل المباشر

| الملف | النوع | الوصف | الرابط |
| :--- | :--- | :--- | :--- |
| **`mowajjih-portable.exe`** | **محمولة (موصى بها)** | تعمل مباشرة بنقرة واحدة بدون تثبيت (~78 MB) | [⬇️ تحميل مباشر](https://github.com/RaadDev/ZTE-MC801A1-UI-Controller/releases/latest/download/mowajjih-portable.exe) |
| **`mowajjih-setup.exe`** | **مثبت رسمي** | تثبيت على النظام مع اختصار لسطح المكتب (~78 MB) | [⬇️ تحميل مباشر](https://github.com/RaadDev/ZTE-MC801A1-UI-Controller/releases/latest/download/mowajjih-setup.exe) |

> 💡 صفحة كافة الإصدارات: [GitHub Releases](https://github.com/RaadDev/ZTE-MC801A1-UI-Controller/releases)

---

## 🌟 أهم المميزات

- **قفل وتثبيت الترددات:**
  - تثبيت تردد أو عدة ترددات معاً لشبكات 5G و 4G مع دعم دمج الترددات (CA).
  - تثبيت الراوتر على برج محدد ومنع التنقل العشوائي (Cell Lock - PCI & EARFCN).
  - اختيار نمط الشبكة (تلقائي، 5G فقط، 4G فقط).
- **قراءة دقيقة ومباشرة للإشارة:**
  - عرض فوري لقوة الإشارة (RSRP) وجودتها (SINR, RSRQ) ورقم الخلية والبرج.
  - إمكانية التحديث التلقائي كل (ثانية واحدة، 3 ثوانٍ، 5 ثوانٍ).
  - منبه صوتي توجيهي (Audio Beacon) لتوجيه الراوتر نحو أفضل إشارة بدون النظر للشاشة.
- **إدارة الراوتر والشبكة:**
  - استعراض الأجهزة المتصلة مع كشف نوع كل جهاز.
  - قراءة رسائل الشريحة (SMS) وحذفها واستلام رموز التحقق.
  - مشاركة شبكة الواي فاي عبر كود QR.
  - إيقاف وتشغيل بيانات الشريحة وإعادة تشغيل الراوتر.
- **سجلات تشخيص فورية (Logs):**
  - تتبع أوامر قفل الترددات وكشف أسباب الأعطال مع إمكانية تصدير التقرير لمساعد الذكاء الاصطناعي لحل المشكلات.

---

## 🚀 طريقة الاستخدام

1. شغّل ملف التطبيق (`mowajjih-portable.exe`).
2. تأكد من اتصالك بشبكة الراوتر (سلك أو واي فاي).
3. اكتب عنوان IP الراوتر (افتراضياً: `192.168.0.1`) وكلمة المرور.
4. اضغط على **اتصال**.

---

## 💻 للمطورين (تشغيل وبناء المشروع)

```bash
# تثبيت الحزم
npm install

# تشغيل التطبيق في بيئة التطوير
npm start

# بناء ملفات التشغيل (.exe)
npm run dist
```

---

## 📄 الترخيص

المشروع مفتوح المصدر ومتاح مجاناً تحت رخصة **MIT**.
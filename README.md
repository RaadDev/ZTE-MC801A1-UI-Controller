<div align="center">

<img src="assets/icon.png" alt="أيقونة تطبيق موجّه" width="108" height="108" style="border-radius: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.35);">

# تطبيق موجّه (Mowajjih)
### أداة إدارة وتثبيت ترددات راوتر ZTE 5G

برنامج مجاني وخفيف للتحكم الكامل براوترات **ZTE MC801A** و **ZTE MC801A1** على نظام Windows.

<br>

<a href="https://github.com/RaadDev/ZTE-MC801A1-UI-Controller/releases/latest">
  <img src="assets/badge-release.svg" alt="الإصدار الأخير - v1.0.1" height="28">
</a>
&nbsp;&nbsp;
<a href="LICENSE">
  <img src="assets/badge-license.svg" alt="الترخيص - MIT" height="28">
</a>

</div>

---

## تحميل البرنامج

اضغط على النسخة التي تفضلها للتحميل المباشر:

<div align="center">

<a href="https://github.com/RaadDev/ZTE-MC801A1-UI-Controller/releases/latest/download/mowajjih-portable.exe">
  <img src="assets/badge-portable.svg" alt="تشغيل مباشر بدون تثبيت (الأسهل) - mowajjih-portable.exe" height="52">
</a>
<br><br>
<a href="https://github.com/RaadDev/ZTE-MC801A1-UI-Controller/releases/latest/download/mowajjih-setup.exe">
  <img src="assets/badge-setup.svg" alt="تثبيت على الجهاز (مع اختصار سطح المكتب) - mowajjih-setup.exe" height="52">
</a>

</div>

<br>

### الفرق بين النسختين

* **النسخة المحمولة (`mowajjih-portable.exe`) — موصى بها:**
  * تعمل فوراً بنقرة واحدة بدون أي خطوات تثبيت.
  * لا تضيف أي ملفات داخل النظام، وتستطيع وضعها على فلاش ميموري وتشغيلها في أي جهاز مباشرة.
  * لحذفها، يكفي حذف الملف نفسه فقط.

* **نسخة التثبيت (`mowajjih-setup.exe`):**
  * برنامج تثبيت تقليدي يثبت التطبيق في ملفات النظام، ويضع اختصاراً على سطح المكتب وقائمة ابدأ.

---

## مميزات البرنامج

* **تثبيت الترددات (5G و 4G):**
  * قفل تردد واحد أو دمج عدة ترددات معاً لرفع السرعة واستقرار الاتصال.
  * تثبيت الراوتر على برج محدد لمنع التنقل العشوائي وتقطيع البث (Cell Lock).
  * اختيار نمط الشبكة (تلقائي، 5G فقط، 4G فقط).
* **مراقبة الإشارة لحظياً:**
  * قراءة دقيقة لقوة الإشارة (RSRP) ونقائها (SINR) وبيانات البرج المتصل.
  * تحديث القراءات تلقائياً (كل ثانية، 3 ثوانٍ، أو 5 ثوانٍ).
  * منبه صوتي توجيهي (Audio Beacon) لمساعدتك في توجيه الراوتر لأفضل زاوية دون الحاجة للنظر للشاشة.
* **إدارة الراوتر والشبكة:**
  * كشف الأجهزة المتصلة ونوع كل جهاز.
  * قراءة رسائل الشريحة (SMS) واستلام أكواد التحقق وحذف الرسائل القديمة.
  * مشاركة شبكة الواي فاي عبر رمز الاستجابة السريعة (QR Code).
  * سجلات تشخيص تفاعلية (Logs) لكشف وحل المشكلات فوراً.

---

## لقطات من التطبيق

<div align="center">

### لوحة التحكم الرئيسية
<img src="assets/الشاشة%20الرئيسية%20بعد%20التسجيل.png" alt="لوحة التحكم الرئيسية" width="850" style="border-radius: 10px; max-width: 100%; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">

<br><br>

### تثبيت النطاقات ومساعد توجيه الإشارة
<p align="center">
  <img src="assets/تثبيت%20النطاقات.png" alt="تثبيت النطاقات والترددات" width="48%" style="border-radius: 8px; vertical-align: top;">
  &nbsp;
  <img src="assets/مساعد%20الانتينا%20و%20الاشاره.png" alt="مساعد توجيه الإشارة والأنتينا" width="48%" style="border-radius: 8px; vertical-align: top;">
</p>

<br>

### شاشة تسجيل الدخول والإعدادات المتقدمة
<p align="center">
  <img src="assets/الشاشة%20الرئيسية.png" alt="شاشة تسجيل الدخول" width="48%" style="border-radius: 8px; vertical-align: top;">
  &nbsp;
  <img src="assets/الاعدادات%20المتقدمة.png" alt="الإعدادات المتقدمة والتشخيص" width="48%" style="border-radius: 8px; vertical-align: top;">
</p>

</div>

---

## طريقة الاستخدام

1. حمّل البرنامج وافتحه.
2. اكتب عنوان IP الراوتر (الافتراضي: `192.168.0.1`) وكلمة المرور.
3. اضغط **اتصال**.

---

## للمطورين

```bash
npm install     # تثبيت الحزم
npm start       # تشغيل في بيئة التطوير
npm run dist    # بناء ملفات .exe
```

---

## الترخيص

المشروع مفتوح المصدر ومتاح مجاناً للجميع تحت رخصة **MIT**.
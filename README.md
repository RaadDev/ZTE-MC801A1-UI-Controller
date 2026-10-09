# 📡 تطبيق موجّه (Mowajjih)
### أداة إدارة وتثبيت ترددات راوتر ZTE 5G

برنامج مجاني وخفيف للتحكم الكامل براوترات **ZTE MC801A** و **ZTE MC801A1** على نظام Windows.

<div align="center">

[![الإصدار الأخير](https://img.shields.io/github/v/release/RaadDev/ZTE-MC801A1-UI-Controller?style=for-the-badge&color=0284c7&label=الإصدار)](https://github.com/RaadDev/ZTE-MC801A1-UI-Controller/releases/latest)
[![الترخيص](https://img.shields.io/badge/الترخيص-MIT-3b82f6?style=for-the-badge)](LICENSE)

</div>

---

## ⚡️ تحميل البرنامج

اضغط على النسخة التي تفضلها للتحميل المباشر:

<div align="center">

<a href="https://github.com/RaadDev/ZTE-MC801A1-UI-Controller/releases/latest/download/mowajjih-portable.exe">
  <img src="https://img.shields.io/badge/🟢_تشغيل_مباشر_بدون_تثبيت_(الأسهل)-mowajjih--portable.exe-10b981?style=for-the-badge&logo=windows&logoColor=white" height="42" alt="تحميل النسخة المحمولة">
</a>
<br><br>
<a href="https://github.com/RaadDev/ZTE-MC801A1-UI-Controller/releases/latest/download/mowajjih-setup.exe">
  <img src="https://img.shields.io/badge/🔵_تثبيت_على_الجهاز_(مع_اختصار_سطح_المكتب)-mowajjih--setup.exe-0284c7?style=for-the-badge&logo=windows&logoColor=white" height="38" alt="تحميل مثبت Setup">
</a>

</div>

<br>

### 🤔 ما الفرق بين النسختين؟ وأيهما أختار؟

* **🟢 النسخة المحمولة (`mowajjih-portable.exe`) — (موصى بها لأغلب المستخدمين):**
  * **تعمل فوراً بنقرة واحدة بدون أي خطوات تثبيت.**
  * لا تضيف أي ملفات داخل النظام، وتستطيع وضعها على فلاش ميموري وتشغيلها في أي جهاز مباشرة.
  * إذا أردت حذفها مستقبلاً، احذف الملف فقط.

* **🔵 نسخة التثبيت (`mowajjih-setup.exe`):**
  * برنامج تثبيت تقليدي يثبت التطبيق في ملفات النظام، ويضع اختصاراً على سطح المكتب وقائمة ابدأ.

---

## 🌟 مميزات البرنامج

* **تثبيت الترددات (5G & 4G):**
  * قفل تردد واحد أو دمج عدة ترددات معاً لرفع السرعة واستقرار الاتصال.
  * تثبيت الراوتر على برج محدد لمنع التنقل العشوائي وتقطيع البث (Cell Lock).
  * اختيار نمط الشبكة (تلقائي، 5G فقط، 4G فقط).
* **مراقبة الإشارة لحظياً:**
  * قراءة دقيقة لقوة الإشارة (RSRP) ونقائها (SINR) وبيانات البرج المتصل.
  * تحديث القراءات تلقائياً (كل ثانية، 3 ثوانٍ، أو 5 ثوانٍ).
  * منبه صوتي توجيهي (Audio Beacon) لمساعدتك في توجيه الراوتر لأفضل زاوية بدون النظر للشاشة.
* **إدارة الراوتر بسهولة:**
  * كشف الأجهزة المتصلة ونوع كل جهاز.
  * قراءة رسائل الشريحة (SMS) واستلام أكواد التحقق وحذف الرسائل القديمة.
  * مشاركة شبكة الواي فاي عبر رمز الاستجابة السريعة (QR Code).
  * سجلات تشخيص تفاعلية (Logs) لكشف وحل المشكلات فوراً.

---

## 🚀 طريقة الاستخدام في 3 خطوات

1. حمّل البرنامج وافتحه.
2. اكتب عنوان IP الراوتر (الافتراضي: `192.168.0.1`) وكلمة المرور.
3. اضغط **اتصال**.

---

## 💻 للمطورين

```bash
npm install     # تثبيت الحزم
npm start       # تشغيل في بيئة التطوير
npm run dist    # بناء ملفات .exe
```

---

## 📄 الترخيص

المشروع مفتوح المصدر ومتاح مجاناً للجميع تحت رخصة **MIT**.
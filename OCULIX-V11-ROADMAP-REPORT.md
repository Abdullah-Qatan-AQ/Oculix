# تقرير ترقية Oculix — Roadmap Release

## الملخص التنفيذي

نُفذت ترقية additive فوق نسخة Oculix الحالية دون استبدال الخريطة أو إزالة أدوات v10. ركزت الترقية على الأمان، جودة البيانات، مساحة المحلل، البحث السريع، التقارير المحلية، والـCI والتوثيق. لم تُفعّل أي خدمة خارجية مدفوعة أو queue دائم أو Redis تلقائياً.

> المبدأ الحاكم: كل مصدر فاشل يتدهور برشاقة، وكل نتيجة تحليلية تُعرض كسياق قابل للمراجعة لا كحقيقة سببية تلقائية.

## ما تم تنفيذه

| المجال | التنفيذ |
|---|---|
| RECON | إضافة bounded hash-only audit log، حد لطول الهدف، حد لحجم استجابة scanner، قبول JSON فقط، redirect rejection، وتسجيل request/block/failure/success مع latency. بقي SSRF guard وallowlist والمهل الأصلية فعالة. |
| رؤوس الأمان | إضافة `base-uri`, `frame-ancestors`, `object-src`, `form-action`, `Referrer-Policy` و`Permissions-Policy` مع إبقاء CSP المتوافق مع MapLibre والبث. |
| Source Health | إضافة `src/lib/sourceHealth.ts`، ربطه بـ`sourceCache` لقياس latency وfreshness والأخطاء والموثوقية وcache hits، وإضافة `/api/health/sources` وواجهة Source Health Center. |
| Analyst Workspace | إضافة snapshots محلية، وضع LIVE/ANALYST، تحقيقات وملاحظات محفوظة في localStorage، timeline سياقي، correlation heuristic، وسلسلة evidence chain. |
| AI Analyst | إضافة زر اختياري داخل مساحة المحلل يرسل عدادات snapshot المختصرة فقط إلى `/api/ai/overview`. يستخدم endpoint fallback تحليلياً محلياً عند غياب Gemini، ولا يرسل payloads الحية الكاملة من هذه المساحة. أضيف حد 64KB وrate limit للـendpoint. |
| التقارير | إضافة تصدير Markdown محلي من التحقيق الحالي دون رفع البيانات إلى خادم خارجي. |
| تجربة الاستخدام | إضافة Command Palette عبر `Ctrl/Cmd + K` وزر `⌘K`، مع الوصول إلى الطبقات والبحث والأسواق وRecon وSpace وAlerts وDraw وRoute وArcGIS وRemote وSettings وHealth وAnalyst والإسقاطات. |
| Focus Modes | إضافة Intelligence Lens بثمانية سياقات وشريط زمن additive. لا يحذف أو يعطل activeLayers؛ يوضح للمستخدم أن العدسة تغيّر سياق العرض فقط. |
| التوثيق | تحديث README، إضافة SECURITY.md موسعة، CONTRIBUTING.md، وتدقيق خارطة الطريق. |
| CI والبنية الاختيارية | إضافة `.github/workflows/ci.yml`، وإضافة `docker-compose.redis.example.yml` بprofile اختياري لا يعمل تلقائياً. |

## الحفاظ على التوافق

| القياس | النتيجة |
|---|---:|
| مكونات TSX الحالية | 35 |
| مسارات API | 69، بزيادة مسار Source Health واحد فقط فوق مسارات v10 |
| ملفات lib الرئيسية | 42 |
| أسطر `page.tsx` | 1929 |
| ملفات الاختبار | 26 ناجحة |
| الاختبارات | 371 ناجحة، 6 متخطاة، 377 إجمالاً |
| Build | ناجح: compilation وTypeScript وstatic/dynamic route generation |
| old-name scan في `src` و`public` | صفر نتائج |
| product payment/support scan في `src` و`public` وREADME | لا توجد عناصر دفع أو دعم؛ المطابقة الوحيدة المتبقية في `src/lib/sherlock.ts` هي اسم موقع ضمن قائمة مواقع OSINT، وليست رابطاً أو واجهة دفع |

## التشغيل

```bash
npm install --no-audit --no-fund
npm test -- --run
NODE_OPTIONS=--max-old-space-size=768 npm run build
npm run dev
```

يفتح Command Palette عبر `Ctrl/Cmd + K`. تفتح Source Health من زر `HEALTH`، وتفتح مساحة المحلل من زر `ANALYST`. يحتاج scanner إلى `SCANNER_URL` و`SCANNER_KEY`. أما AI فيستخدم fallback المحلي إذا لم توجد مفاتيح Gemini، ويمكن تفعيل المزود من إعدادات الخادم وفق سياسة الأسرار.

## ملاحظات تحقق صريحة

نجح HTTP smoke test على الصفحة الرئيسية وعلى `/api/health/sources`، وظهرت رؤوس الأمان الجديدة في الاستجابة. تعذر تنفيذ فحص بصري تفاعلي بالمتصفح في هذه الجلسة لأن بيئة المتصفح لم تكن متاحة؛ لذلك لا أصف هذا الإصدار بأنه اجتاز فحصاً بصرياً شاملاً.

حاول `npm run lint` الشامل استهلاك ذاكرة كبيرة وانتهى بـOOM في بيئة sandbox. نجح lint المستهدف لـ`SourceHealthPanel.tsx` بعد إصلاح قاعدة `set-state-in-effect`. أما المخالفات المتبقية في الفحص الأوسع فتتضمن مخالفات تاريخية موجودة في `page.tsx` و`api/ai/overview`، خصوصاً `any` والوصول إلى refs أثناء render؛ لم أقم بإعادة كتابة هذه المناطق لأن ذلك قد يغيّر تدفقات v10، وسجلت النتيجة بدلاً من إخفائها.

## البنود المؤجلة عمداً

لم يُشغّل Redis أو collectors أو scanner worker دائم أو webhooks أو تنبيهات خارج المتصفح. هذه البنود تتطلب قرار استضافة مستمرة، تخزيناً مشتركاً، secrets حقيقية، وسياسة تشغيل ومراقبة. يوجد ملف Redis اختياري للتخطيط فقط ولا يدخل في compose الأساسي.

كما أن Focus Modes وtimeline الحاليين طبقة سياق وتحليل محلي؛ لا يدّعيان إيقاف كل polling الحي أو بناء correlation سببي بين مزودات مستقلة. أي استخدام تشغيلي يتطلب ربطه بمصدر event revisions حقيقي ومراجعة محلل.

## الملفات المساعدة

- `ROADMAP-EXECUTION-AUDIT.md` — مطابقة قائمة الأوامر بالواقع.
- `SECURITY.md` — سياسة الاستخدام المسؤول وحدود RECON.
- `CONTRIBUTING.md` — قواعد الاختبار والمساهمة.
- `docker-compose.redis.example.yml` — profile Redis اختياري غير مفعّل.
- `v10-browser-smoke.md` — آخر سجل smoke سابق متاح.
- `oculix-release-tests.log` و`oculix-release-build.log` — سجلات التحقق الأخيرة خارج الأرشيف المؤقت.

## قرار البنية المستمرة

يعمل الإصدار الحالي بأمان دون Redis أو worker دائم، وهو الخيار المناسب للحزمة الحالية القابلة للنشر على Next.js. أُرفق Redis كـprofile اختياري للتجارب اللاحقة فقط. لا يجوز تفعيل collectors أو scanner workers أو webhooks في الإنتاج قبل اختيار بيئة مستمرة، secrets، سياسات rate limit، ومراقبة مستقلة.

## Final archive

- Archive: `Oculix-roadmap-release.zip`
- SHA-256: يُرفق في ملف checksum الخارجي بجانب الأرشيف بعد اكتمال الضغط.
- Excluded: `node_modules`, `.next`, `.git`

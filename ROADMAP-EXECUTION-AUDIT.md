# Oculix roadmap execution audit

هذا التدقيق يفسر قائمة التحسينات المرفقة مقابل بنية Oculix الحالية. كل بند مصنف إلى: موجود جزئياً، قابل للتنفيذ داخل التطبيق الآن، أو يحتاج خدمة/قرار نشر منفصل. لا تُفعّل عمليات شبكة أو مهام خلفية أو نموذج ذكاء اصطناعي اعتماداً على نص مرفق وحده دون مراجعة مدخلاتها وحدودها.

| المحور | الوضع الحالي | التنفيذ الآمن المقترح |
|---|---|---|
| حماية RECON | يوجد `src/lib/ssrf-guard.ts` مع حظر private/link-local، allowlist للبروتوكولات، إعادة توجيه يدوية، مهلة حسب route، وrate limit داخل الذاكرة. | توحيد استخدامه في جميع routes ذات الهدف المستخدم، إضافة حدود حجم الاستجابة، توثيق الرفض، وkill switch محلي للمهام الطويلة. العزل الكامل يحتاج worker مستقل. |
| Scanner isolation | `/api/scanner` يمرر الطلب إلى `SCANNER_URL` بعد التحقق لكنه ليس queue/worker مستقلاً. | إبقاء gateway سريعاً ومحدوداً، وإضافة عقد job آمن. التشغيل الدائم للعامل يحتاج بنية نشر مستقلة واعتماد المستخدم. |
| Data quality | `sourceCache` يدعم TTL وstale-on-error، وSDK types يحتوي confidence لبعض الكيانات، لكن لا يوجد نموذج موحد للـsource/timestamp/age/latency/status. | إضافة metadata موحدة غير مدمرة حول نتائج المصادر ومكوّن freshness. |
| Source Health Center | غير موجود كمركز مستقل، وhealth endpoint بسيط. | إضافة registry ومؤشرات latency/error/last update مع عدم تحويل فشل مصدر إلى فشل المنصة. |
| Confidence/provenance | توجد حقول confidence في بعض SDK types فقط. | إضافة provenance/evidence chain إلى النتائج الجديدة فقط وعدم اختلاق ثقة للبيانات غير المؤكدة. |
| Timeline/correlation | لا توجد واجهة موحدة، مع وجود AOI/watch primitives جزئية. | بناء طبقة أحداث محلية تعرض revisions والارتباطات بصيغة “possible correlation” دون ادعاء السببية. |
| Analyst Mode/investigations | توجد خريطة وأدوات Draw وAOI وتصدير، ولا توجد investigation workspace محفوظة. | إضافة Analyst Mode وsnapshot/notes/investigation محلياً باستخدام localStorage أولاً، مع تصميم قابل لاستبدال التخزين لاحقاً. |
| Clustering/viewport/time | توجد طبقات ومناطق عرض، لكن لا يوجد time slider شامل أو modes موحدة. | إضافة controls additive مع عدم تغيير مصادر البيانات أو إخفاء الطبقات الأصلية. |
| Recon unified/entity graph | أدوات RECON منفصلة موجودة؛ لا توجد orchestration/graph موحدة. | إضافة واجهة تجميع اختيارية تتعامل مع النتائج كأدلة وروابط، مع احترام SSRF والوقت والحدود. |
| Localization | العربية وEnglish موجودتان وLocaleSurface يعالج النصوص الثابتة وسمات التحكم. | توسيع القاموس على مراحل، وإضافة لغات أخرى فقط عبر dictionaries صريحة، مع إبقاء IP/URL/CVE والأسماء الحية LTR وغير مترجمة. |
| Cache/collectors | cache داخل الذاكرة وطلب-on-demand؛ لا يوجد Redis أو collector دائم. | يمكن إضافة persistent cache/collectors فقط بعد اختيار استضافة وخدمة تخزين. لا ينبغي استخدام scheduled AI runs للاستطلاع الدقيق. |
| Graceful degradation | `sourceCache` لديه stale-on-error، وبعض routes تستخدم optional enrichment. | توحيد رسائل المصدر المتوقف ووقت آخر نجاح داخل Source Health. |
| Tests/E2E | 24 ملفات اختبار، 365 ناجحاً و6 متخطاة في آخر تشغيل. لا يوجد Playwright شامل مثبت. | إضافة unit/API/RTL/security tests أولاً، ثم E2E بعد تثبيت بيئة متصفح مستقرة. |
| Headers/observability | middleware الحالي يرسل analytics ولا يضيف CSP/HSTS؛ health endpoint بسيط. | إضافة security headers آمنة ومراقبة latency/errors دون تسجيل أسرار أو عناوين حساسة. |
| UX | SearchBar وKeyboardShortcuts موجودان؛ لا توجد command palette موحدة. | إضافة Ctrl/Cmd+K وglobal search فوق الأدوات الحالية دون تعطيل shortcuts أو navigation. |
| AI Analyst | توجد routes عامة لـAI، لكن لا يوجد محلل منطقة منظم مع evidence/uncertainty. | إضافة endpoint اختياري server-side مع structured output وحماية من إرسال بيانات حساسة، بعد تعريف نموذج التكلفة والسياسة. |
| Alerts/watchlists/reports | توجد Live Alerts وAOI/watch primitives، ولا توجد watchlist/report builder شاملان. | إضافة watchlists وتنبيهات محلية أولاً، ثم تقارير Markdown/HTML قابلة لإعادة البناء من snapshot. |
| GitHub/community | يوجد README/docs للمشروع، لكن يلزم فحص شامل للـCI والقوالب والسياسة الأمنية وplaceholder. | إضافة README release checklist وSECURITY/CONTRIBUTING وقوالب issues وCI دون ادعاء نشر أو حساب GitHub غير متاح. |

## قرار التنفيذ

يمكن تنفيذ Sprint أول داخل المستودع دون خدمة خارجية: تقوية headers وRECON، metadata/freshness، Source Health، Analyst Mode محلي، investigations، provenance، command palette، localization polish، tests، docs، وCI. أما Redis وbackground collectors وscanner isolation الكامل وwebhooks والتنبيهات خارج المتصفح فتحتاج قراراً بين تشغيل محلي/خادم دائم/استضافة مُدارة وتوفير أسرار مزودي البيانات. لن تُفعّل تلك الأجزاء تلقائياً أو تُرسل بيانات إلى خدمة خارجية دون اعتماد واضح.

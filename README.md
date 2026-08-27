<div align="center">

# Oculix

### Open-source intelligence, geospatial awareness and analyst workspace

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org) [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org) [![MapLibre](https://img.shields.io/badge/MapLibre-WebGL-396CB2?style=for-the-badge)](https://maplibre.org) [![License](https://img.shields.io/badge/License-MIT-D4AF37?style=for-the-badge)](LICENSE)

**Oculix يجمع طبقات الطيران والملاحة والأقمار والكاميرات والزلازل والحرائق والطقس والأخبار والتهديدات في خريطة تفاعلية واحدة، مع فصل واضح بين المشاهدة الحية والتحليل الموثق.**

[Live Demo](https://oculixlive.app) · [Issues](../../issues) · [Security disclosure](SECURITY.md)

</div>

## لماذا Oculix؟

Oculix ليس مصدراً وحيداً للحقيقة ولا نظاماً يقرر نيابة عن المحلل. البيانات الخارجية قد تتأخر أو تتوقف، لذلك تحمل المصادر المستخدمة metadata عن المصدر ووقت آخر جلب وعمر البيانات وحالة `LIVE` أو `DELAYED` أو `STALE` أو `UNKNOWN`. درجة الثقة المعروضة هي مؤشر على جودة المصدر وحداثته وسجل نجاحه، وليست إثباتاً لصحة الادعاء.

## القدرات الأساسية

| المجال | الوظيفة | طبيعة المصدر |
|---|---|---|
| الخريطة | Globe/2D، طبقات، عدادات، viewport-aware loading، رسم ومناطق اهتمام | MapLibre/WebGL ومصادر عامة |
| الطيران والملاحة | طائرات وسفن ومطارات ومسارات | مزودات عامة مع fallback حيث يتوفر |
| الأحداث | زلازل وحرائق وطقس ونزاعات وبنية تحتية | USGS وNASA ومصادر عامة أخرى |
| الأخبار والبث | موجز أخبار وروابط بث عامة وكاميرات | Telegram public preview وRSS ومزودات خارجية |
| Recon | IP وDNS وWHOIS والشهادات وBGP وCVE وتهديدات | مسارات مقيدة وسياسة أمان صريحة |
| التحليل | Analyst Mode، snapshots، timeline، evidence chain، notes، correlation heuristic | محلي في المتصفح |
| البحث | Command Palette مع `Ctrl/Cmd + K` للبحث في البيانات الحالية وفتح Recon للاستعلامات الأمنية | فوري، بلا فهرس مركزي خارجي |
| المتابعة | Watchlists وقواعد تنبيه محلية | localStorage؛ بلا worker خلفي في هذه النسخة |

## موثوقية البيانات

يستخدم المشروع `src/lib/sourceHealth.ts` و`src/lib/sourceCache.ts` كسجل ومخزن مركزيين داخل عملية التطبيق. تُقاس latency وrequests وcache hits وerrors ووقت آخر نجاح، ويُستخدم stale-on-error وin-flight dedup لتفادي إسقاط الطبقة أو تكرار الطلبات عند سقوط مصدر. المساران `/api/health/sources` و`/api/health` يقدمان حالة المصادر والمؤشرات التشغيلية.

تتضمن استجابات الأخبار والأسواق metadata من الشكل التالي:

```json
{
  "source": "markets",
  "fetchedAt": "2026-08-27T00:00:00.000Z",
  "ageSeconds": 42,
  "freshness": "LIVE",
  "confidence": 0.94,
  "status": "live"
}
```

لا تعيد واجهة Oculix تسمية قيمة كاش قديمة بأنها LIVE لمجرد أن المتصفح أرسل طلباً جديداً. راجع [docs/API.md](docs/API.md) و[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) للعقد الكامل.

## Analyst Mode والتحقيقات

يفصل Analyst Mode بين الزمن الحي وسياق التحقيق. يستطيع المستخدم تثبيت snapshot، اختيار نطاق زمني، مراجعة الأحداث الفعلية في timeline، حفظ الملاحظات وسياق الخريطة والأدلة، وتوليد تقرير Markdown يحتوي الملخص والعدادات والخط الزمني والمصادر والثقة وملاحظات المحلل. يحاول correlation engine العثور على تقارب زمني ومكاني بين أنواع مختلفة من الأحداث، ويعرضه صراحة على أنه **ارتباط محتمل** لا علاقة سببية.

التحقيقات والـwatchlists محلية في المتصفح. رابط المشاركة يحمل payload للتحقيق في عنوان URL، لذلك لا ينبغي وضع أسرار أو بيانات شخصية فيه. المشاركة التعاونية بصلاحيات ومخزن مركزي تحتاج deployment/storage إضافياً ولم تُدّعَ في هذه النسخة.

## أمان Recon

بوابة `/api/scanner` ليست proxy مفتوحاً. تُقبل أنواع scan محدودة، وتُفرض حدود للهدف والاستجابة والمهلة والتزامن ومعدل الطلب، مع منع localhost وprivate/loopback/link-local/metadata addresses وصيغ IPv4 غير القياسية والتحويلات غير الآمنة. عنوان خدمة scanner والمفتاح لا يظهران في المتصفح، وسجل التدقيق يحتفظ بـhash للعميل والهدف بدلاً من القيمة الخام. العزل الكامل للـworker يتطلب خدمة نشر مستقلة؛ راجع [SECURITY.md](SECURITY.md).

## التشغيل المحلي

```bash
git clone https://github.com/your-github-account/oculix.git
cd oculix
npm install
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000). يعمل جزء كبير من التطبيق دون مفاتيح، بينما تعيد أدوات Recon حالة `503` إلى أن تُضبط خدمة scanner. انسخ `.env.example` إلى `.env` عند الحاجة، ولا تُضمّن `.env` في Git.

```bash
cp .env.example .env
npm test -- --run
NODE_OPTIONS=--max-old-space-size=1536 npm run build
```

## Docker والنشر

```bash
docker compose up -d --build
```

يستمع التطبيق داخل الحاوية على المنفذ 3000. راجع [DOCKER.md](DOCKER.md) للتفاصيل. ملف [docker-compose.redis.example.yml](docker-compose.redis.example.yml) اختياري وغير مفعّل؛ لا يُشغّل Redis أو collectors أو workers تلقائياً.

## التشغيل الخلفي والأداء

يستخدم Oculix حالياً caching داخل العملية، dedup للطلبات المتزامنة، progressive loading، وviewport-aware endpoints في المسارات التي تدعم ذلك. Redis دائم، background collectors، queue workers، clustering على مستوى الخدمة، webhooks وPush Notifications تحتاج قرار نشر وstorage/secrets ومراقبة تشغيلية؛ لا ينبغي تنفيذ polling لكل مستخدم من المتصفح. يوضح [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) الحدود وخيار التوسعة الآمن.

## الاختبارات وممارسات المجتمع

توجد اختبارات وحدات وتكامل للمسارات والمساعدات الجغرافية والأمنية والكاش، ويشغل CI الاختبارات والبناء. تشمل إعدادات GitHub المقترحة CodeQL وDependabot، وتوجد قوالب Issues ومسار disclosure أمني. اختبارات E2E وload testing تحتاج بيئة متصفح/نشر مخصصة ولم تُخفَ هذه الحقيقة خلف ادعاء نجاح غير متاح.

| الملف | الغرض |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | البنية ومسار البيانات وحدود التشغيل |
| [docs/API.md](docs/API.md) | عقود API وfreshness وRecon |
| [CONTRIBUTING.md](CONTRIBUTING.md) | طريقة المساهمة والاختبار |
| [SECURITY.md](SECURITY.md) | حدود Recon والإبلاغ الأمني |
| [CHANGELOG.md](CHANGELOG.md) | سجل التغييرات والإصدارات |
| [VIDEO-ERROR-FINDINGS.md](VIDEO-ERROR-FINDINGS.md) | نتائج تحليل فيديو الأخطاء وإصلاحاتها |
| [LICENSE](LICENSE) | رخصة MIT |

## العلامة والرخصة

العلامة التجارية المرئية هي **Oculix** والشعار OX مبني على المرجع الموجود في `public/`. لا يُسمح بإعادة إدخال الاسم القديم في واجهة المنتج. المشروع مرخص تحت MIT؛ راجع [LICENSE](LICENSE). من صنع **Abdullah Qatan**.

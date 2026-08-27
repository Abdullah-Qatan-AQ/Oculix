# Oculix API Contract

تُستدعى هذه المسارات من واجهة Oculix نفسها. معظمها يعيد بيانات خارجية وقد يتأخر أو يفشل؛ افحص `timestamp` و`metadata` وHTTP status قبل اعتبار النتيجة صالحة.

## Core feeds

| المسار | الوظيفة | ملاحظات الثقة |
|---|---|---|
| `/api/flights` | طيران ومواقع aircraft | قد يستخدم fallback عند تعذر OpenSky؛ لا تعرض snapshot القديم كـLIVE. |
| `/api/earthquakes` | أحداث USGS | `time` هو وقت الحدث من المصدر، وليس وقت طلب المتصفح. |
| `/api/news` | Telegram public previews مع RSS fallback | يعيد `metadata.source`, `fetchedAt`, `ageSeconds`, `freshness`, `confidence`, `status`. |
| `/api/markets` | أسعار ومؤشرات ومخططات | يعيد metadata مبنية على آخر refresh ناجح للكاش، لا على وقت استجابة الطلب. |
| `/api/cctv` | فهارس كاميرات حسب region/viewport | بعض الصور snapshots وليست بثاً لحظياً؛ يجب عرض مصدر الصورة وعمر الفهرس. |
| `/api/live-news` | روابط بث عامة | قدرة الـembed تعتمد على المزود الخارجي. |
| `/api/health/sources` | registry لصحة المصادر المستخدمة | يعرض latency وerrors وrequests وcacheHits وreliability وfreshness وconfidence. |
| `/api/health` | readiness وobservability summary | يعرض cache hit ratio وp95 source latency وعدد المصادر المتأخرة/المتقادمة. |

## Freshness metadata

```json
{
  "source": "markets",
  "fetchedAt": "2026-08-27T00:00:00.000Z",
  "ageSeconds": 42,
  "freshness": "LIVE",
  "confidence": 0.94,
  "status": "live",
  "cacheHits": 7
}
```

القيم الممكنة لـ`freshness` هي `LIVE` و`DELAYED` و`STALE` و`UNKNOWN`. `confidence` قيمة اختيارية، وهي جودة freshness/source history وليست احتمال صحة ادعاء إخباري.

## Recon gateway

`GET /api/scanner?target=<host>&type=<scan>` هو المسار الوحيد الذي يمرر هدفاً إلى خدمة scanner مهيأة على الخادم. الأنواع المسموحة هي `quick`, `ssl`, `headers`, `rdns`, `subdomains`, `tech`, `whois`, `geoloc`, و`vuln`. تُرفض الأنواع العميقة مثل port-range وtraceroute وbanner من الواجهة العامة.

يُفرض حد 253 محرفاً للهدف، وحد 512KB للاستجابة، وtimeout لكل نوع، و5 طلبات لكل دقيقة لكل عنوان عميل، وحد عمل متزامن صغير. يُرفض `localhost` وprivate/loopback/link-local/metadata IPs وصيغ IPv4 الرقمية غير القياسية، ويُشترط `SCANNER_URL` بصيغة HTTPS دون credentials أو path traversal. السجل يحتفظ بـhash للعميل والهدف بدلاً من تخزين الهدف الخام.

## Fallback and errors

عند سقوط مصدر، تعيد المسارات المرتبطة بالكاش آخر قيمة صالحة مع freshness متقادمة/متأخرة بدلاً من إسقاط الطبقة بصمت. إذا لم توجد قيمة صالحة، تعاد قائمة فارغة أو HTTP 503 بحسب المسار. لا تخلط بين `200` مع قائمة فارغة وبين إثبات أن المصدر حي؛ افحص metadata.

## Local analytical APIs

لا يوجد حالياً مخزن مركزي للتحقيقات أو خدمة مشاركة بصلاحيات. التحقيقات والتقارير والـwatchlists تحفظ محلياً في المتصفح، والمشاركة تستخدم رابطاً يحمل payload للتحقيق. لا تضع أسراراً أو بيانات شخصية في هذا الرابط.

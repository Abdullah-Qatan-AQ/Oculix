# Changelog

## Unreleased

### Added

- مصدر موحد لحساب عمر البيانات وحالات `LIVE`, `DELAYED`, `STALE`, و`UNKNOWN` مع confidence مرتبطة بتاريخ المصدر وحداثته.
- metadata موثوقية في أخبار وأسواق Oculix، ومؤشرات observability في `/api/health`.
- Analyst timeline مبني على الأحداث الحالية، حفظ snapshot وسياق الخريطة، evidence chain، correlation heuristic غير سببي، وتصدير تقرير Markdown.
- مشاركة التحقيق عبر رابط payload محلي مع ترحيل التحقيقات القديمة من v1.
- بحث موحد داخل Command Palette عن البيانات الحالية، مع فتح الاستعلامات الأمنية في Recon وتمركز النتائج الموضّعة على الخريطة.
- سياسة scanner مركزية قابلة للاختبار، concurrency cap، واشتراط HTTPS لخدمة scanner.
- اختبارات freshness وscanner-policy وSSRF، ووثائق Architecture وAPI ومخطط Mermaid/PNG.
- إعدادات CI/CD المجتمعية وCodeQL وDependabot وقوالب issue.

### Changed

- لم تعد واجهات Markets وAlerts وIntel تعرض كل البيانات على أنها Live بلا تمييز.
- أصبحت أخطاء مزودات الأخبار والأسواق قابلة للتتبع عبر source health وstale fallback بدلاً من اختفاء المصدر بصمت.

### Deferred by design

- Redis دائم، collectors مستمرة، queue workers، webhooks، push notifications، ومشاركة تحقيقات بصلاحيات تحتاج قرار نشر وتخزيناً وأسراراً ومراقبة تشغيلية.
- E2E وload testing يحتاجان بيئة متصفح/نشر مخصصة؛ اختبارات الوحدات والتكامل وأمن السياسة موجودة داخل المشروع.

import { describe, expect, it } from 'vitest';
import { buildWorldReport, worldReportMarkdown } from './world-report';

const now = Date.parse('2026-08-27T12:00:00.000Z');

describe('buildWorldReport', () => {
  it('includes timestamped events from the last 24 hours and excludes older data', () => {
    const report = buildWorldReport({
      news: [{ id: 'n1', title: 'Current report', published: '2026-08-27T10:00:00Z', source: 'Feed A', coords: [41.1, 29.0] }, { id: 'old', title: 'Old report', published: '2026-08-25T10:00:00Z', source: 'Feed A' }],
      earthquakes: [{ id: 'q1', place: 'Test Basin', time: now - 30 * 60 * 1000, magnitude: 5.1, lat: 10, lng: 20 }],
    }, now);
    expect(report.events).toHaveLength(2);
    expect(report.events.find(event => event.id === 'n1')?.location).toBe('41.100, 29.000');
    expect(report.byCategory.news).toBe(1);
    expect(report.byCategory.earthquake).toBe(1);
    expect(report.byLocation).toHaveLength(2);
  });

  it('keeps source, coordinates, freshness and confidence explicit', () => {
    const report = buildWorldReport({ fires: [{ id: 'f1', name: 'Hotspot', timestamp: new Date(now - 10 * 60 * 1000).toISOString(), source: 'FIRMS', fetchedAt: new Date(now - 10 * 60 * 1000).toISOString(), lat: 1.23456, lng: 2.34567, confidence: 0.8 }] }, now);
    expect(report.events[0]).toMatchObject({ source: 'FIRMS', location: '1.235, 2.346', freshness: 'DELAYED', sourceAgeSeconds: 600 });
    expect(report.events[0].confidence).toBeGreaterThan(0);
  });

  it('uses feed metadata for source freshness when an item lacks its own fetch time', () => {
    const report = buildWorldReport({ newsMeta: { fetchedAt: new Date(now - 30 * 1000).toISOString() }, news: [{ id: 'n1', title: 'Feed item', published: new Date(now - 60 * 60 * 1000).toISOString(), source: 'Feed' }] }, now);
    expect(report.events[0]).toMatchObject({ freshness: 'LIVE', sourceAgeSeconds: 30 });
  });

  it('exports a readable markdown report with an explicit coverage caveat', () => {
    const report = buildWorldReport({ news: [{ title: 'Event', published: new Date(now - 1000).toISOString(), source: 'Feed' }] }, now);
    const markdown = worldReportMarkdown(report);
    expect(markdown).toContain('# Oculix');
    expect(markdown).toContain('not a claim of exhaustive global coverage');
    expect(markdown).toContain('Event');
  });
});

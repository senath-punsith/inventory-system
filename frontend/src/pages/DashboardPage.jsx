import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function DashboardPage() {
  const [summary, setSummary] = useState({ cupboards: 0, places: 0, items: 0, borrowed: 0 });

  useEffect(() => {
    const load = async () => {
      const [cupboards, places, items, borrowings] = await Promise.all([
        api.get('/cupboards'),
        api.get('/places'),
        api.get('/items'),
        api.get('/borrowings'),
      ]);

      const borrowedCount = (borrowings.data.data || []).filter((x) => x.status === 'borrowed').length;
      setSummary({
        cupboards: cupboards.data.total || 0,
        places: places.data.total || 0,
        items: items.data.total || 0,
        borrowed: borrowedCount,
      });
    };

    load().catch(() => undefined);
  }, []);

  return (
    <section>
      <h2>System Snapshot</h2>
      <div className="stats-grid">
        <article className="stat-card">
          <h3>Cupboards</h3>
          <strong>{summary.cupboards}</strong>
        </article>
        <article className="stat-card">
          <h3>Places</h3>
          <strong>{summary.places}</strong>
        </article>
        <article className="stat-card">
          <h3>Items</h3>
          <strong>{summary.items}</strong>
        </article>
        <article className="stat-card">
          <h3>Open Borrowings</h3>
          <strong>{summary.borrowed}</strong>
        </article>
      </div>
    </section>
  );
}

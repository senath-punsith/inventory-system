import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function ActivityPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/activity-logs');
        setRows(response.data.data || []);
      } catch {
        setError('Activity logs are admin-only.');
      }
    };

    load().catch(() => undefined);
  }, []);

  return (
    <section>
      <h2>Activity Logs</h2>
      {error && <div className="error-box">{error}</div>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Action</th>
              <th>Entity</th>
              <th>User</th>
              <th>Old</th>
              <th>New</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.action}</td>
                <td>{row.entity_type}</td>
                <td>{row.user?.name || '-'}</td>
                <td>{JSON.stringify(row.old_values)}</td>
                <td>{JSON.stringify(row.new_values)}</td>
                <td>{new Date(row.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

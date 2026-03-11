import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function CupboardsPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ name: '', code: '', description: '' });

  const load = async () => {
    const response = await api.get('/cupboards');
    setRows(response.data.data || []);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    await api.post('/cupboards', form);
    setForm({ name: '', code: '', description: '' });
    await load();
  };

  return (
    <section>
      <h2>Cupboards</h2>
      <form className="inline-form" onSubmit={submit}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          required
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button className="btn-primary" type="submit">
          Add
        </button>
      </form>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Places</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.code}</td>
                <td>{row.places_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function PlacesPage() {
  const [rows, setRows] = useState([]);
  const [cupboards, setCupboards] = useState([]);
  const [form, setForm] = useState({ cupboard_id: '', name: '', code: '', description: '' });

  const load = async () => {
    const [placesResponse, cupboardsResponse] = await Promise.all([
      api.get('/places'),
      api.get('/cupboards'),
    ]);
    setRows(placesResponse.data.data || []);
    setCupboards(cupboardsResponse.data.data || []);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    await api.post('/places', form);
    setForm({ cupboard_id: '', name: '', code: '', description: '' });
    await load();
  };

  return (
    <section>
      <h2>Places</h2>
      <form className="inline-form" onSubmit={submit}>
        <select
          required
          value={form.cupboard_id}
          onChange={(e) => setForm({ ...form, cupboard_id: e.target.value })}
        >
          <option value="">Select Cupboard</option>
          {cupboards.map((cupboard) => (
            <option key={cupboard.id} value={cupboard.id}>
              {cupboard.name}
            </option>
          ))}
        </select>
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
              <th>Cupboard</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.code}</td>
                <td>{row.cupboard?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

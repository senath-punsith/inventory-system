import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function PlacesPage() {
  const [rows, setRows] = useState([]);
  const [cupboards, setCupboards] = useState([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [editingId, setEditingId] = useState(null);
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
    setError('');

    try {
      if (editingId) {
        await api.put(`/places/${editingId}`, form);
      } else {
        await api.post('/places', form);
      }

      setForm({ cupboard_id: '', name: '', code: '', description: '' });
      setEditingId(null);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to save place.');
    }
  };

  const startEdit = (row) => {
    setError('');
    setEditingId(row.id);
    setForm({
      cupboard_id: row.cupboard_id ? String(row.cupboard_id) : '',
      name: row.name || '',
      code: row.code || '',
      description: row.description || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ cupboard_id: '', name: '', code: '', description: '' });
  };

  const deletePlace = async (id, name) => {
    const ok = window.confirm(`Delete place "${name}"? This will remove linked items.`);
    if (!ok) {
      return;
    }

    setError('');
    setBusyId(id);

    try {
      await api.delete(`/places/${id}`);

      if (editingId === id) {
        cancelEdit();
      }

      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to delete place.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section>
      <h2>Places</h2>
      {error && <div className="error-box">{error}</div>}
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
          {editingId ? 'Save' : 'Add'}
        </button>
        {editingId ? (
          <button className="btn-outline" type="button" onClick={cancelEdit}>
            Cancel
          </button>
        ) : null}
      </form>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Cupboard</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.code}</td>
                <td>{row.cupboard?.name}</td>
                <td>
                  <button
                    className="btn-chip"
                    type="button"
                    onClick={() => startEdit(row)}
                    disabled={busyId === row.id}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-chip"
                    type="button"
                    onClick={() => deletePlace(row.id, row.name)}
                    disabled={busyId === row.id}
                    style={{ color: '#7e2a1e', borderColor: '#f4b2a2' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

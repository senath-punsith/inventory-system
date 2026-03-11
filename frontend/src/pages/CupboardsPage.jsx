import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function CupboardsPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [editingId, setEditingId] = useState(null);
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
    setError('');

    try {
      if (editingId) {
        await api.put(`/cupboards/${editingId}`, form);
      } else {
        await api.post('/cupboards', form);
      }

      setForm({ name: '', code: '', description: '' });
      setEditingId(null);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to save cupboard.');
    }
  };

  const startEdit = (row) => {
    setError('');
    setEditingId(row.id);
    setForm({
      name: row.name || '',
      code: row.code || '',
      description: row.description || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', code: '', description: '' });
  };

  const deleteCupboard = async (id, name) => {
    const ok = window.confirm(`Delete cupboard "${name}"? This will remove linked places and items.`);
    if (!ok) {
      return;
    }

    setError('');
    setBusyId(id);

    try {
      await api.delete(`/cupboards/${id}`);

      if (editingId === id) {
        cancelEdit();
      }

      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to delete cupboard.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section>
      <h2>Cupboards</h2>
      {error && <div className="error-box">{error}</div>}
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
              <th>Places</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.code}</td>
                <td>{row.places_count}</td>
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
                    onClick={() => deleteCupboard(row.id, row.name)}
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

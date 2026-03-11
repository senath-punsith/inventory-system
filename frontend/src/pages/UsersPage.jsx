import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function UsersPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });

  const load = async () => {
    try {
      const response = await api.get('/users');
      setRows(response.data.data || []);
      setError('');
    } catch {
      setError('User management is admin-only.');
      setRows([]);
    }
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    await api.post('/users', form);
    setForm({ name: '', email: '', password: '', role: 'staff' });
    await load();
  };

  const updateRole = async (id, role) => {
    await api.patch(`/users/${id}/role`, { role });
    await load();
  };

  const removeUser = async (id, email) => {
    const confirmed = window.confirm(`Remove user ${email}?`);
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/users/${id}`);
      setError('');
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to remove user.');
    }
  };

  return (
    <section>
      <h2>User Management</h2>
      {error && <div className="error-box">{error}</div>}
      {!error && (
        <>
          <form className="inline-form" onSubmit={submit}>
            <input
              placeholder="Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              placeholder="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              placeholder="Password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
            <button className="btn-primary" type="submit">
              Create
            </button>
          </form>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Set Role</th>
                  <th>Remove</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.email}</td>
                    <td>{row.role}</td>
                    <td>
                      <button className="btn-chip" onClick={() => updateRole(row.id, 'staff')} type="button">
                        Staff
                      </button>
                      <button className="btn-chip" onClick={() => updateRole(row.id, 'admin')} type="button">
                        Admin
                      </button>
                    </td>
                    <td>
                      <button className="btn-chip" onClick={() => removeUser(row.id, row.email)} type="button">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function BorrowingsPage() {
  const [rows, setRows] = useState([]);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    borrower_name: '',
    borrower_contact: '',
    borrow_date: '',
    expected_return_date: '',
    quantity_borrowed: 1,
  });
  const [form, setForm] = useState({
    item_id: '',
    borrower_name: '',
    borrower_contact: '',
    borrow_date: '',
    expected_return_date: '',
    quantity_borrowed: 1,
  });

  const load = async () => {
    const [borrowingResponse, itemResponse] = await Promise.all([api.get('/borrowings'), api.get('/items')]);
    setRows(borrowingResponse.data.data || []);
    setItems(itemResponse.data.data || []);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await api.post('/borrowings', { ...form, quantity_borrowed: Number(form.quantity_borrowed) });
      setForm({
        item_id: '',
        borrower_name: '',
        borrower_contact: '',
        borrow_date: '',
        expected_return_date: '',
        quantity_borrowed: 1,
      });
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to create borrowing.');
    }
  };

  const returnItem = async (id) => {
    setError('');
    setBusyId(id);
    try {
      await api.post(`/borrowings/${id}/return`);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to return item.');
    } finally {
      setBusyId(null);
    }
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditForm({
      borrower_name: row.borrower_name,
      borrower_contact: row.borrower_contact,
      borrow_date: row.borrow_date,
      expected_return_date: row.expected_return_date || '',
      quantity_borrowed: row.quantity_borrowed,
    });
  };

  const saveEdit = async (row) => {
    setError('');
    setBusyId(row.id);

    try {
      const payload = {
        borrower_name: editForm.borrower_name,
        borrower_contact: editForm.borrower_contact,
        borrow_date: editForm.borrow_date,
        expected_return_date: editForm.expected_return_date || null,
      };

      if (row.status === 'borrowed') {
        payload.quantity_borrowed = Number(editForm.quantity_borrowed);
      }

      await api.put(`/borrowings/${row.id}`, payload);
      setEditingId(null);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to update borrowing.');
    } finally {
      setBusyId(null);
    }
  };

  const deleteBorrowing = async (id) => {
    if (!window.confirm('Delete this borrowing record?')) {
      return;
    }

    setError('');
    setBusyId(id);
    try {
      await api.delete(`/borrowings/${id}`);
      if (editingId === id) {
        setEditingId(null);
      }
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to delete borrowing.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section>
      <h2>Borrowings</h2>
      {error && <div className="error-box">{error}</div>}
      <form className="inline-form" onSubmit={submit}>
        <select required value={form.item_id} onChange={(e) => setForm({ ...form, item_id: e.target.value })}>
          <option value="">Select Item</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.quantity})
            </option>
          ))}
        </select>
        <input
          placeholder="Borrower"
          required
          value={form.borrower_name}
          onChange={(e) => setForm({ ...form, borrower_name: e.target.value })}
        />
        <input
          placeholder="Contact"
          required
          value={form.borrower_contact}
          onChange={(e) => setForm({ ...form, borrower_contact: e.target.value })}
        />
        <input
          type="date"
          required
          value={form.borrow_date}
          onChange={(e) => setForm({ ...form, borrow_date: e.target.value })}
        />
        <input
          type="date"
          value={form.expected_return_date}
          onChange={(e) => setForm({ ...form, expected_return_date: e.target.value })}
        />
        <input
          type="number"
          min="1"
          value={form.quantity_borrowed}
          onChange={(e) => setForm({ ...form, quantity_borrowed: e.target.value })}
        />
        <button className="btn-primary" type="submit">
          Borrow
        </button>
      </form>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Borrower</th>
              <th>Contact</th>
              <th>Borrow Date</th>
              <th>Expected Return</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.item?.name}</td>
                <td>
                  {editingId === row.id ? (
                    <input
                      value={editForm.borrower_name}
                      onChange={(e) => setEditForm({ ...editForm, borrower_name: e.target.value })}
                    />
                  ) : (
                    row.borrower_name
                  )}
                </td>
                <td>
                  {editingId === row.id ? (
                    <input
                      value={editForm.borrower_contact}
                      onChange={(e) => setEditForm({ ...editForm, borrower_contact: e.target.value })}
                    />
                  ) : (
                    row.borrower_contact
                  )}
                </td>
                <td>
                  {editingId === row.id ? (
                    <input
                      type="date"
                      value={editForm.borrow_date || ''}
                      onChange={(e) => setEditForm({ ...editForm, borrow_date: e.target.value })}
                    />
                  ) : (
                    row.borrow_date
                  )}
                </td>
                <td>
                  {editingId === row.id ? (
                    <input
                      type="date"
                      value={editForm.expected_return_date || ''}
                      onChange={(e) => setEditForm({ ...editForm, expected_return_date: e.target.value })}
                    />
                  ) : (
                    row.expected_return_date || '-'
                  )}
                </td>
                <td>
                  {editingId === row.id ? (
                    <input
                      type="number"
                      min="1"
                      disabled={row.status !== 'borrowed'}
                      value={editForm.quantity_borrowed}
                      onChange={(e) => setEditForm({ ...editForm, quantity_borrowed: e.target.value })}
                    />
                  ) : (
                    row.quantity_borrowed
                  )}
                </td>
                <td>{row.status}</td>
                <td>
                  {editingId === row.id ? (
                    <>
                      <button
                        className="btn-chip"
                        onClick={() => saveEdit(row)}
                        type="button"
                        disabled={busyId === row.id}
                      >
                        Save
                      </button>
                      <button
                        className="btn-chip"
                        onClick={() => setEditingId(null)}
                        type="button"
                        disabled={busyId === row.id}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      {row.status === 'borrowed' && (
                        <button
                          className="btn-chip"
                          onClick={() => returnItem(row.id)}
                          type="button"
                          disabled={busyId === row.id}
                        >
                          Return
                        </button>
                      )}
                      <button
                        className="btn-chip"
                        onClick={() => startEdit(row)}
                        type="button"
                        disabled={busyId === row.id}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-chip"
                        onClick={() => deleteBorrowing(row.id)}
                        type="button"
                        disabled={busyId === row.id}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

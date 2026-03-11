import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function BorrowingsPage() {
  const [rows, setRows] = useState([]);
  const [items, setItems] = useState([]);
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
  };

  const returnItem = async (id) => {
    await api.post(`/borrowings/${id}/return`);
    await load();
  };

  return (
    <section>
      <h2>Borrowings</h2>
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
              <th>Qty</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.item?.name}</td>
                <td>{row.borrower_name}</td>
                <td>{row.borrower_contact}</td>
                <td>{row.quantity_borrowed}</td>
                <td>{row.status}</td>
                <td>
                  {row.status === 'borrowed' && (
                    <button className="btn-chip" onClick={() => returnItem(row.id)} type="button">
                      Return
                    </button>
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

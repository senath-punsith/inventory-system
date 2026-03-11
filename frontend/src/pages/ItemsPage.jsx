import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function ItemsPage() {
  const [rows, setRows] = useState([]);
  const [places, setPlaces] = useState([]);
  const [error, setError] = useState('');
  const [busyItemId, setBusyItemId] = useState(null);
  const [form, setForm] = useState({
    place_id: '',
    name: '',
    code: '',
    quantity: 0,
    status: 'in_store',
    serial_number: '',
    description: '',
    image: null,
  });

  const getImageSrc = (row) => {
    if (row.image_url) {
      if (row.image_url.startsWith('http://') || row.image_url.startsWith('https://')) {
        return row.image_url;
      }

      const apiOrigin = new URL(api.defaults.baseURL).origin;
      return `${apiOrigin}${row.image_url}`;
    }

    if (row.image_path) {
      const apiOrigin = new URL(api.defaults.baseURL).origin;
      return `${apiOrigin}/storage/${row.image_path}`;
    }

    return null;
  };

  const load = async () => {
    const [itemsResponse, placesResponse] = await Promise.all([api.get('/items'), api.get('/places')]);
    setRows(itemsResponse.data.data || []);
    setPlaces(placesResponse.data.data || []);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const payload = new FormData();
      payload.append('place_id', form.place_id);
      payload.append('name', form.name);
      payload.append('code', form.code);
      payload.append('quantity', String(Number(form.quantity)));
      payload.append('status', form.status);

      if (form.serial_number) payload.append('serial_number', form.serial_number);
      if (form.description) payload.append('description', form.description);
      if (form.image) payload.append('image', form.image);

      await api.post('/items', payload);
      setForm({
        place_id: '',
        name: '',
        code: '',
        quantity: 0,
        status: 'in_store',
        serial_number: '',
        description: '',
        image: null,
      });
      if (event.target && typeof event.target.reset === 'function') {
        event.target.reset();
      }
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to create item.');
    }
  };

  const adjustQuantity = async (id, operation) => {
    setError('');
    setBusyItemId(id);
    try {
      await api.post(`/items/${id}/quantity`, { operation, amount: 1 });
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to adjust quantity.');
    } finally {
      setBusyItemId(null);
    }
  };

  return (
    <section>
      <h2>Items</h2>
      {error && <div className="error-box">{error}</div>}
      <form className="inline-form" onSubmit={submit}>
        <select
          required
          value={form.place_id}
          onChange={(e) => setForm({ ...form, place_id: e.target.value })}
        >
          <option value="">Select Place</option>
          {places.map((place) => (
            <option key={place.id} value={place.id}>
              {place.name}
            </option>
          ))}
        </select>
        <input placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
        />
        <input
          type="number"
          min="0"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="in_store">In-Store</option>
          <option value="borrowed">Borrowed</option>
          <option value="damaged">Damaged</option>
          <option value="missing">Missing</option>
        </select>
        <button className="btn-primary" type="submit">
          Add
        </button>
      </form>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Code</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Place</th>
              <th>Adjust</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  {getImageSrc(row) ? (
                    <img
                      src={getImageSrc(row)}
                      alt={row.name}
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ) : (
                    'No image'
                  )}
                </td>
                <td>{row.name}</td>
                <td>{row.code}</td>
                <td>{row.quantity}</td>
                <td>{row.status}</td>
                <td>{row.place?.name}</td>
                <td>
                  <button
                    className="btn-chip"
                    onClick={() => adjustQuantity(row.id, 'increment')}
                    type="button"
                    disabled={busyItemId === row.id}
                  >
                    +
                  </button>
                  <button
                    className="btn-chip"
                    onClick={() => adjustQuantity(row.id, 'decrement')}
                    type="button"
                    disabled={busyItemId === row.id || Number(row.quantity) <= 0}
                  >
                    -
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

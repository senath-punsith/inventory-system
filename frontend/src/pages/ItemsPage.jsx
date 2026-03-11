import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function ItemsPage() {
  const [rows, setRows] = useState([]);
  const [places, setPlaces] = useState([]);
  const [error, setError] = useState('');
  const [busyItemId, setBusyItemId] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
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

  const resetForm = () => {
    setEditingItemId(null);
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
    setFileInputKey((v) => v + 1);
  };

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

      if (editingItemId) {
        payload.append('_method', 'PUT');
        await api.post(`/items/${editingItemId}`, payload);
      } else {
        await api.post('/items', payload);
      }

      resetForm();
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to save item.');
    }
  };

  const startEdit = (row) => {
    setError('');
    setEditingItemId(row.id);
    setForm({
      place_id: String(row.place_id || ''),
      name: row.name || '',
      code: row.code || '',
      quantity: Number(row.quantity || 0),
      status: row.status || 'in_store',
      serial_number: row.serial_number || '',
      description: row.description || '',
      image: null,
    });
    setFileInputKey((v) => v + 1);
  };

  const deleteItem = async (id, name) => {
    const ok = window.confirm(`Delete item \"${name}\"? This cannot be undone.`);
    if (!ok) {
      return;
    }

    setError('');
    setBusyItemId(id);
    try {
      await api.delete(`/items/${id}`);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to delete item.');
    } finally {
      setBusyItemId(null);
    }
  };

  const selectAllQuantity = (event) => {
    // Improves data entry speed by selecting full value on focus/click.
    event.target.select();
  };

  const showEditLabels = Boolean(editingItemId);

  const renderLabel = (text) =>
    showEditLabels ? <label className="field-label">{text}</label> : null;

  return (
    <section>
      <h2>Items</h2>
      {error && <div className="error-box">{error}</div>}
      <form className="inline-form" onSubmit={submit}>
        <div className="form-field">
          {renderLabel('Place')}
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
        </div>
        <div className="form-field">
          {renderLabel('Name')}
          <input placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-field">
          {renderLabel('Code')}
          <input placeholder="Code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        </div>
        <div className="form-field">
          {renderLabel('Image')}
          <input
            key={fileInputKey}
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
          />
        </div>
        <div className="form-field">
          {renderLabel('Quantity')}
          <input
            type="number"
            min="0"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            onFocus={selectAllQuantity}
            onClick={selectAllQuantity}
          />
        </div>
        <div className="form-field">
          {renderLabel('Serial Number')}
          <input
            placeholder="Serial Number"
            value={form.serial_number}
            onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
          />
        </div>
        <div className="form-field">
          {renderLabel('Description')}
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="form-field">
          {renderLabel('Status')}
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="in_store">In-Store</option>
            <option value="borrowed">Borrowed</option>
            <option value="damaged">Damaged</option>
            <option value="missing">Missing</option>
          </select>
        </div>
        <div className="form-field form-field-action">
          {renderLabel('Save')}
          <button className="btn-primary" type="submit">
            {editingItemId ? 'Update' : 'Add'}
          </button>
        </div>
        {editingItemId && (
          <div className="form-field form-field-action">
            {renderLabel('Cancel Edit')}
            <button className="btn-chip" type="button" onClick={resetForm}>
              Cancel
            </button>
          </div>
        )}
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
              <th>Actions</th>
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
                    onClick={() => startEdit(row)}
                    type="button"
                    disabled={busyItemId === row.id}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-chip"
                    onClick={() => deleteItem(row.id, row.name)}
                    type="button"
                    disabled={busyItemId === row.id}
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

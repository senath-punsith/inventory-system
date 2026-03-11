import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function ActivityPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [expandedCells, setExpandedCells] = useState({});

  const parseValue = (value) => {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }

    return value;
  };

  const isPlainObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

  const normalizeForCompare = (value) => {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  };

  const toDisplayValue = (value) => {
    if (value === null || value === undefined) {
      return '-';
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  };

  const getSideDiffObject = (row, field) => {
    const left = parseValue(row.old_values);
    const right = parseValue(row.new_values);

    if (!isPlainObject(left) || !isPlainObject(right)) {
      return field === 'old_values' ? left : right;
    }

    const changed = {};
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);

    keys.forEach((key) => {
      if (normalizeForCompare(left[key]) !== normalizeForCompare(right[key])) {
        changed[key] = field === 'old_values' ? left[key] : right[key];
      }
    });

    return changed;
  };

  const toLines = (value) => {
    if (value === null || value === undefined) {
      return ['-'];
    }

    if (isPlainObject(value)) {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        return ['-'];
      }

      return entries.map(([key, val]) => `${key}: ${toDisplayValue(val)}`);
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return ['-'];
      }

      return value.map((entry) => toDisplayValue(entry));
    }

    return [toDisplayValue(value)];
  };

  const toggleExpanded = (key) => {
    setExpandedCells((current) => ({ ...current, [key]: !current[key] }));
  };

  const renderLogCell = (row, field) => {
    const key = `${row.id}-${field}`;
    const isExpanded = !!expandedCells[key];
    const lines = toLines(getSideDiffObject(row, field));
    const maxLines = 8;
    const shouldTruncate = lines.length > maxLines;
    const displayLines = shouldTruncate && !isExpanded ? lines.slice(0, maxLines) : lines;

    return (
      <div className="log-value">
        <div className="log-lines">
          {displayLines.map((line, index) => (
            <div key={`${key}-${index}`}>{line}</div>
          ))}
        </div>
        {shouldTruncate && (
          <button
            type="button"
            className="btn-outline log-toggle"
            onClick={() => toggleExpanded(key)}
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    );
  };

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
                <td>{renderLogCell(row, 'old_values')}</td>
                <td>{renderLogCell(row, 'new_values')}</td>
                <td>{new Date(row.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

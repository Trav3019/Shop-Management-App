import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Minus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { Part } from '../types';

const PART_CATEGORIES = [
  'Filters', 'Belts/Chains', 'Bearings', 'Hydraulics', 'Electrical',
  'Tires/Tracks', 'Engine', 'Fluids/Lubricants', 'Hardware', 'Other',
];

const EMPTY_FORM: Omit<Part, 'id'> = {
  partNumber: '', description: '', category: 'Filters',
  quantity: 0, minQuantity: 1, unit: 'ea',
  vendor: '', cost: undefined, location: '', notes: '',
};

export function PartsPage() {
  const { parts, addPart, updatePart, deletePart, adjustPartQty } = useApp();
  const [filterCategory, setFilterCategory] = useState<'all' | string>('all');
  const [filterStock, setFilterStock] = useState<'all' | 'low' | 'out'>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const lowStock = parts.filter(p => p.quantity > 0 && p.quantity <= p.minQuantity);
  const outOfStock = parts.filter(p => p.quantity === 0);

  const filtered = parts.filter(p => {
    if (filterCategory !== 'all' && p.category !== filterCategory) return false;
    if (filterStock === 'low' && !(p.quantity > 0 && p.quantity <= p.minQuantity)) return false;
    if (filterStock === 'out' && p.quantity !== 0) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.partNumber.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.vendor ?? '').toLowerCase().includes(q) ||
        (p.location ?? '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  function openCreate() {
    setEditingPart(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(p: Part) {
    setEditingPart(p);
    setForm({ ...p });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.partNumber.trim() || !form.description.trim()) return;
    if (editingPart) {
      updatePart({ ...editingPart, ...form });
    } else {
      addPart(form);
    }
    setShowModal(false);
  }

  function stockClass(p: Part) {
    if (p.quantity === 0) return 'bg-red-50 border-red-200';
    if (p.quantity <= p.minQuantity) return 'bg-yellow-50 border-yellow-200';
    return 'bg-white border-gray-200';
  }

  function qtyClass(p: Part) {
    if (p.quantity === 0) return 'text-red-700 font-bold';
    if (p.quantity <= p.minQuantity) return 'text-yellow-700 font-semibold';
    return 'text-gray-900 font-medium';
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parts Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">{parts.length} parts tracked</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Add Part
        </button>
      </div>

      {/* Alert banners */}
      {outOfStock.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Out of Stock ({outOfStock.length})</p>
            <p className="text-xs text-red-600 mt-0.5">{outOfStock.map(p => p.description).join(' · ')}</p>
          </div>
        </div>
      )}
      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
          <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">Low Stock ({lowStock.length})</p>
            <p className="text-xs text-yellow-600 mt-0.5">{lowStock.map(p => p.description).join(' · ')}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by part number, description, vendor..." className="input pl-9" />
        </div>
        <select className="select w-auto" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {PART_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="select w-auto" value={filterStock} onChange={e => setFilterStock(e.target.value as 'all' | 'low' | 'out')}>
          <option value="all">All Stock Levels</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {/* Parts table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Part #</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Category</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Qty</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Min</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">Vendor</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Cost</th>
                <th className="px-4 py-3 w-28"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-400 text-sm">No parts match your filter.</td>
                </tr>
              ) : filtered.map(p => (
                <tr key={p.id} className={`border ${stockClass(p)}`}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">{p.partNumber}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{p.description}</p>
                    {p.notes && <p className="text-xs text-gray-400 mt-0.5">{p.notes}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">{p.category}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => adjustPartQty(p.id, -1)} className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-30" disabled={p.quantity === 0}>
                        <Minus size={12} />
                      </button>
                      <span className={`w-8 text-center text-sm ${qtyClass(p)}`}>{p.quantity}</span>
                      <button onClick={() => adjustPartQty(p.id, 1)} className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs hidden md:table-cell">{p.minQuantity} {p.unit}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">{p.location ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden xl:table-cell">{p.vendor ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-500 text-xs hidden lg:table-cell">
                    {p.cost != null ? `$${p.cost.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => deletePart(p.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit modal */}
      {showModal && (
        <Modal title={editingPart ? 'Edit Part' : 'Add Part'} onClose={() => setShowModal(false)} size="lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Part Number *</label>
              <input className="input font-mono" value={form.partNumber} onChange={e => setForm(f => ({ ...f, partNumber: e.target.value }))} placeholder="e.g. RE509672" />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {PART_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description *</label>
              <input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. JD Engine Oil Filter (8R/7R)" />
            </div>
            <div>
              <label className="label">Quantity on Hand</label>
              <input type="number" min="0" className="input" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="label">Minimum Quantity</label>
              <input type="number" min="0" className="input" value={form.minQuantity} onChange={e => setForm(f => ({ ...f, minQuantity: parseInt(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="label">Unit</label>
              <input className="input" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="ea, gal, ft, kit..." />
            </div>
            <div>
              <label className="label">Unit Cost ($)</label>
              <input type="number" min="0" step="0.01" className="input" value={form.cost ?? ''} onChange={e => setForm(f => ({ ...f, cost: e.target.value ? parseFloat(e.target.value) : undefined }))} placeholder="0.00" />
            </div>
            <div>
              <label className="label">Storage Location</label>
              <input className="input" value={form.location ?? ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Bin A1, Shelf B2" />
            </div>
            <div>
              <label className="label">Vendor / Supplier</label>
              <input className="input" value={form.vendor ?? ''} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} placeholder="e.g. John Deere Dealer" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Notes</label>
              <textarea className="textarea" rows={2} value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={!form.partNumber.trim() || !form.description.trim()}>
              {editingPart ? 'Save Changes' : 'Add Part'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

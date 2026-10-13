import { useState, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Minus, ScanLine, Keyboard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { BarcodeScanner } from '../components/BarcodeScanner';
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

type ScanStep =
  | { stage: 'scanning' }
  | { stage: 'found'; part: Part; addQty: number }
  | { stage: 'notfound'; partNumber: string }
  | { stage: 'manual' };

export function PartsPage() {
  const { parts, addPart, updatePart, deletePart, adjustPartQty } = useApp();
  const [filterCategory, setFilterCategory] = useState<'all' | string>('all');
  const [filterStock, setFilterStock] = useState<'all' | 'low' | 'out'>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // Scan modal state
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanStep, setScanStep] = useState<ScanStep>({ stage: 'scanning' });
  const [scanTab, setScanTab] = useState<'camera' | 'manual'>('camera');
  const [manualInput, setManualInput] = useState('');
  const [scanConfirmed, setScanConfirmed] = useState(false);

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

  function openCreate(prefillPartNumber?: string) {
    setEditingPart(null);
    setForm(prefillPartNumber ? { ...EMPTY_FORM, partNumber: prefillPartNumber } : EMPTY_FORM);
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

  // ── Scan helpers ────────────────────────────────────────────────
  function openScanModal() {
    setScanStep({ stage: 'scanning' });
    setScanTab('camera');
    setManualInput('');
    setScanConfirmed(false);
    setShowScanModal(true);
  }

  function closeScanModal() {
    setShowScanModal(false);
  }

  const handleScanResult = useCallback((raw: string) => {
    const matched = parts.find(
      p => p.partNumber.trim().toLowerCase() === raw.trim().toLowerCase()
    );
    if (matched) {
      setScanStep({ stage: 'found', part: matched, addQty: 1 });
    } else {
      setScanStep({ stage: 'notfound', partNumber: raw.trim() });
    }
  }, [parts]);

  function handleManualLookup() {
    const raw = manualInput.trim();
    if (!raw) return;
    handleScanResult(raw);
  }

  function confirmAdd(partId: string, qty: number) {
    adjustPartQty(partId, qty);
    setScanConfirmed(true);
  }

  function scanAgain() {
    setScanStep({ stage: 'scanning' });
    setScanTab('camera');
    setManualInput('');
    setScanConfirmed(false);
  }

  function handleCreateFromScan(partNumber: string) {
    closeScanModal();
    openCreate(partNumber);
  }

  // ── Scan modal content ──────────────────────────────────────────
  function renderScanContent() {
    if (scanConfirmed && scanStep.stage === 'found') {
      const { part, addQty } = scanStep;
      return (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Quantity Updated!</p>
            <p className="text-sm text-gray-500 mt-1">
              Added <span className="font-bold text-[#367C2B]">+{addQty}</span> to <span className="font-medium">{part.description}</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              New quantity: <span className="font-semibold text-gray-700">{part.quantity + addQty} {part.unit}</span>
            </p>
          </div>
          <div className="flex gap-3 mt-2">
            <button className="btn-secondary" onClick={scanAgain}>Scan Another</button>
            <button className="btn-primary" onClick={closeScanModal}>Done</button>
          </div>
        </div>
      );
    }

    if (scanStep.stage === 'found') {
      const { part, addQty } = scanStep;
      return (
        <div className="flex flex-col gap-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Part Found</p>
            <p className="font-semibold text-gray-900">{part.description}</p>
            <p className="text-xs font-mono text-gray-500 mt-0.5">{part.partNumber}</p>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span>Current qty: <strong>{part.quantity} {part.unit}</strong></span>
              {part.location && <span>Location: <strong>{part.location}</strong></span>}
            </div>
          </div>
          <div>
            <label className="label">Quantity to Add</label>
            <div className="flex items-center gap-3 mt-1">
              <button
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-semibold"
                onClick={() => setScanStep(s => s.stage === 'found' ? { ...s, addQty: Math.max(1, s.addQty - 1) } : s)}
              >−</button>
              <input
                type="number"
                min="1"
                className="input w-20 text-center text-lg font-semibold"
                value={addQty}
                onChange={e => setScanStep(s => s.stage === 'found' ? { ...s, addQty: Math.max(1, parseInt(e.target.value) || 1) } : s)}
              />
              <button
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-semibold"
                onClick={() => setScanStep(s => s.stage === 'found' ? { ...s, addQty: s.addQty + 1 } : s)}
              >+</button>
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button className="btn-secondary flex-1" onClick={scanAgain}>Scan Again</button>
            <button className="btn-primary flex-1" onClick={() => confirmAdd(part.id, addQty)}>
              Add +{addQty}
            </button>
          </div>
        </div>
      );
    }

    if (scanStep.stage === 'notfound') {
      const { partNumber } = scanStep;
      return (
        <div className="flex flex-col gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-1">Part Not Found</p>
            <p className="font-mono text-sm text-gray-800">{partNumber}</p>
            <p className="text-xs text-gray-500 mt-1">This part number isn't in your inventory yet.</p>
          </div>
          <div className="flex flex-col gap-2">
            <button className="btn-primary" onClick={() => handleCreateFromScan(partNumber)}>
              <Plus size={15} /> Add to Inventory
            </button>
            <button className="btn-secondary" onClick={scanAgain}>Scan Again</button>
          </div>
        </div>
      );
    }

    // stage === 'scanning' — show tabs
    return (
      <div className="flex flex-col gap-4">
        {/* Tabs */}
        <div className="flex rounded-lg bg-gray-100 p-1 gap-1">
          <button
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-colors ${scanTab === 'camera' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setScanTab('camera')}
          >
            <ScanLine size={14} /> Camera Scan
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-colors ${scanTab === 'manual' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setScanTab('manual')}
          >
            <Keyboard size={14} /> Manual Entry
          </button>
        </div>

        {scanTab === 'camera' ? (
          <BarcodeScanner onScan={handleScanResult} />
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <label className="label">Enter Part Number</label>
              <input
                className="input font-mono"
                placeholder="e.g. RE509672"
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleManualLookup()}
                autoFocus
              />
            </div>
            <button className="btn-primary" onClick={handleManualLookup} disabled={!manualInput.trim()}>
              Look Up Part
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parts Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">{parts.length} parts tracked</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openScanModal} className="btn-secondary flex items-center gap-1.5">
            <ScanLine size={16} /> Scan Part
          </button>
          <button onClick={() => openCreate()} className="btn-primary">
            <Plus size={16} /> Add Part
          </button>
        </div>
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

      {/* Scan modal */}
      {showScanModal && (
        <Modal title="Scan Part" onClose={closeScanModal} size="sm">
          {renderScanContent()}
        </Modal>
      )}
    </div>
  );
}

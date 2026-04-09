import { useState } from 'react';
import { Plus, Trash2, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { MaintenanceRecord } from '../types';

const EMPTY_FORM: Omit<MaintenanceRecord, 'id'> = {
  date: new Date().toISOString().split('T')[0],
  equipmentId: '',
  workOrderId: undefined,
  workPerformed: '',
  hoursSpent: undefined,
  technician: '',
  partsUsed: '',
  notes: '',
};

export function MaintenanceLogPage() {
  const { maintenanceRecords, addMaintenanceRecord, deleteMaintenanceRecord, equipment } = useApp();
  const [filterEquipment, setFilterEquipment] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const getEquipmentName = (id: string) => equipment.find(e => e.id === id)?.name ?? 'Unknown';

  const sorted = [...maintenanceRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = sorted.filter(r => {
    if (filterEquipment !== 'all' && r.equipmentId !== filterEquipment) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.workPerformed.toLowerCase().includes(q) ||
        getEquipmentName(r.equipmentId).toLowerCase().includes(q) ||
        (r.technician ?? '').toLowerCase().includes(q) ||
        (r.partsUsed ?? '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Group by month
  const grouped: Record<string, MaintenanceRecord[]> = {};
  filtered.forEach(r => {
    const key = format(new Date(r.date), 'MMMM yyyy');
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  function handleSave() {
    if (!form.workPerformed.trim()) return;
    addMaintenanceRecord(form);
    setShowModal(false);
    setForm(EMPTY_FORM);
  }

  // Equipment that appear in records
  const usedEquipment = equipment.filter(eq => maintenanceRecords.some(r => r.equipmentId === eq.id));

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Log</h1>
          <p className="text-sm text-gray-500 mt-0.5">{maintenanceRecords.length} records total</p>
        </div>
        <button onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }} className="btn-primary">
          <Plus size={16} /> Log Maintenance
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records..." className="input pl-9" />
        </div>
        <select className="select w-auto" value={filterEquipment} onChange={e => setFilterEquipment(e.target.value)}>
          <option value="all">All Equipment</option>
          {usedEquipment.map(eq => (
            <option key={eq.id} value={eq.id}>{eq.name}</option>
          ))}
        </select>
      </div>

      {/* Records grouped by month */}
      {Object.keys(grouped).length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <Filter size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No maintenance records found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, records]) => (
            <div key={month}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>{month}</span>
                <span className="bg-gray-200 text-gray-600 rounded-full px-2 py-0.5 text-xs">{records.length}</span>
              </h2>
              <div className="space-y-2">
                {records.map(r => (
                  <div key={r.id} className="card p-4">
                    <div className="flex items-start gap-4">
                      {/* Date column */}
                      <div className="text-center w-12 flex-shrink-0">
                        <p className="text-lg font-bold text-gray-900 leading-none">{format(new Date(r.date), 'd')}</p>
                        <p className="text-xs text-gray-400">{format(new Date(r.date), 'MMM')}</p>
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{r.workPerformed}</p>
                            {r.equipmentId && (
                              <p className="text-xs text-jd-green font-medium mt-0.5">{getEquipmentName(r.equipmentId)}</p>
                            )}
                          </div>
                          <button onClick={() => deleteMaintenanceRecord(r.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors flex-shrink-0">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                          {r.technician && <span>Technician: <span className="font-medium text-gray-700">{r.technician}</span></span>}
                          {r.hoursSpent != null && <span>Time: <span className="font-medium text-gray-700">{r.hoursSpent}h</span></span>}
                        </div>
                        {r.partsUsed && (
                          <p className="text-xs text-gray-500 mt-1.5 bg-gray-50 rounded px-2 py-1">
                            <span className="font-medium text-gray-700">Parts used: </span>{r.partsUsed}
                          </p>
                        )}
                        {r.notes && (
                          <p className="text-xs text-gray-500 mt-1 italic">{r.notes}</p>
                        )}
                        {r.workOrderId && (
                          <span className="inline-block mt-1.5 text-xs bg-blue-50 text-blue-600 rounded px-2 py-0.5">From work order</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log maintenance modal */}
      {showModal && (
        <Modal title="Log Maintenance" onClose={() => setShowModal(false)} size="lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Date *</label>
              <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="label">Equipment</label>
              <select className="select" value={form.equipmentId} onChange={e => setForm(f => ({ ...f, equipmentId: e.target.value }))}>
                <option value="">— General / No Equipment —</option>
                {equipment.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Work Performed *</label>
              <textarea className="textarea" rows={3} value={form.workPerformed} onChange={e => setForm(f => ({ ...f, workPerformed: e.target.value }))} placeholder="Describe the maintenance work performed..." />
            </div>
            <div>
              <label className="label">Technician</label>
              <input className="input" value={form.technician ?? ''} onChange={e => setForm(f => ({ ...f, technician: e.target.value }))} placeholder="Who did the work?" />
            </div>
            <div>
              <label className="label">Hours Spent</label>
              <input type="number" min="0" step="0.5" className="input" value={form.hoursSpent ?? ''} onChange={e => setForm(f => ({ ...f, hoursSpent: e.target.value ? parseFloat(e.target.value) : undefined }))} placeholder="e.g. 3.5" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Parts Used</label>
              <input className="input" value={form.partsUsed ?? ''} onChange={e => setForm(f => ({ ...f, partsUsed: e.target.value }))} placeholder="e.g. RE509672 oil filter x1, TY6355 oil 3gal" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Notes</label>
              <textarea className="textarea" rows={2} value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={!form.workPerformed.trim()}>
              Save Record
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

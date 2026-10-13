import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { EquipmentStatusBadge, WorkOrderStatusBadge, PriorityBadge } from '../components/Badge';
import { Equipment, EquipmentCategory, EquipmentStatus } from '../types';

const CATEGORIES: EquipmentCategory[] = [
  'Tractor', 'Combine', 'Planter', 'Sprayer', 'Tillage',
  'Harvest Head', 'Semi', 'Trailer', 'Skidsteer/Loader',
  'Auger/Conveyor', 'Potato Equipment', 'Other',
];

const EMPTY_FORM: Omit<Equipment, 'id' | 'createdAt'> = {
  name: '', category: 'Tractor', make: '', model: '', year: undefined,
  serialNumber: '', status: 'operational', hoursOrMiles: undefined,
  hoursOrMilesLabel: 'Hours', lastServiceDate: '', nextServiceDue: '', notes: '',
};

export function EquipmentPage() {
  const navigate = useNavigate();
  const { equipment, addEquipment, updateEquipment, deleteEquipment, workOrders } = useApp();
  const [filterCategory, setFilterCategory] = useState<'all' | EquipmentCategory>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | EquipmentStatus>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEq, setEditingEq] = useState<Equipment | null>(null);
  const [viewEq, setViewEq] = useState<Equipment | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = equipment.filter(e => {
    if (filterCategory !== 'all' && e.category !== filterCategory) return false;
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        e.make.toLowerCase().includes(q) ||
        e.model.toLowerCase().includes(q) ||
        (e.serialNumber ?? '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  function openCreate() {
    setEditingEq(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(eq: Equipment) {
    setEditingEq(eq);
    setForm({ ...eq });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.name.trim() || !form.make.trim() || !form.model.trim()) return;
    if (editingEq) {
      updateEquipment({ ...editingEq, ...form });
    } else {
      addEquipment(form);
    }
    setShowModal(false);
  }

  const getWorkOrders = (id: string) => workOrders.filter(w => w.equipmentId === id);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipment</h1>
          <p className="text-sm text-gray-500 mt-0.5">{equipment.length} pieces in fleet</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Add Equipment
        </button>
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterCategory === 'all' ? 'bg-jd-green text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          All ({equipment.length})
        </button>
        {CATEGORIES.filter(c => equipment.some(e => e.category === c)).map(c => (
          <button
            key={c}
            onClick={() => setFilterCategory(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterCategory === c ? 'bg-jd-green text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {c} ({equipment.filter(e => e.category === c).length})
          </button>
        ))}
      </div>

      {/* Status filter + search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search equipment..." className="input pl-9" />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as 'all' | EquipmentStatus)}
          className="select w-auto"
        >
          <option value="all">All Statuses</option>
          <option value="operational">Operational</option>
          <option value="needs_service">Needs Service</option>
          <option value="in_service">In Service</option>
          <option value="down">Down</option>
        </select>
      </div>

      {/* Equipment grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(eq => (
          <div key={eq.id} className="card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 mr-2">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{eq.name}</h3>
                <p className="text-xs text-gray-500">{eq.make} {eq.model}{eq.year ? ` · ${eq.year}` : ''}</p>
              </div>
              <EquipmentStatusBadge status={eq.status} />
            </div>

            <div className="space-y-1 text-xs text-gray-600 mb-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Category</span>
                <span>{eq.category}</span>
              </div>
              {eq.hoursOrMiles !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-400">{eq.hoursOrMilesLabel ?? 'Hours'}</span>
                  <span className="font-medium">{eq.hoursOrMiles.toLocaleString()}</span>
                </div>
              )}
              {eq.serialNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-400">S/N</span>
                  <span className="font-mono text-xs">{eq.serialNumber}</span>
                </div>
              )}
              {eq.lastServiceDate && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Service</span>
                  <span>{format(new Date(eq.lastServiceDate), 'MMM d, yyyy')}</span>
                </div>
              )}
              {eq.nextServiceDue && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Next Due</span>
                  <span className={new Date(eq.nextServiceDue) < new Date() ? 'text-red-600 font-medium' : ''}>
                    {format(new Date(eq.nextServiceDue), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
            </div>

            {eq.notes && <p className="text-xs text-gray-500 italic mb-3 line-clamp-2">{eq.notes}</p>}

            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => navigate(`/equipment/${eq.id}`)}
                className="flex-1 text-xs text-jd-green font-medium hover:underline flex items-center justify-center gap-1"
              >
                View Details →
              </button>
              <button onClick={() => openEdit(eq)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                <Edit2 size={15} />
              </button>
              <button onClick={() => deleteEquipment(eq.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-12 text-center text-gray-400">
          <p className="text-sm">No equipment matches your filter.</p>
        </div>
      )}

      {/* Create / Edit modal */}
      {showModal && (
        <Modal title={editingEq ? 'Edit Equipment' : 'Add Equipment'} onClose={() => setShowModal(false)} size="xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Name *</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. JD 8R 410" />
            </div>
            <div>
              <label className="label">Make *</label>
              <input className="input" value={form.make} onChange={e => setForm(f => ({ ...f, make: e.target.value }))} placeholder="e.g. John Deere" />
            </div>
            <div>
              <label className="label">Model *</label>
              <input className="input" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="e.g. 8R 410" />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as EquipmentCategory }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as EquipmentStatus }))}>
                <option value="operational">Operational</option>
                <option value="needs_service">Needs Service</option>
                <option value="in_service">In Service</option>
                <option value="down">Down</option>
              </select>
            </div>
            <div>
              <label className="label">Year</label>
              <input type="number" className="input" value={form.year ?? ''} onChange={e => setForm(f => ({ ...f, year: e.target.value ? parseInt(e.target.value) : undefined }))} placeholder="e.g. 2022" />
            </div>
            <div>
              <label className="label">Serial Number</label>
              <input className="input" value={form.serialNumber ?? ''} onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))} placeholder="Serial / VIN" />
            </div>
            <div>
              <label className="label">Hours / Miles</label>
              <input type="number" min="0" className="input" value={form.hoursOrMiles ?? ''} onChange={e => setForm(f => ({ ...f, hoursOrMiles: e.target.value ? parseFloat(e.target.value) : undefined }))} />
            </div>
            <div>
              <label className="label">Hours or Miles?</label>
              <select className="select" value={form.hoursOrMilesLabel ?? 'Hours'} onChange={e => setForm(f => ({ ...f, hoursOrMilesLabel: e.target.value as 'Hours' | 'Miles' }))}>
                <option value="Hours">Hours</option>
                <option value="Miles">Miles</option>
              </select>
            </div>
            <div>
              <label className="label">Last Service Date</label>
              <input type="date" className="input" value={form.lastServiceDate ?? ''} onChange={e => setForm(f => ({ ...f, lastServiceDate: e.target.value }))} />
            </div>
            <div>
              <label className="label">Next Service Due</label>
              <input type="date" className="input" value={form.nextServiceDue ?? ''} onChange={e => setForm(f => ({ ...f, nextServiceDue: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Notes</label>
              <textarea className="textarea" rows={2} value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={!form.name.trim() || !form.make.trim() || !form.model.trim()}>
              {editingEq ? 'Save Changes' : 'Add Equipment'}
            </button>
          </div>
        </Modal>
      )}

      {/* Work orders for equipment modal */}
      {viewEq && (
        <Modal title={`Work Orders — ${viewEq.name}`} onClose={() => setViewEq(null)} size="xl">
          {getWorkOrders(viewEq.id).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No work orders for this equipment.</p>
          ) : (
            <div className="space-y-2">
              {getWorkOrders(viewEq.id).map(wo => (
                <div key={wo.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{wo.title}</p>
                    {wo.description && <p className="text-xs text-gray-500 mt-0.5">{wo.description}</p>}
                    <div className="flex gap-2 mt-1 flex-wrap text-xs text-gray-400">
                      {wo.assignedTo && <span>Assigned: {wo.assignedTo}</span>}
                      {wo.completedDate && <span>Completed: {format(new Date(wo.completedDate), 'MMM d, yyyy')}</span>}
                      {wo.dueDate && !wo.completedDate && <span>Due: {format(new Date(wo.dueDate), 'MMM d, yyyy')}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <PriorityBadge priority={wo.priority} />
                    <WorkOrderStatusBadge status={wo.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

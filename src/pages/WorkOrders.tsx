import { useState } from 'react';
import { Plus, Search, CheckCircle, Trash2, Edit2, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { PriorityBadge, WorkOrderStatusBadge } from '../components/Badge';
import { WorkOrder, WorkOrderPriority, WorkOrderStatus } from '../types';

type FilterStatus = 'all' | WorkOrderStatus;

const EMPTY_FORM: Omit<WorkOrder, 'id' | 'createdDate'> = {
  title: '',
  description: '',
  equipmentId: '',
  priority: 'medium',
  status: 'pending',
  assignedTo: '',
  dueDate: '',
  estimatedHours: undefined,
  actualHours: undefined,
  partsNeeded: '',
  notes: '',
};

const priorityOrder: Record<WorkOrderPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export function WorkOrders() {
  const { workOrders, addWorkOrder, updateWorkOrder, deleteWorkOrder, completeWorkOrder, equipment } = useApp();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingWO, setEditingWO] = useState<WorkOrder | null>(null);
  const [completeModal, setCompleteModal] = useState<{ wo: WorkOrder } | null>(null);
  const [actualHoursInput, setActualHoursInput] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  const getEquipmentName = (id?: string) => equipment.find(e => e.id === id)?.name ?? '—';

  const filtered = [...workOrders]
    .filter(wo => {
      if (filterStatus !== 'all' && wo.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          wo.title.toLowerCase().includes(q) ||
          (wo.description ?? '').toLowerCase().includes(q) ||
          getEquipmentName(wo.equipmentId).toLowerCase().includes(q) ||
          (wo.assignedTo ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  function openCreate() {
    setEditingWO(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(wo: WorkOrder) {
    setEditingWO(wo);
    setForm({
      title: wo.title,
      description: wo.description ?? '',
      equipmentId: wo.equipmentId ?? '',
      priority: wo.priority,
      status: wo.status,
      assignedTo: wo.assignedTo ?? '',
      dueDate: wo.dueDate ?? '',
      estimatedHours: wo.estimatedHours,
      actualHours: wo.actualHours,
      partsNeeded: wo.partsNeeded ?? '',
      notes: wo.notes ?? '',
      completedDate: wo.completedDate,
    });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.title.trim()) return;
    if (editingWO) {
      updateWorkOrder({ ...editingWO, ...form, equipmentId: form.equipmentId || undefined });
    } else {
      addWorkOrder({ ...form, equipmentId: form.equipmentId || undefined });
    }
    setShowModal(false);
  }

  function handleComplete(wo: WorkOrder) {
    setCompleteModal({ wo });
    setActualHoursInput(wo.estimatedHours?.toString() ?? '');
  }

  function confirmComplete() {
    if (!completeModal) return;
    completeWorkOrder(completeModal.wo.id, actualHoursInput ? parseFloat(actualHoursInput) : undefined);
    setCompleteModal(null);
  }

  const counts: Record<FilterStatus, number> = {
    all: workOrders.length,
    pending: workOrders.filter(w => w.status === 'pending').length,
    in_progress: workOrders.filter(w => w.status === 'in_progress').length,
    waiting_parts: workOrders.filter(w => w.status === 'waiting_parts').length,
    completed: workOrders.filter(w => w.status === 'completed').length,
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{workOrders.filter(w => w.status !== 'completed').length} active</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> New Work Order
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'in_progress', 'waiting_parts', 'completed'] as FilterStatus[]).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === s
                ? 'bg-jd-green text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s === 'all' ? 'All' : s === 'in_progress' ? 'In Progress' : s === 'waiting_parts' ? 'Waiting Parts' : s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="ml-1.5 text-xs opacity-75">({counts[s]})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search work orders..."
          className="input pl-9"
        />
      </div>

      {/* Work order cards */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <Filter size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No work orders match your filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(wo => (
            <WorkOrderCard
              key={wo.id}
              wo={wo}
              equipmentName={getEquipmentName(wo.equipmentId)}
              onEdit={() => openEdit(wo)}
              onDelete={() => deleteWorkOrder(wo.id)}
              onComplete={() => handleComplete(wo)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      {showModal && (
        <Modal
          title={editingWO ? 'Edit Work Order' : 'New Work Order'}
          onClose={() => setShowModal(false)}
          size="xl"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Title *</label>
              <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. JD 8R 410 – 500hr Service" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea className="textarea" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the work to be done..." />
            </div>
            <div>
              <label className="label">Equipment</label>
              <select className="select" value={form.equipmentId} onChange={e => setForm(f => ({ ...f, equipmentId: e.target.value }))}>
                <option value="">— None / General Shop —</option>
                {equipment.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Assigned To</label>
              <input className="input" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} placeholder="Technician name" />
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as WorkOrderPriority }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as WorkOrderStatus }))}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_parts">Waiting Parts</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="label">Due Date</label>
              <input type="date" className="input" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div>
              <label className="label">Estimated Hours</label>
              <input type="number" min="0" step="0.5" className="input" value={form.estimatedHours ?? ''} onChange={e => setForm(f => ({ ...f, estimatedHours: e.target.value ? parseFloat(e.target.value) : undefined }))} placeholder="e.g. 4" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Parts Needed</label>
              <input className="input" value={form.partsNeeded} onChange={e => setForm(f => ({ ...f, partsNeeded: e.target.value }))} placeholder="e.g. RE509672 oil filter x1, TY6355 oil 3gal" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Notes</label>
              <textarea className="textarea" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes..." />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={!form.title.trim()}>
              {editingWO ? 'Save Changes' : 'Create Work Order'}
            </button>
          </div>
        </Modal>
      )}

      {/* Complete modal */}
      {completeModal && (
        <Modal title="Complete Work Order" onClose={() => setCompleteModal(null)} size="md">
          <p className="text-sm text-gray-600 mb-4">
            Marking <strong>"{completeModal.wo.title}"</strong> as complete. Optionally enter actual hours spent.
          </p>
          <label className="label">Actual Hours Spent</label>
          <input
            type="number" min="0" step="0.5" className="input"
            value={actualHoursInput}
            onChange={e => setActualHoursInput(e.target.value)}
            placeholder={completeModal.wo.estimatedHours ? `Est. ${completeModal.wo.estimatedHours}hrs` : 'Hours spent'}
          />
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button className="btn-secondary" onClick={() => setCompleteModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={confirmComplete}>
              <CheckCircle size={16} /> Mark Complete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function WorkOrderCard({ wo, equipmentName, onEdit, onDelete, onComplete }: {
  wo: WorkOrder;
  equipmentName: string;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
}) {
  const isComplete = wo.status === 'completed';
  const isOverdue = wo.dueDate && !isComplete && new Date(wo.dueDate) < new Date();

  return (
    <div className={`card p-4 ${isComplete ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className={`text-sm font-semibold text-gray-900 ${isComplete ? 'line-through' : ''}`}>{wo.title}</h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              <PriorityBadge priority={wo.priority} />
              <WorkOrderStatusBadge status={wo.status} />
            </div>
          </div>

          {wo.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{wo.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
            {equipmentName !== '—' && <span className="font-medium text-gray-700">{equipmentName}</span>}
            {wo.assignedTo && <span>Assigned: {wo.assignedTo}</span>}
            {wo.dueDate && (
              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                Due: {format(new Date(wo.dueDate), 'MMM d, yyyy')}{isOverdue ? ' (Overdue)' : ''}
              </span>
            )}
            {wo.estimatedHours && <span>Est. {wo.estimatedHours}h</span>}
            {wo.completedDate && <span>Completed: {format(new Date(wo.completedDate), 'MMM d, yyyy')}</span>}
          </div>

          {wo.partsNeeded && (
            <p className="text-xs text-gray-500 mt-1.5 bg-gray-50 rounded px-2 py-1">
              <span className="font-medium text-gray-700">Parts: </span>{wo.partsNeeded}
            </p>
          )}
          {wo.notes && (
            <p className="text-xs text-gray-500 mt-1 italic">{wo.notes}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {!isComplete && (
            <button onClick={onComplete} title="Mark complete" className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors">
              <CheckCircle size={17} />
            </button>
          )}
          <button onClick={onEdit} title="Edit" className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <Edit2 size={16} />
          </button>
          <button onClick={onDelete} title="Delete" className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

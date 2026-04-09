import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, Wrench, AlertTriangle, CheckCircle,
  Package, Plus, ChevronRight, Clock, BookOpen,
} from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import { EquipmentStatusBadge, PriorityBadge, WorkOrderStatusBadge } from '../components/Badge';
import { WorkOrderPriority } from '../types';

export function Dashboard() {
  const { equipment, workOrders, parts } = useApp();
  const navigate = useNavigate();

  const totalEquipment = equipment.length;
  const activeWOs = workOrders.filter(w => w.status !== 'completed').length;
  const waitingParts = workOrders.filter(w => w.status === 'waiting_parts').length;
  const completedThisMonth = (() => {
    const now = new Date();
    return workOrders.filter(w => {
      if (!w.completedDate) return false;
      const d = new Date(w.completedDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  })();

  const attentionEquipment = equipment.filter(e => e.status === 'needs_service' || e.status === 'down');
  const lowStockParts = parts.filter(p => p.quantity <= p.minQuantity);

  const priorityOrder: Record<WorkOrderPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const recentWOs = [...workOrders]
    .filter(w => w.status !== 'completed')
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 6);

  const statusCounts = {
    operational: equipment.filter(e => e.status === 'operational').length,
    needs_service: equipment.filter(e => e.status === 'needs_service').length,
    in_service: equipment.filter(e => e.status === 'in_service').length,
    down: equipment.filter(e => e.status === 'down').length,
  };

  const getEquipmentName = (id?: string) => equipment.find(e => e.id === id)?.name ?? '—';
  const downCount = equipment.filter(e => e.status === 'down').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <button onClick={() => navigate('/work-orders')} className="btn-primary">
          <Plus size={16} />
          New Work Order
        </button>
      </div>

      {/* Alert banners */}
      {lowStockParts.length > 0 && (
        <div
          className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-yellow-100 transition-colors"
          onClick={() => navigate('/parts')}
        >
          <Package size={18} className="text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-800 font-medium">
            {lowStockParts.length} part{lowStockParts.length > 1 ? 's' : ''} at or below minimum stock — review Parts Inventory
          </p>
          <ChevronRight size={16} className="text-yellow-600 ml-auto flex-shrink-0" />
        </div>
      )}
      {downCount > 0 && (
        <div
          className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-red-100 transition-colors"
          onClick={() => navigate('/equipment')}
        >
          <AlertTriangle size={18} className="text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800 font-medium">
            {downCount} piece{downCount > 1 ? 's' : ''} of equipment currently down
          </p>
          <ChevronRight size={16} className="text-red-600 ml-auto flex-shrink-0" />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Equipment" value={totalEquipment} icon={<Wrench size={20} className="text-jd-green" />} bg="bg-green-50" onClick={() => navigate('/equipment')} />
        <StatCard label="Active Work Orders" value={activeWOs} icon={<ClipboardList size={20} className="text-blue-600" />} bg="bg-blue-50" onClick={() => navigate('/work-orders')} />
        <StatCard label="Waiting on Parts" value={waitingParts} icon={<Clock size={20} className="text-yellow-600" />} bg="bg-yellow-50" onClick={() => navigate('/work-orders')} />
        <StatCard label="Completed This Month" value={completedThisMonth} icon={<CheckCircle size={20} className="text-green-600" />} bg="bg-green-50" onClick={() => navigate('/maintenance-log')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active work orders list */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Active Work Orders</h2>
            <button onClick={() => navigate('/work-orders')} className="text-sm text-jd-green font-medium hover:underline flex items-center gap-1">
              View all <ChevronRight size={14} />
            </button>
          </div>
          {recentWOs.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <CheckCircle size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">All caught up — no active work orders.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentWOs.map(wo => (
                <div
                  key={wo.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate('/work-orders')}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{wo.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{getEquipmentName(wo.equipmentId)}{wo.assignedTo ? ` · ${wo.assignedTo}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <PriorityBadge priority={wo.priority} />
                    <WorkOrderStatusBadge status={wo.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fleet status */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Fleet Status</h2>
            <button onClick={() => navigate('/equipment')} className="text-sm text-jd-green font-medium hover:underline flex items-center gap-1">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            <StatusBar label="Operational" count={statusCounts.operational} total={totalEquipment} color="bg-green-500" />
            <StatusBar label="Needs Service" count={statusCounts.needs_service} total={totalEquipment} color="bg-yellow-400" />
            <StatusBar label="In Service" count={statusCounts.in_service} total={totalEquipment} color="bg-blue-500" />
            <StatusBar label="Down" count={statusCounts.down} total={totalEquipment} color="bg-red-500" />
          </div>

          {attentionEquipment.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Needs Attention</p>
              <div className="space-y-2">
                {attentionEquipment.slice(0, 5).map(e => (
                  <div key={e.id} className="flex items-center justify-between gap-2">
                    <p className="text-sm text-gray-700 truncate">{e.name}</p>
                    <EquipmentStatusBadge status={e.status} />
                  </div>
                ))}
                {attentionEquipment.length > 5 && (
                  <p className="text-xs text-gray-400">+{attentionEquipment.length - 5} more</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction icon={<ClipboardList size={20} />} label="New Work Order" onClick={() => navigate('/work-orders')} />
          <QuickAction icon={<Wrench size={20} />} label="Add Equipment" onClick={() => navigate('/equipment')} />
          <QuickAction icon={<Package size={20} />} label="Add Part" onClick={() => navigate('/parts')} />
          <QuickAction icon={<BookOpen size={20} />} label="Log Maintenance" onClick={() => navigate('/maintenance-log')} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, bg, onClick }: {
  label: string; value: number; icon: React.ReactNode; bg: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="card p-5 text-left hover:shadow-md transition-shadow w-full">
      <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </button>
  );
}

function StatusBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span className="font-medium">{count}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-jd-green hover:bg-jd-green-50 text-gray-500 hover:text-jd-green transition-colors"
    >
      {icon}
      <span className="text-xs font-medium text-center">{label}</span>
    </button>
  );
}

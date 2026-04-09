import { EquipmentStatus, WorkOrderPriority, WorkOrderStatus } from '../types';

const equipmentStatusMap: Record<EquipmentStatus, string> = {
  operational: 'bg-green-100 text-green-800',
  needs_service: 'bg-yellow-100 text-yellow-800',
  in_service: 'bg-blue-100 text-blue-800',
  down: 'bg-red-100 text-red-800',
};
const equipmentStatusLabel: Record<EquipmentStatus, string> = {
  operational: 'Operational',
  needs_service: 'Needs Service',
  in_service: 'In Service',
  down: 'Down',
};

const priorityMap: Record<WorkOrderPriority, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};
const priorityLabel: Record<WorkOrderPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const woStatusMap: Record<WorkOrderStatus, string> = {
  pending: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-800',
  waiting_parts: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
};
const woStatusLabel: Record<WorkOrderStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  waiting_parts: 'Waiting Parts',
  completed: 'Completed',
};

export function EquipmentStatusBadge({ status }: { status: EquipmentStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${equipmentStatusMap[status]}`}>
      {equipmentStatusLabel[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: WorkOrderPriority }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityMap[priority]}`}>
      {priorityLabel[priority]}
    </span>
  );
}

export function WorkOrderStatusBadge({ status }: { status: WorkOrderStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${woStatusMap[status]}`}>
      {woStatusLabel[status]}
    </span>
  );
}

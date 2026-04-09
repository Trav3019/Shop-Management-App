export type EquipmentCategory =
  | 'Tractor'
  | 'Combine'
  | 'Planter'
  | 'Sprayer'
  | 'Tillage'
  | 'Harvest Head'
  | 'Semi'
  | 'Trailer'
  | 'Skidsteer/Loader'
  | 'Auger/Conveyor'
  | 'Potato Equipment'
  | 'Other';

export type EquipmentStatus = 'operational' | 'needs_service' | 'in_service' | 'down';

export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'critical';

export type WorkOrderStatus = 'pending' | 'in_progress' | 'waiting_parts' | 'completed';

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  make: string;
  model: string;
  year?: number;
  serialNumber?: string;
  status: EquipmentStatus;
  hoursOrMiles?: number;
  hoursOrMilesLabel?: 'Hours' | 'Miles';
  lastServiceDate?: string;
  nextServiceDue?: string;
  notes?: string;
  createdAt: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  description?: string;
  equipmentId?: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  assignedTo?: string;
  createdDate: string;
  dueDate?: string;
  completedDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  partsNeeded?: string;
  notes?: string;
}

export interface Part {
  id: string;
  partNumber: string;
  description: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  vendor?: string;
  cost?: number;
  location?: string;
  notes?: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  equipmentId: string;
  workOrderId?: string;
  workPerformed: string;
  hoursSpent?: number;
  technician?: string;
  partsUsed?: string;
  notes?: string;
}

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

export interface OperatorNote {
  id: string;
  equipmentId: string;
  date: string;
  author?: string;
  note: string;
  severity: 'info' | 'watch' | 'fix_winter' | 'urgent';
  resolved: boolean;
  resolvedDate?: string;
}

export interface EquipmentPart {
  id: string;
  equipmentId: string;
  partNumber: string;
  description: string;
  category: string;
  intervalHours?: number;
  lastReplaced?: string;
  notes?: string;
}

export interface InspectionItem {
  id: string;
  label: string;
  partNumber?: string;
  notes?: string;
}

export interface InspectionTemplate {
  id: string;
  equipmentId: string;
  name: string;
  items: InspectionItem[];
  createdAt: string;
}

export interface CompletedInspectionItem {
  itemId: string;
  label: string;
  checkedOk?: boolean;
  added?: boolean;
  replaced?: boolean;
  adjusted?: boolean;
  repaired?: boolean;
  partNumberUsed?: string;
  notes?: string;
}

export interface InspectionRecord {
  id: string;
  templateId: string;
  templateName: string;
  equipmentId: string;
  date: string;
  dateFinished?: string;
  technician?: string;
  division?: 'Potato' | 'Grain' | 'Irrigation' | 'Shop' | 'Yard';
  items: CompletedInspectionItem[];
  notes?: string;
}

export interface OperationalInstruction {
  id: string;
  equipmentId: string;
  title: string;
  content: string;
  category: 'pre_op' | 'operating' | 'shutdown' | 'troubleshooting' | 'general';
  createdAt: string;
}

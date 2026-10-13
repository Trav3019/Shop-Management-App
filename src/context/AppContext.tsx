import React, { createContext, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Equipment, WorkOrder, Part, MaintenanceRecord,
  OperatorNote, EquipmentPart, InspectionTemplate, InspectionRecord, OperationalInstruction,
} from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  initialEquipment,
  initialWorkOrders,
  initialParts,
  initialMaintenanceRecords,
} from '../data/initialData';

interface AppContextType {
  equipment: Equipment[];
  addEquipment: (e: Omit<Equipment, 'id' | 'createdAt'>) => void;
  updateEquipment: (e: Equipment) => void;
  deleteEquipment: (id: string) => void;

  workOrders: WorkOrder[];
  addWorkOrder: (w: Omit<WorkOrder, 'id' | 'createdDate'>) => void;
  updateWorkOrder: (w: WorkOrder) => void;
  deleteWorkOrder: (id: string) => void;
  completeWorkOrder: (id: string, actualHours?: number) => void;

  parts: Part[];
  addPart: (p: Omit<Part, 'id'>) => void;
  updatePart: (p: Part) => void;
  deletePart: (id: string) => void;
  adjustPartQty: (id: string, delta: number) => void;

  maintenanceRecords: MaintenanceRecord[];
  addMaintenanceRecord: (r: Omit<MaintenanceRecord, 'id'>) => void;
  deleteMaintenanceRecord: (id: string) => void;

  operatorNotes: OperatorNote[];
  addOperatorNote: (n: Omit<OperatorNote, 'id'>) => void;
  resolveOperatorNote: (id: string) => void;
  deleteOperatorNote: (id: string) => void;

  equipmentParts: EquipmentPart[];
  addEquipmentPart: (p: Omit<EquipmentPart, 'id'>) => void;
  updateEquipmentPart: (p: EquipmentPart) => void;
  deleteEquipmentPart: (id: string) => void;

  inspectionTemplates: InspectionTemplate[];
  addInspectionTemplate: (t: Omit<InspectionTemplate, 'id' | 'createdAt'>) => void;
  updateInspectionTemplate: (t: InspectionTemplate) => void;
  deleteInspectionTemplate: (id: string) => void;

  inspectionRecords: InspectionRecord[];
  addInspectionRecord: (r: Omit<InspectionRecord, 'id'>) => void;
  deleteInspectionRecord: (id: string) => void;

  instructions: OperationalInstruction[];
  addInstruction: (i: Omit<OperationalInstruction, 'id' | 'createdAt'>) => void;
  updateInstruction: (i: OperationalInstruction) => void;
  deleteInstruction: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [equipment, setEquipment] = useLocalStorage<Equipment[]>('fsm_equipment', initialEquipment);
  const [workOrders, setWorkOrders] = useLocalStorage<WorkOrder[]>('fsm_workOrders', initialWorkOrders);
  const [parts, setParts] = useLocalStorage<Part[]>('fsm_parts', initialParts);
  const [maintenanceRecords, setMaintenanceRecords] = useLocalStorage<MaintenanceRecord[]>('fsm_maintenance', initialMaintenanceRecords);
  const [operatorNotes, setOperatorNotes] = useLocalStorage<OperatorNote[]>('fsm_operatorNotes', []);
  const [equipmentParts, setEquipmentParts] = useLocalStorage<EquipmentPart[]>('fsm_equipmentParts', []);
  const [inspectionTemplates, setInspectionTemplates] = useLocalStorage<InspectionTemplate[]>('fsm_inspTemplates', []);
  const [inspectionRecords, setInspectionRecords] = useLocalStorage<InspectionRecord[]>('fsm_inspRecords', []);
  const [instructions, setInstructions] = useLocalStorage<OperationalInstruction[]>('fsm_instructions', []);

  // Equipment
  const addEquipment = (e: Omit<Equipment, 'id' | 'createdAt'>) =>
    setEquipment(prev => [...prev, { ...e, id: uuidv4(), createdAt: new Date().toISOString().split('T')[0] }]);
  const updateEquipment = (e: Equipment) =>
    setEquipment(prev => prev.map(x => (x.id === e.id ? e : x)));
  const deleteEquipment = (id: string) =>
    setEquipment(prev => prev.filter(x => x.id !== id));

  // Work Orders
  const addWorkOrder = (w: Omit<WorkOrder, 'id' | 'createdDate'>) =>
    setWorkOrders(prev => [...prev, { ...w, id: uuidv4(), createdDate: new Date().toISOString().split('T')[0] }]);
  const updateWorkOrder = (w: WorkOrder) =>
    setWorkOrders(prev => prev.map(x => (x.id === w.id ? w : x)));
  const deleteWorkOrder = (id: string) =>
    setWorkOrders(prev => prev.filter(x => x.id !== id));
  const completeWorkOrder = (id: string, actualHours?: number) => {
    setWorkOrders(prev =>
      prev.map(x =>
        x.id === id
          ? { ...x, status: 'completed', completedDate: new Date().toISOString().split('T')[0], ...(actualHours !== undefined ? { actualHours } : {}) }
          : x
      )
    );
    const wo = workOrders.find(x => x.id === id);
    if (wo) {
      const record: Omit<MaintenanceRecord, 'id'> = {
        date: new Date().toISOString().split('T')[0],
        equipmentId: wo.equipmentId ?? '',
        workOrderId: wo.id,
        workPerformed: wo.title,
        hoursSpent: actualHours,
        technician: wo.assignedTo,
        partsUsed: wo.partsNeeded,
        notes: wo.notes,
      };
      if (wo.equipmentId) {
        setMaintenanceRecords(prev => [...prev, { ...record, id: uuidv4() }]);
      }
    }
  };

  // Parts
  const addPart = (p: Omit<Part, 'id'>) =>
    setParts(prev => [...prev, { ...p, id: uuidv4() }]);
  const updatePart = (p: Part) =>
    setParts(prev => prev.map(x => (x.id === p.id ? p : x)));
  const deletePart = (id: string) =>
    setParts(prev => prev.filter(x => x.id !== id));
  const adjustPartQty = (id: string, delta: number) =>
    setParts(prev =>
      prev.map(x => x.id === id ? { ...x, quantity: Math.max(0, x.quantity + delta) } : x)
    );

  // Maintenance Records
  const addMaintenanceRecord = (r: Omit<MaintenanceRecord, 'id'>) =>
    setMaintenanceRecords(prev => [...prev, { ...r, id: uuidv4() }]);
  const deleteMaintenanceRecord = (id: string) =>
    setMaintenanceRecords(prev => prev.filter(x => x.id !== id));

  // Operator Notes
  const addOperatorNote = (n: Omit<OperatorNote, 'id'>) =>
    setOperatorNotes(prev => [...prev, { ...n, id: uuidv4() }]);
  const resolveOperatorNote = (id: string) =>
    setOperatorNotes(prev =>
      prev.map(x => x.id === id
        ? { ...x, resolved: !x.resolved, resolvedDate: !x.resolved ? new Date().toISOString().split('T')[0] : undefined }
        : x
      )
    );
  const deleteOperatorNote = (id: string) =>
    setOperatorNotes(prev => prev.filter(x => x.id !== id));

  // Equipment Parts
  const addEquipmentPart = (p: Omit<EquipmentPart, 'id'>) =>
    setEquipmentParts(prev => [...prev, { ...p, id: uuidv4() }]);
  const updateEquipmentPart = (p: EquipmentPart) =>
    setEquipmentParts(prev => prev.map(x => (x.id === p.id ? p : x)));
  const deleteEquipmentPart = (id: string) =>
    setEquipmentParts(prev => prev.filter(x => x.id !== id));

  // Inspection Templates
  const addInspectionTemplate = (t: Omit<InspectionTemplate, 'id' | 'createdAt'>) =>
    setInspectionTemplates(prev => [...prev, { ...t, id: uuidv4(), createdAt: new Date().toISOString().split('T')[0] }]);
  const updateInspectionTemplate = (t: InspectionTemplate) =>
    setInspectionTemplates(prev => prev.map(x => (x.id === t.id ? t : x)));
  const deleteInspectionTemplate = (id: string) =>
    setInspectionTemplates(prev => prev.filter(x => x.id !== id));

  // Inspection Records
  const addInspectionRecord = (r: Omit<InspectionRecord, 'id'>) => {
    setInspectionRecords(prev => [...prev, { ...r, id: uuidv4() }]);

    // Auto-add new part numbers to the equipment's parts list
    const toAdd: EquipmentPart[] = [];
    for (const item of r.items) {
      const pn = item.partNumberUsed?.trim();
      if (!pn) continue;
      const exists = equipmentParts.some(
        p => p.equipmentId === r.equipmentId && p.partNumber.toLowerCase() === pn.toLowerCase()
      );
      const alreadyQueued = toAdd.some(p => p.partNumber.toLowerCase() === pn.toLowerCase());
      if (!exists && !alreadyQueued) {
        toAdd.push({ id: uuidv4(), equipmentId: r.equipmentId, partNumber: pn, description: item.label, category: 'Other' });
      }
    }
    if (toAdd.length > 0) setEquipmentParts(prev => [...prev, ...toAdd]);

    // Deduct used quantities from global parts inventory
    for (const item of r.items) {
      const pn = item.partNumberUsed?.trim();
      const qty = item.quantityUsed ?? 0;
      if (!pn || qty <= 0) continue;
      const match = parts.find(p => p.partNumber.toLowerCase() === pn.toLowerCase());
      if (match) {
        setParts(prev => prev.map(p =>
          p.id === match.id ? { ...p, quantity: Math.max(0, p.quantity - qty) } : p
        ));
      }
    }
  };
  const deleteInspectionRecord = (id: string) =>
    setInspectionRecords(prev => prev.filter(x => x.id !== id));

  // Operational Instructions
  const addInstruction = (i: Omit<OperationalInstruction, 'id' | 'createdAt'>) =>
    setInstructions(prev => [...prev, { ...i, id: uuidv4(), createdAt: new Date().toISOString().split('T')[0] }]);
  const updateInstruction = (i: OperationalInstruction) =>
    setInstructions(prev => prev.map(x => (x.id === i.id ? i : x)));
  const deleteInstruction = (id: string) =>
    setInstructions(prev => prev.filter(x => x.id !== id));

  return (
    <AppContext.Provider value={{
      equipment, addEquipment, updateEquipment, deleteEquipment,
      workOrders, addWorkOrder, updateWorkOrder, deleteWorkOrder, completeWorkOrder,
      parts, addPart, updatePart, deletePart, adjustPartQty,
      maintenanceRecords, addMaintenanceRecord, deleteMaintenanceRecord,
      operatorNotes, addOperatorNote, resolveOperatorNote, deleteOperatorNote,
      equipmentParts, addEquipmentPart, updateEquipmentPart, deleteEquipmentPart,
      inspectionTemplates, addInspectionTemplate, updateInspectionTemplate, deleteInspectionTemplate,
      inspectionRecords, addInspectionRecord, deleteInspectionRecord,
      instructions, addInstruction, updateInstruction, deleteInstruction,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

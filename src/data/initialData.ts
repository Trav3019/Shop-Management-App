import { Equipment, WorkOrder, Part, MaintenanceRecord } from '../types';

export const initialEquipment: Equipment[] = [
  // Tractors
  { id: 'eq-001', name: 'JD 8R 410', category: 'Tractor', make: 'John Deere', model: '8R 410', year: 2022, serialNumber: '1RW8410RPNA123456', status: 'operational', hoursOrMiles: 1240, hoursOrMilesLabel: 'Hours', lastServiceDate: '2024-03-15', nextServiceDue: '2024-09-15', notes: 'Primary tillage tractor', createdAt: '2024-01-01' },
  { id: 'eq-002', name: 'JD 8R 340', category: 'Tractor', make: 'John Deere', model: '8R 340', year: 2019, serialNumber: '1RW8340RPNB234567', status: 'operational', hoursOrMiles: 3850, hoursOrMilesLabel: 'Hours', lastServiceDate: '2024-02-20', nextServiceDue: '2024-08-20', notes: 'Planting and field work', createdAt: '2024-01-01' },
  { id: 'eq-003', name: 'JD 7R 330', category: 'Tractor', make: 'John Deere', model: '7R 330', year: 2021, serialNumber: '1RW7330RPNC345678', status: 'needs_service', hoursOrMiles: 2100, hoursOrMilesLabel: 'Hours', lastServiceDate: '2023-10-10', nextServiceDue: '2024-04-10', notes: '500hr service overdue', createdAt: '2024-01-01' },
  { id: 'eq-004', name: 'JD 6R 215', category: 'Tractor', make: 'John Deere', model: '6R 215', year: 2020, serialNumber: '1RW6215RPND456789', status: 'operational', hoursOrMiles: 1680, hoursOrMilesLabel: 'Hours', lastServiceDate: '2024-01-18', nextServiceDue: '2024-07-18', notes: 'Loader tractor / yard work', createdAt: '2024-01-01' },
  { id: 'eq-005', name: 'JD 5075E Utility', category: 'Tractor', make: 'John Deere', model: '5075E', year: 2018, serialNumber: '1PY5075EPNE567890', status: 'operational', hoursOrMiles: 890, hoursOrMilesLabel: 'Hours', lastServiceDate: '2024-03-01', notes: 'Shop / utility duties', createdAt: '2024-01-01' },
  // Combines
  { id: 'eq-006', name: 'JD S790 Combine', category: 'Combine', make: 'John Deere', model: 'S790', year: 2021, serialNumber: 'S790E901234', status: 'operational', hoursOrMiles: 1450, hoursOrMilesLabel: 'Hours', lastServiceDate: '2023-11-01', nextServiceDue: '2024-07-01', notes: 'Main harvest combine', createdAt: '2024-01-01' },
  { id: 'eq-007', name: 'JD S680 Combine', category: 'Combine', make: 'John Deere', model: 'S680', year: 2018, serialNumber: 'S680E801235', status: 'needs_service', hoursOrMiles: 3200, hoursOrMilesLabel: 'Hours', lastServiceDate: '2023-10-15', nextServiceDue: '2024-04-15', notes: 'Pre-harvest feeder house service needed', createdAt: '2024-01-01' },
  // Planters
  { id: 'eq-008', name: 'JD DB120 48-Row Planter', category: 'Planter', make: 'John Deere', model: 'DB120', year: 2020, serialNumber: 'DB120A012345', status: 'operational', hoursOrMiles: 580, hoursOrMilesLabel: 'Hours', lastServiceDate: '2023-05-20', nextServiceDue: '2024-04-01', notes: 'Corn planter — pre-season inspection due', createdAt: '2024-01-01' },
  { id: 'eq-009', name: 'JD MaxEmerge Planter', category: 'Planter', make: 'John Deere', model: 'MaxEmerge 5e', year: 2019, serialNumber: 'ME5E-023456', status: 'operational', hoursOrMiles: 420, hoursOrMilesLabel: 'Hours', lastServiceDate: '2023-05-10', notes: 'Bean / grain planter', createdAt: '2024-01-01' },
  // Sprayers
  { id: 'eq-010', name: 'JD R4045 Sprayer', category: 'Sprayer', make: 'John Deere', model: 'R4045', year: 2022, serialNumber: 'R4045B034567', status: 'operational', hoursOrMiles: 680, hoursOrMilesLabel: 'Hours', lastServiceDate: '2024-03-10', notes: '120ft boom', createdAt: '2024-01-01' },
  // Tillage
  { id: 'eq-011', name: 'JD 2730 Combo Ripper', category: 'Tillage', make: 'John Deere', model: '2730', year: 2019, serialNumber: '2730-045678', status: 'operational', hoursOrMiles: 950, hoursOrMilesLabel: 'Hours', lastServiceDate: '2023-09-20', notes: 'Fall tillage', createdAt: '2024-01-01' },
  { id: 'eq-012', name: 'Salford RTS Vertical Tillage', category: 'Tillage', make: 'Salford', model: 'RTS 9000', year: 2020, serialNumber: 'RTS-056789', status: 'operational', hoursOrMiles: 720, hoursOrMilesLabel: 'Hours', lastServiceDate: '2023-09-25', notes: '40ft working width', createdAt: '2024-01-01' },
  // Harvest Heads
  { id: 'eq-013', name: 'JD 612C Corn Head', category: 'Harvest Head', make: 'John Deere', model: '612C', year: 2019, serialNumber: '612C-067890', status: 'operational', lastServiceDate: '2023-10-30', notes: '12-row corn head for S790', createdAt: '2024-01-01' },
  { id: 'eq-014', name: 'JD 625F Flex Draper', category: 'Harvest Head', make: 'John Deere', model: '625F', year: 2020, serialNumber: '625F-078901', status: 'operational', lastServiceDate: '2023-10-28', notes: '25ft flex draper — beans/wheat', createdAt: '2024-01-01' },
  { id: 'eq-015', name: 'JD 615P Pickup Header', category: 'Harvest Head', make: 'John Deere', model: '615P', year: 2018, serialNumber: '615P-089012', status: 'operational', lastServiceDate: '2023-08-15', notes: 'For S680 canola/swath pickup', createdAt: '2024-01-01' },
  // Potato Equipment
  { id: 'eq-016', name: 'Grimme SE 150-60 Harvester', category: 'Potato Equipment', make: 'Grimme', model: 'SE 150-60', year: 2020, serialNumber: 'GR-SE150-001', status: 'operational', hoursOrMiles: 580, hoursOrMilesLabel: 'Hours', lastServiceDate: '2023-10-20', notes: 'Pre-season inspection due before planting', createdAt: '2024-01-01' },
  { id: 'eq-017', name: 'Grimme GL 860 Potato Planter', category: 'Potato Equipment', make: 'Grimme', model: 'GL 860', year: 2019, serialNumber: 'GR-GL860-002', status: 'operational', hoursOrMiles: 340, hoursOrMilesLabel: 'Hours', lastServiceDate: '2023-05-01', notes: '4-row planter', createdAt: '2024-01-01' },
  // Semis
  { id: 'eq-018', name: 'Peterbilt 389 Semi', category: 'Semi', make: 'Peterbilt', model: '389', year: 2020, serialNumber: 'PB389-2020-111', status: 'operational', hoursOrMiles: 187000, hoursOrMilesLabel: 'Miles', lastServiceDate: '2024-02-15', nextServiceDue: '2024-08-15', notes: 'Grain hauling', createdAt: '2024-01-01' },
  { id: 'eq-019', name: 'Kenworth T680 Semi', category: 'Semi', make: 'Kenworth', model: 'T680', year: 2018, serialNumber: 'KW-T680-2018-222', status: 'needs_service', hoursOrMiles: 312000, hoursOrMilesLabel: 'Miles', lastServiceDate: '2023-11-01', nextServiceDue: '2024-04-01', notes: 'DEF system fault — needs attention', createdAt: '2024-01-01' },
  // Trailers
  { id: 'eq-020', name: 'Wilson Grain Trailer #1', category: 'Trailer', make: 'Wilson', model: '42ft Grain', year: 2021, serialNumber: 'WIL-2021-333', status: 'operational', notes: 'Hopper bottom', createdAt: '2024-01-01' },
  { id: 'eq-021', name: 'Wilson Grain Trailer #2', category: 'Trailer', make: 'Wilson', model: '42ft Grain', year: 2019, serialNumber: 'WIL-2019-444', status: 'operational', notes: 'Tarp needs repair', createdAt: '2024-01-01' },
  { id: 'eq-022', name: 'Donahue Equipment Trailer', category: 'Trailer', make: 'Donahue', model: '53ft Flatdeck', year: 2018, serialNumber: 'DON-2018-555', status: 'operational', notes: 'Equipment hauling', createdAt: '2024-01-01' },
  // Skidsteers / Loaders
  { id: 'eq-023', name: 'JD 332G Skid Steer', category: 'Skidsteer/Loader', make: 'John Deere', model: '332G', year: 2021, serialNumber: '332G-C012345', status: 'operational', hoursOrMiles: 890, hoursOrMilesLabel: 'Hours', lastServiceDate: '2024-01-25', notes: 'Shop and yard work', createdAt: '2024-01-01' },
  { id: 'eq-024', name: 'JD 544K Wheel Loader', category: 'Skidsteer/Loader', make: 'John Deere', model: '544K', year: 2019, serialNumber: '544K-D023456', status: 'operational', hoursOrMiles: 1450, hoursOrMilesLabel: 'Hours', lastServiceDate: '2024-02-05', notes: 'Bin site and grain handling', createdAt: '2024-01-01' },
  // Augers / Conveyors
  { id: 'eq-025', name: 'Westfield MK130-71 Auger', category: 'Auger/Conveyor', make: 'Westfield', model: 'MK130-71', year: 2020, serialNumber: 'WF-MK130-034', status: 'operational', notes: '13" x 71ft swing auger', createdAt: '2024-01-01' },
  { id: 'eq-026', name: 'Batco 1545 Field Conveyor', category: 'Auger/Conveyor', make: 'Batco', model: '1545', year: 2021, serialNumber: 'BAT-1545-045', status: 'operational', notes: '15" x 45ft field conveyor', createdAt: '2024-01-01' },
  { id: 'eq-027', name: 'Farm King 1370 Grain Auger', category: 'Auger/Conveyor', make: 'Farm King', model: '1370', year: 2018, serialNumber: 'FK-1370-056', status: 'down', notes: 'Flight damaged — awaiting repair parts', createdAt: '2024-01-01' },
  // Other
  { id: 'eq-028', name: 'JD 569 Round Baler', category: 'Other', make: 'John Deere', model: '569', year: 2020, serialNumber: '569-E067', status: 'operational', hoursOrMiles: 8200, hoursOrMilesLabel: 'Hours', lastServiceDate: '2023-07-15', notes: 'Straw baling', createdAt: '2024-01-01' },
  { id: 'eq-029', name: 'JD W235 Windrower', category: 'Other', make: 'John Deere', model: 'W235', year: 2021, serialNumber: 'W235-F078', status: 'operational', hoursOrMiles: 420, hoursOrMilesLabel: 'Hours', lastServiceDate: '2023-08-01', notes: 'Canola/hay swathing', createdAt: '2024-01-01' },
  { id: 'eq-030', name: 'JD 1910 Air Cart', category: 'Other', make: 'John Deere', model: '1910', year: 2020, serialNumber: '1910-G089', status: 'operational', notes: '430bu commodity air cart', createdAt: '2024-01-01' },
];

const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const daysAgo = (n: number) => fmt(new Date(today.getTime() - n * 86400000));
const daysAhead = (n: number) => fmt(new Date(today.getTime() + n * 86400000));

export const initialWorkOrders: WorkOrder[] = [
  {
    id: 'wo-001', title: 'Kenworth T680 – DEF System Fault', description: 'Check engine light on, DEF system fault code P20EE. Truck is out of service until repaired.', equipmentId: 'eq-019', priority: 'critical', status: 'pending', assignedTo: '', createdDate: daysAgo(2), dueDate: daysAhead(1), notes: 'May need NOx sensor and DEF injector. Check with Kenworth dealer.',
  },
  {
    id: 'wo-002', title: 'JD S680 – Pre-Harvest Feeder House Service', description: 'Full feeder house inspection and service before harvest. Check chains, sprockets, bearings, stone trap, and concave clearance.', equipmentId: 'eq-007', priority: 'high', status: 'pending', assignedTo: 'Mike', createdDate: daysAgo(5), dueDate: daysAhead(14), notes: 'Order feeder house chain set ahead of time.',
  },
  {
    id: 'wo-003', title: 'JD 7R 330 – 500hr Service', description: 'Engine oil & filter, fuel filters, hydraulic filter, DEF filter, air filter service. Grease all fittings.', equipmentId: 'eq-003', priority: 'high', status: 'in_progress', assignedTo: 'Mike', createdDate: daysAgo(3), dueDate: daysAhead(2), estimatedHours: 4, notes: 'Oil and filters on order.',
  },
  {
    id: 'wo-004', title: 'Farm King 1370 Auger – Flight Repair', description: 'Auger flight is damaged near the bottom intake. Needs new flight section welded in.', equipmentId: 'eq-027', priority: 'medium', status: 'waiting_parts', assignedTo: 'Dave', createdDate: daysAgo(7), dueDate: daysAhead(10), partsNeeded: 'Farm King replacement flight section — on order from dealer', notes: 'Auger is currently down. Parts ETA 5 days.',
  },
  {
    id: 'wo-005', title: 'JD 332G – Hydraulic Hose Replacement', description: 'Hydraulic hose on bucket tilt cylinder is cracked and seeping oil. Replace before it fails completely.', equipmentId: 'eq-023', priority: 'medium', status: 'pending', assignedTo: '', createdDate: daysAgo(1), dueDate: daysAhead(5), partsNeeded: '1/2" hydraulic hose x 36" with JIC fittings', notes: 'Can make hose in-shop.',
  },
  {
    id: 'wo-006', title: 'JD 8R 340 – Cab Air Filter & Recirculation Filter', description: 'Replace cab fresh air filter and recirculation filter. Filters are visibly dirty.', equipmentId: 'eq-002', priority: 'low', status: 'pending', assignedTo: '', createdDate: daysAgo(4), dueDate: daysAhead(21), partsNeeded: 'RE504836 cab air filter, AL215480 recirc filter',
  },
  {
    id: 'wo-007', title: 'Grimme SE 150-60 – Pre-Season Full Inspection', description: 'Full pre-season inspection of potato harvester. Check all belts, webs, bearings, elevator chains, hydraulic hoses. Lube all fittings.', equipmentId: 'eq-016', priority: 'high', status: 'pending', assignedTo: 'Dave', createdDate: daysAgo(2), dueDate: daysAhead(21), estimatedHours: 8, notes: 'Order any belts and webs now before season.',
  },
  {
    id: 'wo-008', title: 'Wilson Grain Trailer #2 – Tarp Repair', description: 'Tarp has a 3ft tear along the seam. Needs repair kit or replacement section before grain hauling season.', equipmentId: 'eq-021', priority: 'medium', status: 'pending', assignedTo: '', createdDate: daysAgo(6), dueDate: daysAhead(30), partsNeeded: 'Truck tarp repair kit or replacement tarp section',
  },
  {
    id: 'wo-009', title: 'Shop – Organize and Inventory Parts Room', description: 'Full parts room cleanup. Label all bins, count stock on hand, update inventory in system. Identify what needs to be reordered.', equipmentId: undefined, priority: 'low', status: 'pending', assignedTo: '', createdDate: daysAgo(10), dueDate: daysAhead(60),
  },
  {
    id: 'wo-010', title: 'JD 8R 410 – 250hr Engine Service', description: 'Engine oil, oil filter, fuel pre-filter, and full grease service at 250hr interval.', equipmentId: 'eq-001', priority: 'medium', status: 'completed', assignedTo: 'Mike', createdDate: daysAgo(10), dueDate: daysAgo(1), completedDate: daysAgo(1), estimatedHours: 3, actualHours: 2.5, notes: 'Used JD Plus-50 II oil and OEM filters.',
  },
  {
    id: 'wo-011', title: 'JD DB120 Planter – Pre-Season Inspection', description: 'Check all row units, meter housings, down-pressure springs, closing wheels, seed tubes. Replace worn parts before planting.', equipmentId: 'eq-008', priority: 'high', status: 'pending', assignedTo: 'Dave', createdDate: daysAgo(1), dueDate: daysAhead(14), estimatedHours: 12, notes: 'Check row unit rebuild kits — last done 2 seasons ago.',
  },
  {
    id: 'wo-012', title: 'JD W235 Windrower – Sickle Bar Replacement', description: 'Sickle sections are worn. Replace sickle bar sections and guards before canola swathing season.', equipmentId: 'eq-029', priority: 'medium', status: 'pending', assignedTo: '', createdDate: daysAgo(3), dueDate: daysAhead(45), partsNeeded: 'Sickle section set + hold-down clips for W235',
  },
];

export const initialParts: Part[] = [
  { id: 'pt-001', partNumber: 'RE504836', description: 'JD Cab Air Filter', category: 'Filters', quantity: 2, minQuantity: 2, unit: 'ea', vendor: 'John Deere Dealer', cost: 48.50, location: 'Bin A1' },
  { id: 'pt-002', partNumber: 'AL215480', description: 'JD Cab Recirculation Filter', category: 'Filters', quantity: 1, minQuantity: 2, unit: 'ea', vendor: 'John Deere Dealer', cost: 32.00, location: 'Bin A1', notes: 'LOW — reorder' },
  { id: 'pt-003', partNumber: 'RE509672', description: 'JD Engine Oil Filter (8R/7R)', category: 'Filters', quantity: 6, minQuantity: 4, unit: 'ea', vendor: 'John Deere Dealer', cost: 22.75, location: 'Bin A2' },
  { id: 'pt-004', partNumber: 'RE541922', description: 'JD Fuel Pre-Filter', category: 'Filters', quantity: 4, minQuantity: 3, unit: 'ea', vendor: 'John Deere Dealer', cost: 18.40, location: 'Bin A2' },
  { id: 'pt-005', partNumber: 'RE509031', description: 'JD Hydraulic Filter', category: 'Filters', quantity: 3, minQuantity: 2, unit: 'ea', vendor: 'John Deere Dealer', cost: 65.00, location: 'Bin A3' },
  { id: 'pt-006', partNumber: 'T19044', description: 'JD Combine Feeder House Chain (S-series)', category: 'Belts/Chains', quantity: 0, minQuantity: 1, unit: 'ea', vendor: 'John Deere Dealer', cost: 485.00, location: 'Shelf B1', notes: 'OUT OF STOCK — critical for harvest' },
  { id: 'pt-007', partNumber: 'H215680', description: 'Combine Feeder Drum Bearing', category: 'Bearings', quantity: 2, minQuantity: 2, unit: 'ea', vendor: 'John Deere Dealer', cost: 145.00, location: 'Bin C2' },
  { id: 'pt-008', partNumber: 'HYD-HOSE-12-36', description: '1/2" Hydraulic Hose x 36" JIC', category: 'Hydraulics', quantity: 5, minQuantity: 4, unit: 'ea', vendor: 'Local Hydraulics Shop', cost: 28.00, location: 'Shelf D1' },
  { id: 'pt-009', partNumber: 'HYD-FIT-JIC-12', description: 'JIC 1/2" Hydraulic Fitting Assortment', category: 'Hydraulics', quantity: 1, minQuantity: 2, unit: 'kit', vendor: 'Local Hydraulics Shop', cost: 55.00, location: 'Shelf D1', notes: 'Low — reorder kit' },
  { id: 'pt-010', partNumber: 'TY6355', description: 'JD Plus-50 II Engine Oil (1 gal)', category: 'Fluids/Lubricants', quantity: 24, minQuantity: 12, unit: 'gal', vendor: 'John Deere Dealer', cost: 14.50, location: 'Oil Room' },
  { id: 'pt-011', partNumber: 'TY22041', description: 'JD Hy-Gard Hydraulic Oil (1 gal)', category: 'Fluids/Lubricants', quantity: 16, minQuantity: 8, unit: 'gal', vendor: 'John Deere Dealer', cost: 18.00, location: 'Oil Room' },
  { id: 'pt-012', partNumber: 'TY6341', description: 'Multi-Purpose Grease Cartridge', category: 'Fluids/Lubricants', quantity: 10, minQuantity: 12, unit: 'ea', vendor: 'John Deere Dealer', cost: 7.25, location: 'Shelf E1', notes: 'Low — reorder' },
  { id: 'pt-013', partNumber: 'VBelt-B78', description: 'V-Belt B78 (various equipment)', category: 'Belts/Chains', quantity: 4, minQuantity: 2, unit: 'ea', vendor: 'NAPA', cost: 22.00, location: 'Shelf B2' },
  { id: 'pt-014', partNumber: 'BOLT-38-GR8', description: '3/8" Grade 8 Bolt Assortment', category: 'Hardware', quantity: 1, minQuantity: 1, unit: 'box', vendor: 'Local Farm Supply', cost: 45.00, location: 'Hardware Wall' },
  { id: 'pt-015', partNumber: 'DEF-FLUID-25L', description: 'DEF Fluid 25L Jug', category: 'Fluids/Lubricants', quantity: 4, minQuantity: 3, unit: 'jug', vendor: 'Local Co-op', cost: 22.00, location: 'Oil Room' },
  { id: 'pt-016', partNumber: 'RE546915', description: 'JD DEF Filter', category: 'Filters', quantity: 2, minQuantity: 2, unit: 'ea', vendor: 'John Deere Dealer', cost: 38.00, location: 'Bin A3' },
  { id: 'pt-017', partNumber: 'AH212949', description: 'Combine Grain Belt (S790)', category: 'Belts/Chains', quantity: 1, minQuantity: 1, unit: 'ea', vendor: 'John Deere Dealer', cost: 225.00, location: 'Shelf B1' },
  { id: 'pt-018', partNumber: 'TIRE-11R22.5', description: 'Semi Steer Tire 11R22.5', category: 'Tires/Tracks', quantity: 0, minQuantity: 2, unit: 'ea', vendor: 'Local Tire Shop', cost: 450.00, location: 'Tire Rack', notes: 'OUT OF STOCK' },
];

export const initialMaintenanceRecords: MaintenanceRecord[] = [
  { id: 'mr-001', date: daysAgo(1), equipmentId: 'eq-001', workOrderId: 'wo-010', workPerformed: '250hr service — engine oil & filter, fuel pre-filter, full grease', hoursSpent: 2.5, technician: 'Mike', partsUsed: 'RE509672 oil filter x1, RE541922 fuel filter x1, TY6355 oil 3gal', notes: 'No issues found' },
  { id: 'mr-002', date: daysAgo(14), equipmentId: 'eq-010', workOrderId: undefined, workPerformed: 'Sprayer winterization and nozzle inspection. Replaced 4 worn nozzle tips.', hoursSpent: 3, technician: 'Dave', partsUsed: 'TeeJet nozzle tips x4', notes: 'Ready for season' },
  { id: 'mr-003', date: daysAgo(30), equipmentId: 'eq-006', workOrderId: undefined, workPerformed: 'Post-harvest cleaning and inspection. Replaced separator grate section, greased all fittings.', hoursSpent: 6, technician: 'Mike', notes: 'Concave wear is moderate — monitor next season' },
  { id: 'mr-004', date: daysAgo(45), equipmentId: 'eq-019', workOrderId: undefined, workPerformed: 'Oil change and DOT pre-trip inspection. Adjusted trailer brakes.', hoursSpent: 2, technician: 'Dave', partsUsed: 'Oil 10gal, oil filter x1', notes: 'DEF fault code appeared after service — investigate' },
  { id: 'mr-005', date: daysAgo(60), equipmentId: 'eq-023', workOrderId: undefined, workPerformed: '500hr service — engine oil, hydraulic filter, air filter, grease all points.', hoursSpent: 3, technician: 'Mike', partsUsed: 'Engine oil 2gal, hydraulic filter, air filter', notes: 'Quick attach pivot pin worn — replaced' },
];

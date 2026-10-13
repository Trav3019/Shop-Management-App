import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft, Plus, Trash2, Edit2, ChevronDown, ChevronRight,
  CheckCircle2, Circle, AlertTriangle, ClipboardCheck, BookOpen,
  Wrench, StickyNote, List,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { EquipmentStatusBadge } from '../components/Badge';
import {
  EquipmentPart, InspectionItem,
  CompletedInspectionItem, OperatorNote, OperationalInstruction,
} from '../types';

const PART_CATEGORIES = [
  'Filters', 'Belts/Chains', 'Bearings', 'Hydraulics', 'Electrical',
  'Tires/Tracks', 'Engine', 'Fluids/Lubricants', 'Hardware', 'Other',
];

const INSTRUCTION_CATEGORIES: { value: OperationalInstruction['category']; label: string }[] = [
  { value: 'pre_op', label: 'Pre-Operation' },
  { value: 'operating', label: 'Operating' },
  { value: 'shutdown', label: 'Shutdown & Storage' },
  { value: 'troubleshooting', label: 'Troubleshooting' },
  { value: 'general', label: 'General' },
];

type Tab = 'overview' | 'parts' | 'inspections' | 'notes' | 'howto';

const SEVERITY_CONFIG = {
  info: { label: 'Info', cls: 'bg-blue-100 text-blue-800' },
  watch: { label: 'Watch', cls: 'bg-yellow-100 text-yellow-800' },
  fix_winter: { label: 'Fix This Winter', cls: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Urgent', cls: 'bg-red-100 text-red-800' },
};

const ITEM_STATUS_LABELS: Record<CompletedInspectionItem['status'], string> = {
  ok: 'OK',
  replaced: 'Replaced',
  repaired: 'Repaired',
  needs_attention: 'Needs Attention',
  na: 'N/A',
};

export function EquipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    equipment, workOrders,
    operatorNotes, addOperatorNote, resolveOperatorNote, deleteOperatorNote,
    equipmentParts, addEquipmentPart, updateEquipmentPart, deleteEquipmentPart,
    inspectionTemplates, addInspectionTemplate, deleteInspectionTemplate,
    inspectionRecords, addInspectionRecord, deleteInspectionRecord,
    instructions, addInstruction, updateInstruction, deleteInstruction,
  } = useApp();

  const eq = equipment.find(e => e.id === id);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Parts state
  const [showPartModal, setShowPartModal] = useState(false);
  const [editingPart, setEditingPart] = useState<EquipmentPart | null>(null);
  const [partForm, setPartForm] = useState<Omit<EquipmentPart, 'id' | 'equipmentId'>>({
    partNumber: '', description: '', category: 'Filters',
    intervalHours: undefined, lastReplaced: '', notes: '',
  });

  // Inspection template state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateItems, setTemplateItems] = useState<Omit<InspectionItem, 'id'>[]>([]);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemPartNumber, setNewItemPartNumber] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());

  // Inspection fill state
  const [showFillModal, setShowFillModal] = useState(false);
  const [fillTemplateId, setFillTemplateId] = useState('');
  const [fillItems, setFillItems] = useState<CompletedInspectionItem[]>([]);
  const [fillTechnician, setFillTechnician] = useState('');
  const [fillNotes, setFillNotes] = useState('');
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());

  // Operator notes state
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteForm, setNoteForm] = useState<{ note: string; severity: OperatorNote['severity']; author: string }>({
    note: '', severity: 'info', author: '',
  });

  // How-To guides state
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [editingGuide, setEditingGuide] = useState<OperationalInstruction | null>(null);
  const [guideForm, setGuideForm] = useState<{ title: string; category: OperationalInstruction['category']; content: string }>({
    title: '', category: 'pre_op', content: '',
  });

  if (!eq) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 mb-4">Equipment not found.</p>
        <Link to="/equipment" className="text-jd-green hover:underline font-medium">← Back to Equipment</Link>
      </div>
    );
  }

  const myParts = equipmentParts.filter(p => p.equipmentId === id);
  const myTemplates = inspectionTemplates.filter(t => t.equipmentId === id);
  const myRecords = inspectionRecords
    .filter(r => r.equipmentId === id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const myNotes = operatorNotes.filter(n => n.equipmentId === id);
  const unresolvedNotes = myNotes.filter(n => !n.resolved).sort((a, b) => b.date.localeCompare(a.date));
  const resolvedNotes = myNotes.filter(n => n.resolved).sort((a, b) => b.date.localeCompare(a.date));
  const myInstructions = instructions.filter(i => i.equipmentId === id);
  const openWorkOrders = workOrders.filter(w => w.equipmentId === id && w.status !== 'completed');

  // ---- Part handlers ----
  function openAddPart() {
    setEditingPart(null);
    setPartForm({ partNumber: '', description: '', category: 'Filters', intervalHours: undefined, lastReplaced: '', notes: '' });
    setShowPartModal(true);
  }
  function openEditPart(p: EquipmentPart) {
    setEditingPart(p);
    setPartForm({ partNumber: p.partNumber, description: p.description, category: p.category, intervalHours: p.intervalHours, lastReplaced: p.lastReplaced ?? '', notes: p.notes ?? '' });
    setShowPartModal(true);
  }
  function savePart() {
    if (!partForm.partNumber.trim() || !partForm.description.trim()) return;
    if (editingPart) {
      updateEquipmentPart({ ...editingPart, ...partForm });
    } else {
      addEquipmentPart({ ...partForm, equipmentId: id! });
    }
    setShowPartModal(false);
  }

  // ---- Template handlers ----
  function addTemplateItem() {
    if (!newItemLabel.trim()) return;
    setTemplateItems(prev => [...prev, { label: newItemLabel, partNumber: newItemPartNumber || undefined, notes: newItemNotes || undefined }]);
    setNewItemLabel(''); setNewItemPartNumber(''); setNewItemNotes('');
  }
  function removeTemplateItem(idx: number) {
    setTemplateItems(prev => prev.filter((_, i) => i !== idx));
  }
  function saveTemplate() {
    if (!templateName.trim() || templateItems.length === 0) return;
    const items: InspectionItem[] = templateItems.map((item, i) => ({ ...item, id: `item-${Date.now()}-${i}` }));
    addInspectionTemplate({ equipmentId: id!, name: templateName, items });
    setShowTemplateModal(false);
    setTemplateName(''); setTemplateItems([]);
  }

  // ---- Fill inspection handlers ----
  function openFillModal() {
    setFillTemplateId(myTemplates[0]?.id ?? '');
    setFillItems([]);
    setFillTechnician(''); setFillNotes('');
    setShowFillModal(true);
  }
  function onSelectTemplate(tId: string) {
    setFillTemplateId(tId);
    const tmpl = inspectionTemplates.find(t => t.id === tId);
    if (!tmpl) return;
    setFillItems(tmpl.items.map(item => ({
      itemId: item.id,
      label: item.label,
      status: 'ok' as const,
      partNumberUsed: item.partNumber ?? '',
      notes: '',
    })));
  }
  function updateFillItem(idx: number, field: keyof CompletedInspectionItem, value: string) {
    setFillItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  }
  function saveFillInspection() {
    const tmpl = inspectionTemplates.find(t => t.id === fillTemplateId);
    if (!tmpl || fillItems.length === 0) return;
    addInspectionRecord({
      templateId: tmpl.id,
      templateName: tmpl.name,
      equipmentId: id!,
      date: new Date().toISOString().split('T')[0],
      technician: fillTechnician || undefined,
      items: fillItems,
      notes: fillNotes || undefined,
    });
    setShowFillModal(false);
  }

  // ---- Operator note handlers ----
  function saveNote() {
    if (!noteForm.note.trim()) return;
    addOperatorNote({
      equipmentId: id!,
      date: new Date().toISOString().split('T')[0],
      note: noteForm.note,
      severity: noteForm.severity,
      author: noteForm.author || undefined,
      resolved: false,
    });
    setShowNoteModal(false);
    setNoteForm({ note: '', severity: 'info', author: '' });
  }

  // ---- Guide handlers ----
  function openAddGuide() {
    setEditingGuide(null);
    setGuideForm({ title: '', category: 'pre_op', content: '' });
    setShowGuideModal(true);
  }
  function openEditGuide(g: OperationalInstruction) {
    setEditingGuide(g);
    setGuideForm({ title: g.title, category: g.category, content: g.content });
    setShowGuideModal(true);
  }
  function saveGuide() {
    if (!guideForm.title.trim() || !guideForm.content.trim()) return;
    if (editingGuide) {
      updateInstruction({ ...editingGuide, ...guideForm });
    } else {
      addInstruction({ ...guideForm, equipmentId: id! });
    }
    setShowGuideModal(false);
  }

  // ---- Tab nav ----
  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'parts', label: 'Parts List' },
    { key: 'inspections', label: 'Inspections' },
    { key: 'notes', label: 'Operator Notes' },
    { key: 'howto', label: 'How-To' },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Back button */}
      <button
        onClick={() => navigate('/equipment')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft size={15} /> Equipment
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{eq.name}</h1>
            <EquipmentStatusBadge status={eq.status} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {eq.make} {eq.model}{eq.year ? ` · ${eq.year}` : ''}
            {eq.hoursOrMiles !== undefined ? ` · ${eq.hoursOrMiles.toLocaleString()} ${eq.hoursOrMilesLabel ?? 'Hours'}` : ''}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`whitespace-nowrap py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === t.key
                  ? 'border-[#367C2B] text-[#367C2B]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ===== OVERVIEW TAB ===== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Info grid */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><List size={16} /> Equipment Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Category', value: eq.category },
                { label: 'Make', value: eq.make },
                { label: 'Model', value: eq.model },
                { label: 'Year', value: eq.year?.toString() },
                { label: 'Serial Number', value: eq.serialNumber },
                { label: eq.hoursOrMilesLabel ?? 'Hours', value: eq.hoursOrMiles?.toLocaleString() },
                { label: 'Last Service', value: eq.lastServiceDate ? format(new Date(eq.lastServiceDate), 'MMM d, yyyy') : undefined },
                { label: 'Next Service Due', value: eq.nextServiceDue ? format(new Date(eq.nextServiceDue), 'MMM d, yyyy') : undefined },
              ].filter(r => r.value).map(r => (
                <div key={r.label} className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">{r.label}</span>
                  <span className="font-medium text-gray-900">{r.value}</span>
                </div>
              ))}
              {eq.notes && (
                <div className="sm:col-span-2 py-1.5 border-b border-gray-50">
                  <span className="text-gray-500 block mb-1">Notes</span>
                  <p className="text-gray-700">{eq.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Open work orders */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Wrench size={16} /> Open Work Orders ({openWorkOrders.length})</h2>
            {openWorkOrders.length === 0 ? (
              <p className="text-sm text-gray-400">No open work orders.</p>
            ) : (
              <div className="space-y-2">
                {openWorkOrders.map(wo => (
                  <div key={wo.id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 text-sm">
                    <span className="font-medium text-gray-800">{wo.title}</span>
                    <span className="text-xs text-gray-500 capitalize">{wo.status.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unresolved operator notes */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><StickyNote size={16} /> Open Operator Notes ({unresolvedNotes.length})</h2>
            {unresolvedNotes.length === 0 ? (
              <p className="text-sm text-gray-400">No open notes.</p>
            ) : (
              <div className="space-y-2">
                {unresolvedNotes.map(n => (
                  <div key={n.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${SEVERITY_CONFIG[n.severity].cls}`}>
                      {SEVERITY_CONFIG[n.severity].label}
                    </span>
                    <p className="text-gray-700">{n.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== PARTS LIST TAB ===== */}
      {activeTab === 'parts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Parts List ({myParts.length})</h2>
            <button onClick={openAddPart} className="btn-primary"><Plus size={15} /> Add Part</button>
          </div>
          {myParts.length === 0 ? (
            <div className="card p-10 text-center text-gray-400 text-sm">No parts added yet.</div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Part #</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Interval (hrs)</th>
                    <th className="px-4 py-3 text-left">Last Replaced</th>
                    <th className="px-4 py-3 text-left">Notes</th>
                    <th className="px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myParts.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{p.partNumber}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{p.description}</td>
                      <td className="px-4 py-3 text-gray-600">{p.category}</td>
                      <td className="px-4 py-3 text-gray-600">{p.intervalHours ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.lastReplaced ? format(new Date(p.lastReplaced), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate">{p.notes ?? '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEditPart(p)} className="p-1.5 rounded text-gray-400 hover:bg-gray-100"><Edit2 size={14} /></button>
                          <button onClick={() => deleteEquipmentPart(p.id)} className="p-1.5 rounded text-red-400 hover:bg-red-50"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== INSPECTIONS TAB ===== */}
      {activeTab === 'inspections' && (
        <div className="space-y-6">
          {/* Templates section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2"><ClipboardCheck size={16} /> Templates ({myTemplates.length})</h2>
              <button onClick={() => { setTemplateName(''); setTemplateItems([]); setShowTemplateModal(true); }} className="btn-primary"><Plus size={15} /> New Template</button>
            </div>
            {myTemplates.length === 0 ? (
              <div className="card p-8 text-center text-gray-400 text-sm">No templates yet.</div>
            ) : (
              <div className="space-y-2">
                {myTemplates.map(tmpl => {
                  const expanded = expandedTemplates.has(tmpl.id);
                  return (
                    <div key={tmpl.id} className="card">
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer"
                        onClick={() => setExpandedTemplates(prev => {
                          const n = new Set(prev);
                          expanded ? n.delete(tmpl.id) : n.add(tmpl.id);
                          return n;
                        })}
                      >
                        <div className="flex items-center gap-2">
                          {expanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                          <span className="font-medium text-gray-900">{tmpl.name}</span>
                          <span className="text-xs text-gray-500">({tmpl.items.length} items)</span>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); deleteInspectionTemplate(tmpl.id); }}
                          className="p-1.5 rounded text-red-400 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {expanded && (
                        <div className="px-4 pb-4 space-y-1.5 border-t border-gray-100 pt-3">
                          {tmpl.items.map(item => (
                            <div key={item.id} className="flex items-start gap-3 text-sm">
                              <Circle size={14} className="text-gray-300 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="text-gray-800">{item.label}</span>
                                {item.partNumber && <span className="ml-2 text-xs text-gray-400 font-mono">#{item.partNumber}</span>}
                                {item.notes && <p className="text-xs text-gray-500 mt-0.5">{item.notes}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Completed inspections section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Completed Inspections ({myRecords.length})</h2>
              <button
                onClick={openFillModal}
                disabled={myTemplates.length === 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={15} /> Fill Out Inspection
              </button>
            </div>
            {myRecords.length === 0 ? (
              <div className="card p-8 text-center text-gray-400 text-sm">No completed inspections yet.</div>
            ) : (
              <div className="space-y-2">
                {myRecords.map(rec => {
                  const expanded = expandedRecords.has(rec.id);
                  return (
                    <div key={rec.id} className="card">
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer"
                        onClick={() => setExpandedRecords(prev => {
                          const n = new Set(prev);
                          expanded ? n.delete(rec.id) : n.add(rec.id);
                          return n;
                        })}
                      >
                        <div className="flex items-center gap-2">
                          {expanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                          <div>
                            <span className="font-medium text-gray-900">{rec.templateName}</span>
                            <span className="text-xs text-gray-500 ml-2">{format(new Date(rec.date), 'MMM d, yyyy')}</span>
                            {rec.technician && <span className="text-xs text-gray-500 ml-2">· {rec.technician}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{rec.items.length} items</span>
                          <button
                            onClick={e => { e.stopPropagation(); deleteInspectionRecord(rec.id); }}
                            className="p-1.5 rounded text-red-400 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {expanded && (
                        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-2">
                          {rec.items.map(item => (
                            <div key={item.itemId} className="flex items-start gap-3 text-sm">
                              {item.status === 'ok' || item.status === 'na'
                                ? <CheckCircle2 size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                                : item.status === 'needs_attention'
                                  ? <AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                                  : <CheckCircle2 size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
                              }
                              <div className="flex-1">
                                <span className="text-gray-800">{item.label}</span>
                                <span className={`ml-2 text-xs font-medium ${item.status === 'needs_attention' ? 'text-red-600' : 'text-gray-500'}`}>
                                  {ITEM_STATUS_LABELS[item.status]}
                                </span>
                                {item.partNumberUsed && <span className="ml-2 text-xs text-gray-400 font-mono">#{item.partNumberUsed}</span>}
                                {item.notes && <p className="text-xs text-gray-500 mt-0.5">{item.notes}</p>}
                              </div>
                            </div>
                          ))}
                          {rec.notes && <p className="text-xs text-gray-500 pt-2 border-t border-gray-100 mt-2">{rec.notes}</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== OPERATOR NOTES TAB ===== */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><StickyNote size={16} /> Operator Notes ({myNotes.length})</h2>
            <button onClick={() => setShowNoteModal(true)} className="btn-primary"><Plus size={15} /> Add Note</button>
          </div>
          {myNotes.length === 0 ? (
            <div className="card p-10 text-center text-gray-400 text-sm">No notes yet.</div>
          ) : (
            <div className="space-y-3">
              {[...unresolvedNotes, ...resolvedNotes].map(n => (
                <div key={n.id} className={`card p-4 ${n.resolved ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 mt-0.5 ${SEVERITY_CONFIG[n.severity].cls}`}>
                        {SEVERITY_CONFIG[n.severity].label}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{n.note}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {format(new Date(n.date), 'MMM d, yyyy')}
                          {n.author ? ` · ${n.author}` : ''}
                          {n.resolved && n.resolvedDate ? ` · Resolved ${format(new Date(n.resolvedDate), 'MMM d, yyyy')}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => resolveOperatorNote(n.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${n.resolved ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                      >
                        {n.resolved ? 'Unresolve' : 'Resolve'}
                      </button>
                      <button onClick={() => deleteOperatorNote(n.id)} className="p-1.5 rounded text-red-400 hover:bg-red-50"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== HOW-TO TAB ===== */}
      {activeTab === 'howto' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><BookOpen size={16} /> How-To Guides ({myInstructions.length})</h2>
            <button onClick={openAddGuide} className="btn-primary"><Plus size={15} /> Add Guide</button>
          </div>
          {myInstructions.length === 0 ? (
            <div className="card p-10 text-center text-gray-400 text-sm">No guides yet.</div>
          ) : (
            <div className="space-y-6">
              {INSTRUCTION_CATEGORIES.map(cat => {
                const guides = myInstructions.filter(i => i.category === cat.value);
                if (guides.length === 0) return null;
                return (
                  <div key={cat.value}>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{cat.label}</h3>
                    <div className="space-y-3">
                      {guides.map(g => (
                        <div key={g.id} className="card p-4">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-gray-900">{g.title}</h4>
                            <div className="flex gap-1 flex-shrink-0">
                              <button onClick={() => openEditGuide(g)} className="p-1.5 rounded text-gray-400 hover:bg-gray-100"><Edit2 size={14} /></button>
                              <button onClick={() => deleteInstruction(g.id)} className="p-1.5 rounded text-red-400 hover:bg-red-50"><Trash2 size={14} /></button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{g.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===== MODALS ===== */}

      {/* Part add/edit modal */}
      {showPartModal && (
        <Modal title={editingPart ? 'Edit Part' : 'Add Part'} onClose={() => setShowPartModal(false)} size="lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Part Number *</label>
              <input className="input" value={partForm.partNumber} onChange={e => setPartForm(f => ({ ...f, partNumber: e.target.value }))} placeholder="e.g. RE504836" />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="select" value={partForm.category} onChange={e => setPartForm(f => ({ ...f, category: e.target.value }))}>
                {PART_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description *</label>
              <input className="input" value={partForm.description} onChange={e => setPartForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Engine Oil Filter" />
            </div>
            <div>
              <label className="label">Interval Hours</label>
              <input type="number" min="0" className="input" value={partForm.intervalHours ?? ''} onChange={e => setPartForm(f => ({ ...f, intervalHours: e.target.value ? parseInt(e.target.value) : undefined }))} placeholder="e.g. 500" />
            </div>
            <div>
              <label className="label">Last Replaced</label>
              <input type="date" className="input" value={partForm.lastReplaced ?? ''} onChange={e => setPartForm(f => ({ ...f, lastReplaced: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Notes</label>
              <input className="input" value={partForm.notes ?? ''} onChange={e => setPartForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button className="btn-secondary" onClick={() => setShowPartModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={savePart} disabled={!partForm.partNumber.trim() || !partForm.description.trim()}>
              {editingPart ? 'Save Changes' : 'Add Part'}
            </button>
          </div>
        </Modal>
      )}

      {/* New template modal */}
      {showTemplateModal && (
        <Modal title="New Inspection Template" onClose={() => setShowTemplateModal(false)} size="xl">
          <div className="space-y-4">
            <div>
              <label className="label">Template Name *</label>
              <input className="input" value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="e.g. Spring Pre-Season Check" />
            </div>
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Add Items</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="label">Item Label *</label>
                  <input className="input" value={newItemLabel} onChange={e => setNewItemLabel(e.target.value)} placeholder="e.g. Check engine oil" />
                </div>
                <div>
                  <label className="label">Part # (optional)</label>
                  <input className="input" value={newItemPartNumber} onChange={e => setNewItemPartNumber(e.target.value)} placeholder="e.g. RE504836" />
                </div>
                <div>
                  <label className="label">Notes (optional)</label>
                  <input className="input" value={newItemNotes} onChange={e => setNewItemNotes(e.target.value)} placeholder="Optional" />
                </div>
              </div>
              <button className="btn-secondary" onClick={addTemplateItem} disabled={!newItemLabel.trim()}>
                <Plus size={14} /> Add Item
              </button>
              {templateItems.length > 0 && (
                <ul className="space-y-1.5 pt-2">
                  {templateItems.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
                      <Circle size={12} className="text-gray-300 flex-shrink-0" />
                      <span className="flex-1 text-gray-800">{item.label}</span>
                      {item.partNumber && <span className="text-xs text-gray-400 font-mono">#{item.partNumber}</span>}
                      <button onClick={() => removeTemplateItem(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button className="btn-secondary" onClick={() => setShowTemplateModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={saveTemplate} disabled={!templateName.trim() || templateItems.length === 0}>
              Save Template
            </button>
          </div>
        </Modal>
      )}

      {/* Fill inspection modal */}
      {showFillModal && (
        <Modal title="Fill Out Inspection" onClose={() => setShowFillModal(false)} size="xl">
          <div className="space-y-4">
            <div>
              <label className="label">Template *</label>
              <select className="select" value={fillTemplateId} onChange={e => onSelectTemplate(e.target.value)}>
                <option value="">Select a template...</option>
                {myTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            {fillItems.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Inspection Items</h3>
                {fillItems.map((item, idx) => (
                  <div key={item.itemId} className="border border-gray-200 rounded-xl p-3 space-y-2">
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="label">Status</label>
                        <select className="select" value={item.status} onChange={e => updateFillItem(idx, 'status', e.target.value)}>
                          {Object.entries(ITEM_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label">Part # Used</label>
                        <input className="input" value={item.partNumberUsed ?? ''} onChange={e => updateFillItem(idx, 'partNumberUsed', e.target.value)} placeholder="Part number" />
                      </div>
                      <div>
                        <label className="label">Notes</label>
                        <input className="input" value={item.notes ?? ''} onChange={e => updateFillItem(idx, 'notes', e.target.value)} placeholder="Optional notes" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <label className="label">Technician</label>
                <input className="input" value={fillTechnician} onChange={e => setFillTechnician(e.target.value)} placeholder="Technician name" />
              </div>
              <div>
                <label className="label">Overall Notes</label>
                <input className="input" value={fillNotes} onChange={e => setFillNotes(e.target.value)} placeholder="Any overall notes" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button className="btn-secondary" onClick={() => setShowFillModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={saveFillInspection} disabled={!fillTemplateId || fillItems.length === 0}>
              Save Inspection
            </button>
          </div>
        </Modal>
      )}

      {/* Add note modal */}
      {showNoteModal && (
        <Modal title="Add Operator Note" onClose={() => setShowNoteModal(false)} size="md">
          <div className="space-y-4">
            <div>
              <label className="label">Note *</label>
              <textarea
                className="textarea"
                rows={3}
                value={noteForm.note}
                onChange={e => setNoteForm(f => ({ ...f, note: e.target.value }))}
                placeholder="Describe the observation..."
              />
            </div>
            <div>
              <label className="label">Severity</label>
              <select className="select" value={noteForm.severity} onChange={e => setNoteForm(f => ({ ...f, severity: e.target.value as OperatorNote['severity'] }))}>
                <option value="info">Info</option>
                <option value="watch">Watch</option>
                <option value="fix_winter">Fix This Winter</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="label">Author (optional)</label>
              <input className="input" value={noteForm.author} onChange={e => setNoteForm(f => ({ ...f, author: e.target.value }))} placeholder="Your name" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button className="btn-secondary" onClick={() => setShowNoteModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={saveNote} disabled={!noteForm.note.trim()}>Add Note</button>
          </div>
        </Modal>
      )}

      {/* Add/Edit guide modal */}
      {showGuideModal && (
        <Modal title={editingGuide ? 'Edit Guide' : 'Add How-To Guide'} onClose={() => setShowGuideModal(false)} size="xl">
          <div className="space-y-4">
            <div>
              <label className="label">Title *</label>
              <input className="input" value={guideForm.title} onChange={e => setGuideForm(f => ({ ...f, title: e.target.value }))} placeholder="Guide title" />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="select" value={guideForm.category} onChange={e => setGuideForm(f => ({ ...f, category: e.target.value as OperationalInstruction['category'] }))}>
                {INSTRUCTION_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Content *</label>
              <textarea
                className="textarea"
                rows={8}
                value={guideForm.content}
                onChange={e => setGuideForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Step-by-step instructions or information..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button className="btn-secondary" onClick={() => setShowGuideModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={saveGuide} disabled={!guideForm.title.trim() || !guideForm.content.trim()}>
              {editingGuide ? 'Save Changes' : 'Add Guide'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

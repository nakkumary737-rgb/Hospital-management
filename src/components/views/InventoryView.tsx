import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { InventoryItem, InventoryCategory, DosageForm } from '../../types';
import {
  Package,
  Search,
  PlusCircle,
  Filter,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit,
  Layers,
  Tag,
  Stethoscope,
  Pill,
  Activity,
  Check,
  X,
  Syringe,
  Droplets,
  FlaskConical,
  Bandage,
  LayoutGrid,
  List,
  Copy,
  Plus,
  Minus,
  Sparkles,
  ArrowUpDown,
  SlidersHorizontal,
  Box
} from 'lucide-react';

/**
 * Helper to auto-detect dosage form for items where it hasn't been explicitly assigned
 */
export function detectDosageForm(item: InventoryItem): DosageForm {
  if (item.dosageForm) return item.dosageForm;
  const n = (item.name || '').toLowerCase();
  const u = (item.unit || '').toLowerCase();
  const c = item.category;

  if (n.includes('inj') || n.includes('vial') || n.includes('ampoule') || u.includes('vial') || u.includes('ampoule')) {
    return 'Injectable';
  }
  if (n.includes('cap') || u.includes('capsule') || n.includes('capsule')) {
    return 'Capsule';
  }
  if (n.includes('tab') || u.includes('strip') || u.includes('tablets') || n.includes('tablet')) {
    return 'Tablet';
  }
  if (
    n.includes('cream') ||
    n.includes('ointment') ||
    n.includes('gel') ||
    n.includes('drops') ||
    n.includes('lotion') ||
    n.includes('topical') ||
    n.includes('iodine') ||
    n.includes('betadine')
  ) {
    return 'Topical';
  }
  if (
    n.includes('syrup') ||
    n.includes('suspension') ||
    n.includes('linctus') ||
    n.includes('oral liquid') ||
    n.includes('ors') ||
    n.includes('mixture')
  ) {
    return 'Syrup';
  }
  if (
    n.includes('iv ') ||
    n.includes('infusion') ||
    n.includes('saline') ||
    n.includes('ringer') ||
    n.includes('dextrose') ||
    n.includes('fluid')
  ) {
    return 'IV Fluid';
  }
  if (
    c === 'Supplies' ||
    n.includes('syringe') ||
    n.includes('needle') ||
    n.includes('cannula') ||
    n.includes('gauze') ||
    n.includes('bandage') ||
    n.includes('glove')
  ) {
    return 'Supply';
  }
  if (
    c === 'Consultation' ||
    c === 'Laboratory' ||
    c === 'Procedure' ||
    n.includes('test') ||
    n.includes('scan') ||
    n.includes('rdt') ||
    n.includes('consultation')
  ) {
    return 'Diagnostic';
  }
  return 'Other';
}

interface DosageFormConfig {
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  borderHover: string;
  description: string;
}

const DOSAGE_CONFIG: Record<DosageForm, DosageFormConfig> = {
  Injectable: {
    label: 'Injectables',
    shortLabel: 'Injectable',
    icon: Syringe,
    accentColor: 'text-teal-600',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-800 border-teal-200',
    borderHover: 'hover:border-teal-400',
    description: 'Vials, ampoules & parenteral injections'
  },
  Tablet: {
    label: 'Tablets (Tabs)',
    shortLabel: 'Tabs',
    icon: Pill,
    accentColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800 border-emerald-200',
    borderHover: 'hover:border-emerald-400',
    description: 'Oral solid tablets, strips & caplets'
  },
  Capsule: {
    label: 'Capsules (Caps)',
    shortLabel: 'Caps',
    icon: Layers,
    accentColor: 'text-indigo-600',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800 border-indigo-200',
    borderHover: 'hover:border-indigo-400',
    description: 'Gelatin capsules & blister packs'
  },
  Topical: {
    label: 'Topical & Drops',
    shortLabel: 'Topical',
    icon: Droplets,
    accentColor: 'text-rose-600',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-800 border-rose-200',
    borderHover: 'hover:border-rose-400',
    description: 'Creams, ointments, eye/ear drops & antiseptics'
  },
  Syrup: {
    label: 'Syrups & Suspensions',
    shortLabel: 'Syrup / Susp',
    icon: FlaskConical,
    accentColor: 'text-amber-600',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800 border-amber-200',
    borderHover: 'hover:border-amber-400',
    description: 'Pediatric oral liquids, suspensions & ORS'
  },
  'IV Fluid': {
    label: 'IV Fluids & Infusions',
    shortLabel: 'IV Infusion',
    icon: Droplets,
    accentColor: 'text-sky-600',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-800 border-sky-200',
    borderHover: 'hover:border-sky-400',
    description: 'Crystalloids, normal saline & Hartmanns bottles'
  },
  Supply: {
    label: 'Medical Supplies',
    shortLabel: 'Supply',
    icon: Bandage,
    accentColor: 'text-slate-600',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800 border-slate-200',
    borderHover: 'hover:border-slate-400',
    description: 'Cannulas, syringes, sterile gauze & consumables'
  },
  Diagnostic: {
    label: 'Consults & Diagnostics',
    shortLabel: 'Diagnostic',
    icon: Stethoscope,
    accentColor: 'text-purple-600',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-800 border-purple-200',
    borderHover: 'hover:border-purple-400',
    description: 'OPD reviews, lab panels & clinical sonography'
  },
  Other: {
    label: 'Other Items',
    shortLabel: 'Other',
    icon: Box,
    accentColor: 'text-slate-600',
    badgeBg: 'bg-slate-50',
    badgeText: 'text-slate-700 border-slate-200',
    borderHover: 'hover:border-slate-300',
    description: 'Miscellaneous clinic supplies & items'
  }
};

type ViewMode = 'tiles' | 'table';
type StockFilter = 'ALL' | 'LOW' | 'OUT' | 'COVERED';

export const InventoryView: React.FC = () => {
  const {
    inventoryItems,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    confirmAction,
    showToast
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForm, setSelectedForm] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<StockFilter>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('tiles');
  const [groupByForm, setGroupByForm] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'stock'>('name');

  // Add / Edit Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<InventoryCategory>('Pharmacy');
  const [formDosage, setFormDosage] = useState<DosageForm>('Tablet');
  const [formPrice, setFormPrice] = useState<number>(10000);
  const [formStock, setFormStock] = useState<number>(100);
  const [formUnit, setFormUnit] = useState('pack');
  const [formCovered, setFormCovered] = useState(true);
  const [formDesc, setFormDesc] = useState('');

  // Quick Stock refill state modal
  const [stockRefillItem, setStockRefillItem] = useState<InventoryItem | null>(null);
  const [refillQuantity, setRefillQuantity] = useState<number>(50);

  const openAddModal = () => {
    setEditingItem(null);
    setFormCode(`INV-${Math.floor(100 + Math.random() * 900)}`);
    setFormName('');
    setFormCategory('Pharmacy');
    setFormDosage('Tablet');
    setFormPrice(10000);
    setFormStock(100);
    setFormUnit('pack');
    setFormCovered(true);
    setFormDesc('');
    setShowAddModal(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormCode(item.code);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormDosage(detectDosageForm(item));
    setFormPrice(item.unitPrice);
    setFormStock(item.stockQuantity);
    setFormUnit(item.unit);
    setFormCovered(item.isCoveredByDefault);
    setFormDesc(item.description || '');
    setShowAddModal(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Please enter an item or service name.', 'error');
      return;
    }

    if (editingItem) {
      updateInventoryItem({
        ...editingItem,
        code: formCode,
        name: formName,
        category: formCategory,
        dosageForm: formDosage,
        unitPrice: formPrice,
        stockQuantity: formStock,
        unit: formUnit,
        isCoveredByDefault: formCovered,
        description: formDesc
      });
      showToast(`Updated "${formName}" successfully!`, 'success');
    } else {
      addInventoryItem({
        code: formCode,
        name: formName,
        category: formCategory,
        dosageForm: formDosage,
        unitPrice: formPrice,
        stockQuantity: formStock,
        unit: formUnit,
        isCoveredByDefault: formCovered,
        description: formDesc,
        isActive: true
      });
      showToast(`Added new item "${formName}" (${formDosage}) to clinic inventory!`, 'success');
    }

    setShowAddModal(false);
  };

  const handleDelete = (item: InventoryItem) => {
    confirmAction({
      title: 'Delete Inventory Item',
      message: `Are you sure you want to delete ${item.name} (${item.code}) from inventory? It will no longer be selectable for patient billing.`,
      confirmLabel: 'Delete Item',
      variant: 'danger',
      onConfirm: () => {
        deleteInventoryItem(item.id);
        showToast(`${item.name} removed from inventory.`, 'info');
      }
    });
  };

  const handleQuickAdjustStock = (item: InventoryItem, delta: number) => {
    const nextStock = Math.max(0, item.stockQuantity + delta);
    updateInventoryItem({
      ...item,
      stockQuantity: nextStock
    });
    showToast(`Updated stock for ${item.name} to ${nextStock} ${item.unit}.`, 'info');
  };

  const handleApplyRefill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockRefillItem) return;
    const nextStock = Math.max(0, stockRefillItem.stockQuantity + refillQuantity);
    updateInventoryItem({
      ...stockRefillItem,
      stockQuantity: nextStock
    });
    showToast(`Added +${refillQuantity} to ${stockRefillItem.name}. New stock: ${nextStock} ${stockRefillItem.unit}`, 'success');
    setStockRefillItem(null);
  };

  // Counts by formulation
  const countsByForm = useMemo(() => {
    const map: Record<string, number> = { ALL: inventoryItems.length };
    inventoryItems.forEach(item => {
      const form = detectDosageForm(item);
      map[form] = (map[form] || 0) + 1;
    });
    return map;
  }, [inventoryItems]);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return inventoryItems
      .filter(item => {
        const itemForm = detectDosageForm(item);
        const matchesForm = selectedForm === 'ALL' || itemForm === selectedForm;

        const term = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !term ||
          item.name.toLowerCase().includes(term) ||
          item.code.toLowerCase().includes(term) ||
          itemForm.toLowerCase().includes(term) ||
          item.unit.toLowerCase().includes(term) ||
          (item.description && item.description.toLowerCase().includes(term));

        let matchesStock = true;
        if (stockFilter === 'LOW') {
          matchesStock = item.stockQuantity < 30 && item.stockQuantity > 0 && item.category !== 'Consultation';
        } else if (stockFilter === 'OUT') {
          matchesStock = item.stockQuantity === 0 && item.category !== 'Consultation';
        } else if (stockFilter === 'COVERED') {
          matchesStock = item.isCoveredByDefault;
        }

        return matchesForm && matchesSearch && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'price-asc') return a.unitPrice - b.unitPrice;
        if (sortBy === 'price-desc') return b.unitPrice - a.unitPrice;
        if (sortBy === 'stock') return a.stockQuantity - b.stockQuantity;
        return 0;
      });
  }, [inventoryItems, selectedForm, searchTerm, stockFilter, sortBy]);

  // Grouped items by dosage form
  const groupedSections = useMemo(() => {
    if (!groupByForm) return null;
    const groups: { form: DosageForm; config: DosageFormConfig; items: InventoryItem[] }[] = [];
    const order: DosageForm[] = [
      'Injectable',
      'Tablet',
      'Capsule',
      'Topical',
      'Syrup',
      'IV Fluid',
      'Supply',
      'Diagnostic',
      'Other'
    ];

    order.forEach(form => {
      const formItems = filteredItems.filter(i => detectDosageForm(i) === form);
      if (formItems.length > 0) {
        groups.push({
          form,
          config: DOSAGE_CONFIG[form],
          items: formItems
        });
      }
    });

    return groups;
  }, [groupByForm, filteredItems]);

  // Summary Metrics
  const totalItems = inventoryItems.length;
  const lowStockCount = inventoryItems.filter(
    i => i.stockQuantity < 30 && i.stockQuantity > 0 && i.category !== 'Consultation'
  ).length;
  const outOfStockCount = inventoryItems.filter(
    i => i.stockQuantity === 0 && i.category !== 'Consultation'
  ).length;

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    showToast(`Copied code "${code}" to clipboard!`, 'info');
  };

  // Render a Single Tile
  const renderItemTile = (item: InventoryItem) => {
    const form = detectDosageForm(item);
    const config = DOSAGE_CONFIG[form];
    const Icon = config.icon;

    const isLow = item.stockQuantity < 30 && item.stockQuantity > 0 && item.category !== 'Consultation';
    const isOut = item.stockQuantity === 0 && item.category !== 'Consultation';
    const isService = item.stockQuantity >= 900 || item.category === 'Consultation';

    // Stock meter fill percentage
    const stockPct = isService ? 100 : Math.min(100, Math.round((item.stockQuantity / 150) * 100));

    return (
      <div
        key={item.id}
        className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group ${config.borderHover}`}
      >
        {/* Top Header Card Accent */}
        <div className="p-4 pb-3 border-b border-slate-100 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            {/* Formulation Badge */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${config.badgeBg} ${config.badgeText}`}>
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{config.shortLabel}</span>
            </div>

            {/* Item Code (Click to Copy) */}
            <button
              onClick={() => handleCopyCode(item.code)}
              title="Click to copy item code"
              className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 transition-colors"
            >
              <span>{item.code}</span>
              <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100" />
            </button>
          </div>

          {/* Item Name */}
          <div>
            <h3 className="font-black text-slate-900 text-sm leading-snug line-clamp-2" title={item.name}>
              {item.name}
            </h3>
            {item.description ? (
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed" title={item.description}>
                {item.description}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 italic mt-1">{config.description}</p>
            )}
          </div>
        </div>

        {/* Pricing & Benefit Section */}
        <div className="p-4 py-3 bg-slate-50/50 space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Price</span>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xs text-slate-500 font-bold">UGX</span>
                <span className="text-base font-black text-slate-900">
                  {item.unitPrice.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400">/{item.unit}</span>
              </div>
            </div>

            {/* Package Coverage Indicator (Zero-pill clean design) */}
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Coverage</span>
              {item.isCoveredByDefault ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span>Covered</span>
                </span>
              ) : (
                <span className="text-[11px] font-medium text-slate-500">
                  Self-Pay Copay
                </span>
              )}
            </div>
          </div>

          {/* Stock Meter Level */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-medium">
                {isService ? 'Service Availability' : 'In Stock'}
              </span>

              {isOut ? (
                <span className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Out of Stock</span>
                </span>
              ) : isLow ? (
                <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{item.stockQuantity} {item.unit} (Low)</span>
                </span>
              ) : isService ? (
                <span className="text-[11px] font-bold text-blue-700">
                  On-Demand Available
                </span>
              ) : (
                <span className="font-mono font-bold text-slate-800 text-[11px]">
                  {item.stockQuantity} {item.unit}
                </span>
              )}
            </div>

            {/* Visual stock bar */}
            {!isService && (
              <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all rounded-full ${
                    isOut ? 'bg-red-500 w-0' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${stockPct}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Controls & Refill Bar */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          {/* Quick Adjust Buttons */}
          {!isService ? (
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
              <button
                onClick={() => handleQuickAdjustStock(item, -5)}
                disabled={item.stockQuantity <= 0}
                title="Deduct 5 units"
                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-40 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={() => setStockRefillItem(item)}
                title="Refill stock"
                className="px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700 hover:text-slate-900 hover:bg-white rounded transition-colors"
              >
                Stock
              </button>
              <button
                onClick={() => handleQuickAdjustStock(item, 10)}
                title="Add 10 units"
                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 font-mono">Service SKU</span>
          )}

          {/* Edit / Delete Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => openEditModal(item)}
              title="Edit item catalog"
              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(item)}
              title="Delete item"
              className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Clinic Inventory &amp; Formulation Catalog
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Live Stock &amp; Dispensing
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Classified by pharmaceutical formulation: Injectables, Tablets, Capsules, Topical, Oral Liquids &amp; IV Infusions
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={openAddModal}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Billable Item</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Total Catalog Items
          </span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">
            {totalItems}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">All medicines &amp; clinical services</span>
        </div>

        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 shadow-2xs">
          <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider block">
            Parenteral &amp; Injectables
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-black text-teal-950 font-mono">
              {(countsByForm['Injectable'] || 0) + (countsByForm['IV Fluid'] || 0)}
            </span>
            <span className="text-[11px] text-teal-700 font-medium">
              Vials, ampoules &amp; IV fluids
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 shadow-2xs">
          <span className="text-[10px] text-indigo-800 font-bold uppercase tracking-wider block">
            Solid Orals (Tabs &amp; Caps)
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-black text-indigo-950 font-mono">
              {(countsByForm['Tablet'] || 0) + (countsByForm['Capsule'] || 0)}
            </span>
            <span className="text-[11px] text-indigo-700 font-medium">
              Tablets &amp; capsules
            </span>
          </div>
        </div>

        <div
          onClick={() => setStockFilter(stockFilter === 'LOW' ? 'ALL' : 'LOW')}
          className={`p-4 rounded-2xl border shadow-2xs cursor-pointer transition-all ${
            stockFilter === 'LOW'
              ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-400'
              : 'bg-amber-50 border-amber-200 hover:bg-amber-100/70'
          }`}
        >
          <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block flex items-center justify-between">
            <span>Low Stock Alert</span>
            <span className="text-[10px] underline font-bold">Filter</span>
          </span>
          <span className="text-2xl font-black text-amber-950 font-mono mt-0.5 block">
            {lowStockCount}
          </span>
          <span className="text-[11px] text-amber-700 font-medium">
            &lt; 30 units remaining {outOfStockCount > 0 ? `(${outOfStockCount} out)` : ''}
          </span>
        </div>
      </div>

      {/* FORMULATION ARRANGEMENT TABS (The Requested Feature: Injectable, Tabs, Caps, Topical, etc.) */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Formulation / Dosage Arrangement</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGroupByForm(!groupByForm)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1.5 ${
                groupByForm
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{groupByForm ? 'Grouped by Section' : 'Group by Formulation'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {/* ALL Tab */}
          <button
            onClick={() => setSelectedForm('ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              selectedForm === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>All Items</span>
            <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-white/20 font-mono">
              {countsByForm['ALL'] || 0}
            </span>
          </button>

          {/* Form Tabs: Injectable, Tablet, Capsule, Topical, Syrup, IV Fluid, Supply, Diagnostic */}
          {(
            [
              'Injectable',
              'Tablet',
              'Capsule',
              'Topical',
              'Syrup',
              'IV Fluid',
              'Supply',
              'Diagnostic'
            ] as DosageForm[]
          ).map(formKey => {
            const cfg = DOSAGE_CONFIG[formKey];
            const FormIcon = cfg.icon;
            const count = countsByForm[formKey] || 0;
            const isActive = selectedForm === formKey;

            return (
              <button
                key={formKey}
                onClick={() => setSelectedForm(formKey)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                }`}
              >
                <FormIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : cfg.accentColor}`} />
                <span>{cfg.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                    isActive ? 'bg-white/25 text-white' : 'bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar with View Toggles */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search items by name, code (INJ-CTX, MED-COA), unit, or formulation..."
            className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Refinement Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end flex-wrap">
          {/* Stock Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStockFilter('ALL')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                stockFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Stock
            </button>
            <button
              onClick={() => setStockFilter('LOW')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                stockFilter === 'LOW' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-amber-800'
              }`}
            >
              Low (&lt;30)
            </button>
            <button
              onClick={() => setStockFilter('COVERED')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                stockFilter === 'COVERED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-800'
              }`}
            >
              Package Covered
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 border border-slate-200 rounded-xl px-2 py-1.5 bg-slate-50 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden"
            >
              <option value="name">Name (A-Z)</option>
              <option value="price-asc">Price (Low → High)</option>
              <option value="price-desc">Price (High → Low)</option>
              <option value="stock">Stock Quantity</option>
            </select>
          </div>

          {/* View Mode Toggle: Tiles vs Table */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('tiles')}
              title="Grid of Tiles"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'tiles' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Dense Table List"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT: TILES GRID or TABLE VIEW */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <Package className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <p className="font-bold text-slate-800 text-base">No inventory items match search</p>
          <p className="text-xs text-slate-400 mt-1">
            Try resetting filters or click &ldquo;Add Billable Item&rdquo; to add a new medication or formulation.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedForm('ALL');
              setStockFilter('ALL');
            }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'tiles' ? (
        /* TILES VIEW (GRID) */
        groupByForm && groupedSections ? (
          /* SECTIONED / GROUPED TILES */
          <div className="space-y-8">
            {groupedSections.map(section => {
              const SecIcon = section.config.icon;
              return (
                <div key={section.form} className="space-y-3">
                  {/* Section Title Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${section.config.badgeBg}`}>
                        <SecIcon className={`w-4 h-4 ${section.config.accentColor}`} />
                      </div>
                      <h2 className="text-base font-black text-slate-900">
                        {section.config.label}
                      </h2>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        ({section.items.length} {section.items.length === 1 ? 'item' : 'items'})
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 italic hidden sm:inline">
                      {section.config.description}
                    </span>
                  </div>

                  {/* Tiles Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {section.items.map(renderItemTile)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* FLAT TILES GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(renderItemTile)}
          </div>
        )
      ) : (
        /* TABLE LIST VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Item / Formulation Name</th>
                  <th className="py-3 px-4">Formulation</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4">Unit Price (UGX)</th>
                  <th className="py-3 px-4">Package Benefit</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map(item => {
                  const form = detectDosageForm(item);
                  const cfg = DOSAGE_CONFIG[form];
                  const FormIcon = cfg.icon;
                  const isLow = item.stockQuantity < 30 && item.stockQuantity > 0 && item.category !== 'Consultation';
                  const isOut = item.stockQuantity === 0 && item.category !== 'Consultation';
                  const isService = item.stockQuantity >= 900 || item.category === 'Consultation';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        <button
                          onClick={() => handleCopyCode(item.code)}
                          className="hover:underline flex items-center gap-1"
                          title="Copy Code"
                        >
                          <span>{item.code}</span>
                          <Copy className="w-3 h-3 text-slate-400" />
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 text-xs">{item.name}</p>
                        {item.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1">{item.description}</p>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${cfg.badgeBg} ${cfg.badgeText}`}>
                          <FormIcon className="w-3 h-3 shrink-0" />
                          <span>{cfg.shortLabel}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {isService ? (
                          <span className="text-blue-700 font-bold">On-Demand</span>
                        ) : isOut ? (
                          <span className="text-red-600 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Out of Stock</span>
                          </span>
                        ) : isLow ? (
                          <span className="text-amber-600 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{item.stockQuantity} {item.unit} (Low)</span>
                          </span>
                        ) : (
                          <span className="font-mono font-bold text-slate-800">
                            {item.stockQuantity} {item.unit}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        UGX {item.unitPrice.toLocaleString()}
                      </td>

                      <td className="py-3 px-4">
                        {item.isCoveredByDefault ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Covered</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Self-Pay Copay</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!isService && (
                            <button
                              onClick={() => setStockRefillItem(item)}
                              title="Refill Stock"
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold"
                            >
                              +Stock
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(item)}
                            title="Edit"
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            title="Delete"
                            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QUICK STOCK REFILL MODAL */}
      {stockRefillItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base">Quick Stock Refill</h3>
              </div>
              <button
                onClick={() => setStockRefillItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-mono">{stockRefillItem.code}</span>
              <h4 className="font-bold text-slate-900 text-sm">{stockRefillItem.name}</h4>
              <p className="text-xs text-slate-500">
                Current Stock: <strong className="text-slate-800 font-mono">{stockRefillItem.stockQuantity} {stockRefillItem.unit}</strong>
              </p>
            </div>

            <form onSubmit={handleApplyRefill} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Refill Quantity to Add ({stockRefillItem.unit})
                </label>
                <div className="flex items-center gap-2">
                  {[20, 50, 100, 200].map(qty => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setRefillQuantity(qty)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        refillQuantity === qty
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      +{qty}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  value={refillQuantity}
                  onChange={e => setRefillQuantity(Math.max(1, Number(e.target.value)))}
                  className="mt-2 w-full rounded-xl border border-slate-200 p-2.5 text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-500">New Resulting Stock: </span>
                <strong className="text-slate-900 font-mono">
                  {stockRefillItem.stockQuantity + refillQuantity} {stockRefillItem.unit}
                </strong>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStockRefillItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Confirm Refill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT BILLABLE ITEM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base">
                  {editingItem ? 'Edit Catalog Item' : 'Add New Billable Item'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Item Code</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={e => setFormCode(e.target.value.toUpperCase())}
                    required
                    placeholder="e.g. INJ-CTX, MED-COA"
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Clinic Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as InventoryCategory)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-bold"
                  >
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Procedure">Procedure</option>
                    <option value="Supplies">Supplies</option>
                  </select>
                </div>
              </div>

              {/* Formulation / Dosage Form Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Pharmaceutical Formulation / Dosage Form
                </label>
                <select
                  value={formDosage}
                  onChange={e => setFormDosage(e.target.value as DosageForm)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold bg-slate-50 focus:bg-white"
                >
                  <option value="Injectable">💉 Injectable (Vial, Ampoule, Injection)</option>
                  <option value="Tablet">💊 Tablet / Tabs (Strip, Blister, Box)</option>
                  <option value="Capsule">💊 Capsule / Caps (Hard/Soft Gelatin)</option>
                  <option value="Topical">🧴 Topical (Cream, Ointment, Eye/Ear Drops, Antiseptic)</option>
                  <option value="Syrup">🧪 Syrup &amp; Oral Liquid (Suspension, Linctus, ORS)</option>
                  <option value="IV Fluid">💧 IV Fluid &amp; Infusion (Saline, Hartmanns, D5W)</option>
                  <option value="Supply">🩹 Medical Supply &amp; Consumable (Cannula, Syringe, Gauze)</option>
                  <option value="Diagnostic">🩺 Consultation &amp; Diagnostic Test</option>
                  <option value="Other">📦 Other SKU</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Item / Medicine Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Ceftriaxone 1g Powder for Injection, Coartem 24 tabs"
                  required
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit Price (UGX)</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={e => setFormPrice(Number(e.target.value))}
                    min={0}
                    step={500}
                    required
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={e => setFormStock(Number(e.target.value))}
                    min={0}
                    required
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Packaging Unit</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={e => setFormUnit(e.target.value)}
                    placeholder="e.g. vial, ampoule, strip, pack, bottle, tube"
                    required
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinical Description / Indications</label>
                <textarea
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  rows={2}
                  placeholder="Dosage guidelines, clinical indication, or administration notes..."
                  className="w-full rounded-xl border border-slate-200 p-2.5"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Covered Under Afya Health Package</span>
                  <span className="text-[10px] text-slate-500">
                    If checked, package members receive this item during covered visits without additional copay.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formCovered}
                  onChange={e => setFormCovered(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

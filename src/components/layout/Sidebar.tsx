import React from 'react';
import { useApp } from '../../context/AppContext';
import { AfyaLogo } from '../common/AfyaLogo';
import {
  LayoutDashboard,
  ClipboardList,
  QrCode,
  Users,
  CreditCard,
  Package,
  Activity,
  HeartPulse,
  CalendarCheck,
  Receipt,
  Network,
  BarChart3,
  FileText,
  ShoppingCart
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'pos'
  | 'visits'
  | 'hmis'
  | 'scanner'
  | 'patients'
  | 'cards'
  | 'packages'
  | 'inventory'
  | 'chronic'
  | 'sickle_cell'
  | 'payments'
  | 'partner_portal'
  | 'reports'
  | 'audit';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { currentUser } = useApp();

  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string; roles?: string[] }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'Over-the-Counter POS', icon: ShoppingCart, badge: 'Pharmacy' },
    { id: 'visits', label: 'Cashier & Billing Desk', icon: CalendarCheck, badge: 'Cashier' },
    { id: 'hmis', label: 'HMIS Data Register', icon: ClipboardList, badge: 'Receptionist' },
    { id: 'scanner', label: 'Scan Afya Card', icon: QrCode, badge: 'Intake' },
    { id: 'inventory', label: 'Inventory & Prices', icon: Package, badge: 'Billing' },
    { id: 'cards', label: 'Afya Cards (PVC)', icon: CreditCard },
    { id: 'payments', label: 'Payment Ledger', icon: Receipt, badge: 'Cashier' },
    { id: 'patients', label: 'Patients Registry', icon: Users },
    { id: 'packages', label: 'Package Builder', icon: Package, badge: 'Config' },
    { id: 'chronic', label: 'Chronic Disease Care', icon: Activity },
    { id: 'sickle_cell', label: 'Sickle Cell Care', icon: HeartPulse, badge: 'Clinical' },
    { id: 'partner_portal', label: 'Partner Network', icon: Network, badge: 'Claims' },
    { id: 'reports', label: 'Reports & Export', icon: BarChart3 },
    { id: 'audit', label: 'Audit Trail', icon: FileText }
  ];

  // Role-specific filtering: HMIS data for Receptionist, Visits Management & Ledger for Cashier
  const visibleItems = navItems.filter(item => {
    if (currentUser.role === 'reception') {
      return ['dashboard', 'pos', 'hmis', 'scanner', 'patients', 'cards', 'chronic', 'sickle_cell', 'reports'].includes(item.id);
    }
    if (currentUser.role === 'cashier') {
      return ['dashboard', 'pos', 'visits', 'inventory', 'payments', 'packages', 'scanner', 'cards', 'reports'].includes(item.id);
    }
    if (currentUser.role === 'partner_provider') {
      return ['dashboard', 'scanner', 'partner_portal', 'visits'].includes(item.id);
    }
    return true;
  });

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div className="space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Care Network Menu
          </div>

          {visibleItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-emerald-700/60 text-emerald-100'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Organization Information Badge */}
        <div className="mt-8 p-3 rounded-xl bg-slate-800/60 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-white/10 p-0.5 overflow-hidden flex items-center justify-center shrink-0">
              <AfyaLogo variant="emblem" size="xs" inverted={true} />
            </div>
            <div className="font-bold text-slate-200 text-xs truncate">Afya Medicare Central</div>
          </div>
          <div className="text-slate-400 text-[11px]">Kitende – Mwenda Stage</div>
          <div className="text-slate-500 text-[10px] mt-0.5">Uganda Healthcare Network</div>
          <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-medium">Verified System</span>
            <span className="text-slate-400">v2.6</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

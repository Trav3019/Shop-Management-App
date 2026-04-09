import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Wrench, Package, BookOpen, X } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/work-orders', icon: ClipboardList, label: 'Work Orders' },
  { to: '/equipment', icon: Wrench, label: 'Equipment' },
  { to: '/parts', icon: Package, label: 'Parts Inventory' },
  { to: '/maintenance-log', icon: BookOpen, label: 'Maintenance Log' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-jd-green flex flex-col transition-transform duration-200 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-jd-green-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-jd-yellow rounded-lg flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#367C2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Farm Shop</p>
              <p className="text-jd-green-200 text-xs">Manager</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-jd-green-700 text-white">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-jd-green-100 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-jd-green-700">
          <p className="text-jd-green-300 text-xs">Farm Shop Manager v1.0</p>
        </div>
      </aside>
    </>
  );
}

import React from 'react';
import { Folder, CheckSquare, Clock, X, LayoutGrid, BarChart3, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: 'home' | 'projects' | 'tasks' | 'reports' | 'flutter';
  setScreen: (screen: 'home' | 'projects' | 'tasks' | 'reports' | 'flutter') => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  currentScreen,
  setScreen,
}) => {
  const menuItems = [
    { id: 'home', label: 'Time Entries', icon: Clock },
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'reports', label: 'Reports & Visuals', icon: BarChart3 },
    { id: 'flutter', label: 'Flutter Core Hub', icon: Layers },
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            id="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 z-40 transition-opacity"
          />

          {/* Drawer Panel */}
          <motion.div
            id="drawer-panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 flex flex-col border-r border-slate-200"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-indigo-600 text-white rounded">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900 text-sm leading-none">ChronosSync</h2>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">High Density Engine</p>
                </div>
              </div>
              <button
                id="drawer-close"
                onClick={onClose}
                className="p-1 hover:bg-slate-150 rounded text-slate-400 hover:text-slate-700 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation List */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    id={`menu-item-${item.id}`}
                    key={item.id}
                    onClick={() => {
                      setScreen(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/20 text-[10px] text-slate-400 text-center font-mono space-y-1">
              <div>CHRONOS • v1.1.2_HD</div>
              <div className="text-indigo-650 font-bold">Written by Brian McCarthy</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

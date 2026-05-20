import React, { useState } from 'react';
import { useTimeEntries } from '../TimeEntryContext';
import { Menu, Plus, Trash2, Calendar, Clipboard, Clock, Layers, ListFilter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HomeScreenProps {
  onOpenDrawer: () => void;
  onNavigateToAddEntry: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenDrawer,
  onNavigateToAddEntry,
}) => {
  const { timeEntries, projects, tasks, deleteTimeEntry } = useTimeEntries();
  const [activeTab, setActiveTab] = useState<'all' | 'grouped'>('all');

  const getProjectName = (id: string) => {
    return projects.find((p) => p.id === id)?.name || 'Unknown Project';
  };

  const getTaskName = (id: string) => {
    return tasks.find((t) => t.id === id)?.name || 'Unknown Task';
  };

  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Grouped entries calculation
  // Group key: projectId
  const projectsMap = new Map<string, typeof timeEntries>();
  timeEntries.forEach((entry) => {
    const list = projectsMap.get(entry.projectId) || [];
    list.push(entry);
    projectsMap.set(entry.projectId, list);
  });

  const groupedEntries = Array.from(projectsMap.entries()).map(([projectId, entries]) => {
    const totalHours = entries.reduce((sum, e) => sum + e.totalTime, 0);
    return {
      projectId,
      projectName: getProjectName(projectId),
      totalHours,
      entries,
    };
  });

  // Calculate dynamic stats for high-density header widget
  const totalHoursLogged = timeEntries.reduce((sum, e) => sum + e.totalTime, 0);
  const totalHoursInt = Math.floor(totalHoursLogged);
  const totalMinutesInt = Math.round((totalHoursLogged - totalHoursInt) * 60);
  const formattedDuration = `${String(totalHoursInt).padStart(2, '0')}h ${String(totalMinutesInt).padStart(2, '0')}m`;

  const billableAmount = totalHoursLogged * 60.0;
  const formattedBillable = `$${billableAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  let topProjectName = 'None';
  if (groupedEntries.length > 0) {
    const sorted = [...groupedEntries].sort((a, b) => b.totalHours - a.totalHours);
    topProjectName = sorted[0].projectName;
  }

  const activeTimerString = timeEntries.length > 0 ? `00:${String(timeEntries.length * 7).padStart(2, '0')}:15` : '00:00:00';

  return (
    <div className="flex flex-col h-full bg-[#F3F4F6] text-slate-900 relative">
      {/* High Density White Header Area */}
      <header className="sticky top-0 bg-white border-b border-slate-200 text-slate-900 shadow-none z-10 flex flex-col justify-between">
        <div className="px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              id="btn-menu-home"
              onClick={onOpenDrawer}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 transition-all cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                <span>Time Entries</span>
                <span className="px-2 py-0.5 bg-indigo-55 text-indigo-700 text-[10px] font-bold rounded">Today</span>
              </h1>
              <span className="text-[10px] text-slate-400 font-bold block leading-none mt-0.5">Written by Brian McCarthy</span>
            </div>
          </div>
          <button
            id="btn-header-add-entry"
            onClick={onNavigateToAddEntry}
            className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-150 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Log New Entry</span>
          </button>
        </div>

        {/* High Density Integrated Tabs style */}
        <div className="flex border-t border-slate-100 bg-slate-50/50 p-1 mx-4 mb-2.5 rounded-xl border border-slate-200/60">
          <button
            id="tab-all-entries"
            onClick={() => setActiveTab('all')}
            className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg tracking-normal transition-all ${
              activeTab === 'all'
                ? 'bg-white text-indigo-700 shadow-sm border-neutral-200'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 cursor-pointer'
            }`}
          >
            All Entries
          </button>
          <button
            id="tab-grouped-entries"
            onClick={() => setActiveTab('grouped')}
            className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg tracking-normal transition-all ${
              activeTab === 'grouped'
                ? 'bg-white text-indigo-700 shadow-sm border-neutral-200'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 cursor-pointer'
            }`}
          >
            Grouped by Projects
          </button>
        </div>
      </header>

      {/* Developer Banner */}
      <div className="text-[10px] text-slate-500 font-bold px-4 py-1.5 bg-slate-100 border-b border-slate-200 text-center tracking-wide uppercase">
        Written by Brian McCarthy
      </div>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-y-auto px-4 py-5 max-w-2xl mx-auto w-full pb-24">
        {timeEntries.length > 0 && (
          /* Stats Grid from High Density Template */
          <div className="grid grid-cols-2 xs:grid-cols-4 gap-3 mb-5">
            <div className="bg-white p-3.5 border border-slate-200 rounded-xl shadow-xs">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total logged</p>
              <p className="text-lg font-mono font-extrabold mt-1 text-slate-800">{formattedDuration}</p>
              <div className="h-1.5 w-full bg-slate-100 mt-2 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (totalHoursLogged / 40) * 100)}%` }}></div>
              </div>
            </div>
            <div className="bg-white p-3.5 border border-slate-200 rounded-xl shadow-xs">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Billable ($60/h)</p>
              <p className="text-lg font-mono font-extrabold mt-1 text-emerald-600">{formattedBillable}</p>
              <p className="text-[9px] text-slate-400 mt-1.5 font-medium">Auto-calculated rate</p>
            </div>
            <div className="bg-white p-3.5 border border-slate-200 rounded-xl shadow-xs">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Top Project</p>
              <p className="text-lg font-bold mt-1 text-slate-800 truncate" title={topProjectName}>{topProjectName}</p>
              <p className="text-[9px] text-slate-400 mt-1.5 font-medium">Most active focus</p>
            </div>
            <div className="bg-white p-3.5 border border-slate-200 rounded-xl shadow-xs">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Timer</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                <p className="text-lg font-mono font-extrabold text-slate-800">{activeTimerString}</p>
              </div>
              <p className="text-[9px] text-slate-400 mt-1.5 font-medium">Total: {timeEntries.length} log sessions</p>
            </div>
          </div>
        )}

        {timeEntries.length === 0 ? (
          /* Empty State View */
          <div className="bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center py-16 px-6 text-neutral-400 text-center shadow-xs">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400 border border-slate-100">
              <Clock className="w-8 h-8 text-indigo-500/80" />
            </div>
            <h3 className="font-bold text-slate-700 text-base">No time entries logged yet</h3>
            <p className="text-sm mt-1 max-w-xs text-slate-400 leading-relaxed font-medium">
              Create projects and tasks in settings, then tap the Log button above to save your first tracking record.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'all' ? (
              /* High Density Table Aesthetic Area */
              <motion.div
                id="all-entries-list"
                key="all"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs"
              >
                <div className="px-4 py-3.5 border-b border-slate-150 flex justify-between items-center bg-slate-100/50">
                  <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Recent Activities</h3>
                  <div className="flex gap-2">
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 font-bold rounded-md">
                      {timeEntries.length} items
                    </span>
                  </div>
                </div>

                <div className="overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {timeEntries.map((entry) => (
                      <motion.div
                        id={`time-entry-card-${entry.id}`}
                        key={entry.id}
                        layout
                        exit={{ opacity: 0 }}
                        className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-800">
                              {getProjectName(entry.projectId)}
                            </span>
                            <span className="text-slate-300 text-[10px]">•</span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/50">
                              {getTaskName(entry.taskId)}
                            </span>
                            <span className="text-slate-300 text-[10px]">•</span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {formatDate(entry.date)}
                            </span>
                          </div>
                          {entry.notes && (
                            <p className="text-[11px] text-slate-500 mt-1 font-medium bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100 italic inline-block max-w-full truncate">
                              "{entry.notes}"
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md text-right shrink-0">
                            {entry.totalTime.toFixed(1)}h
                          </span>
                          <button
                            id={`btn-delete-entry-${entry.id}`}
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this time entry?')) {
                                deleteTimeEntry(entry.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0 cursor-pointer"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Grouped by Projects View - High Density Card breakdown mapping */
              <motion.div
                id="grouped-entries-list"
                key="grouped"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {groupedEntries.map((group) => {
                  const percent = totalHoursLogged > 0 ? (group.totalHours / totalHoursLogged) * 100 : 0;
                  return (
                    <div
                      id={`grouped-project-${group.projectId}`}
                      key={group.projectId}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs"
                    >
                      <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0"></span>
                          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-tight">
                            {group.projectName}
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                            {group.totalHours.toFixed(1)}h ({percent.toFixed(0)}%)
                          </span>
                        </div>
                      </div>

                      {/* Mini custom percentage metric bar */}
                      <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percent}%` }}></div>
                      </div>

                      <div className="pt-2 divide-y divide-slate-50 text-xs">
                        {group.entries.map((item) => (
                          <div
                            id={`grouped-item-${item.id}`}
                            key={item.id}
                            className="flex justify-between items-center py-2 hover:bg-slate-50 px-1.5 rounded transition-all"
                          >
                            <div className="flex-1 min-w-0 pr-2">
                              <p className="font-semibold text-slate-700 text-xs truncate">
                                {getTaskName(item.taskId)}
                              </p>
                              {item.notes && (
                                <p className="text-[10px] text-slate-400 italic font-medium truncate">
                                  "{item.notes}"
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 font-medium">{formatDate(item.date)}</span>
                              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                                {item.totalTime.toFixed(1)}h
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Floating Action Button (FAB) - Styled nicely */}
      <button
        id="btn-add-time-entry-fab"
        onClick={onNavigateToAddEntry}
        className="fixed bottom-6 right-6 lg:right-1/4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white p-4 rounded-full shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center cursor-pointer"
        aria-label="Add time entry"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
};


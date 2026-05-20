import React, { useState, useMemo } from 'react';
import { useTimeEntries } from '../TimeEntryContext';
import { Menu, Calendar, Download, AlertCircle, BarChart3, PieChart as PieIcon, Briefcase, CheckSquare, Clock, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

interface ReportsScreenProps {
  onOpenDrawer: () => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ onOpenDrawer }) => {
  const { timeEntries, projects, tasks } = useTimeEntries();

  // Helper: Get today's and default dates
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Set default range to current month
  const defaultStartDate = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }, []);

  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(todayStr);

  const getProjectName = (id: string) => {
    return projects.find((p) => p.id === id)?.name || 'Unknown Project';
  };

  const getTaskName = (id: string) => {
    return tasks.find((t) => t.id === id)?.name || 'Unknown Task';
  };

  // Preset Date range handlers
  const setPresetRange = (preset: 'this_week' | 'last_7_days' | 'this_month' | 'all_time') => {
    const today = new Date();
    if (preset === 'this_week') {
      const currentDay = today.getDay();
      const distance = currentDay === 0 ? 6 : currentDay - 1; // get start of week (Monday)
      const monday = new Date(today);
      monday.setDate(today.getDate() - distance);
      setStartDate(monday.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } else if (preset === 'last_7_days') {
      const past = new Date();
      past.setDate(today.getDate() - 7);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } else if (preset === 'this_month') {
      const firstDay = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
      setStartDate(firstDay);
      setEndDate(today.toISOString().split('T')[0]);
    } else if (preset === 'all_time') {
      setStartDate('2000-01-01');
      setEndDate('2030-12-31');
    }
  };

  // Filtered Entries based on Date Range
  const filteredEntries = useMemo(() => {
    return timeEntries.filter((entry) => {
      const entryDate = entry.date;
      return entryDate >= startDate && entryDate <= endDate;
    });
  }, [timeEntries, startDate, endDate]);

  // Aggregate Total Hours & Billable
  const totals = useMemo(() => {
    const hours = filteredEntries.reduce((sum, e) => sum + e.totalTime, 0);
    const billable = hours * 60.0; // Billable rate of $60/hr
    return { hours, billable };
  }, [filteredEntries]);

  // Group by Project for Bar Chart
  const projectStats = useMemo(() => {
    const map = new Map<string, number>();
    filteredEntries.forEach((entry) => {
      const current = map.get(entry.projectId) || 0;
      map.set(entry.projectId, current + entry.totalTime);
    });

    const list = Array.from(map.entries()).map(([projectId, totalHours]) => ({
      projectId,
      name: getProjectName(projectId),
      hours: totalHours,
    }));

    // Sort by hours descending
    return list.sort((a, b) => b.hours - a.hours);
  }, [filteredEntries, projects]);

  // Group by Task for Pie Chart
  const taskStats = useMemo(() => {
    const map = new Map<string, number>();
    filteredEntries.forEach((entry) => {
      const current = map.get(entry.taskId) || 0;
      map.set(entry.taskId, current + entry.totalTime);
    });

    const list = Array.from(map.entries()).map(([taskId, totalHours]) => ({
      taskId,
      name: getTaskName(taskId),
      hours: totalHours,
    }));

    return list.sort((a, b) => b.hours - a.hours);
  }, [filteredEntries, tasks]);

  // Color Palette for charts
  const colors = [
    '#6366F1', // Indigo
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#14B8A6', // Teal
  ];

  // CSV Exporter
  const handleExportCSV = () => {
    try {
      if (filteredEntries.length === 0) {
        alert('No data entries found in the selected date range to export.');
        return;
      }

      // CSV Headings
      const csvRows = ['"Date","Project","Task","Notes","Hours Logged","Billable Amount ($60/h)"'];

      filteredEntries.forEach((e) => {
        const row = [
          `"${e.date}"`,
          `"${getProjectName(e.projectId).replace(/"/g, '""')}"`,
          `"${getTaskName(e.taskId).replace(/"/g, '""')}"`,
          `"${(e.notes || '').replace(/"/g, '""')}"`,
          e.totalTime,
          `$${(e.totalTime * 60).toFixed(2)}`
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvRows.join('\n'));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', csvContent);
      downloadAnchor.setAttribute('download', `ChronosSync_TimeReport_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Error creating CSV report: ' + String(err));
    }
  };

  // Arc drawing math for SVG Pie Chart
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const getArcPath = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    
    // Handle perfect circle edge case
    if (endAngle - startAngle >= 359.99) {
      return `M ${x} ${y - radius} A ${radius} ${radius} 0 1 1 ${x - 0.01} ${y - radius} Z`;
    }

    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      'L', x, y,
      'Z',
    ].join(' ');
  };

  // Calculate coordinates for Pie segments
  let accumulatedAngle = 0;
  const pieSegments = taskStats.map((item, index) => {
    const percentage = totals.hours > 0 ? item.hours / totals.hours : 0;
    const angle = percentage * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle = endAngle;

    return {
      ...item,
      percentage,
      startAngle,
      endAngle,
      color: colors[index % colors.length],
    };
  });

  // Calculate coordinates for Bar Chart
  const maxProjectHours = projectStats.length > 0 ? Math.max(...projectStats.map((p) => p.hours)) : 10;

  return (
    <div className="flex flex-col h-full bg-[#F3F4F6] text-slate-900 relative">
      {/* AppBar */}
      <header className="sticky top-0 bg-white border-b border-slate-200 text-slate-900 shadow-none z-10 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            id="btn-menu-reports"
            onClick={onOpenDrawer}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 transition-all cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-extrabold tracking-tight">Reports & Analytics</h1>
            <p className="text-[10px] text-slate-400 font-bold block">Written by Brian McCarthy</p>
          </div>
        </div>

        <button
          id="btn-export-reports-csv"
          onClick={handleExportCSV}
          disabled={filteredEntries.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none active:bg-indigo-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:scale-[1.01]"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </header>

      {/* Developer Banner */}
      <div className="text-[10px] text-slate-500 font-bold px-4 py-1.5 bg-slate-100 border-b border-slate-200 text-center tracking-wide uppercase">
        Written by Brian McCarthy
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-4 max-w-2xl mx-auto w-full pb-20 space-y-4">
        
        {/* Date Range Selection Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>Select Report Date Interval</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">From Date</label>
              <input
                id="report-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-1.5 outline-none focus:bg-white focus:border-indigo-550 transition-all font-semibold text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">To Date</label>
              <input
                id="report-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-1.5 outline-none focus:bg-white focus:border-indigo-550 transition-all font-semibold text-xs"
              />
            </div>
          </div>

          {/* Preset buttons */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setPresetRange('this_week')}
              className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-all"
            >
              This Week
            </button>
            <button
              onClick={() => setPresetRange('last_7_days')}
              className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-all"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setPresetRange('this_month')}
              className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-all"
            >
              This Month
            </button>
            <button
              onClick={() => setPresetRange('all_time')}
              className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-all"
            >
              All Time
            </button>
          </div>
        </div>

        {/* Dynamic Warning if StartDate > EndDate */}
        {startDate > endDate && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <span>The start date is set after the end date. Please correct the range to preview your report stats.</span>
          </div>
        )}

        {/* Live Filtered Stats Widget */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock className="w-4 h-4 text-indigo-500" />
              <p className="text-[10px] font-bold uppercase tracking-wider">Logged In Period</p>
            </div>
            <p className="text-xl font-mono font-extrabold mt-1 text-slate-800">
              {totals.hours.toFixed(1)} <span className="text-xs font-sans text-slate-400 font-bold lowercase">hours</span>
            </p>
            <p className="text-[9px] text-slate-400 mt-1.5 font-medium">For {filteredEntries.length} time entry logs</p>
          </div>

          <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <p className="text-[10px] font-bold uppercase tracking-wider">Billable Estimated</p>
            </div>
            <p className="text-xl font-mono font-extrabold mt-1 text-emerald-600">
              ${totals.billable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[9px] text-slate-400 mt-1.5 font-medium">Standard rate of $60.00/h</p>
          </div>
        </div>

        {/* Empty State warning inside report main */}
        {filteredEntries.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center py-12 px-4 text-center shadow-xs">
            <AlertCircle className="w-8 h-8 text-amber-500/80 mb-2" />
            <h4 className="font-bold text-slate-700 text-xs uppercase tracking-tight">No time entries recorded of this search</h4>
            <p className="text-xs mt-1 max-w-xs text-slate-400 leading-relaxed font-semibold">
              There are no logged activities between {startDate} and {endDate}. Select another date interval or add new logs to populate analytical graphics.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Project Log breakdown Bar Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-4 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Time Spent per Project (Hours)</span>
              </h3>

              {/* Handcrafted dynamic CSS/SVG bar chart */}
              <div className="space-y-3">
                {projectStats.map((item, index) => {
                  const percentage = maxProjectHours > 0 ? (item.hours / maxProjectHours) * 100 : 0;
                  const color = colors[index % colors.length];
                  return (
                    <div id={`report-project-bar-${item.projectId}`} key={item.projectId} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700 truncate max-w-[75%]">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                          <span className="truncate" title={item.name}>{item.name}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-800">{item.hours.toFixed(1)}h</span>
                      </div>
                      <div className="h-4 w-full bg-slate-50 border border-slate-100 rounded-md overflow-hidden relative flex items-center">
                        <div
                          className="h-full rounded-r-md transition-all duration-500"
                          style={{
                            width: `${Math.max(1, percentage)}%`,
                            backgroundColor: color,
                            opacity: 0.85
                          }}
                        ></div>
                        <span className="absolute left-2.5 text-[9px] font-bold text-slate-400 font-mono">
                          {((item.hours / totals.hours) * 100).toFixed(0)}% contribution
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Task Log breakdown Pie Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-4 flex items-center gap-1.5">
                <PieIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Distribution of Time across Tasks</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* SVG Pizza chart structure */}
                <div className="flex justify-center">
                  <svg id="reports-task-pie-svg" width="180" height="180" viewBox="0 0 180 180" className="drop-shadow-xs">
                    {pieSegments.length === 1 ? (
                      // Single item takes a 100% circle simple path
                      <circle cx="90" cy="90" r="70" fill={pieSegments[0].color} opacity="0.9" />
                    ) : (
                      pieSegments.map((seg, idx) => {
                        const path = getArcPath(90, 90, 75, seg.startAngle, seg.endAngle);
                        return (
                          <path
                            key={seg.taskId}
                            d={path}
                            fill={seg.color}
                            opacity="0.9"
                            className="hover:opacity-100 transition-opacity cursor-pointer duration-150"
                            title={`${seg.name}: ${seg.hours.toFixed(1)}h (${(seg.percentage * 100).toFixed(0)}%)`}
                          />
                        );
                      })
                    )}
                    {/* Inner hollow donut element for premium high fidelity widget aesthetics */}
                    <circle cx="90" cy="90" r="36" fill="#FFFFFF" />
                    <text x="90" y="86" textAnchor="middle" className="text-[9px] font-bold fill-slate-400 select-none uppercase">Tasks</text>
                    <text x="90" y="99" textAnchor="middle" className="text-xs font-mono font-extrabold fill-slate-800 select-none">
                      {taskStats.length} types
                    </text>
                  </svg>
                </div>

                {/* Pie Chart Legend details */}
                <div className="space-y-1.5 self-center">
                  {pieSegments.map((seg) => (
                    <div id={`report-task-legend-${seg.taskId}`} key={seg.taskId} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2.5 h-2.5 rounded shrink-0" style={{ backgroundColor: seg.color }}></span>
                        <span className="font-semibold text-slate-700 truncate" title={seg.name}>{seg.name}</span>
                      </div>
                      <div className="text-right shrink-0 font-mono font-bold text-slate-500 pl-3">
                        <span className="text-slate-800 font-extrabold">{seg.hours.toFixed(1)}h</span>
                        <span className="text-[10px] text-slate-400 ml-1">({(seg.percentage * 100).toFixed(0)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* In-app Summary Report Table listing filtered items */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="px-4 py-3 border-b border-slate-150 flex justify-between items-center bg-slate-50">
                <h3 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Filtered Items Statement</h3>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 font-bold rounded">
                  Showing {filteredEntries.length} entries
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
                {filteredEntries.map((e) => (
                  <div id={`report-table-row-${e.id}`} key={e.id} className="p-3 hover:bg-slate-50/50 flex justify-between items-baseline gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-800">{getProjectName(e.projectId)}</span>
                        <span className="text-slate-300 font-medium">•</span>
                        <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 font-semibold rounded">
                          {getTaskName(e.taskId)}
                        </span>
                        <span className="text-slate-300 font-medium">•</span>
                        <span className="text-[10px] text-slate-400 font-medium">{e.date}</span>
                      </div>
                      {e.notes && (
                        <p className="text-[10px] text-slate-400 italic mt-0.5 truncate">
                          "{e.notes}"
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right font-mono text-slate-700 text-xs font-semibold">
                      {e.totalTime.toFixed(1)}h
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Written By Brian McCarthy Screen Footer Info */}
        <div className="text-center py-3.5 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ChronosSync HD Platform</p>
          <p className="text-[11px] font-bold text-indigo-650">Written by Brian McCarthy</p>
        </div>

      </main>
    </div>
  );
};

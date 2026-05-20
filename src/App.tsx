/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TimeEntryProvider } from './TimeEntryContext';
import { HomeScreen } from './components/HomeScreen';
import { AddTimeEntryScreen } from './components/AddTimeEntryScreen';
import { ProjectManagementScreen } from './components/ProjectManagementScreen';
import { TaskManagementScreen } from './components/TaskManagementScreen';
import { ReportsScreen } from './components/ReportsScreen';
import { FlutterBlueprintsScreen } from './components/FlutterBlueprintsScreen';
import { NavigationDrawer } from './components/NavigationDrawer';
import { Sparkles, Smartphone, Laptop, RefreshCw } from 'lucide-react';

export default function App() {
  const [screen, setScreen] = useState<'home' | 'projects' | 'tasks' | 'add_entry' | 'reports' | 'flutter'>('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  const resetAllData = () => {
    if (confirm('Are you sure you want to reset all tracking entries, projects, and tasks to default?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const exportBackup = () => {
    try {
      const backupData = {
        entries: localStorage.getItem('time_tracking_entries') ? JSON.parse(localStorage.getItem('time_tracking_entries')!) : [],
        projects: localStorage.getItem('time_tracking_projects') ? JSON.parse(localStorage.getItem('time_tracking_projects')!) : [],
        tasks: localStorage.getItem('time_tracking_tasks') ? JSON.parse(localStorage.getItem('time_tracking_tasks')!) : [],
        version: '1.1.2_HD',
        exportedAt: new Date().toISOString()
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "chronossync_time_backup.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      alert("Failed to export data: " + String(e));
    }
  };

  const renderActiveScreen = () => {
    switch (screen) {
      case 'home':
        return (
          <HomeScreen
            onOpenDrawer={() => setIsDrawerOpen(true)}
            onNavigateToAddEntry={() => setScreen('add_entry')}
          />
        );
      case 'projects':
        return (
          <ProjectManagementScreen
            onOpenDrawer={() => setIsDrawerOpen(true)}
          />
        );
      case 'tasks':
        return (
          <TaskManagementScreen
            onOpenDrawer={() => setIsDrawerOpen(true)}
          />
        );
      case 'reports':
        return (
          <ReportsScreen
            onOpenDrawer={() => setIsDrawerOpen(true)}
          />
        );
      case 'flutter':
        return (
          <FlutterBlueprintsScreen
            onOpenDrawer={() => setIsDrawerOpen(true)}
          />
        );
      case 'add_entry':
        return (
          <AddTimeEntryScreen
            onBack={() => setScreen('home')}
          />
        );
      default:
        return (
          <HomeScreen
            onOpenDrawer={() => setIsDrawerOpen(true)}
            onNavigateToAddEntry={() => setScreen('add_entry')}
          />
        );
    }
  };

  return (
    <TimeEntryProvider>
      <div className="min-h-screen bg-[#0F172A] font-sans text-slate-300 flex flex-col md:flex-row antialiased">
        
        {/* Left Side Info Panel (on wide screens) */}
        <div className="hidden lg:flex flex-col justify-between w-96 p-8 bg-[#0B0F19] text-slate-300 border-r border-[#1E293B] shrink-0">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md cursor-pointer animate-pulse">
                C
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white tracking-tight leading-none">iOS-Android-Flutter-Time-Tracker-App</h2>
                <p className="text-[10px] text-indigo-400 font-bold block mt-1">Written by Brian McCarthy</p>
                <span className="text-[8px] bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 px-1.5 py-0.5 rounded font-mono font-bold uppercase block mt-1 w-max">density_edition_v1.1</span>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              Manage multi-project tasks, track billable outcomes, and log your team actions efficiently. Engineered with high-density components by Brian McCarthy.
            </p>

            <div className="p-4 bg-[#111827] border border-slate-800/80 rounded-xl space-y-2.5">
              <h4 className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">Aesthetic Specs</h4>
              <ul className="text-[10px] text-slate-400 space-y-1.5 list-disc pl-3.5 font-medium">
                <li>High density compact layouts & forms</li>
                <li>Live active session simulated counter</li>
                <li>Interactive progress breakdown metrics</li>
                <li>One-click backup exporter files</li>
              </ul>
            </div>

            {/* Indigo Action Panel container */}
            <div className="bg-indigo-950/40 border border-indigo-900/60 rounded-xl p-4 relative overflow-hidden">
              <h5 className="text-xs font-bold text-white mb-1.5">Offline Data Integrity</h5>
              <p className="text-[10px] text-indigo-200 leading-relaxed font-semibold mb-3">
                All logs persist entirely inside your local browser storage. Back up your dataset below:
              </p>
              <button
                id="btn-export-backup"
                onClick={exportBackup}
                className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm shadow-indigo-900/30 font-mono"
              >
                <span>EXPORT DATA (.JSON)</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-[11px]">View Mode</span>
              <div className="flex bg-[#111827] p-1 rounded-lg border border-slate-800 space-x-1">
                <button
                  id="btn-toggle-frame-on"
                  onClick={() => setIsMobileFrame(true)}
                  className={`p-1.5 rounded-md transition-all ${isMobileFrame ? 'bg-indigo-600 text-white' : 'hover:text-white cursor-pointer'}`}
                  title="Phone Preview"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  id="btn-toggle-frame-off"
                  onClick={() => setIsMobileFrame(false)}
                  className={`p-1.5 rounded-md transition-all ${!isMobileFrame ? 'bg-indigo-600 text-white' : 'hover:text-white cursor-pointer'}`}
                  title="Full Width Screen"
                >
                  <Laptop className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              id="btn-reset-data"
              onClick={resetAllData}
              className="w-full py-2.5 bg-[#111827] hover:bg-red-950/40 hover:text-red-400 border border-slate-800 hover:border-red-900/30 text-slate-400 font-bold rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset State & Database</span>
            </button>
          </div>
        </div>

        {/* Content/Simulation Area */}
        <div className="flex-1 flex items-center justify-center p-0 md:p-6 bg-[#0B0F19] overflow-hidden relative">
          
          <div
            className={`transition-all duration-300 w-full h-full md:h-[840px] flex flex-col relative overflow-hidden bg-white shadow-2xl ${
              isMobileFrame 
                ? 'max-w-md md:rounded-[36px] md:border-[10px] md:border-slate-800 ring-2 ring-indigo-500/10' 
                : 'max-w-4xl md:rounded-2xl border border-slate-200'
            }`}
          >
            {/* Drawer menu */}
            <NavigationDrawer
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              currentScreen={screen === 'add_entry' ? 'home' : screen}
              setScreen={(scr) => setScreen(scr)}
            />

            {/* Simulated Smartphone Notch/Status Bar - Styled elegantly for light bg */}
            {isMobileFrame && (
              <div className="hidden md:flex items-center justify-between px-6 py-2 bg-slate-50 text-slate-600 text-[10px] select-none border-b border-slate-200 shrink-0 font-medium font-sans">
                <span>9:41 AM</span>
                <div className="w-16 h-3.5 bg-slate-200 rounded-full mx-auto" />
                <div className="flex items-center space-x-1.5">
                  <span className="text-[9px] font-sans font-bold text-slate-550">5G</span>
                  <div className="w-5 h-2.5 border border-slate-400 rounded-sm p-0.5 flex items-center">
                    <div className="h-full w-3 bg-slate-500 rounded-2xs" />
                  </div>
                </div>
              </div>
            )}

            {/* Frame Content */}
            <div className="flex-1 h-0 overflow-hidden">
              {renderActiveScreen()}
            </div>
          </div>
        </div>

      </div>
    </TimeEntryProvider>
  );
}

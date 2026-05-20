import React, { useState } from 'react';
import { useTimeEntries } from '../TimeEntryContext';
import { ArrowLeft, Save, Calendar, Clock, Clipboard, Folder, CheckSquare } from 'lucide-react';

interface AddTimeEntryProps {
  onBack: () => void;
}

export const AddTimeEntryScreen: React.FC<AddTimeEntryProps> = ({ onBack }) => {
  const { projects, tasks, addTimeEntry } = useTimeEntries();

  // Field states
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [taskId, setTaskId] = useState(tasks[0]?.id || '');
  const [totalTime, setTotalTime] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [notes, setNotes] = useState('');

  // Error states
  const [errors, setErrors] = useState<{
    project?: string;
    task?: string;
    totalTime?: string;
    notes?: string;
  }>({});

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!projectId) {
      newErrors.project = 'Please select a project';
    }
    if (!taskId) {
      newErrors.task = 'Please select a task';
    }

    const parsedTime = parseFloat(totalTime);
    if (!totalTime) {
      newErrors.totalTime = 'Please enter total time';
    } else if (isNaN(parsedTime) || parsedTime <= 0) {
      newErrors.totalTime = 'Please enter a valid positive number';
    }

    if (!notes.trim()) {
      newErrors.notes = 'Please enter some notes';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save entry
    addTimeEntry({
      projectId,
      taskId,
      totalTime: parsedTime,
      date,
      notes: notes.trim(),
    });

    // Navigate back
    onBack();
  };

  return (
    <div className="flex flex-col h-full bg-[#F3F4F6] text-slate-900">
      {/* High Density AppBar */}
      <header className="sticky top-0 bg-white border-b border-slate-200 text-slate-900 shadow-none z-10 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            id="btn-back-add-entry"
            onClick={onBack}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 transition-all cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-extrabold tracking-tight">Add Time Entry</h1>
            <span className="text-[10px] text-slate-400 font-bold block leading-none mt-0.5">Written by Brian McCarthy</span>
          </div>
        </div>
      </header>

      {/* Developer Banner */}
      <div className="text-[10px] text-slate-500 font-bold px-4 py-1.5 bg-slate-100 border-b border-slate-200 text-center tracking-wide uppercase">
        Written by Brian McCarthy
      </div>

      {/* Form Container */}
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-xl mx-auto w-full">
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200">
          <form id="add-time-entry-form" onSubmit={handleSave} className="space-y-4">
            {/* Project Dropdown */}
            <div>
              <label className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                <Folder className="w-3.5 h-3.5 text-slate-400" />
                <span>Project</span>
              </label>
              <div className="relative">
                <select
                  id="select-project"
                  value={projectId}
                  onChange={(e) => {
                    setProjectId(e.target.value);
                    setErrors((prev) => ({ ...prev, project: undefined }));
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all font-semibold text-xs appearance-none cursor-pointer"
                >
                  <option value="">-- Choose Project --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              {errors.project && (
                <p id="error-project" className="text-[10px] text-red-500 mt-1 font-semibold">
                  {errors.project}
                </p>
              )}
            </div>

            {/* Task Dropdown */}
            <div>
              <label className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>Task</span>
              </label>
              <div className="relative">
                <select
                  id="select-task"
                  value={taskId}
                  onChange={(e) => {
                    setTaskId(e.target.value);
                    setErrors((prev) => ({ ...prev, task: undefined }));
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all font-semibold text-xs appearance-none cursor-pointer"
                >
                  <option value="">-- Choose Task --</option>
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              {errors.task && (
                <p id="error-task" className="text-[10px] text-red-500 mt-1 font-semibold">
                  {errors.task}
                </p>
              )}
            </div>

            {/* Date Field */}
            <div>
              <label className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Date</span>
              </label>
              <input
                id="input-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all font-semibold text-xs cursor-pointer"
              />
            </div>

            {/* Total Time Hours */}
            <div>
              <label className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Total Time (hours)</span>
              </label>
              <input
                id="input-total-time"
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g. 1.5 or 3"
                value={totalTime}
                onChange={(e) => {
                  setTotalTime(e.target.value);
                  setErrors((prev) => ({ ...prev, totalTime: undefined }));
                }}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all font-semibold text-xs"
              />
              {errors.totalTime && (
                <p id="error-total-time" className="text-[10px] text-red-500 mt-1 font-semibold">
                  {errors.totalTime}
                </p>
              )}
            </div>

            {/* Notes Textarea */}
            <div>
              <label className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                <Clipboard className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-bold">Notes</span>
              </label>
              <textarea
                id="input-notes"
                rows={3}
                placeholder="What did you work on?"
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setErrors((prev) => ({ ...prev, notes: undefined }));
                }}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all font-semibold text-xs resize-none"
              />
              {errors.notes && (
                <p id="error-notes" className="text-[10px] text-red-500 mt-1 font-semibold">
                  {errors.notes}
                </p>
              )}
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                id="btn-save-time-entry"
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-3 rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <Save className="w-4 h-4" />
                <span className="text-xs font-semibold">Save Entry</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

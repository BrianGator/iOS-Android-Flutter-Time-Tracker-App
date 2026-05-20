import React, { useState } from 'react';
import { useTimeEntries } from '../TimeEntryContext';
import { Menu, Plus, Trash2, CheckSquare, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskManagementProps {
  onOpenDrawer: () => void;
}

export const TaskManagementScreen: React.FC<TaskManagementProps> = ({ onOpenDrawer }) => {
  const { tasks, addTask, deleteTask, timeEntries } = useTimeEntries();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [errorText, setErrorText] = useState('');

  const handleOpenDialog = () => {
    setNewTaskName('');
    setErrorText('');
    setIsDialogOpen(true);
  };

  const handleCreateTask = () => {
    const trimmed = newTaskName.trim();
    if (!trimmed) {
      setErrorText('Task name cannot be empty');
      return;
    }
    // Check duplicate
    if (tasks.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) {
      setErrorText('Task name already exists');
      return;
    }
    addTask(trimmed);
    setIsDialogOpen(false);
    setNewTaskName('');
  };

  const handleDelete = (id: string, name: string) => {
    // Check if in use
    const inUse = timeEntries.some((e) => e.taskId === id);
    if (inUse) {
      if (confirm(`"${name}" is being used in one or more time entries. Are you sure you want to delete it?`)) {
        deleteTask(id);
      }
    } else {
      deleteTask(id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F3F4F6] text-slate-900 relative">
      {/* AppBar */}
      <header className="sticky top-0 bg-white border-b border-slate-200 text-slate-900 shadow-none z-10 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            id="btn-menu-tasks"
            onClick={onOpenDrawer}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 transition-all cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-extrabold tracking-tight">Tasks</h1>
            <span className="text-[10px] text-slate-400 font-bold block leading-none mt-0.5">Written by Brian McCarthy</span>
          </div>
        </div>
        <button
          id="btn-header-add-task"
          onClick={handleOpenDialog}
          className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </header>

      {/* Developer Banner */}
      <div className="text-[10px] text-slate-500 font-bold px-4 py-1.5 bg-slate-100 border-b border-slate-200 text-center tracking-wide uppercase">
        Written by Brian McCarthy
      </div>

      {/* Tasks List */}
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full pb-24">
        {tasks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center py-16 px-6 text-neutral-400 text-center shadow-xs">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400 border border-slate-100">
              <CheckSquare className="w-8 h-8 text-indigo-505" />
            </div>
            <p className="font-semibold text-slate-700">No tasks yet!</p>
            <p className="text-xs mt-1 text-slate-400">Tap the button above to add your first work task.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            <div className="px-4 py-3 bg-slate-150/50 border-b border-slate-150 flex justify-between items-center bg-slate-50">
              <h3 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Work Task Stack</h3>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 font-bold rounded">
                {tasks.length} Total
              </span>
            </div>
            <AnimatePresence initial={false}>
              {tasks.map((task) => {
                const usageCount = timeEntries.filter((e) => e.taskId === task.id).length;
                return (
                  <motion.div
                    id={`task-item-${task.id}`}
                    key={task.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="p-2 bg-indigo-50 text-indigo-650 rounded-lg">
                        <CheckSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-800">{task.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {usageCount === 1 ? '1 log entry' : `${usageCount} log entries`}
                        </p>
                      </div>
                    </div>
                    <button
                      id={`btn-delete-task-${task.id}`}
                      onClick={() => handleDelete(task.id, task.name)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Written By Brian McCarthy Screen Footer Info */}
        <div className="text-center py-4 space-y-1 mt-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ChronosSync HD Platform</p>
          <p className="text-[11px] font-bold text-indigo-650">Written by Brian McCarthy</p>
        </div>
      </main>

      {/* Add Task Dialog (Modal) */}
      <AnimatePresence>
        {isDialogOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              id="dialog-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDialogOpen(false)}
              className="fixed inset-0 bg-slate-900/40 z-30 pointer-events-auto"
            />

            {/* Dialog Content */}
            <div className="fixed inset-0 flex items-center justify-center z-40 p-4 pointer-events-none">
              <motion.div
                id="dialog-content"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-xl border border-slate-200 flex flex-col pointer-events-auto"
              >
                <div className="flex items-center space-x-2.5 mb-3.5">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Keyboard className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800">Add Task</h3>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Task Name
                    </label>
                    <input
                      id="input-task-name"
                      type="text"
                      placeholder="e.g. Code Review"
                      value={newTaskName}
                      onChange={(e) => {
                        setNewTaskName(e.target.value);
                        setErrorText('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateTask();
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all font-semibold text-xs text-slate-800"
                      autoFocus
                    />
                    {errorText && (
                      <p id="error-task" className="text-[10px] text-red-500 mt-1.5 font-semibold">
                        {errorText}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end space-x-2.5 pt-1.5">
                    <button
                      id="btn-dialog-cancel-task"
                      type="button"
                      onClick={() => setIsDialogOpen(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-bold text-slate-500 text-xs transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      id="btn-dialog-add-task"
                      type="button"
                      onClick={handleCreateTask}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-bold text-white text-xs shadow-sm shadow-indigo-100 transition-all cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

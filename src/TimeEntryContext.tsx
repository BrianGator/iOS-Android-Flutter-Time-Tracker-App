import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Task, TimeEntry } from './types';

interface TimeEntryContextType {
  projects: Project[];
  tasks: Task[];
  timeEntries: TimeEntry[];
  addProject: (name: string) => void;
  deleteProject: (id: string) => void;
  addTask: (name: string) => void;
  deleteTask: (id: string) => void;
  addTimeEntry: (entry: Omit<TimeEntry, 'id'>) => void;
  deleteTimeEntry: (id: string) => void;
}

const TimeEntryContext = createContext<TimeEntryContextType | undefined>(undefined);

const DEFAULT_PROJECTS: Project[] = [
  { id: '1', name: 'Project Alpha' },
  { id: '2', name: 'Project Beta' },
  { id: '3', name: 'Project Gamma' },
  { id: '4', name: 'Project 123' },
];

const DEFAULT_TASKS: Task[] = [
  { id: '1', name: 'Task A' },
  { id: '2', name: 'Task B' },
  { id: '3', name: 'Task C' },
  { id: '4', name: 'Task 1' },
  { id: '5', name: 'Task 2' },
];

const DEFAULT_ENTRIES: TimeEntry[] = [
  {
    id: '1732361585289',
    projectId: '3', // Project Gamma
    taskId: '1', // Task A
    totalTime: 1,
    date: '2024-11-23',
    notes: 'new work',
  },
  {
    id: '1732362585289',
    projectId: '1', // Project Alpha
    taskId: '4', // Task 1
    totalTime: 12,
    date: '2024-11-23',
    notes: 'more work',
  },
  {
    id: '1732448985289',
    projectId: '1', // Project Alpha
    taskId: '3', // Task C
    totalTime: 3,
    date: '2024-11-24',
    notes: 'final lab',
  },
];

export const TimeEntryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage once on mount
  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem('projects');
      const storedTasks = localStorage.getItem('tasks');
      const storedEntries = localStorage.getItem('timeEntries');

      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      } else {
        setProjects(DEFAULT_PROJECTS);
        localStorage.setItem('projects', JSON.stringify(DEFAULT_PROJECTS));
      }

      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        setTasks(DEFAULT_TASKS);
        localStorage.setItem('tasks', JSON.stringify(DEFAULT_TASKS));
      }

      if (storedEntries) {
        setTimeEntries(JSON.parse(storedEntries));
      } else {
        setTimeEntries(DEFAULT_ENTRIES);
        localStorage.setItem('timeEntries', JSON.stringify(DEFAULT_ENTRIES));
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
      // Fallback
      setProjects(DEFAULT_PROJECTS);
      setTasks(DEFAULT_TASKS);
      setTimeEntries(DEFAULT_ENTRIES);
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage whenever state changes (after load)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('projects', JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects', e);
    }
  }, [projects, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  }, [tasks, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('timeEntries', JSON.stringify(timeEntries));
    } catch (e) {
      console.error('Failed to save timeEntries', e);
    }
  }, [timeEntries, isLoaded]);

  const addProject = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newProj: Project = {
      id: Date.now().toString(),
      name: trimmed,
    };
    setProjects((prev) => [...prev, newProj]);
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    // Optionally clean up or orphan entries or keep them.
    // In typical behavior, you delete the project and keeping entries is fine or they reference deleted project.
  };

  const addTask = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newTask: Task = {
      id: Date.now().toString(),
      name: trimmed,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const addTimeEntry = (entry: Omit<TimeEntry, 'id'>) => {
    const newEntry: TimeEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    setTimeEntries((prev) => [newEntry, ...prev]);
  };

  const deleteTimeEntry = (id: string) => {
    setTimeEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <TimeEntryContext.Provider
      value={{
        projects,
        tasks,
        timeEntries,
        addProject,
        deleteProject,
        addTask,
        deleteTask,
        addTimeEntry,
        deleteTimeEntry,
      }}
    >
      {children}
    </TimeEntryContext.Provider>
  );
};

export const useTimeEntries = () => {
  const context = useContext(TimeEntryContext);
  if (!context) {
    throw new Error('useTimeEntries must be used within a TimeEntryProvider');
  }
  return context;
};

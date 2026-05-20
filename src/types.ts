export interface Project {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  name: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  taskId: string;
  totalTime: number; // in hours
  date: string; // YYYY-MM-DD
  notes: string;
}

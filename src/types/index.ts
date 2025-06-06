
export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline?: Date;
  completed: boolean;
  priority: 'urgent-important' | 'urgent-notImportant' | 'notUrgent-important' | 'notUrgent-notImportant'; // Eisenhower Matrix
  category?: string;
  timeEstimate?: number; // In minutes
  dependsOn?: string[]; // IDs of tasks this task depends on
  createdAt: Date;
  tags?: string[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  tasks: string[]; // Task IDs
  deadline?: Date;
  progress: number; // 0-100%
  createdAt: Date;
}

export interface TimeBlock {
  id: string;
  taskId: string;
  start: Date;
  end: Date;
  completed: boolean;
}

export interface ProductivityStats {
  tasksCompleted: number;
  totalTasks: number;
  timeSpent: number; // In minutes
  focusScore: number; // 0-100%
  streak: number;
}

export interface UserSettings {
  workHours: {
    start: string; // "09:00"
    end: string; // "17:00"
  };
  workDays: number[]; // 0-6 (Sunday-Saturday)
  focusTime: number; // Preferred focus time in minutes
  breakTime: number; // Preferred break time in minutes
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  calendarSync: {
    google?: boolean;
    outlook?: boolean;
  };
}

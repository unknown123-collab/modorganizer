
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, Project, TimeBlock, ProductivityStats, UserSettings } from '@/types';
import { prioritizeTasks, getHighImpactTasks } from '@/utils/prioritization';
import { createSchedule } from '@/utils/scheduling';
import { calculateProductivityStats, generateProductivityTips } from '@/utils/analytics';
import { extractTasksFromText } from '@/utils/nlp';
import { v4 as uuidv4 } from '@/utils/uuid';

interface TaskContextType {
  tasks: Task[];
  projects: Project[];
  timeBlocks: TimeBlock[];
  settings: UserSettings;
  productivityStats: ProductivityStats;
  addTask: (task: Partial<Task>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  addProject: (project: Partial<Project>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTaskToProject: (taskId: string, projectId: string) => void;
  removeTaskFromProject: (taskId: string, projectId: string) => void;
  createTaskFromText: (text: string) => Task | null;
  extractTasksFromText: (text: string) => ReturnType<typeof extractTasksFromText>;
  generateSchedule: () => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  getPriorityTasks: (limit?: number) => Task[];
  getProductivityTips: () => string[];
}

// Mock UUID function if not available
const uuidFn = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const defaultSettings: UserSettings = {
  workHours: {
    start: '09:00',
    end: '17:00',
  },
  workDays: [1, 2, 3, 4, 5], // Monday to Friday
  focusTime: 25, // 25 minutes (Pomodoro)
  breakTime: 5, // 5 minutes
  theme: 'system',
  notifications: true,
  calendarSync: {
    google: false,
    outlook: false,
  },
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [productivityStats, setProductivityStats] = useState<ProductivityStats>({
    tasksCompleted: 0,
    totalTasks: 0,
    timeSpent: 0,
    focusScore: 0,
    streak: 0,
  });
  
  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const savedTasks = localStorage.getItem('tasks');
        const savedProjects = localStorage.getItem('projects');
        const savedTimeBlocks = localStorage.getItem('timeBlocks');
        const savedSettings = localStorage.getItem('settings');
        
        if (savedTasks) setTasks(JSON.parse(savedTasks, dateReviver));
        if (savedProjects) setProjects(JSON.parse(savedProjects, dateReviver));
        if (savedTimeBlocks) setTimeBlocks(JSON.parse(savedTimeBlocks, dateReviver));
        if (savedSettings) setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    };
    
    loadData();
  }, []);
  
  // Calculate productivity stats whenever tasks or timeBlocks change
  useEffect(() => {
    const stats = calculateProductivityStats(tasks, timeBlocks);
    setProductivityStats(stats);
  }, [tasks, timeBlocks]);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
      localStorage.setItem('projects', JSON.stringify(projects));
      localStorage.setItem('timeBlocks', JSON.stringify(timeBlocks));
      localStorage.setItem('settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }, [tasks, projects, timeBlocks, settings]);
  
  // Helper for reviving dates from JSON
  function dateReviver(key: string, value: any) {
    if (typeof value === 'string' && 
        (key === 'deadline' || key === 'createdAt' || key === 'start' || key === 'end')) {
      return new Date(value);
    }
    return value;
  }
  
  const addTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: uuidv4(),
      title: taskData.title || 'New Task',
      description: taskData.description || '',
      deadline: taskData.deadline,
      completed: taskData.completed || false,
      priority: taskData.priority || 'notUrgent-notImportant',
      category: taskData.category,
      timeEstimate: taskData.timeEstimate,
      dependsOn: taskData.dependsOn || [],
      createdAt: new Date(),
      tags: taskData.tags || [],
    };
    
    setTasks([...tasks, newTask]);
    return newTask;
  };
  
  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };
  
  const deleteTask = (id: string) => {
    // Remove task from all projects
    setProjects(projects.map(project => ({
      ...project,
      tasks: project.tasks.filter(taskId => taskId !== id)
    })));
    
    // Remove associated time blocks
    setTimeBlocks(timeBlocks.filter(block => block.taskId !== id));
    
    // Remove the task
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  const completeTask = (id: string) => {
    updateTask(id, { completed: true });
    
    // Also mark all associated time blocks as completed
    setTimeBlocks(timeBlocks.map(block => 
      block.taskId === id ? { ...block, completed: true } : block
    ));
  };
  
  const addProject = (projectData: Partial<Project>) => {
    const newProject: Project = {
      id: uuidv4(),
      name: projectData.name || 'New Project',
      description: projectData.description || '',
      tasks: projectData.tasks || [],
      deadline: projectData.deadline,
      progress: projectData.progress || 0,
      createdAt: new Date(),
    };
    
    setProjects([...projects, newProject]);
    return newProject;
  };
  
  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(projects.map(project => 
      project.id === id ? { ...project, ...updates } : project
    ));
  };
  
  const deleteProject = (id: string) => {
    setProjects(projects.filter(project => project.id !== id));
    // Note: We're not deleting the tasks in the project
  };
  
  const addTaskToProject = (taskId: string, projectId: string) => {
    setProjects(projects.map(project => 
      project.id === projectId ? 
        { ...project, tasks: [...project.tasks, taskId] } : 
        project
    ));
  };
  
  const removeTaskFromProject = (taskId: string, projectId: string) => {
    setProjects(projects.map(project => 
      project.id === projectId ? 
        { ...project, tasks: project.tasks.filter(id => id !== taskId) } : 
        project
    ));
  };
  
  const createTaskFromText = (text: string): Task | null => {
    const extracted = extractTasksFromText(text);
    if (!extracted) return null;
    
    const newTask = addTask({
      title: extracted.title,
      deadline: extracted.deadline,
      priority: extracted.priority as Task['priority'],
      timeEstimate: extracted.timeEstimate,
      category: extracted.category,
      tags: extracted.tags,
    });
    
    return newTask;
  };
  
  const generateSchedule = () => {
    const newSchedule = createSchedule(tasks, settings, timeBlocks);
    setTimeBlocks(newSchedule);
  };
  
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings({ ...settings, ...newSettings });
  };
  
  const getPriorityTasks = (limit = 5): Task[] => {
    return getHighImpactTasks(tasks, limit);
  };
  
  const getProductivityTips = (): string[] => {
    return generateProductivityTips(productivityStats);
  };
  
  const value: TaskContextType = {
    tasks,
    projects,
    timeBlocks,
    settings,
    productivityStats,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    addProject,
    updateProject,
    deleteProject,
    addTaskToProject,
    removeTaskFromProject,
    createTaskFromText,
    extractTasksFromText,
    generateSchedule,
    updateSettings,
    getPriorityTasks,
    getProductivityTips,
  };
  
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTaskContext = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

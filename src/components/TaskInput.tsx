
import React, { useState } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { toast } from '@/components/ui/sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Clock, Tag, Calendar, Hash, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TaskInput = () => {
  const [input, setInput] = useState('');
  const { createTaskFromText } = useTaskContext();
  
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const newTask = createTaskFromText(input.trim());
      if (newTask) {
        toast.success('Task added successfully');
        setInput('');
      } else {
        toast.error('Failed to create task');
      }
    }
  };
  
  const renderNlpExamples = () => {
    const examples = [
      {
        text: "Complete project report by Friday #work @important",
        icon: <Calendar className="h-4 w-4" />,
      },
      {
        text: "Buy groceries tomorrow 30 mins #personal",
        icon: <Clock className="h-4 w-4" />,
      },
      {
        text: "Call mom urgent @family",
        icon: <Tag className="h-4 w-4" />,
      },
    ];
    
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {examples.map((example, index) => (
          <Badge 
            key={index} 
            variant="outline" 
            className="cursor-pointer hover:bg-accent px-3 py-1.5 flex items-center gap-1"
            onClick={() => setInput(example.text)}
          >
            {example.icon}
            {example.text}
          </Badge>
        ))}
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Natural Language Task Input</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Add tasks using natural language - include deadlines, priorities, duration, categories (#) and tags (@)
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddTask} className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="E.g. Complete project report by Friday #work @important"
                className="flex-1"
                autoComplete="off"
              />
              <Button type="submit">
                Add Task
              </Button>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {input && input.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm"
                  >
                    <NlpPreview text={input} />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="text-xs text-muted-foreground">
                <div className="font-medium mb-1">Try these examples:</div>
                {renderNlpExamples()}
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const NlpPreview = ({ text }: { text: string }) => {
  const { extractTasksFromText } = useTaskContext();
  const extracted = extractTasksFromText ? extractTasksFromText(text) : null;
  
  if (!extracted) return null;
  
  return (
    <div className="border rounded-md p-3 bg-muted/40 space-y-2">
      <div className="font-medium">Preview:</div>
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <div className="w-20 text-xs text-muted-foreground">Title:</div>
          <div>{extracted.title || "Untitled Task"}</div>
        </div>
        {extracted.deadline && (
          <div className="flex items-center gap-1.5">
            <div className="w-20 text-xs text-muted-foreground">Deadline:</div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{extracted.deadline.toDateString()}</span>
            </div>
          </div>
        )}
        {extracted.priority && (
          <div className="flex items-center gap-1.5">
            <div className="w-20 text-xs text-muted-foreground">Priority:</div>
            <Badge variant="outline" className={`
              ${extracted.priority === 'urgent-important' ? 'text-red-500 border-red-200 bg-red-50' : ''}
              ${extracted.priority === 'urgent-notImportant' ? 'text-orange-500 border-orange-200 bg-orange-50' : ''}
              ${extracted.priority === 'notUrgent-important' ? 'text-yellow-500 border-yellow-200 bg-yellow-50' : ''}
              ${extracted.priority === 'notUrgent-notImportant' ? 'text-blue-500 border-blue-200 bg-blue-50' : ''}
            `}>
              {extracted.priority === 'urgent-important' && 'Urgent & Important'}
              {extracted.priority === 'urgent-notImportant' && 'Urgent'}
              {extracted.priority === 'notUrgent-important' && 'Important'}
              {extracted.priority === 'notUrgent-notImportant' && 'Normal'}
            </Badge>
          </div>
        )}
        {extracted.timeEstimate && (
          <div className="flex items-center gap-1.5">
            <div className="w-20 text-xs text-muted-foreground">Estimate:</div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                {extracted.timeEstimate >= 60 
                  ? `${Math.floor(extracted.timeEstimate / 60)}h ${extracted.timeEstimate % 60}m` 
                  : `${extracted.timeEstimate}m`}
              </span>
            </div>
          </div>
        )}
        {extracted.category && (
          <div className="flex items-center gap-1.5">
            <div className="w-20 text-xs text-muted-foreground">Category:</div>
            <div className="flex items-center gap-1">
              <Hash className="h-3.5 w-3.5 text-muted-foreground" />
              <Badge variant="secondary">{extracted.category}</Badge>
            </div>
          </div>
        )}
        {extracted.tags && extracted.tags.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-20 text-xs text-muted-foreground">Tags:</div>
            <div className="flex flex-wrap gap-1">
              {extracted.tags.map((tag, i) => (
                <Badge key={i} variant="outline">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskInput;

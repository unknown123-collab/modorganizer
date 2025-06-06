
export const extractTasksFromText = (text: string): { 
  title: string; 
  deadline?: Date; 
  priority?: string;
  timeEstimate?: number;
  category?: string;
  tags?: string[];
} | null => {
  if (!text || text.trim() === '') return null;
  
  let title = text.trim();
  let deadline: Date | undefined = undefined;
  let priority: string | undefined = undefined;
  let timeEstimate: number | undefined = undefined;
  let category: string | undefined = undefined;
  let tags: string[] | undefined = undefined;
  
  // Extract deadline using regex
  const dateRegex = /by\s(tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)(\s\d{1,2}(st|nd|rd|th)?)?(\s\d{4})?/i;
  const dateMatch = text.match(dateRegex);
  
  if (dateMatch) {
    const dateString = dateMatch[0].substring(3);
    deadline = parseRelativeDate(dateString);
    title = title.replace(dateMatch[0], '').trim();
  }
  
  // Extract time estimate
  const timeRegex = /(\d+)\s*(min|mins|minutes|hour|hours|hr|hrs)/i;
  const timeMatch = text.match(timeRegex);
  
  if (timeMatch) {
    const amount = parseInt(timeMatch[1], 10);
    const unit = timeMatch[2].toLowerCase();
    
    if (unit.startsWith('hour') || unit === 'hr' || unit === 'hrs') {
      timeEstimate = amount * 60;
    } else {
      timeEstimate = amount;
    }
    
    title = title.replace(timeMatch[0], '').trim();
  }
  
  // Extract priority
  const priorityRegex = /(urgent|important|critical|high priority|medium priority|low priority)/i;
  const priorityMatch = text.match(priorityRegex);
  
  if (priorityMatch) {
    const priorityText = priorityMatch[0].toLowerCase();
    
    if (priorityText === 'urgent' || priorityText === 'critical' || priorityText === 'high priority') {
      priority = 'urgent-important';
    } else if (priorityText === 'important') {
      priority = 'notUrgent-important';
    } else if (priorityText === 'medium priority') {
      priority = 'urgent-notImportant';
    } else {
      priority = 'notUrgent-notImportant';
    }
    
    title = title.replace(priorityMatch[0], '').trim();
  }

  // Extract category
  const categoryRegex = /#(\w+)/i;
  const categoryMatch = text.match(categoryRegex);

  if (categoryMatch) {
    category = categoryMatch[1];
    title = title.replace(categoryMatch[0], '').trim();
  }

  // Extract tags
  const tagMatches = text.match(/@(\w+)/g);
  if (tagMatches) {
    tags = tagMatches.map(tag => tag.substring(1));
    tagMatches.forEach(tag => {
      title = title.replace(tag, '').trim();
    });
  }
  
  return {
    title,
    deadline,
    priority,
    timeEstimate,
    category,
    tags,
  };
};

function parseRelativeDate(dateString: string): Date {
  const today = new Date();
  const lowerDateString = dateString.toLowerCase();
  
  if (lowerDateString === 'today') {
    return today;
  } else if (lowerDateString === 'tomorrow') {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow;
  }
  
  // Handle day of week
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayIndex = days.findIndex(day => lowerDateString.startsWith(day));
  
  if (dayIndex !== -1) {
    const targetDate = new Date(today);
    const currentDayOfWeek = today.getDay();
    let daysToAdd = dayIndex - currentDayOfWeek;
    
    if (daysToAdd <= 0) {
      daysToAdd += 7;
    }
    
    targetDate.setDate(today.getDate() + daysToAdd);
    return targetDate;
  }
  
  // Try to parse as an absolute date
  try {
    const parsedDate = new Date(dateString);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  } catch {
    // If parsing fails, return today's date as fallback
  }
  
  return today;
}

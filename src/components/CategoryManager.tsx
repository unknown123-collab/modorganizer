import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Tag, Trash2 } from 'lucide-react';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';

const CategoryManager = () => {
  const { categories, addCategory, loading } = useSupabaseTasks();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');

  const predefinedColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
  ];

  const defaultCategories = [
    { name: 'Work', color: '#3B82F6' },
    { name: 'Personal', color: '#10B981' },
    { name: 'Health', color: '#F59E0B' },
    { name: 'Learning', color: '#8B5CF6' },
    { name: 'Shopping', color: '#EF4444' }
  ];

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    await addCategory(newCategoryName.trim(), selectedColor);
    setNewCategoryName('');
    setSelectedColor('#3B82F6');
  };

  const handleAddDefaultCategories = async () => {
    for (const category of defaultCategories) {
      await addCategory(category.name, category.color);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Categories
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-muted-foreground/20 rounded-lg">
            <Tag className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              No categories yet. Add some to organize your tasks!
            </p>
            <Button 
              onClick={handleAddDefaultCategories}
              variant="outline"
              className="mb-2"
            >
              Add Default Categories
            </Button>
          </div>
        )}

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Badge
                key={category.id}
                variant="secondary"
                className="px-3 py-1"
                style={{ 
                  backgroundColor: `${category.color}20`,
                  borderColor: category.color,
                  color: category.color
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full mr-2" 
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </Badge>
            ))}
          </div>
        )}

        <form onSubmit={handleAddCategory} className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1"
            />
            <div className="flex gap-1">
              {predefinedColors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? 'border-foreground' : 'border-muted'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <Button type="submit" size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CategoryManager;
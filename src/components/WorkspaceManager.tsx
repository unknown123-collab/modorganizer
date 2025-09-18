import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2,
  Plus,
  Settings,
  Users,
  Palette,
  Shield,
  Crown,
  User,
  MoreHorizontal,
  Archive,
  Star,
  Globe,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

// Utility functions
const getTypeIcon = (type: Workspace['type']) => {
  switch (type) {
    case 'personal': return <User className="h-4 w-4" />;
    case 'team': return <Users className="h-4 w-4" />;
    case 'enterprise': return <Building2 className="h-4 w-4" />;
  }
};

const getPrivacyIcon = (privacy: Workspace['privacy']) => {
  switch (privacy) {
    case 'private': return <Lock className="h-4 w-4" />;
    case 'team': return <Users className="h-4 w-4" />;
    case 'public': return <Globe className="h-4 w-4" />;
  }
};

const getTypeBadgeVariant = (type: Workspace['type']) => {
  switch (type) {
    case 'personal': return 'outline' as const;
    case 'team': return 'secondary' as const;
    case 'enterprise': return 'default' as const;
  }
};

interface Workspace {
  id: string;
  name: string;
  description: string;
  type: 'personal' | 'team' | 'enterprise';
  members: number;
  owner: string;
  theme: 'light' | 'dark' | 'auto';
  privacy: 'private' | 'team' | 'public';
  features: string[];
  createdAt: Date;
  isActive: boolean;
  isFavorite: boolean;
}

interface WorkspaceTheme {
  id: string;
  name: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
  };
}

const WorkspaceManager = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: '1',
      name: 'Personal Tasks',
      description: 'My personal productivity workspace',
      type: 'personal',
      members: 1,
      owner: 'You',
      theme: 'light',
      privacy: 'private',
      features: ['Tasks', 'Calendar', 'Analytics'],
      createdAt: new Date('2023-01-15'),
      isActive: true,
      isFavorite: true
    },
    {
      id: '2',
      name: 'Product Team',
      description: 'Collaborative workspace for product development',
      type: 'team',
      members: 8,
      owner: 'John Doe',
      theme: 'dark',
      privacy: 'team',
      features: ['Tasks', 'Projects', 'Team Analytics', 'Time Tracking'],
      createdAt: new Date('2023-02-01'),
      isActive: false,
      isFavorite: false
    },
    {
      id: '3',
      name: 'Enterprise Hub',
      description: 'Organization-wide task management',
      type: 'enterprise',
      members: 127,
      owner: 'Admin',
      theme: 'auto',
      privacy: 'public',
      features: ['All Features', 'Advanced Analytics', 'Integrations', 'Custom Reports'],
      createdAt: new Date('2023-01-01'),
      isActive: false,
      isFavorite: true
    }
  ]);

  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [newWorkspaceDialogOpen, setNewWorkspaceDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  const themes: WorkspaceTheme[] = [
    {
      id: 'default',
      name: 'Default Blue',
      preview: 'bg-blue-500',
      colors: { primary: '#3B82F6', secondary: '#EFF6FF', background: '#FFFFFF' }
    },
    {
      id: 'green',
      name: 'Nature Green',
      preview: 'bg-green-500',
      colors: { primary: '#10B981', secondary: '#ECFDF5', background: '#FFFFFF' }
    },
    {
      id: 'purple',
      name: 'Royal Purple',
      preview: 'bg-purple-500',
      colors: { primary: '#8B5CF6', secondary: '#F3F4F6', background: '#FFFFFF' }
    },
    {
      id: 'orange',
      name: 'Warm Orange',
      preview: 'bg-orange-500',
      colors: { primary: '#F59E0B', secondary: '#FEF3C7', background: '#FFFFFF' }
    }
  ];

  const handleSwitchWorkspace = (workspaceId: string) => {
    setWorkspaces(prev => prev.map(workspace => ({
      ...workspace,
      isActive: workspace.id === workspaceId
    })));
    
    const workspace = workspaces.find(w => w.id === workspaceId);
    toast.success(`Switched to ${workspace?.name}`);
  };

  const handleToggleFavorite = (workspaceId: string) => {
    setWorkspaces(prev => prev.map(workspace => 
      workspace.id === workspaceId 
        ? { ...workspace, isFavorite: !workspace.isFavorite }
        : workspace
    ));
  };


  const handleCreateWorkspace = (data: { name: string; description: string; type: Workspace['type'] }) => {
    const newWorkspace: Workspace = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description,
      type: data.type,
      members: 1,
      owner: 'You',
      theme: 'light',
      privacy: 'private',
      features: ['Tasks', 'Calendar'],
      createdAt: new Date(),
      isActive: false,
      isFavorite: false
    };

    setWorkspaces(prev => [...prev, newWorkspace]);
    setNewWorkspaceDialogOpen(false);
    toast.success('Workspace created successfully');
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workspace Manager</h2>
          <p className="text-muted-foreground">Manage your workspaces and switch between different contexts</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={newWorkspaceDialogOpen} onOpenChange={setNewWorkspaceDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Workspace
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Workspace</DialogTitle>
                <DialogDescription>
                  Set up a new workspace for your projects and team collaboration
                </DialogDescription>
              </DialogHeader>
              <CreateWorkspaceForm onSubmit={handleCreateWorkspace} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Workspaces</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <WorkspaceGrid 
            workspaces={workspaces}
            onSwitchWorkspace={handleSwitchWorkspace}
            onToggleFavorite={handleToggleFavorite}
            onOpenSettings={(workspace) => {
              setSelectedWorkspace(workspace);
              setSettingsDialogOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="favorites">
          <WorkspaceGrid 
            workspaces={workspaces.filter(w => w.isFavorite)}
            onSwitchWorkspace={handleSwitchWorkspace}
            onToggleFavorite={handleToggleFavorite}
            onOpenSettings={(workspace) => {
              setSelectedWorkspace(workspace);
              setSettingsDialogOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="recent">
          <WorkspaceGrid 
            workspaces={workspaces.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())}
            onSwitchWorkspace={handleSwitchWorkspace}
            onToggleFavorite={handleToggleFavorite}
            onOpenSettings={(workspace) => {
              setSelectedWorkspace(workspace);
              setSettingsDialogOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="archived">
          <div className="text-center py-12">
            <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Archived Workspaces</h3>
            <p className="text-muted-foreground">Archived workspaces will appear here</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Workspace Settings Dialog */}
      {selectedWorkspace && (
        <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Workspace Settings</DialogTitle>
              <DialogDescription>
                Customize {selectedWorkspace.name} settings and preferences
              </DialogDescription>
            </DialogHeader>
            <WorkspaceSettings 
              workspace={selectedWorkspace}
              themes={themes}
              onSave={(updatedWorkspace) => {
                setWorkspaces(prev => prev.map(w => 
                  w.id === updatedWorkspace.id ? updatedWorkspace : w
                ));
                setSettingsDialogOpen(false);
                toast.success('Workspace settings updated');
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const WorkspaceGrid = ({ 
  workspaces, 
  onSwitchWorkspace, 
  onToggleFavorite, 
  onOpenSettings 
}: {
  workspaces: Workspace[];
  onSwitchWorkspace: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenSettings: (workspace: Workspace) => void;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workspaces.map(workspace => (
        <Card 
          key={workspace.id} 
          className={`hover:shadow-lg transition-shadow cursor-pointer ${
            workspace.isActive ? 'ring-2 ring-primary' : ''
          }`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  {getTypeIcon(workspace.type)}
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {workspace.name}
                    {workspace.isActive && <Badge className="text-xs">Active</Badge>}
                    {workspace.isFavorite && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getTypeBadgeVariant(workspace.type)} className="text-xs">
                      {workspace.type}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {getPrivacyIcon(workspace.privacy)}
                      <span>{workspace.privacy}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onToggleFavorite(workspace.id)}
              >
                <Star className={`h-4 w-4 ${workspace.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </Button>
            </div>
            <CardDescription>{workspace.description}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Members:</span>
                <span className="font-medium">{workspace.members}</span>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Features:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {workspace.features.slice(0, 3).map(feature => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {workspace.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{workspace.features.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {!workspace.isActive ? (
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onSwitchWorkspace(workspace.id)}
                  >
                    Switch to this workspace
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1" 
                    disabled
                  >
                    Current Workspace
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onOpenSettings(workspace)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const CreateWorkspaceForm = ({ 
  onSubmit 
}: { 
  onSubmit: (data: { name: string; description: string; type: Workspace['type'] }) => void;
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Workspace['type']>('personal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({ name: name.trim(), description: description.trim(), type });
      setName('');
      setDescription('');
      setType('personal');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="workspace-name">Workspace Name</Label>
        <Input
          id="workspace-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter workspace name"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="workspace-description">Description</Label>
        <Input
          id="workspace-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the workspace"
        />
      </div>

      <div>
        <Label htmlFor="workspace-type">Workspace Type</Label>
        <Select value={type} onValueChange={(value: Workspace['type']) => setType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="team">Team</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">Create Workspace</Button>
      </div>
    </form>
  );
};

const WorkspaceSettings = ({ 
  workspace, 
  themes, 
  onSave 
}: { 
  workspace: Workspace;
  themes: WorkspaceTheme[];
  onSave: (workspace: Workspace) => void;
}) => {
  const [settings, setSettings] = useState(workspace);

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="theme">Theme</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4">
        <div>
          <Label htmlFor="name">Workspace Name</Label>
          <Input
            id="name"
            value={settings.name}
            onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={settings.description}
            onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div>
          <Label>Privacy Setting</Label>
          <Select 
            value={settings.privacy} 
            onValueChange={(value: Workspace['privacy']) => setSettings(prev => ({ ...prev, privacy: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="team">Team</SelectItem>
              <SelectItem value="public">Public</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TabsContent>

      <TabsContent value="theme" className="space-y-4">
        <div>
          <Label>Theme Preference</Label>
          <Select 
            value={settings.theme} 
            onValueChange={(value: Workspace['theme']) => setSettings(prev => ({ ...prev, theme: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="auto">Auto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Color Theme</Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {themes.map(theme => (
              <Card key={theme.id} className="p-4 cursor-pointer hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${theme.preview}`}></div>
                  <div>
                    <h4 className="font-medium text-sm">{theme.name}</h4>
                    <div className="flex gap-1 mt-1">
                      {Object.values(theme.colors).map((color, index) => (
                        <div 
                          key={index}
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="members" className="space-y-4">
        <div className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Member Management</h3>
          <p className="text-muted-foreground">Invite and manage workspace members</p>
          <Button className="mt-4" disabled>Coming Soon</Button>
        </div>
      </TabsContent>

      <TabsContent value="advanced" className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Advanced Features</Label>
              <p className="text-sm text-muted-foreground">Access beta features and advanced functionality</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>API Access</Label>
              <p className="text-sm text-muted-foreground">Enable API access for this workspace</p>
            </div>
            <Switch />
          </div>
        </div>
      </TabsContent>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={() => {}}>Cancel</Button>
        <Button onClick={() => onSave(settings)}>Save Changes</Button>
      </div>
    </Tabs>
  );
};

export default WorkspaceManager;
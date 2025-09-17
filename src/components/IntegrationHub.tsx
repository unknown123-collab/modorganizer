import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  Mail,
  Webhook,
  Slack,
  Github,
  Settings,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Plus,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'calendar' | 'communication' | 'development' | 'automation';
  status: 'connected' | 'available' | 'requires-setup';
  features: string[];
  settings?: Record<string, any>;
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
}

const IntegrationHub = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sync tasks and deadlines with your Google Calendar',
      icon: Calendar,
      category: 'calendar',
      status: 'available',
      features: ['Two-way sync', 'Deadline reminders', 'Meeting blocks'],
    },
    {
      id: 'outlook-calendar',
      name: 'Outlook Calendar',
      description: 'Integrate with Microsoft Outlook Calendar',
      icon: Calendar,
      category: 'calendar',
      status: 'available',
      features: ['Calendar sync', 'Meeting integration', 'Reminders'],
    },
    {
      id: 'email-notifications',
      name: 'Email Notifications',
      description: 'Get task updates and reminders via email',
      icon: Mail,
      category: 'communication',
      status: 'connected',
      features: ['Daily summaries', 'Due date alerts', 'Team notifications'],
      settings: { enabled: true, frequency: 'daily' }
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Send notifications and updates to Slack channels',
      icon: Slack,
      category: 'communication',
      status: 'available',
      features: ['Channel notifications', 'Direct messages', 'Task creation'],
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Link tasks to GitHub issues and pull requests',
      icon: Github,
      category: 'development',
      status: 'available',
      features: ['Issue linking', 'PR tracking', 'Commit references'],
    }
  ]);

  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: '1',
      name: 'Task Updates API',
      url: 'https://api.example.com/webhooks/tasks',
      events: ['task.created', 'task.completed', 'task.updated'],
      active: true
    }
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);

  const handleToggleIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === integrationId) {
        const newStatus = integration.status === 'connected' ? 'available' : 'connected';
        toast.success(
          newStatus === 'connected' 
            ? `${integration.name} connected successfully`
            : `${integration.name} disconnected`
        );
        return { ...integration, status: newStatus };
      }
      return integration;
    }));
  };

  const handleConfigureIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'requires-setup': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return <Badge className="bg-green-100 text-green-800 border-green-200">Connected</Badge>;
      case 'requires-setup': return <Badge variant="outline" className="border-orange-200 text-orange-800">Setup Required</Badge>;
      default: return <Badge variant="outline">Available</Badge>;
    }
  };

  const addWebhook = (webhook: Omit<WebhookConfig, 'id'>) => {
    const newWebhook: WebhookConfig = {
      ...webhook,
      id: Date.now().toString()
    };
    setWebhooks(prev => [...prev, newWebhook]);
    toast.success('Webhook added successfully');
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'requires-setup': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return <Badge className="bg-green-100 text-green-800 border-green-200">Connected</Badge>;
      case 'requires-setup': return <Badge variant="outline" className="border-orange-200 text-orange-800">Setup Required</Badge>;
      default: return <Badge variant="outline">Available</Badge>;
    }
  };

  const getCategoryIntegrations = (category: Integration['category']) => {
    return integrations.filter(integration => integration.category === category);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integration Hub</h2>
          <p className="text-muted-foreground">Connect your favorite tools and services</p>
        </div>
        
        <Dialog open={webhookDialogOpen} onOpenChange={setWebhookDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Webhook className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Webhook</DialogTitle>
              <DialogDescription>
                Configure a webhook to receive real-time updates
              </DialogDescription>
            </DialogHeader>
            <WebhookForm onSubmit={addWebhook} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <IntegrationGrid 
            integrations={integrations}
            onToggle={handleToggleIntegration}
            onConfigure={handleConfigureIntegration}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <IntegrationGrid 
            integrations={getCategoryIntegrations('calendar')}
            onToggle={handleToggleIntegration}
            onConfigure={handleConfigureIntegration}
          />
        </TabsContent>

        <TabsContent value="communication">
          <IntegrationGrid 
            integrations={getCategoryIntegrations('communication')}
            onToggle={handleToggleIntegration}
            onConfigure={handleConfigureIntegration}
          />
        </TabsContent>

        <TabsContent value="development">
          <IntegrationGrid 
            integrations={getCategoryIntegrations('development')}
            onToggle={handleToggleIntegration}
            onConfigure={handleConfigureIntegration}
          />
        </TabsContent>

        <TabsContent value="automation">
          <div className="space-y-6">
            <IntegrationGrid 
              integrations={getCategoryIntegrations('automation')}
              onToggle={handleToggleIntegration}
              onConfigure={handleConfigureIntegration}
            />
            
            {/* Webhooks Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Webhooks
                </CardTitle>
                <CardDescription>
                  Configure webhooks to receive real-time updates from your task management system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {webhooks.map(webhook => (
                    <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{webhook.name}</h4>
                        <p className="text-sm text-muted-foreground">{webhook.url}</p>
                        <div className="flex gap-1 mt-2">
                          {webhook.events.map(event => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={webhook.active}
                          onCheckedChange={(checked) => {
                            setWebhooks(prev => prev.map(w => 
                              w.id === webhook.id ? { ...w, active: checked } : w
                            ));
                          }}
                        />
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Integration Configuration Modal */}
      {selectedIntegration && (
        <IntegrationConfigModal 
          integration={selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
          onSave={(settings) => {
            setIntegrations(prev => prev.map(integration =>
              integration.id === selectedIntegration.id
                ? { ...integration, settings, status: 'connected' }
                : integration
            ));
            setSelectedIntegration(null);
            toast.success('Integration configured successfully');
          }}
        />
      )}
    </div>
  );
};

const IntegrationGrid = ({ 
  integrations, 
  onToggle, 
  onConfigure 
}: { 
  integrations: Integration[];
  onToggle: (id: string) => void;
  onConfigure: (integration: Integration) => void;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {integrations.map(integration => {
        const IconComponent = integration.icon;
        return (
          <Card key={integration.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    {getStatusIcon(integration.status)}
                  </div>
                </div>
                {getStatusBadge(integration.status)}
              </div>
              <CardDescription>{integration.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {integration.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  {integration.status === 'connected' ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => onConfigure(integration)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onToggle(integration.id)}
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className="flex-1"
                      onClick={() => onToggle(integration.id)}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

const WebhookForm = ({ onSubmit }: { onSubmit: (webhook: Omit<WebhookConfig, 'id'>) => void }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<string[]>(['task.created']);

  const availableEvents = [
    'task.created',
    'task.updated',
    'task.completed',
    'task.deleted',
    'project.created',
    'team.member.added'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && url) {
      onSubmit({
        name,
        url,
        events,
        active: true
      });
      setName('');
      setUrl('');
      setEvents(['task.created']);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="webhook-name">Name</Label>
        <Input
          id="webhook-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Webhook"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="webhook-url">URL</Label>
        <Input
          id="webhook-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/webhooks"
          required
        />
      </div>

      <div>
        <Label>Events</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {availableEvents.map(event => (
            <label key={event} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={events.includes(event)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setEvents(prev => [...prev, event]);
                  } else {
                    setEvents(prev => prev.filter(e => e !== event));
                  }
                }}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{event}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Add Webhook</Button>
      </div>
    </form>
  );
};

const IntegrationConfigModal = ({ 
  integration, 
  onClose, 
  onSave 
}: { 
  integration: Integration;
  onClose: () => void;
  onSave: (settings: any) => void;
}) => {
  const [settings, setSettings] = useState(integration.settings || {});

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure {integration.name}</DialogTitle>
          <DialogDescription>
            Customize your {integration.name} integration settings
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {integration.id === 'email-notifications' && (
            <EmailNotificationSettings settings={settings} setSettings={setSettings} />
          )}
          
          {integration.id === 'google-calendar' && (
            <CalendarSettings settings={settings} setSettings={setSettings} />
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => onSave(settings)}>Save Settings</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const EmailNotificationSettings = ({ settings, setSettings }: any) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Enable Email Notifications</Label>
        <Switch 
          checked={settings.enabled || false}
          onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
        />
      </div>
      
      <div>
        <Label>Frequency</Label>
        <select 
          className="w-full p-2 border rounded-md mt-1"
          value={settings.frequency || 'daily'}
          onChange={(e) => setSettings(prev => ({ ...prev, frequency: e.target.value }))}
        >
          <option value="immediate">Immediate</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>
    </div>
  );
};

const CalendarSettings = ({ settings, setSettings }: any) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Two-way Sync</Label>
        <Switch 
          checked={settings.twoWaySync || false}
          onCheckedChange={(checked) => setSettings(prev => ({ ...prev, twoWaySync: checked }))}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Label>Create Calendar Events for Tasks</Label>
        <Switch 
          checked={settings.createEvents || false}
          onCheckedChange={(checked) => setSettings(prev => ({ ...prev, createEvents: checked }))}
        />
      </div>
    </div>
  );
};

export default IntegrationHub;
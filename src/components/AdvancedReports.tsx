import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
  FileText,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Users,
  Clock,
  Target,
  Filter,
  Settings,
  Share2,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'productivity' | 'team' | 'project' | 'time';
  icon: React.ComponentType<any>;
  filters: ReportFilter[];
  exportFormats: ('pdf' | 'csv' | 'xlsx' | 'json')[];
}

interface ReportFilter {
  id: string;
  name: string;
  type: 'date' | 'select' | 'multiselect' | 'number';
  options?: string[];
  required: boolean;
}

interface GeneratedReport {
  id: string;
  name: string;
  template: string;
  generatedAt: Date;
  parameters: Record<string, any>;
  status: 'generating' | 'completed' | 'failed';
  downloadUrl?: string;
}

const AdvancedReports = () => {
  const [reportTemplates] = useState<ReportTemplate[]>([
    {
      id: 'productivity-overview',
      name: 'Productivity Overview',
      description: 'Comprehensive productivity metrics and trends',
      type: 'productivity',
      icon: BarChart3,
      filters: [
        { id: 'dateRange', name: 'Date Range', type: 'date', required: true },
        { id: 'team', name: 'Team', type: 'select', options: ['All Teams', 'Product', 'Marketing'], required: false },
        { id: 'priority', name: 'Task Priority', type: 'multiselect', options: ['High', 'Medium', 'Low'], required: false }
      ],
      exportFormats: ['pdf', 'csv', 'xlsx']
    },
    {
      id: 'team-performance',
      name: 'Team Performance Analysis',
      description: 'Detailed team performance metrics and comparisons',
      type: 'team',
      icon: Users,
      filters: [
        { id: 'dateRange', name: 'Date Range', type: 'date', required: true },
        { id: 'teams', name: 'Teams', type: 'multiselect', options: ['Product', 'Marketing', 'Engineering'], required: true },
        { id: 'metrics', name: 'Metrics', type: 'multiselect', options: ['Completion Rate', 'Time Efficiency', 'Collaboration Score'], required: false }
      ],
      exportFormats: ['pdf', 'xlsx', 'csv']
    },
    {
      id: 'project-status',
      name: 'Project Status Report',
      description: 'Project progress, milestones, and resource allocation',
      type: 'project',
      icon: Target,
      filters: [
        { id: 'projects', name: 'Projects', type: 'multiselect', options: ['Project Alpha', 'Project Beta', 'Project Gamma'], required: true },
        { id: 'status', name: 'Status', type: 'multiselect', options: ['Active', 'On Hold', 'Completed'], required: false },
        { id: 'includeArchived', name: 'Include Archived', type: 'select', options: ['Yes', 'No'], required: false }
      ],
      exportFormats: ['pdf', 'xlsx', 'json']
    },
    {
      id: 'time-tracking',
      name: 'Time Tracking Analysis',
      description: 'Time allocation, efficiency, and utilization metrics',
      type: 'time',
      icon: Clock,
      filters: [
        { id: 'dateRange', name: 'Date Range', type: 'date', required: true },
        { id: 'users', name: 'Users', type: 'multiselect', options: ['All Users', 'John Doe', 'Jane Smith'], required: false },
        { id: 'categories', name: 'Task Categories', type: 'multiselect', options: ['Development', 'Design', 'Meeting'], required: false }
      ],
      exportFormats: ['pdf', 'csv', 'xlsx']
    }
  ]);

  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([
    {
      id: '1',
      name: 'Weekly Productivity Report',
      template: 'productivity-overview',
      generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      parameters: { dateRange: 'last-week', team: 'All Teams' },
      status: 'completed',
      downloadUrl: '/reports/weekly-productivity.pdf'
    },
    {
      id: '2',
      name: 'Q4 Team Performance',
      template: 'team-performance',
      generatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      parameters: { dateRange: 'Q4-2023', teams: ['Product', 'Engineering'] },
      status: 'completed',
      downloadUrl: '/reports/q4-team-performance.xlsx'
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [customReportDialogOpen, setCustomReportDialogOpen] = useState(false);

  const handleGenerateReport = (template: ReportTemplate, parameters: Record<string, any>) => {
    const newReport: GeneratedReport = {
      id: Date.now().toString(),
      name: `${template.name} - ${format(new Date(), 'MMM dd, yyyy')}`,
      template: template.id,
      generatedAt: new Date(),
      parameters,
      status: 'generating'
    };

    setGeneratedReports(prev => [newReport, ...prev]);
    setReportDialogOpen(false);
    toast.success('Report generation started');

    // Simulate report generation
    setTimeout(() => {
      setGeneratedReports(prev => prev.map(report => 
        report.id === newReport.id 
          ? { ...report, status: 'completed' as const, downloadUrl: `/reports/${template.id}-${newReport.id}.pdf` }
          : report
      ));
      toast.success('Report generated successfully');
    }, 3000);
  };

  const handleDownloadReport = (report: GeneratedReport) => {
    // Simulate download
    toast.success(`Downloading ${report.name}`);
  };

  const handleShareReport = (report: GeneratedReport) => {
    // Simulate sharing
    toast.success(`Share link copied for ${report.name}`);
  };

  const getStatusBadge = (status: GeneratedReport['status']) => {
    switch (status) {
      case 'generating':
        return <Badge className="bg-blue-100 text-blue-800">Generating</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Ready</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
    }
  };

  const getTypeIcon = (type: ReportTemplate['type']) => {
    switch (type) {
      case 'productivity': return BarChart3;
      case 'team': return Users;
      case 'project': return Target;
      case 'time': return Clock;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Reports</h2>
          <p className="text-muted-foreground">Generate detailed insights and analytics reports</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={customReportDialogOpen} onOpenChange={setCustomReportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Custom Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Custom Report</DialogTitle>
                <DialogDescription>
                  Build a custom report with your specific requirements
                </DialogDescription>
              </DialogHeader>
              <CustomReportBuilder />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="generated">Generated Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTemplates.map(template => {
              const IconComponent = template.icon;
              return (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {template.type}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Export Formats:</h4>
                        <div className="flex gap-1 flex-wrap">
                          {template.exportFormats.map(format => (
                            <Badge key={format} variant="outline" className="text-xs">
                              {format.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Filters Available:</h4>
                        <p className="text-xs text-muted-foreground">
                          {template.filters.length} customizable filters
                        </p>
                      </div>

                      <Button 
                        className="w-full"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setReportDialogOpen(true);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="generated">
          <div className="space-y-4">
            {generatedReports.map(report => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{report.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Generated {format(report.generatedAt, 'MMM dd, yyyy at HH:mm')}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(report.status)}
                          <Badge variant="outline" className="text-xs">
                            {report.template}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {report.status === 'completed' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleShareReport(report)}
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleDownloadReport(report)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled">
          <ScheduledReports />
        </TabsContent>
      </Tabs>

      {/* Report Generation Dialog */}
      {selectedTemplate && (
        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Generate {selectedTemplate.name}</DialogTitle>
              <DialogDescription>
                Configure your report parameters
              </DialogDescription>
            </DialogHeader>
            <ReportParametersForm 
              template={selectedTemplate}
              onGenerate={(parameters) => handleGenerateReport(selectedTemplate, parameters)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const ReportParametersForm = ({ 
  template, 
  onGenerate 
}: { 
  template: ReportTemplate;
  onGenerate: (parameters: Record<string, any>) => void;
}) => {
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'xlsx' | 'json'>(template.exportFormats[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ ...parameters, exportFormat });
  };

  const renderFilter = (filter: ReportFilter) => {
    switch (filter.type) {
      case 'date':
        return (
          <div key={filter.id}>
            <Label htmlFor={filter.id}>
              {filter.name}
              {filter.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select 
              onValueChange={(value) => setParameters(prev => ({ ...prev, [filter.id]: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-week">Last Week</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-quarter">Last Quarter</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'select':
        return (
          <div key={filter.id}>
            <Label htmlFor={filter.id}>
              {filter.name}
              {filter.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select 
              onValueChange={(value) => setParameters(prev => ({ ...prev, [filter.id]: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${filter.name.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {filter.options?.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'multiselect':
        return (
          <div key={filter.id}>
            <Label>
              {filter.name}
              {filter.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {filter.options?.map(option => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const currentValues = parameters[filter.id] || [];
                      if (e.target.checked) {
                        setParameters(prev => ({
                          ...prev,
                          [filter.id]: [...currentValues, option]
                        }));
                      } else {
                        setParameters(prev => ({
                          ...prev,
                          [filter.id]: currentValues.filter(v => v !== option)
                        }));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div key={filter.id}>
            <Label htmlFor={filter.id}>
              {filter.name}
              {filter.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={filter.id}
              onChange={(e) => setParameters(prev => ({ ...prev, [filter.id]: e.target.value }))}
              placeholder={`Enter ${filter.name.toLowerCase()}`}
            />
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {template.filters.map(renderFilter)}
      </div>

      <div>
        <Label>Export Format</Label>
        <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as 'pdf' | 'csv' | 'xlsx' | 'json')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {template.exportFormats.map(format => (
              <SelectItem key={format} value={format}>
                {format.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => {}}>
          Preview
        </Button>
        <Button type="submit">
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>
    </form>
  );
};

const CustomReportBuilder = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Custom Report Builder</h3>
        <p className="text-muted-foreground">
          Build custom reports with drag-and-drop widgets and advanced filtering
        </p>
        <Button className="mt-4" disabled>
          Coming Soon
        </Button>
      </div>
    </div>
  );
};

const ScheduledReports = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Scheduled Reports</h3>
        <p className="text-muted-foreground">
          Schedule automatic report generation and delivery
        </p>
        <Button className="mt-4" disabled>
          <Mail className="h-4 w-4 mr-2" />
          Schedule Report
        </Button>
      </div>
    </div>
  );
};

export default AdvancedReports;
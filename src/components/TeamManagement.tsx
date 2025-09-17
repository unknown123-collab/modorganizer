import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { 
  Users, 
  UserPlus, 
  Crown, 
  Shield, 
  User,
  Mail,
  MoreHorizontal,
  Trash2,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  avatar?: string;
  joinedAt: Date;
  lastActive: Date;
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  createdAt: Date;
}

const TeamManagement = () => {
  const [teams, setTeams] = useState<Team[]>([
    {
      id: '1',
      name: 'Product Team',
      description: 'Main product development team',
      members: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'owner',
          joinedAt: new Date('2023-01-15'),
          lastActive: new Date()
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'admin',
          joinedAt: new Date('2023-02-01'),
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
      ],
      createdAt: new Date('2023-01-15')
    }
  ]);

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [newTeamDialogOpen, setNewTeamDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');

  const handleInviteMember = () => {
    if (!inviteEmail || !selectedTeam) return;
    
    // Simulate API call
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
    setInviteDialogOpen(false);
  };

  const handleCreateTeam = (name: string, description: string) => {
    const newTeam: Team = {
      id: Date.now().toString(),
      name,
      description,
      members: [{
        id: 'current-user',
        name: 'You',
        email: 'you@example.com',
        role: 'owner',
        joinedAt: new Date(),
        lastActive: new Date()
      }],
      createdAt: new Date()
    };
    
    setTeams(prev => [...prev, newTeam]);
    setNewTeamDialogOpen(false);
    toast.success('Team created successfully');
  };

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeVariant = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-muted-foreground">Manage your teams and collaborate effectively</p>
        </div>
        
        <Dialog open={newTeamDialogOpen} onOpenChange={setNewTeamDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Create a new team to collaborate with your colleagues
              </DialogDescription>
            </DialogHeader>
            <CreateTeamForm onSubmit={handleCreateTeam} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => (
          <Card key={team.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <Badge variant="outline">{team.members.length} members</Badge>
              </div>
              <CardDescription>{team.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Member Avatars */}
                <div className="flex -space-x-2">
                  {team.members.slice(0, 5).map(member => (
                    <Avatar key={member.id} className="border-2 border-background">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                  ))}
                  {team.members.length > 5 && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted border-2 border-background text-xs">
                      +{team.members.length - 5}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedTeam(team)}
                  >
                    View Details
                  </Button>
                  <Dialog open={inviteDialogOpen && selectedTeam?.id === team.id} onOpenChange={setInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setSelectedTeam(team);
                          setInviteDialogOpen(true);
                        }}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>
                          Invite someone to join {team.name}
                        </DialogDescription>
                      </DialogHeader>
                      <InviteMemberForm 
                        email={inviteEmail}
                        setEmail={setInviteEmail}
                        role={inviteRole}
                        setRole={setInviteRole}
                        onInvite={handleInviteMember}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Details Modal */}
      {selectedTeam && !inviteDialogOpen && (
        <TeamDetailsModal 
          team={selectedTeam} 
          onClose={() => setSelectedTeam(null)}
        />
      )}
    </div>
  );
};

const CreateTeamForm = ({ onSubmit }: { onSubmit: (name: string, description: string) => void }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), description.trim());
      setName('');
      setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Team Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter team name"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter team description"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="submit">Create Team</Button>
      </div>
    </form>
  );
};

const InviteMemberForm = ({ 
  email, 
  setEmail, 
  role, 
  setRole, 
  onInvite 
}: { 
  email: string;
  setEmail: (email: string) => void;
  role: 'admin' | 'member';
  setRole: (role: 'admin' | 'member') => void;
  onInvite: () => void;
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Email Address</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@example.com"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Role</label>
        <Select value={role} onValueChange={(value: 'admin' | 'member') => setRole(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 justify-end">
        <Button onClick={onInvite} disabled={!email}>
          <Mail className="h-4 w-4 mr-2" />
          Send Invitation
        </Button>
      </div>
    </div>
  );
};

const TeamDetailsModal = ({ team, onClose }: { team: Team; onClose: () => void }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{team.name}</DialogTitle>
          <DialogDescription>{team.description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Team Members ({team.members.length})</h3>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {team.members.map(member => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.name}</span>
                      <Badge variant={getRoleBadgeVariant(member.role)} className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const getRoleBadgeVariant = (role: TeamMember['role']) => {
  switch (role) {
    case 'owner': return 'default' as const;
    case 'admin': return 'secondary' as const;
    default: return 'outline' as const;
  }
};

export default TeamManagement;
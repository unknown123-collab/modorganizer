import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  MessageSquare,
  Users,
  Share2,
  AtSign,
  FileText,
  Clock,
  Eye,
  Edit,
  Send,
  Pin,
  Heart,
  Reply,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Comment {
  id: string;
  taskId: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  mentions: string[];
  createdAt: Date;
  updatedAt?: Date;
  reactions: { emoji: string; users: string[] }[];
  replies: Comment[];
  isPinned: boolean;
}

interface TaskActivity {
  id: string;
  taskId: string;
  type: 'comment' | 'status_change' | 'assignment' | 'mention' | 'attachment';
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface Mention {
  id: string;
  taskId: string;
  mentionedUser: string;
  mentionedBy: string;
  context: string;
  resolved: boolean;
  createdAt: Date;
}

const CollaborationHub = () => {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      taskId: 'task-1',
      author: { id: '1', name: 'John Doe', avatar: '' },
      content: 'This task needs some clarification on the requirements. @jane could you help?',
      mentions: ['jane'],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      reactions: [{ emoji: '👍', users: ['2', '3'] }],
      replies: [
        {
          id: '1-1',
          taskId: 'task-1',
          author: { id: '2', name: 'Jane Smith', avatar: '' },
          content: 'Sure! I\'ll update the description with more details.',
          mentions: [],
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          reactions: [],
          replies: [],
          isPinned: false
        }
      ],
      isPinned: false
    }
  ]);

  const [activities, setActivities] = useState<TaskActivity[]>([
    {
      id: '1',
      taskId: 'task-1',
      type: 'comment',
      user: { id: '1', name: 'John Doe', avatar: '' },
      description: 'Added a comment asking for clarification',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      taskId: 'task-2',
      type: 'status_change',
      user: { id: '2', name: 'Jane Smith', avatar: '' },
      description: 'Changed status from "In Progress" to "Review"',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
    }
  ]);

  const [mentions, setMentions] = useState<Mention[]>([
    {
      id: '1',
      taskId: 'task-1',
      mentionedUser: 'jane',
      mentionedBy: 'john',
      context: 'This task needs some clarification on the requirements.',
      resolved: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  ]);

  const [newComment, setNewComment] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('task-1');
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const mentionMatches = newComment.match(/@(\w+)/g) || [];
    const mentions = mentionMatches.map(match => match.substring(1));

    const comment: Comment = {
      id: Date.now().toString(),
      taskId: selectedTaskId,
      author: { id: 'current-user', name: 'You', avatar: '' },
      content: newComment,
      mentions,
      createdAt: new Date(),
      reactions: [],
      replies: [],
      isPinned: false
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
    setCommentDialogOpen(false);
    toast.success('Comment added successfully');
  };

  const handleReaction = (commentId: string, emoji: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        const existingReaction = comment.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          const hasUserReacted = existingReaction.users.includes('current-user');
          if (hasUserReacted) {
            existingReaction.users = existingReaction.users.filter(u => u !== 'current-user');
          } else {
            existingReaction.users.push('current-user');
          }
          if (existingReaction.users.length === 0) {
            comment.reactions = comment.reactions.filter(r => r.emoji !== emoji);
          }
        } else {
          comment.reactions.push({ emoji, users: ['current-user'] });
        }
      }
      return comment;
    }));
  };

  const handleResolveMention = (mentionId: string) => {
    setMentions(prev => prev.map(mention => 
      mention.id === mentionId ? { ...mention, resolved: true } : mention
    ));
    toast.success('Mention resolved');
  };

  const getActivityIcon = (type: TaskActivity['type']) => {
    switch (type) {
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      case 'status_change': return <Edit className="h-4 w-4" />;
      case 'assignment': return <Users className="h-4 w-4" />;
      case 'mention': return <AtSign className="h-4 w-4" />;
      case 'attachment': return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Collaboration Hub</h2>
          <p className="text-muted-foreground">Communicate and collaborate on tasks with your team</p>
        </div>
        
        <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Comment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Comment</DialogTitle>
              <DialogDescription>
                Share your thoughts or ask questions about this task
              </DialogDescription>
            </DialogHeader>
            <CommentForm 
              value={newComment}
              onChange={setNewComment}
              onSubmit={handleAddComment}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="comments" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          <TabsTrigger value="mentions">Mentions</TabsTrigger>
          <TabsTrigger value="sharing">Sharing</TabsTrigger>
        </TabsList>

        <TabsContent value="comments">
          <div className="space-y-4">
            {comments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No comments yet</h3>
                  <p className="text-muted-foreground mb-4">Start the conversation by adding a comment</p>
                  <Button onClick={() => setCommentDialogOpen(true)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add First Comment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              comments.map(comment => (
                <CommentCard 
                  key={comment.id}
                  comment={comment}
                  onReaction={handleReaction}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="space-y-4">
            {activities.map(activity => (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback>
                        {activity.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getActivityIcon(activity.type)}
                        <span className="font-medium">{activity.user.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {format(activity.timestamp, 'MMM dd, HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mentions">
          <div className="space-y-4">
            {mentions.map(mention => (
              <Card key={mention.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AtSign className="h-4 w-4" />
                        <span className="font-medium">You were mentioned</span>
                        {mention.resolved && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {mention.context}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(mention.createdAt, 'MMM dd, yyyy at HH:mm')}
                      </p>
                    </div>
                    
                    {!mention.resolved && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleResolveMention(mention.id)}
                      >
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sharing">
          <SharingPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const CommentCard = ({ 
  comment, 
  onReaction 
}: { 
  comment: Comment;
  onReaction: (commentId: string, emoji: string) => void;
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={comment.author.avatar} />
            <AvatarFallback>
              {comment.author.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">{comment.author.name}</span>
              <span className="text-sm text-muted-foreground">
                {format(comment.createdAt, 'MMM dd, HH:mm')}
              </span>
              {comment.isPinned && <Pin className="h-4 w-4 text-orange-500" />}
            </div>
            
            <p className="text-sm mb-3">{comment.content}</p>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {comment.reactions.map((reaction, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => onReaction(comment.id, reaction.emoji)}
                  >
                    <span className="mr-1">{reaction.emoji}</span>
                    <span className="text-xs">{reaction.users.length}</span>
                  </Button>
                ))}
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => onReaction(comment.id, '👍')}
                >
                  <Heart className="h-3 w-3" />
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={() => setShowReplies(!showReplies)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            </div>
            
            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className="mt-4 pl-4 border-l-2 border-muted">
                {comment.replies.map(reply => (
                  <div key={reply.id} className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={reply.author.avatar} />
                        <AvatarFallback className="text-xs">
                          {reply.author.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{reply.author.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(reply.createdAt, 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Reply Form */}
            {showReplies && (
              <div className="mt-4 pl-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="text-sm"
                  />
                  <Button size="sm">
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CommentForm = ({ 
  value, 
  onChange, 
  onSubmit 
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) => {
  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Write your comment here... Use @username to mention someone"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px]"
      />
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Use @username to mention team members
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Attach
          </Button>
          <Button onClick={onSubmit} disabled={!value.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

const SharingPanel = () => {
  const [shareLink, setShareLink] = useState('');
  const [permissions, setPermissions] = useState<'view' | 'edit'>('view');

  const generateShareLink = () => {
    const link = `https://app.example.com/tasks/shared/${Date.now()}`;
    setShareLink(link);
    navigator.clipboard.writeText(link);
    toast.success('Share link copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Task
          </CardTitle>
          <CardDescription>
            Generate a shareable link for this task
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Permissions</label>
            <select 
              className="w-full p-2 border rounded-md mt-1"
              value={permissions}
              onChange={(e) => setPermissions(e.target.value as 'view' | 'edit')}
            >
              <option value="view">View Only</option>
              <option value="edit">Can Edit</option>
            </select>
          </div>
          
          {shareLink ? (
            <div>
              <label className="text-sm font-medium">Share Link</label>
              <div className="flex gap-2 mt-1">
                <Input value={shareLink} readOnly />
                <Button 
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    toast.success('Link copied!');
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={generateShareLink}>
              <Share2 className="h-4 w-4 mr-2" />
              Generate Share Link
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Access</CardTitle>
          <CardDescription>
            Manage who can access and edit this task
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Advanced Sharing</h3>
            <p className="text-muted-foreground">
              Fine-grained permission control coming soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollaborationHub;
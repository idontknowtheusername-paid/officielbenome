import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  AlertCircle, 
  Check, 
  Flag, 
  MessageSquare, 
  Trash2, 
  User, 
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Search,
  Ban,
  AlertTriangle,
  Eye,
  EyeOff,
  Clock,
  Download,
  ShoppingBag,
  Star
} from 'lucide-react';
import { 
  listingService,
  userService
} from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const ReportStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  IGNORED: 'ignored'
};

const ContentType = {
  LISTING: 'listing',
  COMMENT: 'comment',
  USER: 'user',
  REVIEW: 'review'
};

const SeverityBadge = ({ level }) => {
  const getVariant = () => {
    switch(level) {
      case 'low': return 'outline';
      case 'medium': return 'warning';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  const getLabel = () => {
    switch(level) {
      case 'low': return 'Faible';
      case 'medium': return 'Moyen';
      case 'high': return 'Élevé';
      default: return level;
    }
  };

  return (
    <Badge variant={getVariant()}>
      {getLabel()}
    </Badge>
  );
};

const StatusBadge = ({ status }) => {
  const getVariant = () => {
    switch(status) {
      case ReportStatus.PENDING: return 'warning';
      case ReportStatus.APPROVED: return 'success';
      case ReportStatus.REJECTED: return 'destructive';
      case ReportStatus.IGNORED: return 'outline';
      default: return 'outline';
    }
  };

  const getLabel = () => {
    switch(status) {
      case ReportStatus.PENDING: return 'En attente';
      case ReportStatus.APPROVED: return 'Approuvé';
      case ReportStatus.REJECTED: return 'Rejeté';
      case ReportStatus.IGNORED: return 'Ignoré';
      default: return status;
    }
  };

  return (
    <Badge variant={getVariant()}>
      {getLabel()}
    </Badge>
  );
};

const ContentTypeBadge = ({ type }) => {
  const getIcon = () => {
    switch(type) {
      case ContentType.LISTING: return <ShoppingBag className="h-3 w-3" />;
      case ContentType.COMMENT: return <MessageSquare className="h-3 w-3" />;
      case ContentType.USER: return <User className="h-3 w-3" />;
      case ContentType.REVIEW: return <Star className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getLabel = () => {
    switch(type) {
      case ContentType.LISTING: return 'Annonce';
      case ContentType.COMMENT: return 'Commentaire';
      case ContentType.USER: return 'Utilisateur';
      case ContentType.REVIEW: return 'Avis';
      default: return type;
    }
  };

  return (
    <Badge variant="outline" className="flex items-center gap-1">
      {getIcon()}
      {getLabel()}
    </Badge>
  );
};

function ModerationPage() {
  const queryClient = useQueryClient();
  
  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [expandedReports, setExpandedReports] = useState(new Set());
  const [selectedReport, setSelectedReport] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Fetch reported content
  const { data: reports, isLoading, isError } = useQuery({
    queryKey: ['moderation', 'reports', { searchTerm, statusFilter, typeFilter, severityFilter, sortBy, sortOrder, page, perPage }],
    queryFn: async () => {
      // Pour l'instant, on simule des rapports bases sur les annonces en attente
      const listings = await listingService.getAllListings({ status: 'pending' });
      
      return listings.map(listing => ({
        id: listing.id,
        type: ContentType.LISTING,
        content: listing,
        reporter: {
          id: 'system',
          name: 'Système',
          email: 'system@maximarket.com'
        },
        reason: 'Annonce en attente de modération',
        description: 'Cette annonce nécessite une vérification avant publication',
        severity: 'medium',
        status: ReportStatus.PENDING,
        createdAt: listing.created_at,
        updatedAt: listing.updated_at
      }));
    }
  });

  // Fetch moderation stats
  const { data: stats } = useQuery({
    queryKey: ['moderation', 'stats'],
    queryFn: async () => {
      const listings = await listingService.getAllListings();
      const users = await userService.getAllUsers();
      
      return {
        totalReports: listings.filter(l => l.status === 'pending').length,
        pendingReports: listings.filter(l => l.status === 'pending').length,
        resolvedReports: listings.filter(l => l.status === 'approved' || l.status === 'rejected').length,
        averageResponseTime: '2h',
        topReportedTypes: [
          { type: 'listing', count: listings.filter(l => l.status === 'pending').length },
          { type: 'user', count: 0 },
          { type: 'comment', count: 0 }
        ]
      };
    }
  });

  // Moderate content mutation
  const { mutate: moderate, isLoading: isModerating } = useMutation({
    mutationFn: ({ reportId, action, reason }) => 
      // This part needs to be adapted to Supabase moderation logic
      // For now, it's a placeholder.
      console.log(`Moderating report ${reportId} with action: ${action}, reason: ${reason}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['moderation', 'reports']);
      queryClient.invalidateQueries(['moderation', 'stats']);
      // queryClient.invalidateQueries(['moderation', 'logs']); // No logs in Supabase yet
      setSelectedReport(null);
      setShowConfirmDialog(false);
    },
    onError: (error) => {
      console.error('Error moderating content:', error);
    }
  });

  // Toggle report expansion
  const toggleExpandReport = (reportId) => {
    setExpandedReports(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  // Handle moderation action
  const handleModerationAction = (reportId, action) => {
    setSelectedReport(reportId);
    setPendingAction(action);
    
    if (action === 'approve' || action === 'reject' || action === 'ignore') {
      setShowConfirmDialog(true);
    } else if (action === 'delete') {
      // For delete, we might want to show a different dialog or confirmation
      setShowConfirmDialog(true);
    }
  };

  // Confirm action
  const confirmAction = () => {
    if (!selectedReport || !pendingAction) return;
    
    let action = pendingAction;
    let reason = '';
    
    // In a real app, you might want to collect a reason for the action
    if (pendingAction === 'reject') {
      reason = 'Contenu inapproprié';
    } else if (pendingAction === 'delete') {
      reason = 'Suppression demandée';
    }
    
    moderate({ reportId: selectedReport, action, reason });
  };

  // Get action button variant
  const getActionVariant = (action) => {
    switch(action) {
      case 'approve': return 'default';
      case 'reject': return 'destructive';
      case 'ignore': return 'outline';
      case 'delete': return 'destructive';
      default: return 'outline';
    }
  };

  // Get action icon
  const getActionIcon = (action) => {
    switch(action) {
      case 'approve': return <Check className="h-4 w-4" />;
      case 'reject': return <X className="h-4 w-4" />;
      case 'ignore': return <EyeOff className="h-4 w-4" />;
      case 'delete': return <Trash2 className="h-4 w-4" />;
      default: return null;
    }
  };

  // Get action label
  const getActionLabel = (action) => {
    switch(action) {
      case 'approve': return 'Approuver';
      case 'reject': return 'Rejeter';
      case 'ignore': return 'Ignorer';
      case 'delete': return 'Supprimer';
      default: return action;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Modération</h2>
          <p className="text-muted-foreground">
            Gérez les signalements et le contenu inapproprié
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Signalements en attente</p>
              <p className="text-2xl font-bold">{stats?.pendingReports || 0}</p>
            </div>
            <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/50">
              <Flag className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Signalements aujourd'hui</p>
              <p className="text-2xl font-bold">{stats?.today || 0}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/50">
              <Flag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            <span className={stats?.todayChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {stats?.todayChange >= 0 ? '↑' : '↓'} {Math.abs(stats?.todayChange || 0)}%
            </span>{' '}
            vs hier
          </p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Taux de modération</p>
              <p className="text-2xl font-bold">{stats?.moderationRate || 0}%</p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/50">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {stats?.moderatedToday || 0} modérations aujourd'hui
          </p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contenu supprimé</p>
              <p className="text-2xl font-bold">{stats?.removedContent || 0}</p>
            </div>
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/50">
              <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {stats?.removedThisMonth || 0} ce mois-ci
          </p>
        </div>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="reports">Signalements</TabsTrigger>
            <TabsTrigger value="logs">Journal de modération</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtres
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>
        
        <TabsContent value="reports" className="space-y-4">
          {/* Filters */}
          <div className="rounded-md border bg-card p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Recherche</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Statut</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value={ReportStatus.PENDING}>En attente</SelectItem>
                    <SelectItem value={ReportStatus.APPROVED}>Approuvé</SelectItem>
                    <SelectItem value={ReportStatus.REJECTED}>Rejeté</SelectItem>
                    <SelectItem value={ReportStatus.IGNORED}>Ignoré</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Type de contenu</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value={ContentType.LISTING}>Annonces</SelectItem>
                    <SelectItem value={ContentType.COMMENT}>Commentaires</SelectItem>
                    <SelectItem value={ContentType.USER}>Utilisateurs</SelectItem>
                    <SelectItem value={ContentType.REVIEW}>Avis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Gravité</label>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les niveaux" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les niveaux</SelectItem>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyen</SelectItem>
                    <SelectItem value="high">Élevé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contenu</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Gravité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2">Chargement...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center text-red-500">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Erreur lors du chargement des signalements
                      </div>
                    </TableCell>
                  </TableRow>
                ) : reports?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Flag className="h-12 w-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium">Aucun signalement trouvé</p>
                        <p className="text-sm">Il n'y a pas de signalements correspondant à vos critères.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  reports?.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpandReport(report.id)}
                            >
                              {expandedReports.has(report.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                            <div>
                              <p className="font-medium">{report.content.title || 'Contenu signalé'}</p>
                              <p className="text-sm text-muted-foreground">
                                Par {report.reporter?.name || 'Utilisateur anonyme'}
                              </p>
                            </div>
                          </div>
                          {expandedReports.has(report.id) && (
                            <div className="ml-8 p-3 bg-muted rounded-md">
                              <p className="text-sm">{report.reason}</p>
                              {report.description && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  {report.description}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ContentTypeBadge type={report.type} />
                      </TableCell>
                      <TableCell>
                        <SeverityBadge level={report.severity} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={report.status} />
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatDistanceToNow(new Date(report.createdAt), { 
                                  addSuffix: true, 
                                  locale: fr 
                                })}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {new Date(report.createdAt).toLocaleString('fr-FR')}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {report.status === ReportStatus.PENDING && (
                            <>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleModerationAction(report.id, 'approve')}
                                      disabled={isModerating}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Approuver</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleModerationAction(report.id, 'reject')}
                                      disabled={isModerating}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Rejeter</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleModerationAction(report.id, 'ignore')}
                                      disabled={isModerating}
                                    >
                                      <EyeOff className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Ignorer</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </>
                          )}
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleModerationAction(report.id, 'delete')}
                                  disabled={isModerating}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Supprimer</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {reports?.pagination && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">
                  Affichage de {((page - 1) * perPage) + 1} à {Math.min(page * perPage, reports.pagination.total)} sur {reports.pagination.total} signalements
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {page} sur {reports.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === reports.pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(reports.pagination.totalPages)}
                  disabled={page === reports.pagination.totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-4">
          <div className="rounded-md border bg-card">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">Journal de modération</h3>
              <p className="text-sm text-muted-foreground">
                Historique des actions de modération effectuées
              </p>
            </div>
            <div className="p-4">
              {/* Logs will be fetched and displayed here once implemented */}
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Journal de modération à venir</p>
                <p className="text-sm text-muted-foreground">
                  L'historique des actions de modération sera disponible prochainement.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <div className="rounded-md border bg-card">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">Paramètres de modération</h3>
              <p className="text-sm text-muted-foreground">
                Configurez les règles et seuils de modération
              </p>
            </div>
            <div className="p-4">
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Paramètres à venir</p>
                <p className="text-sm text-muted-foreground">
                  Les paramètres de modération seront disponibles prochainement.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'action</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir {getActionLabel(pendingAction)?.toLowerCase()} ce signalement ?
              Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={getActionVariant(pendingAction) === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {getActionLabel(pendingAction)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
export default ModerationPage;
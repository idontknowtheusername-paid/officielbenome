import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';

/**
 * Configuration des colonnes pour le tableau des utilisateurs
 */
export const userColumns = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Sélectionner toutes les lignes"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={`Sélectionner la ligne ${row.index + 1}`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="p-0 hover:bg-transparent"
      >
        Nom
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.original.name}</div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.original.email}</div>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Rôle',
    cell: ({ row }) => {
      const role = row.original.role;
      const roleVariant = {
        admin: 'bg-blue-100 text-blue-800',
        user: 'bg-gray-100 text-gray-800',
        moderator: 'bg-purple-100 text-purple-800',
        seller: 'bg-green-100 text-green-800',
      }[role] || 'bg-gray-100 text-gray-800';
      
      return (
        <Badge className={roleVariant}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => {
      const status = row.original.status || 'active';
      const statusVariant = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-red-100 text-red-800',
        pending: 'bg-yellow-100 text-yellow-800',
        suspended: 'bg-gray-100 text-gray-800',
      }[status] || 'bg-gray-100 text-gray-800';
      
      return (
        <Badge className={statusVariant}>
          {status === 'active' ? 'Actif' : 
           status === 'inactive' ? 'Inactif' : 
           status === 'pending' ? 'En attente' : 
           status === 'suspended' ? 'Suspendu' : status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Inscrit le',
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return format(date, 'PP', { locale: fr });
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Ouvrir le menu</span>
          </Button>
        </div>
      );
    },
  },
];

/**
 * Configuration des colonnes pour le tableau des annonces
 */
export const listingColumns = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Sélectionner toutes les lignes"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={`Sélectionner l'annonce ${row.index + 1}`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: 'Titre',
    cell: ({ row }) => (
      <div className="font-medium line-clamp-1">
        {row.original.title}
      </div>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Catégorie',
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.category?.name || 'Non catégorisé'}
      </Badge>
    ),
  },
  {
    accessorKey: 'price',
    header: 'Prix',
    cell: ({ row }) => {
      const price = parseFloat(row.original.price || 0);
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    },
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => {
      const status = row.original.status || 'draft';
      const statusVariant = {
        published: 'bg-green-100 text-green-800',
        draft: 'bg-yellow-100 text-yellow-800',
        pending: 'bg-blue-100 text-blue-800',
        rejected: 'bg-red-100 text-red-800',
        expired: 'bg-gray-100 text-gray-800',
      }[status] || 'bg-gray-100 text-gray-800';
      
      return (
        <Badge className={statusVariant}>
          {status === 'published' ? 'Publié' : 
           status === 'draft' ? 'Brouillon' : 
           status === 'pending' ? 'En attente' : 
           status === 'rejected' ? 'Rejeté' : 
           status === 'expired' ? 'Expiré' : status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date de création',
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return format(date, 'PP', { locale: fr });
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Ouvrir le menu</span>
        </Button>
      </div>
    ),
  },
];

/**
 * Configuration des colonnes pour le tableau des transactions
 */
export const transactionColumns = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Sélectionner toutes les lignes"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={`Sélectionner la transaction ${row.index + 1}`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <div className="font-mono text-sm text-muted-foreground">
        {row.original.id?.substring(0, 8)}...
      </div>
    ),
  },
  {
    accessorKey: 'user',
    header: 'Client',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.user?.name || 'Anonyme'}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.user?.email || ''}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Montant',
    cell: ({ row }) => {
      const amount = parseFloat(row.original.amount || 0);
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: row.original.currency || 'XOF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    },
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => {
      const status = row.original.status || 'pending';
      const statusVariant = {
        completed: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        failed: 'bg-red-100 text-red-800',
        refunded: 'bg-blue-100 text-blue-800',
        cancelled: 'bg-gray-100 text-gray-800',
      }[status] || 'bg-gray-100 text-gray-800';
      
      return (
        <Badge className={statusVariant}>
          {status === 'completed' ? 'Terminé' : 
           status === 'pending' ? 'En attente' : 
           status === 'failed' ? 'Échoué' : 
           status === 'refunded' ? 'Remboursé' : 
           status === 'cancelled' ? 'Annulé' : status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return format(date, 'PPp', { locale: fr });
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Ouvrir le menu</span>
        </Button>
      </div>
    ),
  },
];

/**
 * Configuration des colonnes pour le tableau des signalements
 */
export const reportColumns = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Sélectionner toutes les lignes"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={`Sélectionner le signalement ${row.index + 1}`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'reason',
    header: 'Raison',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.reason}
      </div>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.original.type || 'other';
      const typeVariant = {
        spam: 'bg-red-100 text-red-800',
        inappropriate: 'bg-orange-100 text-orange-800',
        fake: 'bg-yellow-100 text-yellow-800',
        duplicate: 'bg-blue-100 text-blue-800',
        other: 'bg-gray-100 text-gray-800',
      }[type] || 'bg-gray-100 text-gray-800';
      
      return (
        <Badge className={typeVariant}>
          {type === 'spam' ? 'Spam' : 
           type === 'inappropriate' ? 'Inapproprié' : 
           type === 'fake' ? 'Faux contenu' : 
           type === 'duplicate' ? 'Doublon' : 'Autre'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => {
      const status = row.original.status || 'open';
      const statusVariant = {
        open: 'bg-blue-100 text-blue-800',
        in_progress: 'bg-yellow-100 text-yellow-800',
        resolved: 'bg-green-100 text-green-800',
        closed: 'bg-gray-100 text-gray-800',
      }[status] || 'bg-gray-100 text-gray-800';
      
      return (
        <Badge className={statusVariant}>
          {status === 'open' ? 'Ouvert' : 
           status === 'in_progress' ? 'En cours' : 
           status === 'resolved' ? 'Résolu' : 
           status === 'closed' ? 'Fermé' : status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'reportedBy',
    header: 'Signalé par',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.reportedBy?.name || 'Anonyme'}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.reportedBy?.email || ''}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return format(date, 'PPp', { locale: fr });
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Ouvrir le menu</span>
        </Button>
      </div>
    ),
  },
];

/**
 * Configuration des colonnes pour le tableau des logs d'activité
 */
export const activityLogColumns = [
  {
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.action}
      </div>
    ),
  },
  {
    accessorKey: 'user',
    header: 'Utilisateur',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.user?.name || 'Système'}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.user?.email || 'system'}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'ipAddress',
    header: 'Adresse IP',
    cell: ({ row }) => (
      <div className="font-mono text-sm">
        {row.original.ipAddress || 'N/A'}
      </div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return format(date, 'PPpp', { locale: fr });
    },
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => {
      const status = row.original.status || 'success';
      const statusVariant = {
        success: 'bg-green-100 text-green-800',
        error: 'bg-red-100 text-red-800',
        warning: 'bg-yellow-100 text-yellow-800',
        info: 'bg-blue-100 text-blue-800',
      }[status] || 'bg-gray-100 text-gray-800';
      
      return (
        <Badge className={statusVariant}>
          {status === 'success' ? 'Succès' : 
           status === 'error' ? 'Erreur' : 
           status === 'warning' ? 'Avertissement' : 'Info'}
        </Badge>
      );
    },
  },
];

export default {
  userColumns,
  listingColumns,
  transactionColumns,
  reportColumns,
  activityLogColumns,
};

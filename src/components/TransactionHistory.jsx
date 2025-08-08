import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Search, 
  Download, 
  Eye, 
  Calendar,
  DollarSign,
  User,
  FileText
} from 'lucide-react';
import { transactionService } from '../services/transaction.service';
import { useAuth } from '../contexts/AuthContext';

const TransactionHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Charger les transactions
  const loadTransactions = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const data = await transactionService.getUserTransactions(user.id, filters);
      setTransactions(data);

      // Charger les statistiques
      const statsData = await transactionService.getTransactionStats(user.id);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur chargement transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger au montage et quand les filtres changent
  useEffect(() => {
    loadTransactions();
  }, [user, filters]);

  // Rechercher des transactions
  const searchTransactions = async (searchTerm) => {
    if (!user || !searchTerm.trim()) {
      await loadTransactions();
      return;
    }

    try {
      const data = await transactionService.searchTransactions(user.id, searchTerm);
      setTransactions(data);
    } catch (error) {
      console.error('Erreur recherche transactions:', error);
    }
  };

  // Exporter les transactions
  const exportTransactions = async () => {
    if (!user) return;

    try {
      const exportData = await transactionService.exportTransactions(user.id, filters);
      
      // Créer le fichier CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => headers.map(header => `"${row[header]}"`).join(','))
      ].join('\n');

      // Télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur export transactions:', error);
    }
  };

  // Obtenir l'icône selon le type
  const getTransactionIcon = (type) => {
    const icons = {
      'purchase': <TrendingDown className="text-red-500" />,
      'rental': <Calendar className="text-blue-500" />,
      'service': <FileText className="text-green-500" />,
      'transfer': <TrendingUp className="text-purple-500" />
    };
    return icons[type] || <CreditCard className="text-gray-500" />;
  };

  // Obtenir la couleur selon le statut
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'failed': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Formater le montant
  const formatAmount = (amount, currency = 'XOF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Connectez-vous pour voir votre historique de transactions</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Historique des Transactions</h1>
            <p className="text-gray-600 mt-2">
              Gérez et suivez toutes vos transactions
            </p>
          </div>
          
          {/* Statistiques rapides */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatAmount(stats.totalAmount || 0)}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.total || 0}
              </div>
              <div className="text-sm text-gray-600">Transactions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="completed">Complétée</option>
              <option value="cancelled">Annulée</option>
              <option value="failed">Échouée</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les types</option>
              <option value="purchase">Achat</option>
              <option value="rental">Location</option>
              <option value="service">Service</option>
              <option value="transfer">Transfert</option>
            </select>
          </div>

          {/* Date de début */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date de fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Montant minimum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Montant min</label>
            <input
              type="number"
              placeholder="0"
              value={filters.amountMin}
              onChange={(e) => setFilters(prev => ({ ...prev, amountMin: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Montant maximum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Montant max</label>
            <input
              type="number"
              placeholder="∞"
              value={filters.amountMax}
              onChange={(e) => setFilters(prev => ({ ...prev, amountMax: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setFilters({})}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Réinitialiser
            </button>
            <button
              onClick={exportTransactions}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download size={16} />
              <span>Exporter</span>
            </button>
          </div>

          {/* Recherche */}
          <div className="flex items-center space-x-2">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une transaction..."
              onChange={(e) => searchTransactions(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Liste des transactions */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune transaction</h3>
          <p className="mt-2 text-gray-600">
            Vous n'avez pas encore effectué de transactions
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.reference}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.description || 'Aucune description'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {transaction.type}
                      </div>
                      {transaction.listing && (
                        <div className="text-sm text-gray-500">
                          {transaction.listing.title}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatAmount(transaction.amount, transaction.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {showDetails && selectedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Détails de la transaction
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Référence</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.reference}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedTransaction.type}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Montant</label>
                  <p className="text-sm text-gray-900">
                    {formatAmount(selectedTransaction.amount, selectedTransaction.currency)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Statut</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTransaction.status)}`}>
                    {selectedTransaction.status}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de création</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedTransaction.created_at)}</p>
                </div>
                
                {selectedTransaction.completed_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de completion</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedTransaction.completed_at)}</p>
                  </div>
                )}
                
                {selectedTransaction.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="text-sm text-gray-900">{selectedTransaction.description}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory; 
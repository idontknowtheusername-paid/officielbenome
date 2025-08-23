// ============================================================================
// TESTS D'INTÉGRATION - DASHBOARD ADMIN NEWSLETTER
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NewsletterAdminPage from '@/pages/admin/NewsletterAdminPage';

// Mock des services
const mockNewsletterService = {
  getStats: vi.fn(),
  sendWeeklyNewsletter: vi.fn(),
  sendMonthlyNewsletter: vi.fn(),
  sendSpecialOffer: vi.fn(),
  sendReengagementCampaign: vi.fn(),
  sendMaintenanceNotification: vi.fn()
};

const mockCampaignService = {
  getAllCampaigns: vi.fn(),
  getCampaignStats: vi.fn()
};

const mockEmailService = {
  checkConfiguration: vi.fn()
};

// Mock des modules
vi.mock('@/services/newsletter.service.js', () => ({
  newsletterService: mockNewsletterService
}));

vi.mock('@/services/campaign.service.js', () => ({
  campaignService: mockCampaignService
}));

vi.mock('@/services/email.service.js', () => ({
  emailService: mockEmailService
}));

// Mock useToast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast
  })
}));

// Wrapper pour les tests avec Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('NewsletterAdminPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock des données par défaut
    mockNewsletterService.getStats.mockResolvedValue({
      total: 150,
      active: 120,
      inactive: 30
    });
    
    mockCampaignService.getAllCampaigns.mockResolvedValue([
      {
        id: '1',
        type: 'weeklyNewsletter',
        subject: 'Newsletter Hebdomadaire',
        status: 'sent',
        recipient_count: 150,
        created_at: '2024-01-15T10:00:00Z',
        sent_at: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        type: 'specialOffer',
        subject: 'Offre Spéciale -20%',
        status: 'sent',
        recipient_count: 320,
        created_at: '2024-01-10T10:00:00Z',
        sent_at: '2024-01-10T10:30:00Z'
      }
    ]);
    
    mockCampaignService.getCampaignStats.mockResolvedValue({
      total: 2,
      sent: 2,
      draft: 0,
      scheduled: 0,
      failed: 0
    });
    
    mockEmailService.checkConfiguration.mockReturnValue({
      sendgridConfigured: true,
      fromEmail: 'test@example.com',
      fromName: 'Test Sender'
    });
  });

  describe('Page Rendering', () => {
    it('should render the newsletter admin page correctly', async () => {
      renderWithRouter(<NewsletterAdminPage />);
      
      // Vérifier le titre principal
      expect(screen.getByText('Dashboard Newsletter')).toBeInTheDocument();
      
      // Vérifier les onglets
      expect(screen.getByText('Vue d\'ensemble')).toBeInTheDocument();
      expect(screen.getByText('Campagnes')).toBeInTheDocument();
      expect(screen.getByText('Abonnés')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      
      // Attendre le chargement des données
      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument(); // Total abonnés
      });
    });

    it('should display loading state initially', () => {
      renderWithRouter(<NewsletterAdminPage />);
      
      // Vérifier que le spinner de chargement est affiché
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should handle loading errors gracefully', async () => {
      mockNewsletterService.getStats.mockRejectedValue(new Error('Database error'));
      
      renderWithRouter(<NewsletterAdminPage />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Erreur',
          description: 'Impossible de charger les données',
          variant: 'destructive'
        });
      });
    });
  });

  describe('Overview Tab', () => {
    it('should display correct statistics', async () => {
      renderWithRouter(<NewsletterAdminPage />);
      
      await waitFor(() => {
        // Vérifier les statistiques principales
        expect(screen.getByText('150')).toBeInTheDocument(); // Total abonnés
        expect(screen.getByText('120')).toBeInTheDocument(); // Abonnés actifs
        expect(screen.getByText('30')).toBeInTheDocument(); // Abonnés inactifs
        expect(screen.getByText('80%')).toBeInTheDocument(); // Taux d'engagement
        expect(screen.getByText('2')).toBeInTheDocument(); // Campagnes envoyées
      });
    });

    it('should display campaign statistics correctly', async () => {
      renderWithRouter(<NewsletterAdminPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Campagnes Envoyées')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument(); // Campagnes envoyées
        expect(screen.getByText('Sur 2 total')).toBeInTheDocument();
      });
    });
  });

  describe('Campaigns Tab', () => {
    it('should display campaign creation form', async () => {
      renderWithRouter(<NewsletterAdminPage />);
      
      // Cliquer sur l'onglet Campagnes
      fireEvent.click(screen.getByText('Campagnes'));
      
      await waitFor(() => {
        expect(screen.getByText('Créer une nouvelle campagne')).toBeInTheDocument();
        expect(screen.getByText('Type de campagne')).toBeInTheDocument();
        expect(screen.getByText('Date programmée (optionnel)')).toBeInTheDocument();
      });
    });

    it('should show campaign type options', async () => {
      renderWithRouter(<NewsletterAdminPage />);
      
      fireEvent.click(screen.getByText('Campagnes'));
      
      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.click(select);
        
        // Vérifier les options disponibles
        expect(screen.getByText('Newsletter Hebdomadaire')).toBeInTheDocument();
        expect(screen.getByText('Newsletter Mensuelle')).toBeInTheDocument();
        expect(screen.getByText('Offre Spéciale')).toBeInTheDocument();
        expect(screen.getByText('Campagne de Réengagement')).toBeInTheDocument();
        expect(screen.getByText('Notification de Maintenance')).toBeInTheDocument();
      });
    });

    it('should display campaign history', async () => {
      renderWithRouter(<NewsletterAdminPage />);
      
      fireEvent.click(screen.getByText('Campagnes'));
      
      await waitFor(() => {
        expect(screen.getByText('Historique des campagnes (2)')).toBeInTheDocument();
        expect(screen.getByText('Newsletter Hebdomadaire')).toBeInTheDocument();
        expect(screen.getByText('Offre Spéciale -20%')).toBeInTheDocument();
        expect(screen.getByText('150 destinataires')).toBeInTheDocument();
        expect(screen.getByText('320 destinataires')).toBeInTheDocument();
      });
    });

    it('should show campaign status badges', async () => {
      renderWithRouter(<NewsletterAdminPage />);
      
      fireEvent.click(screen.getByText('Campagnes'));
      
      await waitFor(() => {
        expect(screen.getByText('Envoyée')).toBeInTheDocument();
      });
    });
  });

  describe('Campaign Creation', () => {
    it('should create weekly newsletter campaign', async () => {
      mockNewsletterService.sendWeeklyNewsletter.mockResolvedValue({
        success: true,
        message: 'Newsletter envoyée avec succès'
      });
      
      renderWithRouter(<NewsletterAdminPage />);
      
      fireEvent.click(screen.getByText('Campagnes'));
      
      await waitFor(() => {
        // Sélectionner le type de campagne
        const select = screen.getByRole('combobox');
        fireEvent.click(select);
        fireEvent.click(screen.getByText('Newsletter Hebdomadaire'));
        
        // Remplir les données
        const weekStartInput = screen.getByDisplayValue('');
        fireEvent.change(weekStartInput, { target: { value: '1er janvier 2024' } });
        
        const newListingsInput = screen.getByPlaceholderText('150+');
        fireEvent.change(newListingsInput, { target: { value: '200+' } });
        
        // Envoyer la campagne
        const sendButton = screen.getByText('Envoyer la campagne');
        fireEvent.click(sendButton);
      });
      
      await waitFor(() => {
        expect(mockNewsletterService.sendWeeklyNewsletter).toHaveBeenCalledWith({
          weekStart: '1er janvier 2024',
          newListings: '200+'
        });
        
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Succès',
          description: 'Newsletter envoyée avec succès'
        });
      });
    });

    it('should create special offer campaign', async () => {
      mockNewsletterService.sendSpecialOffer.mockResolvedValue({
        success: true,
        message: 'Offre spéciale envoyée avec succès'
      });
      
      renderWithRouter(<NewsletterAdminPage />);
      
      fireEvent.click(screen.getByText('Campagnes'));
      
      await waitFor(() => {
        // Sélectionner le type de campagne
        const select = screen.getByRole('combobox');
        fireEvent.click(select);
        fireEvent.click(screen.getByText('Offre Spéciale'));
        
        // Remplir les données
        const discountInput = screen.getByPlaceholderText('20%');
        fireEvent.change(discountInput, { target: { value: '25%' } });
        
        const codeInput = screen.getByPlaceholderText('NEWSLETTER20');
        fireEvent.change(codeInput, { target: { value: 'SUMMER25' } });
        
        // Envoyer la campagne
        const sendButton = screen.getByText('Envoyer la campagne');
        fireEvent.click(sendButton);
      });
      
      await waitFor(() => {
        expect(mockNewsletterService.sendSpecialOffer).toHaveBeenCalledWith({
          discount: '25%',
          code: 'SUMMER25'
        });
      });
    });

    it('should handle campaign creation errors', async () => {
      mockNewsletterService.sendWeeklyNewsletter.mockRejectedValue(new Error('SendGrid error'));
      
      renderWithRouter(<NewsletterAdminPage />);
      
      fireEvent.click(screen.getByText('Campagnes'));
      
      await waitFor(() => {
        const sendButton = screen.getByText('Envoyer la campagne');
        fireEvent.click(sendButton);
      });
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Erreur',
          description: expect.stringContaining('erreur'),
          variant: 'destructive'
        });
      });
    });
  });

  describe('Subscribers Tab', () => {
    it('should display subscribers list', async () => {
      // Mock des données d'abonnés
      mockNewsletterService.getStats.mockResolvedValue({
        total: 150,
        active: 120,
        inactive: 30,
        data: [
          {
            id: '1',
            email: 'user1@example.com',
            is_active: true,
            subscribed_at: '2024-01-01T10:00:00Z',
            source: 'footer'
          },
          {
            id: '2',
            email: 'user2@example.com',
            is_active: false,
            subscribed_at: '2024-01-02T10:00:00Z',
            source: 'popup'
          }
        ]
      });
      
      renderWithRouter(<NewsletterAdminPage />);
      
      fireEvent.click(screen.getByText('Abonnés'));
      
      await waitFor(() => {
        expect(screen.getByText('Liste des abonnés (2)')).toBeInTheDocument();
        expect(screen.getByText('user1@example.com')).toBeInTheDocument();
        expect(screen.getByText('user2@example.com')).toBeInTheDocument();
        expect(screen.getByText('Actif')).toBeInTheDocument();
        expect(screen.getByText('Inactif')).toBeInTheDocument();
        expect(screen.getByText('footer')).toBeInTheDocument();
        expect(screen.getByText('popup')).toBeInTheDocument();
      });
    });
  });

  describe('Analytics Tab', () => {
    it('should display analytics data', async () => {
      renderWithRouter(<NewsletterAdminPage />);
      
      fireEvent.click(screen.getByText('Analytics'));
      
      await waitFor(() => {
        expect(screen.getByText('Taux d\'ouverture')).toBeInTheDocument();
        expect(screen.getByText('Taux de clic')).toBeInTheDocument();
        expect(screen.getByText('Performance par jour')).toBeInTheDocument();
        
        // Vérifier les métriques
        expect(screen.getByText('78%')).toBeInTheDocument();
        expect(screen.getByText('65%')).toBeInTheDocument();
        expect(screen.getByText('92%')).toBeInTheDocument();
        expect(screen.getByText('23%')).toBeInTheDocument();
        expect(screen.getByText('45%')).toBeInTheDocument();
        expect(screen.getByText('12%')).toBeInTheDocument();
      });
    });
  });

  describe('Data Refresh', () => {
    it('should refresh data when refresh button is clicked', async () => {
      renderWithRouter(<NewsletterAdminPage />);
      
      await waitFor(() => {
        expect(mockNewsletterService.getStats).toHaveBeenCalledTimes(1);
      });
      
      // Cliquer sur le bouton d'actualisation
      const refreshButton = screen.getByText('Actualiser');
      fireEvent.click(refreshButton);
      
      await waitFor(() => {
        expect(mockNewsletterService.getStats).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Test Data Generation', () => {
    it('should generate test data when button is clicked', async () => {
      renderWithRouter(<NewsletterAdminPage />);
      
      fireEvent.click(screen.getByText('Campagnes'));
      
      await waitFor(() => {
        const generateButton = screen.getByText('Générer données de test');
        fireEvent.click(generateButton);
        
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Données de test générées',
          description: 'Les données de test ont été ajoutées au formulaire'
        });
      });
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive on mobile devices', async () => {
      // Simuler un écran mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      
      renderWithRouter(<NewsletterAdminPage />);
      
      await waitFor(() => {
        // Vérifier que la page s'affiche correctement sur mobile
        expect(screen.getByText('Dashboard Newsletter')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      renderWithRouter(<NewsletterAdminPage />);
      
      await waitFor(() => {
        // Vérifier les labels d'accessibilité
        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(screen.getByRole('tablist')).toBeInTheDocument();
        expect(screen.getAllByRole('tab')).toHaveLength(4);
      });
    });

    it('should support keyboard navigation', async () => {
      renderWithRouter(<NewsletterAdminPage />);
      
      await waitFor(() => {
        const tabs = screen.getAllByRole('tab');
        
        // Navigation au clavier
        fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
        expect(tabs[1]).toHaveFocus();
        
        fireEvent.keyDown(tabs[1], { key: 'Enter' });
        expect(screen.getByText('Créer une nouvelle campagne')).toBeInTheDocument();
      });
    });
  });
});

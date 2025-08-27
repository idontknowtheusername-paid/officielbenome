// ============================================================================
// TESTS UNITAIRES - TEMPLATES EMAIL
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { emailTemplates, getTemplate, getAvailableTemplates, templateExists } from '@/services/email-templates.service.js';

describe('EmailTemplates', () => {
  beforeEach(() => {
    // Mock window.location pour les tests
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost:3000'
      },
      writable: true
    });
  });

  describe('getAvailableTemplates', () => {
    it('should return all available template names', () => {
      const templates = getAvailableTemplates();
      
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
      expect(templates).toContain('welcomeNewsletter');
      expect(templates).toContain('weeklyNewsletter');
      expect(templates).toContain('specialOffer');
      expect(templates).toContain('reengagementEmail');
      expect(templates).toContain('maintenanceNotification');
    });

    it('should return expected template count', () => {
      const templates = getAvailableTemplates();
      expect(templates.length).toBe(12); // 12 templates au total
    });
  });

  describe('templateExists', () => {
    it('should return true for existing templates', () => {
      expect(templateExists('welcomeNewsletter')).toBe(true);
      expect(templateExists('weeklyNewsletter')).toBe(true);
      expect(templateExists('specialOffer')).toBe(true);
    });

    it('should return false for non-existing templates', () => {
      expect(templateExists('nonexistentTemplate')).toBe(false);
      expect(templateExists('')).toBe(false);
      expect(templateExists(null)).toBe(false);
    });
  });

  describe('getTemplate', () => {
    it('should return template for valid template name', () => {
      const template = getTemplate('welcomeNewsletter', { email: 'test@example.com', firstName: 'John' });
      
      expect(template).toBeDefined();
      expect(template.subject).toBeDefined();
      expect(template.html).toBeDefined();
      expect(typeof template.subject).toBe('string');
      expect(typeof template.html).toBe('string');
    });

    it('should throw error for invalid template name', () => {
      expect(() => {
        getTemplate('nonexistentTemplate', {});
      }).toThrow('Template \'nonexistentTemplate\' non trouvé');
    });

    it('should handle empty data object', () => {
      const template = getTemplate('welcomeNewsletter', {});
      
      expect(template).toBeDefined();
      expect(template.subject).toBeDefined();
      expect(template.html).toBeDefined();
    });
  });

  describe('welcomeNewsletter template', () => {
    it('should generate welcome newsletter template correctly', () => {
      const data = {
        email: 'test@example.com',
        firstName: 'John'
      };
      
      const template = emailTemplates.welcomeNewsletter(data.email, data.firstName);
      
      expect(template.subject).toContain('Bienvenue');
      expect(template.html).toContain('Bienvenue sur MaxiMarket');
      expect(template.html).toContain('John');
      expect(template.html).toContain('test@example.com');
      expect(template.html).toContain('http://localhost:3000');
    });

    it('should handle missing firstName', () => {
      const template = emailTemplates.welcomeNewsletter('test@example.com');
      
      expect(template.html).toContain('Cher utilisateur');
    });
  });

  describe('reactivationNewsletter template', () => {
    it('should generate reactivation template correctly', () => {
      const template = emailTemplates.reactivationNewsletter('test@example.com');
      
      expect(template.subject).toContain('Bienvenue de retour');
      expect(template.html).toContain('Votre inscription a été réactivée');
      expect(template.html).toContain('test@example.com');
    });
  });

  describe('subscriptionConfirmation template', () => {
    it('should generate subscription confirmation template correctly', () => {
      const template = emailTemplates.subscriptionConfirmation('test@example.com');
      
      expect(template.subject).toContain('Confirmation d\'inscription');
      expect(template.html).toContain('Inscription confirmée');
      expect(template.html).toContain('test@example.com');
    });
  });

  describe('unsubscribeConfirmation template', () => {
    it('should generate unsubscribe confirmation template correctly', () => {
      const template = emailTemplates.unsubscribeConfirmation('test@example.com');
      
      expect(template.subject).toContain('Désinscription confirmée');
      expect(template.html).toContain('Vous avez été désinscrit');
      expect(template.html).toContain('test@example.com');
    });
  });

  describe('weeklyNewsletter template', () => {
    it('should generate weekly newsletter template correctly', () => {
      const data = {
        weekStart: '1er janvier 2024',
        newListings: '150+',
        activeUsers: '2.5k',
        transactions: '89',
        newUsers: '320',
        featuredListings: [
          { id: 1, title: 'Appartement moderne', price: '150,000 €', location: 'Dakar' },
          { id: 2, title: 'Voiture d\'occasion', price: '25,000 €', location: 'Abidjan' }
        ]
      };
      
      const template = emailTemplates.weeklyNewsletter(data);
      
      expect(template.subject).toContain('résumé');
      expect(template.html).toContain('1er janvier 2024');
      expect(template.html).toContain('150+');
      expect(template.html).toContain('2.5k');
      expect(template.html).toContain('Appartement moderne');
      expect(template.html).toContain('Voiture d\'occasion');
    });

    it('should handle missing data gracefully', () => {
      const template = emailTemplates.weeklyNewsletter();
      
      expect(template.subject).toContain('résumé');
      expect(template.html).toContain('cette semaine');
    });
  });

  describe('monthlyNewsletter template', () => {
    it('should generate monthly newsletter template correctly', () => {
      const data = {
        month: 'Janvier 2024',
        totalListings: '1,250',
        totalUsers: '5,200',
        totalTransactions: '450',
        topCategories: {
          immobilier: '35%',
          automobile: '28%',
          services: '22%',
          marketplace: '15%'
        }
      };
      
      const template = emailTemplates.monthlyNewsletter(data);
      
      expect(template.subject).toContain('Rapport mensuel');
      expect(template.html).toContain('Janvier 2024');
      expect(template.html).toContain('1,250');
      expect(template.html).toContain('5,200');
      expect(template.html).toContain('35%');
    });

    it('should handle missing data gracefully', () => {
      const template = emailTemplates.monthlyNewsletter();
      
      expect(template.subject).toContain('Rapport mensuel');
      expect(template.html).toContain('Ce mois');
    });
  });

  describe('specialOffer template', () => {
    it('should generate special offer template correctly', () => {
      const data = {
        offer: 'Réduction exclusive',
        discount: '20%',
        description: 'Sur tous les services premium',
        code: 'NEWSLETTER20',
        expiryDate: '31 décembre 2024'
      };
      
      const template = emailTemplates.specialOffer(data);
      
      expect(template.subject).toContain('Offre spéciale');
      expect(template.html).toContain('20%');
      expect(template.html).toContain('NEWSLETTER20');
      expect(template.html).toContain('Sur tous les services premium');
      expect(template.html).toContain('31 décembre 2024');
    });

    it('should handle missing data gracefully', () => {
      const template = emailTemplates.specialOffer();
      
      expect(template.subject).toContain('Offre spéciale');
      expect(template.html).toContain('Réduction exclusive');
    });
  });

  describe('reengagementEmail template', () => {
    it('should generate reengagement email template correctly', () => {
      const data = {
        firstName: 'John',
        daysInactive: '30 jours',
        newListings: '500'
      };
      
      const template = emailTemplates.reengagementEmail(data);
      
      expect(template.subject).toContain('manqué');
      expect(template.html).toContain('John');
      expect(template.html).toContain('30 jours');
      expect(template.html).toContain('500');
    });

    it('should handle missing data gracefully', () => {
      const template = emailTemplates.reengagementEmail();
      
      expect(template.subject).toContain('manqué');
      expect(template.html).toContain('Cher utilisateur');
    });
  });

  describe('maintenanceNotification template', () => {
    it('should generate maintenance notification template correctly', () => {
      const data = {
        date: '15 janvier 2024',
        duration: '2 heures',
        time: '02:00 - 04:00 UTC'
      };
      
      const template = emailTemplates.maintenanceNotification(data);
      
      expect(template.subject).toContain('Maintenance programmée');
      expect(template.html).toContain('15 janvier 2024');
      expect(template.html).toContain('2 heures');
      expect(template.html).toContain('02:00 - 04:00 UTC');
    });

    it('should handle missing data gracefully', () => {
      const template = emailTemplates.maintenanceNotification();
      
      expect(template.subject).toContain('Maintenance programmée');
      expect(template.html).toContain('Prochainement');
    });
  });

  describe('securityAlert template', () => {
    it('should generate security alert template correctly', () => {
      const data = {
        alertType: 'Connexion suspecte',
        message: 'Une connexion inhabituelle a été détectée',
        date: '2024-01-15 10:30:00',
        location: 'Paris, France',
        device: 'Chrome sur Windows',
        ip: '192.168.1.1'
      };
      
      const template = emailTemplates.securityAlert(data);
      
      expect(template.subject).toContain('Alerte de sécurité');
      expect(template.html).toContain('Connexion suspecte');
      expect(template.html).toContain('Une connexion inhabituelle');
      expect(template.html).toContain('Paris, France');
      expect(template.html).toContain('Chrome sur Windows');
      expect(template.html).toContain('192.168.1.1');
    });

    it('should handle missing data gracefully', () => {
      const template = emailTemplates.securityAlert();
      
      expect(template.subject).toContain('Alerte de sécurité');
      expect(template.html).toContain('Connexion suspecte détectée');
    });
  });

  describe('accountCreated template', () => {
    it('should generate account created template correctly', () => {
      const data = {
        firstName: 'John'
      };
      
      const template = emailTemplates.accountCreated(data);
      
      expect(template.subject).toContain('Compte créé');
      expect(template.html).toContain('John');
      expect(template.html).toContain('Compte créé avec succès');
    });

    it('should handle missing firstName', () => {
      const template = emailTemplates.accountCreated();
      
      expect(template.html).toContain('sur MaxiMarket');
    });
  });

  describe('passwordReset template', () => {
    it('should generate password reset template correctly', () => {
      const data = {
        expiryTime: '1 heure',
        resetLink: 'https://maxiimarket.com/reset-password?token=abc123'
      };
      
      const template = emailTemplates.passwordReset(data);
      
      expect(template.subject).toContain('Réinitialisation');
      expect(template.html).toContain('1 heure');
      expect(template.html).toContain('https://maxiimarket.com/reset-password?token=abc123');
    });

    it('should handle missing data gracefully', () => {
      const template = emailTemplates.passwordReset();
      
      expect(template.subject).toContain('Réinitialisation');
      expect(template.html).toContain('1 heure');
    });
  });

  describe('Template HTML Structure', () => {
    it('should have valid HTML structure for all templates', () => {
      const templates = getAvailableTemplates();
      
      templates.forEach(templateName => {
        const template = getTemplate(templateName, { email: 'test@example.com' });
        
        // Vérifier la structure HTML
        expect(template.html).toContain('<!DOCTYPE html>');
        expect(template.html).toContain('<html>');
        expect(template.html).toContain('<head>');
        expect(template.html).toContain('<body>');
        expect(template.html).toContain('</html>');
        
        // Vérifier les styles CSS
        expect(template.html).toContain('<style>');
        expect(template.html).toContain('font-family');
        expect(template.html).toContain('background');
        
        // Vérifier le contenu principal
        expect(template.html).toContain('<div class="container">');
        expect(template.html).toContain('<div class="header">');
        expect(template.html).toContain('<div class="content">');
        expect(template.html).toContain('<div class="footer">');
      });
    });

    it('should have responsive design elements', () => {
      const template = getTemplate('welcomeNewsletter', { email: 'test@example.com' });
      
      expect(template.html).toContain('@media');
      expect(template.html).toContain('max-width');
      expect(template.html).toContain('viewport');
    });

    it('should include unsubscribe links', () => {
      const templates = ['welcomeNewsletter', 'weeklyNewsletter', 'monthlyNewsletter', 'specialOffer'];
      
      templates.forEach(templateName => {
        const template = getTemplate(templateName, { email: 'test@example.com' });
        expect(template.html).toContain('Se désinscrire');
      });
    });
  });

  describe('Template Content Validation', () => {
    it('should not contain placeholder text', () => {
      const templates = getAvailableTemplates();
      
      templates.forEach(templateName => {
        const template = getTemplate(templateName, { email: 'test@example.com' });
        
        // Vérifier qu'il n'y a pas de placeholders
        expect(template.html).not.toContain('{{');
        expect(template.html).not.toContain('}}');
        expect(template.html).not.toContain('PLACEHOLDER');
        expect(template.html).not.toContain('TODO');
      });
    });

    it('should have proper email subject lines', () => {
      const templates = getAvailableTemplates();
      
      templates.forEach(templateName => {
        const template = getTemplate(templateName, { email: 'test@example.com' });
        
        expect(template.subject).toBeTruthy();
        expect(template.subject.length).toBeGreaterThan(0);
        expect(template.subject.length).toBeLessThan(100); // Limite de longueur
      });
    });
  });
});

// ============================================================================
// TESTS UNITAIRES - SERVICE EMAIL
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { emailService } from '@/services/email.service.js';

// Mock SendGrid
const mockSgMail = {
  setApiKey: vi.fn(),
  send: vi.fn(() => Promise.resolve([{ statusCode: 202 }]))
};

// Mock des modules
vi.mock('@sendgrid/mail', () => ({
  default: mockSgMail
}));

// Mock environment variables
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }
}));

describe('EmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    process.env.VITE_SENDGRID_API_KEY = 'test-api-key';
    process.env.VITE_FROM_EMAIL = 'test@example.com';
    process.env.VITE_FROM_NAME = 'Test Sender';
  });

  describe('checkConfiguration', () => {
    it('should return correct configuration when API key is set', () => {
      process.env.VITE_SENDGRID_API_KEY = 'test-api-key';
      
      const config = emailService.checkConfiguration();
      
      expect(config.sendgridConfigured).toBe(true);
      expect(config.fromEmail).toBe('test@example.com');
      expect(config.fromName).toBe('Test Sender');
    });

    it('should return false when API key is not set', () => {
      delete process.env.VITE_SENDGRID_API_KEY;
      
      const config = emailService.checkConfiguration();
      
      expect(config.sendgridConfigured).toBe(false);
    });
  });

  describe('sendEmail', () => {
    it('should send email successfully with SendGrid', async () => {
      process.env.VITE_SENDGRID_API_KEY = 'test-api-key';
      
      const result = await emailService.sendEmail(
        'test@example.com',
        'Test Subject',
        '<p>Test content</p>',
        true
      );
      
      expect(result.success).toBe(true);
      expect(mockSgMail.setApiKey).toHaveBeenCalledWith('test-api-key');
      expect(mockSgMail.send).toHaveBeenCalledWith({
        to: 'test@example.com',
        from: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>'
      });
    });

    it('should handle SendGrid errors', async () => {
      process.env.VITE_SENDGRID_API_KEY = 'test-api-key';
      mockSgMail.send.mockRejectedValue(new Error('SendGrid error'));
      
      const result = await emailService.sendEmail(
        'test@example.com',
        'Test Subject',
        '<p>Test content</p>',
        true
      );
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('erreur');
    });

    it('should use simulation mode when API key is not set', async () => {
      delete process.env.VITE_SENDGRID_API_KEY;
      
      const result = await emailService.sendEmail(
        'test@example.com',
        'Test Subject',
        '<p>Test content</p>',
        true
      );
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('simulation');
      expect(mockSgMail.send).not.toHaveBeenCalled();
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email successfully', async () => {
      process.env.VITE_SENDGRID_API_KEY = 'test-api-key';
      
      const result = await emailService.sendWelcomeEmail('test@example.com', 'John');
      
      expect(result.success).toBe(true);
      expect(mockSgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Bienvenue')
        })
      );
    });
  });

  describe('sendReactivationEmail', () => {
    it('should send reactivation email successfully', async () => {
      process.env.VITE_SENDGRID_API_KEY = 'test-api-key';
      
      const result = await emailService.sendReactivationEmail('test@example.com');
      
      expect(result.success).toBe(true);
      expect(mockSgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Réactivation')
        })
      );
    });
  });

  describe('sendNewsletter', () => {
    it('should send newsletter to multiple subscribers', async () => {
      process.env.VITE_SENDGRID_API_KEY = 'test-api-key';
      
      const subscribers = [
        { email: 'test1@example.com' },
        { email: 'test2@example.com' }
      ];
      
      const result = await emailService.sendNewsletter(
        subscribers,
        'Newsletter Subject',
        '<p>Newsletter content</p>',
        true
      );
      
      expect(result.success).toBe(true);
      expect(result.sentCount).toBe(2);
      expect(mockSgMail.send).toHaveBeenCalledTimes(2);
    });

    it('should handle empty subscribers list', async () => {
      const result = await emailService.sendNewsletter(
        [],
        'Newsletter Subject',
        '<p>Newsletter content</p>',
        true
      );
      
      expect(result.success).toBe(true);
      expect(result.sentCount).toBe(0);
      expect(result.message).toContain('Aucun destinataire');
    });

    it('should handle batch sending errors', async () => {
      process.env.VITE_SENDGRID_API_KEY = 'test-api-key';
      mockSgMail.send.mockRejectedValue(new Error('SendGrid error'));
      
      const subscribers = [
        { email: 'test1@example.com' },
        { email: 'test2@example.com' }
      ];
      
      const result = await emailService.sendNewsletter(
        subscribers,
        'Newsletter Subject',
        '<p>Newsletter content</p>',
        true
      );
      
      expect(result.success).toBe(false);
      expect(result.sentCount).toBe(0);
      expect(result.errorCount).toBe(2);
    });
  });

  describe('sendTemplateEmail', () => {
    it('should send email with template successfully', async () => {
      process.env.VITE_SENDGRID_API_KEY = 'test-api-key';
      
      const result = await emailService.sendTemplateEmail(
        'test@example.com',
        'welcomeNewsletter',
        { email: 'test@example.com', firstName: 'John' }
      );
      
      expect(result.success).toBe(true);
      expect(mockSgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Bienvenue')
        })
      );
    });

    it('should handle template not found', async () => {
      const result = await emailService.sendTemplateEmail(
        'test@example.com',
        'nonexistentTemplate',
        {}
      );
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Template');
    });
  });

  describe('sendWeeklyNewsletter', () => {
    it('should send weekly newsletter successfully', async () => {
      process.env.VITE_SENDGRID_API_KEY = 'test-api-key';
      
      const subscribers = [
        { email: 'test1@example.com' },
        { email: 'test2@example.com' }
      ];
      
      const result = await emailService.sendWeeklyNewsletter(
        subscribers,
        { weekStart: '1er janvier 2024', newListings: '150+' }
      );
      
      expect(result.success).toBe(true);
      expect(mockSgMail.send).toHaveBeenCalledTimes(2);
    });
  });

  describe('sendMonthlyNewsletter', () => {
    it('should send monthly newsletter successfully', async () => {
      process.env.VITE_SENDGRID_API_KEY = 'test-api-key';
      
      const subscribers = [
        { email: 'test1@example.com' },
        { email: 'test2@example.com' }
      ];
      
      const result = await emailService.sendMonthlyNewsletter(
        subscribers,
        { month: 'Janvier 2024', totalListings: '1,250' }
      );
      
      expect(result.success).toBe(true);
      expect(mockSgMail.send).toHaveBeenCalledTimes(2);
    });
  });

  describe('sendSpecialOffer', () => {
    it('should send special offer successfully', async () => {
      process.env.VITE_SENDGRID_API_KEY = 'test-api-key';
      
      const subscribers = [
        { email: 'test1@example.com' },
        { email: 'test2@example.com' }
      ];
      
      const result = await emailService.sendSpecialOffer(
        subscribers,
        { discount: '20%', code: 'NEWSLETTER20' }
      );
      
      expect(result.success).toBe(true);
      expect(mockSgMail.send).toHaveBeenCalledTimes(2);
    });
  });

  describe('sendReengagementEmail', () => {
    it('should send reengagement email successfully', async () => {
      process.env.VITE_SENDGRID_API_KEY = 'test-api-key';
      
      const result = await emailService.sendReengagementEmail(
        'test@example.com',
        { firstName: 'John', daysInactive: '30 jours' }
      );
      
      expect(result.success).toBe(true);
      expect(mockSgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('manqué')
        })
      );
    });
  });

  describe('sendMaintenanceNotification', () => {
    it('should send maintenance notification successfully', async () => {
      process.env.VITE_SENDGRID_API_KEY = 'test-api-key';
      
      const subscribers = [
        { email: 'test1@example.com' },
        { email: 'test2@example.com' }
      ];
      
      const result = await emailService.sendMaintenanceNotification(
        subscribers,
        { date: '15 janvier 2024', duration: '2 heures' }
      );
      
      expect(result.success).toBe(true);
      expect(mockSgMail.send).toHaveBeenCalledTimes(2);
    });
  });

  describe('sendSecurityAlert', () => {
    it('should send security alert successfully', async () => {
      process.env.VITE_SENDGRID_API_KEY = 'test-api-key';
      
      const result = await emailService.sendSecurityAlert(
        'test@example.com',
        { alertType: 'Connexion suspecte', location: 'Paris' }
      );
      
      expect(result.success).toBe(true);
      expect(mockSgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Alerte de sécurité')
        })
      );
    });
  });

  describe('sendAccountCreatedEmail', () => {
    it('should send account created email successfully', async () => {
      process.env.VITE_SENDGRID_API_KEY = 'test-api-key';
      
      const result = await emailService.sendAccountCreatedEmail(
        'test@example.com',
        { firstName: 'John' }
      );
      
      expect(result.success).toBe(true);
      expect(mockSgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Compte créé')
        })
      );
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      process.env.VITE_SENDGRID_API_KEY = 'test-api-key';
      
      const result = await emailService.sendPasswordResetEmail(
        'test@example.com',
        { resetLink: 'https://example.com/reset', expiryTime: '1 heure' }
      );
      
      expect(result.success).toBe(true);
      expect(mockSgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Réinitialisation')
        })
      );
    });
  });

  describe('sendUnsubscribeConfirmation', () => {
    it('should send unsubscribe confirmation successfully', async () => {
      process.env.VITE_SENDGRID_API_KEY = 'test-api-key';
      
      const result = await emailService.sendUnsubscribeConfirmation('test@example.com');
      
      expect(result.success).toBe(true);
      expect(mockSgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Désinscription')
        })
      );
    });
  });
});

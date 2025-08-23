// ============================================================================
// TESTS UNITAIRES - SERVICE NEWSLETTER
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { newsletterService } from '@/services/newsletter.service.js';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [{ id: 'test-id' }], error: null }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
    }))
  }))
};

// Mock emailService
const mockEmailService = {
  sendWelcomeEmail: vi.fn(() => Promise.resolve({ success: true, message: 'Email envoyé' })),
  sendReactivationEmail: vi.fn(() => Promise.resolve({ success: true, message: 'Email envoyé' })),
  sendWeeklyNewsletter: vi.fn(() => Promise.resolve({ success: true, message: 'Newsletter envoyée' })),
  sendMonthlyNewsletter: vi.fn(() => Promise.resolve({ success: true, message: 'Newsletter envoyée' })),
  sendSpecialOffer: vi.fn(() => Promise.resolve({ success: true, message: 'Offre envoyée' })),
  sendReengagementEmail: vi.fn(() => Promise.resolve({ success: true, message: 'Email envoyé' })),
  sendMaintenanceNotification: vi.fn(() => Promise.resolve({ success: true, message: 'Notification envoyée' }))
};

// Mock des modules
vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}));

vi.mock('@/services/email.service.js', () => ({
  emailService: mockEmailService
}));

describe('NewsletterService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('subscribe', () => {
    it('should subscribe a new user successfully', async () => {
      // Mock data
      const email = 'test@example.com';
      const mockData = { id: 'test-id', email, is_active: true };
      
      // Mock Supabase response
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: null
      });
      
      mockSupabase.from().insert().select.mockResolvedValue({
        data: [mockData],
        error: null
      });

      // Test
      const result = await newsletterService.subscribe(email);

      // Assertions
      expect(result.success).toBe(true);
      expect(result.message).toContain('inscrit');
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(email);
    });

    it('should reactivate an existing inactive user', async () => {
      // Mock data
      const email = 'test@example.com';
      const mockData = { id: 'test-id', email, is_active: false };
      
      // Mock Supabase response
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockData,
        error: null
      });
      
      mockSupabase.from().update().eq.mockResolvedValue({
        data: null,
        error: null
      });

      // Test
      const result = await newsletterService.subscribe(email);

      // Assertions
      expect(result.success).toBe(true);
      expect(result.message).toContain('réactivé');
      expect(mockEmailService.sendReactivationEmail).toHaveBeenCalledWith(email);
    });

    it('should handle already active user', async () => {
      // Mock data
      const email = 'test@example.com';
      const mockData = { id: 'test-id', email, is_active: true };
      
      // Mock Supabase response
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockData,
        error: null
      });

      // Test
      const result = await newsletterService.subscribe(email);

      // Assertions
      expect(result.success).toBe(false);
      expect(result.message).toContain('déjà inscrit');
    });

    it('should handle Supabase errors', async () => {
      // Mock error
      const email = 'test@example.com';
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      // Test
      const result = await newsletterService.subscribe(email);

      // Assertions
      expect(result.success).toBe(false);
      expect(result.message).toContain('erreur');
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe user successfully', async () => {
      // Mock data
      const email = 'test@example.com';
      
      // Mock Supabase response
      mockSupabase.from().update().eq.mockResolvedValue({
        data: null,
        error: null
      });

      // Test
      const result = await newsletterService.unsubscribe(email);

      // Assertions
      expect(result.success).toBe(true);
      expect(result.message).toContain('désinscrit');
    });

    it('should handle unsubscribe errors', async () => {
      // Mock error
      const email = 'test@example.com';
      mockSupabase.from().update().eq.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      // Test
      const result = await newsletterService.unsubscribe(email);

      // Assertions
      expect(result.success).toBe(false);
      expect(result.message).toContain('erreur');
    });
  });

  describe('checkStatus', () => {
    it('should return active status', async () => {
      // Mock data
      const email = 'test@example.com';
      const mockData = { is_active: true };
      
      // Mock Supabase response
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockData,
        error: null
      });

      // Test
      const result = await newsletterService.checkStatus(email);

      // Assertions
      expect(result.isActive).toBe(true);
    });

    it('should return inactive status', async () => {
      // Mock data
      const email = 'test@example.com';
      const mockData = { is_active: false };
      
      // Mock Supabase response
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockData,
        error: null
      });

      // Test
      const result = await newsletterService.checkStatus(email);

      // Assertions
      expect(result.isActive).toBe(false);
    });

    it('should handle user not found', async () => {
      // Mock data
      const email = 'test@example.com';
      
      // Mock Supabase response
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: null
      });

      // Test
      const result = await newsletterService.checkStatus(email);

      // Assertions
      expect(result.isActive).toBe(false);
      expect(result.exists).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return newsletter statistics', async () => {
      // Mock data
      const mockData = [
        { is_active: true },
        { is_active: true },
        { is_active: false },
        { is_active: true }
      ];
      
      // Mock Supabase response
      mockSupabase.from().select.mockResolvedValue({
        data: mockData,
        error: null
      });

      // Test
      const result = await newsletterService.getStats();

      // Assertions
      expect(result.total).toBe(4);
      expect(result.active).toBe(3);
      expect(result.inactive).toBe(1);
    });

    it('should handle empty data', async () => {
      // Mock empty data
      mockSupabase.from().select.mockResolvedValue({
        data: [],
        error: null
      });

      // Test
      const result = await newsletterService.getStats();

      // Assertions
      expect(result.total).toBe(0);
      expect(result.active).toBe(0);
      expect(result.inactive).toBe(0);
    });
  });

  describe('sendWeeklyNewsletter', () => {
    it('should send weekly newsletter successfully', async () => {
      // Mock data
      const mockSubscribers = [
        { email: 'test1@example.com' },
        { email: 'test2@example.com' }
      ];
      
      // Mock Supabase response
      mockSupabase.from().select().eq.mockResolvedValue({
        data: mockSubscribers,
        error: null
      });

      // Test
      const result = await newsletterService.sendWeeklyNewsletter({
        weekStart: '1er janvier 2024',
        newListings: '150+'
      });

      // Assertions
      expect(result.success).toBe(true);
      expect(mockEmailService.sendWeeklyNewsletter).toHaveBeenCalledWith(mockSubscribers, {
        weekStart: '1er janvier 2024',
        newListings: '150+'
      });
    });

    it('should handle no active subscribers', async () => {
      // Mock empty data
      mockSupabase.from().select().eq.mockResolvedValue({
        data: [],
        error: null
      });

      // Test
      const result = await newsletterService.sendWeeklyNewsletter({});

      // Assertions
      expect(result.success).toBe(true);
      expect(result.message).toContain('Aucun abonné');
    });
  });

  describe('sendSpecialOffer', () => {
    it('should send special offer successfully', async () => {
      // Mock data
      const mockSubscribers = [
        { email: 'test1@example.com' },
        { email: 'test2@example.com' }
      ];
      
      // Mock Supabase response
      mockSupabase.from().select().eq.mockResolvedValue({
        data: mockSubscribers,
        error: null
      });

      // Test
      const result = await newsletterService.sendSpecialOffer({
        discount: '20%',
        code: 'NEWSLETTER20'
      });

      // Assertions
      expect(result.success).toBe(true);
      expect(mockEmailService.sendSpecialOffer).toHaveBeenCalledWith(mockSubscribers, {
        discount: '20%',
        code: 'NEWSLETTER20'
      });
    });
  });

  describe('sendReengagementCampaign', () => {
    it('should send reengagement campaign successfully', async () => {
      // Mock data
      const mockSubscribers = [
        { email: 'test1@example.com' },
        { email: 'test2@example.com' }
      ];
      
      // Mock Supabase response
      mockSupabase.from().select().eq().lt.mockResolvedValue({
        data: mockSubscribers,
        error: null
      });

      // Test
      const result = await newsletterService.sendReengagementCampaign({
        firstName: 'John',
        daysInactive: '30 jours'
      });

      // Assertions
      expect(result.success).toBe(true);
      expect(result.stats.successCount).toBe(2);
      expect(result.stats.total).toBe(2);
    });
  });
});
